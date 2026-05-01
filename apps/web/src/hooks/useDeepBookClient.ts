import { useCurrentAccount, useCurrentClient } from '@mysten/dapp-kit-react'
import { getDeepBookClientStatus } from '../lib/deepbook/client'
import { createDeepBookClientStatus } from '../lib/deepbook/client'
import { getDeepBookPoolConfig } from '../lib/deepbook/poolKeys'
import { useActiveManager } from './useActiveManager'
import { useCurrentNetwork } from './useCurrentNetwork'

export function useDeepBookClient() {
  const { selectedNetwork } = useCurrentNetwork()
  const { activeManager } = useActiveManager()
  const currentAccount = useCurrentAccount()
  const currentClient = useCurrentClient()
  const poolConfig = getDeepBookPoolConfig(selectedNetwork, activeManager?.poolKey)

  if (!activeManager) {
    return getDeepBookClientStatus(selectedNetwork)
  }

  return createDeepBookClientStatus({
    client: currentClient,
    network: selectedNetwork,
    walletAddress: currentAccount?.address,
    manager: activeManager,
    poolConfig,
  })
}
