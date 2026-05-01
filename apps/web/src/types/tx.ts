import type { AppNetwork, SupportedPoolKey } from './margin'
import type { Transaction } from '@mysten/sui/transactions'

export type MockTransactionResult = {
  digest: string
  action: 'Add Collateral'
  amount: string
  network: 'Mainnet'
  executionMode: 'Gated Add Collateral PTB preview'
  submitted: false
}

export type ActiveMarginManagerKey = 'activeManager'

export type AddCollateralCapabilityConfidence = 'verified' | 'partial' | 'blocked'
export type AddCollateralUnsignedBuilderStatus = 'disabled-until-round-5c' | 'verified-unsigned-builder' | 'blocked'
export type DepositQuoteReturnKind = 'transaction-callback'
export type DepositQuoteInvocationForm = 'tx.add(depositQuote(params))'
export type BuildAddCollateralActionability = 'action-needed' | 'no-rescue-needed' | 'zero-debt' | 'unavailable' | 'read-error'

export type AddCollateralCapabilityMatrix = {
  packageName: '@mysten/deepbook-v3'
  packageVersion: '1.3.1'
  exportPath: '@mysten/deepbook-v3'
  runtimeObjectPath: 'extendedClient.deepbook.marginManager.depositQuote'
  methodName: 'depositQuote'
  parameterShape: '{ managerKey: string } & ({ amount: number | bigint; coin?: never } | { amount?: never; coin: TransactionArgument })'
  methodReturnShape: '(tx: Transaction) => void'
  requiresExistingTransaction: true
  returnsTransaction: false
  amountType: 'number | bigint'
  requiredAmountPolicy: 'atomic-bigint'
  managerKey: ActiveMarginManagerKey
  poolConfigSource: 'DeepBook client marginManagers config'
  internallyUsesCoinWithBalance: true
  depositQuoteReturnKind: DepositQuoteReturnKind
  confirmedInvocationForm: DepositQuoteInvocationForm
  requiresSetSenderBeforeCommand: true
  deepBookClientConfigRequirements: ['address', 'marginManagers.activeManager']
  senderAddressRequiredInClientConfig: 'yes'
  rawMoveTargetConfidence: 'informational-only'
  round5BPolicy: 'discovery-and-preview-only'
  round5CPolicy?: 'unsigned-builder-only'
  previewSupported: boolean
  unsignedBuilderStatus: AddCollateralUnsignedBuilderStatus
  confidence: AddCollateralCapabilityConfidence
}

export type AddCollateralPreviewBlockedReason =
  | 'no-wallet'
  | 'no-manager'
  | 'network-not-configured'
  | 'capability-blocked'
  | 'no-rescue-needed'
  | 'zero-debt'
  | 'read-error'
  | 'unavailable'
  | 'amount-non-positive'

export type AddCollateralPreviewGate =
  | { status: 'enabled'; reason?: undefined }
  | { status: 'blocked'; reason: AddCollateralPreviewBlockedReason; message: string }

export type BuildAddCollateralTxInput = {
  network: AppNetwork
  senderAddress: string
  managerObjectId: string
  managerKey: ActiveMarginManagerKey
  poolKey: SupportedPoolKey
  collateralCoinType: string
  amountAtomic: bigint
  amountDisplay: string
  expectedBeforeRiskRatio?: number
  expectedAfterRiskRatio?: number
  actionability?: BuildAddCollateralActionability
}

export type AddCollateralTxSummary = {
  action: 'add-collateral'
  network: AppNetwork
  managerShort: string
  poolKey: SupportedPoolKey
  collateralAsset: 'USDC'
  amountDisplay: string
  amountAtomic: string
  source: 'deepbook'
  warnings: string[]
}

export type AddCollateralExecutionStatus =
  | 'idle'
  | 'reviewing'
  | 'rereading'
  | 'blocked'
  | 'building'
  | 'wallet-prompt'
  | 'submitted'
  | 'confirming'
  | 'confirmed'
  | 'refreshing-manager'
  | 'refreshed'
  | 'refresh-failed'
  | 'rejected'
  | 'failed'

export type AddCollateralExecutionState =
  | { status: 'idle' }
  | { status: 'reviewing' }
  | { status: 'rereading' }
  | { status: 'blocked'; message: string }
  | { status: 'building' }
  | { status: 'wallet-prompt' }
  | { status: 'submitted'; digest: string; summary?: AddCollateralTxSummary }
  | { status: 'confirming'; digest: string; summary?: AddCollateralTxSummary }
  | { status: 'confirmed'; digest: string; summary?: AddCollateralTxSummary }
  | { status: 'refreshing-manager'; digest: string; summary?: AddCollateralTxSummary }
  | { status: 'refreshed'; digest: string; summary?: AddCollateralTxSummary; beforeRiskRatio?: number; afterRiskRatio?: number }
  | { status: 'refresh-failed'; digest: string; message: string; summary?: AddCollateralTxSummary; beforeRiskRatio?: number }
  | { status: 'rejected'; message: string }
  | { status: 'failed'; message: string; digest?: string }

export type DepositQuoteCommand = (tx: Transaction) => void

export type AddCollateralTxDeps = {
  depositQuote?: (params: { managerKey: ActiveMarginManagerKey; amount: bigint }) => DepositQuoteCommand
  capability?: AddCollateralCapabilityMatrix
}

export type BuildAddCollateralTxResult =
  | { status: 'success'; tx: Transaction; summary: AddCollateralTxSummary }
  | { status: 'not-implemented'; message: string }
  | { status: 'blocked'; reason: string }
  | { status: 'capability-blocked'; reason: string }
  | { status: 'error'; message: string; cause?: unknown }

export type AddCollateralReviewModel = {
  action: 'add-collateral'
  network: AppNetwork
  managerShort: string
  connectedWalletShort?: string
  poolKey: SupportedPoolKey
  collateralAsset: 'USDC' | 'SUI'
  amountDisplay: string
  amountAtomic: string
  estimatedGas?: string
  beforeRiskRatio?: number
  afterRiskRatio?: number
  liquidationThreshold?: number
  targetRiskRatio?: number
  source: 'deepbook' | 'mock-preview'
  rescueActionability: BuildAddCollateralActionability
  isExecutable: boolean
  buildStatus: 'not-built' | 'unsigned-built' | 'blocked' | 'error'
  unsignedTxAvailable: boolean
  signingEnabled: boolean
  blockedReason?: string
  capabilityStatus: AddCollateralCapabilityConfidence
  exactDeepBookWriteApi: 'verified' | 'blocked'
  verifiedSdkMethod?: 'marginManager.depositQuote'
  warnings: string[]
}
