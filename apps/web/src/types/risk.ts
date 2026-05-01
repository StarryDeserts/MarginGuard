export type RiskLevel = 'healthy' | 'guarded' | 'caution' | 'warning' | 'liquidatable'

export type RiskThresholds = {
  healthy: number
  guarded: number
  caution: number
  warning: number
  liquidatable: number
}

export type RiskPoint = {
  label: string
  value: number
}
