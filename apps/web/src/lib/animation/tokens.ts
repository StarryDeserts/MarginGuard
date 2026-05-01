export const motionDurations = {
  instant: 0.08,
  fast: 0.16,
  base: 0.28,
  slow: 0.45,
  slower: 0.7,
} as const

export const motionEasing = {
  standard: [0.21, 0.47, 0.32, 0.98],
  emphasized: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
  linear: [0, 0, 1, 1],
} as const

export const motionOffsets = {
  revealY: 20,
  revealYLarge: 40,
  cardLift: -2,
  modalY: 16,
  pageY: 12,
} as const

export const viewportDefaults = {
  once: true,
  margin: '-80px',
} as const
