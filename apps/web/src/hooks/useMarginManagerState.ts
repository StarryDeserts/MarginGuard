import { useQuery } from '@tanstack/react-query'
import type { NormalizedMarginState } from '../types/margin'
import { mockMarginState } from '../lib/demo/mockMarginState'
import {
  getMockManagerReadStatus,
  readMarginManagerState,
  shouldReadAfterObjectVerification,
  verifyMarginManagerObject,
} from '../lib/deepbook/managerAdapter'
import type { ManagerObjectVerificationResult, ManagerReadResult } from '../lib/deepbook/managerAdapter'
import { normalizeManagerState } from '../lib/deepbook/normalizeManagerState'
import { getDeepBookPoolConfig } from '../lib/deepbook/poolKeys'
import {
  buildManagerReadDiagnostic,
  getDashboardSourceState,
  getMarginManagerDisabledReasonCode,
  getMarginManagerQueryDisabledReason,
  getMarginManagerQueryKey,
  mapManagerReadErrorToSourceState,
  type ManagerReadDiagnostic,
  type ManagerReadErrorCategory,
} from '../lib/deepbook/readState'
import { useActiveManager } from './useActiveManager'
import { useCurrentNetwork } from './useCurrentNetwork'
import { useDeepBookClient } from './useDeepBookClient'

type ManagerStateQueryResult =
  | {
      status: 'success'
      state: NormalizedMarginState
      readResult: Extract<ManagerReadResult, { status: 'success' }>
      objectVerification: ManagerObjectVerificationResult
      normalizeStatus: 'full' | 'partial'
    }
  | {
      status: 'read-error'
      message: string
      category: ManagerReadErrorCategory
      readResult?: ManagerReadResult
      objectVerification: ManagerObjectVerificationResult
      normalizeStatus: 'not-run' | 'failed'
    }

