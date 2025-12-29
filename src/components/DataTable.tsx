"use client"

import React, { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, MoreHorizontal, Trash2, Edit, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/Toast'

export interface Column<T = any> {
  key: string
  title: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface BulkAction<T = any> {
  key: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive'
  action: (selectedItems: T[]) => Promise<void>
  confirmMessage?: string
}

interface DataTableProps<T = any> {
  data: T[]
  columns: Column<T>[]
  keyField: string
  loading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    pageSize: number
    totalItems: number
  }
  bulkActions?: BulkAction<T>[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  className?: string
  emptyState?: React.ReactNode
}

export function DataTable<T = any>({
  data,
  columns,
  keyField,
  loading = false,
  pagination,
  bulkActions = [],
  onSort,
  sortBy,
  sortDirection,
  className = "",
  emptyState
}: DataTableProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const allSelected = selectedItems.size === data.length && data.length > 0
  const someSelected = selectedItems.size > 0 && selectedItems.size < data.length

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(data.map(item => (item as any)[keyField])))
    } else {
      setSelectedItems(new Set())
    }
  }, [data, keyField])

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev)
      if (checked) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
      return newSelected
    })
  }, [])

  const handleSort = useCallback((column: string) => {
    if (!onSort) return
    
    const direction = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column, direction)
  }, [onSort, sortBy, sortDirection])

  const handleBulkAction = useCallback(async (action: BulkAction<T>) => {
    const selectedData = data.filter(item => selectedItems.has((item as any)[keyField]))
    
    if (action.confirmMessage && !confirm(action.confirmMessage)) {
      return
    }

    try {
      await action.action(selectedData)
      setSelectedItems(new Set())
      toast.success(`${action.label} completed successfully`, `Applied to ${selectedData.length} items`)
    } catch (error) {
      toast.error(`${action.label} failed`, error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }, [data, selectedItems, keyField, toast])

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Table skeleton */}
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-800 p-4">
            <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-slate-700 p-4">
              <div className="flex gap-4">
                {columns.map((_, j) => (
                  <div key={j} className="h-4 bg-slate-800 rounded animate-pulse flex-1"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="border border-slate-700 rounded-lg p-8 text-center">
        {emptyState || (
          <div className="text-slate-400">
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm mt-1">There are no items to display at this time.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
          <span className="text-sm text-slate-300">
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            {bulkActions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant || 'default'}
                size="sm"
                onClick={() => handleBulkAction(action)}
                className="flex items-center gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                {bulkActions.length > 0 && (
                  <th className="w-12 p-4">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      ref={(ref) => {
                        if (ref && 'indeterminate' in ref) {
                          (ref as any).indeterminate = someSelected
                        }
                      }}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`p-4 text-left font-medium text-slate-300 ${
                      column.sortable ? 'cursor-pointer hover:text-slate-100' : ''
                    } ${column.width ? `w-[${column.width}]` : ''}`}
                    style={{ textAlign: column.align || 'left' }}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
                <th className="w-12 p-4"></th> {/* Actions column */}
              </tr>
            </thead>
            <tbody className="bg-slate-900">
              {data.map((item, index) => (
                <tr
                  key={(item as any)[keyField]}
                  className={`border-t border-slate-700 hover:bg-slate-800/50 transition-colors ${
                    selectedItems.has((item as any)[keyField]) ? 'bg-emerald-900/20' : ''
                  }`}
                >
                  {bulkActions.length > 0 && (
                    <td className="p-4">
                      <Checkbox
                        checked={selectedItems.has((item as any)[keyField])}
                        onCheckedChange={(checked) => 
                          handleSelectItem((item as any)[keyField], checked as boolean)
                        }
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="p-4 text-slate-100"
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.render 
                        ? column.render((item as any)[column.key], item)
                        : (item as any)[column.key]
                      }
                    </td>
                  ))}
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = Math.max(1, pagination.currentPage - 2) + i
              if (pageNum > pagination.totalPages) return null
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => pagination.onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}