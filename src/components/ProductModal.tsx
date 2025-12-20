'use client'

import React from 'react'
import { ProductForm } from './ProductForm'
import { type Product } from '@/lib/api/products'
import { type Category } from '@/lib/api/categories'

type ProductModalProps = {
  isOpen: boolean
  product?: Product
  categories: Category[]
  onClose: () => void
  onSuccess: (product: Product) => void
}

export function ProductModal({ isOpen, product, categories, onClose, onSuccess }: ProductModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-md border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            {product ? 'Update product details' : 'Create a new product in your inventory'}
          </p>
        </div>

        <ProductForm
          product={product}
          categories={categories}
          onSuccess={(result) => {
            onSuccess(result)
            onClose()
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
