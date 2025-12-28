import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './slices/productsSlice'
import salesReducer from './slices/salesSlice'
import purchasesReducer from './slices/purchasesSlice'
import suppliersReducer from './slices/suppliersSlice'
import analyticsReducer from './slices/analyticsSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    sales: salesReducer,
    purchases: purchasesReducer,
    suppliers: suppliersReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['analytics/fetchSalesReport/fulfilled'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
