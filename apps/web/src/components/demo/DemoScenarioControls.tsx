import { Play } from 'lucide-react'
import type { DemoScenario } from '../../types/demo'
import type { DemoBaselineMode } from '../../lib/demo/demoScenarioProjection'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Select } from '../ui/Select'

type DemoScenarioControlsProps = {
  scenarios: DemoScenario[]
  scenarioId: string
  baselineMode: DemoBaselineMode
  sourceLabel: string
  realBaselineAvailable: boolean
  priceShockPct: number
  startPrice: number
  shockedPrice: number
  borrowApr: number
  onScenarioChange: (value: string) => void
  onBaselineModeChange: (value: DemoBaselineMode) => void
  onPriceShockChange: (value: number) => void
  onBorrowAprChange: (value: number) => void
  onRunScenario: () => void
}

export function DemoScenarioControls({
  scenarios,
  scenarioId,
  baselineMode,
  sourceLabel,
  realBaselineAvailable,
  priceShockPct,
  startPrice,
  shockedPrice,
  borrowApr,
  onScenarioChange,
  onBaselineModeChange,
  onPriceShockChange,
  onBorrowAprChange,
  onRunScenario,
}: DemoScenarioControlsProps) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">Scenario Controls</h2>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-text-secondary">
          Scenario
          <Select className="mt-2" value={scenarioId} onChange={(event) => onScenarioChange(event.target.value)}>
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.title}
              </option>
            ))}
          </Select>
        </label>
        <label className="block text-sm font-medium text-text-secondary">
          Baseline Source
          <Select
            className="mt-2"
            value={baselineMode}
            onChange={(event) => onBaselineModeChange(event.target.value as DemoBaselineMode)}
          >
            <option value="real-baseline">Real Manager Baseline + Simulated Shock</option>
            <option value="simulated-demo">Simulated Demo Mode</option>
          </Select>
          <span className="mt-2 block text-xs text-text-muted">
            {realBaselineAvailable ? sourceLabel : 'No eligible real baseline loaded; real mode falls back safely.'}
          </span>
        </label>
        <label className="block text-sm font-medium text-text-secondary">
          Price Shock
          <span className="float-right text-sui-cyan">
            {startPrice.toFixed(2)} -&gt; {shockedPrice.toFixed(2)} USDC
          </span>
          <input
            className="mt-3 w-full accent-electric-blue"
            type="range"
            min="5"
            max="20"
            value={priceShockPct}
            onChange={(event) => onPriceShockChange(Number(event.target.value))}
          />
        </label>
        <label className="block text-sm font-medium text-text-secondary">
          Borrow APR
          <span className="float-right text-p1-purple">6.42% -&gt; {borrowApr.toFixed(2)}%</span>
          <input
            className="mt-3 w-full accent-p1-purple"
            type="range"
            min="6.42"
            max="12"
            step="0.01"
            value={borrowApr}
            onChange={(event) => onBorrowAprChange(Number(event.target.value))}
          />
        </label>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-md border border-guarded-blue/50 px-3 py-2 text-guarded-blue">Guarded</span>
          <span className="rounded-md border border-warning-orange/50 px-3 py-2 text-warning-orange">Warning</span>
          <span className="rounded-md border border-danger-red/50 px-3 py-2 text-danger-red">Liquidation Edge</span>
        </div>
        <Button className="w-full" icon={<Play className="h-4 w-4" />} onClick={onRunScenario}>
          Run Scenario
        </Button>
      </div>
    </Card>
  )
}
