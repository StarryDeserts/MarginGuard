import { FileCheck, ShieldAlert, SlidersHorizontal } from 'lucide-react'
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup'
import { Card } from '../ui/Card'

const features = [
  {
    icon: ShieldAlert,
    title: 'Monitor risk before liquidation',
    body: 'Track risk ratio, liquidation threshold, and distance while the app is open.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Simulate with confidence',
    body: 'Compare Add Collateral, Reduce-only, and Smart TPSL path previews before acting.',
  },
  {
    icon: FileCheck,
    title: 'Review before signing',
    body: 'Every future write action has a transaction review surface before any wallet step.',
  },
]

export function WhyMarginGuard() {
  return (
    <section id="product" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h2 className="mb-6 text-3xl font-semibold text-text-primary">Why MarginGuard</h2>
      <StaggerGroup className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon

          return (
            <StaggerItem key={feature.title}>
              <Card className="h-full p-6">
                <Icon className="h-10 w-10 text-sui-cyan" />
                <h3 className="mt-5 text-xl font-semibold text-text-primary">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{feature.body}</p>
              </Card>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </section>
  )
}
