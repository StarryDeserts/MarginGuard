import { ArrowRight, Droplet, ExternalLink, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatPct, formatRatio, formatUsdc } from '../../lib/utils/format'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

type DemoRescueRecommendationProps = {
  beforeRiskRatio: number
  afterRiskRatio: number
  addCollateralUsd: number
  addCollateralLabel: string
  afterRiskRatioLabel: string
  liquidationDistanceBeforePct: number
  liquidationDistanceAfterPct: number
  onReview: () => void
  onSimulatedResult: () => void
}

export function DemoRescueRecommendation({
  beforeRiskRatio,
  afterRiskRatio,
  addCollateralUsd,
  addCollateralLabel,
  afterRiskRatioLabel,
  liquidationDistanceBeforePct,
  liquidationDistanceAfterPct,
  onReview,
  onSimulatedResult,
}: DemoRescueRecommendationProps) {
  const navigate = useNavigate()

  return (
    <Card className="border-safe-green/70 bg-safe-green/10 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text-primary">Recommended Rescue Action</h2>
        <div className="flex gap-2">
          <Badge variant="recommended">Recommended</Badge>
          <Badge variant="p0">P0</Badge>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <Droplet className="h-10 w-10 text-sui-cyan" />
        <div>
          <h3 className="text-2xl font-semibold text-text-primary">Add Collateral</h3>
          <p className="text-sm text-text-secondary">Best immediate rescue path</p>
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-guard-border p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-text-secondary">Add Amount</p>
            <p className="text-2xl font-semibold">{formatUsdc(addCollateralUsd)}</p>
            <p className="text-xs text-text-muted">{addCollateralLabel}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Before RR</p>
            <p className="text-2xl font-semibold text-warning-orange">{formatRatio(beforeRiskRatio)}</p>
            <p className="text-sm text-warning-orange">Warning</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">After RR (est.)</p>
            <p className="text-2xl font-semibold text-safe-green">{formatRatio(afterRiskRatio)}</p>
            <p className="text-sm text-safe-green">Healthy</p>
            <p className="text-xs text-text-muted">{afterRiskRatioLabel}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-safe-green">
        Liquidation Distance {formatPct(liquidationDistanceBeforePct)} -&gt; {formatPct(liquidationDistanceAfterPct)}
      </p>
      <div className="mt-5 space-y-3">
        <Button className="w-full" icon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/rescue')}>
          Open Rescue Simulator
        </Button>
        <Button className="w-full" variant="secondary" icon={<ExternalLink className="h-4 w-4" />} onClick={onReview}>
          Open Transaction Review
        </Button>
        <Button className="w-full" variant="ghost" icon={<PlayCircle className="h-4 w-4" />} onClick={onSimulatedResult}>
          Show Simulated Result
        </Button>
      </div>
      <p className="mt-4 text-sm text-text-muted">
        Demo Mode uses labeled simulated projections and never opens a live wallet prompt or shows a fake explorer link.
      </p>
    </Card>
  )
}
