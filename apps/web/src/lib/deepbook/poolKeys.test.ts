import { describe, expect, it } from 'vitest'
import { getDeepBookPoolConfig, normalizePoolKey } from './poolKeys'

describe('DeepBook pool config', () => {
  it('configures verified mainnet SUI/USDC from the SDK constants', () => {
    const config = getDeepBookPoolConfig('mainnet')

    expect(config.status).toBe('configured')
    expect(config.poolKey).toBe('SUI_USDC')
    expect(config.displayPair).toBe('SUI/USDC')
    expect(config.network).toBe('mainnet')

    if (config.status === 'configured') {
      expect(config.sdkPoolKey).toBe('SUI_USDC')
      expect(config.poolId).toMatch(/^0x[a-f0-9]+$/i)
      expect(config.baseCoinKey).toBe('SUI')
      expect(config.quoteCoinKey).toBe('USDC')
      expect(config.baseCoinType).toContain('::sui::SUI')
      expect(config.quoteCoinType).toContain('::usdc::USDC')
      expect(config.baseCoinDecimals).toBe(9)
      expect(config.quoteCoinDecimals).toBe(6)
      expect(config.quoteCoinScalar).toBe(1_000_000)
    }
  })

  it('returns a recoverable not-configured state for unverified testnet SUI/USDC', () => {
    const config = getDeepBookPoolConfig('testnet')

    expect(config.status).toBe('not-configured')
    if (config.status === 'not-configured') {
      expect(config.message).toContain('SUI/USDC')
    }
  })

  it('normalizes display pool labels into supported SDK pool keys', () => {
    expect(normalizePoolKey('SUI_USDC')).toBe('SUI_USDC')
    expect(normalizePoolKey('SUI/USDC')).toBe('SUI_USDC')
    expect(normalizePoolKey('ETH/USDC')).toBeNull()
  })
})
