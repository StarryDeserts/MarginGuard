import { useState } from 'react'
import { useCurrentAccount, useCurrentClient, useDAppKit } from '@mysten/dapp-kit-react'
import type { AddCollateralExecutionState, AddCollateralReviewModel } from '../types/tx'
import {
  isExecutionPending,
  isLiveAddCollateralEnabled,
  retryAddCollateralManagerRefresh,
  runAddCollateralExecution,
  type ExecutionManagerRead,
} from '../lib/tx/addCollateralExecution'
import { buildAddCollateralTx } from '../lib/tx/buildAddCollateralTx'
import { useCurrentNetwork } from './useCurrentNetwork'
import { useDeepBookClient } from './useDeepBookClient'

type UseAddCollateralExecutionInput = {
  rereadManagerState: () => Promise<ExecutionManagerRead>
  refreshManagerState: () => Promise<ExecutionManagerRead>
}

const resultStatuses: AddCollateralExecutionState['status'][] = [
  'submitted',
  'confirming',
  'confirmed',
  'refreshing-manager',
  'refreshed',
  'refresh-failed',
  'rejected',
  'failed',
]

export function useAddCollateralExecution(input: UseAddCollateralExecutionInput) {
  const [state, setState] = useState<AddCollateralExecutionState>({ status: 'idle' })
  const [resultOpen, setResultOpen] = useState(false)
  const currentAccount = useCurrentAccount()
  const currentClient = useCurrentClient()
  const dAppKit = useDAppKit()
  const { selectedNetwork, dAppNetwork } = useCurrentNetwork()
  const deepBookClient = useDeepBookClient()

  async function execute(reviewModel: AddCollateralReviewModel | undefined, acknowledged: boolean) {
    setResultOpen(false)

    const finalState = await runAddCollateralExecution(
      {
        reviewModel,
        acknowledged,
        liveEnabled: isLiveAddCollateralEnabled(),
        walletConnected: Boolean(currentAccount?.address),
        walletAddress: currentAccount?.address,
        selectedNetwork,
        walletNetwork: dAppNetwork,
        depositQuote: deepBookClient.status === 'ready' ? deepBookClient.depositQuote : undefined,
      },
      {
        rereadManagerState: input.rereadManagerState,
        buildTx: buildAddCollateralTx,
        submitUnsignedTransaction: (transaction) => dAppKit.signAndExecuteTransaction({ transaction }),
        waitForTransaction: (digest) => currentClient.waitForTransaction({ digest }),
        refreshManagerState: input.refreshManagerState,
        onState: (nextState) => {
          setState(nextState)
          if (resultStatuses.includes(nextState.status)) {
            setResultOpen(true)
          }
        },
      },
    )

    if (resultStatuses.includes(finalState.status)) {
      setResultOpen(true)
    }
  }

  function closeResult() {
    setResultOpen(false)
    if (!isExecutionPending(state)) {
      setState({ status: 'idle' })
    }
  }

  function reset() {
    setState({ status: 'idle' })
    setResultOpen(false)
  }

  async function retryRefresh() {
    if (state.status !== 'refresh-failed') return

    const nextState = await retryAddCollateralManagerRefresh(state, {
      refreshManagerState: input.refreshManagerState,
      onState: setState,
    })

    if (resultStatuses.includes(nextState.status)) {
      setResultOpen(true)
    }
  }

  return {
    state,
    resultOpen,
    execute,
    retryRefresh,
    closeResult,
    reset,
    pending: isExecutionPending(state),
  }
}
