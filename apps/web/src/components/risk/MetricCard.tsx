import type { ReactNode } from 'react'
import { Card } from '../ui/Card'
import { AnimatedNumber } from '../motion/AnimatedNumber'

type MetricCardProps = {
  label: string
  value?: number
  valueText?: string
  helper: string
  icon: ReactNode
  tone?: 'warning' | 'healthy' | 'info' | 'purple' | 'neutral'
  format?: (value: number) => string
}

const toneClass = {
  warning: 'text-warning-orange',
  healthy: 'text-safe-green',
  info: 'text-sui-cyan',
  purple: 'text-p1-purple',
  neutral: 'text-text-primary',
}

export function MetricCard({ label, value, valueText, helper, icon, tone = 'neutral', format }: MetricCardProps) {
  const displayValue = valueText ?? (value === undefined ? 'Unavailable' : <AnimatedNumber value={value} format={format} />)

  return (
    <Card interactive className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-lg bg-electric-blue/20 p-2 text-sui-cyan">{icon}</span>
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
      <div className={`text-3xl font-semibold ${toneClass[tone]}`}>
        {displayValue}
      </div>
      <p className="mt-2 text-sm text-text-secondary">{helper}</p>
    </Card>
  )
}
