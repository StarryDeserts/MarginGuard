import { Droplet } from 'lucide-react'
import type { RescuePlan } from '../../types/rescue'
import { formatDecimalPct, formatPct, formatRatio, formatUsdc } from '../../lib/utils/format'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

type SimulationSummaryPanelProps = {
  plan: RescuePlan
  reviewDisabled?: boolean
  reviewDisabledReason?: string
  onReview: () => void
  onBack: () => void
}

export function SimulationSummaryPanel({ plan, reviewDisabled, reviewDisabledReason, onReview, onBack }: SimulationSummaryPanelProps) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text-primary">Simulation Summary</h2>
        {plan.recommended ? <Badge variant="recommended">Recommended</Badge> : <Badge variant="p1">P1</Badge>}
      </div>
      <div className="flex items-center gap-3">
        <Droplet className="h-9 w-9 text-sui-cyan" />
        <div>
          <p className="text-2xl font-semibold text-text-primary">{plan.title}</p>
          <p className="text-sm text-text-secondary">{plan.label}</p>
        </div>
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between border-b border-guard-border pb-3">
          <dt className="text-text-secondary">
            {plan.type === 'ADD_COLLATERAL' ? 'Add Amount' : plan.type === 'REDUCE_ONLY_CLOSE' ? 'Reduce Size' : 'Stop-loss'}
          </dt>
          <dd className="font-semibold text-text-primary">
            {plan.type === 'ADD_COLLATERAL'
              ? formatUsdc(Number(plan.params.addAmountUsdc))
              : plan.type === 'REDUCE_ONLY_CLOSE'
                ? formatDecimalPct(Number(plan.params.reduceSizeDecimal))
                : `${Number(plan.params.stopLossUsdc).toFixed(2)} USDC`}
          </dd>
        </div>
        <div className="flex justify-between border-b border-guard-border pb-3">
          <dt className="text-text-secondary">Before RR</dt>
          <dd className="font-semibold text-warning-orange">{formatRatio(plan.beforeRiskRatio)}</dd>
        </div>
        <div className="flex justify-between border-b border-guard-border pb-3">
          <dt className="text-text-secondary">After RR (est.)</dt>
          <dd className="font-semibold text-safe-green">{formatRatio(plan.expectedAfterRiskRatio)}</dd>
        </div>
        <div className="flex justify-between border-b border-guard-border pb-3">
          <dt className="text-text-secondary">Liquidation Distance</dt>
          <dd className="font-semibold text-safe-green">
            {formatPct(plan.liquidationDistanceBeforePct)} -&gt; {formatPct(plan.liquidationDistanceAfterPct)}
          </dd>
        </div>
        <div className="flex justify-between border-b border-guard-border pb-3">
          <dt className="text-text-secondary">Est. Gas Fee</dt>
          <dd className="font-semibold text-text-primary">~0.002 SUI</dd>
        </div>
      </dl>
      <div className="mt-5 space-y-3">
        <Button className="w-full" disabled={plan.type !== 'ADD_COLLATERAL' || reviewDisabled} onClick={onReview}>
          {plan.type === 'ADD_COLLATERAL' && !reviewDisabled ? 'Open Transaction Review' : reviewDisabledReason ?? 'P1 path not wired in current build'}
        </Button>
        <Button className="w-full" variant="secondary" onClick={onBack}>
          Back to Risk Dashboard
        </Button>
      </div>
      <p className="mt-4 text-sm text-text-muted">Build unsigned PTB / Open Transaction Review path only. Simulated plans never open a wallet prompt.</p>
    </Card>
  )
}
