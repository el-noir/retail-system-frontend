import { apiFetch } from './client'

// ============ TYPES ============

export enum PurchaseStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  RECEIVED = 'RECEIVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export interface PurchaseItem {
  id: string
  purchaseOrderId: string
  productId: number
  product: {
    id: number
    name: string
    sku: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQty: number
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  supplier: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  totalAmount: number
  status: PurchaseStatus
  notes?: string
  createdById?: number
  createdBy?: {
    id: number
    name: string
    email: string
  }
  approvedAt?: string
  paidAt?: string
  receivedAt?: string
  items: PurchaseItem[]
  createdAt: string
  updatedAt: string
}

export interface PurchaseItemDto {
  productId: number
  quantity: number
  unitPrice: number
}

export interface CreatePurchaseOrderDto {
  supplierId: string
  items: PurchaseItemDto[]
  notes?: string
}

export interface ReceiveGoodsDto {
  receivedQty: number
}

// ============ API CALLS ============

export async function getPurchaseOrders(
  status?: PurchaseStatus,
  supplierId?: string,
  limit = 50,
  offset = 0,
) {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (supplierId) params.append('supplierId', supplierId)
  params.append('limit', limit.toString())
  params.append('offset', offset.toString())

  return apiFetch(`/purchase-orders?${params.toString()}`)
}

export async function getPurchaseOrder(id: string) {
  return apiFetch(`/purchase-orders/${id}`)
}

export async function createPurchaseOrder(data: CreatePurchaseOrderDto) {
  return apiFetch('/purchase-orders', {
    method: 'POST',
    json: data,
  })
}

export async function approvePurchaseOrder(id: string) {
  return apiFetch(`/purchase-orders/${id}/approve`, {
    method: 'PATCH',
  })
}

export async function markPurchaseOrderAsPaid(id: string) {
  return apiFetch(`/purchase-orders/${id}/mark-paid`, {
    method: 'PATCH',
  })
}

export async function receiveGoods(
  orderId: string,
  itemId: string,
  data: ReceiveGoodsDto,
) {
  return apiFetch(`/purchase-orders/${orderId}/items/${itemId}/receive`, {
    method: 'PATCH',
    json: data,
  })
}

export async function closePurchaseOrder(id: string) {
  return apiFetch(`/purchase-orders/${id}/close`, {
    method: 'PATCH',
  })
}

export async function cancelPurchaseOrder(id: string) {
  return apiFetch(`/purchase-orders/${id}/cancel`, {
    method: 'PATCH',
  })
}

export async function getPurchaseOrderStatistics() {
  return apiFetch('/purchase-orders/statistics')
}
