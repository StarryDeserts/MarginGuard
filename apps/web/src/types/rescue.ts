import type { AddCollateralReviewModel } from './tx'

export type RescueActionType = 'ADD_COLLATERAL' | 'REDUCE_ONLY_CLOSE' | 'SMART_TPSL'

export type RescueExecutionMode = 'real-ptb-path-preview' | 'p1-sdk-required-preview' | 'static-preview'

export type RescueActionability = 'action-needed' | 'no-rescue-needed' | 'zero-debt' | 'unavailable' | 'read-error'

export type RescuePlan = {
  id: string
  type: RescueActionType
  title: string
  subtitle: string
  description: string
  beforeRiskRatio: number
  expectedAfterRiskRatio: number
  targetRiskRatio: number
  liquidationDistanceBeforePct: number
  liquidationDistanceAfterPct: number
  estimatedGasSui: number
  estimatedCostUsd?: number
  recommended: boolean
  priority: 'P0' | 'P1'
  executionMode: RescueExecutionMode
  label: string
  ctaLabel: string
  warnings: string[]
  params: Record<string, string | number | boolean>
}

export type TransactionReviewState = {
  open: boolean
  resultOpen: boolean
  acknowledged: boolean
  signing: boolean
  reviewModel?: AddCollateralReviewModel
}
