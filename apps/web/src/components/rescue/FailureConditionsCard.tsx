import { AlertCircle, Info } from 'lucide-react'
import { Card } from '../ui/Card'

const conditions = ['Stale price', 'Insufficient balance', 'SDK call failure', 'Transaction rejected']

export function FailureConditionsCard() {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">Assumptions & Failure Conditions</h2>
      <ul className="space-y-3">
        {conditions.map((condition) => (
          <li key={condition} className="flex items-center gap-3 text-sm text-text-secondary">
            <AlertCircle className="h-4 w-4 text-danger-red" />
            {condition}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-sui-cyan/40 bg-sui-cyan/10 p-3 text-sm text-text-secondary">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sui-cyan" />
        <span>Estimates update only while app is open. Static preview only in Round 3.</span>
      </div>
    </Card>
  )
}
