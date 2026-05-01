import { describe, expect, it } from 'vitest'
import { dashboardRiskPath } from '../../lib/risk/riskRatio'
import { getRiskRatioPathChartViewModel } from './riskRatioPathChartModel'

describe('RiskRatioPathChart view model', () => {
  it('does not use mock historical path for full DeepBook state', () => {
    const viewModel = getRiskRatioPathChartViewModel({
      mode: 'deepbook',
      points: dashboardRiskPath,
      currentRiskRatio: 2.11,
      targetRiskRatio: 1.25,
      liquidationRiskRatio: 1.1,
    })

    expect(viewModel.kind).toBe('snapshot')
      expect('points' in viewModel).toBe(false)
      if (viewModel.kind === 'snapshot') {
        expect(viewModel.title).toBe('Risk Snapshot')
      expect(viewModel.message).toBe('Historical risk path is unavailable in browser-only mode.')
      expect(viewModel.detail).toBe('MarginGuard does not run an indexer, so this view shows the latest DeepBook read only.')
      expect(viewModel.targetRiskRatio).toBe(1.25)
      expect(viewModel.metrics).toEqual([
        { label: 'Current RR', value: 2.11 },
        { label: 'Target RR', value: 1.25 },
        { label: 'Liquidation RR', value: 1.1 },
      ])
      expect(viewModel.safetyScale?.currentRiskRatio).toBe(2.11)
      expect(viewModel.safetyScale?.targetRiskRatio).toBe(1.25)
      expect(viewModel.safetyScale?.liquidationRiskRatio).toBe(1.1)
    }
  })

  it('shows a zero-debt empty state without plotting sentinel risk values', () => {
    const viewModel = getRiskRatioPathChartViewModel({
      mode: 'deepbook',
      currentRiskRatio: 1000,
      targetRiskRatio: 1.25,
      liquidationRiskRatio: 1.1,
      zeroDebt: true,
    })

    expect(viewModel.kind).toBe('empty')
    if (viewModel.kind === 'empty') {
      expect(viewModel.message).toBe('Risk path is unavailable because this manager has no borrowed debt.')
      expect(viewModel.currentRiskRatioDisplay).toBe('No debt')
      expect(JSON.stringify(viewModel)).not.toContain('1000')
    }
  })

  it('keeps mock paths available for mock/demo screens', () => {
    const viewModel = getRiskRatioPathChartViewModel({
      mode: 'mock',
      points: dashboardRiskPath,
      targetRiskRatio: 1.3,
    })

    expect(viewModel.kind).toBe('chart')
    if (viewModel.kind === 'chart') {
      expect(viewModel.points).toEqual(dashboardRiskPath)
      expect(viewModel.targetRiskRatio).toBe(1.3)
    }
  })
})
