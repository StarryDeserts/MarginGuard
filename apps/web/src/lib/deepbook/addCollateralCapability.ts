import type { AddCollateralCapabilityMatrix } from '../../types/tx'

export const ACTIVE_MARGIN_MANAGER_KEY = 'activeManager' as const

// Reconfirmed from installed @mysten/deepbook-v3@1.3.1 package types/source on 2026-04-29.
// depositQuote(params) returns a Transaction callback and is added with tx.add(...).
// The builder remains unsigned-only; Round 5D wallet execution lives in a separate hook boundary.
export const ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX: AddCollateralCapabilityMatrix = {
  packageName: '@mysten/deepbook-v3',
  packageVersion: '1.3.1',
  exportPath: '@mysten/deepbook-v3',
  runtimeObjectPath: 'extendedClient.deepbook.marginManager.depositQuote',
  methodName: 'depositQuote',
  parameterShape: '{ managerKey: string } & ({ amount: number | bigint; coin?: never } | { amount?: never; coin: TransactionArgument })',
  methodReturnShape: '(tx: Transaction) => void',
  requiresExistingTransaction: true,
  returnsTransaction: false,
  amountType: 'number | bigint',
  requiredAmountPolicy: 'atomic-bigint',
  managerKey: ACTIVE_MARGIN_MANAGER_KEY,
  poolConfigSource: 'DeepBook client marginManagers config',
  internallyUsesCoinWithBalance: true,
  depositQuoteReturnKind: 'transaction-callback',
  confirmedInvocationForm: 'tx.add(depositQuote(params))',
  requiresSetSenderBeforeCommand: true,
  deepBookClientConfigRequirements: ['address', 'marginManagers.activeManager'],
  senderAddressRequiredInClientConfig: 'yes',
  rawMoveTargetConfidence: 'informational-only',
  round5BPolicy: 'discovery-and-preview-only',
  round5CPolicy: 'unsigned-builder-only',
  previewSupported: true,
  unsignedBuilderStatus: 'verified-unsigned-builder',
  confidence: 'verified',
}

export function isAddCollateralPreviewSupported(matrix = ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX) {
  return matrix.confidence === 'verified' && matrix.previewSupported
}
