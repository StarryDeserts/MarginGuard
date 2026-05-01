import { getRecommendedActionAvailability, type ManagerReadSourceState } from '../../lib/deepbook/readState'
import { ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX } from '../../lib/deepbook/addCollateralCapability'
import { getAddCollateralRecommendation } from '../../lib/risk/rescuePlans'
import { getAddCollateralPreviewGate } from '../../lib/tx/addCollateralPreview'
import { classifyRisk, riskLabels } from '../../lib/risk/thresholds'
import { getDebtDataStatus, getRiskRatioDisplay } from '../../lib/risk/riskRatio'
import { formatPct, formatRatio, formatUsdc } from '../../lib/utils/format'
import type { NormalizedMarginState } from '../../types/margin'
import type { RescueActionability } from '../../types/rescue'

type CardBadge = {
  label: string
  variant: 'recommended' | 'p0' | 'info' | 'neutral'
}

export type RecommendationMetricItem = {
  label: string
  value: string
  subtext?: string
  tone?: 'primary' | 'safe' | 'warning' | 'muted'
}

export type RecommendedRescueActionCardModel = {
  actionability: RescueActionability
  canRecommend: boolean
  cardTone: 'action' | 'healthy' | 'neutral'
  title: string
  heading?: string
  badges: CardBadge[]
  bodyLines: string[]
  metricItems: RecommendationMetricItem[]
  summaryLine?: string
  liquidationDistanceLine?: string
  primaryActionLabel: 'Open Rescue Simulator Preview'
  primaryActionVariant: 'primary' | 'secondary'
  reviewActionLabel: 'Open Transaction Review'
  reviewDisabled: boolean
  reviewDisabledReason?: string
  footerNote: string
}

