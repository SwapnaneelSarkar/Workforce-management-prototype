"use client"

import { cn } from "@/lib/utils"

type SkeletonLoaderProps = {
  lines?: number
  className?: string
}

export function SkeletonLoader({ lines = 3, className }: SkeletonLoaderProps) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 animate-pulse rounded-full bg-muted/80" />
      ))}
    </div>
  )
}






