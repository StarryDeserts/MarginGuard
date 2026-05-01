import type { Transaction } from '@mysten/sui/transactions'
import type { ManagerReadSourceState } from '../deepbook/readState'
import { ACTIVE_MARGIN_MANAGER_KEY } from '../deepbook/addCollateralCapability'
import { getDeepBookPoolConfig } from '../deepbook/poolKeys'
import { shortAddress } from '../utils/address'
import type { AppNetwork, NormalizedMarginState } from '../../types/margin'
import type {
  AddCollateralExecutionState,
  AddCollateralReviewModel,
  AddCollateralTxDeps,
  BuildAddCollateralTxInput,
  BuildAddCollateralTxResult,
  DepositQuoteCommand,
} from '../../types/tx'
import { buildAddCollateralTx } from './buildAddCollateralTx'
import { createAddCollateralReviewModel, getAddCollateralReviewWarnings } from './addCollateralReview'

export type AddCollateralExecutionGate =
  | { status: 'enabled' }
  | { status: 'blocked'; message: string }

export type WalletExecutionResultLike =
  | {
      $kind?: 'Transaction'
      Transaction?: {
        digest?: unknown
      }
    }
  | {
      $kind?: 'FailedTransaction'
      FailedTransaction?: {
        digest?: unknown
        status?: {
          error?: unknown
        }
      }
    }

export type ExecutionManagerRead =
  | { status: 'success'; state: NormalizedMarginState; sourceState: ManagerReadSourceState }
  | { status: 'error'; message: string }

export type AddCollateralExecutionInput = {
  reviewModel?: AddCollateralReviewModel
  acknowledged: boolean
  liveEnabled: boolean
  walletConnected: boolean
  walletAddress?: string
  selectedNetwork: AppNetwork
  walletNetwork?: AppNetwork
  depositQuote?: (params: { managerKey: 'activeManager'; amount: bigint }) => DepositQuoteCommand
}

export type RunAddCollateralExecutionDeps = {
  rereadManagerState: () => Promise<ExecutionManagerRead>
  buildTx?: (input: BuildAddCollateralTxInput, deps: AddCollateralTxDeps) => BuildAddCollateralTxResult
  submitUnsignedTransaction: (transaction: Transaction) => Promise<WalletExecutionResultLike>
  waitForTransaction: (digest: string) => Promise<unknown>
  refreshManagerState: () => Promise<ExecutionManagerRead>
  onState?: (state: AddCollateralExecutionState) => void
}

export function isLiveAddCollateralEnabled(value: unknown = import.meta.env.VITE_ENABLE_LIVE_ADD_COLLATERAL) {
  return value === 'true'
}

export function withLiveAddCollateralExecution(
  reviewModel: AddCollateralReviewModel,
  liveEnabled = isLiveAddCollateralEnabled(),
): AddCollateralReviewModel {
  if (
    reviewModel.source !== 'deepbook' ||
    reviewModel.rescueActionability !== 'action-needed' ||
    !isPositiveAtomicAmount(reviewModel.amountAtomic)
  ) {
    return reviewModel
  }

  if (!liveEnabled) {
    return {
      ...reviewModel,
      isExecutable: false,
      buildStatus: 'not-built',
      unsignedTxAvailable: false,
      signingEnabled: false,
      blockedReason: 'Live Add Collateral is disabled. Set VITE_ENABLE_LIVE_ADD_COLLATERAL=true to enable wallet submission.',
    warnings: [
      'PTB preview only',
      'Builder verified; live wallet signing is disabled by feature gate.',
      'No transaction has been submitted.',
      'You are depositing USDC into this Margin Manager.',
      'Verify the manager ID before signing.',
      'Ownership is not inferred from the imported manager ID.',
      'MarginGuard does not custody funds and cannot reverse this transaction.',
      'Final transaction details will appear in your wallet.',
    ],
  }
  }

  return {
    ...reviewModel,
    isExecutable: true,
    buildStatus: 'not-built',
    unsignedTxAvailable: false,
    signingEnabled: true,
    blockedReason: undefined,
    warnings: getAddCollateralReviewWarnings({ signingEnabled: true }),
  }
}

