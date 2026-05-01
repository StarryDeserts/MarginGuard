import { motion, useReducedMotion } from 'motion/react'
import type { MouseEventHandler, ReactNode } from 'react'

type MotionButtonProps = {
  children?: ReactNode
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label'?: string
}

export function MotionButton(props: MotionButtonProps) {
  const reduced = useReducedMotion()

  return (
    <motion.button
      whileHover={props.disabled || reduced ? undefined : { y: -1 }}
      whileTap={props.disabled || reduced ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.14 }}
      className={props.className}
      disabled={props.disabled}
      type={props.type}
      onClick={props.onClick}
      aria-label={props['aria-label']}
    >
      {props.children}
    </motion.button>
  )
}
