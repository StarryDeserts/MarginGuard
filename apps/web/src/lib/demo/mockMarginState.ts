import type { CompleteNormalizedMarginState } from '../../types/margin'
import type { MockTransactionResult } from '../../types/tx'
import { calcLiquidationDistancePct } from '../risk/liquidation'
import { calcRiskRatio } from '../risk/riskRatio'
import { recommendStopLoss, simulateAddCollateral, simulateReduceOnly } from '../risk/rescuePlans'
import { calcAssetValueUsd, calcDebtValueUsd, requiredAddCollateralValueUsd } from '../risk/value'

export const mockDisplayValues = {
  walletAddress: '0x3a8b...7cF2',
  managerObjectId: '0x1234...abcd5678',
  marketLabel: 'SUI/USDC Margin Manager',
  networkLabel: 'Mainnet',
  gasFeeLabel: '~0.002 SUI',
} as const

export const mockNumericValues = {
  baseAsset: 360,
  quoteAsset: 0,
  baseDebt: 0,
  quoteDebt: 461.54,
  basePriceUsd: 1.5,
  quotePriceUsd: 1,
  startingRiskRatio: 1.25,
  liquidationRiskRatio: 1.1,
  targetRiskRatio: 1.3,
  liquidationPriceUsd: 1.29,
  borrowAprDecimal: 0.0642,
  borrowAprDisplayPct: 6.42,
  demoBorrowAprDecimal: 0.082,
  demoBorrowAprDisplayPct: 8.2,
  reduceSizeDecimal: 0.22,
  reduceSizeDisplayPct: 22,
  smartTpslStopLossUsdc: 1.36,
} as const

const assetValueUsd = calcAssetValueUsd({
  baseAmount: mockNumericValues.baseAsset,
  quoteAmount: mockNumericValues.quoteAsset,
  basePriceUsd: mockNumericValues.basePriceUsd,
  quotePriceUsd: mockNumericValues.quotePriceUsd,
})
const debtValueUsd = calcDebtValueUsd({
  baseAmount: mockNumericValues.baseDebt,
  quoteAmount: mockNumericValues.quoteDebt,
  basePriceUsd: mockNumericValues.basePriceUsd,
  quotePriceUsd: mockNumericValues.quotePriceUsd,
})
const riskRatio = calcRiskRatio(assetValueUsd, debtValueUsd)
const recommendedAddCollateralUsd = requiredAddCollateralValueUsd(
  debtValueUsd,
  mockNumericValues.targetRiskRatio,
  assetValueUsd,
)
const addCollateralPreview = simulateAddCollateral(
  assetValueUsd,
  debtValueUsd,
  recommendedAddCollateralUsd,
  mockNumericValues.liquidationRiskRatio,
)
const reduceOnlyPreview = simulateReduceOnly(
  assetValueUsd,
  debtValueUsd,
  mockNumericValues.reduceSizeDecimal,
  mockNumericValues.liquidationRiskRatio,
)
const smartTpslBufferDecimal = mockNumericValues.smartTpslStopLossUsdc / mockNumericValues.liquidationPriceUsd - 1

export const mockComputedValues = {
  assetValueUsd,
  debtValueUsd,
  riskRatio,
  liquidationDistancePct: calcLiquidationDistancePct(riskRatio, mockNumericValues.liquidationRiskRatio),
  recommendedAddCollateralUsd,
  afterAddCollateralRiskRatio: addCollateralPreview.expectedAfterRiskRatio,
  afterAddCollateralLiquidationDistancePct: addCollateralPreview.liquidationDistanceAfterPct,
  afterReduceOnlyRiskRatio: reduceOnlyPreview.expectedAfterRiskRatio,
  afterReduceOnlyLiquidationDistancePct: reduceOnlyPreview.liquidationDistanceAfterPct,
  smartTpslBufferDecimal,
  smartTpslBufferDisplayPct: smartTpslBufferDecimal * 100,
  smartTpslRecommendedFromBuffer: recommendStopLoss(mockNumericValues.liquidationPriceUsd, smartTpslBufferDecimal),
} as const

export const mockMarginState: CompleteNormalizedMarginState = {
  walletAddress: mockDisplayValues.walletAddress,
  manager: {
    objectId: mockDisplayValues.managerObjectId,
    poolKey: 'SUI_USDC',
    displayPair: 'SUI/USDC',
    network: 'mainnet',
    owner: mockDisplayValues.walletAddress,
    addedAtMs: 1_765_084_800_000,
    lastUsedAtMs: 1_765_084_800_000,
  },
  baseSymbol: 'SUI',
  quoteSymbol: 'USDC',
  marketLabel: mockDisplayValues.marketLabel,
  baseAsset: mockNumericValues.baseAsset,
  quoteAsset: mockNumericValues.quoteAsset,
  baseDebt: mockNumericValues.baseDebt,
  quoteDebt: mockNumericValues.quoteDebt,
  basePriceUsd: mockNumericValues.basePriceUsd,
  quotePriceUsd: mockNumericValues.quotePriceUsd,
  assetValueUsd,
  debtValueUsd,
  riskRatio,
  startingRiskRatio: mockNumericValues.startingRiskRatio,
  liquidationRiskRatio: mockNumericValues.liquidationRiskRatio,
  targetRiskRatio: mockNumericValues.targetRiskRatio,
  liquidationDistancePct: mockComputedValues.liquidationDistancePct,
  liquidationDistanceAfterPct: mockComputedValues.afterAddCollateralLiquidationDistancePct,
  liquidationPriceUsd: mockNumericValues.liquidationPriceUsd,
  borrowAprDecimal: mockNumericValues.borrowAprDecimal,
  borrowAprDisplayPct: mockNumericValues.borrowAprDisplayPct,
  demoBorrowAprDecimal: mockNumericValues.demoBorrowAprDecimal,
  demoBorrowAprDisplayPct: mockNumericValues.demoBorrowAprDisplayPct,
  updatedAtMs: 1_765_084_800_000,
  source: 'demo',
}

export const mockTransactionResult: MockTransactionResult = {
  digest: '9kX2...F4a9',
  action: 'Add Collateral',
  amount: `${mockComputedValues.recommendedAddCollateralUsd.toFixed(2)} USDC`,
  network: mockDisplayValues.networkLabel,
  executionMode: 'Gated Add Collateral PTB preview',
  submitted: false,
}
