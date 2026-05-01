import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { modalOverlay, modalPanel } from '../../lib/animation/variants'
import { cn } from '../../lib/utils/cn'

type ModalTransitionProps = {
  children: ReactNode
  className?: string
}

export function ModalOverlay({ children, className }: ModalTransitionProps) {
  return (
    <motion.div
      className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm', className)}
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

export function ModalPanel({ children, className }: ModalTransitionProps) {
  return (
    <motion.div variants={modalPanel} className={cn(className)}>
      {children}
    </motion.div>
  )
}