export function getAddCollateralExecutionGate(input: {
  reviewModel?: AddCollateralReviewModel
  acknowledged: boolean
  liveEnabled: boolean
  walletConnected: boolean
  selectedNetwork: AppNetwork
  walletNetwork?: AppNetwork
}): AddCollateralExecutionGate {
  if (!input.reviewModel) {
    return { status: 'blocked', message: 'Read manager state before signing.' }
  }

  if (!input.liveEnabled) {
    return {
      status: 'blocked',
      message: 'Live Add Collateral is disabled. Set VITE_ENABLE_LIVE_ADD_COLLATERAL=true to enable wallet submission.',
    }
  }

  if (input.reviewModel.source !== 'deepbook') {
    return { status: 'blocked', message: 'Live Add Collateral is only available for real DeepBook state.' }
  }

  if (input.reviewModel.network !== 'mainnet' || input.selectedNetwork !== 'mainnet') {
    return { status: 'blocked', message: 'Add Collateral signing is configured for Mainnet only.' }
  }

  if (input.walletNetwork && input.walletNetwork !== input.selectedNetwork) {
    return { status: 'blocked', message: 'Wallet network must match the selected Mainnet manager.' }
  }

  if (!input.walletConnected) {
    return { status: 'blocked', message: 'Connect wallet before signing.' }
  }

  if (!input.acknowledged) {
    return { status: 'blocked', message: 'Acknowledge the wallet prompt warning before signing.' }
  }

  const actionabilityBlock = getActionabilityBlockMessage(input.reviewModel)
  if (actionabilityBlock) {
    return { status: 'blocked', message: actionabilityBlock }
  }

  if (!input.reviewModel.isExecutable || !input.reviewModel.signingEnabled) {
    return { status: 'blocked', message: input.reviewModel.blockedReason ?? 'Wallet signing is not enabled for this review.' }
  }

  if (!isPositiveAtomicAmount(input.reviewModel.amountAtomic)) {
    return { status: 'blocked', message: 'Add Collateral amount must be greater than zero.' }
  }

  return { status: 'enabled' }
}

