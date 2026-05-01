import { describe, expect, it } from 'vitest'
import { DEEPBOOK_CAPABILITY_MATRIX, getDeepBookCapability } from './capabilities'

describe('DeepBook capability matrix', () => {
  it('documents verified installed package capabilities', () => {
    expect(DEEPBOOK_CAPABILITY_MATRIX.packageInstalled).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.exportsDeepbookClientExtension).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.canExtendSuiGrpcClient).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.canReadBalanceManagerBalances).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.canReadAssetBalances).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.canReadDebtValues).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.canReadRiskRatioDirectly).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.canReadLiquidationThresholdDirectly).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.canReadBorrowAprDirectly).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.canReadProtocolPriceDirectly).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.canProduceFullNormalizedMarginState).toBe('full')
    expect(DEEPBOOK_CAPABILITY_MATRIX.requiresConnectedWalletAddressForRead).toBe('yes')
    expect(DEEPBOOK_CAPABILITY_MATRIX.requiresBalanceManagersConfig).toBe('no')
  })

  it('summarizes full read capability from the matrix', () => {
    expect(getDeepBookCapability(DEEPBOOK_CAPABILITY_MATRIX)).toBe('full')
  })
})
