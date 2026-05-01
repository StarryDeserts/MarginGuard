import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export function Input({ className, error = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'focus-ring min-h-11 w-full rounded-lg border bg-guard-bg-soft px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors',
        error ? 'border-danger-red' : 'border-guard-border focus:border-sui-cyan',
        className,
      )}
      {...props}
    />
  )
}
