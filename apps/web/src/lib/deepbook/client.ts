import { deepbook } from '@mysten/deepbook-v3'
import type { SuiGrpcClient } from '@mysten/sui/grpc'
import type { AppNetwork, MarginManagerRef } from '../../types/margin'
import type { DepositQuoteCommand } from '../../types/tx'
import type { DeepBookMarginReader } from './managerAdapter'
import type { DeepBookPoolConfig } from './poolKeys'

type DeepBookMarginClient = DeepBookMarginReader & {
  marginManager: {
    depositQuote(params: { managerKey: 'activeManager'; amount: bigint }): DepositQuoteCommand
  }
}

type ExtendableSuiClient = SuiGrpcClient & {
  $extend(registration: ReturnType<typeof deepbook>): { deepbook: DeepBookMarginClient }
}

export type DeepBookClientStatus =
  | {
      status: 'ready'
      network: AppNetwork
      managerKey: 'activeManager'
      sdkDecimalsArgument?: number
      walletAddress: string
      client: SuiGrpcClient
      reader: DeepBookMarginReader
      depositQuote: DeepBookMarginClient['marginManager']['depositQuote']
    }
  | { status: 'disabled'; network: AppNetwork; reason: string }
  | { status: 'not-configured'; network: AppNetwork; message: string }
  | { status: 'error'; network: AppNetwork; message: string }

export function createDeepBookClientStatus(input: {
  client?: SuiGrpcClient
  network: AppNetwork
  walletAddress?: string
  manager?: MarginManagerRef
  poolConfig: DeepBookPoolConfig
}): DeepBookClientStatus {
  if (!input.manager) {
    return { status: 'disabled', network: input.network, reason: 'No manager imported' }
  }

  if (!input.walletAddress) {
    return { status: 'disabled', network: input.network, reason: 'Connect wallet to read DeepBook state. No signing.' }
  }

  if (input.poolConfig.status !== 'configured') {
    return { status: 'not-configured', network: input.network, message: input.poolConfig.message }
  }

  if (!input.client) {
    return { status: 'disabled', network: input.network, reason: 'Sui client is unavailable in this browser session.' }
  }

  if (input.network !== 'mainnet') {
    return {
      status: 'not-configured',
      network: input.network,
      message: 'DeepBook SDK constants are not configured for this network.',
    }
  }

  try {
    const extendedClient = (input.client as ExtendableSuiClient).$extend(
      deepbook({
        address: input.walletAddress,
        marginManagers: {
          activeManager: {
            address: input.manager.objectId,
            poolKey: input.poolConfig.sdkPoolKey,
          },
        },
      }),
    )

    return {
      status: 'ready',
      network: input.network,
      managerKey: 'activeManager',
      sdkDecimalsArgument: undefined,
      walletAddress: input.walletAddress,
      client: input.client,
      reader: extendedClient.deepbook,
      depositQuote: extendedClient.deepbook.marginManager.depositQuote,
    }
  } catch {
    return { status: 'error', network: input.network, message: 'Could not create DeepBook read client.' }
  }
}

export function getDeepBookClientStatus(network: AppNetwork): DeepBookClientStatus {
  return {
    status: 'disabled',
    network,
    reason: 'DeepBook client requires selected manager and connected wallet address.',
  }
}
