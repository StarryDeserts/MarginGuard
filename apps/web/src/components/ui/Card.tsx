import type { MouseEventHandler, ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'
import { MotionCard } from '../motion/MotionCard'

type CardProps = {
  children: ReactNode
  className?: string
  interactive?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
}

export function Card({ children, className, interactive = false, onClick }: CardProps) {
  const cardClassName = cn(
    'rounded-card border border-guard-border bg-guard-surface/78 shadow-[0_18px_55px_rgba(0,0,0,0.22)]',
    interactive && 'transition-colors hover:border-sui-cyan/70',
    className,
  )

  if (interactive) {
    return (
      <MotionCard className={cardClassName} onClick={onClick}>
        {children}
      </MotionCard>
    )
  }

  return (
    <div className={cardClassName} onClick={onClick}>
      {children}
    </div>
  )
}
