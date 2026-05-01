import type { NormalizedMarginState } from '../../types/margin'
import { redactObjectIds } from '../utils/address'
import type { DeepBookReadCapability } from './capabilities'
import type { DeepBookPoolConfig, ConfiguredDeepBookPoolConfig } from './poolKeys'
import { verifyMarginManagerType, type MarginManagerTypeVerificationStatus } from './typeVerification'

export type DeepBookRawManagerState = {
  managerId?: string
  deepbookPoolId?: string
  riskRatio?: number
  baseAsset?: string
  quoteAsset?: string
  baseDebt?: string
  quoteDebt?: string
  basePythPrice?: string
  basePythDecimals?: number
  quotePythPrice?: string
  quotePythDecimals?: number
  currentPrice?: bigint
}

export type DeepBookRawManagerRead = {
  state?: DeepBookRawManagerState
  liquidationRiskRatio?: number
  targetRiskRatio?: number
  borrowAprDecimal?: number
  midPrice?: number
}

export type DeepBookMarginReader = {
  getMarginManagerState(managerKey: string, decimals?: number): Promise<DeepBookRawManagerState>
  getLiquidationRiskRatio(poolKey: string): Promise<number>
  getTargetLiquidationRiskRatio(poolKey: string): Promise<number>
  getMarginPoolInterestRate(coinKey: string): Promise<number>
  midPrice(poolKey: string): Promise<number>
}

export type ManagerObjectVerificationStatus = 'not-run' | 'exists' | 'not-found' | 'type-mismatch' | 'error'
export type ManagerObjectLookupStatus = 'not-run' | 'exists' | 'not-found' | 'error'
export type ManagerObjectTypeVerificationStatus = 'not-run' | MarginManagerTypeVerificationStatus | 'unknown'

export type ManagerObjectVerificationResult = {
  status: ManagerObjectVerificationStatus
  lookupStatus?: ManagerObjectLookupStatus
  typeVerificationStatus?: ManagerObjectTypeVerificationStatus
  type?: string
  actualObjectType?: string
  expectedBaseCoinType?: string
  expectedQuoteCoinType?: string
  objectTypeCheckReason?: string
  message?: string
}

type ManagerObjectReader = {
  core: {
    getObject(input: { objectId: string; include?: { json?: boolean } }): Promise<{ object: { type?: string } }>
  }
}

export type ManagerReadResult =
  | {
      status: 'success'
      capability: Exclude<DeepBookReadCapability, 'disabled'>
      raw: DeepBookRawManagerRead
      source: 'deepbook'
      availableFields: string[]
      missingFields: string[]
    }
  | { status: 'not-configured'; message: string }
  | { status: 'not-implemented'; message: string }
  | { status: 'error'; message: string; cause?: unknown }

export type ManagerReadStatus =
  | { status: 'disabled'; reason: string }
  | { status: 'mock'; state: NormalizedMarginState }
  | { status: 'error'; message: string }

export function getDisabledManagerReadStatus(): ManagerReadStatus {
  return {
    status: 'disabled',
    reason: 'DeepBook read integration is scheduled for Round 4',
  }
}

export function getMockManagerReadStatus(state: NormalizedMarginState): ManagerReadStatus {
  return { status: 'mock', state }
}

export function shouldReadAfterObjectVerification(result: ManagerObjectVerificationResult) {
  return (
    result.lookupStatus === 'exists' &&
    (result.typeVerificationStatus === 'match' || result.typeVerificationStatus === 'margin-manager-pair-unverified')
  )
}

export async function readMarginManagerState(input: {
  reader?: DeepBookMarginReader
  managerKey?: string
  sdkDecimalsArgument?: number
  poolConfig: DeepBookPoolConfig
}): Promise<ManagerReadResult> {
  if (input.poolConfig.status !== 'configured') {
    return { status: 'not-configured', message: input.poolConfig.message }
  }

  if (!input.reader || !input.managerKey) {
    return {
      status: 'not-implemented',
      message: 'DeepBook read adapter is disabled until a configured client and manager key are available.',
    }
  }

  return readConfiguredMarginManager(input.reader, input.managerKey, input.poolConfig, input.sdkDecimalsArgument)
}

