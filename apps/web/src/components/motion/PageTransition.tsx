import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { pageVariants } from '../../lib/animation/variants'

type PageTransitionProps = {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}
