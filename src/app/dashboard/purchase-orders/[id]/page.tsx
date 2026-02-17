'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  getPurchaseOrder,
  approvePurchaseOrder,
  receiveGoods,
  closePurchaseOrder,
  cancelPurchaseOrder,
  type PurchaseOrder,
  PurchaseStatus,
  type PurchaseItem,
} from '@/lib/api/purchase-orders'
import { createPaymentIntent, getPaymentsByPurchaseOrder, type Payment, PaymentStatus } from '@/lib/api/payments'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  {
    locale: 'en',
  }
)

function PaymentForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    console.log('PaymentForm mounted with clientSecret:', clientSecret?.substring(0, 20) + '...')
    
    // Reset processing state when component mounts with new clientSecret
    return () => {
      isProcessingRef.current = false
    }
  }, [clientSecret])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // CRITICAL: Prevent duplicate submissions
    if (isProcessingRef.current) {
      console.log('Payment already processing, ignoring duplicate submission')
      return
    }

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait.')
      toast.error('Stripe has not loaded yet. Please wait.')
      return
    }

    if (!isReady) {
      setError('Payment form is still loading. Please wait.')
      toast.error('Payment form is still loading. Please wait.')
      return
    }

    // Mark as processing to prevent duplicates
    isProcessingRef.current = true
    setLoading(true)
    setError(null)

    console.log('Starting payment confirmation...')

    try {
      // Confirm the payment directly with Stripe.js v4
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/purchase-orders`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        console.error('Payment confirmation error:', confirmError)
        console.error('Error type:', confirmError.type)
        console.error('Error code:', confirmError.code)
        console.error('Error decline code:', confirmError.decline_code)
        console.error('Error message:', confirmError.message)
        
        const errorMessage = confirmError.message || 'Payment failed'
        setError(errorMessage)
        toast.error(errorMessage)
        setLoading(false)
        isProcessingRef.current = false
        return
      }

      // Check payment intent status
      if (paymentIntent) {
        console.log('Payment intent status:', paymentIntent.status)
        
        if (paymentIntent.status === 'succeeded') {
          toast.success('Payment successful!')
          onSuccess()
        } else if (paymentIntent.status === 'processing') {
          toast.info('Payment is processing...')
          onSuccess()
        } else if (paymentIntent.status === 'requires_payment_method') {
          setError('Payment failed. Please try a different payment method.')
          toast.error('Payment failed. Please try a different payment method.')
          setLoading(false)
          isProcessingRef.current = false
        } else {
          toast.info(`Payment status: ${paymentIntent.status}`)
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      const errorMessage = error.message || 'Payment failed'
      setError(errorMessage)
      toast.error(errorMessage)
      setLoading(false)
      isProcessingRef.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        onReady={() => {
          console.log('PaymentElement ready')
          setIsReady(true)
        }}
        options={{
          layout: 'tabs',
        }}
      />
      {error && (
        <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        disabled={!stripe || !isReady || loading || isProcessingRef.current} 
        className="w-full"
      >
        {!isReady ? 'Loading payment form...' : loading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  )
}

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PurchaseItem | null>(null)
  const [receiveQty, setReceiveQty] = useState(0)
  const [existingPayment, setExistingPayment] = useState<Payment | null>(null)
  const isCreatingPaymentRef = useRef(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await getPurchaseOrder(orderId)
      setOrder(data)
      
      // Check if payment already exists for this order
      if (data.status === PurchaseStatus.APPROVED || data.status === PurchaseStatus.PAID) {
        try {
          const payments = await getPaymentsByPurchaseOrder(orderId)
          if (payments && payments.length > 0) {
            const latestPayment = payments[0]
            setExistingPayment(latestPayment)
            
            // If payment is still valid (PENDING or PROCESSING), keep the client secret
            if (latestPayment.stripeClientSecret && 
                (latestPayment.status === 'PENDING' || latestPayment.status === 'PROCESSING')) {
              setClientSecret(latestPayment.stripeClientSecret)
              console.log('Reusing existing payment intent:', latestPayment.id)
            }
          }
        } catch (error) {
          console.error('Failed to load payment info:', error)
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Approve this purchase order?')) return

    try {
      await approvePurchaseOrder(orderId)
      toast.success('Order approved')
      loadOrder()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve order')
    }
  }

  const handlePayment = async () => {
    // CRITICAL: Prevent duplicate payment creation
    if (isCreatingPaymentRef.current) {
      console.log('Payment creation already in progress, ignoring duplicate call')
      return
    }

    try {
      // If payment already completed, don't allow retrying
      if (existingPayment?.status === PaymentStatus.SUCCEEDED) {
        toast.info('Payment already completed successfully')
        return
      }
      
      // If there's a valid existing payment (PENDING/PROCESSING), reuse it
      if (existingPayment?.stripeClientSecret && 
          (existingPayment.status === PaymentStatus.PENDING || 
           existingPayment.status === PaymentStatus.PROCESSING)) {
        console.log('Reusing existing payment intent:', existingPayment.id)
        setClientSecret(existingPayment.stripeClientSecret)
        setPaymentDialogOpen(true)
        toast.info('Continuing with existing payment')
        return
      }
      
      // Mark as creating to prevent duplicates
      isCreatingPaymentRef.current = true
      setIsPaymentLoading(true)
      
      // Only create new payment intent if no valid payment exists
      // This will fail if backend already has a payment for this order
      console.log('Creating new payment intent for order:', orderId)
      const response = await createPaymentIntent(orderId)
      
      // Validate the response
      if (!response.clientSecret || !response.payment) {
        throw new Error('Invalid payment response from server')
      }
      
      console.log('New payment intent created:', response.payment.id)
      setClientSecret(response.clientSecret)
      setExistingPayment(response.payment)
      setPaymentDialogOpen(true)
    } catch (error: any) {
      console.error('Payment error:', error)
      const errorMessage = error.message || 'Failed to initiate payment'
      
      // If payment already exists error, reload the page to get the existing payment
      if (errorMessage.includes('already exists')) {
        toast.error('Payment already exists. Reloading...')
        setTimeout(() => {
          loadOrder()
        }, 1000)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsPaymentLoading(false)
      // Reset the flag after a short delay
      setTimeout(() => {
        isCreatingPaymentRef.current = false
      }, 1000)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false)
    setClientSecret(null)
    loadOrder()
  }

  const handlePaymentDialogClose = (open: boolean) => {
    setPaymentDialogOpen(open)
    if (!open) {
      // Clean up when dialog closes
      setTimeout(() => {
        setClientSecret(null)
      }, 300) // Small delay to allow animation
    }
  }

  const handleReceiveGoods = (item: PurchaseItem) => {
    setSelectedItem(item)
    setReceiveQty(item.quantity - item.receivedQty)
    setReceiveDialogOpen(true)
  }

  const handleConfirmReceive = async () => {
    if (!selectedItem || receiveQty <= 0) return

    try {
      await receiveGoods(orderId, selectedItem.id, { receivedQty: receiveQty })
      toast.success('Goods received and stock updated')
      setReceiveDialogOpen(false)
      setSelectedItem(null)
      loadOrder()
    } catch (error: any) {
      toast.error(error.message || 'Failed to receive goods')
    }
  }

  const handleClose = async () => {
    if (!confirm('Close this purchase order?')) return

    try {
      await closePurchaseOrder(orderId)
      toast.success('Order closed')
      loadOrder()
    } catch (error: any) {
      toast.error(error.message || 'Failed to close order')
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this purchase order?')) return

    try {
      await cancelPurchaseOrder(orderId)
      toast.success('Order cancelled')
      loadOrder()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading order...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Order not found</p>
      </div>
    )
  }

  const statusColors: Record<PurchaseStatus, string> = {
    [PurchaseStatus.DRAFT]: 'bg-gray-500',
    [PurchaseStatus.APPROVED]: 'bg-blue-500',
    [PurchaseStatus.PAID]: 'bg-purple-500',
    [PurchaseStatus.RECEIVED]: 'bg-green-500',
    [PurchaseStatus.CLOSED]: 'bg-slate-600',
    [PurchaseStatus.CANCELLED]: 'bg-red-500',
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Purchase Order</CardTitle>
                <CardDescription className="font-mono">
                  ID: {order.id}
                </CardDescription>
              </div>
              <Badge className={statusColors[order.status]}>{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{order.supplier.name}</p>
                {order.supplier.email && (
                  <p className="text-sm text-muted-foreground">{order.supplier.email}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  ${Number(order.totalAmount).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="font-medium">
                  {order.createdBy?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  {order.status === PurchaseStatus.PAID && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.product.sku}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      ${Number(item.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${Number(item.totalPrice).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.receivedQty} / {item.quantity}
                      {item.receivedQty === item.quantity && (
                        <Badge variant="outline" className="ml-2">
                          ✓
                        </Badge>
                      )}
                    </TableCell>
                    {order.status === PurchaseStatus.PAID && (
                      <TableCell className="text-right">
                        {item.receivedQty < item.quantity && (
                          <Button
                            size="sm"
                            onClick={() => handleReceiveGoods(item)}
                          >
                            Receive
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {order.status === PurchaseStatus.DRAFT && (
              <>
                <Button onClick={handleApprove}>Approve Order</Button>
                <Button variant="destructive" onClick={handleCancel}>
                  Cancel Order
                </Button>
              </>
            )}
            {order.status === PurchaseStatus.APPROVED && (
              <>
                <Button 
                  onClick={handlePayment}
                  disabled={isPaymentLoading}
                >
                  {isPaymentLoading ? 'Creating payment...' : (
                    existingPayment?.status === PaymentStatus.PENDING || 
                    existingPayment?.status === PaymentStatus.PROCESSING 
                      ? 'Continue Payment' 
                      : 'Pay Supplier (Stripe)'
                  )}
                </Button>
                {existingPayment && (
                  <Badge 
                    className="ml-2" 
                    variant={existingPayment.status === PaymentStatus.SUCCEEDED ? 'default' : 'secondary'}
                  >
                    Payment: {existingPayment.status}
                  </Badge>
                )}
                <Button variant="destructive" onClick={handleCancel}>
                  Cancel Order
                </Button>
              </>
            )}
            {order.status === PurchaseStatus.RECEIVED && (
              <Button onClick={handleClose}>Close Order</Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={handlePaymentDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Supplier via Stripe</DialogTitle>
            <DialogDescription>
              Total: ${Number(order.totalAmount).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          {clientSecret ? (
            <Elements 
              key={clientSecret}
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#10b981',
                  },
                },
                locale: 'en',
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading payment form...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receive Goods Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Goods</DialogTitle>
            <DialogDescription>
              {selectedItem?.product.name} - {selectedItem?.product.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ordered Quantity: {selectedItem?.quantity}</Label>
              <Label>Already Received: {selectedItem?.receivedQty}</Label>
              <Label>
                Remaining: {(selectedItem?.quantity || 0) - (selectedItem?.receivedQty || 0)}
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiveQty">Quantity to Receive</Label>
              <Input
                id="receiveQty"
                type="number"
                min="1"
                max={(selectedItem?.quantity || 0) - (selectedItem?.receivedQty || 0)}
                value={receiveQty}
                onChange={(e) => setReceiveQty(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReceiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmReceive}>
              Confirm & Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
