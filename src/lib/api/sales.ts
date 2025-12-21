import { apiFetch } from './client'

export type CreateSaleItem = {
  productId: number
  quantity: number
}

export type CreateSalePayload = {
  items: CreateSaleItem[]
  customerName?: string
  customerPhone?: string
  taxAmount?: number
  discountAmount?: number
  paymentMethod: 'cash' | 'card'
}

export type SaleItem = {
  id: number
  productId: number
  quantity: number
  unitPrice: string
  totalPrice: string
  product?: {
    id: number
    name: string
    sku: string
    price: string
  }
}

export type Sale = {
  id: number
  invoiceNumber: string
  customerName?: string
  customerPhone?: string
  subtotal: string
  taxAmount: string
  discountAmount: string
  totalAmount: string
  paymentMethod: 'cash' | 'card'
  createdAt: string
  items: SaleItem[]
}

export async function createSale(payload: CreateSalePayload): Promise<Sale> {
  return apiFetch('/sales', {
    method: 'POST',
    json: payload,
  })
}

export async function getSales(limit = 10, offset = 0): Promise<Sale[]> {
  return apiFetch(`/sales?limit=${limit}&offset=${offset}`, {
    method: 'GET',
  })
}

export async function getSaleByInvoice(invoiceNumber: string): Promise<Sale> {
  return apiFetch(`/sales/invoice/${encodeURIComponent(invoiceNumber)}`, {
    method: 'GET',
  })
}