export async function runAddCollateralExecution(
  input: AddCollateralExecutionInput,
  deps: RunAddCollateralExecutionDeps,
): Promise<AddCollateralExecutionState> {
  const emit = (state: AddCollateralExecutionState) => {
    deps.onState?.(state)
    return state
  }

  const initialGate = getAddCollateralExecutionGate(input)
  if (initialGate.status === 'blocked') {
    return emit({ status: 'blocked', message: initialGate.message })
  }

  if (!input.walletAddress) {
    return emit({ status: 'blocked', message: 'Connected wallet sender address is required.' })
  }

  if (!input.depositQuote) {
    return emit({ status: 'failed', message: 'Verified DeepBook depositQuote dependency is required before signing.' })
  }

  emit({ status: 'rereading' })
  const latestRead = await deps.rereadManagerState()

  if (latestRead.status !== 'success') {
    return emit({ status: 'blocked', message: 'Could not refresh manager state before signing.' })
  }

  if (!isRealDeepBookSource(latestRead.sourceState)) {
    return emit({ status: 'blocked', message: 'Could not refresh manager state before signing.' })
  }

  const latestStateConsistencyBlock = getLatestStateConsistencyBlock(input.reviewModel, latestRead.state, input.selectedNetwork)
  if (latestStateConsistencyBlock) {
    return emit({ status: 'blocked', message: latestStateConsistencyBlock })
  }

  const latestReview = withLiveAddCollateralExecution(
    createAddCollateralReviewModel({ state: latestRead.state, sourceState: latestRead.sourceState }),
    input.liveEnabled,
  )
  const refreshedGate = getAddCollateralExecutionGate({
    ...input,
    reviewModel: latestReview,
  })

  if (refreshedGate.status === 'blocked') {
    return emit({ status: 'blocked', message: refreshedGate.message })
  }

  const consistencyBlock = getReviewConsistencyBlock(input.reviewModel, latestReview, latestRead.state, input.selectedNetwork)
  if (consistencyBlock) {
    return emit({ status: 'blocked', message: consistencyBlock })
  }

  const amountAtomic = parseAtomicAmount(latestReview.amountAtomic)
  if (amountAtomic === undefined || amountAtomic <= 0n) {
    return emit({ status: 'blocked', message: 'Add Collateral amount must be greater than zero.' })
  }

  const poolConfig = getDeepBookPoolConfig(latestRead.state.manager.network, latestRead.state.manager.poolKey)
  if (poolConfig.status !== 'configured') {
    return emit({ status: 'blocked', message: poolConfig.message })
  }

  emit({ status: 'building' })
  const buildResult = (deps.buildTx ?? buildAddCollateralTx)(
    {
      network: latestRead.state.manager.network,
      senderAddress: input.walletAddress,
      managerObjectId: latestRead.state.manager.objectId,
      managerKey: ACTIVE_MARGIN_MANAGER_KEY,
      poolKey: latestRead.state.manager.poolKey,
      collateralCoinType: poolConfig.quoteCoinType,
      amountAtomic,
      amountDisplay: latestReview.amountDisplay,
      expectedBeforeRiskRatio: latestReview.beforeRiskRatio,
      expectedAfterRiskRatio: latestReview.afterRiskRatio,
      actionability: 'action-needed',
    },
    { depositQuote: input.depositQuote },
  )

  if (buildResult.status !== 'success') {
    return emit({ status: 'failed', message: getBuildFailureMessage(buildResult) })
  }

  const summary = buildResult.summary

  try {
    emit({ status: 'wallet-prompt' })
    const walletResult = await deps.submitUnsignedTransaction(buildResult.tx)
    const executionResult = extractWalletExecutionResult(walletResult)

    if (executionResult.status === 'failed') {
      return emit(executionResult)
    }

    emit({ status: 'submitted', digest: executionResult.digest, summary })
    emit({ status: 'confirming', digest: executionResult.digest, summary })
    await deps.waitForTransaction(executionResult.digest)
    emit({ status: 'confirmed', digest: executionResult.digest, summary })
    emit({ status: 'refreshing-manager', digest: executionResult.digest, summary })

    const refreshedRead = await deps.refreshManagerState()
    if (refreshedRead.status === 'success') {
      return emit({
        status: 'refreshed',
        digest: executionResult.digest,
        summary,
        beforeRiskRatio: latestRead.state.riskRatio,
        afterRiskRatio: refreshedRead.state.riskRatio,
      })
    }

    return emit({
      status: 'refresh-failed',
      digest: executionResult.digest,
      message: 'Transaction may be confirmed, but latest manager state could not be read.',
      summary,
      beforeRiskRatio: latestRead.state.riskRatio,
    })
  } catch (cause) {
    return emit(classifyWalletExecutionError(cause))
  }
}

export async function retryAddCollateralManagerRefresh(
  state: Extract<AddCollateralExecutionState, { status: 'refresh-failed' }>,
  deps: {
    refreshManagerState: () => Promise<ExecutionManagerRead>
    onState?: (state: AddCollateralExecutionState) => void
  },
): Promise<AddCollateralExecutionState> {
  const emit = (nextState: AddCollateralExecutionState) => {
    deps.onState?.(nextState)
    return nextState
  }

  emit({ status: 'refreshing-manager', digest: state.digest, summary: state.summary })
  const refreshedRead = await deps.refreshManagerState()

  if (refreshedRead.status === 'success') {
    return emit({
      status: 'refreshed',
      digest: state.digest,
      summary: state.summary,
      beforeRiskRatio: state.beforeRiskRatio,
      afterRiskRatio: refreshedRead.state.riskRatio,
    })
  }

  return emit({
    status: 'refresh-failed',
    digest: state.digest,
    summary: state.summary,
    beforeRiskRatio: state.beforeRiskRatio,
    message: 'Transaction may be confirmed, but latest manager state could not be read.',
  })
}

export function extractWalletExecutionResult(
  result: WalletExecutionResultLike,
): { status: 'submitted'; digest: string } | Extract<AddCollateralExecutionState, { status: 'failed' }> {
  if (isFailedWalletResult(result)) {
    const digest = typeof result.FailedTransaction.digest === 'string' ? result.FailedTransaction.digest : undefined
    const message = getFailedWalletMessage(result.FailedTransaction.status?.error)

    return { status: 'failed', message, digest }
  }

  if (isSuccessfulWalletResult(result)) {
    return { status: 'submitted', digest: result.Transaction.digest }
  }

  return { status: 'failed', message: 'Wallet did not return a transaction digest.' }
}

