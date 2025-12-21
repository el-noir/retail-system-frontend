'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth/auth-context'

export default function DashboardRouterPage() {
  const router = useRouter()
  const { token } = useAuth()

  const role = React.useMemo(() => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''))
      return payload?.role as string | null
    } catch (error) {
      console.warn('Failed to parse token payload', error)
      return null
    }
  }, [token])

  React.useEffect(() => {
    if (!token) {
      router.replace('/sign-in')
      return
    }

    if (!role) return

    const normalizedRole = role.toUpperCase()
    if (normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER') {
      router.replace('/dashboard/admin')
    } else {
      router.replace('/dashboard/cashier')
    }
  }, [role, router, token])

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="space-y-2 text-center">
          <p className="text-sm text-slate-400">Checking your role</p>
          <p className="text-lg font-semibold">Routing you to the right dashboard...</p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
