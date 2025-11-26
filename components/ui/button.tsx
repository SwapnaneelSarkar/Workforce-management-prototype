import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-[#2D3748] to-[#3B4963] text-white shadow-[0_2px_8px_rgba(16,24,40,0.12)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.16)] hover:-translate-y-0.5 hover:from-[#3B4963] hover:to-[#2D3748] active:translate-y-0 active:shadow-[0_1px_4px_rgba(16,24,40,0.12)]",
        destructive: "bg-gradient-to-br from-[#F56565] to-[#dd4c4c] text-white shadow-[0_2px_8px_rgba(245,101,101,0.3)] hover:shadow-[0_4px_12px_rgba(245,101,101,0.4)] hover:-translate-y-0.5 hover:from-[#dd4c4c] hover:to-[#F56565] active:translate-y-0",
        outline: "border-2 border-[#E2E8F0] bg-white text-[#2D3748] hover:bg-[#F8FAFC] hover:border-[#3182CE]/30 hover:shadow-[0_2px_8px_rgba(49,130,206,0.1)] hover:-translate-y-0.5 active:translate-y-0",
        secondary: "border-2 border-[#E2E8F0] bg-[#F7F7F9] text-[#2D3748] hover:bg-[#EEF0F4] hover:border-[#3182CE]/30 hover:shadow-[0_2px_8px_rgba(16,24,40,0.08)] hover:-translate-y-0.5 active:translate-y-0",
        ghost: "text-[#2D3748] hover:bg-[#EEF0F4] hover:shadow-[0_1px_4px_rgba(16,24,40,0.06)]",
        link: "text-[#3182CE] underline-offset-4 hover:underline hover:text-[#2563EB]",
      },
      size: {
        default: "h-11 px-5 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
