import { ArrowRight, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ProductPreviewPanel } from './ProductPreviewPanel'

export function LandingHero() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-6 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pb-16">
      <ScrollReveal>
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge variant="info">Built on Sui</Badge>
            <Badge variant="info">DeepBook Margin</Badge>
            <Badge variant="neutral">Browser-only</Badge>
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-text-primary md:text-7xl">
            One-click pre-liquidation rescue for <span className="text-sui-cyan">DeepBook Margin.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
            Monitor risk before liquidation, compare rescue paths, and review a gated Add Collateral PTB path without a backend,
            indexer, or keeper.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" onClick={() => navigate('/dashboard')} icon={<ArrowRight className="h-5 w-5" />}>
              Launch App
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/demo')} icon={<PlayCircle className="h-5 w-5" />}>
              View Demo
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-secondary">
            {['No backend', 'No indexer', 'No keeper', 'Browser-only'].map((item) => (
              <span key={item} className="rounded-lg border border-guard-border bg-guard-surface px-3 py-2">{item}</span>
            ))}
          </div>
        </div>
      </ScrollReveal>
      <ScrollReveal delay={0.12}>
        <ProductPreviewPanel />
      </ScrollReveal>
    </section>
  )
}
