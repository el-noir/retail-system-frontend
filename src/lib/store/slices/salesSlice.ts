import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiFetch } from '@/lib/api/client'

export interface Sale {
  id: number
  invoiceNumber: string
  customerName?: string
  customerPhone?: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: string
  soldBy?: {
    id: number
    name: string
    email: string
  }
  items: Array<{
    id: number
    productId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    product: {
      id: number
      name: string
      sku: string
    }
  }>
  createdAt: string
}

interface SalesState {
  items: Sale[]
  currentSale: Sale | null
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

const initialState: SalesState = {
  items: [],
  currentSale: null,
  loading: false,
  error: null,
  lastFetched: null,
  pagination: null,
}

export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async ({ limit = 50, offset = 0 }: { limit?: number; offset?: number }) => {
    const response = await apiFetch(`/sales?limit=${limit}&offset=${offset}`)
    return response
  }
)

export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id: number) => {
    const response = await apiFetch(`/sales/${id}`)
    return response
  }
)

const salesSlice = createSlice({
  name: 'sales',
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
      .addCase(fetchSales.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.sales || []
        state.pagination = action.payload.pagination
        state.lastFetched = Date.now()
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch sales'
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.currentSale = action.payload
      })
  },
})

export const { clearError, invalidateCache } = salesSlice.actions
export default salesSlice.reducer
