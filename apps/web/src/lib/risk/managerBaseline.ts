import type { ManagerReadSourceState } from '../deepbook/readState'
import type { AppNetwork, CompleteNormalizedMarginState, NormalizedMarginState } from '../../types/margin'
import type { AddCollateralRecommendation } from './rescuePlans'
import { calcLiquidationDistancePct } from './liquidation'
import { getAddCollateralRecommendation, getRescueActionability } from './rescuePlans'
import { shortAddress } from '../utils/address'
import { getDebtDataStatus, getRiskRatioDisplay, type DebtDataStatus } from './riskRatio'

export type BaselineSourceLevel =
  | 'full-deepbook-baseline'
  | 'partial-deepbook-baseline'
  | 'simulated-demo-fallback'
  | 'estimated-projection'
  | 'unavailable'

export type MetricProvenance =
  | 'real-deepbook'
  | 'protocol-config'
  | 'app-setting'
  | 'simulated-shock'
  | 'derived-estimate'
  | 'demo-fallback'
  | 'unavailable'

export type ProvenancedMetric = {
  value?: number
  provenance: MetricProvenance
  label: string
  display: string
}

export type ManagerBaselineFields = {
  startSuiPrice: ProvenancedMetric
  shockedPrice: ProvenancedMetric
  currentRiskRatio: ProvenancedMetric
  stressedRiskRatio: ProvenancedMetric
  liquidationThreshold: ProvenancedMetric
  targetRescueRatio: ProvenancedMetric
  assetValue: ProvenancedMetric
  debtValue: ProvenancedMetric
  borrowApr: ProvenancedMetric
  interestDrift: ProvenancedMetric
  addCollateralRecommendation: ProvenancedMetric
  expectedAfterRiskRatio: ProvenancedMetric
}

export type ManagerBaseline = {
  sourceLevel: BaselineSourceLevel
  sourceLabel: string
  reason: string
  state?: NormalizedMarginState
  managerShort?: string
  selectedNetwork?: AppNetwork
  marketLabel: 'SUI/USDC'
  debtDataStatus: DebtDataStatus
  actionability: ReturnType<typeof getRescueActionability>
  recommendation?: AddCollateralRecommendation
  canUseForRealRescueBaseline: boolean
  canOpenRealAddCollateralReview: boolean
  canShowLiveSigningCta: boolean
  fields: ManagerBaselineFields
}

