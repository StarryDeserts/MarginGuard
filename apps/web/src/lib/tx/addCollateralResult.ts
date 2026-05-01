import { mockMarginState, mockTransactionResult } from '../demo/mockMarginState'
import { shortAddress } from '../utils/address'
import { formatPct, formatRatio } from '../utils/format'
import type { AppNetwork } from '../../types/margin'
import type { AddCollateralExecutionState, AddCollateralTxSummary } from '../../types/tx'

export type AddCollateralResultView = {
  title: string
  subtitle: string
  details: [string, string][]
  timeline: { label: string; done: boolean }[]
  copy: string
  explorerUrl?: string
  showRetryRefresh: boolean
  isMock: boolean
}

type RealResultState = Extract<
  AddCollateralExecutionState,
  | { status: 'submitted' }
  | { status: 'confirming' }
  | { status: 'confirmed' }
  | { status: 'refreshing-manager' }
  | { status: 'refreshed' }
  | { status: 'refresh-failed' }
  | { status: 'rejected' }
  | { status: 'failed' }
>

export function createAddCollateralResultView(state?: AddCollateralExecutionState): AddCollateralResultView {
  if (!state || !isRealResultState(state)) {
    return getMockResultView()
  }

  return getRealResultView(state)
}

export function getSuiExplorerTxUrl(digest: string, network: AppNetwork) {
  return `https://suiexplorer.com/txblock/${encodeURIComponent(digest)}?network=${network}`
}

function getMockResultView(): AddCollateralResultView {
  return {
    title: 'Mock Rescue Result',
    subtitle: 'Mock result - no transaction submitted.',
    details: [
      ['Action', mockTransactionResult.action],
      ['Amount', mockTransactionResult.amount],
      ['Mock Digest', mockTransactionResult.digest],
      ['Network', mockTransactionResult.network],
      ['Execution Mode', mockTransactionResult.executionMode],
    ],
    timeline: ['Mock reviewed', 'No wallet opened', 'No transaction submitted', 'Static risk preview'].map((label) => ({
      label,
      done: true,
    })),
    copy: `Before RR ${formatRatio(mockMarginState.riskRatio)} -> expected ${formatRatio(
      mockMarginState.targetRiskRatio,
    )}; liquidation distance ${formatPct(mockMarginState.liquidationDistancePct)} -> ${formatPct(
      mockMarginState.liquidationDistanceAfterPct,
    )}. Demo values are mock preview values.`,
    showRetryRefresh: false,
    isMock: true,
  }
}

