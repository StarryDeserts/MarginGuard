import { ArrowRight, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

export function LandingCTA() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="rounded-2xl border border-sui-cyan/35 bg-gradient-to-r from-sui-cyan/10 via-electric-blue/10 to-safe-green/10 p-6 md:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-text-primary">Rescue before liquidation.</h2>
            <p className="mt-3 text-text-secondary">Open the interactive Round 3 risk console or run the simulated SUI price shock demo.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/dashboard')} icon={<ArrowRight className="h-5 w-5" />}>Launch App</Button>
            <Button variant="secondary" onClick={() => navigate('/demo')} icon={<PlayCircle className="h-5 w-5" />}>View Demo</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
