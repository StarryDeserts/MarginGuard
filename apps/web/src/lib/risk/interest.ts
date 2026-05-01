import { calcRiskRatio } from './riskRatio'

export function simulateInterestDrift(assetValueUsd: number, debtValueUsd: number, borrowAprDecimal: number, days = 30) {
  const debtAfterInterest = debtValueUsd * (1 + (borrowAprDecimal * days) / 365)

  return {
    assetValueUsd,
    debtValueUsd: debtAfterInterest,
    riskRatio: calcRiskRatio(assetValueUsd, debtAfterInterest),
  }
}

export function projectedBorrowAprDrift(currentRiskRatio: number, borrowAprDisplayPct: number, days = 30) {
  const dailyRate = borrowAprDisplayPct / 100 / 365

  return Math.max(0, currentRiskRatio - currentRiskRatio * dailyRate * days)
}
