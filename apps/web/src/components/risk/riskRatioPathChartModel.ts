import type { RiskPoint } from '../../types/risk'
import { dashboardRiskPath } from '../../lib/risk/riskRatio'

export type RiskRatioPathChartMode = 'mock' | 'deepbook'

export type RiskRatioSnapshotMetric = {
  label: 'Current RR' | 'Target RR' | 'Liquidation RR'
  value?: number
}

export type RiskRatioSnapshotScale = {
  min: number
  max: number
  currentRiskRatio?: number
  targetRiskRatio?: number
  liquidationRiskRatio?: number
}

export type RiskRatioPathChartViewModel =
  | {
      kind: 'chart'
      points: RiskPoint[]
      min: number
      max: number
      targetRiskRatio?: number
      liquidationRiskRatio?: number
    }
  | {
      kind: 'empty'
      message: string
      currentRiskRatio?: number
      targetRiskRatio?: number
      liquidationRiskRatio?: number
    }
  | {
      kind: 'snapshot'
      title: 'Risk Snapshot'
      eyebrow: 'Read-only DeepBook snapshot'
      message: string
      detail: string
      currentRiskRatio?: number
      targetRiskRatio?: number
      liquidationRiskRatio?: number
      metrics: RiskRatioSnapshotMetric[]
      safetyScale?: RiskRatioSnapshotScale
    }

export function getRiskRatioPathChartViewModel(input: {
  mode?: RiskRatioPathChartMode
  points?: RiskPoint[]
  afterValue?: number
  currentRiskRatio?: number
  targetRiskRatio?: number
  liquidationRiskRatio?: number
  zeroDebt?: boolean
}): RiskRatioPathChartViewModel {
  const targetRiskRatio = input.targetRiskRatio ?? input.afterValue

  if (input.mode === 'deepbook') {
    if (input.zeroDebt) {
      return {
        kind: 'empty',
        message: 'Risk path is unavailable because this manager has no borrowed debt.',
        currentRiskRatio: input.currentRiskRatio,
        targetRiskRatio,
        liquidationRiskRatio: input.liquidationRiskRatio,
      }
    }

    return {
      kind: 'snapshot',
      title: 'Risk Snapshot',
      eyebrow: 'Read-only DeepBook snapshot',
      message: 'Historical risk path is unavailable in browser-only mode.',
      detail: 'MarginGuard does not run an indexer, so this view shows the latest DeepBook read only.',
      currentRiskRatio: input.currentRiskRatio,
      targetRiskRatio,
      liquidationRiskRatio: input.liquidationRiskRatio,
      metrics: buildSnapshotMetrics({
        currentRiskRatio: input.currentRiskRatio,
        targetRiskRatio,
        liquidationRiskRatio: input.liquidationRiskRatio,
      }),
      safetyScale: buildSnapshotScale({
        currentRiskRatio: input.currentRiskRatio,
        targetRiskRatio,
        liquidationRiskRatio: input.liquidationRiskRatio,
      }),
    }
  }

  const points = input.points ?? dashboardRiskPath
  const lineValues = [targetRiskRatio, input.liquidationRiskRatio, ...points.map((point) => point.value)].filter(isFiniteNumber)
  const min = Math.min(...lineValues, 0.95) - 0.05
  const max = Math.max(...lineValues, 1.55) + 0.05

  return {
    kind: 'chart',
    points,
    min,
    max,
    targetRiskRatio,
    liquidationRiskRatio: input.liquidationRiskRatio ?? 1.1,
  }
}

function isFiniteNumber(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value)
}

function buildSnapshotMetrics(input: {
  currentRiskRatio?: number
  targetRiskRatio?: number
  liquidationRiskRatio?: number
}): RiskRatioSnapshotMetric[] {
  return [
    { label: 'Current RR', value: input.currentRiskRatio },
    { label: 'Target RR', value: input.targetRiskRatio },
    { label: 'Liquidation RR', value: input.liquidationRiskRatio },
  ]
}

function buildSnapshotScale(input: {
  currentRiskRatio?: number
  targetRiskRatio?: number
  liquidationRiskRatio?: number
}): RiskRatioSnapshotScale | undefined {
  const values = [input.currentRiskRatio, input.targetRiskRatio, input.liquidationRiskRatio].filter(isFiniteNumber)

  if (values.length === 0) return undefined

  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const min = Math.max(0, Number((minValue - 0.1).toFixed(2)))
  const max = Number((maxValue + 0.1).toFixed(2))

  return {
    min: min === max ? Math.max(0, min - 0.1) : min,
    max: min === max ? max + 0.1 : max,
    currentRiskRatio: input.currentRiskRatio,
    targetRiskRatio: input.targetRiskRatio,
    liquidationRiskRatio: input.liquidationRiskRatio,
  }
}
