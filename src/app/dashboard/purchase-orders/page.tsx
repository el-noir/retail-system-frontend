'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  getPurchaseOrders,
  type PurchaseOrder,
  PurchaseStatus,
} from '@/lib/api/purchase-orders'

const statusColors: Record<PurchaseStatus, string> = {
  [PurchaseStatus.DRAFT]: 'bg-gray-500',
  [PurchaseStatus.APPROVED]: 'bg-blue-500',
  [PurchaseStatus.PAID]: 'bg-purple-500',
  [PurchaseStatus.RECEIVED]: 'bg-green-500',
  [PurchaseStatus.CLOSED]: 'bg-slate-600',
  [PurchaseStatus.CANCELLED]: 'bg-red-500',
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | 'ALL'>('ALL')

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await getPurchaseOrders(
        statusFilter === 'ALL' ? undefined : statusFilter,
      )
      setOrders(response.orders || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (id: string) => {
    router.push(`/dashboard/purchase-orders/${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading purchase orders...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Manage restocking orders and supplier payments
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/dashboard/purchase-orders/create')}>
              Create Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as any)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value={PurchaseStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={PurchaseStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={PurchaseStatus.PAID}>Paid</SelectItem>
                <SelectItem value={PurchaseStatus.RECEIVED}>Received</SelectItem>
                <SelectItem value={PurchaseStatus.CLOSED}>Closed</SelectItem>
                <SelectItem value={PurchaseStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No purchase orders found. Click "Create Order" to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{order.supplier.name}</TableCell>
                    <TableCell>${Number(order.totalAmount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
