import { Transaction } from '@mysten/sui/transactions'
import { describe, expect, it, vi } from 'vitest'
import { ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX } from '../deepbook/addCollateralCapability'
import { getDeepBookPoolConfig } from '../deepbook/poolKeys'
import { buildAddCollateralTx } from './buildAddCollateralTx'

const validInput = {
  network: 'mainnet' as const,
  senderAddress: '0x1111111111111111111111111111111111111111111111111111111111111111',
  managerObjectId: '0x2222222222222222222222222222222222222222222222222222222222222222',
  managerKey: 'activeManager' as const,
  poolKey: 'SUI_USDC' as const,
  collateralCoinType: getVerifiedUsdcCoinType(),
  amountAtomic: 60_000_000n,
  amountDisplay: '60.00 USDC',
  expectedBeforeRiskRatio: 1.17,
  expectedAfterRiskRatio: 1.3,
  actionability: 'action-needed' as const,
}

describe('Round 5C Add Collateral unsigned builder', () => {
  it('builds an unsigned Transaction with the verified depositQuote invocation form', () => {
    let callbackSender: string | null | undefined
    const depositQuote = vi.fn(() => (tx: Transaction) => {
      callbackSender = tx.getData().sender
    })

    const result = buildAddCollateralTx(validInput, { depositQuote })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error('expected success')

    expect(result.tx).toBeInstanceOf(Transaction)
    expect(result.tx.getData().sender).toBe(validInput.senderAddress)
    expect(callbackSender).toBe(validInput.senderAddress)
    expect(depositQuote).toHaveBeenCalledWith({ managerKey: 'activeManager', amount: 60_000_000n })
    expect(depositQuote).not.toHaveBeenCalledWith(expect.objectContaining({ managerKey: validInput.managerObjectId }))
    expect(result.summary.managerShort).toBe('0x2222...2222')
    expect(result.summary.amountAtomic).toBe('60000000')
    expect(result.summary.warnings).toContain('Unsigned PTB only')
    expect(result.summary.warnings).toContain('Signing handled only after explicit wallet approval')
    expect(result.summary.warnings).toContain('No transaction submitted by builder')
  })

  it('blocks invalid builder inputs before constructing a Transaction', () => {
    expect(buildAddCollateralTx({ ...validInput, amountAtomic: 0n })).toMatchObject({
      status: 'blocked',
      reason: 'Add Collateral amount must be greater than zero.',
    })
    expect(buildAddCollateralTx({ ...validInput, managerKey: 'other' as 'activeManager' })).toMatchObject({
      status: 'blocked',
      reason: 'Add Collateral must use the configured activeManager alias.',
    })
    expect(buildAddCollateralTx({ ...validInput, network: 'testnet' })).toMatchObject({
      status: 'blocked',
      reason: 'Add Collateral unsigned PTB is configured for Mainnet only.',
    })
    expect(buildAddCollateralTx({ ...validInput, poolKey: 'OTHER' as 'SUI_USDC' })).toMatchObject({
      status: 'blocked',
      reason: 'Add Collateral unsigned PTB supports SUI_USDC only.',
    })
    expect(buildAddCollateralTx({ ...validInput, collateralCoinType: '0x2::sui::SUI' })).toMatchObject({
      status: 'blocked',
      reason: 'Add Collateral must use the verified USDC quote coin type.',
    })
    expect(buildAddCollateralTx({ ...validInput, senderAddress: '' })).toMatchObject({
      status: 'blocked',
      reason: 'Connected wallet sender address is required.',
    })
    expect(buildAddCollateralTx({ ...validInput, managerObjectId: 'not-an-object-id' })).toMatchObject({
      status: 'blocked',
      reason: 'Valid imported manager object ID is required.',
    })
    expect(buildAddCollateralTx({ ...validInput, actionability: 'no-rescue-needed' })).toMatchObject({
      status: 'blocked',
      reason: 'Add Collateral unsigned PTB requires an action-needed rescue state.',
    })
  })

  it('blocks when capability is not verified or the SDK dependency is missing', () => {
    expect(buildAddCollateralTx(validInput)).toMatchObject({
      status: 'capability-blocked',
      reason: 'Verified DeepBook depositQuote dependency is required to build an unsigned PTB.',
    })

    expect(
      buildAddCollateralTx(validInput, {
        depositQuote: vi.fn(() => () => undefined),
        capability: {
          ...ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX,
          unsignedBuilderStatus: 'blocked',
          confidence: 'blocked',
        },
      }),
    ).toMatchObject({
      status: 'capability-blocked',
      reason: 'Add Collateral unsigned PTB builder is not verified.',
    })
  })

  it('keeps transaction construction and signing boundaries in production source', () => {
    const sourceModules = import.meta.glob('/src/**/*.{ts,tsx}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>
    const sourceFiles = Object.entries(sourceModules).filter(([file]) => !normalizeSourcePath(file).endsWith('.test.ts'))
    const builderEntry = sourceFiles.find(([file]) => normalizeSourcePath(file).endsWith('lib/tx/buildAddCollateralTx.ts'))

    expect(builderEntry).toBeTruthy()

    const nonBuilderSource = sourceFiles
      .filter(([file]) => file !== builderEntry?.[0])
      .map(([, source]) => source)
      .join('\n')
    const signingFiles = sourceFiles
      .filter(([, source]) => source.includes('signAndExecuteTransaction'))
      .map(([file]) => normalizeSourcePath(file))
    const builderSource = builderEntry![1]

    expect(builderSource).toContain('new Transaction')
    expect(nonBuilderSource).not.toContain('new Transaction')
    expect(signingFiles).toEqual(['/src/hooks/useAddCollateralExecution.ts'])
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain('tx.moveCall')
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain('coinWithBalance(')
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain("import { coinWithBalance")
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain('splitCoins')
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain('useSignTransaction')
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain('useSignAndExecuteTransaction')
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain('signTransaction')
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain('executeTransactionBlock')
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain('wallet.sign')
    expect(`${builderSource}\n${nonBuilderSource}`).not.toContain('wallet.execute')
  })
})

function getVerifiedUsdcCoinType() {
  const poolConfig = getDeepBookPoolConfig('mainnet', 'SUI_USDC')

  if (poolConfig.status !== 'configured') {
    throw new Error('Expected Mainnet SUI_USDC pool config for builder tests')
  }

  return poolConfig.quoteCoinType
}

function normalizeSourcePath(file: string) {
  return file.replace(/\\/g, '/').replace(/\?raw$/, '')
}
