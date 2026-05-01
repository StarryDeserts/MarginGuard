import { mockRescuePlans } from '../../lib/demo/mockRescuePlans'
import { Card } from '../ui/Card'

export function LiquidationCushionComparison() {
  const bars = [
    { label: 'Add Collateral', value: 17.6, color: 'bg-safe-green', badge: 'P0' },
    { label: 'Reduce-only Close', value: 10, color: 'bg-electric-blue', badge: 'P1' },
    { label: 'Smart TPSL', value: 7, color: 'bg-p1-purple', badge: 'P1' },
  ]

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">Liquidation Cushion Comparison</h2>
      <div className="flex h-64 items-end gap-4 rounded-lg border border-guard-border bg-guard-bg-soft p-4">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">+{bar.value.toFixed(1)}%</span>
            <div className={`w-full rounded-t-lg ${bar.color}`} style={{ height: `${bar.value * 8}px` }} />
            <span className="text-center text-xs text-text-secondary">{bar.label}</span>
            <span className="rounded bg-white/10 px-2 py-1 text-xs text-text-secondary">{bar.badge}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-text-muted">{mockRescuePlans.length} static rescue previews compared.</p>
    </Card>
  )
}
