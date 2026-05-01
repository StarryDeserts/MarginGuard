import { Copy, Info } from 'lucide-react'
import { useActiveManager } from '../../hooks/useActiveManager'
import { useCurrentNetwork } from '../../hooks/useCurrentNetwork'
import { getNetworkLabel } from '../../lib/sui/networks'
import { shortAddress } from '../../lib/utils/address'
import { Card } from '../ui/Card'

type ManagerContextCardProps = {
  readStatusLabel?: string
}

export function ManagerContextCard({ readStatusLabel = 'Unavailable' }: ManagerContextCardProps) {
  const { activeManager } = useActiveManager()
  const networkState = useCurrentNetwork()
  const manager = activeManager

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text-primary">Manager Context</h2>
        <span className="rounded-full bg-safe-green/15 px-3 py-1 text-sm font-semibold text-safe-green">
          {manager ? 'Imported' : 'Not imported'}
        </span>
      </div>
      <div className="space-y-3 text-sm">
        {[
          ['Imported Margin Manager ID', manager ? shortAddress(manager.objectId) : 'Unavailable'],
          ['Protocol', 'DeepBook Margin'],
          ['Market', 'SUI/USDC'],
          ['Selected App Network', getNetworkLabel(networkState.selectedNetwork)],
          ['Manager Record Network', manager ? getNetworkLabel(manager.network) : 'Unavailable'],
          ['Wallet Network', networkState.walletNetwork ? getNetworkLabel(networkState.walletNetwork) : 'Wallet network not verified'],
          ['Read Source', readStatusLabel],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-guard-border pb-3">
            <span className="text-text-secondary">{label}</span>
            <span className="flex items-center gap-2 text-right font-medium text-text-primary">
              {value}
              {label.includes('ID') ? <Copy className="h-4 w-4 text-text-muted" /> : null}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-sui-cyan/40 bg-sui-cyan/10 p-3 text-sm text-text-secondary">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sui-cyan" />
        <span>Manager imported manually. No indexer required. Ownership is not inferred from the imported object ID.</span>
      </div>
    </Card>
  )
}
