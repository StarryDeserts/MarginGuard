import type { ManagerReadSourceState } from '../deepbook/readState'
import type { RescueActionability } from '../../types/rescue'
import type { AddCollateralCapabilityMatrix, AddCollateralPreviewGate } from '../../types/tx'
import { ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX, isAddCollateralPreviewSupported } from '../deepbook/addCollateralCapability'

export type AddCollateralPreviewGateInput = {
  actionability: RescueActionability
  sourceState?: ManagerReadSourceState
  walletConnected: boolean
  managerSelected: boolean
  networkConfigured: boolean
  amountAtomic?: bigint
  capability?: AddCollateralCapabilityMatrix
}

export function getAddCollateralPreviewGate(input: AddCollateralPreviewGateInput): AddCollateralPreviewGate {
  if (!input.managerSelected) {
    return { status: 'blocked', reason: 'no-manager', message: 'Import a manager before preparing a PTB preview.' }
  }

  if (!input.walletConnected) {
    return { status: 'blocked', reason: 'no-wallet', message: 'Connect wallet to prepare a PTB preview.' }
  }

  if (!input.networkConfigured) {
    return { status: 'blocked', reason: 'network-not-configured', message: 'Network is not configured for Add Collateral preview.' }
  }

  const capability = input.capability ?? ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX

  if (!isAddCollateralPreviewSupported(capability)) {
    return { status: 'blocked', reason: 'capability-blocked', message: 'Add Collateral PTB API not verified yet.' }
  }

  if (input.sourceState === 'read-error' || input.actionability === 'read-error') {
    return { status: 'blocked', reason: 'read-error', message: 'Read manager state before preparing a PTB.' }
  }

  if (input.actionability === 'zero-debt') {
    return { status: 'blocked', reason: 'zero-debt', message: 'No PTB preview is needed without active borrowed debt.' }
  }

  if (input.actionability === 'no-rescue-needed') {
    return { status: 'blocked', reason: 'no-rescue-needed', message: 'No rescue needed while RR is above target.' }
  }

  if (input.actionability === 'unavailable' || input.sourceState === 'unavailable') {
    return { status: 'blocked', reason: 'unavailable', message: 'Read manager state before preparing a PTB.' }
  }

  if (input.amountAtomic === undefined || input.amountAtomic <= 0n) {
    return { status: 'blocked', reason: 'amount-non-positive', message: 'Add Collateral amount must be greater than zero.' }
  }

  return { status: 'enabled' }
}
