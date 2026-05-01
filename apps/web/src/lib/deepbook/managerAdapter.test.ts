import { describe, expect, it } from 'vitest'
import { mockMarginState } from '../demo/mockMarginState'
import {
  getDisabledManagerReadStatus,
  getMockManagerReadStatus,
  readMarginManagerState,
  shouldReadAfterObjectVerification,
  verifyMarginManagerObject,
  type DeepBookMarginReader,
} from './managerAdapter'
import { getDeepBookPoolConfig } from './poolKeys'

const poolConfig = getDeepBookPoolConfig('mainnet')
const expectedBaseCoinType = poolConfig.status === 'configured' ? poolConfig.baseCoinType : '0x2::sui::SUI'
const expectedQuoteCoinType =
  poolConfig.status === 'configured'
    ? poolConfig.quoteCoinType
    : '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
const fakeManagerId = '0x1234567890abcdef1234567890abcdef'

function managerType(base: string, quote: string) {
  return `0xabc::margin_manager::MarginManager<${base}, ${quote}>`
}

describe('DeepBook manager adapter skeleton', () => {
  it('returns a disabled state until Round 4 read integration', () => {
    expect(getDisabledManagerReadStatus()).toEqual({
      status: 'disabled',
      reason: 'DeepBook read integration is scheduled for Round 4',
    })
  })

  it('can expose an explicit mock fallback boundary', () => {
    expect(getMockManagerReadStatus(mockMarginState)).toEqual({
      status: 'mock',
      state: mockMarginState,
    })
  })

  it('verifies manager object type without exposing object ids', async () => {
    const result = await verifyMarginManagerObject({
      client: {
        core: {
          getObject: async () => ({
            object: {
              type: managerType(expectedBaseCoinType, expectedQuoteCoinType),
            },
          }),
        },
      },
      managerObjectId: fakeManagerId,
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(result.status).toBe('exists')
    expect(result.lookupStatus).toBe('exists')
    expect(result.typeVerificationStatus).toBe('match')
    expect(JSON.stringify(result)).not.toContain(fakeManagerId)
  })

  it('allows SDK read after exact match and pair-unverified MarginManager types', async () => {
    const exact = await verifyMarginManagerObject({
      client: {
        core: {
          getObject: async () => ({ object: { type: managerType(expectedBaseCoinType, expectedQuoteCoinType) } }),
        },
      },
      managerObjectId: fakeManagerId,
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })
    const reversed = await verifyMarginManagerObject({
      client: {
        core: {
          getObject: async () => ({ object: { type: managerType(expectedQuoteCoinType, expectedBaseCoinType) } }),
        },
      },
      managerObjectId: fakeManagerId,
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(shouldReadAfterObjectVerification(exact)).toBe(true)
    expect(shouldReadAfterObjectVerification(reversed)).toBe(true)
    expect(reversed.typeVerificationStatus).toBe('margin-manager-pair-unverified')
  })

  it('blocks SDK read after unrelated and pair-mismatched object types', async () => {
    const unrelated = await verifyMarginManagerObject({
      client: {
        core: {
          getObject: async () => ({ object: { type: `0x2::coin::Coin<${expectedBaseCoinType}>` } }),
        },
      },
      managerObjectId: fakeManagerId,
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })
    const mismatch = await verifyMarginManagerObject({
      client: {
        core: {
          getObject: async () => ({ object: { type: managerType(expectedBaseCoinType, '0x999::fake::FAKE') } }),
        },
      },
      managerObjectId: fakeManagerId,
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(shouldReadAfterObjectVerification(unrelated)).toBe(false)
    expect(shouldReadAfterObjectVerification(mismatch)).toBe(false)
    expect(unrelated.typeVerificationStatus).toBe('not-margin-manager')
    expect(mismatch.typeVerificationStatus).toBe('pair-mismatch')
  })

  it('calls getMarginManagerState with the activeManager alias and no hardcoded decimals by default', async () => {
    let calledWith: { managerKey: string; decimals?: number } | undefined
    const reader: DeepBookMarginReader = {
      getMarginManagerState: async (managerKey, decimals) => {
        calledWith = { managerKey, decimals }
        return {}
      },
      getLiquidationRiskRatio: async () => 1.1,
      getTargetLiquidationRiskRatio: async () => 1.3,
      getMarginPoolInterestRate: async () => 0.0642,
      midPrice: async () => 1.35,
    }

    await readMarginManagerState({
      reader,
      managerKey: 'activeManager',
      poolConfig,
    })

    expect(calledWith).toEqual({ managerKey: 'activeManager', decimals: undefined })
  })

  it('classifies type mismatch and missing objects as recoverable verification results', async () => {
    const mismatch = await verifyMarginManagerObject({
      client: {
        core: {
          getObject: async () => ({ object: { type: '0x2::coin::Coin<0x2::sui::SUI>' } }),
        },
      },
      managerObjectId: fakeManagerId,
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(mismatch.status).toBe('type-mismatch')
    expect(mismatch.typeVerificationStatus).toBe('not-margin-manager')

    const missing = await verifyMarginManagerObject({
      client: {
        core: {
          getObject: async () => {
            throw new Error(`Object ${fakeManagerId} not found`)
          },
        },
      },
      managerObjectId: fakeManagerId,
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(missing.status).toBe('not-found')
    expect(missing.message).toBe('Object 0x1234...cdef not found')
  })
})
