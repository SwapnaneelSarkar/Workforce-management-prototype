"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type AvatarProps = {
  src?: string
  initials: string
  alt: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Avatar({ src, initials, alt, size = "md", className }: AvatarProps) {
  const dimension = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-16 w-16 text-xl",
  }[size]

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={64}
        height={64}
        className={cn("rounded-full object-cover", dimension, className)}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        dimension,
        className,
      )}
    >
      {initials}
    </span>
  )
}




