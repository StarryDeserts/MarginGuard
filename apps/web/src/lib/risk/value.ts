type ValueUsdInput = {
  baseAmount: number
  quoteAmount: number
  basePriceUsd: number
  quotePriceUsd?: number
}

export function calcAssetValueUsd({ baseAmount, quoteAmount, basePriceUsd, quotePriceUsd = 1 }: ValueUsdInput) {
  return baseAmount * basePriceUsd + quoteAmount * quotePriceUsd
}

export function calcDebtValueUsd({ baseAmount, quoteAmount, basePriceUsd, quotePriceUsd = 1 }: ValueUsdInput) {
  return baseAmount * basePriceUsd + quoteAmount * quotePriceUsd
}

export function requiredAddCollateralValueUsd(debtValueUsd: number, targetRiskRatio: number, assetValueUsd: number) {
  return Math.max(0, debtValueUsd * targetRiskRatio - assetValueUsd)
}
