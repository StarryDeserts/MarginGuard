import type { CompleteNormalizedMarginState, NormalizedMarginState } from '../../types/margin'
import type { RescueActionability, RescuePlan } from '../../types/rescue'
import { calcLiquidationDistancePct } from './liquidation'
import { calcRiskRatio, DEBT_EPSILON_USD, getDebtDataStatus } from './riskRatio'
import { requiredAddCollateralValueUsd } from './value'

export type RescuePlanInputs = {
  addCollateralUsd?: number
  reduceSizeDecimal?: number
  stopLossUsdc?: number
  tpslBufferDecimal?: number
}

const DEFAULT_REDUCE_ONLY_EFFICIENCY = 0.815
export const ADD_COLLATERAL_EPSILON_USD = DEBT_EPSILON_USD

export type AddCollateralRecommendation = {
  addAmountUsdc: number
  expectedAfterRiskRatio: number
  liquidationDistanceBeforePct: number
  liquidationDistanceAfterPct: number
}

export function getRescueActionability(state?: NormalizedMarginState, sourceState?: string): RescueActionability {
  if (sourceState === 'read-error') return 'read-error'
  if (!state) return 'unavailable'
  if (getDebtDataStatus(state) === 'zero-debt') return 'zero-debt'
  if (sourceState === 'partial-deepbook') return 'unavailable'
  if (state.riskRatio === undefined || state.targetRiskRatio === undefined) return 'unavailable'
  if (state.assetValueUsd === undefined || state.debtValueUsd === undefined || state.liquidationRiskRatio === undefined) {
    return 'unavailable'
  }
  if (state.riskRatio >= state.targetRiskRatio) return 'no-rescue-needed'

  const addCollateralAmount = requiredAddCollateralValueUsd(state.debtValueUsd, state.targetRiskRatio, state.assetValueUsd)

  if (addCollateralAmount <= ADD_COLLATERAL_EPSILON_USD) return 'no-rescue-needed'

  return 'action-needed'
}

export function getAddCollateralRecommendation(
  state?: NormalizedMarginState,
  sourceState?: string,
): AddCollateralRecommendation | undefined {
  if (getRescueActionability(state, sourceState) !== 'action-needed') return undefined
  if (
    !state ||
    state.assetValueUsd === undefined ||
    state.debtValueUsd === undefined ||
    state.riskRatio === undefined ||
    state.targetRiskRatio === undefined ||
    state.liquidationRiskRatio === undefined
  ) {
    return undefined
  }

  const addAmountUsdc = requiredAddCollateralValueUsd(state.debtValueUsd, state.targetRiskRatio, state.assetValueUsd)
  const simulation = simulateAddCollateral(state.assetValueUsd, state.debtValueUsd, addAmountUsdc, state.liquidationRiskRatio)

  return {
    addAmountUsdc,
    expectedAfterRiskRatio: simulation.expectedAfterRiskRatio,
    liquidationDistanceBeforePct:
      state.liquidationDistancePct ?? calcLiquidationDistancePct(state.riskRatio, state.liquidationRiskRatio),
    liquidationDistanceAfterPct: simulation.liquidationDistanceAfterPct,
  }
}

export function simulateAddCollateral(assetValueUsd: number, debtValueUsd: number, addCollateralUsd: number, liquidationThreshold: number) {
  const afterAssetValueUsd = assetValueUsd + addCollateralUsd
  const expectedAfterRiskRatio = calcRiskRatio(afterAssetValueUsd, debtValueUsd)

  return {
    assetValueUsd: afterAssetValueUsd,
    debtValueUsd,
    expectedAfterRiskRatio,
    liquidationDistanceAfterPct: calcLiquidationDistancePct(expectedAfterRiskRatio, liquidationThreshold),
  }
}

export function simulateReduceOnly(
  assetValueUsd: number,
  debtValueUsd: number,
  reduceSizeDecimal: number,
  liquidationThreshold: number,
  efficiency = DEFAULT_REDUCE_ONLY_EFFICIENCY,
) {
  const clampedReduceSize = Math.min(Math.max(reduceSizeDecimal, 0), 0.95)
  const debtReductionUsd = debtValueUsd * clampedReduceSize
  const assetReductionUsd = debtReductionUsd * efficiency
  const afterAssetValueUsd = Math.max(0, assetValueUsd - assetReductionUsd)
  const afterDebtValueUsd = Math.max(0, debtValueUsd - debtReductionUsd)
  const expectedAfterRiskRatio = calcRiskRatio(afterAssetValueUsd, afterDebtValueUsd)

  return {
    assetValueUsd: afterAssetValueUsd,
    debtValueUsd: afterDebtValueUsd,
    reduceSizeDecimal: clampedReduceSize,
    expectedAfterRiskRatio,
    liquidationDistanceAfterPct: calcLiquidationDistancePct(expectedAfterRiskRatio, liquidationThreshold),
  }
}

