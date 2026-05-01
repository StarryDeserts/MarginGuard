import type { DemoScenario, DemoStep } from '../../types/demo'
import { mockNumericValues } from './mockMarginState'

export const demoScenario: DemoScenario = {
  id: 'sui-price-shock',
  title: 'SUI Price Shock',
  market: 'SUI/USDC',
  startPrice: 1.5,
  shockedPrice: 1.35,
  startingRiskRatio: 1.25,
  simulatedRiskRatio: 1.17,
  liquidationThreshold: 1.1,
  targetRiskRatio: 1.3,
  borrowAprBeforeDecimal: mockNumericValues.borrowAprDecimal,
  borrowAprBeforeDisplayPct: mockNumericValues.borrowAprDisplayPct,
  borrowAprAfterDecimal: mockNumericValues.demoBorrowAprDecimal,
  borrowAprAfterDisplayPct: mockNumericValues.demoBorrowAprDisplayPct,
}

export const demoScenarios: DemoScenario[] = [
  demoScenario,
  {
    ...demoScenario,
    id: 'sui-deeper-shock',
    title: 'SUI Deeper Shock',
    shockedPrice: 1.28,
    simulatedRiskRatio: 1.13,
    borrowAprAfterDecimal: 0.092,
    borrowAprAfterDisplayPct: 9.2,
  },
  {
    ...demoScenario,
    id: 'borrow-apr-drift',
    title: 'Borrow APR Drift',
    shockedPrice: 1.4,
    simulatedRiskRatio: 1.2,
    borrowAprAfterDecimal: 0.11,
    borrowAprAfterDisplayPct: 11,
  },
]

export const demoSteps: Array<{ id: DemoStep; title: string; description: string }> = [
  { id: 'IMPORT_MANAGER', title: 'Import Manager', description: 'Manual ID imported' },
  { id: 'PRICE_SHOCK', title: 'Price Shock', description: 'Market stress applied' },
  { id: 'RISK_WARNING', title: 'Simulated Risk Warning', description: 'Simulated threshold story' },
  { id: 'RESCUE_PLAN', title: 'Rescue Plan', description: 'Compare rescue options' },
  { id: 'REVIEW_PTB', title: 'Review PTB', description: 'Gated Add Collateral PTB path' },
  { id: 'RISK_IMPROVED', title: 'Expected Recovery', description: 'Expected RR projection back to target' },
]
