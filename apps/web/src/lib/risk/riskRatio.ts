import type { RiskPoint } from '../../types/risk'
import type { NormalizedMarginState } from '../../types/margin'

export const DEBT_EPSILON_USD = 0.000001

export function calcRiskRatio(assetValueUsd: number, debtValueUsd: number) {
  if (debtValueUsd <= 0) {
    return Number.POSITIVE_INFINITY
  }

  return assetValueUsd / debtValueUsd
}

export function isZeroDebt(state?: Pick<NormalizedMarginState, 'baseDebt' | 'quoteDebt' | 'debtValueUsd'>) {
  if (!state) return false

  const hasRawDebt = state.baseDebt !== undefined || state.quoteDebt !== undefined

  if (hasRawDebt) {
    return Math.abs(state.baseDebt ?? 0) <= DEBT_EPSILON_USD && Math.abs(state.quoteDebt ?? 0) <= DEBT_EPSILON_USD
  }

  return state.debtValueUsd !== undefined && Math.abs(state.debtValueUsd) <= DEBT_EPSILON_USD
}

export const dashboardRiskPath: RiskPoint[] = [
  { label: '-30m', value: 1.27 },
  { label: '-25m', value: 1.23 },
  { label: '-20m', value: 1.22 },
  { label: '-15m', value: 1.22 },
  { label: '-10m', value: 1.2 },
  { label: '-5m', value: 1.18 },
  { label: 'Now', value: 1.17 },
]

export const rescueRiskPath: RiskPoint[] = [
  { label: 'Before Rescue', value: 1.17 },
  { label: '-30m', value: 1.1 },
  { label: '-20m', value: 1.06 },
  { label: '-10m', value: 1.03 },
  { label: 'After Rescue', value: 1.3 },
]

export const demoRiskPath: RiskPoint[] = [
  { label: 'Start SUI 1.50', value: 1.25 },
  { label: 'Price Shock SUI 1.35', value: 1.23 },
  { label: 'Warning RR 1.17', value: 1.17 },
  { label: 'After Rescue RR 1.30', value: 1.3 },
]
