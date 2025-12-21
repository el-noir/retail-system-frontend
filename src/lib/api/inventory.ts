import { apiFetch } from './client';

export interface AlertLevel {
  alertLevel: 'critical' | 'high' | 'medium';
  stockPercentage: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: string | number;
  category: {
    id: number;
    name: string;
  };
  alertLevel: 'critical' | 'high' | 'medium';
  stockPercentage: number;
}

export interface LowStockResponse {
  products: LowStockProduct[];
  summary: {
    total: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    threshold: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export async function getLowStockProducts(threshold = 10, limit = 100, offset = 0) {
  const params = new URLSearchParams();
  params.append('threshold', threshold.toString());
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  return apiFetch(`/inventory/low-stock?${params.toString()}`, {
    method: 'GET',
  }) as Promise<LowStockResponse>;
}

export interface InventorySummary {
  summary: {
    totalProducts: number;
    totalStock: number;
    outOfStock: number;
    lowStock: number;
    normalStock: number;
    stockHealth: {
      outOfStock: number;
      lowStock: number;
      normalStock: number;
    };
  };
}

export async function getInventorySummary() {
  return apiFetch('/inventory/summary', {
    method: 'GET',
  }) as Promise<InventorySummary>;
}
