import { Clock, DatabaseZap, DollarSign, Percent, RefreshCw, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { ManagerContextCard } from '../components/manager/ManagerContextCard'
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup'
import { RescueResultModal } from '../components/rescue/RescueResultModal'
import { TransactionReviewModal } from '../components/rescue/TransactionReviewModal'
import { MetricCard } from '../components/risk/MetricCard'
import { RecommendedRescueActionCard } from '../components/risk/RecommendedRescueActionCard'
import { RiskRatioPathChart } from '../components/risk/RiskRatioPathChart'
import { RiskSummaryHero } from '../components/risk/RiskSummaryHero'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getDebtDataStatus, getRiskRatioDisplay } from '../lib/risk/riskRatio'
import { formatApr, formatPct, formatUsd } from '../lib/utils/format'
import { useActiveManagerRiskSnapshot } from '../hooks/useActiveManagerRiskSnapshot'
import { useTransactionReview } from '../hooks/useTransactionReview'
import type { NormalizedMarginState } from '../types/margin'
import type { ManagerReadDiagnostic } from '../hooks/useMarginManagerState'
import { createAddCollateralReviewModel } from '../lib/tx/addCollateralReview'
import { withLiveAddCollateralExecution, type ExecutionManagerRead } from '../lib/tx/addCollateralExecution'
import { useAddCollateralExecution } from '../hooks/useAddCollateralExecution'

export function Dashboard() {
  const review = useTransactionReview()
  const managerSnapshot = useActiveManagerRiskSnapshot()
  const managerState = managerSnapshot.managerState
  const execution = useAddCollateralExecution({
    rereadManagerState: refetchManagerRead,
    refreshManagerState: refetchManagerRead,
  })
  const state = managerSnapshot.state
  const sourceLabel = managerSnapshot.sourceLabel
  const sourceState = managerSnapshot.sourceState
  const addCollateralReviewModel = withLiveAddCollateralExecution(createAddCollateralReviewModel({ state, sourceState }))

  async function refetchManagerRead(): Promise<ExecutionManagerRead> {
    const result = await managerState.refetch()
    const data = result.data

    if (data?.status === 'success') {
      return {
        status: 'success',
        state: data.state,
        sourceState: data.state.isPartial ? 'partial-deepbook' : 'full-deepbook',
      }
    }

    return {
      status: 'error',
      message: data?.status === 'read-error' ? data.message : 'Could not refresh manager state before signing.',
    }
  }

  return (
    <AppShell title="Risk Dashboard">
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <RiskSummaryHero state={state} sourceLabel={sourceLabel} />
        <ManagerContextCard readStatusLabel={sourceLabel} />
      </div>
      <DashboardSourceCard status={managerState.status} sourceLabel={sourceLabel} message={managerState.sourceState.message} onRetry={managerState.refetch} />
      {import.meta.env.DEV ? <ReadDiagnosticsPanel diagnostic={managerState.diagnostic} /> : null}
      <StaggerGroup className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {buildMetrics(state).map((metric) => (
          <StaggerItem key={metric.label}>
            <MetricCard {...metric} />
          </StaggerItem>
        ))}
      </StaggerGroup>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.08fr]">
        {state ? (
          <DashboardRiskRatioPath state={state} sourceState={sourceState} />
        ) : (
          <Card className="p-5">
            <h2 className="text-xl font-semibold text-text-primary">Risk Ratio Path</h2>
            <p className="mt-3 text-sm text-text-secondary">
              Unavailable until DeepBook returns risk ratio or enough asset/debt data for an estimated value.
            </p>
          </Card>
        )}
        <RecommendedRescueActionCard
          onReview={() => review.openReview(addCollateralReviewModel)}
          state={state}
          sourceLabel={sourceLabel}
          sourceState={sourceState}
        />
      </div>
      <div className="mt-5 rounded-xl border border-sui-cyan/30 bg-sui-cyan/10 p-4 text-sm text-text-secondary">
        <ShieldAlert className="mr-2 inline h-4 w-4 text-sui-cyan" />
        Dashboard reads one manually imported manager only. No backend, no indexer, no keeper. Live Add Collateral requires an
        action-needed DeepBook state and explicit wallet approval.
      </div>
      <TransactionReviewModal
        open={review.open}
        acknowledged={review.acknowledged}
        reviewModel={review.reviewModel}
        executionState={execution.state}
        onAcknowledgedChange={review.setAcknowledged}
        onSubmit={() => execution.execute(review.reviewModel, review.acknowledged)}
        onClose={() => {
          review.closeReview()
          execution.reset()
        }}
      />
      <RescueResultModal
        open={review.resultOpen || execution.resultOpen}
        executionState={execution.resultOpen ? execution.state : undefined}
        onRetryRefresh={execution.retryRefresh}
        onClose={() => {
          review.closeResult()
          execution.closeResult()
        }}
      />
    </AppShell>
  )
}

