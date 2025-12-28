import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

export interface SalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
  salesByDate: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

export interface PurchaseAnalytics {
  totalPurchases: number;
  totalSpent: number;
  topSuppliers: Array<{
    supplierId: string;
    name: string;
    totalSpent: number;
    orderCount: number;
  }>;
  purchasesByDate: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  purchasesByStatus: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
}

export interface InventoryAnalytics {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  topSellingProducts: Array<{
    productId: string;
    name: string;
    quantitySold: number;
    currentStock: number;
  }>;
  productsByCategory: Array<{
    category: string;
    count: number;
    stockValue: number;
  }>;
}

export interface ProfitAnalytics {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  profitByProduct: Array<{
    productId: string;
    name: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
}

export interface DashboardSummary {
  totalSales: number;
  monthlyRevenue: number;
  totalPurchases: number;
  monthlySpending: number;
  lowStockCount: number;
  totalProducts: number;
}

export async function getSalesAnalytics(
  startDate?: string,
  endDate?: string,
): Promise<SalesAnalytics> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_URL}/analytics/sales?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getPurchaseAnalytics(
  startDate?: string,
  endDate?: string,
): Promise<PurchaseAnalytics> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_URL}/analytics/purchases?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getInventoryAnalytics(): Promise<InventoryAnalytics> {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_URL}/analytics/inventory`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getProfitAnalytics(
  startDate?: string,
  endDate?: string,
): Promise<ProfitAnalytics> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_URL}/analytics/profit?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_URL}/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export interface ProductAnalytics {
  product: {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    category: string;
    currentStock: number;
    costPrice: number;
    sellingPrice: number;
    reorderLevel: number | null;
    reorderQty: number | null;
  };
  salesMetrics: {
    totalUnitsSold: number;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
    averageSellingPrice: number;
    salesCount: number;
  };
  purchaseMetrics: {
    totalUnitsRestocked: number;
    totalRestockCost: number;
    averageRestockPrice: number;
    purchaseCount: number;
  };
  salesByDate: Array<{
    date: string;
    quantity: number;
    revenue: number;
  }>;
  restockByDate: Array<{
    date: string;
    quantity: number;
    cost: number;
  }>;
  stockMovements: Array<{
    id: number;
    type: string;
    quantity: number;
    reason: string | null;
    previousStock: number;
    newStock: number;
    createdBy: string;
    createdAt: string;
  }>;
  suppliers: Array<{
    supplierId: string;
    name: string;
    supplierSku: string | null;
    price: number;
    isAvailable: boolean;
    isPrimary: boolean;
    leadTimeDays: number | null;
    minOrderQty: number;
  }>;
}

export async function getProductAnalytics(
  productId: number,
  startDate?: string,
  endDate?: string
): Promise<ProductAnalytics> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const url = params.toString() 
    ? `${API_URL}/analytics/product/${productId}?${params.toString()}`
    : `${API_URL}/analytics/product/${productId}`;
  
  console.log('Fetching product analytics from:', url);
  
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    throw error;
  }
}
