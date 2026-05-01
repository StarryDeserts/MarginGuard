import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { FailureConditionsCard } from '../components/rescue/FailureConditionsCard'
import { LiquidationCushionComparison } from '../components/rescue/LiquidationCushionComparison'
import { RescueResultModal } from '../components/rescue/RescueResultModal'
import { RescuePlanGrid } from '../components/rescue/RescuePlanGrid'
import { SimulationSummaryPanel } from '../components/rescue/SimulationSummaryPanel'
import { TransactionReviewModal } from '../components/rescue/TransactionReviewModal'
import { RiskRatioPathChart } from '../components/risk/RiskRatioPathChart'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { mockComputedValues, mockMarginState, mockNumericValues } from '../lib/demo/mockMarginState'
import { rescueRiskPath } from '../lib/risk/riskRatio'
import { formatRatio } from '../lib/utils/format'
import type { RescuePlan } from '../types/rescue'
import { useTransactionReview } from '../hooks/useTransactionReview'
import { useActiveManagerRiskSnapshot } from '../hooks/useActiveManagerRiskSnapshot'
import { createRescueSimulatorModel } from '../lib/risk/rescueSimulatorModel'

export function RescueSimulator() {
  const navigate = useNavigate()
  const review = useTransactionReview()
  const snapshot = useActiveManagerRiskSnapshot()
  const [selectedPlanId, setSelectedPlanId] = useState('add-collateral')
  const [addCollateralUsdOverride, setAddCollateralUsdOverride] = useState<number | undefined>(undefined)
  const [reduceSizeDecimal, setReduceSizeDecimal] = useState<number>(mockNumericValues.reduceSizeDecimal)
  const [stopLossUsdc, setStopLossUsdc] = useState<number>(mockNumericValues.smartTpslStopLossUsdc)
  const [tpslBufferDecimal, setTpslBufferDecimal] = useState<number>(mockComputedValues.smartTpslBufferDecimal)
  const recommendedAddCollateralUsd = snapshot.baseline.recommendation?.addAmountUsdc
  const addCollateralUsd =
    addCollateralUsdOverride ??
    (recommendedAddCollateralUsd && recommendedAddCollateralUsd > 0
      ? Math.round(recommendedAddCollateralUsd)
      : Math.round(mockComputedValues.recommendedAddCollateralUsd))
  const simulatorModel = createRescueSimulatorModel({
    state: snapshot.state,
    sourceState: snapshot.sourceState,
    selectedNetwork: snapshot.selectedNetwork,
    inputs: { addCollateralUsd, reduceSizeDecimal, stopLossUsdc, tpslBufferDecimal },
  })
  const plans = simulatorModel.plans
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0]
  const smartTpslPlan = plans.find((plan) => plan.type === 'SMART_TPSL')
  const liquidationPriceUsdc = Number(smartTpslPlan?.params.liquidationPriceUsdc ?? mockMarginState.liquidationPriceUsd)
  const currentRiskRatioDisplay = simulatorModel.currentRiskRatioDisplay
  const liquidationThreshold = simulatorModel.baseline.fields.liquidationThreshold.value ?? mockMarginState.liquidationRiskRatio
  const targetRiskRatio = simulatorModel.baseline.fields.targetRescueRatio.value ?? mockMarginState.targetRiskRatio
  const sourceNotice =
    simulatorModel.sourceMode === 'real-full'
      ? simulatorModel.statusCopy
      : simulatorModel.sourceMode === 'real-partial'
        ? simulatorModel.statusCopy
        : 'Simulated fallback - Rescue Simulator can run without a manager and never opens a wallet prompt from simulated state.'

  const inputErrors = {
    ADD_COLLATERAL: addCollateralUsd <= 0 ? 'Add collateral amount must be greater than 0.' : undefined,
    REDUCE_ONLY_CLOSE:
      reduceSizeDecimal <= 0 || reduceSizeDecimal > 0.8 ? 'Reduce-only size must be between 1% and 80%.' : undefined,
    SMART_TPSL: stopLossUsdc <= liquidationPriceUsdc ? 'Stop-loss must stay above liquidation price.' : undefined,
  }

  function selectPlan(plan: RescuePlan) {
    setSelectedPlanId(plan.id)
  }

  function openAddCollateralReview() {
    review.openReview(simulatorModel.addCollateralReviewModel)
  }

  return (
    <AppShell title="Rescue Simulator">
      <Card className="mb-5 border-warning-orange/70 p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant={simulatorModel.baseline.sourceLevel === 'full-deepbook-baseline' ? 'recommended' : simulatorModel.baseline.sourceLevel === 'partial-deepbook-baseline' ? 'warning' : 'info'}>
            {simulatorModel.sourceBadge}
          </Badge>
          <Badge variant="neutral">{simulatorModel.planSourceLabel === 'Real DeepBook baseline' ? 'Estimated projections' : simulatorModel.planSourceLabel}</Badge>
          <span className="text-sm text-text-secondary">{sourceNotice}</span>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_1.2fr] xl:items-center">
          <div>
            <p className="text-sm text-text-secondary">Current RR</p>
            <div className="mt-2 flex items-center gap-4">
              <span
                className={`text-6xl font-semibold ${
                  simulatorModel.currentRiskRatioKind === 'finite' ? 'text-warning-orange' : 'text-sui-cyan'
                }`}
              >
                {currentRiskRatioDisplay}
              </span>
              <Badge
                variant={
                  simulatorModel.baseline.actionability === 'no-rescue-needed' || simulatorModel.baseline.actionability === 'zero-debt'
                    ? 'healthy'
                    : 'warning'
                }
              >
                {simulatorModel.statusTitle}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {simulatorModel.baseline.fields.currentRiskRatio.label}. {simulatorModel.baseline.reason}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Liquidation Threshold</p>
            <p className="mt-2 text-4xl font-semibold text-text-primary">{formatRatio(liquidationThreshold)}</p>
            <p className="mt-1 text-xs text-text-muted">{simulatorModel.baseline.fields.liquidationThreshold.label}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Target Rescue Ratio</p>
            <p className="mt-2 text-4xl font-semibold text-safe-green">{formatRatio(targetRiskRatio)}</p>
            <p className="mt-1 text-xs text-text-muted">{simulatorModel.baseline.fields.targetRescueRatio.label}</p>
          </div>
          <p className="text-lg text-text-secondary">Compare rescue options before Build unsigned PTB / Open Transaction Review.</p>
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-[1fr_25rem]">
        <div className="space-y-5">
          <RescuePlanGrid
            plans={plans}
            selectedId={selectedPlan.id}
            inputErrors={inputErrors}
            onReview={openAddCollateralReview}
            onSelect={selectPlan}
            onAddCollateralChange={setAddCollateralUsdOverride}
            onReduceSizeChange={setReduceSizeDecimal}
            onStopLossChange={(value) => {
              setStopLossUsdc(value)
              setTpslBufferDecimal(value / liquidationPriceUsdc - 1)
            }}
            onBufferChange={(value) => {
              setTpslBufferDecimal(value)
              setStopLossUsdc(liquidationPriceUsdc * (1 + value))
            }}
          />
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <RiskRatioPathChart title="Risk Ratio Path" points={rescueRiskPath} afterValue={mockMarginState.targetRiskRatio} targetRiskRatio={mockMarginState.targetRiskRatio} />
            <LiquidationCushionComparison />
          </div>
        </div>
        <div className="space-y-5">
          <SimulationSummaryPanel
            plan={selectedPlan}
            reviewDisabled={!simulatorModel.canOpenAddCollateralReview}
            reviewDisabledReason={
              simulatorModel.baseline.actionability === 'no-rescue-needed'
                ? 'No rescue needed'
                : simulatorModel.baseline.actionability === 'zero-debt'
                  ? 'Review disabled for current real baseline'
                : simulatorModel.baseline.sourceLevel === 'partial-deepbook-baseline'
                  ? 'Review disabled for current real baseline'
                  : 'Preview unavailable'
            }
            onReview={openAddCollateralReview}
            onBack={() => navigate('/dashboard')}
          />
          <FailureConditionsCard />
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="focus-ring flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-guard-border bg-guard-surface px-4 py-3 text-text-secondary transition-colors hover:border-sui-cyan hover:text-sui-cyan"
          >
            Back to Risk Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <TransactionReviewModal
        open={review.open}
        acknowledged={review.acknowledged}
        plan={selectedPlan}
        reviewModel={review.reviewModel}
        onAcknowledgedChange={review.setAcknowledged}
        onClose={review.closeReview}
      />
      <RescueResultModal open={review.resultOpen} onClose={review.closeResult} />
    </AppShell>
  )
}
