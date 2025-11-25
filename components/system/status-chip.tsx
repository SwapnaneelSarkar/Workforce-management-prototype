"use client"

import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

const toneClasses = {
  neutral: "bg-[#EDF2F7] text-[#4A5568]",
  success: "bg-[#48BB78] text-white",
  warning: "bg-[#ED8936] text-white",
  danger: "bg-[#F56565] text-white",
  info: "bg-[#3182CE] text-white",
} as const

export type StatusChipTone = keyof typeof toneClasses

export type StatusChipProps = {
  label: string
  tone?: StatusChipTone
} & ComponentPropsWithoutRef<"span">

export function StatusChip({ label, tone = "neutral", className, ...rest }: StatusChipProps) {
  return (
    <span
      {...rest}
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", toneClasses[tone], className)}
    >
      {label}
    </span>
  )
}

