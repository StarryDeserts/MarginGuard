import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '@mysten/sui/transactions'
import type { NormalizedMarginState } from '../../types/margin'
import type { AddCollateralExecutionState, AddCollateralReviewModel, BuildAddCollateralTxResult } from '../../types/tx'
import { createAddCollateralReviewModel } from './addCollateralReview'
import {
  classifyWalletExecutionError,
  extractWalletExecutionResult,
  getAddCollateralExecutionGate,
  isExecutionPending,
  isLiveAddCollateralEnabled,
  retryAddCollateralManagerRefresh,
  runAddCollateralExecution,
  type ExecutionManagerRead,
  type WalletExecutionResultLike,
} from './addCollateralExecution'

const actionNeededState = createState({
  riskRatio: 1.1,
  targetRiskRatio: 1.25,
  assetValueUsd: 110,
  debtValueUsd: 100,
})
const noRescueState = createState({
  riskRatio: 2.11,
  targetRiskRatio: 1.25,
  assetValueUsd: 211,
  debtValueUsd: 100,
})
const zeroDebtState = createState({
  riskRatio: undefined,
  targetRiskRatio: 1.25,
  assetValueUsd: 50,
  debtValueUsd: 0,
  baseDebt: 0,
  quoteDebt: 0,
})

describe('Round 5D Add Collateral execution gates', () => {
  it('requires live feature flag, acknowledgement, wallet, and real DeepBook action-needed state', () => {
    const reviewModel = createExecutableReviewModel(actionNeededState)

    expect(
      getAddCollateralExecutionGate({
        reviewModel,
        acknowledged: false,
        liveEnabled: true,
        walletConnected: true,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
      }),
    ).toMatchObject({ status: 'blocked', message: 'Acknowledge the wallet prompt warning before signing.' })

    expect(
      getAddCollateralExecutionGate({
        reviewModel,
        acknowledged: true,
        liveEnabled: false,
        walletConnected: true,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
      }),
    ).toMatchObject({ status: 'blocked', message: 'Live Add Collateral is disabled. Set VITE_ENABLE_LIVE_ADD_COLLATERAL=true to enable wallet submission.' })

    expect(
      getAddCollateralExecutionGate({
        reviewModel: { ...reviewModel, source: 'mock-preview' },
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
      }),
    ).toMatchObject({ status: 'blocked', message: 'Live Add Collateral is only available for real DeepBook state.' })

    expect(
      getAddCollateralExecutionGate({
        reviewModel,
        acknowledged: true,
        liveEnabled: true,
        walletConnected: false,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
      }),
    ).toMatchObject({ status: 'blocked', message: 'Connect wallet before signing.' })

    expect(
      getAddCollateralExecutionGate({
        reviewModel,
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        selectedNetwork: 'mainnet',
        walletNetwork: 'testnet',
      }),
    ).toMatchObject({ status: 'blocked', message: 'Wallet network must match the selected Mainnet manager.' })

    expect(
      getAddCollateralExecutionGate({
        reviewModel,
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
      }),
    ).toEqual({ status: 'enabled' })
  })

  it('blocks no-rescue-needed, zero-debt, read-error, and unavailable review states', () => {
    expect(blockedMessageFor(createAddCollateralReviewModel({ state: noRescueState, sourceState: 'full-deepbook' }))).toBe(
      'No rescue needed while RR is above target.',
    )
    expect(blockedMessageFor(createAddCollateralReviewModel({ state: zeroDebtState, sourceState: 'full-deepbook' }))).toBe(
      'No active borrowed debt. Add Collateral is not required.',
    )
    expect(blockedMessageFor(createAddCollateralReviewModel({ state: actionNeededState, sourceState: 'read-error' }))).toBe(
      'Could not refresh manager state before signing.',
    )
    expect(blockedMessageFor(createAddCollateralReviewModel({ state: undefined, sourceState: 'unavailable' }))).toBe(
      'Read manager state before signing.',
    )
  })

  it('tracks pending execution states', () => {
    expect(isExecutionPending({ status: 'wallet-prompt' })).toBe(true)
    expect(isExecutionPending({ status: 'confirming', digest: 'abc' })).toBe(true)
    expect(isExecutionPending({ status: 'refreshed', digest: 'abc' })).toBe(false)
    expect(isExecutionPending({ status: 'rejected', message: 'Rejected' })).toBe(false)
  })

  it('parses live feature flag strictly', () => {
    expect(isLiveAddCollateralEnabled('true')).toBe(true)
    expect(isLiveAddCollateralEnabled('false')).toBe(false)
    expect(isLiveAddCollateralEnabled('TRUE')).toBe(false)
    expect(isLiveAddCollateralEnabled('1')).toBe(false)
    expect(isLiveAddCollateralEnabled('yes')).toBe(false)
    expect(isLiveAddCollateralEnabled('')).toBe(false)
    expect(isLiveAddCollateralEnabled(undefined)).toBe(false)
  })

  it('blocks unsupported network, missing manager, and non-positive amount before signing', () => {
    const reviewModel = createExecutableReviewModel(actionNeededState)

    expect(
      getAddCollateralExecutionGate({
        reviewModel,
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        selectedNetwork: 'testnet',
        walletNetwork: 'testnet',
      }),
    ).toMatchObject({ status: 'blocked', message: 'Add Collateral signing is configured for Mainnet only.' })

    expect(
      getAddCollateralExecutionGate({
        reviewModel: undefined,
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
      }),
    ).toMatchObject({ status: 'blocked', message: 'Read manager state before signing.' })

    expect(
      getAddCollateralExecutionGate({
        reviewModel: { ...reviewModel, amountAtomic: '0' },
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
      }),
    ).toMatchObject({ status: 'blocked', message: 'Add Collateral amount must be greater than zero.' })
  })
})

