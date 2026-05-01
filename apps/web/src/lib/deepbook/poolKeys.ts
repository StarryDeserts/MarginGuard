import type { AppNetwork, SupportedPoolKey } from '../../types/margin'
import { mainnetCoins, mainnetMarginPools, mainnetPools } from '@mysten/deepbook-v3'

export type ConfiguredDeepBookPoolConfig = {
  poolKey: SupportedPoolKey
  displayPair: 'SUI/USDC'
  network: AppNetwork
  status: 'configured'
  sdkPoolKey: 'SUI_USDC'
  baseCoinKey: 'SUI'
  quoteCoinKey: 'USDC'
  baseCoinType: string
  quoteCoinType: string
  baseCoinScalar: number
  quoteCoinScalar: number
  baseCoinDecimals: number
  quoteCoinDecimals: number
  poolId: string
  source: '@mysten/deepbook-v3@1.3.1'
}

export type NotConfiguredDeepBookPoolConfig = {
  poolKey: SupportedPoolKey
  displayPair: 'SUI/USDC'
  network: AppNetwork
  status: 'not-configured'
  message: string
}

export type DeepBookPoolConfig = ConfiguredDeepBookPoolConfig | NotConfiguredDeepBookPoolConfig

const mainnetSuiUsdcPool = mainnetPools.SUI_USDC
const mainnetSuiMarginPool = mainnetMarginPools.SUI
const mainnetUsdcMarginPool = mainnetMarginPools.USDC
const mainnetSuiCoin = mainnetCoins.SUI
const mainnetUsdcCoin = mainnetCoins.USDC

export function normalizePoolKey(input: string | undefined): SupportedPoolKey | null {
  if (input === 'SUI_USDC' || input === 'SUI/USDC') return 'SUI_USDC'

  return null
}

export function getDeepBookPoolConfig(network: AppNetwork, poolKey: string = 'SUI_USDC'): DeepBookPoolConfig {
  const normalizedPoolKey = normalizePoolKey(poolKey)

  if (network === 'mainnet' && normalizedPoolKey === 'SUI_USDC' && mainnetSuiUsdcPool?.address) {
    return {
      poolKey: normalizedPoolKey,
      displayPair: 'SUI/USDC',
      network,
      status: 'configured',
      sdkPoolKey: 'SUI_USDC',
      baseCoinKey: 'SUI',
      quoteCoinKey: 'USDC',
      baseCoinType: mainnetSuiMarginPool.type,
      quoteCoinType: mainnetUsdcMarginPool.type,
      baseCoinScalar: mainnetSuiCoin.scalar,
      quoteCoinScalar: mainnetUsdcCoin.scalar,
      baseCoinDecimals: scalarToDecimals(mainnetSuiCoin.scalar),
      quoteCoinDecimals: scalarToDecimals(mainnetUsdcCoin.scalar),
      poolId: mainnetSuiUsdcPool.address,
      source: '@mysten/deepbook-v3@1.3.1',
    }
  }

  return {
    poolKey: 'SUI_USDC',
    displayPair: 'SUI/USDC',
    network,
    status: 'not-configured',
    message: 'SUI/USDC DeepBook margin pool is not configured for this network from verified SDK constants.',
  }
}

export const getSupportedPoolKey = getDeepBookPoolConfig

function scalarToDecimals(scalar: number) {
  if (!Number.isInteger(scalar) || scalar <= 0) return 0

  let decimals = 0
  let cursor = scalar

  while (cursor > 1 && cursor % 10 === 0) {
    cursor /= 10
    decimals += 1
  }

  return cursor === 1 ? decimals : 0
}
