import type { RiskPoint } from '../../types/risk'
import { formatRatio } from '../../lib/utils/format'
import { Card } from '../ui/Card'
import {
  getRiskRatioPathChartViewModel,
  type RiskRatioPathChartMode,
  type RiskRatioSnapshotScale,
} from './riskRatioPathChartModel'

type RiskRatioPathChartProps = {
  title?: string
  points?: RiskPoint[]
  afterValue?: number
  mode?: RiskRatioPathChartMode
  currentRiskRatio?: number
  targetRiskRatio?: number
  liquidationRiskRatio?: number
  zeroDebt?: boolean
}

function buildPolyline(points: RiskPoint[], min: number, max: number) {
  return points
    .map((point, index) => {
      const x = 50 + (index / Math.max(1, points.length - 1)) * 620
      const y = 250 - ((point.value - min) / (max - min)) * 190
      return `${x},${y}`
    })
    .join(' ')
}

export function RiskRatioPathChart({
  title = 'Risk Ratio Path',
  points,
  afterValue,
  mode = 'mock',
  currentRiskRatio,
  targetRiskRatio,
  liquidationRiskRatio,
  zeroDebt,
}: RiskRatioPathChartProps) {
  const viewModel = getRiskRatioPathChartViewModel({
    mode,
    points,
    afterValue,
    currentRiskRatio,
    targetRiskRatio,
    liquidationRiskRatio,
    zeroDebt,
  })

  if (viewModel.kind === 'empty') {
    return (
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <span className="text-sm text-text-secondary">Read-only DeepBook snapshot</span>
        </div>
        <div className="rounded-lg border border-guard-border bg-guard-bg-soft p-5">
          <p className="text-sm text-text-secondary">{viewModel.message}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ReferenceMetric label="Current RR" value={viewModel.currentRiskRatio} />
            <ReferenceMetric label="Target" value={viewModel.targetRiskRatio} />
            <ReferenceMetric label="Liquidation" value={viewModel.liquidationRiskRatio} />
          </div>
        </div>
      </Card>
    )
  }

  if (viewModel.kind === 'snapshot') {
    return (
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-text-primary">{viewModel.title}</h2>
          <span className="rounded-full border border-sui-cyan/30 bg-sui-cyan/10 px-3 py-1 text-sm text-sui-cyan">
            {viewModel.eyebrow}
          </span>
        </div>
        <div className="rounded-xl border border-guard-border bg-guard-bg-soft p-5">
          <div className="max-w-3xl">
            <p className="text-base font-semibold text-text-primary">{viewModel.message}</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{viewModel.detail}</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {viewModel.metrics.map((metric) => (
              <ReferenceMetric key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>
          {viewModel.safetyScale ? <SnapshotSafetyScale scale={viewModel.safetyScale} /> : null}
        </div>
      </Card>
    )
  }

  const polyline = buildPolyline(viewModel.points, viewModel.min, viewModel.max)
  const targetY = viewModel.targetRiskRatio === undefined ? undefined : toChartY(viewModel.targetRiskRatio, viewModel.min, viewModel.max)
  const liquidationY =
    viewModel.liquidationRiskRatio === undefined ? undefined : toChartY(viewModel.liquidationRiskRatio, viewModel.min, viewModel.max)
  const ticks = buildTicks(viewModel.min, viewModel.max)

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        <span className="text-sm text-text-secondary">Estimates update while app is open</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-guard-border bg-guard-bg-soft p-3">
        <svg viewBox="0 0 720 300" className="h-72 w-full" role="img" aria-label={title}>
          {ticks.map((tick) => {
            const y = toChartY(tick, viewModel.min, viewModel.max)
            return (
              <g key={tick}>
                <line x1="50" x2="670" y1={y} y2={y} stroke="rgba(174,190,208,0.18)" strokeWidth="1" />
                <text x="10" y={y + 5} fill="#aebed0" fontSize="14">
                  {tick.toFixed(2)}
                </text>
              </g>
            )
          })}
          {targetY === undefined ? null : <line x1="50" x2="670" y1={targetY} y2={targetY} stroke="#10b981" strokeDasharray="8 8" strokeWidth="2" />}
          {liquidationY === undefined ? null : (
            <line x1="50" x2="670" y1={liquidationY} y2={liquidationY} stroke="#ef4444" strokeDasharray="8 8" strokeWidth="2" />
          )}
          <polyline points={polyline} fill="none" stroke="#00d9ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          {viewModel.points.map((point, index) => {
            const x = 50 + (index / Math.max(1, viewModel.points.length - 1)) * 620
            const y = toChartY(point.value, viewModel.min, viewModel.max)
            return <circle key={point.label} cx={x} cy={y} r="6" fill="#04101b" stroke="#00d9ff" strokeWidth="4" />
          })}
          {viewModel.targetRiskRatio === undefined || targetY === undefined ? null : (
            <text x="520" y={targetY - 7} fill="#10b981" fontSize="14" fontWeight="600">
              Target Rescue Ratio ({formatRatio(viewModel.targetRiskRatio)})
            </text>
          )}
          {viewModel.liquidationRiskRatio === undefined || liquidationY === undefined ? null : (
            <text x="510" y={liquidationY + 22} fill="#ef4444" fontSize="14" fontWeight="600">
              Liquidation Threshold ({formatRatio(viewModel.liquidationRiskRatio)})
            </text>
          )}
          {afterValue ? (
            <text x="615" y="84" fill="#10b981" fontSize="18" fontWeight="700">
              {afterValue.toFixed(2)}
            </text>
          ) : null}
        </svg>
      </div>
    </Card>
  )
}

