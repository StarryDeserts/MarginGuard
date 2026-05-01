import { Clock, DollarSign, Percent, ShieldAlert } from 'lucide-react'
import { formatApr, formatPct, formatUsd } from '../../lib/utils/format'
import { MetricCard } from '../risk/MetricCard'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

type DemoRiskPreviewProps = {
  sourceLabel: string
  borrowApr: number
  borrowAprLabel: string
  interestDriftLabel: string
  simulatedRiskRatio: number
  simulatedRiskRatioLabel: string
  assetValueUsd: number
  assetValueLabel: string
  debtValueUsd: number
  debtValueLabel: string
  liquidationDistancePct: number
  liquidationDistanceLabel: string
}

export function DemoRiskPreview({
  sourceLabel,
  borrowApr,
  borrowAprLabel,
  interestDriftLabel,
  simulatedRiskRatio,
  simulatedRiskRatioLabel,
  assetValueUsd,
  assetValueLabel,
  debtValueUsd,
  debtValueLabel,
  liquidationDistancePct,
  liquidationDistanceLabel,
}: DemoRiskPreviewProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold text-text-primary">Stress-Test Risk Preview</h2>
        <Badge variant={sourceLabel.includes('Real') ? 'recommended' : sourceLabel.includes('Partial') ? 'warning' : 'info'}>
          {sourceLabel}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Stressed RR" value={simulatedRiskRatio} helper={simulatedRiskRatioLabel} icon={<ShieldAlert className="h-5 w-5" />} tone="warning" />
        <MetricCard
          label="Liquidation Distance"
          value={liquidationDistancePct}
          helper={liquidationDistanceLabel}
          icon={<Percent className="h-5 w-5" />}
          format={formatPct}
        />
        <MetricCard label="Asset Value (USD)" value={assetValueUsd} helper={assetValueLabel} icon={<DollarSign className="h-5 w-5" />} format={formatUsd} />
        <MetricCard label="Debt Value (USD)" value={debtValueUsd} helper={debtValueLabel} icon={<DollarSign className="h-5 w-5" />} format={formatUsd} />
        <MetricCard label="Borrow APR" value={borrowApr} helper={borrowAprLabel} icon={<Percent className="h-5 w-5" />} tone="purple" format={formatApr} />
        <MetricCard label="Interest Drift" value={borrowApr} valueText="Projection only" helper={interestDriftLabel} icon={<Clock className="h-5 w-5" />} tone="purple" />
      </div>
    </Card>
  )
}
