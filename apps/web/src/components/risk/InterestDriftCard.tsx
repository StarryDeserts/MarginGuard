import { Clock } from 'lucide-react'
import { mockMarginState } from '../../lib/demo/mockMarginState'
import { formatApr } from '../../lib/utils/format'
import { Card } from '../ui/Card'

export function InterestDriftCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-p1-purple/20 p-2 text-p1-purple">
          <Clock className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-semibold text-text-primary">Interest Drift</h2>
      </div>
      <p className="mt-4 text-3xl font-semibold text-text-primary">{formatApr(mockMarginState.borrowAprDisplayPct)}</p>
      <p className="mt-2 text-sm text-text-secondary">Risk ratio may decline over time.</p>
    </Card>
  )
}
