'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, TrendingUp, TrendingDown, DollarSign, RefreshCw, Calendar } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'
import { toast } from 'sonner'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getProductAnalytics, type ProductAnalytics } from '@/lib/api/analytics'

export default function ProductReportPage() {
  const params = useParams()
  const router = useRouter()
  const productId = parseInt(params.id as string, 10)

  const [data, setData] = React.useState<ProductAnalytics | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [startDate, setStartDate] = React.useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = React.useState(format(new Date(), 'yyyy-MM-dd'))

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Fetching analytics for product:', productId)
      const result = await getProductAnalytics(productId, startDate, endDate)
      console.log('Analytics result:', result)
      setData(result)
    } catch (error: any) {
      console.error('Error fetching product analytics:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load product analytics'
      setError(errorMessage)
      
      if (error.message?.includes('Session expired') || error.message?.includes('Authentication required')) {
        toast.error(error.message)
        setTimeout(() => {
          window.location.href = '/sign-in'
        }, 2000)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [productId, startDate, endDate])

  React.useEffect(() => {
    if (productId && !isNaN(productId)) {
      fetchData()
    } else {
      setError('Invalid product ID')
      setIsLoading(false)
    }
  }, [productId, fetchData])

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="text-slate-400">Loading product analytics...</div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !data) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950">
          <div className="text-red-400">{error || 'Product not found'}</div>
          <Button onClick={() => router.back()} className="bg-slate-700 hover:bg-slate-600">
            Go Back
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">{data.product.name}</h1>
                <p className="text-sm text-slate-400">SKU: {data.product.sku} • {data.product.category}</p>
              </div>
            </div>
            <Button
              onClick={fetchData}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Date Range Filters */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-400">From:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-slate-700 bg-slate-950 text-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-400">To:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-slate-700 bg-slate-950 text-slate-300"
                />
              </div>
              <Button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700">
                Apply
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Current Stock</p>
                  <p className="text-2xl font-bold text-white">{data.product.currentStock}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Reorder at: {data.product.reorderLevel || 'N/A'}
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Selling Price</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(data.product.sellingPrice)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Cost: {formatCurrency(data.product.costPrice)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Units Sold</p>
                  <p className="text-2xl font-bold text-white">{data.salesMetrics.totalUnitsSold}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {data.salesMetrics.salesCount} transactions
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Gross Profit</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(data.salesMetrics.grossProfit)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Margin: {data.salesMetrics.profitMargin.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Sales & Revenue Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Sales Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Revenue:</span>
                  <span className="font-semibold text-white">{formatCurrency(data.salesMetrics.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Cost:</span>
                  <span className="font-semibold text-white">{formatCurrency(data.salesMetrics.totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Average Selling Price:</span>
                  <span className="font-semibold text-white">{formatCurrency(data.salesMetrics.averageSellingPrice)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-3">
                  <span className="text-slate-400">Gross Profit:</span>
                  <span className="font-semibold text-emerald-400">{formatCurrency(data.salesMetrics.grossProfit)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Purchase Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Restocked:</span>
                  <span className="font-semibold text-white">{data.purchaseMetrics.totalUnitsRestocked} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Cost:</span>
                  <span className="font-semibold text-white">{formatCurrency(data.purchaseMetrics.totalRestockCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Average Restock Price:</span>
                  <span className="font-semibold text-white">{formatCurrency(data.purchaseMetrics.averageRestockPrice)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-3">
                  <span className="text-slate-400">Purchase Orders:</span>
                  <span className="font-semibold text-blue-400">{data.purchaseMetrics.purchaseCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales & Restock Trends */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.salesByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="quantity" stroke="#10b981" name="Units Sold" />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Restock Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.restockByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="quantity" fill="#f59e0b" name="Units Restocked" />
                  <Bar dataKey="cost" fill="#ef4444" name="Cost ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Suppliers */}
          {data.suppliers.length > 0 && (
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Suppliers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Supplier</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">SKU</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Price</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-400">Min Order</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-400">Lead Time</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.suppliers.map((supplier) => (
                      <tr key={supplier.supplierId} className="border-b border-slate-800">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white">{supplier.name}</span>
                            {supplier.isPrimary && (
                              <span className="rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-400">
                                Primary
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{supplier.supplierSku || 'N/A'}</td>
                        <td className="px-4 py-3 text-right text-white">{formatCurrency(supplier.price)}</td>
                        <td className="px-4 py-3 text-center text-slate-300">{supplier.minOrderQty}</td>
                        <td className="px-4 py-3 text-center text-slate-300">
                          {supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              supplier.isAvailable
                                ? 'bg-emerald-900/30 text-emerald-400'
                                : 'bg-red-900/30 text-red-400'
                            }`}
                          >
                            {supplier.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stock Movements */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Recent Stock Movements</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Previous</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">New</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">By</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stockMovements.slice(0, 20).map((movement) => (
                    <tr key={movement.id} className="border-b border-slate-800">
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {format(new Date(movement.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            movement.type === 'in'
                              ? 'bg-emerald-900/30 text-emerald-400'
                              : movement.type === 'out'
                              ? 'bg-blue-900/30 text-blue-400'
                              : movement.type === 'damaged'
                              ? 'bg-red-900/30 text-red-400'
                              : 'bg-yellow-900/30 text-yellow-400'
                          }`}
                        >
                          {movement.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-white">{movement.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{movement.previousStock}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{movement.newStock}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{movement.reason || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{movement.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
