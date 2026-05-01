export function formatUsd(value: number) {
  if (!Number.isFinite(value)) return 'N/A'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatRatio(value: number) {
  if (!Number.isFinite(value)) return 'N/A'

  return value.toFixed(2)
}

export function formatPct(value: number) {
  if (!Number.isFinite(value)) return 'N/A'

  return `${value.toFixed(1)}%`
}

export function formatApr(value: number) {
  if (!Number.isFinite(value)) return 'N/A'

  return `${value.toFixed(2)}%`
}

export function formatUsdc(value: number) {
  if (!Number.isFinite(value)) return 'N/A'

  return `${value.toFixed(2)} USDC`
}

export function formatDisplayPct(value: number) {
  if (!Number.isFinite(value)) return 'N/A'

  return `${value.toFixed(0)}%`
}

export function formatDecimalPct(value: number) {
  if (!Number.isFinite(value)) return 'N/A'

  return `${(value * 100).toFixed(0)}%`
}

export { shortAddress } from './address'
