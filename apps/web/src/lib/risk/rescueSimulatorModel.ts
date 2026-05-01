import type { ManagerReadSourceState } from '../deepbook/readState'
import type { AppNetwork, NormalizedMarginState } from '../../types/margin'
import type { AddCollateralReviewModel } from '../../types/tx'
import type { RescuePlan } from '../../types/rescue'
import { mockMarginState } from '../demo/mockMarginState'
import { createAddCollateralReviewModel } from '../tx/addCollateralReview'
import { buildRescuePlans, type RescuePlanInputs } from './rescuePlans'
import { createManagerBaseline, toCompletePlanningState, type ManagerBaseline } from './managerBaseline'
import { getRiskRatioDisplay, type RiskRatioDisplayKind } from './riskRatio'

export type RescueSimulatorSourceMode = 'real-full' | 'real-partial' | 'simulated'

export type RescueSimulatorModel = {
  baseline: ManagerBaseline
  sourceMode: RescueSimulatorSourceMode
  sourceBadge: string
  planSourceLabel: 'Real DeepBook baseline' | 'Demo fallback' | 'Simulated what-if'
  statusTitle: 'Action-needed baseline' | 'Healthy baseline' | 'Simulated fallback'
  statusCopy: string
  currentRiskRatioKind: RiskRatioDisplayKind
  currentRiskRatioDisplay: string
  plans: RescuePlan[]
  canOpenAddCollateralReview: boolean
  addCollateralReviewModel?: AddCollateralReviewModel
}

export function createRescueSimulatorModel(input: {
  state?: NormalizedMarginState
  sourceState?: ManagerReadSourceState
  selectedNetwork?: AppNetwork
  inputs?: RescuePlanInputs
}): RescueSimulatorModel {
  const baseline = createManagerBaseline({
    state: input.state,
    sourceState: input.sourceState,
    selectedNetwork: input.selectedNetwork,
  })
  const sourceMode = getSourceMode(baseline)
  const planningState =
    baseline.canUseForRealRescueBaseline && baseline.actionability !== 'zero-debt' && input.state
      ? toCompletePlanningState(input.state)
      : undefined
  const planSourceLabel = planningState ? 'Real DeepBook baseline' : 'Demo fallback'
  const basePlans = buildRescuePlans(planningState ?? mockMarginState, input.inputs)
  const usesRealDisplayBaseline = sourceMode === 'real-full' || sourceMode === 'real-partial'
  const plans =
    usesRealDisplayBaseline && baseline.actionability !== 'action-needed'
      ? downgradeRealBaselinePreviewPlans(basePlans, baseline)
      : basePlans
  const canOpenAddCollateralReview = baseline.canOpenRealAddCollateralReview || baseline.sourceLevel === 'simulated-demo-fallback'
  const addCollateralReviewModel =
    canOpenAddCollateralReview && input.state ? createAddCollateralReviewModel({ state: input.state, sourceState: input.sourceState }) : undefined
  const currentRiskRatio = getRiskRatioDisplay({
    riskRatio: input.state?.riskRatio,
    debtStatus: baseline.debtDataStatus,
  })

  return {
    baseline,
    sourceMode,
    sourceBadge: baseline.sourceLabel,
    planSourceLabel: usesRealDisplayBaseline && !planningState ? 'Simulated what-if' : planSourceLabel,
    statusTitle: getStatusTitle(baseline),
    statusCopy: getStatusCopy(baseline),
    currentRiskRatioKind: currentRiskRatio.kind,
    currentRiskRatioDisplay: currentRiskRatio.display,
    plans,
    canOpenAddCollateralReview,
    addCollateralReviewModel,
  }
}

function downgradeRealBaselinePreviewPlans(plans: RescuePlan[], baseline: ManagerBaseline) {
  const isZeroDebt = baseline.actionability === 'zero-debt'

  return plans.map((plan) => {
    if (plan.type !== 'ADD_COLLATERAL') return plan

    return {
      ...plan,
      recommended: false,
      priority: 'P1' as const,
      priorityDisplayLabel: isZeroDebt ? 'Simulated preview' : 'Preview only',
      subtitle: isZeroDebt ? 'Simulated what-if' : 'Healthy baseline',
      description: isZeroDebt
        ? 'Real manager has no active borrowed debt. This Add Collateral story is simulated only.'
        : 'No urgent Add Collateral action is needed for the current real baseline.',
      label: isZeroDebt ? 'Simulated what-if - no real rescue needed' : 'No rescue needed - what-if estimate only',
      ctaLabel: isZeroDebt ? 'Open simulated preview' : 'What-if preview',
      warnings: isZeroDebt
        ? ['Real manager has no active borrowed debt', 'Simulated what-if only', 'No wallet prompt from no-debt baseline']
        : ['No rescue needed while RR is above target', 'What-if estimate only', 'No wallet prompt from healthy baseline'],
    }
  })
}

function getStatusTitle(baseline: ManagerBaseline): RescueSimulatorModel['statusTitle'] {
  if (baseline.actionability === 'zero-debt' || baseline.actionability === 'no-rescue-needed') return 'Healthy baseline'
  if (baseline.sourceLevel !== 'full-deepbook-baseline') return 'Simulated fallback'
  if (baseline.actionability === 'action-needed') return 'Action-needed baseline'

  return 'Healthy baseline'
}

function getStatusCopy(baseline: ManagerBaseline) {
  if (baseline.actionability === 'zero-debt') {
    return 'No real rescue needed. Real manager has no active borrowed debt. Simulated what-if available.'
  }

  if (baseline.sourceLevel === 'full-deepbook-baseline' && baseline.actionability === 'action-needed') {
    return 'Real DeepBook baseline has enough fields for Add Collateral review eligibility.'
  }

  if (baseline.sourceLevel === 'full-deepbook-baseline') {
    return baseline.reason
  }

  if (baseline.sourceLevel === 'partial-deepbook-baseline') {
    if (baseline.debtDataStatus === 'insufficient-debt-data') {
      return 'Debt fields are unavailable in this partial read; simulated plans stay fallback-only.'
    }

    return 'Partial DeepBook data is shown as display-only; simulated plans stay fallback-only.'
  }

  return 'Using simulated fallback because no eligible real baseline is available.'
}

function getSourceMode(baseline: ManagerBaseline): RescueSimulatorSourceMode {
  if (baseline.sourceLevel === 'full-deepbook-baseline') return 'real-full'
  if (baseline.sourceLevel === 'partial-deepbook-baseline') return 'real-partial'

  return 'simulated'
}
