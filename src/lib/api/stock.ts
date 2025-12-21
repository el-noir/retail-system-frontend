import { apiFetch } from './client';

export interface StockLog {
  id: number;
  productId: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  type: 'in' | 'out' | 'damaged' | 'adjustment';
  quantity: number;
  reason?: string;
  previousStock: number;
  newStock: number;
  createdBy?: number;
  createdByUser?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface StockResponse {
  product: {
    id: number;
    name: string;
    sku: string;
    stock: number;
  };
  log: StockLog;
  message: string;
}

export async function stockIn(productId: number, quantity: number, reason?: string) {
  return apiFetch('/inventory/stock/in', {
    method: 'POST',
    json: { productId, quantity, reason },
  }) as Promise<StockResponse>;
}

export async function stockOut(productId: number, quantity: number, reason?: string) {
  return apiFetch('/inventory/stock/out', {
    method: 'POST',
    json: { productId, quantity, reason },
  }) as Promise<StockResponse>;
}

export interface StockLogsResponse {
  logs: StockLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export async function getStockLogs(productId?: number, limit = 50, offset = 0) {
  const params = new URLSearchParams();
  if (productId) params.append('productId', productId.toString());
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  return apiFetch(`/inventory/logs?${params.toString()}`, {
    method: 'GET',
  }) as Promise<StockLogsResponse>;
}

export interface ProductStockHistoryResponse {
  product: {
    id: number;
    name: string;
    sku: string;
    currentStock: number;
  };
  history: StockLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export async function getProductStockHistory(productId: number, limit = 100, offset = 0) {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  return apiFetch(`/inventory/logs/${productId}?${params.toString()}`, {
    method: 'GET',
  }) as Promise<ProductStockHistoryResponse>;
}
