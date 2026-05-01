export type DeepBookReadCapability = 'full' | 'partial' | 'disabled'
export type CapabilityBoolean = 'yes' | 'no'
export type CapabilityUnknown = CapabilityBoolean | 'unknown'

export type DeepBookCapabilityMatrix = {
  packageInstalled: CapabilityBoolean
  exportsDeepbookClientExtension: CapabilityBoolean
  canExtendSuiGrpcClient: CapabilityBoolean
  canReadBalanceManagerBalances: CapabilityBoolean
  canReadAssetBalances: CapabilityBoolean
  canReadDebtValues: CapabilityBoolean
  canReadRiskRatioDirectly: CapabilityBoolean
  canReadLiquidationThresholdDirectly: CapabilityBoolean
  canReadBorrowAprDirectly: CapabilityBoolean
  canReadProtocolPriceDirectly: CapabilityBoolean
  canProduceFullNormalizedMarginState: DeepBookReadCapability
  requiresConnectedWalletAddressForRead: CapabilityUnknown
  requiresBalanceManagersConfig: CapabilityUnknown
}

// Verified from @mysten/deepbook-v3@1.3.1 installed types on 2026-04-27:
// - dist/client.d.mts exports deepbook(), DeepBookClient, getMarginManagerState(),
//   getLiquidationRiskRatio(), getTargetLiquidationRiskRatio(), getMarginPoolInterestRate(), and midPrice().
// - dist/types/index.d.mts exports MarginManagerState with riskRatio, assets, debts, and Pyth price fields.
// - DeepBookOptions requires address and marginManagers config for manager-key lookup.
// The SDK performs read-only simulations internally; MarginGuard does not build/sign/submit transactions in Round 4.
export const DEEPBOOK_CAPABILITY_MATRIX: DeepBookCapabilityMatrix = {
  packageInstalled: 'yes',
  exportsDeepbookClientExtension: 'yes',
  canExtendSuiGrpcClient: 'yes',
  canReadBalanceManagerBalances: 'yes',
  canReadAssetBalances: 'yes',
  canReadDebtValues: 'yes',
  canReadRiskRatioDirectly: 'yes',
  canReadLiquidationThresholdDirectly: 'yes',
  canReadBorrowAprDirectly: 'yes',
  canReadProtocolPriceDirectly: 'yes',
  canProduceFullNormalizedMarginState: 'full',
  requiresConnectedWalletAddressForRead: 'yes',
  requiresBalanceManagersConfig: 'no',
}

export function getDeepBookCapability(matrix: DeepBookCapabilityMatrix): DeepBookReadCapability {
  return matrix.canProduceFullNormalizedMarginState
}
