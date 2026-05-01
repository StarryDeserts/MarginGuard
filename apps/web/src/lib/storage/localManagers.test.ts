import { describe, expect, it } from 'vitest'
import {
  LOCAL_MANAGERS_KEY,
  createLocalManagerRecord,
  isValidObjectId,
  parseLocalManagers,
  readLastNetwork,
  readLocalManagers,
  writeLastNetwork,
  writeLocalManagers,
  type StorageLike,
} from './localManagers'

function createMemoryStorage(): StorageLike {
  const values = new Map<string, string>()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

describe('local manager storage', () => {
  it('accepts valid Sui-like object IDs and rejects invalid IDs', () => {
    expect(isValidObjectId('0x1234abcd5678ef90')).toBe(true)
    expect(isValidObjectId('1234abcd')).toBe(false)
    expect(isValidObjectId('0x1234...abcd')).toBe(false)
    expect(isValidObjectId('0xzzzzzzzz')).toBe(false)
  })

  it('handles malformed JSON safely', () => {
    expect(parseLocalManagers('{bad json')).toEqual([])
  })

  it('round-trips valid records through a storage-like object', () => {
    const storage = createMemoryStorage()
    const record = createLocalManagerRecord({
      objectId: '0x1234abcd5678ef90',
      network: 'mainnet',
      nowMs: 1,
    })

    writeLocalManagers([record], storage)

    expect(storage.getItem(LOCAL_MANAGERS_KEY)).toContain(record.objectId)
    expect(readLocalManagers(storage)).toEqual([record])
  })

  it('persists selected app network and falls back to mainnet for malformed values', () => {
    const storage = createMemoryStorage()

    writeLastNetwork('testnet', storage)

    expect(readLastNetwork(storage)).toBe('testnet')

    storage.setItem('marginguard:v0:lastNetwork', 'devnet')

    expect(readLastNetwork(storage)).toBe('mainnet')
  })

  it('keeps manager record network tied to the saved manager', () => {
    const record = createLocalManagerRecord({
      objectId: '0xabcdef1234567890',
      network: 'testnet',
      nowMs: 2,
    })

    expect(record.network).toBe('testnet')
    expect(record.displayPair).toBe('SUI/USDC')
    expect(record.poolKey).toBe('SUI_USDC')
  })
})