describe('Round 5D wallet result mapping', () => {
  it('maps successful wallet result to submitted digest', () => {
    expect(extractWalletExecutionResult({ $kind: 'Transaction', Transaction: { digest: '0xabc' } })).toEqual({
      status: 'submitted',
      digest: '0xabc',
    })
  })

  it('maps failed wallet execution result separately from rejection', () => {
    expect(
      extractWalletExecutionResult({
        $kind: 'FailedTransaction',
        FailedTransaction: { digest: '0xdef', status: { error: { message: 'Move abort' } } },
      }),
    ).toEqual({ status: 'failed', message: 'Move abort', digest: '0xdef' })
  })

  it('classifies user rejection best-effort', () => {
    expect(classifyWalletExecutionError(new Error('User rejected request'))).toMatchObject({
      status: 'rejected',
      message: 'Wallet request rejected by user.',
    })
    expect(classifyWalletExecutionError(new Error('transport failed'))).toMatchObject({
      status: 'failed',
      message: 'transport failed',
    })
  })
})

describe('Round 5D Add Collateral execution flow', () => {
  it('does not build, sign, or submit before explicit acknowledged execution', async () => {
    const states: AddCollateralExecutionState[] = []
    const submitUnsignedTransaction = vi.fn()
    const buildTx = vi.fn()

    const result = await runAddCollateralExecution(
      {
        reviewModel: createExecutableReviewModel(actionNeededState),
        acknowledged: false,
        liveEnabled: true,
        walletConnected: true,
        walletAddress: actionNeededState.walletAddress,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
        depositQuote: vi.fn(),
      },
      {
        rereadManagerState: async () => ({ status: 'success', state: actionNeededState, sourceState: 'full-deepbook' }),
        buildTx,
        submitUnsignedTransaction,
        waitForTransaction: vi.fn(),
        refreshManagerState: vi.fn(),
        onState: (state) => states.push(state),
      },
    )

    expect(result).toMatchObject({ status: 'blocked', message: 'Acknowledge the wallet prompt warning before signing.' })
    expect(buildTx).not.toHaveBeenCalled()
    expect(submitUnsignedTransaction).not.toHaveBeenCalled()
    expect(states).toEqual([{ status: 'blocked', message: 'Acknowledge the wallet prompt warning before signing.' }])
  })

  it('blocks when stale re-read changes action-needed to no-rescue-needed', async () => {
    const submitUnsignedTransaction = vi.fn()

    const result = await runAddCollateralExecution(
      {
        reviewModel: createExecutableReviewModel(actionNeededState),
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        walletAddress: actionNeededState.walletAddress,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
        depositQuote: vi.fn(),
      },
      {
        rereadManagerState: async () => ({ status: 'success', state: noRescueState, sourceState: 'full-deepbook' }),
        buildTx: vi.fn(),
        submitUnsignedTransaction,
        waitForTransaction: vi.fn(),
        refreshManagerState: vi.fn(),
      },
    )

    expect(result).toMatchObject({ status: 'blocked', message: 'No rescue needed while RR is above target.' })
    expect(submitUnsignedTransaction).not.toHaveBeenCalled()
  })

  it('blocks when stale re-read changes manager, network, source, or amount safety', async () => {
    const submitUnsignedTransaction = vi.fn()
    const buildTx = vi.fn(() => buildSuccessResult())

    const managerChanged = await runAddCollateralExecution(createExecutionInput(), {
      rereadManagerState: async () =>
        readSuccess({
          ...actionNeededState,
          manager: {
            ...actionNeededState.manager,
            objectId: '0x3333333333333333333333333333333333333333333333333333333333333333',
          },
        }),
      buildTx,
      submitUnsignedTransaction,
      waitForTransaction: vi.fn(),
      refreshManagerState: vi.fn(),
    })

    expect(managerChanged).toMatchObject({ status: 'blocked', message: 'Selected manager changed before signing.' })

    const networkChanged = await runAddCollateralExecution(createExecutionInput(), {
      rereadManagerState: async () =>
        readSuccess({
          ...actionNeededState,
          manager: {
            ...actionNeededState.manager,
            network: 'testnet',
          },
        }),
      buildTx,
      submitUnsignedTransaction,
      waitForTransaction: vi.fn(),
      refreshManagerState: vi.fn(),
    })

    expect(networkChanged).toMatchObject({ status: 'blocked', message: 'Selected network changed before signing.' })

    const readErrorResult = await runAddCollateralExecution(createExecutionInput(), {
      rereadManagerState: async () => readError('RPC unavailable'),
      buildTx,
      submitUnsignedTransaction,
      waitForTransaction: vi.fn(),
      refreshManagerState: vi.fn(),
    })

    expect(readErrorResult).toMatchObject({ status: 'blocked', message: 'Could not refresh manager state before signing.' })

    const nonPositiveAmount = await runAddCollateralExecution(
      {
        ...createExecutionInput(),
        reviewModel: { ...createExecutableReviewModel(actionNeededState), amountAtomic: '0' },
      },
      {
        rereadManagerState: async () => readSuccess(actionNeededState),
        buildTx,
        submitUnsignedTransaction,
        waitForTransaction: vi.fn(),
        refreshManagerState: vi.fn(),
      },
    )

    expect(nonPositiveAmount).toMatchObject({ status: 'blocked', message: 'Add Collateral amount must be greater than zero.' })
    expect(submitUnsignedTransaction).not.toHaveBeenCalled()
    expect(buildTx).not.toHaveBeenCalled()
  })

  it('retries refresh after confirmation without rebuilding or submitting', async () => {
    const states: AddCollateralExecutionState[] = []
    const refreshManagerState = vi.fn(async () => readSuccess(noRescueState))
    const buildResult = buildSuccessResult()

    if (buildResult.status !== 'success') throw new Error('expected success fixture')

    const result = await retryAddCollateralManagerRefresh(
      {
        status: 'refresh-failed',
        digest: '0xdigest',
        message: 'Transaction may be confirmed, but latest manager state could not be read.',
        summary: buildResult.summary,
        beforeRiskRatio: 1.1,
      },
      {
        refreshManagerState,
        onState: (state) => states.push(state),
      },
    )

    expect(refreshManagerState).toHaveBeenCalledTimes(1)
    expect(states.map((state) => state.status)).toEqual(['refreshing-manager', 'refreshed'])
    expect(result).toMatchObject({ status: 'refreshed', digest: '0xdigest', beforeRiskRatio: 1.1, afterRiskRatio: 2.11 })
  })

  it('maps build failure to failed state', async () => {
    const result = await runAddCollateralExecution(
      {
        reviewModel: createExecutableReviewModel(actionNeededState),
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        walletAddress: actionNeededState.walletAddress,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
        depositQuote: vi.fn(),
      },
      {
        rereadManagerState: async () => ({ status: 'success', state: actionNeededState, sourceState: 'full-deepbook' }),
        buildTx: vi.fn(() => buildBlockedResult('blocked by test')),
        submitUnsignedTransaction: vi.fn(),
        waitForTransaction: vi.fn(),
        refreshManagerState: vi.fn(),
      },
    )

    expect(result).toEqual({ status: 'failed', message: 'blocked by test' })
  })

  it('maps wallet rejection to rejected state', async () => {
    const result = await runAddCollateralExecution(
      {
        reviewModel: createExecutableReviewModel(actionNeededState),
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        walletAddress: actionNeededState.walletAddress,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
        depositQuote: vi.fn(),
      },
      {
        rereadManagerState: async () => ({ status: 'success', state: actionNeededState, sourceState: 'full-deepbook' }),
        buildTx: vi.fn(() => buildSuccessResult()),
        submitUnsignedTransaction: vi.fn(async () => {
          throw new Error('User rejected the transaction')
        }),
        waitForTransaction: vi.fn(),
        refreshManagerState: vi.fn(),
      },
    )

    expect(result).toEqual({ status: 'rejected', message: 'Wallet request rejected by user.' })
  })

  it('maps submit, confirm, refresh success, and refresh failure states', async () => {
    const successStates: AddCollateralExecutionState[] = []
    const refreshSuccess = await runAddCollateralExecution(
      {
        reviewModel: createExecutableReviewModel(actionNeededState),
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        walletAddress: actionNeededState.walletAddress,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
        depositQuote: vi.fn(),
      },
      {
        rereadManagerState: async () => readSuccess(actionNeededState),
        buildTx: vi.fn(() => buildSuccessResult()),
        submitUnsignedTransaction: vi.fn(async () => walletSuccess('0xdigest')),
        waitForTransaction: vi.fn(async () => ({ digest: '0xdigest' })),
        refreshManagerState: vi.fn(async () => readSuccess(noRescueState)),
        onState: (state) => successStates.push(state),
      },
    )

    expect(successStates.map((state) => state.status)).toEqual([
      'rereading',
      'building',
      'wallet-prompt',
      'submitted',
      'confirming',
      'confirmed',
      'refreshing-manager',
      'refreshed',
    ])
    expect(refreshSuccess).toMatchObject({ status: 'refreshed', digest: '0xdigest', beforeRiskRatio: 1.1, afterRiskRatio: 2.11 })

    const refreshFailure = await runAddCollateralExecution(
      {
        reviewModel: createExecutableReviewModel(actionNeededState),
        acknowledged: true,
        liveEnabled: true,
        walletConnected: true,
        walletAddress: actionNeededState.walletAddress,
        selectedNetwork: 'mainnet',
        walletNetwork: 'mainnet',
        depositQuote: vi.fn(),
      },
      {
        rereadManagerState: async () => ({ status: 'success', state: actionNeededState, sourceState: 'full-deepbook' }),
        buildTx: vi.fn(() => buildSuccessResult()),
        submitUnsignedTransaction: vi.fn(async () => walletSuccess('0xdigest')),
        waitForTransaction: vi.fn(async () => ({ digest: '0xdigest' })),
        refreshManagerState: vi.fn(async () => readError('refresh failed')),
      },
    )

    expect(refreshFailure).toMatchObject({
      status: 'refresh-failed',
      digest: '0xdigest',
      message: 'Transaction may be confirmed, but latest manager state could not be read.',
    })
  })
})

