import { describe, expect, it } from 'vitest'
import type { AddCollateralExecutionState, AddCollateralTxSummary } from '../../types/tx'
import { createAddCollateralResultView, getSuiExplorerTxUrl } from './addCollateralResult'

const summary: AddCollateralTxSummary = {
  action: 'add-collateral',
  network: 'mainnet',
  managerShort: '0x2222...2222',
  poolKey: 'SUI_USDC',
  collateralAsset: 'USDC',
  amountDisplay: '60.00 USDC',
  amountAtomic: '60000000',
  source: 'deepbook',
  warnings: [],
}

describe('Add Collateral result view model', () => {
  it('shows explorer link only for real digest on a supported network', () => {
    const submitted = createAddCollateralResultView({
      status: 'submitted',
      digest: '0xabc123',
      summary,
    } as AddCollateralExecutionState)

    expect(submitted.explorerUrl).toBe(getSuiExplorerTxUrl('0xabc123', 'mainnet'))
    expect(submitted.details).toContainEqual(['Amount', '60.00 USDC'])
    expect(submitted.details).toContainEqual(['Manager', '0x2222...2222'])

    const rejected = createAddCollateralResultView({ status: 'rejected', message: 'Wallet request rejected by user.' })
    expect(rejected.explorerUrl).toBeUndefined()

    const failed = createAddCollateralResultView({ status: 'failed', message: 'Build failed before submission.' })
    expect(failed.explorerUrl).toBeUndefined()
  })

  it('does not expose mock digests as real explorer links', () => {
    const mock = createAddCollateralResultView(undefined)

    expect(mock.title).toBe('Mock Rescue Result')
    expect(mock.explorerUrl).toBeUndefined()
    expect(JSON.stringify(mock)).toContain('Mock Digest')
  })

  it('keeps refresh-failed honest while preserving the real digest explorer link', () => {
    const view = createAddCollateralResultView({
      status: 'refresh-failed',
      digest: '0xdef456',
      message: 'Transaction may be confirmed, but latest manager state could not be read.',
      summary,
      beforeRiskRatio: 1.1,
    } as AddCollateralExecutionState)

    expect(view.title).toBe('Confirmed, Refresh Failed')
    expect(view.copy).toBe('Transaction may be confirmed, but latest manager state could not be read.')
    expect(view.explorerUrl).toBe(getSuiExplorerTxUrl('0xdef456', 'mainnet'))
  })
})
