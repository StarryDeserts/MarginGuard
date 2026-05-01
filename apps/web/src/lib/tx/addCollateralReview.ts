import type { ManagerReadSourceState } from '../deepbook/readState'
import type { NormalizedMarginState } from '../../types/margin'
import type { AddCollateralReviewModel } from '../../types/tx'
import { getDeepBookPoolConfig } from '../deepbook/poolKeys'
import { getAddCollateralRecommendation, getRescueActionability } from '../risk/rescuePlans'
import { shortAddress } from '../utils/address'
import { ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX } from '../deepbook/addCollateralCapability'
import { parseDecimalAmountToAtomic } from './amounts'

export function createAddCollateralReviewModel(input: {
  state?: NormalizedMarginState
  sourceState?: ManagerReadSourceState
}): AddCollateralReviewModel {
  const state = input.state
  const capabilityStatus = ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX.confidence

  if (!state) {
    return blockedReviewModel('Unavailable', 'Read manager state before preparing a PTB preview.', capabilityStatus, 'unavailable')
  }

  const poolConfig = getDeepBookPoolConfig(state.manager.network, state.manager.poolKey)
  const actionability = getRescueActionability(state, input.sourceState)
  const recommendation = getAddCollateralRecommendation(state, input.sourceState)
  const connectedWalletShort = state.walletAddress ? shortAddress(state.walletAddress) : undefined

  if (!recommendation) {
    return {
      action: 'add-collateral',
      network: state.manager.network,
      managerShort: shortAddress(state.manager.objectId),
      connectedWalletShort,
      poolKey: state.manager.poolKey,
      collateralAsset: 'USDC',
      amountDisplay: 'Unavailable',
      amountAtomic: '0',
      beforeRiskRatio: state.riskRatio,
      liquidationThreshold: state.liquidationRiskRatio,
      targetRiskRatio: state.targetRiskRatio,
      source: state.source === 'deepbook' ? 'deepbook' : 'mock-preview',
      rescueActionability: actionability,
      isExecutable: false,
      buildStatus: 'not-built',
      unsignedTxAvailable: false,
      signingEnabled: false,
      blockedReason: 'No action-needed Add Collateral recommendation is available.',
      capabilityStatus,
      exactDeepBookWriteApi: capabilityStatus === 'verified' ? 'verified' : 'blocked',
      verifiedSdkMethod: capabilityStatus === 'verified' ? 'marginManager.depositQuote' : undefined,
      warnings: getAddCollateralReviewWarnings({ signingEnabled: false }),
    }
  }

  if (poolConfig.status !== 'configured') {
    return blockedReviewModel(shortAddress(state.manager.objectId), poolConfig.message, capabilityStatus, 'unavailable')
  }

  const amountForAtomic = recommendation.addAmountUsdc.toFixed(poolConfig.quoteCoinDecimals)
  const parsedAmount = parseDecimalAmountToAtomic(amountForAtomic, poolConfig.quoteCoinDecimals)
  const blockedReason = parsedAmount.status === 'error' ? parsedAmount.message : undefined

  return {
    action: 'add-collateral',
    network: state.manager.network,
    managerShort: shortAddress(state.manager.objectId),
    connectedWalletShort,
    poolKey: state.manager.poolKey,
    collateralAsset: 'USDC',
    amountDisplay: `${recommendation.addAmountUsdc.toFixed(2)} USDC`,
    amountAtomic: parsedAmount.status === 'success' ? parsedAmount.atomic.toString() : '0',
    estimatedGas: '~0.002 SUI',
    beforeRiskRatio: state.riskRatio,
    afterRiskRatio: recommendation.expectedAfterRiskRatio,
    liquidationThreshold: state.liquidationRiskRatio,
    targetRiskRatio: state.targetRiskRatio,
    source: state.source === 'deepbook' ? 'deepbook' : 'mock-preview',
    rescueActionability: 'action-needed',
    isExecutable: false,
    buildStatus: 'not-built',
    unsignedTxAvailable: false,
    signingEnabled: false,
    blockedReason: blockedReason ?? 'Unsigned PTB is not built in this preview; wallet signing is not enabled by this preview.',
    capabilityStatus,
    exactDeepBookWriteApi: capabilityStatus === 'verified' ? 'verified' : 'blocked',
    verifiedSdkMethod: capabilityStatus === 'verified' ? 'marginManager.depositQuote' : undefined,
    warnings: getAddCollateralReviewWarnings({ signingEnabled: false }),
  }
}

function blockedReviewModel(
  managerShort: string,
  blockedReason: string,
  capabilityStatus: AddCollateralReviewModel['capabilityStatus'],
  actionability: AddCollateralReviewModel['rescueActionability'],
): AddCollateralReviewModel {
  return {
    action: 'add-collateral',
    network: 'mainnet',
    managerShort,
    poolKey: 'SUI_USDC',
    collateralAsset: 'USDC',
    amountDisplay: 'Unavailable',
    amountAtomic: '0',
    source: 'deepbook',
    rescueActionability: actionability,
    isExecutable: false,
    buildStatus: 'blocked',
    unsignedTxAvailable: false,
    signingEnabled: false,
    blockedReason,
    capabilityStatus,
    exactDeepBookWriteApi: capabilityStatus === 'verified' ? 'verified' : 'blocked',
    verifiedSdkMethod: capabilityStatus === 'verified' ? 'marginManager.depositQuote' : undefined,
    warnings: getAddCollateralReviewWarnings({ signingEnabled: false }),
  }
}

export function getAddCollateralReviewWarnings(input: { signingEnabled: boolean }) {
  const executionWarnings = input.signingEnabled
    ? ['Your wallet will open only after explicit confirmation.', 'No transaction has been submitted yet.']
    : ['PTB preview only', 'No wallet prompt from simulated or blocked state', 'Wallet signing not enabled by this preview', 'No transaction has been submitted']

  return [
    ...executionWarnings,
    'Re-read manager state before any future PTB build.',
    'You are depositing USDC into this Margin Manager.',
    'Verify the manager ID before signing.',
    'Ownership is not inferred from the imported manager ID.',
    'MarginGuard does not custody funds and cannot reverse this transaction.',
    'Final transaction details will appear in your wallet.',
  ]
}
