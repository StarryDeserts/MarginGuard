import { ArrowRight, Droplet, Shield, TrendingDown } from 'lucide-react'
import type { RescuePlan } from '../../types/rescue'
import { formatPct, formatRatio } from '../../lib/utils/format'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

type RescuePlanCardProps = {
  plan: RescuePlan
  selected: boolean
  error?: string
  onSelect: () => void
  onReview: () => void
  onAddCollateralChange: (value: number) => void
  onReduceSizeChange: (value: number) => void
  onStopLossChange: (value: number) => void
  onBufferChange: (value: number) => void
}

const iconMap = {
  ADD_COLLATERAL: Droplet,
  REDUCE_ONLY_CLOSE: TrendingDown,
  SMART_TPSL: Shield,
}

export function RescuePlanCard({
  plan,
  selected,
  error,
  onSelect,
  onReview,
  onAddCollateralChange,
  onReduceSizeChange,
  onStopLossChange,
  onBufferChange,
}: RescuePlanCardProps) {
  const Icon = iconMap[plan.type]
  const isP0 = plan.priority === 'P0'

  return (
    <Card
      interactive
      onClick={onSelect}
      className={`flex min-h-[31rem] cursor-pointer flex-col p-5 ${selected ? 'border-safe-green/80 bg-safe-green/10' : 'border-guard-border'}`}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {plan.recommended ? <Badge variant="recommended">Recommended</Badge> : null}
        <Badge variant={isP0 ? 'p0' : 'p1'}>{plan.priority}</Badge>
        <Badge variant={isP0 ? 'info' : 'p1'}>{plan.subtitle}</Badge>
      </div>
      <div className="flex items-start gap-4">
        <span className={`rounded-full p-3 ${isP0 ? 'bg-sui-cyan/12 text-sui-cyan' : 'bg-p1-purple/20 text-p1-purple'}`}>
          <Icon className="h-9 w-9" />
        </span>
        <div>
          <h3 className="text-2xl font-semibold text-text-primary">{plan.title}</h3>
          <p className="mt-1 text-sm font-semibold text-sui-cyan">{plan.label}</p>
          <p className="mt-3 text-sm text-text-secondary">{plan.description}</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {plan.type === 'ADD_COLLATERAL' ? (
          <label className="block text-sm font-medium text-text-secondary" onClick={(event) => event.stopPropagation()}>
            Add Amount (USDC)
            <Input
              className="mt-2"
              error={Boolean(error)}
              min="1"
              step="1"
              type="number"
              value={Number(plan.params.addAmountUsdc).toFixed(0)}
              onChange={(event) => onAddCollateralChange(Number(event.target.value))}
            />
          </label>
        ) : null}
        {plan.type === 'REDUCE_ONLY_CLOSE' ? (
          <label className="block text-sm font-medium text-text-secondary" onClick={(event) => event.stopPropagation()}>
            Reduce Position (%)
            <Input
              className="mt-2"
              error={Boolean(error)}
              max="80"
              min="1"
              step="1"
              type="number"
              value={Number(plan.params.reduceSizeDisplayPct).toFixed(0)}
              onChange={(event) => onReduceSizeChange(Number(event.target.value) / 100)}
            />
          </label>
        ) : null}
        {plan.type === 'SMART_TPSL' ? (
          <>
            <label className="block text-sm font-medium text-text-secondary" onClick={(event) => event.stopPropagation()}>
              Stop-loss (USDC)
              <Input
                className="mt-2"
                error={Boolean(error)}
                min="0"
                step="0.01"
                type="number"
                value={Number(plan.params.stopLossUsdc).toFixed(2)}
                onChange={(event) => onStopLossChange(Number(event.target.value))}
              />
            </label>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-text-secondary">Liquidation Price</span>
              <span className="font-semibold text-text-primary">{Number(plan.params.liquidationPriceUsdc).toFixed(2)} USDC</span>
            </div>
            <label className="block text-sm font-medium text-text-secondary" onClick={(event) => event.stopPropagation()}>
              Buffer (%)
              <Input
                className="mt-2"
                error={Boolean(error)}
                min="1"
                step="1"
                type="number"
                value={Number(plan.params.bufferDisplayPct).toFixed(0)}
                onChange={(event) => onBufferChange(Number(event.target.value) / 100)}
              />
            </label>
          </>
        ) : null}
        {error ? <p className="rounded-lg border border-danger-red/50 bg-danger-red/10 p-2 text-sm text-danger-red">{error}</p> : null}
        <div className="grid grid-cols-2 gap-3 border-t border-guard-border pt-4">
          <div>
            <p className="text-sm text-text-secondary">Before RR</p>
            <p className="text-3xl font-semibold text-warning-orange">{formatRatio(plan.beforeRiskRatio)}</p>
            <p className="text-sm text-warning-orange">Warning</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">After RR (est.)</p>
            <p className={`text-3xl font-semibold ${plan.expectedAfterRiskRatio >= 1.3 ? 'text-safe-green' : 'text-guarded-blue'}`}>
              {formatRatio(plan.expectedAfterRiskRatio)}
            </p>
            <p className={`text-sm ${plan.expectedAfterRiskRatio >= 1.3 ? 'text-safe-green' : 'text-guarded-blue'}`}>
              {plan.expectedAfterRiskRatio >= 1.3 ? 'Healthy' : 'Guarded'}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-guard-border pt-4 text-sm">
          <span className="text-text-secondary">Est. Gas Fee</span>
          <span className="text-text-primary">~0.002 SUI</span>
        </div>
        <p className="text-sm text-text-muted">Liquidation cushion: {formatPct(plan.liquidationDistanceBeforePct)} -&gt; {formatPct(plan.liquidationDistanceAfterPct)}</p>
      </div>
      <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
        <Button
          type="button"
          variant="primary"
          onClick={(event) => {
            event.stopPropagation()
            onSelect()
          }}
        >
          Simulate
        </Button>
        <Button
          type="button"
          variant={isP0 ? 'secondary' : 'ghost'}
          disabled={!isP0}
          onClick={(event) => {
            event.stopPropagation()
            if (isP0) onReview()
          }}
          icon={<ArrowRight className="h-4 w-4" />}
        >
          {isP0 ? plan.ctaLabel : 'Not wired'}
        </Button>
      </div>
    </Card>
  )
}
