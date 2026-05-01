import { motion, useReducedMotion } from 'motion/react'
import type { MouseEventHandler, ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

type MotionCardProps = {
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
}

export function MotionCard({ className, children, onClick }: MotionCardProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -2 }}
      transition={{ duration: 0.16 }}
      className={cn(className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
