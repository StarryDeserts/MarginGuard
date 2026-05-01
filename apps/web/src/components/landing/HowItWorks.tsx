import { Activity, FileCheck, Layers3, Send } from 'lucide-react'
import { Card } from '../ui/Card'

const steps = [
  { title: 'Monitor', body: 'Read risk ratio and liquidation distance.', icon: Activity },
  { title: 'Simulate', body: 'Compare rescue paths with mock estimates.', icon: Layers3 },
  { title: 'Review', body: 'Inspect action, cost, and projected outcome.', icon: FileCheck },
  { title: 'Live QA Gate', body: 'Wallet-signed execution is available only under live QA conditions.', icon: Send },
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Card className="p-6">
        <h2 className="mb-8 text-center text-3xl font-semibold text-text-primary">How it works</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <div key={step.title} className="relative rounded-xl border border-guard-border bg-guard-bg-soft p-5 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-sui-cyan/40 bg-sui-cyan/10 text-sui-cyan">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-electric-blue text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{step.body}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
