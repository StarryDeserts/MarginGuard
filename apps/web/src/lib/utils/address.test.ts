import { describe, expect, it } from 'vitest'
import { redactObjectIds, shortAddress } from './address'

describe('address utilities', () => {
  it('shortens long Sui addresses for compact UI display', () => {
    expect(shortAddress('0x1234567890abcdef1234567890abcdef')).toBe('0x1234...cdef')
  })

  it('leaves already-short or demo-shortened addresses unchanged', () => {
    expect(shortAddress('0x1234')).toBe('0x1234')
    expect(shortAddress('0x3a8b...7cF2')).toBe('0x3a8b...7cF2')
  })

  it('redacts long object ids in diagnostics and error messages', () => {
    expect(redactObjectIds('manager 0x1234567890abcdef1234567890abcdef failed')).toBe(
      'manager 0x1234...cdef failed',
    )
  })
})
