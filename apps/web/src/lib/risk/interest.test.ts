import { describe, expect, it } from 'vitest'
import { simulateInterestDrift } from './interest'
import { calcRiskRatio } from './riskRatio'

describe('simulateInterestDrift', () => {
  it('lowers risk ratio as debt accrues interest', () => {
    const before = calcRiskRatio(540, 461.54)
    const after = simulateInterestDrift(540, 461.54, 0.0642, 30)

    expect(after.riskRatio).toBeLessThan(before)
    expect(after.debtValueUsd).toBeGreaterThan(461.54)
  })
})
