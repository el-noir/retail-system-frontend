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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { getSuppliers, type Supplier } from '@/lib/api/suppliers'
import { getProducts, type Product } from '@/lib/api/products'
import {
  createPurchaseOrder,
  type PurchaseItemDto,
} from '@/lib/api/purchase-orders'

interface OrderItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        getSuppliers(),
        getProducts(),
      ])
      console.log('Suppliers response:', suppliersRes)
      console.log('Products response:', productsRes)
      
      // Handle suppliers response
      const suppliersList = Array.isArray(suppliersRes) 
        ? suppliersRes 
        : (suppliersRes?.suppliers || [])
      setSuppliers(suppliersList)
      
      // Handle products response - backend returns 'items' not 'products'
      const productsList = Array.isArray(productsRes) 
        ? productsRes 
        : (productsRes?.items || productsRes?.products || [])
      setProducts(productsList)
      
      console.log('Set suppliers:', suppliersList.length)
      console.log('Set products:', productsList.length)
    } catch (error: any) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    }
  }

  const handleAddItem = () => {
    if (!selectedProductId || quantity <= 0 || unitPrice <= 0) {
      toast.error('Please fill in all item fields')
      return
    }

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const existingItem = items.find((i) => i.productId === selectedProductId)
    if (existingItem) {
      toast.error('Product already added')
      return
    }

    setItems([
      ...items,
      {
        productId: selectedProductId,
        productName: product.name,
        quantity,
        unitPrice,
      },
    ])

    // Reset form
    setSelectedProductId(null)
    setQuantity(1)
    setUnitPrice(0)
  }

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter((i) => i.productId !== productId))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplierId) {
      toast.error('Please select a supplier')
      return
    }

    if (items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    try {
      setLoading(true)
      const orderItems: PurchaseItemDto[] = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))

      await createPurchaseOrder({
        supplierId,
        items: orderItems,
        notes: notes || undefined,
      })

      toast.success('Purchase order created successfully')
      router.push('/dashboard/purchase-orders')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create purchase order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Purchase Order</CardTitle>
          <CardDescription>
            Create a new restocking order from supplier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(suppliers) && suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Items Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Add Items</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label>Product *</Label>
                  <Select
                    value={selectedProductId?.toString() || ''}
                    onValueChange={(v) => setSelectedProductId(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(products) && products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <Button type="button" onClick={handleAddItem} className="w-full">
                Add Item
              </Button>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 bg-muted rounded"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × ${item.unitPrice.toFixed(2)} = $
                          {(item.quantity * item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-lg font-bold text-right">
                    Total: ${calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this order"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Purchase Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
