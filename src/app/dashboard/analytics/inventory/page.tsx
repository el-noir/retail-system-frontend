'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchInventoryAnalytics } from '@/lib/store/slices/analyticsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function InventoryAnalyticsPage() {
  const dispatch = useAppDispatch();
  const { inventoryAnalytics, loading, error } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchInventoryAnalytics());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchInventoryAnalytics());
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!inventoryAnalytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Analytics</h1>
          <p className="text-slate-400">Stock levels and product performance</p>
        </div>
        <Button onClick={handleRefresh}>Refresh Data</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryAnalytics.totalProducts}</div>
            <p className="text-xs text-slate-400">Active SKUs</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${inventoryAnalytics.totalStockValue.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">Total inventory worth</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {inventoryAnalytics.lowStockCount}
            </div>
            <p className="text-xs text-slate-400">Requires restock</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryAnalytics.totalProducts > 0
                ? ((inventoryAnalytics.topSellingProducts.reduce((sum, p) => sum + p.quantitySold, 0) /
                    inventoryAnalytics.totalProducts) *
                    100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-slate-400">Average turnover</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Products with highest sales volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryAnalytics.topSellingProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}
              />
              <Legend />
              <Bar dataKey="quantitySold" fill="#0088FE" name="Quantity Sold" />
              <Bar dataKey="currentStock" fill="#00C49F" name="Current Stock" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Products by Category */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
          <CardDescription>Stock distribution across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryAnalytics.productsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.category}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {inventoryAnalytics.productsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {inventoryAnalytics.productsByCategory.map((category, index) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{category.count} items</div>
                    <div className="text-xs text-slate-400">
                      ${category.stockValue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Performance Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Product Stock Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-right p-3">Quantity Sold</th>
                  <th className="text-right p-3">Current Stock</th>
                  <th className="text-right p-3">Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryAnalytics.topSellingProducts.map((product, index) => {
                  const stockStatus =
                    product.currentStock === 0
                      ? 'Out of Stock'
                      : product.currentStock < 10
                      ? 'Low Stock'
                      : 'In Stock';
                  const statusColor =
                    product.currentStock === 0
                      ? 'text-red-500'
                      : product.currentStock < 10
                      ? 'text-yellow-500'
                      : 'text-green-500';

                  return (
                    <tr key={product.productId} className="border-b border-slate-800">
                      <td className="p-3">#{index + 1}</td>
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-right">{product.quantitySold}</td>
                      <td className="p-3 text-right">{product.currentStock}</td>
                      <td className={`p-3 text-right font-medium ${statusColor}`}>
                        {stockStatus}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
