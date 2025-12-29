"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Search, Filter, X, SortAsc, SortDesc, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface FilterOption {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number' | 'boolean'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

export interface SortOption {
  key: string
  label: string
}

interface SearchAndFilterProps {
  onSearch: (query: string) => void
  onFilter: (filters: Record<string, any>) => void
  onSort: (sortBy: string, direction: 'asc' | 'desc') => void
  filterOptions?: FilterOption[]
  sortOptions?: SortOption[]
  placeholder?: string
  className?: string
  showFilterCount?: boolean
}

export function SearchAndFilter({
  onSearch,
  onFilter,
  onSort,
  filterOptions = [],
  sortOptions = [],
  placeholder = "Search...",
  className = "",
  showFilterCount = true
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortBy, setSortBy] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  // Apply filters when they change
  useEffect(() => {
    onFilter(filters)
  }, [filters, onFilter])

  // Apply sort when it changes
  useEffect(() => {
    if (sortBy) {
      onSort(sortBy, sortDirection)
    }
  }, [sortBy, sortDirection, onSort])

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({})
  }, [])

  const activeFilterCount = Object.keys(filters).length

  const handleSortToggle = (key: string) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortDirection('asc')
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-700"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Button */}
        {filterOptions.length > 0 && (
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {showFilterCount && activeFilterCount > 0 && (
                  <span className="bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  Filter Options
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-slate-400 hover:text-slate-100"
                    >
                      Clear All
                    </Button>
                  )}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {filterOptions.map((option) => (
                  <div key={option.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={option.key} className="text-sm font-medium">
                        {option.label}
                      </Label>
                      {filters[option.key] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter(option.key)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {option.type === 'select' && option.options && (
                      <Select
                        value={filters[option.key] || ''}
                        onValueChange={(value) => handleFilterChange(option.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={option.placeholder || `Select ${option.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {option.type === 'text' && (
                      <Input
                        id={option.key}
                        type="text"
                        placeholder={option.placeholder}
                        value={filters[option.key] || ''}
                        onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      />
                    )}

                    {option.type === 'number' && (
                      <Input
                        id={option.key}
                        type="number"
                        placeholder={option.placeholder}
                        value={filters[option.key] || ''}
                        onChange={(e) => handleFilterChange(option.key, parseFloat(e.target.value) || '')}
                      />
                    )}

                    {option.type === 'date' && (
                      <Input
                        id={option.key}
                        type="date"
                        value={filters[option.key] || ''}
                        onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      />
                    )}

                    {option.type === 'boolean' && (
                      <Select
                        value={filters[option.key]?.toString() || ''}
                        onValueChange={(value) => handleFilterChange(option.key, value === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={option.placeholder || `Select ${option.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Sort Dropdown */}
        {sortOptions.length > 0 && (
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-auto min-w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  <div className="flex items-center gap-2">
                    {option.label}
                    {sortBy === option.key && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSortToggle(option.key)
                        }}
                      >
                        {sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                      </Button>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-slate-400">Active filters:</span>
          {Object.entries(filters).map(([key, value]) => {
            const option = filterOptions.find(opt => opt.key === key)
            if (!option || !value) return null
            
            return (
              <div
                key={key}
                className="flex items-center gap-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full"
              >
                <span>{option.label}: {value.toString()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter(key)}
                  className="h-4 w-4 p-0 hover:bg-emerald-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}