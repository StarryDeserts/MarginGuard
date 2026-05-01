import { useReducedMotion } from 'motion/react'

export function useReducedMotionSafe() {
  return Boolean(useReducedMotion())
}
