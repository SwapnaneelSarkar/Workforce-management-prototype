import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[6px] border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] transition-[border-color,box-shadow] focus-visible:border-[#3182CE] focus-visible:ring-2 focus-visible:ring-[#3182CE]/30 disabled:cursor-not-allowed disabled:bg-[#F7F7F9] disabled:text-[#A0AEC0]",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