export function useMarginManagerState({ mockFallback = true }: { mockFallback?: boolean } = {}) {
  const { activeManager } = useActiveManager()
  const networkState = useCurrentNetwork()
  const { selectedNetwork } = networkState
  const deepBookClient = useDeepBookClient()
  const poolConfig = getDeepBookPoolConfig(selectedNetwork, activeManager?.poolKey)
  const walletAddressPresent = deepBookClient.status === 'ready'
  const walletAddress = deepBookClient.status === 'ready' ? deepBookClient.walletAddress : undefined
  const disabledReason = getMarginManagerQueryDisabledReason({
    manager: activeManager,
    poolConfig,
    walletAddress: walletAddressPresent ? 'connected' : undefined,
  })
  const disabledReasonCode = getMarginManagerDisabledReasonCode({
    manager: activeManager,
    poolConfig,
    walletAddressPresent,
  })
  const queryEnabled = !mockFallback && !disabledReason && deepBookClient.status === 'ready'
  const query = useQuery({
    queryKey: getMarginManagerQueryKey(selectedNetwork, activeManager, activeManager?.poolKey ?? 'SUI_USDC', walletAddress),
    enabled: queryEnabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<ManagerStateQueryResult> => {
      if (!activeManager || deepBookClient.status !== 'ready') {
        return {
          status: 'read-error',
          message: 'DeepBook read is disabled.',
          category: 'unknown',
          objectVerification: { status: 'not-run' },
          normalizeStatus: 'not-run',
        }
      }

      const objectVerification = await verifyMarginManagerObject({
        client: deepBookClient.client,
        managerObjectId: activeManager.objectId,
        expectedBaseCoinType: poolConfig.status === 'configured' ? poolConfig.baseCoinType : undefined,
        expectedQuoteCoinType: poolConfig.status === 'configured' ? poolConfig.quoteCoinType : undefined,
      })

      if (objectVerification.lookupStatus === 'not-found' || objectVerification.status === 'not-found') {
        return {
          status: 'read-error',
          message: 'Read error: manager object not found.',
          category: 'object-not-found',
          objectVerification,
          normalizeStatus: 'not-run',
        }
      }

      if (
        objectVerification.typeVerificationStatus === 'not-margin-manager' ||
        objectVerification.typeVerificationStatus === 'pair-mismatch'
      ) {
        return {
          status: 'read-error',
          message: objectVerification.message ?? 'Read error: object is not a SUI/USDC Margin Manager.',
          category: 'object-type-mismatch',
          objectVerification,
          normalizeStatus: 'not-run',
        }
      }

      if (objectVerification.lookupStatus === 'error' || objectVerification.status === 'error') {
        return {
          status: 'read-error',
          message: objectVerification.message ?? 'Object verification failed before DeepBook read.',
          category: 'rpc',
          objectVerification,
          normalizeStatus: 'not-run',
        }
      }

      if (!shouldReadAfterObjectVerification(objectVerification)) {
        return {
          status: 'read-error',
          message: objectVerification.message ?? 'Object verification failed before DeepBook read.',
          category: 'object-type-mismatch',
          objectVerification,
          normalizeStatus: 'not-run',
        }
      }

      const readResult = await readMarginManagerState({
        reader: deepBookClient.reader,
        managerKey: deepBookClient.managerKey,
        sdkDecimalsArgument: deepBookClient.sdkDecimalsArgument,
        poolConfig,
      })

      if (readResult.status !== 'success') {
        return {
          status: 'read-error',
          message: readResult.message,
          category: readResult.status === 'not-configured' ? 'pool-config' : 'sdk-read',
          readResult,
          objectVerification,
          normalizeStatus: 'not-run',
        }
      }

      const normalized = normalizeManagerState({
        raw: readResult.raw,
        manager: activeManager,
        poolConfig,
        walletAddress: deepBookClient.walletAddress,
        availableFields: readResult.availableFields,
        missingFields: readResult.missingFields,
      })

      if (normalized.status !== 'success') {
        return {
          status: 'read-error',
          message: normalized.message,
          category: 'normalization',
          readResult,
          objectVerification,
          normalizeStatus: 'failed',
        }
      }

      return {
        status: 'success',
        state: normalized.state,
        readResult,
        objectVerification,
        normalizeStatus: normalized.state.isPartial ? 'partial' : 'full',
      }
    },
  })

  if (mockFallback) {
    const diagnostic = buildManagerReadDiagnostic({
      selectedNetwork,
      manager: activeManager,
      poolConfig,
      walletConnected: walletAddressPresent,
      walletAddressPresent,
      walletNetworkVerified: networkState.walletNetworkVerified,
      queryEnabled: false,
      queryStatus: 'idle',
      sourceState: 'mock-fallback',
    })

    return {
      status: 'mock' as const,
      state: mockMarginState,
      sourceState: getDashboardSourceState({ kind: 'mock-fallback' }),
      diagnostic,
      refetch: query.refetch,
      legacy: getMockManagerReadStatus(mockMarginState),
    }
  }

  const queryResult = query.data
  const baseDiagnosticInput = {
    selectedNetwork,
    manager: activeManager,
    poolConfig,
    walletConnected: walletAddressPresent,
    walletAddressPresent,
    walletNetworkVerified: networkState.walletNetworkVerified,
    queryEnabled,
    disabledReason: disabledReasonCode,
    queryStatus: queryEnabled ? query.status : ('idle' as const),
    configuredManagerKey: deepBookClient.status === 'ready' ? deepBookClient.managerKey : undefined,
    sdkMethodArgument: deepBookClient.status === 'ready' ? deepBookClient.managerKey : undefined,
    sdkDecimalsArgument: deepBookClient.status === 'ready' ? deepBookClient.sdkDecimalsArgument : undefined,
  }

  if (!activeManager) {
    return {
      status: 'no-manager' as const,
      state: undefined as NormalizedMarginState | undefined,
      message: 'No manager imported',
      sourceState: getDashboardSourceState({ kind: 'no-manager' }),
      diagnostic: buildManagerReadDiagnostic(baseDiagnosticInput),
      refetch: query.refetch,
    }
  }

  if (poolConfig.status !== 'configured') {
    return {
      status: 'not-configured' as const,
      state: undefined as NormalizedMarginState | undefined,
      message: poolConfig.message,
      sourceState: getDashboardSourceState({ kind: 'not-configured', message: poolConfig.message }),
      diagnostic: buildManagerReadDiagnostic(baseDiagnosticInput),
      refetch: query.refetch,
    }
  }

  if (deepBookClient.status !== 'ready') {
    const message = 'reason' in deepBookClient ? deepBookClient.reason : deepBookClient.message
    const sourceKind = disabledReasonCode === 'no-wallet-address' ? 'wallet-required' : 'not-configured'

    return {
      status: deepBookClient.status === 'error' ? ('error' as const) : ('disabled' as const),
      state: undefined as NormalizedMarginState | undefined,
      message,
      sourceState: getDashboardSourceState({ kind: deepBookClient.status === 'error' ? 'read-error' : sourceKind, message }),
      diagnostic: buildManagerReadDiagnostic(baseDiagnosticInput),
      refetch: query.refetch,
    }
  }

  if (query.isError) {
    const message = query.error instanceof Error ? query.error.message : 'Could not read this manager. Check network and object ID.'

    return {
      status: 'error' as const,
      state: undefined as NormalizedMarginState | undefined,
      message,
      sourceState: getDashboardSourceState({ kind: 'read-error', message }),
      diagnostic: buildManagerReadDiagnostic({
        ...baseDiagnosticInput,
        queryStatus: 'error',
        sourceState: 'read-error',
        sdkMethodName: 'getMarginManagerState',
        sdkReadStatus: 'error',
        configuredManagerKey: deepBookClient.status === 'ready' ? deepBookClient.managerKey : undefined,
        sdkMethodArgument: deepBookClient.status === 'ready' ? deepBookClient.managerKey : undefined,
        sdkDecimalsArgument: deepBookClient.status === 'ready' ? deepBookClient.sdkDecimalsArgument : undefined,
        errorCategory: 'unknown',
        errorMessage: message,
      }),
      refetch: query.refetch,
    }
  }

  if (query.isPending || !queryResult) {
    return {
      status: 'loading' as const,
      state: undefined as NormalizedMarginState | undefined,
      message: 'Loading read-only manager state.',
      sourceState: getDashboardSourceState({ kind: 'loading' }),
      diagnostic: buildManagerReadDiagnostic({
        ...baseDiagnosticInput,
        sdkMethodName: 'getMarginManagerState',
        ...getObjectVerificationDiagnosticFields(queryResult?.objectVerification),
      }),
      refetch: query.refetch,
    }
  }

  if (queryResult.status === 'read-error') {
    const errorMapping = mapManagerReadErrorToSourceState({
      status: 'error',
      category: queryResult.category,
      message: queryResult.message,
    })
    const sdkMethodCalled = Boolean(queryResult.readResult) || queryResult.category === 'normalization'

    return {
      status: 'error' as const,
      state: undefined as NormalizedMarginState | undefined,
      message: errorMapping.errorMessage,
      sourceState: getDashboardSourceState({ kind: errorMapping.sourceState, message: errorMapping.errorMessage }),
      diagnostic: buildManagerReadDiagnostic({
        ...baseDiagnosticInput,
        sourceState: errorMapping.sourceState,
        sdkMethodCalled,
        sdkMethodName: 'getMarginManagerState',
        sdkReadStatus: sdkMethodCalled ? 'error' : 'not-called',
        ...getObjectVerificationDiagnosticFields(queryResult.objectVerification),
        normalizeStatus: queryResult.normalizeStatus,
        errorCategory: errorMapping.errorCategory,
        errorMessage: errorMapping.errorMessage,
      }),
      refetch: query.refetch,
    }
  }

  return {
    status: 'success' as const,
    state: queryResult.state,
    sourceState: getDashboardSourceState({
      kind: queryResult.state.isPartial ? 'partial-deepbook' : 'full-deepbook',
      isPartial: queryResult.state.isPartial,
    }),
    diagnostic: buildManagerReadDiagnostic({
      ...baseDiagnosticInput,
      sourceState: queryResult.state.isPartial ? 'partial-deepbook' : 'full-deepbook',
      sdkMethodCalled: true,
      sdkMethodName: 'getMarginManagerState',
      sdkReadStatus: 'success',
      ...getObjectVerificationDiagnosticFields(queryResult.objectVerification),
      normalizeStatus: queryResult.normalizeStatus,
      missingFields: queryResult.state.missingFields,
    }),
    refetch: query.refetch,
  }
}

export type MarginManagerStateResult = ReturnType<typeof useMarginManagerState>
export type { ManagerReadDiagnostic }

function getObjectVerificationDiagnosticFields(objectVerification?: ManagerObjectVerificationResult) {
  return {
    objectVerificationStatus: objectVerification?.status,
    objectLookupStatus: objectVerification?.lookupStatus,
    objectTypeVerificationStatus: objectVerification?.typeVerificationStatus,
    actualObjectType: objectVerification?.actualObjectType,
    expectedBaseCoinType: objectVerification?.expectedBaseCoinType,
    expectedQuoteCoinType: objectVerification?.expectedQuoteCoinType,
    objectTypeCheckReason: objectVerification?.objectTypeCheckReason,
  }
}
