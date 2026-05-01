import { createDAppKit } from '@mysten/dapp-kit-react'
import { SuiGrpcClient } from '@mysten/sui/grpc'
import { readLastNetwork } from '../storage/localManagers'
import { getSuiNetworkConfig, SUI_NETWORK_NAMES } from './networks'

export const dAppKit = createDAppKit({
  networks: SUI_NETWORK_NAMES,
  defaultNetwork: readLastNetwork(),
  createClient: (network) => {
    const config = getSuiNetworkConfig(network)

    return new SuiGrpcClient({ network, baseUrl: config.grpcUrl })
  },
})

declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof dAppKit
  }
}
