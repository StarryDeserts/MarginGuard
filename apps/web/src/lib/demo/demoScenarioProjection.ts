import type { ManagerReadSourceState } from '../deepbook/readState'
import type { DemoScenario } from '../../types/demo'
import type { NormalizedMarginState } from '../../types/margin'
import { calcLiquidationDistancePct } from '../risk/liquidation'
import { createManagerBaseline, getMetricProvenanceLabel, type BaselineSourceLevel, type MetricProvenance } from '../risk/managerBaseline'
import { calcRiskRatio } from '../risk/riskRatio'
import { requiredAddCollateralValueUsd } from '../risk/value'
import { mockMarginState } from './mockMarginState'

export type DemoBaselineMode = 'simulated-demo' | 'real-baseline'
export type DemoProjectionMode = 'simulated-demo' | 'real-baseline-simulated-shock'

export type DemoProjectionMetric = {
  value: number
  provenance: MetricProvenance
  label: string
}

export type DemoScenarioProjection = {
  mode: DemoProjectionMode
  baselineSourceLevel: BaselineSourceLevel
  sourceLabel: string
  canOpenWalletPrompt: false
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
  const startPrice = state.basePriceUsd ?? input.scenario.startPrice
  const shockedPrice = startPrice * (1 - input.priceShockPct / 100)
  const stressed = deriveStressedValues({
    state,
    shockedPrice,
    scenario: input.scenario,
    priceShockPct: input.priceShockPct,
  })
  const targetRiskRatio = state.targetRiskRatio ?? input.scenario.targetRiskRatio
  const liquidationThreshold = state.liquidationRiskRatio ?? input.scenario.liquidationThreshold
  const addCollateralUsd = requiredAddCollateralValueUsd(stressed.debtValueUsd, targetRiskRatio, stressed.assetValueUsd)
  const sourceLabel = getProjectionSourceLabel(mode, sourceLevel)

  return {
    mode,
    baselineSourceLevel: sourceLevel,
    sourceLabel,
    canOpenWalletPrompt: false,
    startPrice: metric(startPrice, useRealBaseline && input.baseline?.basePriceUsd !== undefined ? 'real-deepbook' : 'demo-fallback'),
    shockedPrice: metric(shockedPrice, 'simulated-shock'),
    startingRiskRatio: metric(state.riskRatio ?? input.scenario.startingRiskRatio, useRealBaseline && state.riskRatio !== undefined ? 'real-deepbook' : 'demo-fallback'),
    stressedRiskRatio: metric(stressed.riskRatio, useRealBaseline ? 'derived-estimate' : 'demo-fallback'),
    liquidationThreshold: metric(liquidationThreshold, useRealBaseline && state.liquidationRiskRatio !== undefined ? 'protocol-config' : 'demo-fallback'),
    targetRescueRatio: metric(targetRiskRatio, useRealBaseline && state.targetRiskRatio !== undefined ? 'app-setting' : 'demo-fallback'),
    assetValue: metric(state.assetValueUsd ?? mockMarginState.assetValueUsd, useRealBaseline && state.assetValueUsd !== undefined ? 'real-deepbook' : 'demo-fallback'),
    debtValue: metric(state.debtValueUsd ?? mockMarginState.debtValueUsd, useRealBaseline && state.debtValueUsd !== undefined ? 'real-deepbook' : 'demo-fallback'),
    borrowApr: metric(input.borrowAprDisplayPct, useRealBaseline && state.borrowAprDisplayPct !== undefined ? 'derived-estimate' : 'demo-fallback'),
    interestDrift: metric(input.borrowAprDisplayPct, 'derived-estimate'),
    addCollateralRecommendation: metric(addCollateralUsd, 'derived-estimate'),
    expectedAfterRiskRatio: metric(targetRiskRatio, 'derived-estimate'),
    liquidationDistancePct: metric(calcLiquidationDistancePct(stressed.riskRatio, liquidationThreshold), 'derived-estimate'),
    afterLiquidationDistancePct: metric(calcLiquidationDistancePct(targetRiskRatio, liquidationThreshold), 'derived-estimate'),
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

function metric(value: number, provenance: MetricProvenance): DemoProjectionMetric {
  return {
    value,
    provenance,
    label: getMetricProvenanceLabel(provenance),
  }
}

function getProjectionSourceLabel(mode: DemoProjectionMode, sourceLevel: BaselineSourceLevel) {
  if (mode === 'simulated-demo') return 'Simulated Demo'
  if (sourceLevel === 'partial-deepbook-baseline') return 'Partial DeepBook baseline + simulated shock'

  return 'Real DeepBook baseline + simulated shock'
}