export function classifyWalletExecutionError(cause: unknown): Extract<AddCollateralExecutionState, { status: 'rejected' | 'failed' }> {
  const message = cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : 'Wallet transaction failed before submission.'

  if (/reject|rejected|denied|cancel|cancelled/i.test(message)) {
    return { status: 'rejected', message: 'Wallet request rejected by user.' }
  }

  return { status: 'failed', message }
}

export function isExecutionPending(state: AddCollateralExecutionState) {
  return (
    state.status === 'rereading' ||
    state.status === 'building' ||
    state.status === 'wallet-prompt' ||
    state.status === 'submitted' ||
    state.status === 'confirming' ||
    state.status === 'confirmed' ||
    state.status === 'refreshing-manager'
  )
}

function getActionabilityBlockMessage(reviewModel: AddCollateralReviewModel) {
  if (reviewModel.rescueActionability === 'no-rescue-needed') return 'No rescue needed while RR is above target.'
  if (reviewModel.rescueActionability === 'zero-debt') return 'No active borrowed debt. Add Collateral is not required.'
  if (reviewModel.rescueActionability === 'read-error') return 'Could not refresh manager state before signing.'
  if (reviewModel.rescueActionability === 'unavailable') return 'Read manager state before signing.'

  return undefined
}

function getReviewConsistencyBlock(
  originalReview: AddCollateralReviewModel | undefined,
  latestReview: AddCollateralReviewModel,
  latestState: NormalizedMarginState,
  selectedNetwork: AppNetwork,
) {
  if (!originalReview) return 'Read manager state before signing.'
  if (latestState.manager.network !== selectedNetwork) return 'Selected network changed before signing.'
  if (latestReview.network !== originalReview.network) return 'Manager network changed before signing.'
  if (latestReview.poolKey !== originalReview.poolKey) return 'Manager pool changed before signing.'
  if (shortAddress(latestState.manager.objectId) !== originalReview.managerShort) return 'Selected manager changed before signing.'

  return undefined
}

function getLatestStateConsistencyBlock(
  originalReview: AddCollateralReviewModel | undefined,
  latestState: NormalizedMarginState,
  selectedNetwork: AppNetwork,
) {
  if (!originalReview) return 'Read manager state before signing.'
  if (latestState.manager.network !== selectedNetwork) return 'Selected network changed before signing.'
  if (latestState.manager.network !== originalReview.network) return 'Manager network changed before signing.'
  if (latestState.manager.poolKey !== originalReview.poolKey) return 'Manager pool changed before signing.'
  if (shortAddress(latestState.manager.objectId) !== originalReview.managerShort) return 'Selected manager changed before signing.'

  return undefined
}

function getBuildFailureMessage(result: Exclude<BuildAddCollateralTxResult, { status: 'success' }>) {
  if ('reason' in result) return result.reason
  if ('message' in result) return result.message

  return 'Could not build Add Collateral transaction.'
}

function isRealDeepBookSource(sourceState: ManagerReadSourceState) {
  return sourceState === 'full-deepbook' || sourceState === 'partial-deepbook'
}

function isPositiveAtomicAmount(value: string) {
  const amount = parseAtomicAmount(value)

  return amount !== undefined && amount > 0n
}

function parseAtomicAmount(value: string) {
  try {
    return BigInt(value)
  } catch {
    return undefined
  }
}

function isSuccessfulWalletResult(result: WalletExecutionResultLike): result is { Transaction: { digest: string } } {
  return (
    typeof result === 'object' &&
    result !== null &&
    'Transaction' in result &&
    typeof result.Transaction === 'object' &&
    result.Transaction !== null &&
    'digest' in result.Transaction &&
    typeof result.Transaction.digest === 'string' &&
    result.Transaction.digest.length > 0
  )
}

function isFailedWalletResult(result: WalletExecutionResultLike): result is {
  FailedTransaction: {
    digest?: unknown
    status?: {
      error?: unknown
    }
  }
} {
  return typeof result === 'object' && result !== null && 'FailedTransaction' in result && typeof result.FailedTransaction === 'object'
}

function getFailedWalletMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message

  return 'Wallet returned a failed transaction result.'
}
