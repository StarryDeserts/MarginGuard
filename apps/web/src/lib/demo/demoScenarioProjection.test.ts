import { describe, expect, it } from 'vitest'
import { mockMarginState } from './mockMarginState'
import { demoScenario } from './scenarios'
import { createDemoScenarioProjection } from './demoScenarioProjection'

describe('demo scenario projection', () => {
  it('uses real DeepBook baseline values while keeping shock values simulated', () => {
    const projection = createDemoScenarioProjection({
      scenario: demoScenario,
      priceShockPct: 10,
      borrowAprDisplayPct: 8.5,
      baseline: {
        ...mockMarginState,
        source: 'deepbook',
        basePriceUsd: 2,
        assetValueUsd: 720,
        debtValueUsd: 461.54,
        riskRatio: 1.56,
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + '5'.repeat(64),
        },
      },
      baselineSourceState: 'full-deepbook',
      baselineMode: 'real-baseline',
    })

    expect(projection.mode).toBe('real-baseline-simulated-shock')
    expect(projection.startPrice.value).toBe(2)
    expect(projection.startPrice.provenance).toBe('real-deepbook')
    expect(projection.shockedPrice.value).toBe(1.8)
    expect(projection.shockedPrice.provenance).toBe('simulated-shock')
    expect(projection.startingRiskRatio.value).toBe(1.56)
    expect(projection.stressedRiskRatio.provenance).toBe('derived-estimate')
    expect(projection.assetValue.provenance).toBe('real-deepbook')
    expect(projection.addCollateralRecommendation.provenance).toBe('derived-estimate')
  })

  it('falls back to simulated demo values when no real baseline is selected', () => {
    const projection = createDemoScenarioProjection({
      scenario: demoScenario,
      priceShockPct: 10,
      borrowAprDisplayPct: demoScenario.borrowAprAfterDisplayPct,
      baselineMode: 'simulated-demo',
    })

    expect(projection.mode).toBe('simulated-demo')
    expect(projection.sourceLabel).toBe('Simulated Demo')
    expect(projection.startPrice.provenance).toBe('demo-fallback')
    expect(projection.shockedPrice.provenance).toBe('simulated-shock')
    expect(projection.stressedRiskRatio.provenance).toBe('demo-fallback')
  })

  it('does not treat partial baseline as live-signable even when it can seed estimates', () => {
    const projection = createDemoScenarioProjection({
      scenario: demoScenario,
      priceShockPct: 12,
      borrowAprDisplayPct: 9,
      baseline: {
        ...mockMarginState,
        source: 'deepbook',
        isPartial: true,
        manager: {
          ...mockMarginState.manager,
          objectId: '0x' + '6'.repeat(64),
        },
      },
      baselineSourceState: 'partial-deepbook',
      baselineMode: 'real-baseline',
    })

    expect(projection.mode).toBe('real-baseline-simulated-shock')
    expect(projection.baselineSourceLevel).toBe('partial-deepbook-baseline')
    expect(projection.canOpenWalletPrompt).toBe(false)
    expect(projection.sourceLabel).toBe('Partial DeepBook baseline + simulated shock')
  })
})
