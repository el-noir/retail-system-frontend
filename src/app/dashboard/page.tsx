'use client'

import React from 'react'
import { toast } from 'sonner'
import { Trash2, Edit2 } from 'lucide-react'

import Sidebar from '@/components/Sidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProductModal } from '@/components/ProductModal'
import { Button } from '@/components/ui/button'
import { getProducts, deleteProduct, type Product } from '@/lib/api/products'
import { getCategories, type Category } from '@/lib/api/categories'

export default function DashboardPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<Category[]>([
    { id: 1, name: 'Electronics', createdAt: '', updatedAt: '' },
    { id: 2, name: 'Clothing', createdAt: '', updatedAt: '' },
    { id: 3, name: 'Food & Beverages', createdAt: '', updatedAt: '' },
    { id: 4, name: 'Books', createdAt: '', updatedAt: '' },
    { id: 5, name: 'Home & Garden', createdAt: '', updatedAt: '' },
    { id: 6, name: 'Sports & Outdoors', createdAt: '', updatedAt: '' },
  ])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>()
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const productsData = await getProducts(100, 0)
        setProducts(productsData)
        
        // Try to fetch categories from API, but use fallback if it fails
        try {
          const categoriesData = await getCategories(100, 0)
          setCategories(categoriesData)
        } catch (error) {
          console.warn('Failed to fetch categories from API, using defaults:', error)
          // Categories already set to defaults above
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddClick = () => {
    setSelectedProduct(undefined)
    setIsModalOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (id: number) => {
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

  const handleProductSuccess = (product: Product) => {
    if (selectedProduct) {
      setProducts(products.map((p) => (p.id === product.id ? product : p)))
    } else {
      setProducts([product, ...products])
    }
  }

  const formatPrice = (value: unknown) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

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
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(200px,15%),1fr] lg:items-start">
          {/* <Sidebar /> */}

          <div className="space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Inventory</p>
                <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">Products</h1>
                <p className="text-sm text-slate-300">Manage and track your product inventory.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900 px-4 py-3">
                  <div className="h-10 w-10 bg-emerald-600 text-slate-950 flex items-center justify-center text-sm font-semibold">{products.length}</div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Total products</p>
                    <p className="text-sm font-medium text-white">Updated live</p>
                  </div>
                </div>
                <Button
                  onClick={handleAddClick}
                  className="border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white rounded-sm hover:bg-emerald-700"
                >
                  Add product
                </Button>
              </div>
            </header>

            {isLoading ? (
              <div className="flex min-h-80 items-center justify-center rounded-md border border-slate-800 bg-slate-900 p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-md border border-slate-800 bg-slate-900 p-6 text-left">
                <p className="text-slate-300">No products found. Click "Add product" to create one.</p>
              </div>
            ) : (
              <section className="rounded-md border border-slate-800 bg-slate-900 p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-white">All Products</h2>
                </div>
                <div className="overflow-hidden rounded-sm border border-slate-800">
                  <div className="grid grid-cols-6 gap-4 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-400 uppercase">
                    <span>Name</span>
                    <span>SKU</span>
                    <span>Category</span>
                    <span>Price</span>
                    <span>Stock</span>
                    <span>Actions</span>
                  </div>
                  <div className="divide-y divide-slate-800 bg-slate-950/40">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="grid grid-cols-6 gap-4 items-center px-4 py-3 text-sm text-slate-100 hover:bg-slate-900"
                      >
                        <span className="font-medium text-white truncate">{product.name}</span>
                        <span className="text-slate-300">{product.sku}</span>
                        <span className="text-slate-300">{product.category.name}</span>
                        <span className="font-semibold text-white">${formatPrice(product.price)}</span>
                        <span
                          className={`rounded-sm px-2 py-1 text-center text-xs font-semibold ${
                            product.stock > 0
                              ? 'bg-emerald-800/30 text-emerald-200 border border-emerald-700'
                              : 'bg-red-800/30 text-red-200 border border-red-700'
                          }`}
                        >
                          {product.stock}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(product)}
                            className="h-8 w-8 p-0 rounded-sm border border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-400"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product.id)}
                            disabled={isDeleting === product.id}
                            className="h-8 w-8 p-0 rounded-sm border border-slate-700 bg-slate-900 text-red-200 hover:border-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
