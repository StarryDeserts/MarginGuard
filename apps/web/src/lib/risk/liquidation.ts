export function calcLiquidationDistancePct(riskRatio: number, liquidationThreshold: number) {
  if (liquidationThreshold <= 0 || !Number.isFinite(riskRatio) || !Number.isFinite(liquidationThreshold)) {
    return 0
  }

  return ((riskRatio - liquidationThreshold) / liquidationThreshold) * 100
}

export const liquidationDistancePct = calcLiquidationDistancePct

export function isRenderableLiquidationDistance(value: number | undefined) {
  return value !== undefined && Number.isFinite(value)
}
