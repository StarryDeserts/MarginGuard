import { describe, expect, it } from 'vitest'
import { calcRiskRatio, getDebtDataStatus, isZeroDebt } from './riskRatio'

describe('calcRiskRatio', () => {
  it('calculates asset / debt', () => {
    expect(calcRiskRatio(540, 461.54)).toBeCloseTo(1.17, 2)
  })

  it('returns infinity when debt is zero', () => {
    expect(calcRiskRatio(540, 0)).toBe(Number.POSITIVE_INFINITY)
  })

  it('detects zero debt from explicit raw debt values before display formatting', () => {
    expect(isZeroDebt({ baseDebt: 0, quoteDebt: 0, debtValueUsd: 100 })).toBe(true)
    expect(isZeroDebt({ debtValueUsd: 0 })).toBe(false)
    expect(isZeroDebt({ baseDebt: 0, quoteDebt: 1, debtValueUsd: 0 })).toBe(false)
  })

  it('classifies missing debt fields as insufficient instead of zero debt', () => {
    expect(getDebtDataStatus({ baseDebt: 0, quoteDebt: 0, debtValueUsd: 0 })).toBe('zero-debt')
    expect(getDebtDataStatus({ baseDebt: 0, quoteDebt: 0.01, debtValueUsd: 0 })).toBe('active-debt')
    expect(getDebtDataStatus({ debtValueUsd: 0 })).toBe('insufficient-debt-data')
    expect(getDebtDataStatus({ debtValueUsd: 12 })).toBe('active-debt')
    expect(getDebtDataStatus(undefined)).toBe('insufficient-debt-data')
  })
})
