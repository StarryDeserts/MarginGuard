import { useCurrentAccount, useCurrentWallet, useWalletConnection } from '@mysten/dapp-kit-react'
import { Wallet } from 'lucide-react'
import { shortAddress } from '../../lib/utils/address'
import { Badge } from '../ui/Badge'
import { WalletConnectButton } from './WalletConnectButton'

export function WalletPill() {
  const account = useCurrentAccount()
  const wallet = useCurrentWallet()
  const connection = useWalletConnection()

  if (connection.isConnecting || connection.isReconnecting) {
    return (
      <Badge variant="info" className="gap-2">
        <Wallet className="h-4 w-4" />
        Connecting...
      </Badge>
    )
  }

  if (!account) {
    return <WalletConnectButton />
  }

  return (
    <Badge variant="info" className="gap-2">
      <Wallet className="h-4 w-4" />
      {wallet?.name ? `${wallet.name}: ` : ''}
      {shortAddress(account.address)}
    </Badge>
  )
}
