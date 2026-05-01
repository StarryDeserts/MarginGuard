import { describe, expect, it } from 'vitest'
import {
  getNetworkLabel,
  getNetworkMismatchState,
  getSuiNetworkConfig,
  isAppNetwork,
  normalizeNetwork,
} from './networks'

describe('Sui network helpers', () => {
  it('normalizes supported app networks and falls back safely', () => {
    expect(isAppNetwork('mainnet')).toBe(true)
    expect(isAppNetwork('testnet')).toBe(true)
    expect(isAppNetwork('devnet')).toBe(false)
    expect(normalizeNetwork('testnet')).toBe('testnet')
    expect(normalizeNetwork('devnet')).toBe('mainnet')
  })

  it('returns labels and grpc URLs for supported networks', () => {
    expect(getNetworkLabel('mainnet')).toBe('Mainnet')
    expect(getNetworkLabel('testnet')).toBe('Testnet')
    expect(getSuiNetworkConfig('mainnet').grpcUrl).toContain('mainnet')
    expect(getSuiNetworkConfig('testnet').grpcUrl).toContain('testnet')
  })

  it('only reports mismatch when wallet network is reliable and supported', () => {
    expect(getNetworkMismatchState('mainnet')).toEqual({ status: 'unknown', message: 'Wallet network not verified' })
    expect(getNetworkMismatchState('mainnet', 'mainnet')).toEqual({ status: 'match' })
    expect(getNetworkMismatchState('mainnet', 'testnet')).toEqual({
      status: 'mismatch',
      message: 'Wallet network Testnet differs from selected app network Mainnet',
    })
    expect(getNetworkMismatchState('mainnet', 'devnet')).toEqual({ status: 'unknown', message: 'Wallet network not verified' })
  })
})
