'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { getSaleByInvoice, type Sale } from '@/lib/api/sales'
import { Button } from '@/components/ui/button'

function formatMoney(v: string | number) {
  const num = typeof v === 'number' ? v : parseFloat(v)
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

export default function InvoicePage() {
  const params = useParams()
  const invoice = String(params?.invoice || '')
  const [sale, setSale] = React.useState<Sale | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await getSaleByInvoice(invoice)
        setSale(res)
      } catch (err: any) {
        setError(err?.message || 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }
    if (invoice) load()
  }, [invoice])

  const printInvoice = () => {
    window.print()
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl bg-white text-black p-6 print:p-0">
        {loading ? (
          <p>Loading invoice...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : sale ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Invoice</h1>
                <p className="text-sm">Invoice No: {sale.invoiceNumber}</p>
                <p className="text-sm">Date: {new Date(sale.createdAt).toLocaleString()}</p>
              </div>
              <Button onClick={printInvoice} className="print:hidden">Print</Button>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm">Customer: {sale.customerName || 'Walk-in'}</p>
              <p className="text-sm">Payment: {sale.paymentMethod}</p>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((it) => (
                  <tr key={it.id} className="border-b">
                    <td className="py-2">{it.product?.name || `#${it.productId}`}</td>
                    <td className="py-2 text-right">{it.quantity}</td>
                    <td className="py-2 text-right">${formatMoney(it.unitPrice)}</td>
                    <td className="py-2 text-right">${formatMoney(it.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ml-auto w-64 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${formatMoney(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${formatMoney(sale.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-${formatMoney(sale.discountAmount)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>${formatMoney(sale.totalAmount)}</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-600">Thank you for your purchase!</p>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  )
}
