import { AppShell } from '../components/layout/AppShell'
import { DemoNotesCard } from '../components/demo/DemoNotesCard'
import { DemoRescueRecommendation } from '../components/demo/DemoRescueRecommendation'
import { DemoRiskPreview } from '../components/demo/DemoRiskPreview'
import { DemoScenarioControls } from '../components/demo/DemoScenarioControls'
import { DemoScenarioStrip } from '../components/demo/DemoScenarioStrip'
import { DemoStepper } from '../components/demo/DemoStepper'
import { RescueResultModal } from '../components/rescue/RescueResultModal'
import { TransactionReviewModal } from '../components/rescue/TransactionReviewModal'
import { RiskRatioPathChart } from '../components/risk/RiskRatioPathChart'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useActiveManagerRiskSnapshot } from '../hooks/useActiveManagerRiskSnapshot'
import { useDemoScenario } from '../hooks/useDemoScenario'
import { useTransactionReview } from '../hooks/useTransactionReview'
import { mockRescuePlans, recommendedRescuePlan } from '../lib/demo/mockRescuePlans'
import { demoRiskPath } from '../lib/risk/riskRatio'
import { formatDecimalPct, formatRatio } from '../lib/utils/format'
import type { RescuePlan } from '../types/rescue'

export function Demo() {
  const snapshot = useActiveManagerRiskSnapshot()
  const demo = useDemoScenario({ baseline: snapshot.state, baselineSourceState: snapshot.sourceState })
  const review = useTransactionReview()
  const projection = demo.projection
  const realBaselineAvailable =
    snapshot.baseline.sourceLevel === 'full-deepbook-baseline' || snapshot.baseline.sourceLevel === 'partial-deepbook-baseline'
  const demoReviewPlan: RescuePlan = {
    ...recommendedRescuePlan,
    beforeRiskRatio: demo.derived.simulatedRiskRatio,
    expectedAfterRiskRatio: demo.derived.afterRiskRatio,
    liquidationDistanceBeforePct: demo.derived.liquidationDistancePct,
    liquidationDistanceAfterPct: demo.derived.afterLiquidationDistancePct,
    estimatedCostUsd: demo.derived.recommendedAddCollateralUsd,
    params: {
      ...recommendedRescuePlan.params,
      addAmountUsdc: demo.derived.recommendedAddCollateralUsd,
    },
  }

  return (
    <AppShell title="Demo Mode">
      <div className="mb-5">
        <p className="text-text-secondary">
          Simulate market stress from either demo values or a real manager baseline, preview Add Collateral review, and show a clearly
          labeled mock result without opening a wallet.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-5">
          <DemoScenarioStrip
            scenario={demo.scenario}
            sourceLabel={projection.sourceLabel}
            startPrice={projection.startPrice.value}
            shockedPrice={demo.derived.shockedPrice}
            startingRiskRatio={projection.startingRiskRatio.value}
            simulatedRiskRatio={demo.derived.simulatedRiskRatio}
            liquidationThreshold={projection.liquidationThreshold.value}
            targetRiskRatio={projection.targetRescueRatio.value}
            provenanceLabels={{
              startPrice: projection.startPrice.label,
              shockedPrice: projection.shockedPrice.label,
              startingRiskRatio: projection.startingRiskRatio.label,
              simulatedRiskRatio: projection.stressedRiskRatio.label,
              liquidationThreshold: projection.liquidationThreshold.label,
              targetRiskRatio: projection.targetRescueRatio.label,
            }}
          />
          <div className="grid gap-5 xl:grid-cols-[25rem_1fr]">
            <DemoScenarioControls
              scenarios={demo.scenarios}
              scenarioId={demo.scenarioId}
              baselineMode={demo.baselineMode}
              sourceLabel={projection.sourceLabel}
              realBaselineAvailable={realBaselineAvailable}
              priceShockPct={demo.priceShockPct}
              startPrice={projection.startPrice.value}
              shockedPrice={demo.derived.shockedPrice}
              borrowApr={demo.borrowApr}
              onScenarioChange={demo.selectScenario}
              onBaselineModeChange={demo.setBaselineMode}
              onPriceShockChange={demo.setPriceShockPct}
              onBorrowAprChange={demo.setBorrowApr}
              onRunScenario={demo.runScenario}
            />
            <DemoRiskPreview
              sourceLabel={projection.sourceLabel}
              borrowApr={demo.borrowApr}
              borrowAprLabel={projection.borrowApr.label}
              interestDriftLabel={projection.interestDrift.label}
              simulatedRiskRatio={demo.derived.simulatedRiskRatio}
              simulatedRiskRatioLabel={projection.stressedRiskRatio.label}
              assetValueUsd={projection.assetValue.value}
              assetValueLabel={projection.assetValue.label}
              debtValueUsd={projection.debtValue.value}
              debtValueLabel={projection.debtValue.label}
              liquidationDistancePct={demo.derived.liquidationDistancePct}
              liquidationDistanceLabel={projection.liquidationDistancePct.label}
            />
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <RiskRatioPathChart title="Simulated Risk Ratio Path" points={demoRiskPath} afterValue={1.3} />
            <DemoStepper activeStep={demo.activeStep} onStepChange={demo.setActiveStep} />
          </div>
        </div>
        <div className="space-y-5">
          <DemoRescueRecommendation
            beforeRiskRatio={demo.derived.simulatedRiskRatio}
            afterRiskRatio={demo.derived.afterRiskRatio}
            addCollateralUsd={demo.derived.recommendedAddCollateralUsd}
            addCollateralLabel={projection.addCollateralRecommendation.label}
            afterRiskRatioLabel={projection.expectedAfterRiskRatio.label}
            liquidationDistanceBeforePct={demo.derived.liquidationDistancePct}
            liquidationDistanceAfterPct={demo.derived.afterLiquidationDistancePct}
            onReview={review.openReview}
            onSimulatedResult={review.submitMock}
          />
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-xl font-semibold text-text-primary">Rescue Comparison</h2>
              <Badge variant="info">Simulated</Badge>
            </div>
            <div className="grid gap-3">
              {mockRescuePlans.map((plan) => (
                <div key={plan.id} className="rounded-lg border border-guard-border bg-guard-bg-soft p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{plan.title}</p>
                      <p className="text-sm text-text-secondary">
                        {plan.type === 'SMART_TPSL'
                          ? `Stop-loss ${Number(plan.params.stopLossUsdc).toFixed(2)} USDC`
                          : `After RR ${formatRatio(plan.expectedAfterRiskRatio)}`}
                      </p>
                    </div>
                    <Badge variant={plan.priority === 'P0' ? 'p0' : 'p1'}>{plan.recommended ? 'Recommended' : 'P1 preview'}</Badge>
                  </div>
                  {plan.type === 'REDUCE_ONLY_CLOSE' ? (
                    <p className="mt-2 text-xs text-text-muted">Reduce size {formatDecimalPct(Number(plan.params.reduceSizeDecimal))}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
          <DemoNotesCard />
        </div>
      </div>
      <TransactionReviewModal
        open={review.open}
        acknowledged={review.acknowledged}
        plan={demoReviewPlan}
        onAcknowledgedChange={review.setAcknowledged}
        onClose={review.closeReview}
      />
      <RescueResultModal open={review.resultOpen} onClose={review.closeResult} />
    </AppShell>
  )
}
