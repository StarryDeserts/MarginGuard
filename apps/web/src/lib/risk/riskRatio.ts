import type { RiskPoint } from '../../types/risk'
import type { NormalizedMarginState } from '../../types/margin'

export const DEBT_EPSILON_USD = 0.000001
export const ZERO_DEBT_RISK_RATIO_SENTINEL = 999

export type DebtDataStatus = 'active-debt' | 'zero-debt' | 'insufficient-debt-data'
export type RiskRatioDisplayKind = 'finite' | 'zero-debt' | 'unavailable'

export type RiskRatioDisplay = {
  kind: RiskRatioDisplayKind
  value?: number
  display: string
}

export function calcRiskRatio(assetValueUsd: number, debtValueUsd: number) {
  if (debtValueUsd <= 0) {
    return Number.POSITIVE_INFINITY
  }

  return assetValueUsd / debtValueUsd
}

export function getDebtDataStatus(
  state?: Pick<NormalizedMarginState, 'baseDebt' | 'quoteDebt' | 'debtValueUsd'>,
  options: { debtFieldsPresent?: boolean } = {},
): DebtDataStatus {
  if (!state) return 'insufficient-debt-data'

  const hasBaseDebt = state.baseDebt !== undefined
  const hasQuoteDebt = state.quoteDebt !== undefined

  if (hasBaseDebt && hasQuoteDebt) {
    return Math.abs(state.baseDebt ?? 0) <= DEBT_EPSILON_USD && Math.abs(state.quoteDebt ?? 0) <= DEBT_EPSILON_USD
      ? 'zero-debt'
      : 'active-debt'
  }

  if (options.debtFieldsPresent && state.debtValueUsd !== undefined) {
    return Math.abs(state.debtValueUsd) <= DEBT_EPSILON_USD ? 'zero-debt' : 'active-debt'
  }

  if (state.debtValueUsd !== undefined && state.debtValueUsd > DEBT_EPSILON_USD) {
    return 'active-debt'
  }

  return 'insufficient-debt-data'
}

export function isZeroDebt(
  state?: Pick<NormalizedMarginState, 'baseDebt' | 'quoteDebt' | 'debtValueUsd'>,
  options: { debtFieldsPresent?: boolean } = {},
) {
  return getDebtDataStatus(state, options) === 'zero-debt'
}

export function getRiskRatioDisplay(input: {
  riskRatio?: number
  debtStatus?: DebtDataStatus
  zeroDebtLabel?: string
}): RiskRatioDisplay {
  if (input.debtStatus === 'zero-debt') {
    return {
      kind: 'zero-debt',
      display: input.zeroDebtLabel ?? 'No debt',
    }
  }

  if (
    input.riskRatio === undefined ||
    !Number.isFinite(input.riskRatio) ||
    (input.debtStatus !== 'active-debt' && input.riskRatio >= ZERO_DEBT_RISK_RATIO_SENTINEL)
  ) {
    return {
      kind: 'unavailable',
      display: 'N/A',
    }
  }

  return {
    kind: 'finite',
    value: input.riskRatio,
    display: input.riskRatio.toFixed(2),
  }
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
