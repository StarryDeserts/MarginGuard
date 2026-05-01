import { describe, expect, it } from 'vitest'
import { formatAtomicAmountForDiagnostics, parseDecimalAmountToAtomic } from './amounts'

describe('decimal display amount to atomic amount parsing', () => {
  it('parses USDC display strings without floating-point arithmetic', () => {
    expect(parseDecimalAmountToAtomic('60.00', 6)).toEqual({
      status: 'success',
      atomic: 60_000_000n,
      normalizedDisplay: '60.00',
    })
    expect(parseDecimalAmountToAtomic('0.000001', 6)).toEqual({
      status: 'success',
      atomic: 1n,
      normalizedDisplay: '0.000001',
    })
  })

  it('rejects unsafe or non-positive amounts', () => {
    expect(parseDecimalAmountToAtomic('0', 6)).toMatchObject({ status: 'error', code: 'non-positive' })
    expect(parseDecimalAmountToAtomic('-1', 6)).toMatchObject({ status: 'error', code: 'negative' })
    expect(parseDecimalAmountToAtomic('0.0000001', 6)).toMatchObject({ status: 'error', code: 'over-precision' })
    expect(parseDecimalAmountToAtomic('1e3', 6)).toMatchObject({ status: 'error', code: 'invalid-format' })
    expect(parseDecimalAmountToAtomic('Infinity', 6)).toMatchObject({ status: 'error', code: 'invalid-format' })
    expect(parseDecimalAmountToAtomic('NaN', 6)).toMatchObject({ status: 'error', code: 'invalid-format' })
  })

  it('formats atomic values for diagnostics without changing PTB units', () => {
    expect(formatAtomicAmountForDiagnostics(60_000_000n, 6)).toBe('60')
    expect(formatAtomicAmountForDiagnostics(1n, 6)).toBe('0.000001')
  })
})
