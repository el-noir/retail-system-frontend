'use client'

import React from 'react'
import { toast } from 'sonner'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getLowStockProducts, type LowStockProduct } from '@/lib/api/inventory'
import { getProducts, type Product } from '@/lib/api/products'
import { createSale, type CreateSalePayload } from '@/lib/api/sales'
import { useAuth } from '@/lib/auth/auth-context'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback'

type CartItem = {
  product: Product
  quantity: number
}

export default function CashierDashboardPage() {
  const { token } = useAuth()
  const [products, setProducts] = React.useState<Product[]>([])
  const [lowStock, setLowStock] = React.useState<LowStockProduct[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [search, setSearch] = React.useState('')
  const [customerName, setCustomerName] = React.useState('')
  const [customerPhone, setCustomerPhone] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'card'>('cash')
  const [taxAmount, setTaxAmount] = React.useState(0)
  const [discountAmount, setDiscountAmount] = React.useState(0)
  const [checkingOut, setCheckingOut] = React.useState(false)

  const role = React.useMemo(() => {
    if (!token) return 'UNKNOWN'
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''))
      return (payload?.role as string | undefined)?.toUpperCase() ?? 'UNKNOWN'
    } catch (error) {
      console.warn('Failed to parse token payload', error)
      return 'UNKNOWN'
    }
  }, [token])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const productsData = await getProducts(100, 0)
        setProducts(productsData)

        try {
          const low = await getLowStockProducts(10, 10, 0)
          setLowStock(low.products)
        } catch (error) {
          console.warn('Failed to fetch low stock list', error)
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatPrice = (value: unknown) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  const stockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of stock', className: 'bg-red-900/40 text-red-200 border-red-700' }
    if (stock <= 10) return { label: 'Low stock', className: 'bg-amber-900/30 text-amber-100 border-amber-700' }
    return { label: 'In stock', className: 'bg-emerald-900/30 text-emerald-100 border-emerald-700' }
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.product.id === product.id)
      if (existing) {
        return prev.map((ci) =>
          ci.product.id === product.id
            ? { ...ci, quantity: Math.min(ci.quantity + 1, product.stock) }
            : ci,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((ci) => ci.product.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prev) =>
      prev.map((ci) =>
        ci.product.id === productId
          ? { ...ci, quantity: Math.max(1, Math.min(quantity, ci.product.stock)) }
          : ci,
      ),
    )
  }

  const debouncedSetTax = useDebouncedCallback((value: number) => {
    setTaxAmount(value)
  }, 300)

  const debouncedSetDiscount = useDebouncedCallback((value: number) => {
    setDiscountAmount(value)
  }, 300)

  const subtotal = cart.reduce((sum, ci) => sum + Number(ci.product.price) * ci.quantity, 0)
  const total = subtotal + (taxAmount || 0) - (discountAmount || 0)

  const debouncedSearch = useDebounce(search, 300)

  const filteredProducts = React.useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku?.toLowerCase().includes(q)) ||
      (p.category?.name?.toLowerCase().includes(q))
    )
  }, [products, debouncedSearch])

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error('Add items to the cart before checkout')
      return
    }

    const payload: CreateSalePayload = {
      items: cart.map((ci) => ({ productId: ci.product.id, quantity: ci.quantity })),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      taxAmount: taxAmount || 0,
      discountAmount: discountAmount || 0,
      paymentMethod,
    }

    try {
      setCheckingOut(true)
      const sale = await createSale(payload)
      toast.success(`Sale complete. Invoice: ${sale.invoiceNumber}`)
      // Reset cart
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setTaxAmount(0)
      setDiscountAmount(0)
      // Refresh products to get updated stock
      const updated = await getProducts(100, 0)
      setProducts(updated)
      // Offer quick access to invoice
      // navigate user to receipt view in new tab
      window.open(`/sales/${sale.invoiceNumber}`, '_blank')
    } catch (error: any) {
      toast.error(error?.message || 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Point of sale</p>
              <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">Cashier dashboard</h1>
              <p className="text-sm text-slate-300">Role: {role}</p>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center bg-emerald-600 text-sm font-semibold text-slate-950">{products.length}</div>
              <div>
                <p className="text-xs font-medium text-slate-400">Products available</p>
                <p className="text-sm font-medium text-white">Ready to sell</p>
              </div>
            </div>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr,1fr]">
            {isLoading ? (
              <div className="rounded-md border border-slate-800 bg-slate-900 p-6 text-slate-300">Loading products...</div>
            ) : (
              <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Products</h2>
                    <p className="text-sm text-slate-400">Sell only — no edits</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200">
                    <span className="font-semibold">Cart items:</span>
                    <span className="rounded-sm bg-slate-800 px-2 py-1 text-xs font-semibold text-emerald-200">{cart.length}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Input
                    placeholder="Search products, SKU or category"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-96 rounded-sm border-slate-700 bg-slate-900 text-slate-100"
                  />
                  <div className="text-sm text-slate-400">
                    Showing {filteredProducts.length} of {products.length}
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-slate-800 bg-slate-900">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, idx) => {
                        const status = stockStatus(product.stock)
                        const isOut = product.stock === 0
                        return (
                          <tr key={product.id} className={idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-950'}>
                            <td className="px-4 py-3 align-middle">
                              <div className="space-y-1">
                                <p className="font-semibold text-white">{product.name}</p>
                                <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-middle text-slate-300">{product.category?.name ?? 'Uncategorized'}</td>
                            <td className="px-4 py-3 align-middle text-right">
                              <span className="rounded-sm bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-100">{product.stock}</span>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <span className={`inline-flex rounded-sm border px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                            </td>
                            <td className="px-4 py-3 align-middle text-right font-mono text-emerald-300">${formatPrice(product.price)}</td>
                            <td className="px-4 py-3 align-middle text-right">
                              <Button
                                size="sm"
                                className="rounded-sm border border-emerald-600 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => addToCart(product)}
                                disabled={isOut}
                              >
                                {isOut ? 'Unavailable' : 'Add to bill'}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-center text-slate-400" colSpan={6}>
                            No products match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <aside className="rounded-md border border-slate-800 bg-slate-900 p-4">
              <h2 className="mb-3 text-lg font-semibold text-white">Current bill</h2>
              {cart.length === 0 ? (
                <p className="text-sm text-slate-400">No items added yet.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((ci) => (
                    <div key={ci.product.id} className="flex items-center justify-between rounded-sm border border-slate-800 bg-slate-950 p-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-white">{ci.product.name}</p>
                        <p className="text-xs text-slate-400">${formatPrice(ci.product.price)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={ci.product.stock}
                          value={ci.quantity}
                          onChange={(e) => updateQuantity(ci.product.id, parseInt(e.target.value || '1', 10))}
                          className="h-8 w-16 rounded-sm border-slate-700 bg-slate-900 text-slate-100"
                        />
                        <Button
                          variant="ghost"
                          className="h-8 rounded-sm border border-red-600/70 bg-slate-900 px-2 text-xs text-red-200 hover:bg-red-900"
                          onClick={() => removeFromCart(ci.product.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Subtotal</span>
                      <span className="font-mono text-emerald-300">${formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Tax</span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={taxAmount}
                        onChange={(e) => debouncedSetTax(parseFloat(e.target.value || '0'))}
                        className="h-8 w-24 rounded-sm border-slate-700 bg-slate-900 text-right font-mono text-slate-100"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Discount</span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={discountAmount}
                        onChange={(e) => debouncedSetDiscount(parseFloat(e.target.value || '0'))}
                        className="h-8 w-24 rounded-sm border-slate-700 bg-slate-900 text-right font-mono text-slate-100"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-slate-200">Total</span>
                      <span className="font-mono text-emerald-300">${formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Customer name (optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="rounded-sm border-slate-700 bg-slate-900 text-slate-100"
                    />
                    <Input
                      placeholder="Customer phone (optional)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="rounded-sm border-slate-700 bg-slate-900 text-slate-100"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Button
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      className="rounded-sm border border-emerald-600 bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
                      onClick={() => setPaymentMethod('cash')}
                    >
                      Cash
                    </Button>
                    <Button
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      className="rounded-sm border border-blue-600 bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                      onClick={() => setPaymentMethod('card')}
                    >
                      Card
                    </Button>
                  </div>

                  <Button
                    className="mt-3 w-full rounded-sm border border-emerald-600 bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    onClick={checkout}
                    disabled={checkingOut}
                  >
                    {checkingOut ? 'Processing…' : 'Checkout'}
                  </Button>
                </div>
              )}
            </aside>

            {lowStock.length > 0 && (
              <section className="rounded-md border border-amber-700/40 bg-amber-950/40 p-6 lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-amber-50">Heads up: Low stock</h2>
                  <span className="rounded-sm bg-amber-700 px-2 py-1 text-xs font-semibold text-amber-50">{lowStock.length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {lowStock.map((item) => (
                    <div key={item.id} className="rounded-sm border border-amber-700/50 bg-amber-900/30 p-4">
                      <p className="text-sm font-semibold text-amber-50">{item.name}</p>
                      <p className="text-xs text-amber-200/80">SKU: {item.sku}</p>
                      <p className="text-xs text-amber-200/80">Stock: {item.stock}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
