import { describe, expect, it } from 'vitest'
import { calcAssetValueUsd, calcDebtValueUsd, requiredAddCollateralValueUsd } from './value'

describe('value helpers', () => {
  it('calculates asset and debt USD values', () => {
    expect(calcAssetValueUsd({ baseAmount: 360, quoteAmount: 0, basePriceUsd: 1.5 })).toBe(540)
    expect(calcDebtValueUsd({ baseAmount: 0, quoteAmount: 461.54, basePriceUsd: 1.5 })).toBe(461.54)
  })

  it('computes required add collateral from target ratio', () => {
    expect(requiredAddCollateralValueUsd(461.54, 1.3, 540)).toBeCloseTo(60, 2)
  })
})
