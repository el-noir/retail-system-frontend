import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiFetch } from '@/lib/api/client'

export interface SalesAnalytics {
  totalSales: number
  totalRevenue: number
  averageOrderValue: number
  topProducts: Array<{
    productId: string
    name: string
    quantitySold: number
    revenue: number
  }>
  salesByDate: Array<{
    date: string
    count: number
    revenue: number
  }>
  salesByPaymentMethod: Array<{
    method: string
    count: number
    amount: number
  }>
}

export interface PurchaseAnalytics {
  totalPurchases: number
  totalSpent: number
  topSuppliers: Array<{
    supplierId: string
    name: string
    totalSpent: number
    orderCount: number
  }>
  purchasesByDate: Array<{
    date: string
    count: number
    amount: number
  }>
  purchasesByStatus: Array<{
    status: string
    count: number
    amount: number
  }>
}

export interface InventoryAnalytics {
  totalProducts: number
  totalStockValue: number
  lowStockCount: number
  topSellingProducts: Array<{
    productId: string
    name: string
    quantitySold: number
    currentStock: number
  }>
  productsByCategory: Array<{
    category: string
    count: number
    stockValue: number
  }>
}

export interface ProfitAnalytics {
  totalRevenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number
  profitByProduct: Array<{
    productId: string
    name: string
    revenue: number
    cost: number
    profit: number
    margin: number
  }>
}

interface AnalyticsState {
  salesAnalytics: SalesAnalytics | null
  purchaseAnalytics: PurchaseAnalytics | null
  inventoryAnalytics: InventoryAnalytics | null
  profitAnalytics: ProfitAnalytics | null
  loading: boolean
  error: string | null
  lastFetched: number | null
}

const initialState: AnalyticsState = {
  salesAnalytics: null,
  purchaseAnalytics: null,
  inventoryAnalytics: null,
  profitAnalytics: null,
  loading: false,
  error: null,
  lastFetched: null,
}

export const fetchSalesAnalytics = createAsyncThunk(
  'analytics/fetchSalesAnalytics',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const response = await apiFetch(`/analytics/sales?${params.toString()}`)
    return response
  }
)

export const fetchPurchaseAnalytics = createAsyncThunk(
  'analytics/fetchPurchaseAnalytics',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const response = await apiFetch(`/analytics/purchases?${params.toString()}`)
    return response
  }
)

export const fetchInventoryAnalytics = createAsyncThunk(
  'analytics/fetchInventoryAnalytics',
  async () => {
    const response = await apiFetch('/analytics/inventory')
    return response
  }
)

export const fetchProfitAnalytics = createAsyncThunk(
  'analytics/fetchProfitAnalytics',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const response = await apiFetch(`/analytics/profit?${params.toString()}`)
    return response
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
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
      // Sales Analytics
      .addCase(fetchSalesAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.salesAnalytics = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchSalesAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch sales analytics'
      })
      // Purchase Analytics
      .addCase(fetchPurchaseAnalytics.fulfilled, (state, action) => {
        state.purchaseAnalytics = action.payload
      })
      // Inventory Analytics
      .addCase(fetchInventoryAnalytics.fulfilled, (state, action) => {
        state.inventoryAnalytics = action.payload
      })
      // Profit Analytics
      .addCase(fetchProfitAnalytics.fulfilled, (state, action) => {
        state.profitAnalytics = action.payload
      })
  },
})

export const { clearError, invalidateCache } = analyticsSlice.actions
export default analyticsSlice.reducer
