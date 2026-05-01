export type AppNetwork = 'mainnet' | 'testnet'

export type SupportedPoolKey = 'SUI_USDC'

export type MarginManagerRef = {
  objectId: string
  poolKey: SupportedPoolKey
  displayPair: 'SUI/USDC'
  network: AppNetwork
  owner?: string
  addedAtMs?: number
  lastUsedAtMs?: number
}

export type NormalizedMarginSource = 'deepbook' | 'demo'

export type NormalizedMarginState = {
  manager: MarginManagerRef
  walletAddress?: string
  baseSymbol: 'SUI'
  quoteSymbol: 'USDC'
  marketLabel: string
  baseAsset?: number
  quoteAsset?: number
  baseDebt?: number
  quoteDebt?: number
  basePriceUsd?: number
  quotePriceUsd?: number
  assetValueUsd?: number
  debtValueUsd?: number
  riskRatio?: number
  startingRiskRatio?: number
  liquidationRiskRatio?: number
  targetRiskRatio?: number
  liquidationDistancePct?: number
  liquidationDistanceAfterPct?: number
  liquidationPriceUsd?: number
  borrowAprDecimal?: number
  borrowAprDisplayPct?: number
  demoBorrowAprDecimal?: number
  demoBorrowAprDisplayPct?: number
  updatedAtMs: number
  source: NormalizedMarginSource
  readStatusLabel?: string
  estimatedFields?: string[]
  availableFields?: string[]
  missingFields?: string[]
  isPartial?: boolean
}

export type CompleteNormalizedMarginState = NormalizedMarginState & {
  walletAddress: string
  baseAsset: number
  quoteAsset: number
  baseDebt: number
  quoteDebt: number
  basePriceUsd: number
  quotePriceUsd: number
  assetValueUsd: number
  debtValueUsd: number
  riskRatio: number
  startingRiskRatio: number
  liquidationRiskRatio: number
  targetRiskRatio: number
  liquidationDistancePct: number
  liquidationDistanceAfterPct: number
  liquidationPriceUsd: number
  borrowAprDecimal: number
  borrowAprDisplayPct: number
  demoBorrowAprDecimal: number
  demoBorrowAprDisplayPct: number
}
