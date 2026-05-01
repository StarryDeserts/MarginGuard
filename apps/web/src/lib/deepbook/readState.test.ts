import { describe, expect, it } from 'vitest'
import {
  buildManagerReadDiagnostic,
  getDashboardSourceState,
  getMarginManagerQueryDisabledReason,
  getMarginManagerQueryKey,
  getRecommendedActionAvailability,
  mapManagerReadErrorToSourceState,
} from './readState'
import { createLocalManagerRecord } from '../storage/localManagers'
import { getDeepBookPoolConfig } from './poolKeys'
import { mockMarginState } from '../demo/mockMarginState'

const manager = createLocalManagerRecord({
  objectId: '0x1234567890abcdef',
  network: 'mainnet',
  nowMs: 1_765_084_800_000,
})

describe('DeepBook read state helpers', () => {
  it('builds a query key from network, manager id, pool key, and wallet address', () => {
    expect(getMarginManagerQueryKey('mainnet', manager, 'SUI_USDC', '0xabc123')).toEqual([
      'margin-manager-state',
      'mainnet',
      manager.objectId,
      'SUI_USDC',
      '0xabc123',
    ])
  })

  it('disables reads without a manager, wallet, or configured pool', () => {
    expect(getMarginManagerQueryDisabledReason({ manager: undefined, poolConfig: getDeepBookPoolConfig('mainnet') })).toBe(
      'No manager imported',
    )
    expect(
      getMarginManagerQueryDisabledReason({
        manager,
        poolConfig: getDeepBookPoolConfig('mainnet'),
        walletAddress: undefined,
      }),
    ).toBe('Connect wallet to read DeepBook state. No signing.')
    expect(
      getMarginManagerQueryDisabledReason({
        manager: { ...manager, network: 'testnet' },
        poolConfig: getDeepBookPoolConfig('testnet'),
        walletAddress: '0xabc123',
      }),
    ).toContain('not configured')
  })

  it('returns source labels without promoting mock values to DeepBook state', () => {
    expect(getDashboardSourceState({ kind: 'success', isPartial: false }).label).toBe('DeepBook state')
    expect(getDashboardSourceState({ kind: 'success', isPartial: true }).label).toBe('Partial DeepBook state')
    expect(getDashboardSourceState({ kind: 'mock' }).label).toBe('Mock fallback')
    expect(getDashboardSourceState({ kind: 'error' }).message).toBe('Could not read this manager. Check network and object ID.')
  })

  it('keeps wallet-required separate from network configuration errors', () => {
    const sourceState = getDashboardSourceState({ kind: 'wallet-required' })

    expect(sourceState.kind).toBe('wallet-required')
    expect(sourceState.label).toBe('Wallet required')
    expect(sourceState.message).toBe('Connect Sui Wallet to read this manager.')
  })

  it('explains verified mainnet and unconfigured testnet states without fake support', () => {
    expect(getDashboardSourceState({ kind: 'mainnet-configured' }).message).toBe(
      'Verified SUI/USDC DeepBook Margin config is available for Mainnet in this build.',
    )

    expect(
      getDashboardSourceState({
        kind: 'not-configured',
        message: 'Testnet SUI/USDC is not configured from verified SDK constants.',
      }).message,
    ).toBe('Testnet SUI/USDC is not configured from verified SDK constants.')
  })

  it('builds redacted diagnostics when no manager is selected', () => {
    const diagnostic = buildManagerReadDiagnostic({
      selectedNetwork: 'mainnet',
      poolConfig: getDeepBookPoolConfig('mainnet'),
      walletConnected: false,
      walletAddressPresent: false,
      walletNetworkVerified: false,
      queryEnabled: false,
      queryStatus: 'idle',
    })

    expect(diagnostic.sourceState).toBe('no-manager')
    expect(diagnostic.disabledReason).toBe('no-manager')
    expect(diagnostic.selectedManagerPresent).toBe(false)
  })

  it('builds wallet-required diagnostics without leaking the full manager id', () => {
    const diagnostic = buildManagerReadDiagnostic({
      selectedNetwork: 'mainnet',
      manager,
      poolConfig: getDeepBookPoolConfig('mainnet'),
      walletConnected: false,
      walletAddressPresent: false,
      walletNetworkVerified: false,
      queryEnabled: false,
      queryStatus: 'idle',
    })

    expect(diagnostic.sourceState).toBe('wallet-required')
    expect(diagnostic.disabledReason).toBe('no-wallet-address')
    expect(diagnostic.managerObjectIdShort).toBe('0x1234...cdef')
    expect(JSON.stringify(diagnostic)).not.toContain(manager.objectId)
  })

  it('maps SDK and object verification errors to actionable read-error states', () => {
    expect(mapManagerReadErrorToSourceState({ status: 'error', category: 'sdk-read' }).sourceState).toBe('read-error')
    expect(mapManagerReadErrorToSourceState({ status: 'error', category: 'object-not-found' }).errorMessage).toBe(
      'Read error: manager object not found.',
    )
    expect(mapManagerReadErrorToSourceState({ status: 'error', category: 'object-type-mismatch' }).errorMessage).toBe(
      'Read error: object is not a SUI/USDC Margin Manager.',
    )
    expect(mapManagerReadErrorToSourceState({ status: 'error', category: 'normalization' }).normalizeStatus).toBe(
      'failed',
    )
  })

  it('marks Add Collateral review unavailable when risk inputs are missing', () => {
    expect(getRecommendedActionAvailability(undefined)).toEqual({
      canRecommend: false,
      actionability: 'unavailable',
      title: 'Recommendation unavailable',
      copy: 'Read manager state before computing a rescue action.',
      secondaryNote: 'Open Rescue Simulator Preview uses simulated fallback values until real manager data is available.',
      reviewDisabled: true,
    })
  })

  it('does not present Add Collateral as actionable when no rescue is needed', () => {
    expect(
      getRecommendedActionAvailability(
        {
          ...mockMarginState,
          riskRatio: 2.11,
          targetRiskRatio: 1.25,
          assetValueUsd: 54.94,
          debtValueUsd: 26,
          baseDebt: 0,
          quoteDebt: 26,
        },
        'full-deepbook',
      ),
    ).toMatchObject({
      canRecommend: false,
      actionability: 'no-rescue-needed',
      title: 'No rescue needed',
      reviewDisabled: true,
    })
  })

  it('disables PTB preview for zero-debt and read-error states', () => {
    expect(
      getRecommendedActionAvailability(
        {
          ...mockMarginState,
          riskRatio: 1000,
          targetRiskRatio: 1.25,
          assetValueUsd: 100,
          debtValueUsd: 0,
          baseDebt: 0,
          quoteDebt: 0,
        },
        'full-deepbook',
      ),
    ).toMatchObject({
      canRecommend: false,
      actionability: 'zero-debt',
      title: 'No active debt',
      reviewDisabled: true,
    })

    expect(getRecommendedActionAvailability(mockMarginState, 'read-error')).toMatchObject({
      canRecommend: false,
      actionability: 'read-error',
      title: 'Recommendation unavailable',
      reviewDisabled: true,
    })
  })

  it('keeps object lookup and type verification diagnostics separate', () => {
    const diagnostic = buildManagerReadDiagnostic({
      selectedNetwork: 'mainnet',
      manager,
      poolConfig: getDeepBookPoolConfig('mainnet'),
      walletConnected: true,
      walletAddressPresent: true,
      walletNetworkVerified: false,
      queryEnabled: true,
      queryStatus: 'success',
      configuredManagerKey: 'activeManager',
      sdkMethodArgument: 'activeManager',
      sdkDecimalsArgument: undefined,
      sdkMethodName: 'getMarginManagerState',
      objectLookupStatus: 'exists',
      objectTypeVerificationStatus: 'match',
      actualObjectType: '0xabc::margin_manager::MarginManager<0x2::sui::SUI,0xdef::usdc::USDC>',
      expectedBaseCoinType: '0x2::sui::SUI',
      expectedQuoteCoinType: '0xdef::usdc::USDC',
      objectTypeCheckReason: 'Object type exactly matches MarginManager<SUI, USDC>.',
      sourceState: 'unavailable',
    })

    expect(diagnostic.objectLookupStatus).toBe('exists')
    expect(diagnostic.objectTypeVerificationStatus).toBe('match')
    expect(diagnostic.configuredManagerKey).toBe('activeManager')
    expect(diagnostic.sdkMethodArgument).toBe('activeManager')
    expect(diagnostic.sdkDecimalsArgument).toBeUndefined()
    expect(diagnostic.actualObjectType).toContain('margin_manager::MarginManager')
    expect(JSON.stringify(diagnostic)).not.toContain(manager.objectId)
  })
})
