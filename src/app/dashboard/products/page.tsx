'use client'

import React from 'react'
import { Eye, Edit2, Trash2, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProductFiltersComponent, type ProductCategory } from '@/components/ProductFilters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getAllProductCategories,
  getProductsPage,
  getCategorySummary,
  type Product,
  type ProductFilters,
} from '@/lib/api/products'
import { useAuth } from '@/lib/auth/auth-context'

export default function ProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = React.useState<Product[]>([])
  const [productCategories, setProductCategories] = React.useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<ProductFilters>({})
  const [pagination, setPagination] = React.useState({
    total: 0,
    limit: 20,
    offset: 0,
    pages: 1,
    currentPage: 1,
  })
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null)

  const userInfo = React.useMemo(() => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''))
      return {
        email: payload?.email as string | undefined,
        role: (payload?.role as string | undefined)?.toUpperCase(),
      }
    } catch (error) {
      console.warn('Failed to parse token payload', error)
      return null
    }
  }, [token])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        const [productsData, categoriesData] = await Promise.all([
          getProductsPage(pagination.limit, pagination.offset, filters),
          getAllProductCategories(),
        ])

        setProducts(productsData.items)
        setPagination(productsData.pagination)
        setProductCategories(categoriesData)
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [pagination.limit, pagination.offset, filters])

  React.useEffect(() => {
    // Fetch category summary when a specific category is selected
    if (filters.categoryId) {
      getCategorySummary(filters.categoryId)
        .then(setSelectedCategory)
        .catch(() => setSelectedCategory(null))
    } else {
      setSelectedCategory(null)
    }
  }, [filters.categoryId])

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, offset: 0, currentPage: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * pagination.limit
    setPagination(prev => ({ ...prev, offset: newOffset, currentPage: newPage }))
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, offset: 0, currentPage: 1 }))
  }

  const formatPrice = (value: unknown) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  const stockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const }
    if (stock <= 10) return { label: 'Low Stock', variant: 'outline' as const }
    return { label: 'In Stock', variant: 'default' as const }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">Products</h1>
              <p className="text-sm text-slate-300">Manage and filter your product inventory</p>
              <p className="text-xs text-slate-400 mt-1">Role: {userInfo?.role}</p>
            </div>
          </header>

          {/* Category Summary Card */}
          {selectedCategory && (
            <Card className="mb-6 bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Category: {selectedCategory.category.name}</span>
                  <Badge variant="secondary">{selectedCategory.summary.totalProducts} products</Badge>
                </CardTitle>
                <CardDescription>Category overview and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-800 rounded">
                    <div className="text-lg font-bold text-green-500">{selectedCategory.summary.inStockProducts}</div>
                    <div className="text-xs text-slate-400">In Stock</div>
                  </div>
                  <div className="text-center p-3 bg-slate-800 rounded">
                    <div className="text-lg font-bold text-yellow-500">{selectedCategory.summary.lowStockProducts}</div>
                    <div className="text-xs text-slate-400">Low Stock</div>
                  </div>
                  <div className="text-center p-3 bg-slate-800 rounded">
                    <div className="text-lg font-bold text-red-500">{selectedCategory.summary.outOfStockProducts}</div>
                    <div className="text-xs text-slate-400">Out of Stock</div>
                  </div>
                  <div className="text-center p-3 bg-slate-800 rounded">
                    <div className="text-lg font-bold text-blue-500">${selectedCategory.summary.totalStockValue.toFixed(2)}</div>
                    <div className="text-xs text-slate-400">Total Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Filters */}
          <div className="mb-6">
            <ProductFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={productCategories}
              isLoading={isLoading}
              totalProducts={pagination.total}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span>Show</span>
              <select
                className="rounded-sm border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
                value={pagination.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
                disabled={isLoading}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>
            
            <div className="text-sm text-slate-400">
              Page {pagination.currentPage} of {pagination.pages} ({pagination.total} total)
            </div>
          </div>

          {/* Products Table */}
          {isLoading ? (
            <div className="rounded-md border border-slate-800 bg-slate-900 p-6 text-slate-300">Loading products...</div>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-800 bg-slate-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3 text-left">Product Name</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => {
                    const status = stockStatus(product.stock)
                    return (
                      <tr key={product.id} className={idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-950'}>
                        <td className="px-4 py-3 align-middle">
                          <div className="space-y-1">
                            <p className="font-semibold text-white">{product.name}</p>
                            <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle text-slate-300">
                          {product.category?.name ?? 'Uncategorized'}
                        </td>
                        <td className="px-4 py-3 align-middle text-right">
                          <span className="rounded-sm bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-100">
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-4 py-3 align-middle text-right font-mono text-emerald-300">
                          ${formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3 align-middle text-right">
                          <div className="inline-flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(userInfo?.role === 'ADMIN' || userInfo?.role === 'MANAGER') && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Edit Product"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="View Analytics"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  {Object.keys(filters).length > 0 ? 'No products match your filters' : 'No products found'}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} products
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1 || isLoading}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const page = i + 1
                    const isActive = page === pagination.currentPage
                    return (
                      <Button
                        key={page}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={isLoading}
                        className={isActive 
                          ? "bg-emerald-600 hover:bg-emerald-700" 
                          : "border-slate-700 text-slate-300 hover:bg-slate-800"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.pages || isLoading}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}