function blockedMessageFor(reviewModel: AddCollateralReviewModel) {
  const gate = getAddCollateralExecutionGate({
    reviewModel,
    acknowledged: true,
    liveEnabled: true,
    walletConnected: true,
    selectedNetwork: 'mainnet',
    walletNetwork: 'mainnet',
  })

  return gate.status === 'blocked' ? gate.message : undefined
}

function createExecutionInput() {
  return {
    reviewModel: createExecutableReviewModel(actionNeededState),
    acknowledged: true,
    liveEnabled: true,
    walletConnected: true,
    walletAddress: actionNeededState.walletAddress,
    selectedNetwork: 'mainnet' as const,
    walletNetwork: 'mainnet' as const,
    depositQuote: vi.fn(),
  }
}

function createExecutableReviewModel(state: NormalizedMarginState): AddCollateralReviewModel {
  return {
    ...createAddCollateralReviewModel({ state, sourceState: 'full-deepbook' }),
    isExecutable: true,
    buildStatus: 'unsigned-built',
    unsignedTxAvailable: true,
    signingEnabled: true,
    blockedReason: undefined,
  }
}

function createState(overrides: Partial<NormalizedMarginState>): NormalizedMarginState {
  return {
    manager: {
      objectId: '0x2222222222222222222222222222222222222222222222222222222222222222',
      network: 'mainnet',
      poolKey: 'SUI_USDC',
      displayPair: 'SUI/USDC',
    },
    walletAddress: '0x1111111111111111111111111111111111111111111111111111111111111111',
    baseSymbol: 'SUI',
    quoteSymbol: 'USDC',
    marketLabel: 'SUI/USDC',
    baseAsset: 0,
    quoteAsset: overrides.assetValueUsd,
    baseDebt: overrides.baseDebt ?? 0,
    quoteDebt: overrides.quoteDebt ?? overrides.debtValueUsd,
    basePriceUsd: 1,
    quotePriceUsd: 1,
    assetValueUsd: 110,
    debtValueUsd: 100,
    riskRatio: 1.1,
    startingRiskRatio: 1.1,
    liquidationRiskRatio: 1.1,
    targetRiskRatio: 1.25,
    liquidationDistancePct: 0,
    liquidationDistanceAfterPct: 10,
    liquidationPriceUsd: 0,
    borrowAprDecimal: 0.02,
    borrowAprDisplayPct: 2,
    updatedAtMs: 1,
    source: 'deepbook',
    ...overrides,
  }
}

function buildBlockedResult(reason: string): BuildAddCollateralTxResult {
  return { status: 'blocked', reason }
}

function buildSuccessResult(): BuildAddCollateralTxResult {
  return {
    status: 'success',
    tx: {} as Transaction,
    summary: {
      action: 'add-collateral',
      network: 'mainnet',
      managerShort: '0x2222...2222',
      poolKey: 'SUI_USDC',
      collateralAsset: 'USDC',
      amountDisplay: '15.00 USDC',
      amountAtomic: '15000000',
      source: 'deepbook',
      warnings: ['Unsigned PTB only'],
    },
  }
}

function walletSuccess(digest: string): WalletExecutionResultLike {
  return { $kind: 'Transaction', Transaction: { digest } }
}

function readSuccess(state: NormalizedMarginState): ExecutionManagerRead {
  return { status: 'success', state, sourceState: 'full-deepbook' }
}

function readError(message: string): ExecutionManagerRead {
  return { status: 'error', message }
}
