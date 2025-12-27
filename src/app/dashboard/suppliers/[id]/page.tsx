'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Plus, Edit, Trash2, Star, TrendingUp, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getSupplier,
  getSupplierProducts,
  addProductToSupplier,
  updateSupplierProduct,
  removeProductFromSupplier,
  type Supplier,
  type SupplierProduct,
  type CreateSupplierProductDto,
  type UpdateSupplierProductDto,
} from '@/lib/api/suppliers'
import { getProductsPage, type Product } from '@/lib/api/products'

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [supplierId, setSupplierId] = React.useState<string | null>(null)
  const [supplier, setSupplier] = React.useState<Supplier | null>(null)
  const [supplierProducts, setSupplierProducts] = React.useState<SupplierProduct[]>([])
  const [allProducts, setAllProducts] = React.useState<Product[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<SupplierProduct | null>(null)
  const [selectedProductId, setSelectedProductId] = React.useState<string>('')

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setSupplierId(resolvedParams.id)
    })
  }, [params])

  React.useEffect(() => {
    if (supplierId) {
      fetchData()
    }
  }, [supplierId])

  const fetchData = async () => {
    if (!supplierId) return
    
    try {
      setIsLoading(true)
      const [supplierData, productsData, allProductsData] = await Promise.all([
        getSupplier(supplierId),
        getSupplierProducts(supplierId),
        getProductsPage(100, 0),
      ])
      setSupplier(supplierData)
      setSupplierProducts(productsData)
      setAllProducts(allProductsData.items)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load supplier data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!supplierId) return
    
    const formData = new FormData(e.currentTarget)
    
    // Validate required fields
    if (!selectedProductId) {
      toast.error('Please select a product')
      return
    }
    
    const supplierPriceStr = (formData.get('supplierPrice') as string)?.trim()
    const minOrderQtyStr = (formData.get('minOrderQty') as string)?.trim()
    const leadTimeDaysStr = (formData.get('leadTimeDays') as string)?.trim()
    const stockQuantityStr = (formData.get('stockQuantity') as string)?.trim()
    
    if (!supplierPriceStr) {
      toast.error('Supplier Price is required')
      return
    }
    
    const productId = parseInt(selectedProductId)
    const supplierPrice = parseFloat(supplierPriceStr)
    
    if (isNaN(productId) || isNaN(supplierPrice) || supplierPrice < 0) {
      toast.error('Invalid numeric values')
      return
    }
    
    const dto: CreateSupplierProductDto = {
      supplierId: supplierId,
      productId,
      supplierPrice,
      supplierSku: (formData.get('supplierSku') as string)?.trim() || undefined,
      minOrderQty: minOrderQtyStr ? parseInt(minOrderQtyStr) : 1,
      leadTimeDays: leadTimeDaysStr ? parseInt(leadTimeDaysStr) : undefined,
      stockQuantity: stockQuantityStr ? parseInt(stockQuantityStr) : undefined,
      isAvailable: formData.get('isAvailable') === 'on' || formData.get('isAvailable') === 'true',
      isPrimarySupplier: formData.get('isPrimarySupplier') === 'on' || formData.get('isPrimarySupplier') === 'true',
      notes: (formData.get('notes') as string)?.trim() || undefined,
    }

    console.log('Submitting DTO:', dto)

    try {
      await addProductToSupplier(dto)
      toast.success('Product added to supplier successfully')
      setIsAddDialogOpen(false)
      fetchData()
    } catch (error: any) {
      console.error('Add product error:', error)
      console.error('Error data:', error?.data)
      const errorMessage = error?.data?.message?.[0] || error?.message || 'Failed to add product'
      toast.error(errorMessage)
    }
  }

  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedProduct) return

    const formData = new FormData(e.currentTarget)
    
    const dto: UpdateSupplierProductDto = {
      supplierPrice: parseFloat(formData.get('supplierPrice') as string),
      supplierSku: formData.get('supplierSku') as string || undefined,
      minOrderQty: parseInt(formData.get('minOrderQty') as string),
      leadTimeDays: formData.get('leadTimeDays') ? parseInt(formData.get('leadTimeDays') as string) : undefined,
      isAvailable: formData.get('isAvailable') === 'on' || formData.get('isAvailable') === 'true',
      isPrimarySupplier: formData.get('isPrimarySupplier') === 'on' || formData.get('isPrimarySupplier') === 'true',
      stockQuantity: formData.get('stockQuantity') ? parseInt(formData.get('stockQuantity') as string) : undefined,
      notes: formData.get('notes') as string || undefined,
    }

    try {
      await updateSupplierProduct(selectedProduct.id, dto)
      toast.success('Product updated successfully')
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      fetchData()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update product')
    }
  }

  const handleRemoveProduct = async (id: string, productName: string) => {
    if (!confirm(`Remove ${productName} from this supplier?`)) return

    try {
      await removeProductFromSupplier(id)
      toast.success('Product removed successfully')
      fetchData()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove product')
    }
  }

  const availableProducts = React.useMemo(() => {
    const existingIds = new Set(supplierProducts.map(sp => sp.productId))
    return allProducts.filter(p => !existingIds.has(p.id))
  }, [allProducts, supplierProducts])

  const stats = React.useMemo(() => {
    const available = supplierProducts.filter(sp => sp.isAvailable).length
    const totalValue = supplierProducts.reduce((sum, sp) => {
      return sum + (Number(sp.supplierPrice) * (sp.minOrderQty || 1))
    }, 0)
    const primaryCount = supplierProducts.filter(sp => sp.isPrimarySupplier).length

    return { available, totalValue, primaryCount, total: supplierProducts.length }
  }, [supplierProducts])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/4"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <p className="text-xl">Supplier not found</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/suppliers')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{supplier.name}</h1>
              <p className="text-slate-400 mt-1">Product Catalog & Availability</p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Supplier Info Card */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Supplier Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400">Contact</p>
              <p className="text-slate-200">{supplier.contactPerson || 'N/A'}</p>
              <p className="text-sm text-slate-400 mt-1">{supplier.email || 'No email'}</p>
              <p className="text-sm text-slate-400">{supplier.phone || 'No phone'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Payment Terms</p>
              <p className="text-slate-200">{supplier.paymentTerms || 'Not specified'}</p>
              <p className="text-sm text-slate-400 mt-2">Lead Time</p>
              <p className="text-slate-200">{supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Min Order Amount</p>
              <p className="text-slate-200">${supplier.minOrderAmount?.toFixed(2) || 'N/A'}</p>
              <p className="text-sm text-slate-400 mt-2">Rating</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < (supplier.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Products</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <Package className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-emerald-950 to-slate-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-emerald-400">Available</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.available}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-purple-950 to-slate-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-purple-400">Primary Supplier</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.primaryCount}</p>
              </div>
              <Star className="h-5 w-5 text-purple-400 fill-purple-400" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Catalog Value</p>
                <p className="text-2xl font-bold text-white mt-1">${stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Product Catalog</h2>
          </div>
          {supplierProducts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-slate-700 mb-4" />
              <p className="text-slate-400 mb-4">No products added yet</p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Supplier SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Min Qty</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Lead Time</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {supplierProducts.map((sp) => (
                    <tr key={sp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{sp.product?.name}</p>
                          <p className="text-sm text-slate-400">
                            SKU: {sp.product?.sku} • {sp.product?.category?.name}
                          </p>
                          {sp.isPrimarySupplier && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-purple-900/40 text-purple-300 border border-purple-700">
                              <Star className="h-3 w-3 fill-purple-300" />
                              Primary
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{sp.supplierSku || '-'}</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-400">
                        ${Number(sp.supplierPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-300">{sp.minOrderQty}</td>
                      <td className="px-6 py-4 text-center text-slate-300">
                        {sp.leadTimeDays ? `${sp.leadTimeDays} days` : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            sp.isAvailable
                              ? 'bg-emerald-900/40 text-emerald-200 border-emerald-700'
                              : 'bg-red-900/40 text-red-200 border-red-700'
                          }`}
                        >
                          {sp.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(sp)
                              setIsEditDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(sp.id, sp.product?.name || '')}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Product Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) setSelectedProductId('')
        }}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-50">
            <DialogHeader>
              <DialogTitle>Add Product to Supplier</DialogTitle>
              <DialogDescription className="text-slate-400">
                Select a product and configure supplier-specific details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <Label htmlFor="productId">Product *</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="w-full mt-1.5 bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {availableProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()} className="text-slate-100 focus:bg-slate-800">
                        {p.name} ({p.sku}) - ${p.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierPrice">Supplier Price *</Label>
                  <Input
                    id="supplierPrice"
                    name="supplierPrice"
                    type="number"
                    step="0.01"
                    required
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="supplierSku">Supplier SKU</Label>
                  <Input
                    id="supplierSku"
                    name="supplierSku"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrderQty">Min Order Qty</Label>
                  <Input
                    id="minOrderQty"
                    name="minOrderQty"
                    type="number"
                    defaultValue={1}
                    min={1}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="leadTimeDays">Lead Time (days)</Label>
                  <Input
                    id="leadTimeDays"
                    name="leadTimeDays"
                    type="number"
                    min={0}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    defaultChecked
                    className="rounded border-slate-700 bg-slate-800"
                  />
                  <span className="text-sm text-slate-300">Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPrimarySupplier"
                    className="rounded border-slate-700 bg-slate-800"
                  />
                  <span className="text-sm text-slate-300">Primary Supplier</span>
                </label>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full mt-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Add Product
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-50">
            <DialogHeader>
              <DialogTitle>Edit Product Details</DialogTitle>
              <DialogDescription className="text-slate-400">
                Update supplier-specific information for {selectedProduct?.product?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-supplierPrice">Supplier Price *</Label>
                  <Input
                    id="edit-supplierPrice"
                    name="supplierPrice"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={selectedProduct?.supplierPrice}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-supplierSku">Supplier SKU</Label>
                  <Input
                    id="edit-supplierSku"
                    name="supplierSku"
                    defaultValue={selectedProduct?.supplierSku || ''}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-minOrderQty">Min Order Qty</Label>
                  <Input
                    id="edit-minOrderQty"
                    name="minOrderQty"
                    type="number"
                    min={1}
                    defaultValue={selectedProduct?.minOrderQty}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-leadTimeDays">Lead Time (days)</Label>
                  <Input
                    id="edit-leadTimeDays"
                    name="leadTimeDays"
                    type="number"
                    min={0}
                    defaultValue={selectedProduct?.leadTimeDays || ''}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stockQuantity">Stock Qty</Label>
                  <Input
                    id="edit-stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min={0}
                    defaultValue={selectedProduct?.stockQuantity || ''}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    defaultChecked={selectedProduct?.isAvailable}
                    className="rounded border-slate-700 bg-slate-800"
                  />
                  <span className="text-sm text-slate-300">Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPrimarySupplier"
                    defaultChecked={selectedProduct?.isPrimarySupplier}
                    className="rounded border-slate-700 bg-slate-800"
                  />
                  <span className="text-sm text-slate-300">Primary Supplier</span>
                </label>
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <textarea
                  id="edit-notes"
                  name="notes"
                  rows={3}
                  defaultValue={selectedProduct?.notes || ''}
                  className="w-full mt-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedProduct(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
