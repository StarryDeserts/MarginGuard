import { ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type ManagerReadSourceState } from '../../lib/deepbook/readState'
import type { NormalizedMarginState } from '../../types/margin'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { getRecommendedRescueActionCardModel, type RecommendationMetricItem } from './recommendedRescueActionCardModel'

type RecommendedRescueActionCardProps = {
  onReview: () => void
  state?: NormalizedMarginState
  sourceLabel?: string
  sourceState?: ManagerReadSourceState
}

export function RecommendedRescueActionCard({ onReview, state, sourceLabel = 'Unavailable', sourceState }: RecommendedRescueActionCardProps) {
  const navigate = useNavigate()
  const viewModel = getRecommendedRescueActionCardModel({ state, sourceLabel, sourceState })
  const isActionNeeded = viewModel.actionability === 'action-needed'
  const cardClassName =
    viewModel.cardTone === 'action'
      ? 'border-safe-green/70 bg-safe-green/10'
      : viewModel.cardTone === 'healthy'
        ? 'border-safe-green/40 bg-safe-green/5'
        : 'border-sui-cyan/40 bg-sui-cyan/10'

  return (
    <Card className={`${cardClassName} p-5`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text-primary">{viewModel.title}</h2>
        <div className="flex gap-2">
          {viewModel.badges.map((badge) => (
            <Badge key={badge.label} variant={badge.variant}>
              {badge.label}
            </Badge>
          ))}
        </div>
      </div>
      <div className={isActionNeeded ? 'grid gap-5 lg:grid-cols-[1fr_auto]' : 'space-y-5'}>
        <div>
          <div className="flex items-start gap-3">
            <ShieldCheck className={`h-9 w-9 ${viewModel.cardTone === 'healthy' ? 'text-safe-green' : 'text-sui-cyan'}`} />
            <div className="min-w-0">
              {viewModel.heading ? <h3 className="text-2xl font-semibold text-text-primary">{viewModel.heading}</h3> : null}
              <div className={viewModel.heading ? 'mt-1 space-y-1' : 'space-y-1'}>
                {viewModel.bodyLines.map((line) => (
                  <p key={line} className="text-sm leading-6 text-text-secondary">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
          {viewModel.metricItems.length ? (
            <div className="mt-5 grid gap-4 rounded-xl border border-guard-border bg-guard-surface/45 p-4 sm:grid-cols-3">
              {viewModel.metricItems.map((item) => (
                <RecommendationMetric key={item.label} item={item} />
              ))}
            </div>
          ) : null}
          {viewModel.summaryLine ? <p className="mt-4 text-sm text-text-secondary">{viewModel.summaryLine}</p> : null}
        </div>
        <div
          className={
            isActionNeeded
              ? 'flex flex-col justify-center gap-3 lg:min-w-80'
              : 'rounded-xl border border-guard-border bg-guard-surface/45 p-4'
          }
        >
          <div className={isActionNeeded ? 'flex flex-col gap-3' : 'flex flex-col gap-3 sm:flex-row'}>
            <Button
              variant={viewModel.primaryActionVariant}
              onClick={() => navigate('/rescue')}
              icon={<ArrowRight className="h-5 w-5" />}
              className={isActionNeeded ? undefined : 'sm:w-auto'}
            >
              {viewModel.primaryActionLabel}
            </Button>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={onReview} disabled={viewModel.reviewDisabled} icon={<ExternalLink className="h-5 w-5" />}>
                {viewModel.reviewActionLabel}
              </Button>
              {viewModel.reviewDisabledReason ? <p className="text-xs leading-5 text-text-muted">{viewModel.reviewDisabledReason}</p> : null}
            </div>
          </div>
          <p className={`${isActionNeeded ? 'mt-3' : 'mt-4'} text-sm text-text-muted`}>{viewModel.footerNote}</p>
        </div>
      </div>
      {viewModel.liquidationDistanceLine ? <p className="mt-4 text-sm text-safe-green">{viewModel.liquidationDistanceLine}</p> : null}
    </Card>
  )
}

function RecommendationMetric({ item }: { item: RecommendationMetricItem }) {
  const toneClass =
    item.tone === 'safe'
      ? 'text-safe-green'
      : item.tone === 'warning'
        ? 'text-warning-orange'
        : item.tone === 'muted'
          ? 'text-text-muted'
          : 'text-text-primary'

  return (
    <div>
      <p className="text-sm text-text-secondary">{item.label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{item.value}</p>
      {item.subtext ? <p className={`text-sm ${toneClass}`}>{item.subtext}</p> : null}
    </div>
  )
}