function getRealResultView(state: RealResultState): AddCollateralResultView {
  const digest = 'digest' in state ? state.digest : undefined
  const summary = 'summary' in state ? state.summary : undefined
  const details = getRealResultDetails(state, summary)
  const timeline = [
    { label: 'Submitted', done: hasReached(state.status, 'submitted') },
    { label: 'Confirmed', done: hasReached(state.status, 'confirmed') },
    { label: 'Manager refresh attempted', done: hasReached(state.status, 'refreshing-manager') },
    { label: 'Manager refreshed', done: state.status === 'refreshed' },
  ]
  const explorerUrl = digest && summary ? getSuiExplorerTxUrl(digest, summary.network) : undefined

  if (state.status === 'rejected') {
    return {
      title: 'Wallet Request Rejected',
      subtitle: 'No transaction submitted.',
      details,
      timeline,
      copy: state.message,
      explorerUrl: undefined,
      showRetryRefresh: false,
      isMock: false,
    }
  }

  if (state.status === 'failed') {
    return {
      title: 'Add Collateral Failed',
      subtitle: state.digest ? 'Wallet returned a failed transaction result.' : 'No confirmed transaction digest was returned.',
      details,
      timeline,
      copy: state.message,
      explorerUrl,
      showRetryRefresh: false,
      isMock: false,
    }
  }

  if (state.status === 'submitted') {
    return {
      title: 'Transaction Submitted',
      subtitle: 'Submitted with digest. Waiting for confirmation.',
      details,
      timeline,
      copy: 'Submitted means the wallet returned a digest. It is not confirmed yet.',
      explorerUrl,
      showRetryRefresh: false,
      isMock: false,
    }
  }

  if (state.status === 'confirming') {
    return {
      title: 'Confirming Transaction',
      subtitle: 'Waiting for Sui confirmation.',
      details,
      timeline,
      copy: 'Confirmation is pending from the selected Sui client.',
      explorerUrl,
      showRetryRefresh: false,
      isMock: false,
    }
  }

  if (state.status === 'confirmed') {
    return {
      title: 'Transaction Confirmed',
      subtitle: 'Manager refresh has not completed yet.',
      details,
      timeline,
      copy: 'Confirmed only means the transaction was accepted onchain. Latest manager state is still being refreshed.',
      explorerUrl,
      showRetryRefresh: false,
      isMock: false,
    }
  }

  if (state.status === 'refreshing-manager') {
    return {
      title: 'Refreshing Manager',
      subtitle: 'Transaction confirmed. Reading latest manager state.',
      details,
      timeline,
      copy: 'MarginGuard is re-reading the manager after confirmation.',
      explorerUrl,
      showRetryRefresh: false,
      isMock: false,
    }
  }

  if (state.status === 'refresh-failed') {
    return {
      title: 'Confirmed, Refresh Failed',
      subtitle: 'Latest manager state could not be read.',
      details,
      timeline,
      copy: 'Transaction may be confirmed, but latest manager state could not be read.',
      explorerUrl,
      showRetryRefresh: true,
      isMock: false,
    }
  }

  return {
    title: 'Manager Refreshed',
    subtitle: 'Confirmed transaction and latest manager read completed.',
    details: [
      ...details,
      ['Before RR', state.beforeRiskRatio === undefined ? 'Unavailable' : formatRatio(state.beforeRiskRatio)],
      ['After RR', state.afterRiskRatio === undefined ? 'Unavailable' : formatRatio(state.afterRiskRatio)],
    ],
    timeline,
    copy: 'Manager refreshed after confirmation.',
    explorerUrl,
    showRetryRefresh: false,
    isMock: false,
  }
}

function getRealResultDetails(state: RealResultState, summary: AddCollateralTxSummary | undefined): [string, string][] {
  const digest = 'digest' in state ? state.digest : undefined

  return [
    ['Action', 'Add Collateral'],
    ['Network', formatNetwork(summary?.network)],
    ['Market', summary?.poolKey.replace('_', '/') ?? 'SUI/USDC'],
    ['Asset', summary?.collateralAsset ?? 'USDC'],
    ['Amount', summary?.amountDisplay ?? 'Unavailable'],
    ['Manager', summary?.managerShort ?? 'Unavailable'],
    ['Execution Mode', 'Gated Add Collateral'],
    ['Digest', digest ? shortAddress(digest) : 'None'],
  ]
}

function formatNetwork(network: AppNetwork | undefined) {
  if (network === 'mainnet') return 'Mainnet'
  if (network === 'testnet') return 'Testnet'

  return 'Unavailable'
}

function hasReached(status: AddCollateralExecutionState['status'], milestone: 'submitted' | 'confirmed' | 'refreshing-manager') {
  const order: AddCollateralExecutionState['status'][] = [
    'wallet-prompt',
    'submitted',
    'confirming',
    'confirmed',
    'refreshing-manager',
    'refreshed',
    'refresh-failed',
  ]

  return order.indexOf(status) >= order.indexOf(milestone)
}

function isRealResultState(state: AddCollateralExecutionState): state is RealResultState {
  return (
    state.status === 'submitted' ||
    state.status === 'confirming' ||
    state.status === 'confirmed' ||
    state.status === 'refreshing-manager' ||
    state.status === 'refreshed' ||
    state.status === 'refresh-failed' ||
    state.status === 'rejected' ||
    state.status === 'failed'
  )
}
