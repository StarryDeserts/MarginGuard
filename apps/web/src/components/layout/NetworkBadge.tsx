import { Badge } from '../ui/Badge'
import type { AppNetwork } from '../../types/margin'
import { getNetworkLabel, type NetworkMismatchState } from '../../lib/sui/networks'

type NetworkBadgeProps = {
  network?: AppNetwork
  mismatch?: NetworkMismatchState
  showWalletStatus?: boolean
}

export function NetworkBadge({ network = 'mainnet', mismatch, showWalletStatus = false }: NetworkBadgeProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge variant="healthy" className="gap-2">
        <span className="h-2 w-2 rounded-full bg-safe-green" />
        App network: {getNetworkLabel(network)}
      </Badge>
      {mismatch?.status === 'mismatch' ? <Badge variant="warning">{mismatch.message}</Badge> : null}
      {showWalletStatus && mismatch?.status === 'unknown' ? <Badge variant="neutral">{mismatch.message}</Badge> : null}
    </span>
  )
}