export function createManagerBaseline(input: {
  state?: NormalizedMarginState
  sourceState?: ManagerReadSourceState
  selectedNetwork?: AppNetwork
}): ManagerBaseline {
  const state = input.state
  const selectedNetwork = input.selectedNetwork ?? state?.manager.network
  const managerShort = state ? shortAddress(state.manager.objectId) : undefined
  const debtDataStatus = getDebtDataStatus(state)
  const unsupportedMainnetSuiUsdc =
    state && (state.manager.network !== 'mainnet' || state.manager.poolKey !== 'SUI_USDC' || selectedNetwork !== 'mainnet')

  if (!state) {
    return {
      sourceLevel: input.sourceState === 'read-error' || input.sourceState === 'unavailable' ? 'unavailable' : 'simulated-demo-fallback',
      sourceLabel: input.sourceState === 'read-error' ? 'Unavailable' : 'Demo fallback',
      reason: input.sourceState === 'read-error' ? 'Could not read manager state.' : 'No eligible Mainnet SUI/USDC manager baseline is available.',
      selectedNetwork,
      marketLabel: 'SUI/USDC',
      debtDataStatus,
      actionability: 'unavailable',
      canUseForRealRescueBaseline: false,
      canOpenRealAddCollateralReview: false,
      canShowLiveSigningCta: false,
      fields: createFieldProvenance(undefined, 'simulated-demo-fallback', undefined, debtDataStatus),
    }
  }

  if (unsupportedMainnetSuiUsdc) {
    return {
      sourceLevel: 'simulated-demo-fallback',
      sourceLabel: 'Demo fallback',
      reason: 'Round 7L real baseline support is limited to Mainnet SUI/USDC.',
      state,
      managerShort,
      selectedNetwork,
      marketLabel: 'SUI/USDC',
      debtDataStatus,
      actionability: 'unavailable',
      canUseForRealRescueBaseline: false,
      canOpenRealAddCollateralReview: false,
      canShowLiveSigningCta: false,
      fields: createFieldProvenance(state, 'simulated-demo-fallback', undefined, debtDataStatus),
    }
  }

  if (state.source !== 'deepbook' || input.sourceState === 'mock-fallback') {
    return {
      sourceLevel: 'simulated-demo-fallback',
      sourceLabel: 'Demo fallback',
      reason: 'Source is simulated or mock-only.',
      state,
      managerShort,
      selectedNetwork,
      marketLabel: 'SUI/USDC',
      debtDataStatus,
      actionability: 'unavailable',
      canUseForRealRescueBaseline: false,
      canOpenRealAddCollateralReview: false,
      canShowLiveSigningCta: false,
      fields: createFieldProvenance(state, 'simulated-demo-fallback', undefined, debtDataStatus),
    }
  }

  if (input.sourceState === 'partial-deepbook' || state.isPartial) {
    const actionability = debtDataStatus === 'zero-debt' ? 'zero-debt' : 'unavailable'
    const reason =
      debtDataStatus === 'zero-debt'
        ? 'No active borrowed debt. Partial DeepBook baseline is display-only and cannot drive live signing.'
        : debtDataStatus === 'insufficient-debt-data'
          ? 'Debt fields are unavailable in this partial DeepBook read; baseline is display-only and cannot prove no-debt actionability.'
          : 'Partial DeepBook baseline is display-only and cannot drive live signing.'

    return {
      sourceLevel: 'partial-deepbook-baseline',
      sourceLabel: 'Partial DeepBook baseline',
      reason,
      state,
      managerShort,
      selectedNetwork,
      marketLabel: 'SUI/USDC',
      debtDataStatus,
      actionability,
      canUseForRealRescueBaseline: false,
      canOpenRealAddCollateralReview: false,
      canShowLiveSigningCta: false,
      fields: createFieldProvenance(state, 'partial-deepbook-baseline', undefined, debtDataStatus),
    }
  }

  if (input.sourceState !== 'full-deepbook') {
    return {
      sourceLevel: 'unavailable',
      sourceLabel: 'Unavailable',
      reason: 'Full DeepBook manager state is required for real baseline actionability.',
      state,
      managerShort,
      selectedNetwork,
      marketLabel: 'SUI/USDC',
      debtDataStatus,
      actionability: 'unavailable',
      canUseForRealRescueBaseline: false,
      canOpenRealAddCollateralReview: false,
      canShowLiveSigningCta: false,
      fields: createFieldProvenance(state, 'unavailable', undefined, debtDataStatus),
    }
  }

  const actionability = getRescueActionability(state, input.sourceState)
  const recommendation = getAddCollateralRecommendation(state, input.sourceState)
  const hasPositiveRecommendation = Boolean(recommendation && recommendation.addAmountUsdc > 0)
  const canUseForRealRescueBaseline = hasCoreActionabilityFields(state)
  const canOpenRealAddCollateralReview = canUseForRealRescueBaseline && actionability === 'action-needed' && hasPositiveRecommendation
  const reason =
    actionability === 'no-rescue-needed'
      ? 'No rescue needed while RR is above target.'
      : actionability === 'zero-debt'
        ? 'No active borrowed debt. Add Collateral is not required.'
        : canOpenRealAddCollateralReview
          ? 'Full DeepBook action-needed baseline is eligible for Transaction Review.'
          : 'Full DeepBook baseline is missing required actionability fields.'

  return {
    sourceLevel: 'full-deepbook-baseline',
    sourceLabel: 'Real DeepBook baseline',
    reason,
    state,
    managerShort,
    selectedNetwork,
    marketLabel: 'SUI/USDC',
    debtDataStatus,
    actionability,
    recommendation,
    canUseForRealRescueBaseline,
    canOpenRealAddCollateralReview,
    canShowLiveSigningCta: canOpenRealAddCollateralReview,
    fields: createFieldProvenance(state, 'full-deepbook-baseline', recommendation, debtDataStatus),
  }
}

export function toCompletePlanningState(state: NormalizedMarginState): CompleteNormalizedMarginState | undefined {
  if (!hasPlanningFields(state)) return undefined

  const liquidationPriceUsd = state.liquidationPriceUsd ?? deriveLiquidationPriceUsd(state)
  if (liquidationPriceUsd === undefined) return undefined

  const liquidationDistancePct =
    state.liquidationDistancePct ?? calcLiquidationDistancePct(state.riskRatio, state.liquidationRiskRatio)

  return {
    ...state,
    walletAddress: state.walletAddress ?? '',
    baseAsset: state.baseAsset,
    quoteAsset: state.quoteAsset,
    baseDebt: state.baseDebt,
    quoteDebt: state.quoteDebt,
    basePriceUsd: state.basePriceUsd,
    quotePriceUsd: state.quotePriceUsd,
    assetValueUsd: state.assetValueUsd,
    debtValueUsd: state.debtValueUsd,
    riskRatio: state.riskRatio,
    startingRiskRatio: state.startingRiskRatio ?? state.riskRatio,
    liquidationRiskRatio: state.liquidationRiskRatio,
    targetRiskRatio: state.targetRiskRatio,
    liquidationDistancePct,
    liquidationDistanceAfterPct: state.liquidationDistanceAfterPct ?? liquidationDistancePct,
    liquidationPriceUsd,
    borrowAprDecimal: state.borrowAprDecimal ?? 0,
    borrowAprDisplayPct: state.borrowAprDisplayPct ?? 0,
    demoBorrowAprDecimal: state.demoBorrowAprDecimal ?? state.borrowAprDecimal ?? 0,
    demoBorrowAprDisplayPct: state.demoBorrowAprDisplayPct ?? state.borrowAprDisplayPct ?? 0,
  }
}

