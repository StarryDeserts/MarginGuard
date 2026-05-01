import { Database, Globe2, ServerOff, ShieldCheck, UserRound } from 'lucide-react'
import { Card } from '../ui/Card'

const principles = [
  { label: 'No backend', icon: ServerOff },
  { label: 'No indexer', icon: Database },
  { label: 'No keeper', icon: ShieldCheck },
  { label: 'Browser-only', icon: Globe2 },
  { label: 'You stay in control', icon: UserRound },
]

export function ArchitecturePrinciples() {
  return (
    <section id="architecture" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Card className="p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-text-primary">Lightweight by design</h2>
            <p className="mt-3 text-text-secondary">MarginGuard v0 is an active risk console and static PTB preview layer.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {principles.map((principle) => {
              const Icon = principle.icon

              return (
                <div key={principle.label} className="rounded-lg border border-guard-border bg-guard-bg-soft p-4 text-center text-sm text-text-secondary">
                  <Icon className="mx-auto mb-3 h-5 w-5 text-sui-cyan" />
                  {principle.label}
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </section>
  )
}
