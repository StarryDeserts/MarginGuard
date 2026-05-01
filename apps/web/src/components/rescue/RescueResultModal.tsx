import { ExternalLink, PlayCircle, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createAddCollateralResultView } from '../../lib/tx/addCollateralResult'
import type { AddCollateralExecutionState } from '../../types/tx'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

type RescueResultModalProps = {
  open: boolean
  executionState?: AddCollateralExecutionState
  onRetryRefresh?: () => void
  onClose: () => void
}

export function RescueResultModal({ open, executionState, onRetryRefresh, onClose }: RescueResultModalProps) {
  const navigate = useNavigate()
  const resultView = createAddCollateralResultView(executionState)

  return (
    <Modal open={open} title={resultView.title} subtitle={resultView.subtitle} onClose={onClose}>
      <div className="space-y-4">
        <section className="rounded-lg border border-guard-border p-4">
          <div className="grid gap-4 md:grid-cols-4">
            {resultView.details.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase text-text-muted">{label}</p>
                <p className="mt-1 break-words font-semibold text-text-primary">{value}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-guard-border p-4">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            {resultView.isMock ? 'Mock Execution Timeline' : 'Execution Timeline'}
          </h3>
          <div className="grid gap-3 md:grid-cols-4">
            {resultView.timeline.map((step) => (
              <div
                key={step.label}
                className={`rounded-lg p-3 text-sm ${step.done ? 'bg-safe-green/10 text-safe-green' : 'bg-white/5 text-text-muted'}`}
              >
                {step.label}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-text-secondary">{resultView.copy}</p>
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          {resultView.explorerUrl ? (
            <a
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-guard-border-strong bg-guard-surface/80 px-4 text-sm font-semibold text-text-primary transition-colors hover:border-sui-cyan hover:text-sui-cyan"
              href={resultView.explorerUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-5 w-5" />
              View on Sui Explorer
            </a>
          ) : null}
          {resultView.showRetryRefresh ? (
            <Button variant="secondary" onClick={onRetryRefresh}>
              Retry Manager Refresh
            </Button>
          ) : null}
          <Button
            icon={<TrendingUp className="h-5 w-5" />}
            onClick={() => {
              onClose()
              navigate('/dashboard')
            }}
          >
            Back to Risk Dashboard
          </Button>
          <Button
            variant="secondary"
            icon={<PlayCircle className="h-5 w-5" />}
            onClick={() => {
              onClose()
              navigate('/demo')
            }}
          >
            Run Demo Flow
          </Button>
        </div>
      </div>
    </Modal>
  )
}
