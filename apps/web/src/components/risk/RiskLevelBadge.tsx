import { Badge } from '../ui/Badge'
import type { RiskLevel } from '../../types/risk'
import { riskLabels } from '../../lib/risk/thresholds'

type RiskLevelBadgeProps = {
  level: RiskLevel
}

export function RiskLevelBadge({ level }: RiskLevelBadgeProps) {
  return <Badge variant={level}>{riskLabels[level]}</Badge>
}
