import type { AppNetwork, MarginManagerRef, NormalizedMarginState, SupportedPoolKey } from '../../types/margin'
import type { RescueActionability } from '../../types/rescue'
import { getRescueActionability } from '../risk/rescuePlans'
import { redactObjectIds, shortAddress } from '../utils/address'
import type { ManagerObjectLookupStatus, ManagerObjectTypeVerificationStatus, ManagerObjectVerificationStatus } from './managerAdapter'
import type { DeepBookPoolConfig } from './poolKeys'
import { normalizePoolKey } from './poolKeys'

export type ManagerReadSourceState =
  | 'no-manager'
  | 'wallet-required'
  | 'not-configured'
  | 'loading'
  | 'full-deepbook'
  | 'partial-deepbook'
  | 'read-error'
  | 'unavailable'
  | 'mock-fallback'

export type DashboardSourceKind =
  | ManagerReadSourceState
  | 'mainnet-configured'
  | 'success'
  | 'error'
  | 'mock'

export type DashboardSourceState = {
  kind: DashboardSourceKind
  label:
    | 'DeepBook state'
    | 'Partial DeepBook state'
    | 'Mock fallback'
    | 'Simulated'
    | 'Unavailable'
    | 'Wallet required'
    | 'No manager imported'
    | 'Not configured'
    | 'Loading'
    | 'Read error'
  message?: string
  tone: 'healthy' | 'warning' | 'info' | 'neutral'
}

export type ManagerReadDisabledReason =
  | 'no-manager'
  | 'no-wallet-address'
  | 'pool-not-configured'
  | 'unsupported-network'
  | 'missing-pool-key'
  | 'unknown'

export type ManagerReadErrorCategory =
  | 'wallet-required'
  | 'pool-config'
  | 'object-not-found'
  | 'object-type-mismatch'
  | 'sdk-read'
  | 'normalization'
  | 'rpc'
  | 'unknown'

export type ManagerReadDiagnostic = {
  selectedManagerPresent: boolean
  managerObjectIdShort?: string
  selectedNetwork?: string
  managerNetwork?: string
  selectedPoolKey?: string
  normalizedPoolKey?: string
  poolConfigStatus: 'configured' | 'not-configured' | 'unknown'
  walletConnected: boolean
  walletAddressPresent: boolean
  walletNetworkVerified: boolean
  queryEnabled: boolean
  disabledReason?: ManagerReadDisabledReason
  queryStatus?: 'idle' | 'pending' | 'success' | 'error'
  sdkMethodCalled?: boolean
  sdkMethodName?: string
  configuredManagerKey?: string
  sdkMethodArgument?: string
  sdkDecimalsArgument?: number
  sdkReadStatus?: 'not-called' | 'success' | 'error'
  objectVerificationStatus?: ManagerObjectVerificationStatus
  objectLookupStatus?: ManagerObjectLookupStatus
  objectTypeVerificationStatus?: ManagerObjectTypeVerificationStatus
  actualObjectType?: string
  expectedBaseCoinType?: string
  expectedQuoteCoinType?: string
  objectTypeCheckReason?: string
  normalizeStatus?: 'not-run' | 'full' | 'partial' | 'failed'
  missingFields?: string[]
  sourceState: ManagerReadSourceState
  errorCategory?: ManagerReadErrorCategory
  errorMessage?: string
}

export type ManagerReadErrorMapping = {
  sourceState: ManagerReadSourceState
  errorCategory: ManagerReadErrorCategory
  errorMessage: string
  sdkReadStatus?: 'not-called' | 'error'
  objectVerificationStatus?: ManagerObjectVerificationStatus
  normalizeStatus?: 'failed'
}

export type RecommendedActionAvailability =
  | {
      canRecommend: true
      actionability: 'action-needed'
      title: 'Recommended Rescue Action'
      copy: string
      secondaryNote: string
      reviewDisabled: false
    }
  | {
      canRecommend: false
      actionability: Exclude<RescueActionability, 'action-needed'>
      title: 'No rescue needed' | 'No active debt' | 'Recommendation unavailable'
      copy:
        | 'Current risk ratio is already above the target rescue ratio.'
        | 'This manager has no borrowed debt, so no pre-liquidation rescue action is required.'
        | 'Read manager state before computing a rescue action.'
      secondaryNote: string
      reviewDisabled: true
    }

