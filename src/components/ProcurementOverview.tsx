'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Package, TrendingUp, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPurchaseOrders, PurchaseStatus, type PurchaseOrder } from '@/lib/api/purchase-orders'
import { getSuppliers, type Supplier } from '@/lib/api/suppliers'

export function ProcurementOverview() {
  const router = useRouter()
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [ordersData, suppliersData] = await Promise.all([
          getPurchaseOrders(),
          getSuppliers(),
        ])
        setOrders(Array.isArray(ordersData) ? ordersData : [])
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : [])
      } catch (error) {
        console.error('Failed to fetch procurement data:', error)
        setOrders([])
        setSuppliers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = React.useMemo(() => {
    const ordersList = Array.isArray(orders) ? orders : []
    const suppliersList = Array.isArray(suppliers) ? suppliers : []
    
    const pending = ordersList.filter(o => o.status === PurchaseStatus.DRAFT || o.status === PurchaseStatus.APPROVED)
    const awaitingPayment = ordersList.filter(o => o.status === PurchaseStatus.APPROVED)
    const inTransit = ordersList.filter(o => o.status === PurchaseStatus.PAID)
    const completed = ordersList.filter(o => o.status === PurchaseStatus.CLOSED)
    
    const totalValue = ordersList
      .filter(o => o.status !== PurchaseStatus.CANCELLED)
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)

    return {
      pending: pending.length,
      awaitingPayment: awaitingPayment.length,
      inTransit: inTransit.length,
      completed: completed.length,
      totalValue,
      activeSuppliers: suppliersList.filter(s => s.isActive).length,
    }
  }, [orders, suppliers])

  const recentOrders = React.useMemo(() => {
    const ordersList = Array.isArray(orders) ? orders : []
    return [...ordersList]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [orders])

  const getStatusColor = (status: PurchaseStatus) => {
    switch (status) {
      case PurchaseStatus.DRAFT:
        return 'bg-slate-700 text-slate-200'
      case PurchaseStatus.APPROVED:
        return 'bg-blue-900/40 text-blue-200 border-blue-700'
      case PurchaseStatus.PAID:
        return 'bg-purple-900/40 text-purple-200 border-purple-700'
      case PurchaseStatus.RECEIVED:
        return 'bg-amber-900/40 text-amber-200 border-amber-700'
      case PurchaseStatus.CLOSED:
        return 'bg-emerald-900/40 text-emerald-200 border-emerald-700'
      case PurchaseStatus.CANCELLED:
        return 'bg-red-900/40 text-red-200 border-red-700'
      default:
        return 'bg-slate-700 text-slate-300'
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-800 bg-slate-900 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-slate-800 rounded"></div>
            <div className="h-24 bg-slate-800 rounded"></div>
            <div className="h-24 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Procurement Overview</h2>
          <p className="text-sm text-slate-400 mt-1">Monitor purchase orders and supplier relationships</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push('/dashboard/suppliers')}
            variant="outline"
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <Users className="h-4 w-4 mr-2" />
            Suppliers
          </Button>
          <Button
            onClick={() => router.push('/dashboard/purchase-orders/create')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Package className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-400">Pending Action</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.pending}</p>
              <p className="mt-1 text-xs text-slate-500">Orders awaiting approval</p>
            </div>
            <div className="rounded-full bg-amber-900/30 p-3">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Awaiting Payment */}
        <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-400">Awaiting Payment</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.awaitingPayment}</p>
              <p className="mt-1 text-xs text-slate-500">Ready to process</p>
            </div>
            <div className="rounded-full bg-blue-900/30 p-3">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>

        {/* In Transit */}
        <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-400">In Transit</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.inTransit}</p>
              <p className="mt-1 text-xs text-slate-500">Goods awaiting receipt</p>
            </div>
            <div className="rounded-full bg-purple-900/30 p-3">
              <Package className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="rounded-lg border border-emerald-800/50 bg-gradient-to-br from-emerald-950 to-slate-900 p-4 hover:border-emerald-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-400">Total Value</p>
              <p className="mt-2 text-3xl font-bold text-white">${stats.totalValue.toFixed(2)}</p>
              <p className="mt-1 text-xs text-emerald-500">{stats.activeSuppliers} active suppliers</p>
            </div>
            <div className="rounded-full bg-emerald-900/40 p-3">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Purchase Orders</h3>
          <Button
            onClick={() => router.push('/dashboard/purchase-orders')}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            View All →
          </Button>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400 mb-4">No purchase orders yet</p>
            <Button
              onClick={() => router.push('/dashboard/purchase-orders/create')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Create Your First Order
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">PO-{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{order.supplier?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">${Number(order.totalAmount || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        onClick={() => router.push(`/dashboard/purchase-orders/${order.id}`)}
                        variant="ghost"
                        size="sm"
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-blue-950/30 to-slate-900 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-900/40 p-3">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Manage Suppliers</h4>
              <p className="text-sm text-slate-400 mb-4">
                View, add, or update supplier information and contact details.
              </p>
              <Button
                onClick={() => router.push('/dashboard/suppliers')}
                variant="outline"
                size="sm"
                className="border-blue-700 bg-blue-900/20 hover:bg-blue-900/40 text-blue-300"
              >
                Go to Suppliers
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-purple-950/30 to-slate-900 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-purple-900/40 p-3">
              <Package className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">All Purchase Orders</h4>
              <p className="text-sm text-slate-400 mb-4">
                View complete order history, filter by status, and track deliveries.
              </p>
              <Button
                onClick={() => router.push('/dashboard/purchase-orders')}
                variant="outline"
                size="sm"
                className="border-purple-700 bg-purple-900/20 hover:bg-purple-900/40 text-purple-300"
              >
                View Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
