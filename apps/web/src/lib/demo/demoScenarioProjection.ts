import type { ManagerReadSourceState } from '../deepbook/readState'
import type { DemoScenario } from '../../types/demo'
import type { NormalizedMarginState } from '../../types/margin'
import { calcLiquidationDistancePct } from '../risk/liquidation'
import { createManagerBaseline, getMetricProvenanceLabel, type BaselineSourceLevel, type MetricProvenance } from '../risk/managerBaseline'
import { calcRiskRatio, getDebtDataStatus, getRiskRatioDisplay, type DebtDataStatus } from '../risk/riskRatio'
import { requiredAddCollateralValueUsd } from '../risk/value'
import { mockMarginState } from './mockMarginState'

export type DemoBaselineMode = 'simulated-demo' | 'real-baseline'
export type DemoProjectionMode = 'simulated-demo' | 'real-baseline-simulated-shock'

export type DemoProjectionMetric = {
  value: number
  provenance: MetricProvenance
  label: string
  display: string
}

export type DemoScenarioProjection = {
  mode: DemoProjectionMode
  baselineSourceLevel: BaselineSourceLevel
  debtDataStatus: DebtDataStatus
  sourceLabel: string
  canOpenWalletPrompt: false
  canOpenTransactionReview: false
  canRecommendAddCollateral: boolean
  noDebtCopy?: string
  startingRiskStateLabel: string
  stressedRiskStateLabel: string
  startPrice: DemoProjectionMetric
  shockedPrice: DemoProjectionMetric
  startingRiskRatio: DemoProjectionMetric
  stressedRiskRatio: DemoProjectionMetric
  liquidationThreshold: DemoProjectionMetric
  targetRescueRatio: DemoProjectionMetric
  assetValue: DemoProjectionMetric
  debtValue: DemoProjectionMetric
  borrowApr: DemoProjectionMetric
  interestDrift: DemoProjectionMetric
  addCollateralRecommendation: DemoProjectionMetric
  expectedAfterRiskRatio: DemoProjectionMetric
  liquidationDistancePct: DemoProjectionMetric
  afterLiquidationDistancePct: DemoProjectionMetric
}

