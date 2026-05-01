import { describe, expect, it } from 'vitest'
import { mockMarginState } from '../demo/mockMarginState'
import { buildRescuePlans, getAddCollateralRecommendation, getRescueActionability, simulateAddCollateral, simulateReduceOnly } from './rescuePlans'
import { classifyRisk } from './thresholds'
import { requiredAddCollateralValueUsd } from './value'

describe('rescue plan simulation', () => {
  it('simulates add collateral to target 1.30 using computed amount', () => {
    const amount = requiredAddCollateralValueUsd(461.54, 1.3, 540)
    const result = simulateAddCollateral(540, 461.54, amount, 1.1)

    expect(amount).toBeCloseTo(60, 2)
    expect(result.expectedAfterRiskRatio).toBeCloseTo(1.3, 2)
  })

  it('simulates reduce-only deterministically around 1.27', () => {
    const result = simulateReduceOnly(540, 461.54, 0.22, 1.1)

    expect(result.expectedAfterRiskRatio).toBeCloseTo(1.27, 2)
  })

  it('builds the add-collateral plan with computed amount', () => {
    const [plan] = buildRescuePlans(mockMarginState)

    expect(plan.params.addAmountUsdc).toBeCloseTo(60, 2)
    expect(plan.expectedAfterRiskRatio).toBeCloseTo(1.3, 2)
  })

  it('keeps risk status separate from rescue actionability for healthy real state', () => {
    const state = {
      ...mockMarginState,
      riskRatio: 2.11,
      targetRiskRatio: 1.25,
      assetValueUsd: 54.94,
      debtValueUsd: 26,
      baseDebt: 0,
      quoteDebt: 26,
    }

    expect(classifyRisk(state.riskRatio)).toBe('healthy')
    expect(getRescueActionability(state, 'full-deepbook')).toBe('no-rescue-needed')
    expect(getAddCollateralRecommendation(state, 'full-deepbook')).toBeUndefined()
  })

  it('treats zero add collateral as no-rescue-needed', () => {
    const state = {
      ...mockMarginState,
      riskRatio: 1.4,
      targetRiskRatio: 1.3,
      assetValueUsd: 140,
      debtValueUsd: 100,
    }

    expect(requiredAddCollateralValueUsd(state.debtValueUsd, state.targetRiskRatio, state.assetValueUsd)).toBe(0)
    expect(getRescueActionability(state, 'full-deepbook')).toBe('no-rescue-needed')
  })

  it('classifies zero-debt managers separately from rescue-needed states', () => {
    const state = {
      ...mockMarginState,
      riskRatio: 1000,
      targetRiskRatio: 1.25,
      assetValueUsd: 100,
      debtValueUsd: 0,
      baseDebt: 0,
      quoteDebt: 0,
    }

    expect(getRescueActionability(state, 'full-deepbook')).toBe('zero-debt')
    expect(getAddCollateralRecommendation(state, 'full-deepbook')).toBeUndefined()
  })

  it('classifies unavailable and read-error states without recommendations', () => {
    expect(getRescueActionability(undefined, 'full-deepbook')).toBe('unavailable')
    expect(getRescueActionability(mockMarginState, 'read-error')).toBe('read-error')
  })

  it('classifies below-target managers with positive collateral requirements as action-needed', () => {
    expect(getRescueActionability(mockMarginState, 'full-deepbook')).toBe('action-needed')
    expect(getAddCollateralRecommendation(mockMarginState, 'full-deepbook')?.addAmountUsdc).toBeGreaterThan(0)
  })

  it('keeps partial DeepBook state display-only for live actionability', () => {
    const partialState = { ...mockMarginState, source: 'deepbook' as const, isPartial: true }

    expect(getRescueActionability(partialState, 'partial-deepbook')).toBe('unavailable')
    expect(getAddCollateralRecommendation(partialState, 'partial-deepbook')).toBeUndefined()
  })

  it('classifies partial DeepBook state with explicit zero raw debt as zero-debt display-only', () => {
    const partialZeroDebtState = {
      ...mockMarginState,
      source: 'deepbook' as const,
      isPartial: true,
      riskRatio: 1000,
      debtValueUsd: 0,
      baseDebt: 0,
      quoteDebt: 0,
    }

    expect(getRescueActionability(partialZeroDebtState, 'partial-deepbook')).toBe('zero-debt')
    expect(getAddCollateralRecommendation(partialZeroDebtState, 'partial-deepbook')).toBeUndefined()
  })

  it('does not infer zero debt for partial DeepBook state with missing raw debt fields', () => {
    const partialMissingDebtState = {
      ...mockMarginState,
      source: 'deepbook' as const,
      isPartial: true,
      riskRatio: 1000,
      debtValueUsd: 0,
      baseDebt: undefined,
      quoteDebt: undefined,
    }

    expect(getRescueActionability(partialMissingDebtState, 'partial-deepbook')).toBe('unavailable')
    expect(getAddCollateralRecommendation(partialMissingDebtState, 'partial-deepbook')).toBeUndefined()
  })
})
