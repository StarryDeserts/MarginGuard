import { Copy } from 'lucide-react'
import { mockMarginState } from '../../lib/demo/mockMarginState'
import { useActiveManager } from '../../hooks/useActiveManager'
import { useCurrentNetwork } from '../../hooks/useCurrentNetwork'
import { getNetworkLabel } from '../../lib/sui/networks'
import { shortAddress } from '../../lib/utils/address'
import { NetworkBadge } from './NetworkBadge'
import { StatusPill } from './StatusPill'
import { WalletPill } from './WalletPill'

type TopContextBarProps = {
  title: string
}

export function TopContextBar({ title }: TopContextBarProps) {
  const { activeManager } = useActiveManager()
  const networkState = useCurrentNetwork()
  const manager = activeManager ?? mockMarginState.manager

  return (
    <header className="flex flex-col gap-4 border-b border-guard-border bg-guard-bg/80 px-4 py-4 backdrop-blur md:px-6 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-2 text-2xl font-semibold text-text-primary md:text-3xl">{title}</h1>
        <WalletPill />
        <NetworkBadge
          network={networkState.selectedNetwork}
          mismatch={networkState.mismatch}
          showWalletStatus={networkState.walletConnectionStatus !== 'disconnected'}
        />
        <div className="flex items-center gap-2 rounded-lg border border-guard-border px-3 py-2 text-sm text-text-secondary">
          <span>Manager ID:</span>
          <span className="text-text-primary">{shortAddress(manager.objectId)}</span>
          <Copy className="h-4 w-4 text-text-muted" />
        </div>
        <div className="rounded-lg border border-guard-border px-3 py-2 text-sm text-text-secondary">
          Manager network: <span className="text-text-primary">{getNetworkLabel(manager.network)}</span>
        </div>
        <div className="rounded-lg border border-guard-border px-3 py-2 text-sm text-text-secondary">
          Market: <span className="text-text-primary">{mockMarginState.marketLabel}</span>
        </div>
      </div>
      <StatusPill />
    </header>
  )
}
