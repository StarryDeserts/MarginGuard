import { createManagerBaseline } from '../lib/risk/managerBaseline'
import type { AppNetwork } from '../types/margin'
import { useActiveManager } from './useActiveManager'
import { useMarginManagerState } from './useMarginManagerState'

export function useActiveManagerRiskSnapshot() {
  const { activeManager } = useActiveManager()
  const managerState = useMarginManagerState({ mockFallback: false })
  const state = managerState.status === 'success' ? managerState.state : undefined
  const sourceState = managerState.diagnostic.sourceState
  const selectedNetwork: AppNetwork = managerState.diagnostic.selectedNetwork === 'testnet' ? 'testnet' : 'mainnet'
  const baseline = createManagerBaseline({
    state,
    sourceState,
    selectedNetwork,
  })

  return {
    activeManager,
    managerState,
    state,
    sourceState,
    sourceLabel: managerState.sourceState.label,
    selectedNetwork,
    marketLabel: activeManager?.displayPair ?? 'SUI/USDC',
    managerShort: baseline.managerShort,
    baseline,
    refetch: managerState.refetch,
  }
}
