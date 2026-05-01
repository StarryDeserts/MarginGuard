import type { RescuePlan } from '../../types/rescue'
import { RescuePlanCard } from './RescuePlanCard'

type SmartTpslPlanCardProps = {
  plan: RescuePlan
  selected: boolean
  error?: string
  onSelect: () => void
  onReview: () => void
  onAddCollateralChange: (value: number) => void
  onReduceSizeChange: (value: number) => void
  onStopLossChange: (value: number) => void
  onBufferChange: (value: number) => void
}

export function SmartTpslPlanCard(props: SmartTpslPlanCardProps) {
  return <RescuePlanCard {...props} />
}