export function createDemoScenarioProjection(input: {
  scenario: DemoScenario
  priceShockPct: number
  borrowAprDisplayPct: number
  baseline?: NormalizedMarginState
  baselineSourceState?: ManagerReadSourceState
  baselineMode: DemoBaselineMode
}): DemoScenarioProjection {
  const baseline = createManagerBaseline({
    state: input.baseline,
    sourceState: input.baselineSourceState,
    selectedNetwork: input.baseline?.manager.network,
  })
  const useRealBaseline =
    input.baselineMode === 'real-baseline' &&
    input.baseline &&
    (baseline.sourceLevel === 'full-deepbook-baseline' || baseline.sourceLevel === 'partial-deepbook-baseline')
  const state = useRealBaseline ? input.baseline! : mockMarginState
  const sourceLevel = useRealBaseline ? baseline.sourceLevel : 'simulated-demo-fallback'
  const mode: DemoProjectionMode = useRealBaseline ? 'real-baseline-simulated-shock' : 'simulated-demo'
  const debtDataStatus = useRealBaseline ? getDebtDataStatus(state) : 'active-debt'
  const hasNoDebtBaseline = useRealBaseline && debtDataStatus === 'zero-debt'
  const startPrice = state.basePriceUsd ?? input.scenario.startPrice
  const shockedPrice = startPrice * (1 - input.priceShockPct / 100)
  const stressed = !useRealBaseline
    ? {
        assetValueUsd: input.scenario.simulatedRiskRatio * mockMarginState.debtValueUsd,
        debtValueUsd: mockMarginState.debtValueUsd,
        riskRatio: input.scenario.simulatedRiskRatio,
      }
    : hasNoDebtBaseline
    ? {
        assetValueUsd: state.assetValueUsd ?? mockMarginState.assetValueUsd,
        debtValueUsd: 0,
        riskRatio: Number.NaN,
      }
    : deriveStressedValues({
        state,
        shockedPrice,
        scenario: input.scenario,
        priceShockPct: input.priceShockPct,
      })
  const targetRiskRatio = state.targetRiskRatio ?? input.scenario.targetRiskRatio
  const liquidationThreshold = state.liquidationRiskRatio ?? input.scenario.liquidationThreshold
  const addCollateralUsd = hasNoDebtBaseline ? 0 : requiredAddCollateralValueUsd(stressed.debtValueUsd, targetRiskRatio, stressed.assetValueUsd)
  const sourceLabel = getProjectionSourceLabel(mode, sourceLevel)
  const startingRiskRatioDisplay = getRiskRatioDisplay({
    riskRatio: state.riskRatio ?? input.scenario.startingRiskRatio,
    debtStatus: debtDataStatus,
  })
  const stressedRiskRatioDisplay = hasNoDebtBaseline
    ? { display: 'N/A', value: Number.NaN }
    : getRiskRatioDisplay({ riskRatio: stressed.riskRatio, debtStatus: debtDataStatus })
  const canRecommendAddCollateral = !hasNoDebtBaseline && addCollateralUsd > 0

  return {
    mode,
    baselineSourceLevel: sourceLevel,
    debtDataStatus,
    sourceLabel,
    canOpenWalletPrompt: false,
    canOpenTransactionReview: false,
    canRecommendAddCollateral,
    noDebtCopy: hasNoDebtBaseline
      ? 'This real manager has no active debt. Switch to Simulated Demo Mode to show an action-needed rescue story.'
      : undefined,
    startingRiskStateLabel: hasNoDebtBaseline ? 'No active liquidation risk' : 'Guarded',
    stressedRiskStateLabel: hasNoDebtBaseline ? 'No active liquidation risk' : 'Warning',
    startPrice: metric(startPrice, useRealBaseline && input.baseline?.basePriceUsd !== undefined ? 'real-deepbook' : 'demo-fallback'),
    shockedPrice: metric(shockedPrice, 'simulated-shock'),
    startingRiskRatio: metric(
      startingRiskRatioDisplay.value ?? Number.NaN,
      useRealBaseline && state.riskRatio !== undefined ? 'real-deepbook' : 'demo-fallback',
      startingRiskRatioDisplay.display,
    ),
    stressedRiskRatio: metric(stressedRiskRatioDisplay.value ?? Number.NaN, useRealBaseline ? 'derived-estimate' : 'demo-fallback', stressedRiskRatioDisplay.display),
    liquidationThreshold: metric(liquidationThreshold, useRealBaseline && state.liquidationRiskRatio !== undefined ? 'protocol-config' : 'demo-fallback'),
    targetRescueRatio: metric(targetRiskRatio, useRealBaseline && state.targetRiskRatio !== undefined ? 'app-setting' : 'demo-fallback'),
    assetValue: metric(state.assetValueUsd ?? mockMarginState.assetValueUsd, useRealBaseline && state.assetValueUsd !== undefined ? 'real-deepbook' : 'demo-fallback'),
    debtValue: metric(state.debtValueUsd ?? mockMarginState.debtValueUsd, useRealBaseline && state.debtValueUsd !== undefined ? 'real-deepbook' : 'demo-fallback'),
    borrowApr: metric(input.borrowAprDisplayPct, useRealBaseline && state.borrowAprDisplayPct !== undefined ? 'derived-estimate' : 'demo-fallback'),
    interestDrift: metric(input.borrowAprDisplayPct, 'derived-estimate'),
    addCollateralRecommendation: metric(addCollateralUsd, 'derived-estimate', hasNoDebtBaseline ? 'No rescue needed' : undefined),
    expectedAfterRiskRatio: metric(hasNoDebtBaseline ? Number.NaN : targetRiskRatio, 'derived-estimate', hasNoDebtBaseline ? 'N/A' : undefined),
    liquidationDistancePct: metric(
      hasNoDebtBaseline ? Number.NaN : calcLiquidationDistancePct(stressed.riskRatio, liquidationThreshold),
      'derived-estimate',
      hasNoDebtBaseline ? 'N/A' : undefined,
    ),
    afterLiquidationDistancePct: metric(
      hasNoDebtBaseline ? Number.NaN : calcLiquidationDistancePct(targetRiskRatio, liquidationThreshold),
      'derived-estimate',
      hasNoDebtBaseline ? 'N/A' : undefined,
    ),
  }
}

function deriveStressedValues(input: {
  state: NormalizedMarginState
  shockedPrice: number
  scenario: DemoScenario
  priceShockPct: number
}) {
  if (
    input.state.baseAsset !== undefined &&
    input.state.quoteAsset !== undefined &&
    input.state.baseDebt !== undefined &&
    input.state.quoteDebt !== undefined
  ) {
    const quotePriceUsd = input.state.quotePriceUsd ?? 1
    const assetValueUsd = input.state.baseAsset * input.shockedPrice + input.state.quoteAsset * quotePriceUsd
    const debtValueUsd = input.state.baseDebt * input.shockedPrice + input.state.quoteDebt * quotePriceUsd

    return {
      assetValueUsd,
      debtValueUsd,
      riskRatio: calcRiskRatio(assetValueUsd, debtValueUsd),
    }
  }

  const riskRatio = Math.max(0, input.scenario.startingRiskRatio - (input.priceShockPct / 100) * 0.8)

  return {
    assetValueUsd: riskRatio * mockMarginState.debtValueUsd,
    debtValueUsd: mockMarginState.debtValueUsd,
    riskRatio,
  }
}

function metric(value: number, provenance: MetricProvenance, display?: string): DemoProjectionMetric {
  return {
    value,
    provenance,
    label: getMetricProvenanceLabel(provenance),
    display: display ?? formatMetricDisplay(value),
  }
}

function formatMetricDisplay(value: number) {
  if (!Number.isFinite(value)) return 'N/A'

  return value.toFixed(2)
}

function getProjectionSourceLabel(mode: DemoProjectionMode, sourceLevel: BaselineSourceLevel) {
  if (mode === 'simulated-demo') return 'Simulated Demo'
  if (sourceLevel === 'partial-deepbook-baseline') return 'Partial DeepBook baseline + simulated shock'

  return 'Real DeepBook baseline + simulated shock'
}