export function getMarginManagerQueryKey(
  network: AppNetwork,
  manager: MarginManagerRef | undefined,
  poolKey: SupportedPoolKey,
  walletAddress?: string,
) {
  return ['margin-manager-state', network, manager?.objectId ?? 'none', poolKey, walletAddress ?? 'no-wallet'] as const
}

export function getMarginManagerQueryDisabledReason(input: {
  manager?: MarginManagerRef
  poolConfig: DeepBookPoolConfig
  walletAddress?: string
}) {
  if (!input.manager) return 'No manager imported'
  if (input.poolConfig.status !== 'configured') return input.poolConfig.message
  if (!input.walletAddress) return 'Connect wallet to read DeepBook state. No signing.'

  return undefined
}

export function getMarginManagerDisabledReasonCode(input: {
  manager?: MarginManagerRef
  poolConfig: DeepBookPoolConfig
  walletAddressPresent: boolean
}): ManagerReadDisabledReason | undefined {
  if (!input.manager) return 'no-manager'
  if (!input.manager.poolKey) return 'missing-pool-key'
  if (input.poolConfig.status !== 'configured') {
    return input.poolConfig.network === 'testnet' ? 'unsupported-network' : 'pool-not-configured'
  }
  if (!input.walletAddressPresent) return 'no-wallet-address'

  return undefined
}

export function buildManagerReadDiagnostic(input: {
  selectedNetwork: AppNetwork
  manager?: MarginManagerRef
  poolConfig: DeepBookPoolConfig
  walletConnected: boolean
  walletAddressPresent: boolean
  walletNetworkVerified: boolean
  queryEnabled: boolean
  queryStatus?: 'idle' | 'pending' | 'success' | 'error'
  disabledReason?: ManagerReadDisabledReason
  sdkMethodCalled?: boolean
  sdkMethodName?: string
  configuredManagerKey?: string
  sdkMethodArgument?: string
  sdkDecimalsArgument?: number
  sdkReadStatus?: 'not-called' | 'success' | 'error'
  objectVerificationStatus?: ManagerObjectVerificationStatus
  objectLookupStatus?: ManagerObjectLookupStatus
  objectTypeVerificationStatus?: ManagerObjectTypeVerificationStatus
  actualObjectType?: string
  expectedBaseCoinType?: string
  expectedQuoteCoinType?: string
  objectTypeCheckReason?: string
  normalizeStatus?: 'not-run' | 'full' | 'partial' | 'failed'
  missingFields?: string[]
  sourceState?: ManagerReadSourceState
  errorCategory?: ManagerReadErrorCategory
  errorMessage?: string
}): ManagerReadDiagnostic {
  const disabledReason =
    input.disabledReason ??
    getMarginManagerDisabledReasonCode({
      manager: input.manager,
      poolConfig: input.poolConfig,
      walletAddressPresent: input.walletAddressPresent,
    })
  const sourceState = input.sourceState ?? sourceStateFromDiagnostic({
    queryEnabled: input.queryEnabled,
    disabledReason,
    queryStatus: input.queryStatus,
    sdkReadStatus: input.sdkReadStatus,
    normalizeStatus: input.normalizeStatus,
  })
  const normalizedPoolKey = normalizePoolKey(input.manager?.poolKey)

  return {
    selectedManagerPresent: Boolean(input.manager),
    managerObjectIdShort: input.manager ? shortAddress(input.manager.objectId) : undefined,
    selectedNetwork: input.selectedNetwork,
    managerNetwork: input.manager?.network,
    selectedPoolKey: input.manager?.poolKey,
    normalizedPoolKey: normalizedPoolKey ?? undefined,
    poolConfigStatus: input.poolConfig.status,
    walletConnected: input.walletConnected,
    walletAddressPresent: input.walletAddressPresent,
    walletNetworkVerified: input.walletNetworkVerified,
    queryEnabled: input.queryEnabled,
    disabledReason,
    queryStatus: input.queryStatus ?? 'idle',
    sdkMethodCalled: input.sdkMethodCalled ?? false,
    sdkMethodName: input.sdkMethodName,
    configuredManagerKey: input.configuredManagerKey,
    sdkMethodArgument: input.sdkMethodArgument,
    sdkDecimalsArgument: input.sdkDecimalsArgument,
    sdkReadStatus: input.sdkReadStatus ?? 'not-called',
    objectVerificationStatus: input.objectVerificationStatus ?? 'not-run',
    objectLookupStatus: input.objectLookupStatus ?? 'not-run',
    objectTypeVerificationStatus: input.objectTypeVerificationStatus ?? 'not-run',
    actualObjectType: input.actualObjectType,
    expectedBaseCoinType: input.expectedBaseCoinType,
    expectedQuoteCoinType: input.expectedQuoteCoinType,
    objectTypeCheckReason: input.objectTypeCheckReason,
    normalizeStatus: input.normalizeStatus ?? 'not-run',
    missingFields: input.missingFields,
    sourceState,
    errorCategory: input.errorCategory,
    errorMessage: input.errorMessage ? redactObjectIds(input.errorMessage) : undefined,
  }
}

