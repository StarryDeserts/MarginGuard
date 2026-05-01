import type { DemoScenario } from '../../types/demo'
import { formatRatio } from '../../lib/utils/format'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

type DemoScenarioStripProps = {
  scenario: DemoScenario
  sourceLabel: string
  startPrice: number
  shockedPrice: number
  startingRiskRatio: number
  startingRiskRatioDisplay: string
  startingRiskStateLabel: string
  simulatedRiskRatio: number
  simulatedRiskRatioDisplay: string
  simulatedRiskStateLabel: string
  liquidationThreshold: number
  targetRiskRatio: number
  provenanceLabels: {
    startPrice: string
    shockedPrice: string
    startingRiskRatio: string
    simulatedRiskRatio: string
    liquidationThreshold: string
    targetRiskRatio: string
  }
}

export function DemoScenarioStrip({
  scenario,
  sourceLabel,
  startPrice,
  shockedPrice,
  startingRiskRatio,
  startingRiskRatioDisplay,
  startingRiskStateLabel,
  simulatedRiskRatio,
  simulatedRiskRatioDisplay,
  simulatedRiskStateLabel,
  liquidationThreshold,
  targetRiskRatio,
  provenanceLabels,
}: DemoScenarioStripProps) {
  const items = [
    ['Scenario', scenario.title, 'text-sui-cyan', undefined],
    ['Start SUI Price', `${startPrice.toFixed(2)} USDC`, 'text-text-primary', provenanceLabels.startPrice],
    ['Shocked Price', `${shockedPrice.toFixed(2)} USDC`, 'text-warning-orange', provenanceLabels.shockedPrice],
    ['Starting RR', formatRiskState(startingRiskRatioDisplay, startingRiskStateLabel, startingRiskRatio), 'text-guarded-blue', provenanceLabels.startingRiskRatio],
    ['Stressed RR', formatRiskState(simulatedRiskRatioDisplay, simulatedRiskStateLabel, simulatedRiskRatio), 'text-warning-orange', provenanceLabels.simulatedRiskRatio],
    ['Liquidation Threshold', formatRatio(liquidationThreshold), 'text-danger-red', provenanceLabels.liquidationThreshold],
    ['Target Rescue Ratio', formatRatio(targetRiskRatio), 'text-safe-green', provenanceLabels.targetRiskRatio],
  ]

  return (
    <Card className="border-warning-orange/70 p-4">
      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        {items.map(([label, value, color, provenance]) => (
          <div key={label} className="border-guard-border md:border-r md:pr-4 last:border-r-0">
            <p className="text-sm text-text-secondary">{label}</p>
            <p className={`mt-2 text-xl font-semibold ${color}`}>{value}</p>
            {provenance ? <p className="mt-1 text-xs text-text-muted">{provenance}</p> : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={sourceLabel.includes('Real') ? 'recommended' : sourceLabel.includes('Partial') ? 'warning' : 'info'}>
          {sourceLabel}
        </Badge>
        <Badge variant="info">Simulated shock</Badge>
      </div>
    </Card>
  )
}

function formatRiskState(display: string, stateLabel: string, value: number) {
  const resolvedDisplay = display || formatRatio(value)

  if (stateLabel === 'No active liquidation risk') return resolvedDisplay

  return `${resolvedDisplay} ${stateLabel}`
}
