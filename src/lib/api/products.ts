import { apiFetch } from '@/lib/api/client'

export type Product = {
  id: number
  name: string
  sku: string
  description?: string
  costPrice: number
  price: number
  stock: number
  categoryId: number
  category: {
    id: number
    name: string
  }
  createdAt: string
  updatedAt: string
}

export type ProductFilters = {
  categoryId?: number
  search?: string
  inStock?: boolean
}

export async function getProducts(limit: number = 1000, offset: number = 0, filters?: ProductFilters) {
  let url = `/products?limit=${limit}&offset=${offset}`
  
  if (filters) {
    if (filters.categoryId) {
      url += `&categoryId=${filters.categoryId}`
    }
    if (filters.search) {
      url += `&search=${encodeURIComponent(filters.search)}`
    }
    if (filters.inStock !== undefined) {
      url += `&inStock=${filters.inStock}`
    }
  }
  
  const data = await apiFetch(url, {
    method: 'GET',
  })
  // Backend returns { items, pagination, filters }
  return data
}

export async function getProductById(id: number) {
  const data = await apiFetch(`/products/${id}`, {
    method: 'GET',
  })
  return data as Product
}

export async function createProduct(payload: {
  name: string
  sku: string
  description?: string
  price: number
  stock?: number
  categoryId: number
}) {
  const data = await apiFetch('/products', {
    method: 'POST',
    json: payload,
  })
  return data as Product
}

export async function updateProduct(id: number, payload: Partial<{
  name: string
  sku: string
  description?: string
  price: number
  stock: number
  categoryId: number
}>) {
  const data = await apiFetch(`/products/${id}`, {
    method: 'PATCH',
    json: payload,
  })
  return data as Product
}

export async function deleteProduct(id: number) {
  const data = await apiFetch(`/products/${id}`, {
    method: 'DELETE',
  })
  return data
}

export async function getProductsByCategory(categoryId: number) {
  const data = await apiFetch(`/products/category/${categoryId}`, {
    method: 'GET',
  })
  return data as Product[]
}

// Get all categories for filtering
export async function getAllProductCategories() {
  const data = await apiFetch('/products/categories/all', {
    method: 'GET',
  })
  return data as Array<{
    id: number
    name: string
    productCount: number
    createdAt: string
    updatedAt: string
  }>
}

// Get category summary with detailed statistics
export async function getCategorySummary(categoryId: number) {
  const data = await apiFetch(`/products/categories/${categoryId}/summary`, {
    method: 'GET',
  })
  return data as {
    category: {
      id: number
      name: string
      createdAt: string
      updatedAt: string
    }
    summary: {
      totalProducts: number
      inStockProducts: number
      lowStockProducts: number
      outOfStockProducts: number
      totalStockValue: number
      averagePrice: number
      productsWithSales: number
      productsWithPurchases: number
    }
    products: Array<{
      id: number
      name: string
      sku: string
      stock: number
      price: number
      costPrice: number
      reorderLevel: number | null
      salesCount: number
      purchaseCount: number
      stockValue: number
      status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'
    }>
  }
}

export type ProductsPage = {
  items: Product[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
    currentPage: number
  }
  filters?: ProductFilters
}

export async function getProductsPage(limit: number = 10, offset: number = 0, filters?: ProductFilters) {
  let url = `/products?limit=${limit}&offset=${offset}`
  
  if (filters) {
    if (filters.categoryId) {
      url += `&categoryId=${filters.categoryId}`
    }
    if (filters.search) {
      url += `&search=${encodeURIComponent(filters.search)}`
    }
    if (filters.inStock !== undefined) {
      url += `&inStock=${filters.inStock}`
    }
  }
  
  const data = await apiFetch(url, {
    method: 'GET',
  })
  // Ensure we always return a structured page
  if (data?.items && data?.pagination) return data as ProductsPage
  return {
    items: (Array.isArray(data) ? data : []) as Product[],
    pagination: {
      total: Array.isArray(data) ? (data as Product[]).length : 0,
      limit,
      offset,
      pages: 1,
      currentPage: 1,
    },
    filters,
  } as ProductsPage
}
