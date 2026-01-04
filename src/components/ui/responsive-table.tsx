import * as React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  minWidth?: string
}

export function ResponsiveTable({ 
  children, 
  className, 
  minWidth = "800px", 
  ...props 
}: ResponsiveTableProps) {
  return (
    <div 
      className={cn(
        "w-full border border-slate-800 rounded-lg overflow-hidden",
        className
      )} 
      {...props}
    >
      <div 
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
        style={{ minWidth }}
      >
        {children}
      </div>
    </div>
  )
}

interface MobileTableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function MobileTableCard({ 
  title, 
  subtitle, 
  actions, 
  children, 
  className, 
  ...props 
}: MobileTableCardProps) {
  return (
    <div 
      className={cn(
        "bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3",
        className
      )} 
      {...props}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <div className="space-y-2 text-sm">
        {children}
      </div>
    </div>
  )
}

interface MobileTableFieldProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function MobileTableField({ label, value, className }: MobileTableFieldProps) {
  return (
    <div className={cn("flex justify-between items-center py-1", className)}>
      <span className="text-slate-400 font-medium text-xs">{label}:</span>
      <span className="text-slate-200 text-xs">{value}</span>
    </div>
  )
}

// Hook for responsive table behavior
export function useResponsiveTable() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile }
}