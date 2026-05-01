import { motionDurations, motionEasing } from './tokens'

export const baseTransition = {
  duration: motionDurations.base,
  ease: motionEasing.standard,
}

export const fastTransition = {
  duration: motionDurations.fast,
  ease: motionEasing.standard,
}

export const exitTransition = {
  duration: motionDurations.fast,
  ease: motionEasing.exit,
}
