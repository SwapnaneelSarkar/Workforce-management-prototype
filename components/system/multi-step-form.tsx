"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "./progress-bar"

export type StepDefinition = {
  id: string
  title: string
  description?: string
  content: ReactNode
}

type MultiStepFormProps = {
  steps: StepDefinition[]
  activeStep: number
  onBack: () => void
  onNext: () => void
  onSave?: () => Promise<void>
  saving?: boolean
  nextLabel?: string
  finishLabel?: string
  primaryDisabled?: boolean
}

export function MultiStepForm({
  steps,
  activeStep,
  onBack,
  onNext,
  onSave,
  saving,
  nextLabel = "Save & Continue",
  finishLabel = "Finish",
  primaryDisabled = false,
}: MultiStepFormProps) {
  const step = steps[activeStep]
  const progressValue = Math.round(((activeStep + 1) / steps.length) * 100)
  const isLast = activeStep === steps.length - 1

  const handlePrimary = async () => {
    if (onSave) {
      await onSave()
    }
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            Step {activeStep + 1} of {steps.length}
          </p>
          <h2 className="text-2xl font-semibold text-foreground">{step.title}</h2>
          {step.description ? <p className="text-sm text-muted-foreground">{step.description}</p> : null}
        </div>
        <div className="w-48">
          <ProgressBar value={progressValue} label={`${progressValue}%`} />
        </div>
      </div>

      <div key={step.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
        {step.content}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={activeStep === 0 || saving}
          aria-label="Go to previous step"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handlePrimary}
          disabled={saving || primaryDisabled}
          aria-label={isLast ? finishLabel : nextLabel}
        >
          {saving ? "Saving..." : isLast ? finishLabel : nextLabel}
        </Button>
      </div>
    </div>
  )
}

