import { apiFetch } from './client'

// ============ TYPES ============

export interface SupplierProduct {
  id: string
  supplierId: string
  productId: number
  supplierSku?: string
  supplierPrice: number
  isAvailable: boolean
  stockQuantity?: number
  minOrderQty: number
  leadTimeDays?: number
  isPrimarySupplier: boolean
  lastOrderDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  product?: {
    id: number
    name: string
    sku: string
    description?: string
    price: number
    stock: number
    category?: {
      id: number
      name: string
    }
  }
  supplier?: Supplier
}

export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
  taxId?: string
  paymentTerms?: string
  leadTimeDays?: number
  minOrderAmount?: number
  isActive: boolean
  rating?: number
  notes?: string
  createdAt: string
  updatedAt: string
  supplierProducts?: SupplierProduct[]
}

export interface CreateSupplierDto {
  name: string
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
  taxId?: string
  paymentTerms?: string
  leadTimeDays?: number
  minOrderAmount?: number
  isActive?: boolean
  rating?: number
  notes?: string
}

export interface UpdateSupplierDto {
  name?: string
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
  taxId?: string
  paymentTerms?: string
  leadTimeDays?: number
  minOrderAmount?: number
  isActive?: boolean
  rating?: number
  notes?: string
}

export interface CreateSupplierProductDto {
  supplierId: string
  productId: number
  supplierSku?: string
  supplierPrice: number
  isAvailable?: boolean
  stockQuantity?: number
  minOrderQty?: number
  leadTimeDays?: number
  isPrimarySupplier?: boolean
  notes?: string
}

export interface UpdateSupplierProductDto {
  supplierSku?: string
  supplierPrice?: number
  isAvailable?: boolean
  stockQuantity?: number
  minOrderQty?: number
  leadTimeDays?: number
  isPrimarySupplier?: boolean
  notes?: string
}

export interface BulkAddProductsDto {
  supplierId: string
  productIds: number[]
  defaultPrice: number
  minOrderQty?: number
}

export interface LowStockRecommendation {
  product: {
    id: number
    name: string
    sku: string
    currentStock: number
    reorderLevel?: number
    suggestedReorderQty: number
    category: string
  }
  suppliers: {
    id: string
    supplierId: string
    supplierName: string
    supplierPrice: number
    isPrimarySupplier: boolean
    isAvailable: boolean
    minOrderQty: number
    leadTimeDays?: number
    estimatedCost: number
  }[]
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

// ============ SUPPLIER PRODUCT API ============

export async function addProductToSupplier(data: CreateSupplierProductDto) {
  return apiFetch('/suppliers/products', {
    method: 'POST',
    json: data,
  })
}

export async function bulkAddProducts(data: BulkAddProductsDto) {
  return apiFetch('/suppliers/products/bulk', {
    method: 'POST',
    json: data,
  })
}

export async function getSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
  return apiFetch(`/suppliers/${supplierId}/products`)
}

export async function updateSupplierProduct(id: string, data: UpdateSupplierProductDto) {
  return apiFetch(`/suppliers/products/${id}`, {
    method: 'PATCH',
    json: data,
  })
}

export async function removeProductFromSupplier(id: string) {
  return apiFetch(`/suppliers/products/${id}`, {
    method: 'DELETE',
  })
}

export async function getProductSuppliers(productId: number): Promise<SupplierProduct[]> {
  return apiFetch(`/products/${productId}/suppliers`)
}

export async function getLowStockRecommendations(): Promise<LowStockRecommendation[]> {
  return apiFetch('/suppliers/recommendations/low-stock')
}
