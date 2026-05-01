import { useCurrentNetwork as useDAppKitCurrentNetwork, useDAppKit, useWalletConnection } from '@mysten/dapp-kit-react'
import { useEffect } from 'react'
import { useActiveManager } from './useActiveManager'
import { getNetworkMismatchState, isAppNetwork, normalizeNetwork } from '../lib/sui/networks'

export function useCurrentNetwork() {
  const { activeManager, network, setNetwork } = useActiveManager()
  const dAppKit = useDAppKit()
  const dAppNetwork = useDAppKitCurrentNetwork()
  const connection = useWalletConnection()

  useEffect(() => {
    if (isAppNetwork(dAppNetwork) && dAppNetwork !== network) {
      dAppKit.switchNetwork(network)
    }
  }, [dAppKit, dAppNetwork, network])

  return {
    selectedNetwork: network,
    managerNetwork: activeManager?.network,
    dAppNetwork: normalizeNetwork(dAppNetwork),
    walletNetwork: undefined,
    walletNetworkVerified: false,
    walletConnectionStatus: connection.status,
    mismatch: getNetworkMismatchState(network),
    setSelectedNetwork: setNetwork,
  }
}
