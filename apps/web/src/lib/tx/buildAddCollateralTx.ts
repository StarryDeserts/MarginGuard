import { Transaction } from '@mysten/sui/transactions'
import type { AddCollateralTxDeps, BuildAddCollateralTxInput, BuildAddCollateralTxResult } from '../../types/tx'
import { ACTIVE_MARGIN_MANAGER_KEY, ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX } from '../deepbook/addCollateralCapability'
import { getDeepBookPoolConfig } from '../deepbook/poolKeys'
import { isValidObjectId } from '../storage/localManagers'
import { shortAddress } from '../utils/address'

export function buildAddCollateralTx(
  input: BuildAddCollateralTxInput,
  deps: AddCollateralTxDeps = {},
): BuildAddCollateralTxResult {
  const capability = deps.capability ?? ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX

  if (capability.confidence !== 'verified' || capability.unsignedBuilderStatus !== 'verified-unsigned-builder') {
    return { status: 'capability-blocked', reason: 'Add Collateral unsigned PTB builder is not verified.' }
  }

  if (input.network !== 'mainnet') {
    return { status: 'blocked', reason: 'Add Collateral unsigned PTB is configured for Mainnet only.' }
  }

  if (input.poolKey !== 'SUI_USDC') {
    return { status: 'blocked', reason: 'Add Collateral unsigned PTB supports SUI_USDC only.' }
  }

  if (input.managerKey !== ACTIVE_MARGIN_MANAGER_KEY) {
    return { status: 'blocked', reason: 'Add Collateral must use the configured activeManager alias.' }
  }

  if (!input.senderAddress) {
    return { status: 'blocked', reason: 'Connected wallet sender address is required.' }
  }

  if (!isValidObjectId(input.senderAddress)) {
    return { status: 'blocked', reason: 'Valid connected wallet sender address is required.' }
  }

  if (!isValidObjectId(input.managerObjectId)) {
    return { status: 'blocked', reason: 'Valid imported manager object ID is required.' }
  }

  if (input.amountAtomic <= 0n) {
    return { status: 'blocked', reason: 'Add Collateral amount must be greater than zero.' }
  }

  if (input.actionability && input.actionability !== 'action-needed') {
    return { status: 'blocked', reason: 'Add Collateral unsigned PTB requires an action-needed rescue state.' }
  }

  const poolConfig = getDeepBookPoolConfig(input.network, input.poolKey)

  if (poolConfig.status !== 'configured') {
    return { status: 'blocked', reason: poolConfig.message }
  }

  if (input.collateralCoinType !== poolConfig.quoteCoinType) {
    return { status: 'blocked', reason: 'Add Collateral must use the verified USDC quote coin type.' }
  }

  if (!deps.depositQuote) {
    return { status: 'capability-blocked', reason: 'Verified DeepBook depositQuote dependency is required to build an unsigned PTB.' }
  }

  try {
    const tx = new Transaction()

    // depositQuote creates a quote-coin coinWithBalance intent internally, so the
    // unsigned transaction needs the sender set before the SDK command is added.
    tx.setSender(input.senderAddress)
    tx.add(deps.depositQuote({ managerKey: ACTIVE_MARGIN_MANAGER_KEY, amount: input.amountAtomic }))

    return {
      status: 'success',
      tx,
      summary: {
        action: 'add-collateral',
        network: input.network,
        managerShort: shortAddress(input.managerObjectId),
        poolKey: input.poolKey,
        collateralAsset: 'USDC',
        amountDisplay: input.amountDisplay,
        amountAtomic: input.amountAtomic.toString(),
        source: 'deepbook',
        warnings: ['Unsigned PTB only', 'Signing handled only after explicit wallet approval', 'No transaction submitted by builder'],
      },
    }
  } catch (cause) {
    return { status: 'error', message: 'Could not build unsigned Add Collateral PTB.', cause }
  }
}
