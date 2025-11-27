"use client"

import { useId } from "react"
import type { ChangeEvent } from "react"
import { ChevronDown } from "lucide-react"
import { FormField } from "./form-field"

export type DropdownOption = {
  label: string
  value: string
}

type DropdownProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  helper?: string
  required?: boolean
}

export function Dropdown({ label, value, onChange, options, helper, required }: DropdownProps) {
  const id = useId()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value)
  }

  return (
    <FormField label={label} htmlFor={id} helper={helper} required={required}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          className="w-full appearance-none rounded-lg border border-border bg-input px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      </div>
    </FormField>
  )
}



