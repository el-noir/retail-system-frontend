"use client"

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction = 
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string }

const ToastContext = createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
} | null>(null)

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { ...action.payload, id: Math.random().toString(36).slice(2) }]
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      }
    default:
      return state
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] })

  const addToast = (toast: Omit<Toast, 'id'>) => {
    dispatch({ type: 'ADD_TOAST', payload: toast })
  }

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id })
  }

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast, removeToast } = context

  return {
    toast: {
      success: (title: string, description?: string, options?: Partial<Toast>) =>
        addToast({ type: 'success', title, description, duration: 4000, ...options }),
      error: (title: string, description?: string, options?: Partial<Toast>) =>
        addToast({ type: 'error', title, description, duration: 6000, ...options }),
      warning: (title: string, description?: string, options?: Partial<Toast>) =>
        addToast({ type: 'warning', title, description, duration: 5000, ...options }),
      info: (title: string, description?: string, options?: Partial<Toast>) =>
        addToast({ type: 'info', title, description, duration: 4000, ...options }),
    },
    dismiss: removeToast
  }
}

function ToastContainer() {
  const context = useContext(ToastContext)
  if (!context) return null

  const { toasts, removeToast } = context

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.duration, toast.id, onRemove])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const styles = {
    success: 'bg-emerald-900/90 border-emerald-700 text-emerald-100',
    error: 'bg-red-900/90 border-red-700 text-red-100',
    warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
    info: 'bg-blue-900/90 border-blue-700 text-blue-100'
  }

  const Icon = icons[toast.type]

  return (
    <div className={`relative rounded-lg border p-4 shadow-lg backdrop-blur-sm transform transition-all duration-300 ease-in-out animate-in slide-in-from-right-full ${styles[toast.type]}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-90 mt-1">{toast.description}</div>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium underline mt-2 hover:no-underline transition-all"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="shrink-0 rounded-md p-1 hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}