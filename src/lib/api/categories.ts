import { apiFetch } from '@/lib/api/client'

export type Category = {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export async function getCategories(limit: number = 100, offset: number = 0) {
  const data = await apiFetch(`/categories?limit=${limit}&offset=${offset}`, {
    method: 'GET',
  })
  return data as Category[]
}

export async function getCategoryById(id: number) {
  const data = await apiFetch(`/categories/${id}`, {
    method: 'GET',
  })
  return data as Category
}

export async function createCategory(name: string) {
  const data = await apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
  return data as Category
}

export async function updateCategory(id: number, name: string) {
  const data = await apiFetch(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  return data as Category
}

export async function deleteCategory(id: number) {
  await apiFetch(`/categories/${id}`, {
    method: 'DELETE',
  })
}
