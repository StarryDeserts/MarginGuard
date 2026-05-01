import { Database, SearchX } from 'lucide-react'
import { Card } from '../ui/Card'

export function ManagerImportEmptyState() {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className="rounded-lg border border-sui-cyan/40 bg-sui-cyan/10 p-3 text-sui-cyan">
          <SearchX className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Manual manager import</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Paste a DeepBook Margin Manager ID to use the risk console. Manager imported manually. No indexer required.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
            <Database className="h-4 w-4" />
            Stored locally in browser storage only.
          </div>
        </div>
      </div>
    </Card>
  )
}
