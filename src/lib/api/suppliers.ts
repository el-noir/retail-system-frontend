import { apiFetch } from './client'

// ============ TYPES ============

export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierDto {
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface UpdateSupplierDto {
  name?: string
  email?: string
  phone?: string
  address?: string
}

// ============ API CALLS ============

export async function getSuppliers(limit = 100, offset = 0) {
  return apiFetch(`/suppliers?limit=${limit}&offset=${offset}`)
}

export async function getSupplier(id: string) {
  return apiFetch(`/suppliers/${id}`)
}

export async function createSupplier(data: CreateSupplierDto) {
  return apiFetch('/suppliers', {
    method: 'POST',
    json: data,
  })
}

export async function updateSupplier(id: string, data: UpdateSupplierDto) {
  return apiFetch(`/suppliers/${id}`, {
    method: 'PATCH',
    json: data,
  })
}

export async function deleteSupplier(id: string) {
  return apiFetch(`/suppliers/${id}`, {
    method: 'DELETE',
  })
}
