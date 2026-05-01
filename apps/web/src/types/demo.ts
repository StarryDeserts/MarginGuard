export type DemoStep =
  | 'IMPORT_MANAGER'
  | 'PRICE_SHOCK'
  | 'RISK_WARNING'
  | 'RESCUE_PLAN'
  | 'REVIEW_PTB'
  | 'RISK_IMPROVED'

export type DemoScenario = {
  id: string
  title: string
  market: 'SUI/USDC'
  startPrice: number
  shockedPrice: number
  startingRiskRatio: number
  simulatedRiskRatio: number
  liquidationThreshold: number
  targetRiskRatio: number
  borrowAprBeforeDecimal: number
  borrowAprBeforeDisplayPct: number
  borrowAprAfterDecimal: number
  borrowAprAfterDisplayPct: number
}
