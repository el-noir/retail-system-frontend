'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Package, TrendingDown, DollarSign, Clock, Star, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getLowStockRecommendations, type LowStockRecommendation } from '@/lib/api/suppliers'

export default function LowStockRecommendationsPage() {
  const router = useRouter()
  const [recommendations, setRecommendations] = React.useState<LowStockRecommendation[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true)
      const data = await getLowStockRecommendations()
      setRecommendations(data)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePurchaseOrder = (supplierId: string, productId: number, qty: number) => {
    // Navigate to create PO page with pre-filled data
    router.push(`/dashboard/purchase-orders/create?supplierId=${supplierId}&productId=${productId}&qty=${qty}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Low Stock Recommendations</h1>
          <p className="text-slate-400 mt-2">
            Products below reorder level with suggested suppliers and quantities
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-red-950 to-slate-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-red-400">Products Low Stock</p>
                <p className="text-3xl font-bold text-white mt-1">{recommendations.length}</p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Units Needed</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {recommendations.reduce((sum, r) => sum + r.product.suggestedReorderQty, 0)}
                </p>
              </div>
              <Package className="h-6 w-6 text-slate-400" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-emerald-950 to-slate-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-emerald-400">Estimated Cost</p>
                <p className="text-3xl font-bold text-white mt-1">
                  $
                  {recommendations
                    .reduce((sum, r) => {
                      const primarySupplier = r.suppliers.find(s => s.isPrimarySupplier) || r.suppliers[0]
                      return sum + (primarySupplier?.estimatedCost || 0)
                    }, 0)
                    .toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        {recommendations.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-emerald-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All Stock Levels Healthy!</h3>
            <p className="text-slate-400">No products are currently below their reorder levels.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.product.id}
                className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden"
              >
                {/* Product Header */}
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{rec.product.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        SKU: {rec.product.sku} • Category: {rec.product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-slate-400">Current Stock:</span>
                        <span className="px-3 py-1 rounded-full bg-red-900/40 text-red-200 border border-red-700 text-sm font-semibold">
                          {rec.product.currentStock} units
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Reorder Level: {rec.product.reorderLevel} • Suggested: {rec.product.suggestedReorderQty}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Supplier Options */}
                {rec.suppliers.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-slate-400 mb-4">No suppliers configured for this product</p>
                    <Button
                      onClick={() => router.push('/dashboard/suppliers')}
                      variant="outline"
                      className="border-slate-700 text-slate-300"
                    >
                      Add Suppliers
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {rec.suppliers.map((supplier, idx) => (
                      <div
                        key={supplier.id}
                        className={`px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors ${
                          supplier.isPrimarySupplier ? 'bg-purple-900/10' : ''
                        }`}
                      >
                        <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                          {/* Supplier Name */}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{supplier.supplierName}</p>
                              {supplier.isPrimarySupplier && (
                                <Star className="h-4 w-4 text-purple-400 fill-purple-400" />
                              )}
                            </div>
                            {idx === 0 && (
                              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-700">
                                Best Price
                              </span>
                            )}
                          </div>

                          {/* Unit Price */}
                          <div className="text-center">
                            <p className="text-xs text-slate-400 mb-1">Unit Price</p>
                            <p className="font-mono text-emerald-400 font-semibold">
                              ${Number(supplier.supplierPrice).toFixed(2)}
                            </p>
                          </div>

                          {/* Min Order Qty */}
                          <div className="text-center">
                            <p className="text-xs text-slate-400 mb-1">Min Order</p>
                            <p className="text-slate-200">{supplier.minOrderQty} units</p>
                          </div>

                          {/* Lead Time */}
                          <div className="text-center">
                            <p className="text-xs text-slate-400 mb-1">Lead Time</p>
                            <div className="flex items-center justify-center gap-1 text-slate-200">
                              <Clock className="h-3 w-3" />
                              <span>{supplier.leadTimeDays || '-'} days</span>
                            </div>
                          </div>

                          {/* Total Cost */}
                          <div className="text-center">
                            <p className="text-xs text-slate-400 mb-1">Total Cost</p>
                            <p className="text-lg font-bold text-white">
                              ${supplier.estimatedCost.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="ml-6 flex gap-2">
                          <Button
                            onClick={() =>
                              router.push(`/dashboard/suppliers/${supplier.supplierId}`)
                            }
                            variant="outline"
                            size="sm"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            View Supplier
                          </Button>
                          <Button
                            onClick={() =>
                              handleCreatePurchaseOrder(
                                supplier.supplierId,
                                rec.product.id,
                                rec.product.suggestedReorderQty
                              )
                            }
                            size="sm"
                            className={
                              supplier.isPrimarySupplier || idx === 0
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Create PO
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
