'use client'

import React from 'react'
import { Eye, Edit2, Trash2, BarChart3, Package } from 'lucide-react'

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
import { DataTable, type Column, type BulkAction } from '@/components/DataTable'
import { SearchAndFilter, type FilterOption, type SortOption } from '@/components/SearchAndFilter'
import { useToast } from '@/components/Toast'
import {
  getAllProductCategories,
  getProductsPage,
  getCategorySummary,
  deleteProduct,
  type Product,
  type ProductFilters,
} from '@/lib/api/products'
import { useAuth } from '@/lib/auth/auth-context'

export default function ProductsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  
  const [products, setProducts] = React.useState<Product[]>([])
  const [productCategories, setProductCategories] = React.useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<ProductFilters>({})
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortBy, setSortBy] = React.useState<string>('')
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  
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

  const canEdit = userInfo?.role === 'ADMIN' || userInfo?.role === 'MANAGER'

  // Data fetching
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Combine search and filters
        const searchFilters = {
          ...filters,
          ...(searchQuery && { name: searchQuery }),
        }
        
        const [productsData, categoriesData] = await Promise.all([
          getProductsPage(pagination.limit, pagination.offset, searchFilters),
          getAllProductCategories(),
        ])

        setProducts(productsData.items)
        setPagination(productsData.pagination)
        setProductCategories(categoriesData)
      } catch (error: any) {
        toast.error('Failed to load products', error?.message || 'Unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [pagination.limit, pagination.offset, filters, searchQuery, sortBy, sortDirection])

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

  // Handlers
  const handleSearch = React.useCallback((query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, currentPage: 1, offset: 0 }))
  }, [])

  const handleFilter = React.useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters as ProductFilters)
    setPagination(prev => ({ ...prev, currentPage: 1, offset: 0 }))
  }, [])

  const handleSort = React.useCallback((column: string, direction: 'asc' | 'desc') => {
    setSortBy(column)
    setSortDirection(direction)
  }, [])

  const handlePageChange = React.useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      offset: (page - 1) * prev.limit,
    }))
  }, [])
  // Bulk actions
  const handleBulkDelete = React.useCallback(async (selectedProducts: Product[]) => {
    try {
      await Promise.all(selectedProducts.map(product => deleteProduct(product.id)))
      
      // Refresh data
      const searchFilters = {
        ...filters,
        ...(searchQuery && { name: searchQuery }),
      }
      
      const productsData = await getProductsPage(
        pagination.limit, 
        pagination.offset, 
        searchFilters
      )
      
      setProducts(productsData.items)
      setPagination(productsData.pagination)
      
      toast.success('Products deleted successfully', `Deleted ${selectedProducts.length} products`)
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to delete products')
    }
  }, [filters, searchQuery, pagination.limit, pagination.offset])

  // Table configuration
  const columns: Column<Product>[] = [
    {
      key: 'name',
      title: 'Product',
      sortable: true,
      render: (_, product) => (
        <div className="space-y-1">
          <p className="font-semibold text-white">{product.name}</p>
          <p className="text-xs text-slate-400">SKU: {product.sku}</p>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (_, product) => product.category?.name ?? 'Uncategorized',
    },
    {
      key: 'stock',
      title: 'Stock',
      sortable: true,
      align: 'right',
      render: (stock) => (
        <span className="rounded-sm bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-100">
          {stock}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, product) => {
        const stock = product.stock
        const status = stock === 0 
          ? { label: 'Out of Stock', variant: 'destructive' as const }
          : stock <= 10 
          ? { label: 'Low Stock', variant: 'outline' as const }
          : { label: 'In Stock', variant: 'default' as const }
        
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      align: 'right',
      render: (price) => (
        <span className="font-mono text-emerald-300">
          ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
        </span>
      ),
    },
  ]

  const bulkActions: BulkAction<Product>[] = canEdit ? [
    {
      key: 'delete',
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      action: handleBulkDelete,
      confirmMessage: 'Are you sure you want to delete the selected products? This action cannot be undone.',
    },
  ] : []

  const filterOptions: FilterOption[] = [
    {
      key: 'categoryId',
      label: 'Category',
      type: 'select',
      options: productCategories.map(cat => ({
        value: cat.id.toString(),
        label: cat.name,
      })),
      placeholder: 'Select category',
    },
    {
      key: 'minStock',
      label: 'Minimum Stock',
      type: 'number',
      placeholder: '0',
    },
    {
      key: 'maxStock',
      label: 'Maximum Stock',
      type: 'number',
      placeholder: '1000',
    },
    {
      key: 'minPrice',
      label: 'Minimum Price',
      type: 'number',
      placeholder: '0.00',
    },
    {
      key: 'maxPrice',
      label: 'Maximum Price',
      type: 'number',
      placeholder: '999.99',
    },
  ]

  const sortOptions: SortOption[] = [
    { key: 'name', label: 'Name' },
    { key: 'stock', label: 'Stock' },
    { key: 'price', label: 'Price' },
    { key: 'createdAt', label: 'Date Added' },
  ]

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

          {/* Search and Filter */}
          <SearchAndFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            placeholder="Search products by name..."
            className="mb-6"
          />

          {/* Enhanced Data Table */}
          <DataTable
            data={products}
            columns={columns}
            keyField="id"
            loading={isLoading}
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: pagination.pages,
              onPageChange: handlePageChange,
              pageSize: pagination.limit,
              totalItems: pagination.total,
            }}
            bulkActions={bulkActions}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            emptyState={
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No products found</h3>
                <p className="text-sm text-slate-400">
                  {Object.keys(filters).length > 0 || searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first product'
                  }
                </p>
                {canEdit && (
                  <Button className="mt-4" onClick={() => console.log('Add product')}>
                    Add Product
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}