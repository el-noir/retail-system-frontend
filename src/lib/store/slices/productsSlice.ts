import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getProducts, getProductById, type Product } from '@/lib/api/products'

interface ProductsState {
  items: Product[]
  currentProduct: Product | null
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

const initialState: ProductsState = {
  items: [],
  currentProduct: null,
  loading: false,
  error: null,
  lastFetched: null,
  pagination: null,
}

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ limit = 1000, offset = 0, forceRefresh = false }: { limit?: number; offset?: number; forceRefresh?: boolean }) => {
    const response = await getProducts(limit, offset)
    return response
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number) => {
    const response = await getProductById(id)
    return response
  }
)

const productsSlice = createSlice({
  name: 'products',
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
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || action.payload.products || []
        state.pagination = action.payload.pagination
        state.lastFetched = Date.now()
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch products'
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch product'
      })
  },
})

export const { clearError, invalidateCache } = productsSlice.actions
export default productsSlice.reducer
