"use client"

import React, { ComponentType, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: string
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
  errorInfo?: string
}

// Enhanced Error Fallback Component
export function ErrorFallback({ error, resetError, errorInfo }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-100">Something went wrong</h2>
          <p className="text-sm text-slate-400">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left bg-slate-800 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-300 mb-2">
              <Bug className="inline h-4 w-4 mr-1" />
              Technical Details
            </summary>
            <pre className="text-xs text-red-400 whitespace-pre-wrap break-words">
              {error.name}: {error.message}
              {errorInfo && `\n\n${errorInfo}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={resetError}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

// Error Boundary Class Component
export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ComponentType<ErrorFallbackProps> },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ComponentType<ErrorFallbackProps> }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || undefined
    })
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // reportError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: undefined })}
          errorInfo={this.state.errorInfo}
        />
      )
    }

    return this.props.children
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    setError(errorObj)
    console.error('Error handled:', errorObj)
  }, [])

  return {
    error,
    handleError,
    resetError,
    hasError: error !== null
  }
}