'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchPurchaseAnalytics } from '@/lib/store/slices/analyticsSlice';
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
import { DollarSign, ShoppingBag, TrendingDown, Users } from 'lucide-react';
import { format, subDays } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function PurchaseAnalyticsPage() {
  const dispatch = useAppDispatch();
  const { purchaseAnalytics, loading, error } = useAppSelector((state) => state.analytics);

  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    dispatch(fetchPurchaseAnalytics({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const handleRefresh = () => {
    dispatch(fetchPurchaseAnalytics({ startDate, endDate }));
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

  if (!purchaseAnalytics) {
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
          <h1 className="text-3xl font-bold">Purchase Analytics</h1>
          <p className="text-slate-400">Procurement and supplier performance insights</p>
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
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseAnalytics.totalPurchases}</div>
            <p className="text-xs text-slate-400">Total purchase orders</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${purchaseAnalytics.totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">Cumulative procurement cost</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseAnalytics.topSuppliers.length}</div>
            <p className="text-xs text-slate-400">Suppliers with orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Trend Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Purchase Trend</CardTitle>
          <CardDescription>Daily purchase activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={purchaseAnalytics.purchasesByDate}>
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
                dataKey="amount"
                stroke="#FF8042"
                name="Spending ($)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FFBB28"
                name="Order Count"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Suppliers */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Top Suppliers</CardTitle>
          <CardDescription>Suppliers by total spending</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purchaseAnalytics.topSuppliers}>
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
              <Bar dataKey="totalSpent" fill="#0088FE" name="Total Spent ($)" />
              <Bar dataKey="orderCount" fill="#00C49F" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Purchase Status Distribution */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Purchase Status</CardTitle>
          <CardDescription>Distribution of orders by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={purchaseAnalytics.purchasesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.status}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {purchaseAnalytics.purchasesByStatus.map((entry, index) => (
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
              {purchaseAnalytics.purchasesByStatus.map((status, index) => (
                <div key={status.status} className="flex items-center justify-between p-3 bg-slate-800 rounded">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{status.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${status.amount.toFixed(2)}</div>
                    <div className="text-xs text-slate-400">{status.count} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Performance Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Supplier Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Supplier</th>
                  <th className="text-right p-3">Orders</th>
                  <th className="text-right p-3">Total Spent</th>
                  <th className="text-right p-3">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {purchaseAnalytics.topSuppliers.map((supplier, index) => (
                  <tr key={supplier.supplierId} className="border-b border-slate-800">
                    <td className="p-3">#{index + 1}</td>
                    <td className="p-3 font-medium">{supplier.name}</td>
                    <td className="p-3 text-right">{supplier.orderCount}</td>
                    <td className="p-3 text-right">${supplier.totalSpent.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      ${(supplier.totalSpent / supplier.orderCount).toFixed(2)}
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
