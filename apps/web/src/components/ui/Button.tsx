import type { MouseEventHandler, ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'
import { MotionButton } from '../motion/MotionButton'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

type ButtonProps = {
  children?: ReactNode
  className?: string
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-electric-blue bg-electric-blue text-white shadow-[0_0_22px_rgba(18,102,255,0.35)] hover:bg-blue-500',
  secondary: 'border-guard-border-strong bg-guard-surface/80 text-text-primary hover:border-sui-cyan hover:text-sui-cyan',
  ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary',
  danger: 'border-danger-red/70 bg-danger-red/15 text-red-200 hover:bg-danger-red/25',
}

const sizeClasses = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-13 px-6 text-base',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  return (
    <MotionButton
      className={cn(
        'focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border font-semibold transition-colors disabled:cursor-not-allowed disabled:border-guard-border disabled:bg-white/5 disabled:text-text-muted',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
    >
      {icon}
      {loading ? 'Mock signing...' : children}
    </MotionButton>
  )
}
