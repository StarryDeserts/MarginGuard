import { AlertTriangle } from 'lucide-react'
import { isZeroDebt } from '../../lib/risk/riskRatio'
import { classifyRisk, riskLabels } from '../../lib/risk/thresholds'
import { formatRatio } from '../../lib/utils/format'
import type { NormalizedMarginState } from '../../types/margin'
import { AnimatedNumber } from '../motion/AnimatedNumber'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { RiskLevelBadge } from './RiskLevelBadge'

type RiskSummaryHeroProps = {
  state?: NormalizedMarginState
  sourceLabel?: string
}

export function RiskSummaryHero({ state, sourceLabel = 'Unavailable' }: RiskSummaryHeroProps) {
  const riskRatio = state?.riskRatio
  const zeroDebt = isZeroDebt(state)
  const riskLevel = riskRatio === undefined || zeroDebt ? undefined : classifyRisk(riskRatio)
  const borderClass =
    zeroDebt || riskLevel === 'healthy' ? 'border-safe-green/70 bg-safe-green/10' : 'border-warning-orange/70 bg-warning-orange/12'

  return (
    <Card className={`${borderClass} bg-gradient-to-br via-guard-surface to-guard-surface p-6`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="mb-3 flex items-center gap-3 text-text-secondary">
            <AlertTriangle className="h-5 w-5 text-warning-orange" />
            <span>Current Risk Ratio</span>
            <Badge variant={state?.source === 'deepbook' && !state.isPartial ? 'recommended' : 'info'}>{sourceLabel}</Badge>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <span className="text-7xl font-semibold leading-none text-warning-orange md:text-8xl">
              {zeroDebt ? 'No debt' : riskRatio === undefined ? 'Unavailable' : <AnimatedNumber value={riskRatio} format={formatRatio} />}
            </span>
            {riskLevel ? <RiskLevelBadge level={riskLevel} /> : <Badge variant="neutral">{zeroDebt ? 'No borrowed debt' : 'Unavailable'}</Badge>}
          </div>
          <p className="mt-4 text-lg text-text-secondary">
            {zeroDebt
              ? 'This manager has no borrowed debt, so liquidation risk is not active.'
              : state?.riskRatio === undefined
                ? 'Risk ratio is unavailable from the current read state.'
                : `Current status: ${riskLabels[riskLevel ?? 'warning']}.`}
          </p>
        </div>
        <div className="grid min-w-64 gap-4 border-t border-guard-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div>
            <p className="text-sm text-text-secondary">Liquidation Threshold</p>
            <p className="mt-1 text-3xl font-semibold text-text-primary">
              {state?.liquidationRiskRatio === undefined ? 'Unavailable' : formatRatio(state.liquidationRiskRatio)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Target Rescue Ratio</p>
            <p className="mt-1 text-3xl font-semibold text-safe-green">
              {state?.targetRiskRatio === undefined ? 'Unavailable' : formatRatio(state.targetRiskRatio)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
