import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getPurchaseOrders, type PurchaseOrder, PurchaseStatus } from '@/lib/api/purchase-orders'

interface PurchasesState {
  items: PurchaseOrder[]
  currentPurchase: PurchaseOrder | null
  loading: boolean
  error: string | null
  lastFetched: number | null
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  } | null
}

const initialState: PurchasesState = {
  items: [],
  currentPurchase: null,
  loading: false,
  error: null,
  lastFetched: null,
  pagination: null,
}

export const fetchPurchaseOrders = createAsyncThunk(
  'purchases/fetchPurchaseOrders',
  async ({ status, limit = 50, offset = 0 }: { status?: PurchaseStatus; limit?: number; offset?: number }) => {
    const response = await getPurchaseOrders(status, undefined, limit, offset)
    return response
  }
)

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    invalidateCache: (state) => {
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.orders || []
        state.pagination = action.payload.pagination
        state.lastFetched = Date.now()
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch purchase orders'
      })
  },
})

export const { clearError, invalidateCache } = purchasesSlice.actions
export default purchasesSlice.reducer
