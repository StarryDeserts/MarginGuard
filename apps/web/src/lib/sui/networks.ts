import type { AppNetwork } from '../../types/margin'

export type SuiNetworkConfig = {
  network: AppNetwork
  label: string
  grpcUrl: string
}

export type NetworkMismatchState =
  | { status: 'unknown'; message: 'Wallet network not verified' }
  | { status: 'match' }
  | { status: 'mismatch'; message: string }

export const SUI_NETWORK_NAMES: AppNetwork[] = ['mainnet', 'testnet']

const SUI_NETWORK_CONFIGS: Record<AppNetwork, SuiNetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    label: 'Mainnet',
    grpcUrl: 'https://fullnode.mainnet.sui.io:443',
  },
  testnet: {
    network: 'testnet',
    label: 'Testnet',
    grpcUrl: 'https://fullnode.testnet.sui.io:443',
  },
}

export function isAppNetwork(value: unknown): value is AppNetwork {
  return value === 'mainnet' || value === 'testnet'
}

export function normalizeNetwork(value: unknown, fallback: AppNetwork = 'mainnet'): AppNetwork {
  return isAppNetwork(value) ? value : fallback
}

export function getNetworkLabel(network: AppNetwork) {
  return SUI_NETWORK_CONFIGS[network].label
}

export function getSuiNetworkConfig(network: AppNetwork) {
  return SUI_NETWORK_CONFIGS[network]
}

export function getNetworkMismatchState(
  selectedNetwork: AppNetwork,
  walletNetwork?: unknown,
): NetworkMismatchState {
  if (!isAppNetwork(walletNetwork)) {
    return { status: 'unknown', message: 'Wallet network not verified' }
  }

  if (selectedNetwork === walletNetwork) {
    return { status: 'match' }
  }

  return {
    status: 'mismatch',
    message: `Wallet network ${getNetworkLabel(walletNetwork)} differs from selected app network ${getNetworkLabel(selectedNetwork)}`,
  }
}
