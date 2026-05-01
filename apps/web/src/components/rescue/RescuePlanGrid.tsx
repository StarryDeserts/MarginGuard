import type { RescuePlan } from '../../types/rescue'
import { AddCollateralPlanCard } from './AddCollateralPlanCard'
import { ReduceOnlyPlanCard } from './ReduceOnlyPlanCard'
import { SmartTpslPlanCard } from './SmartTpslPlanCard'

export type RescueInputErrors = Partial<Record<RescuePlan['type'], string>>

type RescuePlanGridProps = {
  plans: RescuePlan[]
  selectedId: string
  inputErrors?: RescueInputErrors
  onReview: () => void
  onSelect: (plan: RescuePlan) => void
  onAddCollateralChange: (value: number) => void
  onReduceSizeChange: (value: number) => void
  onStopLossChange: (value: number) => void
  onBufferChange: (value: number) => void
}

export function RescuePlanGrid({
  plans,
  selectedId,
  inputErrors,
  onReview,
  onSelect,
  onAddCollateralChange,
  onReduceSizeChange,
  onStopLossChange,
  onBufferChange,
}: RescuePlanGridProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {plans.map((plan) => {
        const props = {
          plan,
          selected: plan.id === selectedId,
          error: inputErrors?.[plan.type],
          onSelect: () => onSelect(plan),
          onReview,
          onAddCollateralChange,
          onReduceSizeChange,
          onStopLossChange,
          onBufferChange,
        }

        if (plan.type === 'ADD_COLLATERAL') return <AddCollateralPlanCard key={plan.id} {...props} />
        if (plan.type === 'REDUCE_ONLY_CLOSE') return <ReduceOnlyPlanCard key={plan.id} {...props} />
        return <SmartTpslPlanCard key={plan.id} {...props} />
      })}
    </div>
  )
}
