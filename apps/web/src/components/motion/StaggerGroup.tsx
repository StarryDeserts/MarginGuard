import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { staggerContainer, staggerItem } from '../../lib/animation/variants'
import { cn } from '../../lib/utils/cn'

type StaggerGroupProps = {
  children: ReactNode
  className?: string
}

export function StaggerGroup({ children, className }: StaggerGroupProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItem} className={cn(className)}>
      {children}
    </motion.div>
  )
}