function ReadDiagnosticsPanel({ diagnostic }: { diagnostic: ManagerReadDiagnostic }) {
  const rows = [
    ['Manager', diagnostic.managerObjectIdShort ?? 'none'],
    ['Wallet connected', diagnostic.walletConnected ? 'yes' : 'no'],
    ['Wallet address present', diagnostic.walletAddressPresent ? 'yes' : 'no'],
    ['Wallet network verified', diagnostic.walletNetworkVerified ? 'yes' : 'no'],
    ['App network', diagnostic.selectedNetwork ?? 'Unavailable'],
    ['Manager network', diagnostic.managerNetwork ?? 'Unavailable'],
    ['Pool key', diagnostic.selectedPoolKey ?? 'Unavailable'],
    ['Normalized pool key', diagnostic.normalizedPoolKey ?? 'Unavailable'],
    ['Pool config', diagnostic.poolConfigStatus],
    ['Query enabled', diagnostic.queryEnabled ? 'yes' : 'no'],
    ['Disabled reason', diagnostic.disabledReason ?? 'none'],
    ['Query status', diagnostic.queryStatus ?? 'idle'],
    ['SDK method called', diagnostic.sdkMethodCalled ? 'yes' : 'no'],
    ['SDK method name', diagnostic.sdkMethodName ?? 'none'],
    ['Configured manager key', diagnostic.configuredManagerKey ?? 'none'],
    ['SDK method argument', diagnostic.sdkMethodArgument ?? 'none'],
    ['SDK decimals argument', diagnostic.sdkDecimalsArgument === undefined ? 'undefined' : String(diagnostic.sdkDecimalsArgument)],
    ['SDK read status', diagnostic.sdkReadStatus ?? 'not-called'],
    ['Object verification status', diagnostic.objectVerificationStatus ?? 'not-run'],
    ['Object lookup status', diagnostic.objectLookupStatus ?? 'not-run'],
    ['Object type verification status', diagnostic.objectTypeVerificationStatus ?? 'not-run'],
    ['Actual object type', diagnostic.actualObjectType ?? 'Unavailable'],
    ['Expected base coin type', diagnostic.expectedBaseCoinType ?? 'Unavailable'],
    ['Expected quote coin type', diagnostic.expectedQuoteCoinType ?? 'Unavailable'],
    ['Type check reason', diagnostic.objectTypeCheckReason ?? 'none'],
    ['Normalize status', diagnostic.normalizeStatus ?? 'not-run'],
    ['Missing fields', diagnostic.missingFields?.join(', ') || 'none'],
    ['Source state', diagnostic.sourceState],
    ['Error category', diagnostic.errorCategory ?? 'none'],
    ['Sanitized error message', diagnostic.errorMessage ?? 'none'],
  ]

  return (
    <details className="mt-5 rounded-xl border border-guard-border bg-guard-surface/70 p-4 text-sm">
      <summary className="cursor-pointer font-semibold text-text-primary">Read Diagnostics</summary>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-guard-border bg-guard-bg-soft p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{label}</p>
            <p className="mt-1 break-words font-medium text-text-primary">{value}</p>
          </div>
        ))}
      </div>
    </details>
  )
}

function DashboardRiskRatioPath({
  state,
  sourceState,
}: {
  state: NormalizedMarginState
  sourceState: ReturnType<typeof useActiveManagerRiskSnapshot>['sourceState']
}) {
  const debtStatus = getDebtDataStatus(state)
  const riskRatioDisplay = getRiskRatioDisplay({ riskRatio: state.riskRatio, debtStatus })
  const currentRiskRatioDisplay = riskRatioDisplay.kind === 'finite' ? undefined : riskRatioDisplay.display

  return (
    <RiskRatioPathChart
      mode={sourceState === 'full-deepbook' || sourceState === 'partial-deepbook' ? 'deepbook' : 'mock'}
      currentRiskRatio={riskRatioDisplay.kind === 'finite' ? riskRatioDisplay.value : undefined}
      currentRiskRatioDisplay={currentRiskRatioDisplay}
      targetRiskRatio={state.targetRiskRatio}
      liquidationRiskRatio={state.liquidationRiskRatio}
      zeroDebt={debtStatus === 'zero-debt'}
    />
  )
}

