import type { DemoStep } from '../../types/demo'
import { demoSteps } from '../../lib/demo/scenarios'
import { Card } from '../ui/Card'

type DemoStepperProps = {
  activeStep: DemoStep
  onStepChange: (step: DemoStep) => void
}

export function DemoStepper({ activeStep, onStepChange }: DemoStepperProps) {
  const activeIndex = demoSteps.findIndex((step) => step.id === activeStep)

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">Demo Stepper</h2>
      <div className="space-y-3">
        {demoSteps.map((step, index) => {
          const active = step.id === activeStep
          const complete = index < activeIndex

          return (
            <button
              key={step.id}
              type="button"
              className={`focus-ring flex w-full cursor-pointer items-start gap-3 rounded-lg p-2 text-left transition-colors ${
                active ? 'bg-warning-orange/12 text-warning-orange' : complete ? 'bg-safe-green/10 text-safe-green' : 'text-text-secondary hover:bg-white/5'
              }`}
              onClick={() => onStepChange(step.id)}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-electric-blue text-sm font-semibold text-white">{index + 1}</span>
              <span>
                <span className="block font-semibold">{step.title}</span>
                <span className="text-sm text-text-secondary">{step.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