export function mapManagerReadErrorToSourceState(input: {
  status: 'error'
  category: ManagerReadErrorCategory
  message?: string
}): ManagerReadErrorMapping {
  if (input.category === 'object-not-found') {
    return {
      sourceState: 'read-error',
      errorCategory: 'object-not-found',
      errorMessage: 'Read error: manager object not found.',
      sdkReadStatus: 'not-called',
      objectVerificationStatus: 'not-found',
    }
  }

  if (input.category === 'object-type-mismatch') {
    return {
      sourceState: 'read-error',
      errorCategory: 'object-type-mismatch',
      errorMessage: 'Read error: object is not a SUI/USDC Margin Manager.',
      sdkReadStatus: 'not-called',
      objectVerificationStatus: 'type-mismatch',
    }
  }

  if (input.category === 'normalization') {
    return {
      sourceState: 'read-error',
      errorCategory: 'normalization',
      errorMessage: redactObjectIds(input.message ?? 'Read error: manager state normalization failed.'),
      sdkReadStatus: 'error',
      normalizeStatus: 'failed',
    }
  }

  return {
    sourceState: 'read-error',
    errorCategory: input.category,
    errorMessage: redactObjectIds(input.message ?? 'Could not read this manager. Check network and object ID.'),
    sdkReadStatus: input.category === 'wallet-required' || input.category === 'pool-config' ? 'not-called' : 'error',
  }
}

export function getDashboardSourceState(input: {
  kind: DashboardSourceKind
  isPartial?: boolean
  message?: string
}): DashboardSourceState {
  if (input.kind === 'success' || input.kind === 'full-deepbook' || input.kind === 'partial-deepbook') {
    const isPartial = input.kind === 'partial-deepbook' || input.isPartial

    return {
      kind: isPartial ? 'partial-deepbook' : 'full-deepbook',
      label: isPartial ? 'Partial DeepBook state' : 'DeepBook state',
      message: isPartial
        ? 'Some SDK fields are unavailable and are not replaced with mock values.'
        : 'Read-only DeepBook state loaded. No backend or indexer required.',
      tone: isPartial ? 'warning' : 'healthy',
    }
  }

  if (input.kind === 'mock' || input.kind === 'mock-fallback') {
    return {
      kind: 'mock-fallback',
      label: 'Mock fallback',
      message: 'Explicit mock/demo fallback.',
      tone: 'info',
    }
  }

  if (input.kind === 'loading') {
    return {
      kind: 'loading',
      label: 'Loading',
      message: 'Loading read-only manager state.',
      tone: 'info',
    }
  }

  if (input.kind === 'wallet-required') {
    return {
      kind: 'wallet-required',
      label: 'Wallet required',
      message: 'Connect Sui Wallet to read this manager.',
      tone: 'warning',
    }
  }

  if (input.kind === 'mainnet-configured') {
    return {
      kind: 'mainnet-configured',
      label: 'Unavailable',
      message: 'Verified SUI/USDC DeepBook Margin config is available for Mainnet in this build.',
      tone: 'info',
    }
  }

  if (input.kind === 'error' || input.kind === 'read-error') {
    return {
      kind: 'read-error',
      label: 'Read error',
      message: redactObjectIds(input.message ?? 'Could not read this manager. Check network and object ID.'),
      tone: 'warning',
    }
  }

  if (input.kind === 'not-configured') {
    return {
      kind: 'not-configured',
      label: 'Not configured',
      message: input.message ?? 'DeepBook pool config is not configured for this manager network.',
      tone: 'warning',
    }
  }

  if (input.kind === 'unavailable') {
    return {
      kind: 'unavailable',
      label: 'Unavailable',
      message: input.message ?? 'Read state is unavailable.',
      tone: 'neutral',
    }
  }

  return {
    kind: 'no-manager',
    label: 'No manager imported',
    message: 'No manager imported. Manager imported manually. No indexer required.',
    tone: 'neutral',
  }
}

