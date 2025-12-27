import { apiFetch } from './client'

// ============ TYPES ============

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string
  purchaseOrderId: string
  amount: number
  status: PaymentStatus
  stripePaymentId?: string
  stripeClientSecret?: string
  paymentMethod?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentDto {
  purchaseOrderId: string
}

export interface PaymentIntentResponse {
  payment: Payment
  clientSecret: string
  paymentIntentId: string
}

// ============ API CALLS ============

export async function createPaymentIntent(
  purchaseOrderId: string,
): Promise<PaymentIntentResponse> {
  return apiFetch('/payments/create-intent', {
    method: 'POST',
    json: { purchaseOrderId },
  })
}

export async function getPaymentsByPurchaseOrder(purchaseOrderId: string) {
  return apiFetch(`/payments/purchase-order/${purchaseOrderId}`)
}

export async function getPayment(id: string) {
  return apiFetch(`/payments/${id}`)
}
