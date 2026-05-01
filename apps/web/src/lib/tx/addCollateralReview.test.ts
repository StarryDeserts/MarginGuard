import { describe, expect, it } from 'vitest'
import { mockMarginState } from '../demo/mockMarginState'
import { createAddCollateralReviewModel } from './addCollateralReview'

describe('Add Collateral review model', () => {
  it('builds a non-executable preview model with redacted manager ID and warnings', () => {
    const model = createAddCollateralReviewModel({
      sourceState: 'full-deepbook',
      state: {
        ...mockMarginState,
        manager: {
          ...mockMarginState.manager,
          objectId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          network: 'mainnet',
          poolKey: 'SUI_USDC',
        },
        source: 'deepbook',
        riskRatio: 1.17,
        targetRiskRatio: 1.3,
        liquidationRiskRatio: 1.1,
        assetValueUsd: 540,
        debtValueUsd: 461.54,
        walletAddress: '0xd8521111111111111111111111111111111111111111111111111111111123a9',
      },
    })

    expect(model.action).toBe('add-collateral')
    expect(model.managerShort).toBe('0x1234...cdef')
    expect(JSON.stringify(model)).not.toContain('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
    expect(model.amountDisplay).toContain('USDC')
    expect(BigInt(model.amountAtomic)).toBeGreaterThan(0n)
    expect(model.isExecutable).toBe(false)
    expect(model.buildStatus).toBe('not-built')
    expect(model.unsignedTxAvailable).toBe(false)
    expect(model.signingEnabled).toBe(false)
    expect(model.capabilityStatus).toBe('verified')
    expect(model.exactDeepBookWriteApi).toBe('verified')
    expect(model.verifiedSdkMethod).toBe('marginManager.depositQuote')
    expect(model.connectedWalletShort).toBe('0xd852...23a9')
    expect(model.warnings).toContain('No wallet prompt from simulated or blocked state')
    expect(model.warnings).toContain('Wallet signing not enabled by this preview')
    expect(model.warnings).toContain('No transaction has been submitted')
    expect(model.warnings).toContain('You are depositing USDC into this Margin Manager.')
    expect(model.warnings).toContain('Verify the manager ID before signing.')
    expect(model.warnings).toContain('Ownership is not inferred from the imported manager ID.')
    expect(model.warnings).toContain('MarginGuard does not custody funds and cannot reverse this transaction.')
    expect(model.warnings).toContain('Final transaction details will appear in your wallet.')
  })

  it('keeps healthy managers blocked as no live rescue candidates', () => {
    const model = createAddCollateralReviewModel({
      sourceState: 'full-deepbook',
      state: {
        ...mockMarginState,
        source: 'deepbook',
        riskRatio: 2.11,
        targetRiskRatio: 1.25,
        assetValueUsd: 54.94,
        debtValueUsd: 26,
      },
    })

    expect(model.isExecutable).toBe(false)
    expect(model.signingEnabled).toBe(false)
    expect(model.unsignedTxAvailable).toBe(false)
    expect(model.amountAtomic).toBe('0')
    expect(model.blockedReason).toBe('No action-needed Add Collateral recommendation is available.')
  })
})
