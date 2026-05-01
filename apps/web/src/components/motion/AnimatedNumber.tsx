import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { motionEasing } from '../../lib/animation/tokens'

type AnimatedNumberProps = {
  value: number
  className?: string
  format?: (value: number) => string
}

export function AnimatedNumber({ value, className, format = (latest) => latest.toFixed(2) }: AnimatedNumberProps) {
  const reduced = useReducedMotion()
  const motionValue = useMotionValue(value)
  const display = useTransform(motionValue, (latest) => format(latest))

  useEffect(() => {
    if (reduced) {
      motionValue.set(value)
      return undefined
    }

    const controls = animate(motionValue, value, {
      duration: 0.45,
      ease: motionEasing.standard,
    })

    return controls.stop
  }, [format, motionValue, reduced, value])

  return <motion.span className={className}>{display}</motion.span>
}
