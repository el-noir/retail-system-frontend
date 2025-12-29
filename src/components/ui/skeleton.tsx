"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-800/50",
        className
      )}
      {...props}
    />
  )
}

function SkeletonText({ 
  className, 
  lines = 1, 
  ...props 
}: React.ComponentProps<"div"> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4 w-full",
            i === lines - 1 && lines > 1 && "w-3/4" // Last line is shorter
          )} 
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div 
      className={cn(
        "rounded-lg border border-slate-800 bg-slate-900 p-6",
        className
      )} 
      {...props}
    >
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <SkeletonText lines={2} />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  )
}

function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={`row-${i}`} className="flex space-x-4">
          {Array.from({ length: columns }, (_, j) => (
            <Skeleton 
              key={`cell-${i}-${j}`} 
              className={cn(
                "h-8 flex-1",
                j === 0 && "w-1/4", // First column smaller
                j === columns - 1 && "w-20" // Last column fixed width
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable }