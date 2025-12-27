import { apiFetch } from '@/lib/api/client'

export type Product = {
  id: number
  name: string
  sku: string
  description?: string
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

export async function getProducts(limit: number = 1000, offset: number = 0) {
  const data = await apiFetch(`/products?limit=${limit}&offset=${offset}`, {
    method: 'GET',
  })
  // Backend returns { products, pagination }
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

export type ProductsPage = {
  items: Product[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
    currentPage: number
  }
}

export async function getProductsPage(limit: number = 10, offset: number = 0) {
  const data = await apiFetch(`/products?limit=${limit}&offset=${offset}`, {
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
  } as ProductsPage
}