function ReferenceMetric({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg border border-guard-border bg-guard-surface/70 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-primary">{value === undefined ? 'N/A' : formatRatio(value)}</p>
    </div>
  )
}

function SnapshotSafetyScale({ scale }: { scale: RiskRatioSnapshotScale }) {
  return (
    <div className="mt-5 rounded-xl border border-guard-border bg-guard-surface/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-text-primary">Current snapshot scale</p>
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Not historical</p>
      </div>
      <div className="relative mt-5 h-16">
        <div className="absolute left-0 right-0 top-7 h-1 rounded-full bg-gradient-to-r from-danger-red via-caution-yellow to-safe-green" />
        {scale.liquidationRiskRatio === undefined ? null : (
          <ScaleTick label="Liquidation" value={scale.liquidationRiskRatio} scale={scale} tone="danger" />
        )}
        {scale.targetRiskRatio === undefined ? null : (
          <ScaleTick label="Target" value={scale.targetRiskRatio} scale={scale} tone="target" />
        )}
        {scale.currentRiskRatio === undefined ? null : (
          <div className="absolute top-0 -translate-x-1/2" style={{ left: `${scalePositionPct(scale.currentRiskRatio, scale)}%` }}>
            <div className="rounded-md border border-sui-cyan/50 bg-sui-cyan/15 px-2 py-1 text-xs font-semibold text-sui-cyan">
              Current {formatRatio(scale.currentRiskRatio)}
            </div>
            <div className="mx-auto mt-1 h-6 w-1 rounded-full bg-sui-cyan shadow-[0_0_14px_rgba(0,217,255,0.55)]" />
          </div>
        )}
      </div>
    </div>
  )
}

function ScaleTick({
  label,
  value,
  scale,
  tone,
}: {
  label: string
  value: number
  scale: RiskRatioSnapshotScale
  tone: 'danger' | 'target'
}) {
  const colorClass = tone === 'danger' ? 'bg-danger-red text-danger-red' : 'bg-safe-green text-safe-green'

  return (
    <div className="absolute top-6 -translate-x-1/2" style={{ left: `${scalePositionPct(value, scale)}%` }}>
      <div className={`mx-auto h-5 w-0.5 rounded-full ${colorClass.split(' ')[0]}`} />
      <p className={`mt-2 whitespace-nowrap text-xs font-semibold ${colorClass.split(' ')[1]}`}>
        {label} {formatRatio(value)}
      </p>
    </div>
  )
}

function scalePositionPct(value: number, scale: RiskRatioSnapshotScale) {
  const span = scale.max - scale.min
  if (span <= 0) return 50

  return Math.min(100, Math.max(0, ((value - scale.min) / span) * 100))
}

function toChartY(value: number, min: number, max: number) {
  return 250 - ((value - min) / (max - min)) * 190
}

function buildTicks(min: number, max: number) {
  const step = (max - min) / 5

  return Array.from({ length: 6 }, (_, index) => Number((min + step * index).toFixed(2)))
}
