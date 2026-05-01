import { Info } from 'lucide-react'
import { Card } from '../ui/Card'

const notes = [
  'Demo values are simulated for presentation',
  'No backend',
  'No custom indexer',
  'No keeper bot',
  'Estimates update only while the app is open',
  'Live Add Collateral is safety-gated and disabled by default',
]

export function DemoNotesCard() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-semibold text-text-primary">Demo Notes / Constraints</h2>
        <Info className="h-4 w-4 text-sui-cyan" />
      </div>
      <ul className="grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
        {notes.map((note) => (
          <li key={note} className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sui-cyan" />
            {note}
          </li>
        ))}
      </ul>
    </Card>
  )
}
