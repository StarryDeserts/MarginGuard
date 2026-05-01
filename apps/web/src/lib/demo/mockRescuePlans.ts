import { buildRescuePlans } from '../risk/rescuePlans'
import { mockComputedValues, mockMarginState, mockNumericValues } from './mockMarginState'

export const mockRescuePlans = buildRescuePlans(mockMarginState, {
  addCollateralUsd: mockComputedValues.recommendedAddCollateralUsd,
  reduceSizeDecimal: mockNumericValues.reduceSizeDecimal,
  stopLossUsdc: mockNumericValues.smartTpslStopLossUsdc,
  tpslBufferDecimal: mockComputedValues.smartTpslBufferDecimal,
})

export const recommendedRescuePlan = mockRescuePlans[0]
