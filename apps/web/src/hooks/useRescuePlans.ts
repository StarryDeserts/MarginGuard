import { buildRescuePlans, type RescuePlanInputs } from '../lib/risk/rescuePlans'
import type { CompleteNormalizedMarginState } from '../types/margin'

export function useRescuePlans(state: CompleteNormalizedMarginState, inputs: RescuePlanInputs = {}) {
  return buildRescuePlans(state, inputs)
}
