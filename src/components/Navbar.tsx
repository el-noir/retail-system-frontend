'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

import { useAuth } from '@/lib/auth/auth-context'
import { Button } from './ui/button'

export default function Navbar() {
  const router = useRouter()
  const { isAuthenticated, clearToken } = useAuth()

  const handleSignOut = () => {
    clearToken()
    router.push('/sign-in')
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-500 text-slate-950 flex items-center justify-center text-sm font-bold">
            SM
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-slate-300">Store Master</p>
            <p className="text-sm font-medium text-slate-100">Inventory</p>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="hidden border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-emerald-500 hover:text-white sm:inline-flex"
              >
                <User className="mr-2 h-4 w-4" /> Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="hidden border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-red-500 hover:text-white sm:inline-flex"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/sign-up">
              <Button
                variant="ghost"
                className="hidden border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-emerald-500 hover:text-white sm:inline-flex"
              >
                Sign Up
              </Button>
            </Link>

            <Link href="/sign-in">
              <Button
                variant="outline"
                className="hidden border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-emerald-500 hover:text-white sm:inline-flex"
              >
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
