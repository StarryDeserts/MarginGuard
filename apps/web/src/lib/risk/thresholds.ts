import type { RiskLevel, RiskThresholds } from '../../types/risk'

export const riskThresholds: RiskThresholds = {
  healthy: 1.3,
  guarded: 1.25,
  caution: 1.2,
  warning: 1.1,
  liquidatable: 1.1,
}

export function classifyRisk(riskRatio: number): RiskLevel {
  if (riskRatio >= riskThresholds.healthy) return 'healthy'
  if (riskRatio >= riskThresholds.guarded) return 'guarded'
  if (riskRatio >= riskThresholds.caution) return 'caution'
  if (riskRatio > riskThresholds.warning) return 'warning'
  return 'liquidatable'
}

export const riskLabels: Record<RiskLevel, string> = {
  healthy: 'Healthy',
  guarded: 'Guarded',
  caution: 'Caution',
  warning: 'Warning',
  liquidatable: 'Liquidatable',
}
