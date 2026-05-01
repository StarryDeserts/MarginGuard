import { useState } from 'react'
import type { DemoStep } from '../types/demo'
import { demoScenario, demoScenarios } from '../lib/demo/scenarios'
import type { NormalizedMarginState } from '../types/margin'
import type { ManagerReadSourceState } from '../lib/deepbook/readState'
import { createDemoScenarioProjection, type DemoBaselineMode } from '../lib/demo/demoScenarioProjection'

export function useDemoScenario(input: { baseline?: NormalizedMarginState; baselineSourceState?: ManagerReadSourceState } = {}) {
  const [scenarioId, setScenarioId] = useState(demoScenario.id)
  const [activeStep, setActiveStep] = useState<DemoStep>('RISK_WARNING')
  const [baselineMode, setBaselineMode] = useState<DemoBaselineMode>('real-baseline')
  const [priceShockPct, setPriceShockPct] = useState(10)
  const [borrowAprDisplayPct, setBorrowAprDisplayPct] = useState<number>(demoScenario.borrowAprAfterDisplayPct)
  const scenario = demoScenarios.find((item) => item.id === scenarioId) ?? demoScenario
  const projection = createDemoScenarioProjection({
    scenario,
    priceShockPct,
    borrowAprDisplayPct,
    baseline: input.baseline,
    baselineSourceState: input.baselineSourceState,
    baselineMode,
  })
  const derived = {
    shockedPrice: projection.shockedPrice.value,
    simulatedRiskRatio: projection.stressedRiskRatio.value,
    simulatedAssetValueUsd: projection.assetValue.value,
    recommendedAddCollateralUsd: projection.addCollateralRecommendation.value,
    liquidationDistancePct: projection.liquidationDistancePct.value,
    afterRiskRatio: projection.expectedAfterRiskRatio.value,
    afterLiquidationDistancePct: projection.afterLiquidationDistancePct.value,
  }

  function selectScenario(nextScenarioId: string) {
    const nextScenario = demoScenarios.find((item) => item.id === nextScenarioId) ?? demoScenario
    const nextShockPct = Math.round((1 - nextScenario.shockedPrice / nextScenario.startPrice) * 100)

    setScenarioId(nextScenario.id)
    setPriceShockPct(nextShockPct)
    setBorrowAprDisplayPct(nextScenario.borrowAprAfterDisplayPct)
    setActiveStep('PRICE_SHOCK')
  }

  function runScenario() {
    setActiveStep(activeStep === 'RISK_WARNING' ? 'RESCUE_PLAN' : 'RISK_WARNING')
  }

  return {
    scenarios: demoScenarios,
    scenario,
    scenarioId,
    selectScenario,
    activeStep,
    setActiveStep,
    baselineMode,
    setBaselineMode,
    priceShockPct,
    setPriceShockPct,
    borrowApr: borrowAprDisplayPct,
    setBorrowApr: setBorrowAprDisplayPct,
    runScenario,
    projection,
    derived,
  }
}
