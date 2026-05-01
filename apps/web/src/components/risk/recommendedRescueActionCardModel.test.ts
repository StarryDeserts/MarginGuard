import { describe, expect, it } from 'vitest'
import { mockMarginState } from '../../lib/demo/mockMarginState'
import { getRecommendedRescueActionCardModel } from './recommendedRescueActionCardModel'

describe('RecommendedRescueActionCard view model', () => {
  it('renders no-rescue-needed as a state card without Add Collateral action language', () => {
    const viewModel = getRecommendedRescueActionCardModel({
      sourceLabel: 'DeepBook state',
      sourceState: 'full-deepbook',
      state: {
        ...mockMarginState,
        riskRatio: 2.11,
        targetRiskRatio: 1.25,
        liquidationRiskRatio: 1.1,
        assetValueUsd: 54.94,
        debtValueUsd: 26,
        baseDebt: 0,
        quoteDebt: 26,
      },
    })

    expect(viewModel.title).toBe('No rescue needed')
    expect(viewModel.badges).toEqual([{ label: 'No action required', variant: 'recommended' }])
    expect(viewModel.heading).toBeUndefined()
    expect(viewModel.metricItems.map((item) => item.label)).toEqual(['Current RR', 'Target RR', 'Liquidation RR'])
    expect(viewModel.primaryActionLabel).toBe('Open Rescue Simulator Preview')
    expect(viewModel.primaryActionVariant).toBe('secondary')
    expect(viewModel.reviewDisabled).toBe(true)
    expect(viewModel.reviewDisabledReason).toBe('No PTB preview is needed while the manager is above target.')
    expect(viewModel.footerNote).toBe(
      'Rescue Simulator uses labeled real baseline or simulated estimates. No wallet opens from no-rescue state.',
    )
    expect(JSON.stringify(viewModel)).not.toContain('Add Amount')
    expect(JSON.stringify(viewModel)).not.toContain('After RR')
    expect(JSON.stringify(viewModel)).not.toContain('P0')
    expect(JSON.stringify(viewModel.bodyLines)).not.toContain('No rescue needed')
  })

  it('keeps Add Collateral actionable only for action-needed state', () => {
    const viewModel = getRecommendedRescueActionCardModel({
      sourceLabel: 'DeepBook state',
      sourceState: 'full-deepbook',
      state: {
        ...mockMarginState,
        riskRatio: 1.17,
        targetRiskRatio: 1.3,
        liquidationRiskRatio: 1.1,
        assetValueUsd: 540,
        debtValueUsd: 461.54,
      },
    })

    expect(viewModel.title).toBe('Recommended Rescue Action')
    expect(viewModel.heading).toBe('Add Collateral')
    expect(viewModel.badges.map((badge) => badge.label)).toEqual(['Recommended', 'P0'])
    expect(viewModel.metricItems.map((item) => item.label)).toEqual(['Add Amount', 'Before RR', 'After RR'])
    expect(viewModel.reviewDisabled).toBe(false)
    expect(viewModel.footerNote).toContain('Wallet opens only after review')
  })

  it('disables PTB preview for unavailable and read-error states', () => {
    const unavailable = getRecommendedRescueActionCardModel({
      sourceLabel: 'Unavailable',
      sourceState: 'unavailable',
      state: undefined,
    })
    const readError = getRecommendedRescueActionCardModel({
      sourceLabel: 'Read error',
      sourceState: 'read-error',
      state: mockMarginState,
    })

    expect(unavailable.title).toBe('Recommendation unavailable')
    expect(unavailable.reviewDisabled).toBe(true)
    expect(readError.title).toBe('Recommendation unavailable')
    expect(readError.reviewDisabled).toBe(true)
  })

  it('keeps zero-debt as a no-action state', () => {
    const viewModel = getRecommendedRescueActionCardModel({
      sourceLabel: 'DeepBook state',
      sourceState: 'full-deepbook',
      state: {
        ...mockMarginState,
        riskRatio: 1000,
        targetRiskRatio: 1.25,
        liquidationRiskRatio: 1.1,
        assetValueUsd: 100,
        debtValueUsd: 0,
        baseDebt: 0,
        quoteDebt: 0,
      },
    })

    expect(viewModel.title).toBe('No active debt')
    expect(viewModel.reviewDisabled).toBe(true)
    expect(JSON.stringify(viewModel)).not.toContain('Infinity')
    expect(JSON.stringify(viewModel)).not.toContain('1000.00')
  })

  it('shows partial explicit zero debt as no active debt without review eligibility', () => {
    const viewModel = getRecommendedRescueActionCardModel({
      sourceLabel: 'Partial DeepBook state',
      sourceState: 'partial-deepbook',
      state: {
        ...mockMarginState,
        source: 'deepbook',
        isPartial: true,
        riskRatio: 1000,
        debtValueUsd: 0,
        baseDebt: 0,
        quoteDebt: 0,
      },
    })

    expect(viewModel.title).toBe('No active debt')
    expect(viewModel.reviewDisabled).toBe(true)
    expect(JSON.stringify(viewModel)).not.toContain('1000.00')
    expect(JSON.stringify(viewModel)).not.toContain('Recommended')
  })

  it('does not infer no-debt when partial debt fields are missing', () => {
    const viewModel = getRecommendedRescueActionCardModel({
      sourceLabel: 'Partial DeepBook state',
      sourceState: 'partial-deepbook',
      state: {
        ...mockMarginState,
        source: 'deepbook',
        isPartial: true,
        riskRatio: 1000,
        debtValueUsd: 0,
        baseDebt: undefined,
        quoteDebt: undefined,
      },
    })

    expect(viewModel.title).toBe('Recommendation unavailable')
    expect(viewModel.reviewDisabled).toBe(true)
    expect(viewModel.bodyLines).toContain('Debt fields are unavailable, so MarginGuard cannot prove this is a no-debt manager.')
  })
})