export function getMetricProvenanceLabel(provenance: MetricProvenance) {
  if (provenance === 'real-deepbook') return 'Real DeepBook'
  if (provenance === 'protocol-config') return 'Protocol config'
  if (provenance === 'app-setting') return 'App target'
  if (provenance === 'simulated-shock') return 'Simulated shock'
  if (provenance === 'derived-estimate') return 'Estimate'
  if (provenance === 'demo-fallback') return 'Demo fallback'

  return 'Unavailable'
}

function createFieldProvenance(
  state: NormalizedMarginState | undefined,
  sourceLevel: BaselineSourceLevel,
  recommendation?: AddCollateralRecommendation,
  debtDataStatus: DebtDataStatus = getDebtDataStatus(state),
): ManagerBaselineFields {
  const real = sourceLevel === 'full-deepbook-baseline' || sourceLevel === 'partial-deepbook-baseline'
  const realOrFallback: MetricProvenance = real ? 'real-deepbook' : sourceLevel === 'unavailable' ? 'unavailable' : 'demo-fallback'
  const currentRiskRatio = getRiskRatioDisplay({ riskRatio: state?.riskRatio, debtStatus: debtDataStatus })
  const currentRiskRatioValue = currentRiskRatio.kind === 'finite' ? currentRiskRatio.value : undefined

  return {
    startSuiPrice: metric(state?.basePriceUsd, realOrFallback),
    shockedPrice: metric(undefined, 'simulated-shock'),
    currentRiskRatio: metric(currentRiskRatioValue, realOrFallback, currentRiskRatio.display),
    stressedRiskRatio: metric(undefined, real ? 'derived-estimate' : realOrFallback),
    liquidationThreshold: metric(state?.liquidationRiskRatio, state?.liquidationRiskRatio === undefined ? 'unavailable' : 'protocol-config'),
    targetRescueRatio: metric(state?.targetRiskRatio, state?.targetRiskRatio === undefined ? 'unavailable' : 'app-setting'),
    assetValue: metric(state?.assetValueUsd, realOrFallback),
    debtValue: metric(state?.debtValueUsd, realOrFallback),
    borrowApr: metric(state?.borrowAprDisplayPct, state?.borrowAprDisplayPct === undefined ? 'unavailable' : realOrFallback),
    interestDrift: metric(state?.borrowAprDisplayPct, state?.borrowAprDisplayPct === undefined ? 'unavailable' : 'derived-estimate'),
    addCollateralRecommendation: metric(recommendation?.addAmountUsdc, recommendation ? 'derived-estimate' : 'unavailable'),
    expectedAfterRiskRatio: metric(recommendation?.expectedAfterRiskRatio, recommendation ? 'derived-estimate' : 'unavailable'),
  }
}

function metric(value: number | undefined, provenance: MetricProvenance, display?: string): ProvenancedMetric {
  const resolvedProvenance =
    value === undefined && display === undefined && provenance !== 'simulated-shock' && provenance !== 'derived-estimate'
      ? 'unavailable'
      : provenance

  return {
    value,
    provenance: resolvedProvenance,
    label: getMetricProvenanceLabel(resolvedProvenance),
    display: display ?? formatMetricDisplay(value),
  }
}

function formatMetricDisplay(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return 'N/A'

  return value.toFixed(2)
}

function hasCoreActionabilityFields(state: NormalizedMarginState) {
  return (
    isValidObjectId(state.manager.objectId) &&
    state.manager.network === 'mainnet' &&
    state.manager.poolKey === 'SUI_USDC' &&
    state.riskRatio !== undefined &&
    state.assetValueUsd !== undefined &&
    state.debtValueUsd !== undefined &&
    state.targetRiskRatio !== undefined &&
    state.liquidationRiskRatio !== undefined
  )
}

function hasPlanningFields(state: NormalizedMarginState): state is NormalizedMarginState & {
  baseAsset: number
  quoteAsset: number
  baseDebt: number
  quoteDebt: number
  basePriceUsd: number
  quotePriceUsd: number
  assetValueUsd: number
  debtValueUsd: number
  riskRatio: number
  liquidationRiskRatio: number
  targetRiskRatio: number
} {
  return (
    state.baseAsset !== undefined &&
    state.quoteAsset !== undefined &&
    state.baseDebt !== undefined &&
    state.quoteDebt !== undefined &&
    state.basePriceUsd !== undefined &&
    state.quotePriceUsd !== undefined &&
    state.assetValueUsd !== undefined &&
    state.debtValueUsd !== undefined &&
    state.riskRatio !== undefined &&
    state.liquidationRiskRatio !== undefined &&
    state.targetRiskRatio !== undefined
  )
}

function deriveLiquidationPriceUsd(state: NormalizedMarginState & {
  baseAsset: number
  quoteAsset: number
  baseDebt: number
  quoteDebt: number
  quotePriceUsd: number
  liquidationRiskRatio: number
}) {
  const denominator = state.baseAsset - state.liquidationRiskRatio * state.baseDebt
  if (denominator <= 0) return undefined

  const numerator = state.liquidationRiskRatio * state.quoteDebt * state.quotePriceUsd - state.quoteAsset * state.quotePriceUsd
  const price = numerator / denominator

  return Number.isFinite(price) && price > 0 ? price : undefined
}

function isValidObjectId(value: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(value)
}
