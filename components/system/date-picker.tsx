"use client"

import { useId } from "react"
import type { ChangeEvent } from "react"
import { Calendar } from "lucide-react"
import { FormField } from "./form-field"

type DatePickerProps = {
  label: string
  value: string
  onChange: (value: string) => void
  helper?: string
  required?: boolean
  min?: string
  max?: string
}

export function DatePicker({ label, value, onChange, helper, required, min, max }: DatePickerProps) {
  const id = useId()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <FormField label={label} htmlFor={id} helper={helper} required={required}>
      <div className="relative">
        <input
          id={id}
          type="date"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      </div>
    </FormField>
  )
}



