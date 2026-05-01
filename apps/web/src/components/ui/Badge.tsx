import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'
import type { RiskLevel } from '../../types/risk'

type BadgeVariant = RiskLevel | 'p0' | 'p1' | 'recommended' | 'info' | 'neutral'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  healthy: 'border-safe-green/60 bg-safe-green/15 text-safe-green',
  guarded: 'border-guarded-blue/60 bg-guarded-blue/15 text-guarded-blue',
  caution: 'border-caution-yellow/60 bg-caution-yellow/15 text-caution-yellow',
  warning: 'border-warning-orange/60 bg-warning-orange/15 text-warning-orange',
  liquidatable: 'border-danger-red/70 bg-danger-red/15 text-danger-red',
  p0: 'border-safe-green/60 bg-safe-green/15 text-safe-green',
  p1: 'border-p1-purple/60 bg-p1-purple/15 text-purple-200',
  recommended: 'border-safe-green/60 bg-safe-green/15 text-safe-green',
  info: 'border-sui-cyan/60 bg-sui-cyan/15 text-sui-cyan',
  neutral: 'border-guard-border bg-white/5 text-text-secondary',
}

export function Badge({ children, className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex min-h-7 items-center rounded-md border px-2.5 text-xs font-semibold', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  )
}
