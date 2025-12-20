'use client'

import React from 'react'

type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  hydrated: boolean
  setToken: (token: string) => void
  clearToken: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = React.useState<string | null>(null)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem('access_token')
    if (stored) {
      setTokenState(stored)
    }
    setHydrated(true)
  }, [])

  const setToken = React.useCallback((value: string) => {
    localStorage.setItem('access_token', value)
    setTokenState(value)
  }, [])

  const clearToken = React.useCallback(() => {
    localStorage.removeItem('access_token')
    setTokenState(null)
  }, [])

  const value = React.useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      hydrated,
      setToken,
      clearToken,
    }),
    [token, hydrated, setToken, clearToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