export function recommendStopLoss(liquidationPriceUsd: number, bufferDecimal: number) {
  return liquidationPriceUsd * (1 + bufferDecimal)
}

export function buildRescuePlans(state: CompleteNormalizedMarginState, inputs: RescuePlanInputs = {}): RescuePlan[] {
  const addCollateralUsd =
    inputs.addCollateralUsd ?? requiredAddCollateralValueUsd(state.debtValueUsd, state.targetRiskRatio, state.assetValueUsd)
  const reduceSizeDecimal = inputs.reduceSizeDecimal ?? 0.22
  const tpslBufferDecimal = inputs.tpslBufferDecimal ?? 0.05
  const stopLossUsdc = inputs.stopLossUsdc ?? recommendStopLoss(state.liquidationPriceUsd, tpslBufferDecimal)
  const addCollateral = simulateAddCollateral(state.assetValueUsd, state.debtValueUsd, addCollateralUsd, state.liquidationRiskRatio)
  const reduceOnly = simulateReduceOnly(state.assetValueUsd, state.debtValueUsd, reduceSizeDecimal, state.liquidationRiskRatio)

  return [
    {
      id: 'add-collateral',
      type: 'ADD_COLLATERAL',
      title: 'Add Collateral',
      subtitle: 'Best immediate rescue path',
      description: 'Add USDC collateral to raise risk ratio immediately.',
      beforeRiskRatio: state.riskRatio,
      expectedAfterRiskRatio: addCollateral.expectedAfterRiskRatio,
      targetRiskRatio: state.targetRiskRatio,
      liquidationDistanceBeforePct: state.liquidationDistancePct,
      liquidationDistanceAfterPct: addCollateral.liquidationDistanceAfterPct,
      estimatedGasSui: 0.002,
      estimatedCostUsd: addCollateralUsd,
      recommended: true,
      priority: 'P0',
      executionMode: 'real-ptb-path-preview',
      label: 'P0 - Gated Add Collateral PTB path - Open Transaction Review',
      ctaLabel: 'Open Transaction Review',
      warnings: ['Build unsigned PTB only after review gates', 'Estimates depend on current onchain state', 'No wallet prompt from simulated state'],
      params: {
        addAmountUsdc: addCollateralUsd,
      },
    },
    {
      id: 'reduce-only',
      type: 'REDUCE_ONLY_CLOSE',
      title: 'Reduce-only Close',
      subtitle: 'SDK path required',
      description: 'Reduce part of the position without adding new capital.',
      beforeRiskRatio: state.riskRatio,
      expectedAfterRiskRatio: reduceOnly.expectedAfterRiskRatio,
      targetRiskRatio: state.targetRiskRatio,
      liquidationDistanceBeforePct: state.liquidationDistancePct,
      liquidationDistanceAfterPct: reduceOnly.liquidationDistanceAfterPct,
      estimatedGasSui: 0.002,
      recommended: false,
      priority: 'P1',
      executionMode: 'p1-sdk-required-preview',
      label: 'P1 - SDK path required - Static preview only',
      ctaLabel: 'Simulate',
      warnings: ['P1 preview only', 'SDK path required before wiring'],
      params: {
        reduceSizeDecimal,
        reduceSizeDisplayPct: reduceSizeDecimal * 100,
      },
    },
    {
      id: 'smart-tpsl',
      type: 'SMART_TPSL',
      title: 'Smart TPSL',
      subtitle: 'SDK path required',
      description: 'Set a smart stop-loss above the liquidation price.',
      beforeRiskRatio: state.riskRatio,
      expectedAfterRiskRatio: 1.24,
      targetRiskRatio: state.targetRiskRatio,
      liquidationDistanceBeforePct: state.liquidationDistancePct,
      liquidationDistanceAfterPct: 7,
      estimatedGasSui: 0.002,
      recommended: false,
      priority: 'P1',
      executionMode: 'p1-sdk-required-preview',
      label: 'P1 - SDK path required - Static preview only',
      ctaLabel: 'Simulate',
      warnings: ['P1 preview only', 'SDK path required before wiring'],
      params: {
        stopLossUsdc,
        liquidationPriceUsdc: state.liquidationPriceUsd,
        bufferDecimal: tpslBufferDecimal,
        bufferDisplayPct: tpslBufferDecimal * 100,
      },
    },
  ]
}
