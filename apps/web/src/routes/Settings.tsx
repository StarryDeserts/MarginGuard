import { AppShell } from '../components/layout/AppShell'
import { ManagerImportEmptyState } from '../components/manager/ManagerImportEmptyState'
import { ManagerInput } from '../components/manager/ManagerInput'
import { ManagerSelector } from '../components/manager/ManagerSelector'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Select } from '../components/ui/Select'
import { WalletPanel } from '../components/layout/WalletPanel'
import { useActiveManager } from '../hooks/useActiveManager'
import { useCurrentNetwork } from '../hooks/useCurrentNetwork'
import { getDeepBookPoolConfig } from '../lib/deepbook/poolKeys'
import { getNetworkLabel } from '../lib/sui/networks'

export function Settings() {
  const managers = useActiveManager()
  const networkState = useCurrentNetwork()
  const poolConfig = getDeepBookPoolConfig(networkState.selectedNetwork, managers.activeManager?.poolKey)

  return (
    <AppShell title="Settings">
      <div className="grid gap-5 xl:grid-cols-[28rem_1fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Manager Import</h2>
            <ManagerInput network={networkState.selectedNetwork} onNetworkChange={networkState.setSelectedNetwork} onSave={managers.save} />
          </Card>
          <ManagerImportEmptyState />
        </div>
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Local Manager History</h2>
            <ManagerSelector
              records={managers.records}
              activeManager={managers.activeManager}
              onSelect={managers.select}
              onDelete={managers.remove}
              onClear={managers.clear}
            />
            <p className="mt-4 text-sm text-text-secondary">Manager imported manually. No indexer required.</p>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Network</h2>
            <label className="block text-sm font-medium text-text-secondary">
              Selected app network
              <Select
                className="mt-2"
                value={networkState.selectedNetwork}
                onChange={(event) => networkState.setSelectedNetwork(event.target.value as 'mainnet' | 'testnet')}
              >
                <option value="mainnet">Mainnet</option>
                <option value="testnet">Testnet</option>
              </Select>
            </label>
            <div className="mt-4 grid gap-2 text-sm text-text-secondary">
              <p>
                Manager record network:{' '}
                <span className="font-medium text-text-primary">
                  {managers.activeManager ? getNetworkLabel(managers.activeManager.network) : 'No saved manager selected'}
                </span>
              </p>
              <p>
                Wallet network:{' '}
                <span className="font-medium text-text-primary">
                  {networkState.walletNetwork ? getNetworkLabel(networkState.walletNetwork) : 'Wallet network not verified'}
                </span>
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-guard-border bg-guard-bg-soft p-3 text-sm text-text-secondary">
              {poolConfig.status === 'configured'
                ? 'Verified SUI/USDC DeepBook Margin config is available for Mainnet in this build.'
                : 'Testnet SUI/USDC is not configured from verified SDK constants.'}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="neutral">No backend</Badge>
              <Badge variant="neutral">No indexer</Badge>
              <Badge variant="neutral">No keeper</Badge>
              <Badge variant="info">Read-only manager state</Badge>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Wallet Connection</h2>
            <WalletPanel />
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Wallet connection is real. Manager ownership is not inferred; the read adapter uses the connected address only because the SDK requires an address for read options.
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-semibold text-text-primary">Round 5A Scope</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              This frontend validates read-only DeepBook manager state. Transaction Review remains a static preview, no wallet opens for signing, and no Add Collateral PTB is built in this round.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
