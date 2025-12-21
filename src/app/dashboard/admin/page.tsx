'use client'

import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import AdminSidebar from '@/components/AdminSidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProductModal } from '@/components/ProductModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCategories, type Category } from '@/lib/api/categories'
import { getLowStockProducts, type LowStockProduct } from '@/lib/api/inventory'
import { deleteProduct, getProductsPage, type Product } from '@/lib/api/products'
import { stockIn, stockOut } from '@/lib/api/stock'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { token, clearToken } = useAuth()

  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<Category[]>([
    { id: 1, name: 'Electronics', createdAt: '', updatedAt: '' },
    { id: 2, name: 'Clothing', createdAt: '', updatedAt: '' },
    { id: 3, name: 'Food & Beverages', createdAt: '', updatedAt: '' },
    { id: 4, name: 'Books', createdAt: '', updatedAt: '' },
    { id: 5, name: 'Home & Garden', createdAt: '', updatedAt: '' },
    { id: 6, name: 'Sports & Outdoors', createdAt: '', updatedAt: '' },
  ])
  const [lowStock, setLowStock] = React.useState<LowStockProduct[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [limit, setLimit] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [pages, setPages] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>()
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null)

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

  const isAdminOrManager = userInfo?.role === 'ADMIN' || userInfo?.role === 'MANAGER'

  React.useEffect(() => {
    if (!token) return
    if (!isAdminOrManager) {
      router.replace('/dashboard/cashier')
    }
  }, [isAdminOrManager, router, token])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const offset = (page - 1) * limit
        const pageData = await getProductsPage(limit, offset)
        setProducts(pageData.items)
        setTotal(pageData.pagination.total)
        setPages(pageData.pagination.pages)

        try {
          const low = await getLowStockProducts(10, 10, 0)
          setLowStock(low.products)
        } catch (error) {
          console.warn('Failed to fetch low stock list', error)
        }

        try {
          const categoriesData = await getCategories(100, 0)
          setCategories(categoriesData)
        } catch (error) {
          console.warn('Failed to fetch categories from API, using defaults:', error)
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [limit, page])

  const handleAddClick = () => {
    setSelectedProduct(undefined)
    setIsModalOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (id: number) => {
    if (!isAdminOrManager) return
    if (!confirm('Are you sure you want to delete this product?')) return

    setIsDeleting(id)
    try {
      await deleteProduct(id)
      setProducts(products.filter((p) => p.id !== id))
      toast.success('Product deleted successfully')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete product')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleStockAdjust = async (product: Product, direction: 'in' | 'out') => {
    if (!isAdminOrManager) return

    const qtyInput = prompt(`Enter quantity to stock ${direction === 'in' ? 'IN' : 'OUT'} for ${product.name}`)
    if (!qtyInput) return
    const qty = parseInt(qtyInput, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid positive number')
      return
    }

    const reasonDefault = direction === 'in' ? 'Restock' : 'Adjustment'
    const reasonInput = prompt(`Enter reason for stock ${direction === 'in' ? 'IN' : 'OUT'}`, reasonDefault)
    const reason = reasonInput && reasonInput.trim().length > 0 ? reasonInput.trim() : reasonDefault

    try {
      if (direction === 'in') {
        await stockIn(product.id, qty, reason)
        toast.success(`Added ${qty} units to ${product.name}`)
      } else {
        await stockOut(product.id, qty, reason)
        toast.success(`Removed ${qty} units from ${product.name}`)
      }

      const refreshed = await getProductsPage(limit, (page - 1) * limit)
      setProducts(refreshed.items)
    } catch (error: any) {
      toast.error(error?.message || 'Stock update failed')
    }
  }

  const handleProductSuccess = (product: Product) => {
    if (selectedProduct) {
      setProducts(products.map((p) => (p.id === product.id ? product : p)))
    } else {
      setProducts([product, ...products])
    }
  }

  const handleSignOut = React.useCallback(() => {
    clearToken()
    router.push('/sign-in')
  }, [clearToken, router])

  const formatPrice = (value: unknown) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  const stockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', className: 'bg-red-900/40 text-red-200 border-red-700' }
    if (stock <= 10) return { label: 'Low Stock', className: 'bg-amber-900/30 text-amber-100 border-amber-700' }
    return { label: 'In Stock', className: 'bg-emerald-900/30 text-emerald-100 border-emerald-700' }
  }

  const filteredProducts = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.sku?.toLowerCase().includes(q)) ||
      (p.category?.name?.toLowerCase().includes(q))
    )
  }, [products, search])

  return (
    <ProtectedRoute>
      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        categories={categories}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(undefined)
        }}
        onSuccess={handleProductSuccess}
      />
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="grid grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8 lg:gap-8">
          <AdminSidebar
            userEmail={userInfo?.email}
            userRole={userInfo?.role}
            onSignOut={handleSignOut}
          />

          <div className="space-y-8 lg:col-span-9 col-span-1 md:col-span-2">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Inventory</p>
                <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">Admin dashboard</h1>
                <p className="text-sm text-slate-300">Manage and track your product inventory.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-emerald-600 text-sm font-semibold text-slate-950">{products.length}</div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Total products</p>
                    <p className="text-sm font-medium text-white">Updated live</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-amber-600/50 bg-amber-900/30 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-amber-500 text-sm font-semibold text-slate-950">{lowStock.length}</div>
                  <div>
                    <p className="text-xs font-medium text-amber-200/80">Low stock</p>
                    <p className="text-sm font-medium text-amber-50">Threshold &lt;= 10</p>
                  </div>
                </div>
                {isAdminOrManager && (
                  <Button
                    onClick={handleAddClick}
                    className="rounded-sm border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Add product
                  </Button>
                )}
              </div>
            </header>

            {isLoading ? (
              <div className="rounded-md border border-slate-800 bg-slate-900 p-6 text-slate-300">Loading dashboard...</div>
            ) : (
              <section id="products-section" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Products</h2>
                  {!isAdminOrManager && <p className="text-sm text-slate-400">View only — admin access required to edit</p>}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search products, SKU or category"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-80 rounded-sm border-slate-700 bg-slate-900 text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span>Show</span>
                    <select
                      className="rounded-sm border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
                      value={limit}
                      onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value, 10)) }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>per page</span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-slate-800 bg-slate-900">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3 text-left">Product Name</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, idx) => {
                        const status = stockStatus(product.stock)
                        return (
                          <tr key={product.id} className={idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-950'}>
                            <td className="px-4 py-3 align-middle">
                              <div className="space-y-1">
                                <p className="font-semibold text-white">{product.name}</p>
                                <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-middle text-slate-300">{product.category?.name ?? 'Uncategorized'}</td>
                            <td className="px-4 py-3 align-middle text-right">
                              <span className="rounded-sm bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-100">{product.stock}</span>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <span className={`inline-flex rounded-sm border px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                            </td>
                            <td className="px-4 py-3 align-middle text-right font-mono text-emerald-300">${formatPrice(product.price)}</td>
                            <td className="px-4 py-3 align-middle text-right">
                              <div className="inline-flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(product)}
                                  disabled={!isAdminOrManager}
                                  className="h-8 w-8 rounded-sm border border-slate-700 bg-slate-900 p-0 text-slate-200 hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(product.id)}
                                  disabled={!isAdminOrManager || isDeleting === product.id}
                                  className="h-8 w-8 rounded-sm border border-slate-700 bg-slate-900 p-0 text-red-200 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-slate-300">
                    Result {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="rounded-sm border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 disabled:opacity-50"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-300">Page {page} / {pages}</span>
                    <Button
                      variant="outline"
                      className="rounded-sm border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 disabled:opacity-50"
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page >= pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {lowStock.length > 0 && (
              <section className="rounded-md border border-amber-700/40 bg-amber-950/40 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-amber-50">Low stock alerts</h2>
                    <p className="text-sm text-amber-200/80">Threshold ≤ 10 units</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lowStock.map((item) => (
                    <div key={item.id} className="rounded-sm border border-amber-700/50 bg-amber-900/30 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-amber-50">{item.name}</p>
                          <p className="text-xs text-amber-200/80">SKU: {item.sku}</p>
                        </div>
                        <span className="rounded-sm bg-amber-700 px-2 py-1 text-xs font-semibold text-amber-50">{item.stock} left</span>
                      </div>
                      <p className="mt-2 text-xs text-amber-100/80">Category: {item.category?.name}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
