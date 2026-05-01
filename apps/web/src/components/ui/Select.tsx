import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'focus-ring min-h-11 w-full rounded-lg border border-guard-border bg-guard-bg-soft px-3 text-sm text-text-primary transition-colors focus:border-sui-cyan',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
