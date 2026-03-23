"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export interface FormStep {
  id: number
  label: string
  description?: string
}

interface FormStepIndicatorProps {
  steps: FormStep[]
  currentStep: number
  onStepClick?: (step: number) => void
  /** Allow clicking on completed steps to go back */
  allowStepNavigation?: boolean
  className?: string
}

export function FormStepIndicator({
  steps,
  currentStep,
  onStepClick,
  allowStepNavigation = true,
  className,
}: FormStepIndicatorProps) {
  const totalSteps = steps.length
  const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100

  const handleStepClick = (stepId: number) => {
    if (!allowStepNavigation || !onStepClick) return
    // Only allow clicking on completed steps or the current step
    if (stepId < currentStep) {
      onStepClick(stepId)
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Mobile: Compact progress bar with step label */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-foreground">
            {steps.find((s) => s.id === currentStep)?.label}
          </span>
        </div>
        <Progress
          value={(currentStep / totalSteps) * 100}
          className="h-2 rounded-full bg-secondary/80"
        />
        {steps.find((s) => s.id === currentStep)?.description && (
          <p className="text-xs text-muted-foreground">
            {steps.find((s) => s.id === currentStep)?.description}
          </p>
        )}
      </div>

      {/* Desktop: Full step indicator */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress line background */}
          <div className="absolute left-0 top-5 h-0.5 w-full bg-secondary/60" />
          {/* Progress line filled */}
          <div
            className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressValue}%` }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = step.id < currentStep
              const isCurrent = step.id === currentStep
              const isClickable = allowStepNavigation && isCompleted && onStepClick

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center gap-2",
                    isClickable && "cursor-pointer group"
                  )}
                  onClick={() => handleStepClick(step.id)}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault()
                      handleStepClick(step.id)
                    }
                  }}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {/* Step circle */}
                  <div
                    className={cn(
                      "relative z-10 flex size-10 items-center justify-center rounded-full border-2 bg-background transition-all duration-300",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                      !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground",
                      isClickable && "group-hover:scale-110 group-hover:border-primary/80"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-5" strokeWidth={2.5} />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>

                  {/* Step label */}
                  <div className="flex flex-col items-center gap-0.5 text-center">
                    <span
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        isCurrent && "text-foreground",
                        isCompleted && "text-primary",
                        !isCompleted && !isCurrent && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                    {step.description && (
                      <span
                        className={cn(
                          "max-w-[120px] text-xs text-muted-foreground transition-colors",
                          isCurrent && "text-muted-foreground",
                          isCompleted && "text-primary/70"
                        )}
                      >
                        {step.description}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface FormStepContentProps {
  step: number
  currentStep: number
  direction?: "left" | "right"
  children: React.ReactNode
  className?: string
}

export function FormStepContent({
  step,
  currentStep,
  children,
  className,
}: FormStepContentProps) {
  if (step !== currentStep) return null

  return (
    <div
      className={cn(
        "animate-in fade-in duration-300",
        step > 1 ? "slide-in-from-right-4" : "slide-in-from-left-4",
        className
      )}
    >
      {children}
    </div>
  )
}

interface FormStepActionsProps {
  currentStep: number
  totalSteps: number
  loading?: boolean
  disabled?: boolean
  submitted?: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit?: () => void
  onReset?: () => void
  previousLabel?: string
  nextLabel?: string
  submitLabel?: string
  submittingLabel?: string
  submittedLabel?: string
  resetLabel?: string
  /** Description shown on desktop */
  stepDescription?: string
  className?: string
  children?: React.ReactNode
}

export function FormStepActions({
  currentStep,
  totalSteps,
  loading = false,
  disabled = false,
  submitted = false,
  onPrevious,
  onNext,
  onSubmit,
  onReset,
  previousLabel = "Back",
  nextLabel = "Next step",
  submitLabel = "Submit",
  submittingLabel = "Submitting...",
  submittedLabel = "Submitted",
  resetLabel = "Start over",
  stepDescription,
  className,
  children,
}: FormStepActionsProps) {
  const isLastStep = currentStep === totalSteps

  return (
    <div
      className={cn(
        // Mobile: Fixed bottom bar with safe area
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 py-3 pb-safe-bottom backdrop-blur",
        // Desktop: Static positioning
        "md:static md:mt-6 md:border-none md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
        {/* Desktop step description */}
        {stepDescription && (
          <p className="hidden text-xs text-muted-foreground md:block">
            {stepDescription}
          </p>
        )}

        <div className="flex flex-1 items-center justify-between gap-3 md:flex-none md:ml-auto">
          {/* Previous button */}
          <button
            type="button"
            onClick={onPrevious}
            disabled={currentStep === 1 || loading || submitted}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
              "hover:bg-secondary hover:text-foreground",
              "disabled:pointer-events-none disabled:opacity-40"
            )}
          >
            {previousLabel}
          </button>

          {/* Submitted state with reset option */}
          {submitted ? (
            <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="rounded-2xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  {resetLabel}
                </button>
              )}
              <div className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-2.5 text-sm font-semibold text-success">
                <Check className="size-4" />
                {submittedLabel}
              </div>
            </div>
          ) : (
            <>
              {/* Next/Submit button or custom children */}
              {children ?? (
                <button
                  type={isLastStep ? "submit" : "button"}
                  onClick={isLastStep ? onSubmit : onNext}
                  disabled={loading || disabled}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all sm:flex-none",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
                    "active:scale-[0.98]",
                    "disabled:pointer-events-none disabled:opacity-50"
                  )}
                >
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      {isLastStep ? submittingLabel : "Loading..."}
                    </>
                  ) : (
                    <>
                      {isLastStep ? submitLabel : nextLabel}
                      {!isLastStep && <ChevronRight className="size-4" />}
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