export function getRecommendedRescueActionCardModel(input: {
  state?: NormalizedMarginState
  sourceLabel?: string
  sourceState?: ManagerReadSourceState
}): RecommendedRescueActionCardModel {
  const sourceLabel = input.sourceLabel ?? 'Unavailable'
  const recommendation = getAddCollateralRecommendation(input.state, input.sourceState)
  const availability = getRecommendedActionAvailability(input.state, input.sourceState)
  const debtDataStatus = getDebtDataStatus(input.state)

  if (availability.actionability === 'action-needed' && recommendation) {
    const previewGate = getAddCollateralPreviewGate({
      actionability: availability.actionability,
      sourceState: input.sourceState,
      walletConnected: Boolean(input.state?.walletAddress),
      managerSelected: Boolean(input.state?.manager),
      networkConfigured: input.sourceState === 'full-deepbook' || input.sourceState === 'partial-deepbook',
      amountAtomic: recommendation.addAmountUsdc > 0 ? 1n : 0n,
      capability: ADD_COLLATERAL_WRITE_CAPABILITY_MATRIX,
    })

    return {
      actionability: availability.actionability,
      canRecommend: true,
      cardTone: 'action',
      title: availability.title,
      heading: 'Add Collateral',
      badges: [
        { label: 'Recommended', variant: 'recommended' },
        { label: 'P0', variant: 'p0' },
      ],
      bodyLines: ['P0 - gated Add Collateral path - requires live DeepBook state, review, acknowledgement, and explicit wallet approval'],
      metricItems: [
        { label: 'Add Amount', value: formatUsdc(recommendation.addAmountUsdc), tone: 'primary' },
        {
          label: 'Before RR',
          value: formatOptionalRatio(input.state?.riskRatio),
          subtext: input.state?.riskRatio === undefined ? 'Unavailable' : riskLabels[classifyRisk(input.state.riskRatio)],
          tone: 'warning',
        },
        {
          label: 'After RR',
          value: formatRatio(recommendation.expectedAfterRiskRatio),
          subtext: riskLabels[classifyRisk(recommendation.expectedAfterRiskRatio)],
          tone: 'safe',
        },
      ],
      summaryLine: `Recommended Action: Add ${formatUsdc(recommendation.addAmountUsdc)} to raise RR to ${formatRatio(
        recommendation.expectedAfterRiskRatio,
      )}.`,
      liquidationDistanceLine: `Liquidation Distance: ${formatPct(recommendation.liquidationDistanceBeforePct)} -> ${formatPct(
        recommendation.liquidationDistanceAfterPct,
      )}`,
      primaryActionLabel: 'Open Rescue Simulator Preview',
      primaryActionVariant: 'primary',
      reviewActionLabel: 'Open Transaction Review',
      reviewDisabled: previewGate.status === 'blocked',
      reviewDisabledReason: previewGate.status === 'blocked' ? previewGate.message : undefined,
      footerNote: `${sourceLabel}. Wallet opens only after review, acknowledgement, and explicit submit.`,
    }
  }

  if (availability.actionability === 'no-rescue-needed') {
    return {
      actionability: availability.actionability,
      canRecommend: false,
      cardTone: 'healthy',
      title: 'No rescue needed',
      badges: [{ label: 'No action required', variant: 'recommended' }],
      bodyLines: ['Current risk ratio is already above the target rescue ratio.', 'No collateral action is required.'],
      metricItems: [
        { label: 'Current RR', value: formatOptionalRatio(input.state?.riskRatio), tone: 'safe' },
        { label: 'Target RR', value: formatOptionalRatio(input.state?.targetRiskRatio), tone: 'primary' },
        { label: 'Liquidation RR', value: formatOptionalRatio(input.state?.liquidationRiskRatio), tone: 'warning' },
      ],
      primaryActionLabel: 'Open Rescue Simulator Preview',
      primaryActionVariant: 'secondary',
      reviewActionLabel: 'Open Transaction Review',
      reviewDisabled: true,
      reviewDisabledReason: 'No PTB preview is needed while the manager is above target.',
      footerNote: 'Rescue Simulator uses labeled real baseline or simulated estimates. No wallet opens from no-rescue state.',
    }
  }

  if (availability.actionability === 'zero-debt') {
    return {
      actionability: availability.actionability,
      canRecommend: false,
      cardTone: 'neutral',
      title: 'No active debt',
      badges: [{ label: 'No debt', variant: 'info' }],
      bodyLines: ['This manager has no borrowed debt, so no pre-liquidation rescue action is required.'],
      metricItems: [
        { label: 'Current RR', value: getRiskRatioDisplay({ riskRatio: input.state?.riskRatio, debtStatus: debtDataStatus }).display, tone: 'safe' },
        { label: 'Target RR', value: formatOptionalRatio(input.state?.targetRiskRatio), tone: 'primary' },
        { label: 'Liquidation RR', value: formatOptionalRatio(input.state?.liquidationRiskRatio), tone: 'warning' },
      ],
      primaryActionLabel: 'Open Rescue Simulator Preview',
      primaryActionVariant: 'secondary',
      reviewActionLabel: 'Open Transaction Review',
      reviewDisabled: true,
      reviewDisabledReason: 'No PTB preview is needed without active borrowed debt.',
      footerNote: 'Rescue Simulator uses labeled real baseline or simulated estimates. No wallet opens without active debt.',
    }
  }

  const insufficientDebtCopy =
    input.sourceState === 'partial-deepbook' && debtDataStatus === 'insufficient-debt-data'
      ? 'Debt fields are unavailable, so MarginGuard cannot prove this is a no-debt manager.'
      : 'Read manager state before computing a rescue action.'

  return {
    actionability: availability.actionability,
    canRecommend: false,
    cardTone: 'neutral',
    title: 'Recommendation unavailable',
    badges: [{ label: 'Unavailable', variant: 'info' }],
    bodyLines: [insufficientDebtCopy],
    metricItems: [],
    primaryActionLabel: 'Open Rescue Simulator Preview',
    primaryActionVariant: 'secondary',
    reviewActionLabel: 'Open Transaction Review',
    reviewDisabled: true,
    reviewDisabledReason: 'Read manager state before previewing a PTB.',
    footerNote: 'Open Rescue Simulator Preview uses simulated fallback values when live manager data is unavailable.',
  }
}

function formatOptionalRatio(value: number | undefined) {
  return value === undefined ? 'Unavailable' : formatRatio(value)
}
