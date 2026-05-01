import { describe, expect, it } from 'vitest'
import { mockMarginState } from '../demo/mockMarginState'
import { createRescueSimulatorModel } from './rescueSimulatorModel'

describe('rescue simulator source model', () => {
  it('uses a full DeepBook baseline for action-needed Add Collateral review', () => {
    const model = createRescueSimulatorModel({
      state: {
        ...mockMarginState,
        source: 'deepbook',
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + '7'.repeat(64),
        },
      },
      sourceState: 'full-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(model.baseline.sourceLevel).toBe('full-deepbook-baseline')
    expect(model.sourceBadge).toBe('Real DeepBook baseline')
    expect(model.canOpenAddCollateralReview).toBe(true)
    expect(model.addCollateralReviewModel?.source).toBe('deepbook')
    expect(model.plans[0].recommended).toBe(true)
  })

  it('keeps healthy real managers in no-rescue-needed what-if mode', () => {
    const model = createRescueSimulatorModel({
      state: {
        ...mockMarginState,
        source: 'deepbook',
        riskRatio: 1.5,
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + '8'.repeat(64),
        },
      },
      sourceState: 'full-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(model.baseline.actionability).toBe('no-rescue-needed')
    expect(model.canOpenAddCollateralReview).toBe(false)
    expect(model.statusTitle).toBe('Healthy baseline')
    expect(model.plans[0].recommended).toBe(false)
    expect(model.plans[0].label).toContain('No rescue needed')
  })

  it('keeps partial DeepBook baseline display-only and uses simulated plans', () => {
    const model = createRescueSimulatorModel({
      state: {
        ...mockMarginState,
        source: 'deepbook',
        isPartial: true,
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + '9'.repeat(64),
        },
      },
      sourceState: 'partial-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(model.baseline.sourceLevel).toBe('partial-deepbook-baseline')
    expect(model.sourceBadge).toBe('Partial DeepBook baseline')
    expect(model.canOpenAddCollateralReview).toBe(false)
    expect(model.planSourceLabel).toBe('Simulated what-if')
    expect(model.addCollateralReviewModel).toBeUndefined()
  })

  it('keeps real no-debt baseline out of urgent Add Collateral review', () => {
    const model = createRescueSimulatorModel({
      state: {
        ...mockMarginState,
        source: 'deepbook',
        isPartial: true,
        riskRatio: 1000,
        debtValueUsd: 0,
        baseDebt: 0,
        quoteDebt: 0,
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + 'a'.repeat(64),
        },
      },
      sourceState: 'partial-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(model.sourceMode).toBe('real-partial')
    expect(model.baseline.actionability).toBe('zero-debt')
    expect(model.currentRiskRatioDisplay).toBe('No debt')
    expect(model.statusTitle).toBe('Healthy baseline')
    expect(model.statusCopy).toContain('Real manager has no active borrowed debt')
    expect(model.canOpenAddCollateralReview).toBe(false)
    expect(model.plans[0].recommended).toBe(false)
    expect(model.plans[0].label).toContain('Simulated what-if')
    expect(model.plans[0].subtitle).not.toBe('Best immediate rescue path')
  })

  it('keeps partial missing-debt baseline display-only without zero-debt inference', () => {
    const model = createRescueSimulatorModel({
      state: {
        ...mockMarginState,
        source: 'deepbook',
        isPartial: true,
        riskRatio: 1000,
        debtValueUsd: 0,
        baseDebt: undefined,
        quoteDebt: undefined,
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + 'b'.repeat(64),
        },
      },
      sourceState: 'partial-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(model.sourceMode).toBe('real-partial')
    expect(model.baseline.debtDataStatus).toBe('insufficient-debt-data')
    expect(model.currentRiskRatioDisplay).toBe('N/A')
    expect(model.canOpenAddCollateralReview).toBe(false)
    expect(model.addCollateralReviewModel).toBeUndefined()
  })
})
