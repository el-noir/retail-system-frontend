'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchSalesAnalytics } from '@/lib/store/slices/analyticsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { format, subDays } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function SalesAnalyticsPage() {
  const dispatch = useAppDispatch();
  const { salesAnalytics, loading, error } = useAppSelector((state) => state.analytics);

  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    dispatch(fetchSalesAnalytics({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const handleRefresh = () => {
    dispatch(fetchSalesAnalytics({ startDate, endDate }));
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

  if (!salesAnalytics) {
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
          <h1 className="text-3xl font-bold">Sales Analytics</h1>
          <p className="text-slate-400">Comprehensive sales performance insights</p>
        </div>
        <Button onClick={handleRefresh}>Refresh Data</Button>
      </div>

      {/* Date Range Filter */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesAnalytics.totalSales}</div>
            <p className="text-xs text-slate-400">Total number of transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesAnalytics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">Cumulative sales revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesAnalytics.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">Per transaction average</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Daily sales performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesAnalytics.salesByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0088FE"
                name="Revenue ($)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#00C49F"
                name="Sales Count"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performing products by quantity sold</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesAnalytics.topProducts}>
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
              <Bar dataKey="revenue" fill="#00C49F" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Method Distribution */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Distribution of sales by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesAnalytics.salesByPaymentMethod}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.method}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {salesAnalytics.salesByPaymentMethod.map((entry, index) => (
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
              {salesAnalytics.salesByPaymentMethod.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between p-3 bg-slate-800 rounded">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${method.amount.toFixed(2)}</div>
                    <div className="text-xs text-slate-400">{method.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Product Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-right p-3">Quantity Sold</th>
                  <th className="text-right p-3">Revenue</th>
                  <th className="text-right p-3">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {salesAnalytics.topProducts.map((product, index) => (
                  <tr key={product.productId} className="border-b border-slate-800">
                    <td className="p-3">#{index + 1}</td>
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3 text-right">{product.quantitySold}</td>
                    <td className="p-3 text-right">${product.revenue.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      ${(product.revenue / product.quantitySold).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
