'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'
import { z as zod } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createProduct, updateProduct, type Product } from '@/lib/api/products'

const ProductSchema = zod.object({
  name: zod.string().min(1, 'Product name is required'),
  sku: zod.string().min(1, 'SKU is required'),
  description: zod.string().optional(),
  price: zod.number().positive('Price must be positive'),
  stock: zod.number().nonnegative('Stock cannot be negative'),
  categoryId: zod.number().positive('Category is required'),
})

type ProductFormData = z.infer<typeof ProductSchema>

type ProductFormProps = {
  product?: Product
  categories: Array<{ id: number; name: string }>
  onSuccess: (product: Product) => void
  onCancel: () => void
}

export function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      categoryId: product?.categoryId || 0,
    },
  })

  const { setError } = form

  const onSubmit = async (values: ProductFormData) => {
    setIsSubmitting(true)
    try {
      let result: Product
      if (product) {
        result = await updateProduct(product.id, values)
        toast.success('Product updated successfully')
      } else {
        result = await createProduct(values)
        toast.success('Product created successfully')
      }
      onSuccess(result)
    } catch (error: any) {
      const message = error?.message || 'Failed to save product'
      const lower = String(message).toLowerCase()

      if (lower.includes('already exists') && lower.includes('name')) {
        setError('name', { type: 'manual', message })
      } else if (lower.includes('already exists') && lower.includes('sku')) {
        setError('sku', { type: 'manual', message })
      } else {
        toast.error(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="SKU" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description (optional)" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition focus:border-emerald-400/40 focus:outline-none focus:bg-slate-700"
                >
                  <option value="" className="bg-slate-800 text-slate-100">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-800 text-slate-100">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
