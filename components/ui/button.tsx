import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200",
  {
    variants: {
      variant: {
        default: "bg-[#2D3748] text-white shadow-[0_1px_4px_rgba(16,24,40,0.12)] hover:bg-[#3B4963]",
        destructive: "bg-[#F56565] text-white shadow-[0_1px_4px_rgba(245,101,101,0.4)] hover:bg-[#dd4c4c]",
        outline: "border border-[#E2E8F0] bg-white text-[#2D3748] hover:bg-[#EEF0F4]",
        secondary: "border border-[#E2E8F0] bg-[#F7F7F9] text-[#2D3748] hover:bg-[#EEF0F4]",
        ghost: "text-[#2D3748] hover:bg-[#EEF0F4]",
        link: "text-[#3182CE] underline-offset-4 hover:underline",
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
