'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronDown, Package, Layers, BarChart3, Settings, LogOut, User, Home, Menu, X } from 'lucide-react'

import { Button } from './ui/button'

type SidebarSection = {
  label: string
  icon?: React.ReactNode
  items: Array<{
    label: string
    icon?: React.ReactNode
    href?: string
    action?: () => void
  }>
}

interface AdminSidebarProps {
  userEmail?: string
  userRole?: string
  onSignOut: () => void
}

export default function AdminSidebar({ userEmail, userRole, onSignOut }: AdminSidebarProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    inventory: true,
    sales: false,
  })
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const toggle = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const sections: SidebarSection[] = [
    {
      label: 'MAIN',
      items: [
        { label: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/dashboard/admin' },
      ],
    },
    {
      label: 'INVENTORY',
      icon: <Package className="h-4 w-4" />,
      items: [
        { label: 'Products', icon: <Package className="h-4 w-4" />, href: '/dashboard/admin' },
        { label: 'Categories', icon: <Layers className="h-4 w-4" />, href: '/dashboard/admin/categories' },
      ],
    },
    {
      label: 'PROCUREMENT',
      icon: <Package className="h-4 w-4" />,
      items: [
        { label: 'Purchase Orders', icon: <Package className="h-4 w-4" />, href: '/dashboard/purchase-orders' },
        { label: 'Suppliers', icon: <User className="h-4 w-4" />, href: '/dashboard/suppliers' },
        { label: 'Restock Recommendations', icon: <BarChart3 className="h-4 w-4" />, href: '/dashboard/restock-recommendations' },
      ],
    },
    {
      label: 'ANALYTICS',
      icon: <BarChart3 className="h-4 w-4" />,
      items: [
        { label: 'Dashboard Overview', icon: <Home className="h-4 w-4" />, href: '/dashboard/analytics' },
        { label: 'Sales Analytics', icon: <BarChart3 className="h-4 w-4" />, href: '/dashboard/analytics/sales' },
        { label: 'Purchase Analytics', icon: <Package className="h-4 w-4" />, href: '/dashboard/analytics/purchases' },
        { label: 'Inventory Analytics', icon: <Layers className="h-4 w-4" />, href: '/dashboard/analytics/inventory' },
        { label: 'Profit Analytics', icon: <BarChart3 className="h-4 w-4" />, href: '/dashboard/analytics/profit' },
      ],
    },
    {
      label: 'SETTINGS',
      icon: <Settings className="h-4 w-4" />,
      items: [
        { label: 'Admin Settings', icon: <Settings className="h-4 w-4" /> },
      ],
    },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:col-span-3 lg:h-fit lg:sticky lg:top-8">
        <div className="rounded-lg border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="flex items-center gap-2 px-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Store Master</p>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            {sections.map((section) => {
              const isExpanded = expanded[section.label.toLowerCase()]
              const isCollapsible = section.items.length > 1 || section.label !== 'MAIN'

              return (
                <div key={section.label}>
                  {isCollapsible && section.label !== 'MAIN' ? (
                    <button
                      onClick={() => toggle(section.label.toLowerCase())}
                      className="w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:bg-slate-800/60 hover:text-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <span>{section.label}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  ) : (
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {section.label}
                    </div>
                  )}

                  {(isExpanded || section.label === 'MAIN') && (
                    <div className={`space-y-1 pl-0 overflow-hidden transition-all duration-200 ${isExpanded ? 'mt-1' : ''}`}>
                      {section.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href || '#'}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 transition-all hover:bg-slate-800/60 hover:text-emerald-400"
                        >
                          {item.icon && <span className="text-slate-400">{item.icon}</span>}
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="my-6 h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

          {/* User Info */}
          <div className="space-y-4">
            <div className="rounded-md bg-slate-800/30 p-4 border border-slate-700/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Account</p>
              <p className="text-sm font-medium text-slate-100 truncate">{userEmail ?? 'User'}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  {userRole ?? 'UNKNOWN'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800/40 px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800/60 hover:text-white"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Button
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-md border border-red-900/50 bg-red-950/30 px-4 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-950/60 hover:border-red-700 hover:text-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Toggle */}
      <div className="lg:hidden col-span-1 md:col-span-2">
        <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900 p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Store Master</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 hover:bg-slate-800"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="mt-3 rounded-lg border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-lg">
            {/* Navigation */}
            <nav className="space-y-3 mb-6">
              {sections.map((section) => {
                const isExpanded = expanded[section.label.toLowerCase()]
                const isCollapsible = section.items.length > 1 || section.label !== 'MAIN'

                return (
                  <div key={section.label}>
                    {isCollapsible && section.label !== 'MAIN' ? (
                      <button
                        onClick={() => toggle(section.label.toLowerCase())}
                        className="w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:bg-slate-800/60 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <span>{section.label}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    ) : (
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {section.label}
                      </div>
                    )}

                    {(isExpanded || section.label === 'MAIN') && (
                      <div className="space-y-1 pl-0 mt-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href || '#'}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 transition-all hover:bg-slate-800/60 hover:text-emerald-400"
                          >
                            {item.icon && <span className="text-slate-400">{item.icon}</span>}
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Divider */}
            <div className="my-4 h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

            {/* User Info */}
            <div className="space-y-3">
              <div className="rounded-md bg-slate-800/30 p-4 border border-slate-700/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Account</p>
                <p className="text-sm font-medium text-slate-100">{userEmail ?? 'User'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    {userRole ?? 'UNKNOWN'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800/40 px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800/60"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Button
                  onClick={onSignOut}
                  className="w-full flex items-center justify-center gap-2 rounded-md border border-red-900/50 bg-red-950/30 px-4 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-950/60 hover:border-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

