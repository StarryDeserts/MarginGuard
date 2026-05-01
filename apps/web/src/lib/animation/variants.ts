import { motionDurations, motionEasing, motionOffsets } from './tokens'

export const pageVariants = {
  initial: { opacity: 0, y: motionOffsets.pageY },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.base, ease: motionEasing.standard },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: motionDurations.fast, ease: motionEasing.exit },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: motionOffsets.revealY, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionDurations.slow, ease: motionEasing.standard },
  },
}

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalPanel = {
  hidden: { opacity: 0, y: motionOffsets.modalY, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.24, ease: motionEasing.standard },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.99,
    transition: { duration: motionDurations.fast, ease: motionEasing.exit },
  },
}
