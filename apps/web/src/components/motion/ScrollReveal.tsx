import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'
import { motionDurations, motionEasing } from '../../lib/animation/tokens'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

export function ScrollReveal({ children, className, delay = 0, y = 28 }: ScrollRevealProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: reduced ? 0 : motionDurations.slow,
        delay: reduced ? 0 : delay,
        ease: motionEasing.standard,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
