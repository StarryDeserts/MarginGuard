import { describe, expect, it } from 'vitest'
import { ACTIVE_MARGIN_MANAGER_KEY, ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX, isAddCollateralPreviewSupported } from './addCollateralCapability'

describe('Add Collateral write capability matrix', () => {
  it('records the verified DeepBook SDK wrapper without authorizing raw Move calls', () => {
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.packageName).toBe('@mysten/deepbook-v3')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.packageVersion).toBe('1.3.1')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.runtimeObjectPath).toBe('extendedClient.deepbook.marginManager.depositQuote')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.methodName).toBe('depositQuote')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.parameterShape).toContain('amount: number | bigint')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.methodReturnShape).toBe('(tx: Transaction) => void')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.requiresExistingTransaction).toBe(true)
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.returnsTransaction).toBe(false)
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.requiredAmountPolicy).toBe('atomic-bigint')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.managerKey).toBe(ACTIVE_MARGIN_MANAGER_KEY)
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.internallyUsesCoinWithBalance).toBe(true)
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.depositQuoteReturnKind).toBe('transaction-callback')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.confirmedInvocationForm).toBe('tx.add(depositQuote(params))')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.requiresSetSenderBeforeCommand).toBe(true)
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.deepBookClientConfigRequirements).toEqual([
      'address',
      'marginManagers.activeManager',
    ])
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.rawMoveTargetConfidence).toBe('informational-only')
    expect(ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.unsignedBuilderStatus).toBe('verified-unsigned-builder')
    expect(isAddCollateralPreviewSupported()).toBe(true)
  })
})
