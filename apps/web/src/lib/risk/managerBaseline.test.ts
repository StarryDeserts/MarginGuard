import { describe, expect, it } from 'vitest'
import { mockMarginState } from '../demo/mockMarginState'
import { createManagerBaseline, getMetricProvenanceLabel, toCompletePlanningState } from './managerBaseline'

describe('manager baseline eligibility', () => {
  it('allows full DeepBook Mainnet SUI/USDC action-needed state to drive real review eligibility', () => {
    const baseline = createManagerBaseline({
      state: {
        ...mockMarginState,
        source: 'deepbook',
        walletAddress: '0xabc',
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + '1'.repeat(64),
          network: 'mainnet',
          poolKey: 'SUI_USDC',
        },
      },
      sourceState: 'full-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(baseline.sourceLevel).toBe('full-deepbook-baseline')
    expect(baseline.actionability).toBe('action-needed')
    expect(baseline.canUseForRealRescueBaseline).toBe(true)
    expect(baseline.canOpenRealAddCollateralReview).toBe(true)
    expect(baseline.fields.currentRiskRatio.provenance).toBe('real-deepbook')
    expect(baseline.fields.targetRescueRatio.provenance).toBe('app-setting')
  })

  it('keeps partial DeepBook baseline display-only and not action-needed', () => {
    const baseline = createManagerBaseline({
      state: {
        ...mockMarginState,
        source: 'deepbook',
        isPartial: true,
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + '2'.repeat(64),
        },
      },
      sourceState: 'partial-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(baseline.sourceLevel).toBe('partial-deepbook-baseline')
    expect(baseline.actionability).toBe('unavailable')
    expect(baseline.canUseForRealRescueBaseline).toBe(false)
    expect(baseline.canOpenRealAddCollateralReview).toBe(false)
    expect(baseline.reason).toContain('display-only')
  })

  it('marks partial DeepBook explicit zero-debt baseline as no-debt display-only', () => {
    const baseline = createManagerBaseline({
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
          objectId: '0x' + '5'.repeat(64),
        },
      },
      sourceState: 'partial-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(baseline.sourceLevel).toBe('partial-deepbook-baseline')
    expect(baseline.debtDataStatus).toBe('zero-debt')
    expect(baseline.actionability).toBe('zero-debt')
    expect(baseline.canOpenRealAddCollateralReview).toBe(false)
    expect(baseline.fields.currentRiskRatio.display).toBe('No debt')
    expect(baseline.reason).toContain('No active borrowed debt')
  })

  it('does not infer no-debt from partial DeepBook state with missing raw debt fields', () => {
    const baseline = createManagerBaseline({
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
          objectId: '0x' + '6'.repeat(64),
        },
      },
      sourceState: 'partial-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(baseline.sourceLevel).toBe('partial-deepbook-baseline')
    expect(baseline.debtDataStatus).toBe('insufficient-debt-data')
    expect(baseline.actionability).toBe('unavailable')
    expect(baseline.fields.currentRiskRatio.display).toBe('N/A')
    expect(baseline.reason).toContain('Debt fields are unavailable')
  })

  it('blocks healthy full DeepBook baseline from urgent Add Collateral review', () => {
    const baseline = createManagerBaseline({
      state: {
        ...mockMarginState,
        source: 'deepbook',
        riskRatio: 1.45,
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + '7'.repeat(64),
        },
      },
      sourceState: 'full-deepbook',
      selectedNetwork: 'mainnet',
    })

    expect(baseline.sourceLevel).toBe('full-deepbook-baseline')
    expect(baseline.actionability).toBe('no-rescue-needed')
    expect(baseline.canUseForRealRescueBaseline).toBe(true)
    expect(baseline.canOpenRealAddCollateralReview).toBe(false)
    expect(baseline.reason).toBe('No rescue needed while RR is above target.')
  })

  it('falls back for unsupported network and never allows live review eligibility', () => {
    const baseline = createManagerBaseline({
      state: {
        ...mockMarginState,
        source: 'deepbook',
        manager: {
          ...mockMarginState.manager,
          network: 'testnet',
        },
      },
      sourceState: 'full-deepbook',
      selectedNetwork: 'testnet',
    })

    expect(baseline.sourceLevel).toBe('simulated-demo-fallback')
    expect(baseline.canOpenRealAddCollateralReview).toBe(false)
    expect(baseline.reason).toContain('Mainnet SUI/USDC')
  })

  it('converts eligible real baseline to a complete planning state without changing source', () => {
    const planningState = toCompletePlanningState({
      ...mockMarginState,
      source: 'deepbook',
      startingRiskRatio: undefined,
      liquidationPriceUsd: undefined,
      manager: {
        ...mockMarginState.manager,
        objectId: '0x' + '8'.repeat(64),
      },
    })

    expect(planningState?.source).toBe('deepbook')
    expect(planningState?.liquidationPriceUsd).toBeGreaterThan(0)
    expect(planningState?.startingRiskRatio).toBe(mockMarginState.riskRatio)
  })

  it('formats concise provenance labels for UI cards', () => {
    expect(getMetricProvenanceLabel('real-deepbook')).toBe('Real DeepBook')
    expect(getMetricProvenanceLabel('simulated-shock')).toBe('Simulated shock')
    expect(getMetricProvenanceLabel('derived-estimate')).toBe('Estimate')
    expect(getMetricProvenanceLabel('app-setting')).toBe('App target')
  })
})
