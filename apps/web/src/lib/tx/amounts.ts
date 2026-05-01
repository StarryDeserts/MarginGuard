export type ParseAtomicAmountErrorCode =
  | 'empty'
  | 'invalid-format'
  | 'non-positive'
  | 'negative'
  | 'over-precision'
  | 'invalid-decimals'

export type ParseAtomicAmountResult =
  | { status: 'success'; atomic: bigint; normalizedDisplay: string }
  | { status: 'error'; code: ParseAtomicAmountErrorCode; message: string }

const DECIMAL_AMOUNT_PATTERN = /^(0|[1-9]\d*)(?:\.(\d+))?$/

export function parseDecimalAmountToAtomic(displayAmount: string, decimals: number): ParseAtomicAmountResult {
  if (!Number.isInteger(decimals) || decimals < 0) {
    return { status: 'error', code: 'invalid-decimals', message: 'Token decimals must be a non-negative integer.' }
  }

  const input = displayAmount.trim()

  if (!input) {
    return { status: 'error', code: 'empty', message: 'Amount is required.' }
  }

  if (input.startsWith('-')) {
    return { status: 'error', code: 'negative', message: 'Amount must be positive.' }
  }

  if (!DECIMAL_AMOUNT_PATTERN.test(input)) {
    return { status: 'error', code: 'invalid-format', message: 'Use a plain decimal amount without scientific notation.' }
  }

  const [, wholePart, fractionPart = ''] = input.match(DECIMAL_AMOUNT_PATTERN) ?? []

  if (fractionPart.length > decimals) {
    return {
      status: 'error',
      code: 'over-precision',
      message: `Amount has more than ${decimals} decimal places.`,
    }
  }

  const paddedFraction = fractionPart.padEnd(decimals, '0')
  const atomic = BigInt(`${wholePart}${paddedFraction}`.replace(/^0+(?=\d)/, ''))

  if (atomic <= 0n) {
    return { status: 'error', code: 'non-positive', message: 'Amount must be greater than zero.' }
  }

  return {
    status: 'success',
    atomic,
    normalizedDisplay: fractionPart ? `${wholePart}.${fractionPart}` : wholePart,
  }
}

export function formatAtomicAmountForDiagnostics(atomic: bigint, decimals: number) {
  if (!Number.isInteger(decimals) || decimals < 0) return atomic.toString()
  if (decimals === 0) return atomic.toString()

  const sign = atomic < 0n ? '-' : ''
  const digits = (atomic < 0n ? -atomic : atomic).toString().padStart(decimals + 1, '0')
  const whole = digits.slice(0, -decimals)
  const fraction = digits.slice(-decimals).replace(/0+$/, '')

  return `${sign}${whole}${fraction ? `.${fraction}` : ''}`
}
