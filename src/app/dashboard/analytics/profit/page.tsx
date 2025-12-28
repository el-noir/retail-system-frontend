'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProfitAnalytics } from '@/lib/store/slices/analyticsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function ProfitAnalyticsPage() {
  const dispatch = useAppDispatch();
  const { profitAnalytics, loading, error } = useAppSelector((state) => state.analytics);

  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    dispatch(fetchProfitAnalytics({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const handleRefresh = () => {
    dispatch(fetchProfitAnalytics({ startDate, endDate }));
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

  if (!profitAnalytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">No data available</div>
        </div>
      </div>
    );
  }

  const isProfit = profitAnalytics.grossProfit >= 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss Analytics</h1>
          <p className="text-slate-400">Financial performance and margin analysis</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${profitAnalytics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">Sales income</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${profitAnalytics.totalCost.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">Cost of goods sold</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            {isProfit ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
              ${profitAnalytics.grossProfit.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">Revenue - Cost</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
              {profitAnalytics.profitMargin.toFixed(2)}%
            </div>
            <p className="text-xs text-slate-400">Profit percentage</p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Overview Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Profit Overview</CardTitle>
          <CardDescription>Revenue vs Cost comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: 'Financial Summary',
                  Revenue: profitAnalytics.totalRevenue,
                  Cost: profitAnalytics.totalCost,
                  Profit: profitAnalytics.grossProfit,
                },
              ]}
            >
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
              <Bar dataKey="Revenue" fill="#00C49F" />
              <Bar dataKey="Cost" fill="#FF8042" />
              <Bar dataKey="Profit" fill={isProfit ? '#0088FE' : '#FF0000'} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit by Product */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Profit by Product</CardTitle>
          <CardDescription>Top products by profitability</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={profitAnalytics.profitByProduct}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#00C49F" name="Revenue ($)" />
              <Bar yAxisId="left" dataKey="cost" fill="#FF8042" name="Cost ($)" />
              <Bar yAxisId="left" dataKey="profit" fill="#0088FE" name="Profit ($)" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="margin"
                stroke="#FFBB28"
                name="Margin (%)"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Product Profitability Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-right p-3">Revenue</th>
                  <th className="text-right p-3">Cost</th>
                  <th className="text-right p-3">Profit</th>
                  <th className="text-right p-3">Margin</th>
                </tr>
              </thead>
              <tbody>
                {profitAnalytics.profitByProduct.map((product, index) => {
                  const isProductProfit = product.profit >= 0;
                  return (
                    <tr key={product.productId} className="border-b border-slate-800">
                      <td className="p-3">#{index + 1}</td>
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-right text-green-500">
                        ${product.revenue.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-red-500">
                        ${product.cost.toFixed(2)}
                      </td>
                      <td
                        className={`p-3 text-right font-medium ${
                          isProductProfit ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        ${product.profit.toFixed(2)}
                      </td>
                      <td
                        className={`p-3 text-right font-medium ${
                          isProductProfit ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {product.margin.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-800 rounded">
              <h3 className="font-semibold mb-2">Overall Performance</h3>
              <p className="text-sm text-slate-300">
                {isProfit
                  ? `Your business is profitable with a ${profitAnalytics.profitMargin.toFixed(2)}% margin. Total profit: $${profitAnalytics.grossProfit.toFixed(2)}`
                  : `Your business is operating at a loss. Loss amount: $${Math.abs(profitAnalytics.grossProfit).toFixed(2)}`}
              </p>
            </div>

            {profitAnalytics.profitByProduct.length > 0 && (
              <>
                <div className="p-4 bg-slate-800 rounded">
                  <h3 className="font-semibold mb-2">Most Profitable Product</h3>
                  <p className="text-sm text-slate-300">
                    <span className="font-medium text-green-500">
                      {profitAnalytics.profitByProduct[0].name}
                    </span>{' '}
                    generated ${profitAnalytics.profitByProduct[0].profit.toFixed(2)} profit with a{' '}
                    {profitAnalytics.profitByProduct[0].margin.toFixed(2)}% margin.
                  </p>
                </div>

                {profitAnalytics.profitByProduct.some((p) => p.profit < 0) && (
                  <div className="p-4 bg-red-950/20 border border-red-900/30 rounded">
                    <h3 className="font-semibold mb-2 text-red-500">Action Required</h3>
                    <p className="text-sm text-slate-300">
                      {profitAnalytics.profitByProduct.filter((p) => p.profit < 0).length}{' '}
                      product(s) are operating at a loss. Review pricing strategy or consider
                      discontinuing these items.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
