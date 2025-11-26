import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[10px] border-2 border-[#E2E8F0] bg-gradient-to-b from-white to-[#fafbfc] px-4 py-2.5 text-sm text-[#2D3748] placeholder:text-[#718096] transition-all duration-200 shadow-sm hover:border-[#3182CE]/30 hover:shadow-md focus-visible:border-[#3182CE] focus-visible:ring-4 focus-visible:ring-[#3182CE]/20 focus-visible:shadow-lg focus-visible:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#F7F7F9] disabled:text-[#A0AEC0] disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
