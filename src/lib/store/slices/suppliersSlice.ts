import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getSuppliers, type Supplier } from '@/lib/api/suppliers'

interface SuppliersState {
  items: Supplier[]
  currentSupplier: Supplier | null
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

const initialState: SuppliersState = {
  items: [],
  currentSupplier: null,
  loading: false,
  error: null,
  lastFetched: null,
  pagination: null,
}

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async ({ limit = 100, offset = 0 }: { limit?: number; offset?: number }) => {
    const response = await getSuppliers(limit, offset)
    return response
  }
)

const suppliersSlice = createSlice({
  name: 'suppliers',
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
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.suppliers || []
        state.pagination = action.payload.pagination
        state.lastFetched = Date.now()
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch suppliers'
      })
  },
})

export const { clearError, invalidateCache } = suppliersSlice.actions
export default suppliersSlice.reducer
