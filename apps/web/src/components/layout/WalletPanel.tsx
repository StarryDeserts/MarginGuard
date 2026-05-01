import { useCurrentAccount, useCurrentWallet, useDAppKit, useWalletConnection } from '@mysten/dapp-kit-react'
import { LogOut, Wallet } from 'lucide-react'
import { shortAddress } from '../../lib/utils/address'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { WalletConnectButton } from './WalletConnectButton'

export function WalletPanel() {
  const account = useCurrentAccount()
  const wallet = useCurrentWallet()
  const connection = useWalletConnection()
  const dAppKit = useDAppKit()

  if (connection.isConnecting || connection.isReconnecting) {
    return (
      <Badge variant="info" className="gap-2">
        <Wallet className="h-4 w-4" />
        Connecting Sui Wallet...
      </Badge>
    )
  }

  if (!account) {
    return <WalletConnectButton />
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="info" className="gap-2">
        <Wallet className="h-4 w-4" />
        {wallet?.name ? `${wallet.name}: ` : ''}
        {shortAddress(account.address)}
      </Badge>
      <Button variant="ghost" size="sm" icon={<LogOut className="h-4 w-4" />} onClick={() => void dAppKit.disconnectWallet()}>
        Disconnect
      </Button>
    </div>
  )
}