export function getRecommendedActionAvailability(state?: NormalizedMarginState, sourceState?: ManagerReadSourceState): RecommendedActionAvailability {
  const actionability = getRescueActionability(state, sourceState)

  if (actionability === 'action-needed') {
    return {
      canRecommend: true,
      actionability,
      title: 'Recommended Rescue Action',
      copy: 'Computed from the current read-only manager state.',
      secondaryNote: 'Open Transaction Review first. Wallet prompt requires live gates, acknowledgement, and re-read-before-sign.',
      reviewDisabled: false,
    }
  }

  if (actionability === 'no-rescue-needed') {
    return {
      canRecommend: false,
      actionability,
      title: 'No rescue needed',
      copy: 'Current risk ratio is already above the target rescue ratio.',
      secondaryNote: 'No collateral action is required. Rescue Simulator can show labeled real baseline or simulated estimates.',
      reviewDisabled: true,
    }
  }

  if (actionability === 'zero-debt') {
    return {
      canRecommend: false,
      actionability,
      title: 'No active debt',
      copy: 'This manager has no borrowed debt, so no pre-liquidation rescue action is required.',
      secondaryNote: 'Open Rescue Simulator Preview uses labeled real baseline or simulated fallback values.',
      reviewDisabled: true,
    }
  }

  return {
    canRecommend: false,
    actionability,
    title: 'Recommendation unavailable',
    copy: 'Read manager state before computing a rescue action.',
    secondaryNote: 'Open Rescue Simulator Preview uses simulated fallback values until real manager data is available.',
    reviewDisabled: true,
  }
}

function sourceStateFromDiagnostic(input: {
  queryEnabled: boolean
  disabledReason?: ManagerReadDisabledReason
  queryStatus?: 'idle' | 'pending' | 'success' | 'error'
  sdkReadStatus?: 'not-called' | 'success' | 'error'
  normalizeStatus?: 'not-run' | 'full' | 'partial' | 'failed'
}): ManagerReadSourceState {
  if (!input.queryEnabled) {
    if (input.disabledReason === 'no-manager') return 'no-manager'
    if (input.disabledReason === 'no-wallet-address') return 'wallet-required'
    if (
      input.disabledReason === 'pool-not-configured' ||
      input.disabledReason === 'unsupported-network' ||
      input.disabledReason === 'missing-pool-key'
    ) {
      return 'not-configured'
    }

    return 'unavailable'
  }

  if (input.queryStatus === 'pending') return 'loading'
  if (input.queryStatus === 'error' || input.sdkReadStatus === 'error' || input.normalizeStatus === 'failed') {
    return 'read-error'
  }
  if (input.normalizeStatus === 'partial') return 'partial-deepbook'
  if (input.normalizeStatus === 'full') return 'full-deepbook'

  return 'unavailable'
}
