import type { AppNetwork } from '../../types/margin'
import type { LocalManagerRecord } from '../../lib/storage/localManagers'
import { shortAddress } from '../../lib/utils/format'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

type ManagerSelectorProps = {
  records: LocalManagerRecord[]
  activeManager?: LocalManagerRecord
  onSelect: (objectId: string, network: AppNetwork) => void
  onDelete: (objectId: string, network: AppNetwork) => void
  onClear: () => void
}

export function ManagerSelector({ records, activeManager, onSelect, onDelete, onClear }: ManagerSelectorProps) {
  if (records.length === 0) {
    return <p className="rounded-lg border border-guard-border bg-guard-bg-soft p-4 text-sm text-text-secondary">No saved managers yet.</p>
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-text-secondary">
        Saved manager history
        <Select
          className="mt-2"
          value={activeManager ? `${activeManager.network}:${activeManager.objectId}` : ''}
          onChange={(event) => {
            const [network, objectId] = event.target.value.split(':')
            onSelect(objectId, network as AppNetwork)
          }}
        >
          {records.map((record) => (
            <option key={`${record.network}:${record.objectId}`} value={`${record.network}:${record.objectId}`}>
              {shortAddress(record.objectId)} · {record.network === 'mainnet' ? 'Mainnet' : 'Testnet'} · SUI/USDC
            </option>
          ))}
        </Select>
      </label>
      <div className="flex flex-wrap gap-3">
        {activeManager ? (
          <Button variant="secondary" type="button" onClick={() => onDelete(activeManager.objectId, activeManager.network)}>
            Delete Selected
          </Button>
        ) : null}
        <Button variant="ghost" type="button" onClick={onClear}>
          Clear All
        </Button>
      </div>
    </div>
  )
}
