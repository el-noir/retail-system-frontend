'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Package, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback'
import { ProductFilters } from '@/lib/api/products'

export type ProductCategory = {
  id: number
  name: string
  productCount: number
}

type ProductFiltersComponentProps = {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  categories: ProductCategory[]
  isLoading?: boolean
  totalProducts?: number
  className?: string
}

export function ProductFiltersComponent({
  filters,
  onFiltersChange,
  categories,
  isLoading,
  totalProducts,
  className = '',
}: ProductFiltersComponentProps) {
  const [localSearchValue, setLocalSearchValue] = useState(filters.search || '')

  // Debounced search function that updates filters after 300ms delay
  const debouncedSearch = useDebouncedCallback((search: string) => {
    onFiltersChange({ ...filters, search: search.trim() || undefined })
  }, 300)

  const handleSearchChange = (search: string) => {
    setLocalSearchValue(search)
    debouncedSearch(search)
  }

  // Update local search value when filters change externally (e.g., clear filters)
  useEffect(() => {
    setLocalSearchValue(filters.search || '')
  }, [filters.search])

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      ...filters,
      categoryId: categoryId === 'all' ? undefined : parseInt(categoryId, 10),
    })
  }

  const handleStockFilterChange = (stockFilter: string) => {
    let inStock: boolean | undefined
    if (stockFilter === 'in-stock') inStock = true
    else if (stockFilter === 'out-of-stock') inStock = false
    else inStock = undefined

    onFiltersChange({ ...filters, inStock })
  }

  const clearFilters = () => {
    setLocalSearchValue('')
    onFiltersChange({})
  }

  const hasActiveFilters = !!(filters.categoryId || filters.search || filters.inStock !== undefined)

  const activeFiltersCount = [
    filters.categoryId,
    filters.search,
    filters.inStock !== undefined,
  ].filter(Boolean).length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search products, SKU, or description..."
            value={localSearchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-slate-100"
            disabled={isLoading}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <Select
            value={filters.categoryId?.toString() || 'all'}
            onValueChange={handleCategoryChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-48 bg-slate-900 border-slate-700 text-slate-100">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-slate-100">
                All Categories ({categories.reduce((sum, cat) => sum + cat.productCount, 0)})
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()} className="text-slate-100">
                  {category.name} ({category.productCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stock Filter */}
          <Select
            value={
              filters.inStock === true
                ? 'in-stock'
                : filters.inStock === false
                ? 'out-of-stock'
                : 'all'
            }
            onValueChange={handleStockFilterChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-slate-100">
              <SelectValue placeholder="All Stock" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  All Stock
                </div>
              </SelectItem>
              <SelectItem value="in-stock" className="text-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-500" />
                  In Stock
                </div>
              </SelectItem>
              <SelectItem value="out-of-stock" className="text-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Out of Stock
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              disabled={isLoading}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters & Results Count */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Filter className="h-4 w-4" />
              Active filters:
            </div>
            {filters.categoryId && (
              <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                Category: {categories.find(c => c.id === filters.categoryId)?.name}
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                Search: "{filters.search}"
              </Badge>
            )}
            {filters.inStock === true && (
              <Badge variant="secondary" className="bg-green-900 text-green-200">
                In Stock
              </Badge>
            )}
            {filters.inStock === false && (
              <Badge variant="secondary" className="bg-red-900 text-red-200">
                Out of Stock
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        {totalProducts !== undefined && (
          <div className="text-sm text-slate-400">
            {hasActiveFilters ? (
              <>Showing {totalProducts} filtered product{totalProducts !== 1 ? 's' : ''}</>
            ) : (
              <>{totalProducts} product{totalProducts !== 1 ? 's' : ''} total</>
            )}
          </div>
        )}
      </div>
    </div>
  )
}