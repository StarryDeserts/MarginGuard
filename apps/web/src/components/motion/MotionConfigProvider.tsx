import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { motionDurations, motionEasing } from '../../lib/animation/tokens'

type MotionConfigProviderProps = {
  children: ReactNode
}

export function MotionConfigProvider({ children }: MotionConfigProviderProps) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: motionDurations.base,
        ease: motionEasing.standard,
      }}
    >
      {children}
    </MotionConfig>
  )
}
