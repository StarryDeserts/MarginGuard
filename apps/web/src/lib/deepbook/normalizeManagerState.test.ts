import { describe, expect, it } from 'vitest'
import { createLocalManagerRecord } from '../storage/localManagers'
import { getDeepBookPoolConfig } from './poolKeys'
import { normalizeManagerState } from './normalizeManagerState'
import type { DeepBookRawManagerRead } from './managerAdapter'

const manager = createLocalManagerRecord({
  objectId: '0x1234567890abcdef',
  network: 'mainnet',
  nowMs: 1_765_084_800_000,
})

describe('normalizeManagerState', () => {
  it('normalizes verified full DeepBook manager state without mock fallback values', () => {
    const poolConfig = getDeepBookPoolConfig('mainnet')
    const raw: DeepBookRawManagerRead = {
      state: {
        managerId: manager.objectId,
        deepbookPoolId: '0xe05daf',
        riskRatio: 1.42,
        baseAsset: '100',
        quoteAsset: '25',
        baseDebt: '0',
        quoteDebt: '80',
        basePythPrice: '150000000',
        basePythDecimals: 8,
        quotePythPrice: '100000000',
        quotePythDecimals: 8,
      },
      liquidationRiskRatio: 1.1,
      targetRiskRatio: 1.3,
      borrowAprDecimal: 0.052,
    }

    const result = normalizeManagerState({
      raw,
      manager,
      poolConfig,
      walletAddress: '0xabc123',
      nowMs: 1_765_084_900_000,
      availableFields: ['riskRatio', 'assetValueUsd', 'debtValueUsd', 'borrowAprDecimal'],
      missingFields: [],
    })

    expect(result.status).toBe('success')
    if (result.status === 'success') {
      expect(result.state.source).toBe('deepbook')
      expect(result.state.walletAddress).toBe('0xabc123')
      expect(result.state.readStatusLabel).toBe('DeepBook state')
      expect(result.state.isPartial).toBe(false)
      expect(result.state.assetValueUsd).toBe(175)
      expect(result.state.debtValueUsd).toBe(80)
      expect(result.state.riskRatio).toBe(1.42)
      expect(result.state.borrowAprDisplayPct).toBe(5.2)
      expect(result.state.availableFields).toContain('riskRatio')
      expect(result.state.estimatedFields).toEqual([])
    }
  })

  it('keeps partial DeepBook data partial when debt values are unavailable', () => {
    const poolConfig = getDeepBookPoolConfig('mainnet')
    const raw: DeepBookRawManagerRead = {
      state: {
        managerId: manager.objectId,
        deepbookPoolId: '0xe05daf',
        baseAsset: '100',
        quoteAsset: '25',
        basePythPrice: '150000000',
        basePythDecimals: 8,
        quotePythPrice: '100000000',
        quotePythDecimals: 8,
      },
    }

    const result = normalizeManagerState({
      raw,
      manager,
      poolConfig,
      walletAddress: '0xabc123',
      nowMs: 1_765_084_900_000,
      availableFields: ['assetValueUsd'],
      missingFields: ['debtValueUsd', 'riskRatio'],
    })

    expect(result.status).toBe('success')
    if (result.status === 'success') {
      expect(result.state.readStatusLabel).toBe('Partial DeepBook state')
      expect(result.state.isPartial).toBe(true)
      expect(result.state.assetValueUsd).toBe(175)
      expect(result.state.debtValueUsd).toBeUndefined()
      expect(result.state.riskRatio).toBeUndefined()
      expect(result.state.missingFields).toContain('riskRatio')
      expect(result.state.missingFields).toContain('debtValueUsd')
    }
  })

  it('does not calculate liquidation distance for zero-debt manager states', () => {
    const poolConfig = getDeepBookPoolConfig('mainnet')
    const raw: DeepBookRawManagerRead = {
      state: {
        managerId: manager.objectId,
        deepbookPoolId: '0xe05daf',
        riskRatio: 1000,
        baseAsset: '10',
        quoteAsset: '0',
        baseDebt: '0',
        quoteDebt: '0',
        basePythPrice: '150000000',
        basePythDecimals: 8,
        quotePythPrice: '100000000',
        quotePythDecimals: 8,
      },
      liquidationRiskRatio: 1.1,
      targetRiskRatio: 1.25,
      borrowAprDecimal: 0.02,
    }

    const result = normalizeManagerState({
      raw,
      manager,
      poolConfig,
      nowMs: 1_765_084_900_000,
      availableFields: ['riskRatio', 'assetValueUsd', 'debtValueUsd'],
      missingFields: [],
    })

    expect(result.status).toBe('success')
    if (result.status === 'success') {
      expect(result.state.debtValueUsd).toBe(0)
      expect(result.state.riskRatio).toBe(1000)
      expect(result.state.liquidationDistancePct).toBeUndefined()
    }
  })
})