export async function verifyMarginManagerObject(input: {
  client?: ManagerObjectReader
  managerObjectId?: string
  expectedBaseCoinType?: string
  expectedQuoteCoinType?: string
}): Promise<ManagerObjectVerificationResult> {
  if (!input.client || !input.managerObjectId) {
    return {
      status: 'not-run',
      lookupStatus: 'not-run',
      typeVerificationStatus: 'not-run',
      message: 'Object verification did not run.',
    }
  }

  try {
    const result = await input.client.core.getObject({
      objectId: input.managerObjectId,
      include: { json: true },
    })
    const type = result.object.type

    if (!type) {
      return {
        status: 'error',
        lookupStatus: 'exists',
        typeVerificationStatus: 'unknown',
        message: 'Object exists, but object type was unavailable.',
      }
    }

    if (!input.expectedBaseCoinType || !input.expectedQuoteCoinType) {
      return {
        status: 'error',
        lookupStatus: 'exists',
        typeVerificationStatus: 'unknown',
        type,
        actualObjectType: type,
        message: 'Object exists, but expected coin types were unavailable.',
      }
    }

    const typeVerification = verifyMarginManagerType({
      actualType: type,
      expectedBaseCoinType: input.expectedBaseCoinType,
      expectedQuoteCoinType: input.expectedQuoteCoinType,
    })
    const typeMatches =
      typeVerification.status === 'match' || typeVerification.status === 'margin-manager-pair-unverified'

    return {
      status: typeMatches ? 'exists' : 'type-mismatch',
      lookupStatus: 'exists',
      typeVerificationStatus: typeVerification.status,
      type,
      actualObjectType: type,
      expectedBaseCoinType: typeVerification.expectedBaseCoinType,
      expectedQuoteCoinType: typeVerification.expectedQuoteCoinType,
      objectTypeCheckReason: typeVerification.reason,
      message: typeMatches ? typeVerification.reason : 'Object is not a SUI/USDC Margin Manager.',
    }
  } catch (cause) {
    const message = sanitizeError(cause)
    const status = /not found|does not exist|ObjectNotFound/i.test(message) ? 'not-found' : 'error'

    return {
      status,
      lookupStatus: status === 'not-found' ? 'not-found' : 'error',
      typeVerificationStatus: 'not-run',
      message,
    }
  }
}

async function readConfiguredMarginManager(
  reader: DeepBookMarginReader,
  managerKey: string,
  poolConfig: ConfiguredDeepBookPoolConfig,
  sdkDecimalsArgument?: number,
): Promise<ManagerReadResult> {
  try {
    const state =
      sdkDecimalsArgument === undefined
        ? await reader.getMarginManagerState(managerKey)
        : await reader.getMarginManagerState(managerKey, sdkDecimalsArgument)
    const [liquidationRiskRatio, targetRiskRatio, midPrice] = await Promise.all([
      readOptionalNumber(() => reader.getLiquidationRiskRatio(poolConfig.sdkPoolKey)),
      readOptionalNumber(() => reader.getTargetLiquidationRiskRatio(poolConfig.sdkPoolKey)),
      readOptionalNumber(() => reader.midPrice(poolConfig.sdkPoolKey)),
    ])
    const debtCoinKey = getDebtCoinKey(state, poolConfig)
    const borrowAprDecimal = debtCoinKey ? await readOptionalNumber(() => reader.getMarginPoolInterestRate(debtCoinKey)) : undefined
    const availableFields = collectAvailableFields({ state, liquidationRiskRatio, targetRiskRatio, borrowAprDecimal, midPrice })
    const missingFields = collectMissingFields(availableFields)

    return {
      status: 'success',
      capability: missingFields.length > 0 ? 'partial' : 'full',
      raw: { state, liquidationRiskRatio, targetRiskRatio, borrowAprDecimal, midPrice },
      source: 'deepbook',
      availableFields,
      missingFields,
    }
  } catch (cause) {
    return {
      status: 'error',
      message: sanitizeError(cause) || 'Could not read this manager. Check network and object ID.',
      cause,
    }
  }
}

async function readOptionalNumber(read: () => Promise<number>) {
  try {
    return await read()
  } catch {
    return undefined
  }
}

function getDebtCoinKey(state: DeepBookRawManagerState, poolConfig: ConfiguredDeepBookPoolConfig) {
  if (Number(state.quoteDebt ?? 0) > 0) return poolConfig.quoteCoinKey
  if (Number(state.baseDebt ?? 0) > 0) return poolConfig.baseCoinKey

  return undefined
}

function collectAvailableFields(raw: DeepBookRawManagerRead) {
  const fields: string[] = []
  const state = raw.state

  if (state?.riskRatio !== undefined) fields.push('riskRatio')
  if (state?.baseAsset !== undefined || state?.quoteAsset !== undefined) fields.push('assetBalances')
  if (state?.baseDebt !== undefined || state?.quoteDebt !== undefined) fields.push('debtBalances')
  if (state?.basePythPrice !== undefined || raw.midPrice !== undefined) fields.push('protocolPrice')
  if (raw.liquidationRiskRatio !== undefined) fields.push('liquidationRiskRatio')
  if (raw.targetRiskRatio !== undefined) fields.push('targetRiskRatio')
  if (raw.borrowAprDecimal !== undefined) fields.push('borrowAprDecimal')

  return fields
}

function collectMissingFields(availableFields: string[]) {
  return ['riskRatio', 'assetBalances', 'debtBalances', 'protocolPrice', 'liquidationRiskRatio', 'targetRiskRatio'].filter(
    (field) => !availableFields.includes(field),
  )
}

function sanitizeError(cause: unknown) {
  if (cause instanceof Error) return redactObjectIds(cause.message)
  if (typeof cause === 'string') return redactObjectIds(cause)

  return 'Unknown DeepBook read error.'
}
