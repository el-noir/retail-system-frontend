'use client'

import React from 'react'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import AdminSidebar from '@/components/AdminSidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCategory, deleteCategory, getCategories, type Category, updateCategory } from '@/lib/api/categories'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

export default function CategoriesPage() {
  const router = useRouter()
  const { token, clearToken } = useAuth()

  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null)

  const userInfo = React.useMemo(() => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''))
      return {
        email: payload?.email as string | undefined,
        role: (payload?.role as string | undefined)?.toUpperCase(),
      }
    } catch (error) {
      console.warn('Failed to parse token payload', error)
      return null
    }
  }, [token])

  const isAdminOrManager = userInfo?.role === 'ADMIN' || userInfo?.role === 'MANAGER'

  React.useEffect(() => {
    if (!token) return
    if (!isAdminOrManager) {
      router.replace('/dashboard/cashier')
    }
  }, [isAdminOrManager, router, token])

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const data = await getCategories(100, 0)
        setCategories(data)
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleAddClick = () => {
    setEditingCategory(null)
    setNewCategoryName('')
    setIsModalOpen(true)
  }

  const handleEditClick = (category: Category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (id: number) => {
    if (!isAdminOrManager) return
    if (!confirm('Are you sure you want to delete this category?')) return

    setIsDeleting(id)
    try {
      await deleteCategory(id)
      setCategories(categories.filter((c) => c.id !== id))
      toast.success('Category deleted successfully')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete category')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, newCategoryName)
        setCategories(categories.map((c) => (c.id === updated.id ? updated : c)))
        toast.success('Category updated successfully')
      } else {
        const created = await createCategory(newCategoryName)
        setCategories([created, ...categories])
        toast.success('Category created successfully')
      }
      setIsModalOpen(false)
      setNewCategoryName('')
      setEditingCategory(null)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = React.useCallback(() => {
    clearToken()
    router.push('/sign-in')
  }, [clearToken, router])

  const filteredCategories = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [categories, search])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="grid grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8 lg:gap-8">
          <AdminSidebar
            userEmail={userInfo?.email}
            userRole={userInfo?.role}
            onSignOut={handleSignOut}
          />

          <div className="space-y-8 lg:col-span-9 col-span-1 md:col-span-2">
            {/* Header */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Inventory</p>
                <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">Categories</h1>
                <p className="text-sm text-slate-300">Manage product categories.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-slate-950">
                    {categories.length}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Total categories</p>
                    <p className="text-sm font-medium text-white">Updated live</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Add Category Button */}
            <Button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2 font-semibold text-white hover:from-emerald-600 hover:to-emerald-700 transition-all"
            >
              <Plus className="h-5 w-5" />
              Add category
            </Button>

            {/* Search Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none sm:w-64"
              />
            </div>

            {/* Categories Table */}
            {isLoading ? (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-8 text-center">
                <p className="text-slate-400">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-8 text-center">
                <p className="text-slate-400">
                  {search ? 'No categories found matching your search.' : 'No categories yet. Create one to get started.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-700/50 bg-slate-900/50">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-900/80">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredCategories.map((category, index) => (
                      <tr
                        key={category.id}
                        className={`transition-colors hover:bg-slate-800/50 ${
                          index % 2 === 0 ? 'bg-slate-950/30' : 'bg-slate-900/20'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-100">{category.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(category.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(category)}
                              className="rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-emerald-400"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(category.id)}
                              disabled={isDeleting === category.id}
                              className="rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-red-400 disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-slate-900 border border-slate-700 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingCategory(null)
                  setNewCategoryName('')
                }}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-medium text-slate-200 transition hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategory}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 font-medium text-white transition hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