function buildMetrics(state?: NormalizedMarginState) {
  const debtStatus = getDebtDataStatus(state)
  const riskRatioDisplay = getRiskRatioDisplay({ riskRatio: state?.riskRatio, debtStatus })
  const zeroDebt = debtStatus === 'zero-debt'
  const riskUnavailable = riskRatioDisplay.kind === 'unavailable'

  return [
          {
            label: 'Risk Ratio',
      value: riskRatioDisplay.kind === 'finite' ? riskRatioDisplay.value : undefined,
      valueText: riskRatioDisplay.kind === 'finite' ? undefined : riskRatioDisplay.display,
      helper: zeroDebt
        ? 'No active borrowed debt'
        : riskUnavailable
          ? 'Debt fields unavailable'
          : state?.riskRatio === undefined
            ? 'Unavailable'
            : state.isPartial
              ? 'Estimated or partial'
              : 'DeepBook read',
            icon: <TrendingUp className="h-5 w-5" />,
            tone: zeroDebt ? ('info' as const) : ('warning' as const),
          },
          {
            label: 'Liquidation Distance',
      value: zeroDebt ? undefined : state?.liquidationDistancePct,
      valueText: zeroDebt ? 'N/A' : undefined,
      helper: zeroDebt ? 'No active borrowed debt' : state?.liquidationDistancePct === undefined ? 'Unavailable' : 'From threshold',
            icon: <TrendingDown className="h-5 w-5" />,
            format: formatPct,
          },
          {
            label: 'Asset Value (USD)',
      value: state?.assetValueUsd,
      helper: state?.assetValueUsd === undefined ? 'Unavailable' : state.isPartial ? 'Estimated' : 'Total collateral',
            icon: <DollarSign className="h-5 w-5" />,
            format: formatUsd,
          },
          {
            label: 'Debt Value (USD)',
      value: state?.debtValueUsd,
      helper: zeroDebt ? 'No borrowed debt' : state?.debtValueUsd === undefined ? 'Unavailable' : 'Total borrowed',
            icon: <DollarSign className="h-5 w-5" />,
            format: formatUsd,
          },
          {
            label: 'Borrow APR',
      value: state?.borrowAprDisplayPct,
      helper: state?.borrowAprDisplayPct === undefined ? 'Unavailable' : 'Variable',
            icon: <Percent className="h-5 w-5" />,
            format: formatApr,
          },
          {
            label: 'Interest Drift',
      value: zeroDebt ? undefined : state?.borrowAprDisplayPct,
      valueText: zeroDebt ? 'No debt' : state?.borrowAprDisplayPct === undefined ? 'Unavailable' : 'Risk ratio may decline over time',
      helper: zeroDebt ? 'No active borrowed debt' : state?.borrowAprDisplayPct === undefined ? 'Borrow APR unavailable' : 'Estimate',
            icon: <Clock className="h-5 w-5" />,
            tone: 'purple' as const,
          },
        ]
}

function DashboardSourceCard({
  status,
  sourceLabel,
  message,
  onRetry,
}: {
  status: string
  sourceLabel: string
  message?: string
  onRetry: () => void
}) {
  const canRetry = status === 'error'

  return (
    <Card className="mt-5 border-sui-cyan/30 bg-sui-cyan/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <DatabaseZap className="mt-0.5 h-5 w-5 text-sui-cyan" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-text-primary">Read-only manager state</h2>
              <Badge variant={sourceLabel === 'DeepBook state' ? 'recommended' : sourceLabel === 'Partial DeepBook state' ? 'warning' : 'neutral'}>
                {sourceLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {message ?? 'Manager imported manually. No indexer required.'}
            </p>
          </div>
        </div>
        {canRetry ? (
          <Button variant="secondary" onClick={onRetry} icon={<RefreshCw className="h-4 w-4" />}>
            Retry read
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
