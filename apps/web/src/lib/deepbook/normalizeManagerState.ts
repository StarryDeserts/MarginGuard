import type { MarginManagerRef, NormalizedMarginState } from '../../types/margin'
import { calcLiquidationDistancePct } from '../risk/liquidation'
import { calcRiskRatio, DEBT_EPSILON_USD } from '../risk/riskRatio'
import type { DeepBookRawManagerRead } from './managerAdapter'
import type { DeepBookPoolConfig } from './poolKeys'

export type NormalizeManagerStateResult =
  | { status: 'success'; state: NormalizedMarginState }
  | { status: 'not-configured'; message: string }
  | { status: 'error'; message: string }

export function normalizeManagerState(input: {
  raw: DeepBookRawManagerRead
  manager: MarginManagerRef
  poolConfig: DeepBookPoolConfig
  walletAddress?: string
  nowMs?: number
  availableFields?: string[]
  missingFields?: string[]
}): NormalizeManagerStateResult {
  if (input.poolConfig.status !== 'configured') {
    return { status: 'not-configured', message: input.poolConfig.message }
  }

  const state = input.raw.state
  if (!state) {
    return { status: 'error', message: 'DeepBook response did not include manager state.' }
  }

  const baseAsset = parseFiniteNumber(state.baseAsset)
  const quoteAsset = parseFiniteNumber(state.quoteAsset)
  const baseDebt = parseFiniteNumber(state.baseDebt)
  const quoteDebt = parseFiniteNumber(state.quoteDebt)
  const basePriceUsd = normalizePythPrice(state.basePythPrice, state.basePythDecimals) ?? input.raw.midPrice
  const quotePriceUsd = normalizePythPrice(state.quotePythPrice, state.quotePythDecimals) ?? 1
  const assetValueUsd =
    baseAsset !== undefined && quoteAsset !== undefined && basePriceUsd !== undefined
      ? baseAsset * basePriceUsd + quoteAsset * quotePriceUsd
      : undefined
  const debtValueUsd =
    baseDebt !== undefined && quoteDebt !== undefined && basePriceUsd !== undefined
      ? baseDebt * basePriceUsd + quoteDebt * quotePriceUsd
      : undefined
  const sdkRiskRatio = parseFiniteNumber(state.riskRatio)
  const estimatedFields: string[] = []
  const riskRatio =
    sdkRiskRatio ??
    (assetValueUsd !== undefined && debtValueUsd !== undefined && debtValueUsd > 0
      ? trackEstimated('riskRatio', calcRiskRatio(assetValueUsd, debtValueUsd), estimatedFields)
      : undefined)
  const hasRawDebt = baseDebt !== undefined || quoteDebt !== undefined
  const zeroDebt = hasRawDebt
    ? Math.abs(baseDebt ?? 0) <= DEBT_EPSILON_USD && Math.abs(quoteDebt ?? 0) <= DEBT_EPSILON_USD
    : debtValueUsd !== undefined && Math.abs(debtValueUsd) <= DEBT_EPSILON_USD
  const liquidationRiskRatio = parseFiniteNumber(input.raw.liquidationRiskRatio)
  const targetRiskRatio = parseFiniteNumber(input.raw.targetRiskRatio)
  const liquidationDistancePct =
    !zeroDebt && riskRatio !== undefined && liquidationRiskRatio !== undefined
      ? calcLiquidationDistancePct(riskRatio, liquidationRiskRatio)
      : undefined
  const borrowAprDecimal = parseFiniteNumber(input.raw.borrowAprDecimal)
  const missingFields = mergeMissingFields(input.missingFields ?? [], {
    assetValueUsd,
    debtValueUsd,
    riskRatio,
    liquidationRiskRatio,
    targetRiskRatio,
    borrowAprDecimal,
  })
  const availableFields = [...new Set(input.availableFields ?? deriveAvailableFields(missingFields))]
  const isPartial = missingFields.length > 0

  return {
    status: 'success',
    state: {
      manager: input.manager,
      walletAddress: input.walletAddress,
      baseSymbol: 'SUI',
      quoteSymbol: 'USDC',
      marketLabel: input.poolConfig.displayPair,
      baseAsset,
      quoteAsset,
      baseDebt,
      quoteDebt,
      basePriceUsd,
      quotePriceUsd,
      assetValueUsd,
      debtValueUsd,
      riskRatio,
      liquidationRiskRatio,
      targetRiskRatio,
      liquidationDistancePct,
      borrowAprDecimal,
      borrowAprDisplayPct: borrowAprDecimal !== undefined ? borrowAprDecimal * 100 : undefined,
      updatedAtMs: input.nowMs ?? Date.now(),
      source: 'deepbook',
      readStatusLabel: isPartial ? 'Partial DeepBook state' : 'DeepBook state',
      estimatedFields,
      availableFields,
      missingFields,
      isPartial,
    },
  }
}

function parseFiniteNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined

  const numericValue = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(numericValue) ? numericValue : undefined
}

function normalizePythPrice(price: unknown, decimals: unknown) {
  const numericPrice = parseFiniteNumber(price)
  const numericDecimals = parseFiniteNumber(decimals)

  if (numericPrice === undefined || numericDecimals === undefined) return undefined

  return numericPrice / 10 ** numericDecimals
}

function trackEstimated(field: string, value: number, estimatedFields: string[]) {
  estimatedFields.push(field)

  return value
}

function mergeMissingFields(
  providedMissingFields: string[],
  values: Record<string, number | undefined>,
) {
  const missingFields = [...providedMissingFields]

  Object.entries(values).forEach(([field, value]) => {
    if (value === undefined && !missingFields.includes(field)) {
      missingFields.push(field)
    }
  })

  return [...new Set(missingFields)]
}

function deriveAvailableFields(missingFields: string[]) {
  return ['assetValueUsd', 'debtValueUsd', 'riskRatio', 'liquidationRiskRatio', 'targetRiskRatio', 'borrowAprDecimal'].filter(
    (field) => !missingFields.includes(field),
  )
}
