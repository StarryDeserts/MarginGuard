import { describe, expect, it } from 'vitest'
import { getAddCollateralPreviewGate } from './addCollateralPreview'

const enabledBase = {
  actionability: 'action-needed' as const,
  sourceState: 'full-deepbook' as const,
  walletConnected: true,
  managerSelected: true,
  networkConfigured: true,
  amountAtomic: 60_000_000n,
}

describe('Add Collateral PTB preview gating', () => {
  it('enables preview only for action-needed state with all required inputs', () => {
    expect(getAddCollateralPreviewGate(enabledBase)).toEqual({ status: 'enabled' })
  })

  it('blocks non-actionable source states', () => {
    expect(getAddCollateralPreviewGate({ ...enabledBase, actionability: 'no-rescue-needed' })).toMatchObject({
      status: 'blocked',
      reason: 'no-rescue-needed',
    })
    expect(getAddCollateralPreviewGate({ ...enabledBase, actionability: 'zero-debt' })).toMatchObject({
      status: 'blocked',
      reason: 'zero-debt',
    })
    expect(getAddCollateralPreviewGate({ ...enabledBase, actionability: 'read-error', sourceState: 'read-error' })).toMatchObject({
      status: 'blocked',
      reason: 'read-error',
    })
    expect(getAddCollateralPreviewGate({ ...enabledBase, actionability: 'unavailable', sourceState: 'unavailable' })).toMatchObject({
      status: 'blocked',
      reason: 'unavailable',
    })
  })

  it('blocks missing wallet, manager, network, capability, and amount inputs', () => {
    expect(getAddCollateralPreviewGate({ ...enabledBase, walletConnected: false })).toMatchObject({ reason: 'no-wallet' })
    expect(getAddCollateralPreviewGate({ ...enabledBase, managerSelected: false })).toMatchObject({ reason: 'no-manager' })
    expect(getAddCollateralPreviewGate({ ...enabledBase, networkConfigured: false })).toMatchObject({ reason: 'network-not-configured' })
    expect(getAddCollateralPreviewGate({ ...enabledBase, amountAtomic: 0n })).toMatchObject({ reason: 'amount-non-positive' })
    expect(
      getAddCollateralPreviewGate({
        ...enabledBase,
        capability: {
          packageName: '@mysten/deepbook-v3',
          packageVersion: '1.3.1',
          exportPath: '@mysten/deepbook-v3',
          runtimeObjectPath: 'extendedClient.deepbook.marginManager.depositQuote',
          methodName: 'depositQuote',
          parameterShape:
            '{ managerKey: string } & ({ amount: number | bigint; coin?: never } | { amount?: never; coin: TransactionArgument })',
          methodReturnShape: '(tx: Transaction) => void',
          requiresExistingTransaction: true,
          returnsTransaction: false,
          amountType: 'number | bigint',
          requiredAmountPolicy: 'atomic-bigint',
          managerKey: 'activeManager',
          poolConfigSource: 'DeepBook client marginManagers config',
          internallyUsesCoinWithBalance: true,
          senderAddressRequiredInClientConfig: 'yes',
          depositQuoteReturnKind: 'transaction-callback',
          confirmedInvocationForm: 'tx.add(depositQuote(params))',
          requiresSetSenderBeforeCommand: true,
          deepBookClientConfigRequirements: ['address', 'marginManagers.activeManager'],
          rawMoveTargetConfidence: 'informational-only',
          round5BPolicy: 'discovery-and-preview-only',
          round5CPolicy: 'unsigned-builder-only',
          previewSupported: false,
          unsignedBuilderStatus: 'blocked',
          confidence: 'blocked',
        },
      }),
    ).toMatchObject({ reason: 'capability-blocked' })
  })
})
