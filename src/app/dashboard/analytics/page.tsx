'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchSalesAnalytics,
  fetchPurchaseAnalytics,
  fetchInventoryAnalytics,
  fetchProfitAnalytics,
} from '@/lib/store/slices/analyticsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { salesAnalytics, purchaseAnalytics, inventoryAnalytics, profitAnalytics, loading } =
    useAppSelector((state) => state.analytics);

  const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    // Fetch all analytics data
    dispatch(fetchSalesAnalytics({ startDate, endDate }));
    dispatch(fetchPurchaseAnalytics({ startDate, endDate }));
    dispatch(fetchInventoryAnalytics());
    dispatch(fetchProfitAnalytics({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const handleRefreshAll = () => {
    dispatch(fetchSalesAnalytics({ startDate, endDate }));
    dispatch(fetchPurchaseAnalytics({ startDate, endDate }));
    dispatch(fetchInventoryAnalytics());
    dispatch(fetchProfitAnalytics({ startDate, endDate }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const isProfit = profitAnalytics && profitAnalytics.grossProfit >= 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-slate-400">Comprehensive business intelligence overview</p>
        </div>
        <Button onClick={handleRefreshAll}>Refresh All Data</Button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="justify-between h-auto p-4"
          onClick={() => router.push('/dashboard/analytics/sales')}
        >
          <div className="text-left">
            <div className="font-semibold">Sales Analytics</div>
            <div className="text-xs text-slate-400">Revenue & transactions</div>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="justify-between h-auto p-4"
          onClick={() => router.push('/dashboard/analytics/purchases')}
        >
          <div className="text-left">
            <div className="font-semibold">Purchase Analytics</div>
            <div className="text-xs text-slate-400">Procurement insights</div>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="justify-between h-auto p-4"
          onClick={() => router.push('/dashboard/analytics/inventory')}
        >
          <div className="text-left">
            <div className="font-semibold">Inventory Analytics</div>
            <div className="text-xs text-slate-400">Stock performance</div>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="justify-between h-auto p-4"
          onClick={() => router.push('/dashboard/analytics/profit')}
        >
          <div className="text-left">
            <div className="font-semibold">Profit Analytics</div>
            <div className="text-xs text-slate-400">Financial performance</div>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales KPIs */}
        {salesAnalytics && (
          <>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesAnalytics.totalSales}</div>
                <p className="text-xs text-slate-400">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  ${salesAnalytics.totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400">Sales income</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Purchase KPIs */}
        {purchaseAnalytics && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              <ShoppingBag className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                ${purchaseAnalytics.totalSpent.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Procurement cost</p>
            </CardContent>
          </Card>
        )}

        {/* Inventory KPIs */}
        {inventoryAnalytics && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
              <Package className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${inventoryAnalytics.totalStockValue.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Inventory worth</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profit Overview */}
      {profitAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}
              >
                ${profitAnalytics.grossProfit.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}
              >
                {profitAnalytics.profitMargin.toFixed(2)}%
              </div>
              <p className="text-xs text-slate-400">Profit percentage</p>
            </CardContent>
          </Card>

          {inventoryAnalytics && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {inventoryAnalytics.lowStockCount}
                </div>
                <p className="text-xs text-slate-400">Requires attention</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sales Trend */}
      {salesAnalytics && salesAnalytics.salesByDate.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Revenue performance over the last 30 days</CardDescription>
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
                  stroke="#00C49F"
                  name="Revenue ($)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Products and Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Selling Products */}
        {salesAnalytics && salesAnalytics.topProducts.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performers by quantity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[200px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesAnalytics.topProducts.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="quantitySold" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Suppliers */}
        {purchaseAnalytics && purchaseAnalytics.topSuppliers.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
              <CardDescription>By total spending</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={purchaseAnalytics.topSuppliers.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                    }}
                  />
                  <Bar dataKey="totalSpent" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Key Insights */}
      {profitAnalytics && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800 rounded">
                <h3 className="font-semibold mb-2">Financial Health</h3>
                <p className="text-sm text-slate-300">
                  {isProfit
                    ? `Your business is performing well with a ${profitAnalytics.profitMargin.toFixed(2)}% profit margin. Total profit for the period: $${profitAnalytics.grossProfit.toFixed(2)}`
                    : `Your business is currently operating at a loss. Focus on cost reduction and increasing sales volume.`}
                </p>
              </div>

              {inventoryAnalytics && inventoryAnalytics.lowStockCount > 0 && (
                <div className="p-4 bg-yellow-950/20 border border-yellow-900/30 rounded">
                  <h3 className="font-semibold mb-2 text-yellow-500">Inventory Alert</h3>
                  <p className="text-sm text-slate-300">
                    {inventoryAnalytics.lowStockCount} product(s) are running low on stock. Review
                    inventory and create purchase orders to avoid stockouts.
                  </p>
                </div>
              )}

              {salesAnalytics && salesAnalytics.totalSales > 0 && (
                <div className="p-4 bg-slate-800 rounded">
                  <h3 className="font-semibold mb-2">Sales Performance</h3>
                  <p className="text-sm text-slate-300">
                    Average order value is ${salesAnalytics.averageOrderValue.toFixed(2)}. Total of{' '}
                    {salesAnalytics.totalSales} transactions processed in the last 30 days.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
