import { useState } from 'react'
import type { TransactionReviewState } from '../types/rescue'
import type { AddCollateralReviewModel } from '../types/tx'

const initialState: TransactionReviewState = {
  open: false,
  resultOpen: false,
  acknowledged: false,
  signing: false,
}

export function useTransactionReview() {
  const [state, setState] = useState(initialState)

  function openReview(reviewModel?: AddCollateralReviewModel) {
    setState({ ...initialState, open: true, reviewModel })
  }

  function closeReview() {
    setState((current) => ({ ...current, open: false, acknowledged: false, signing: false, reviewModel: undefined }))
  }

  function closeResult() {
    setState(initialState)
  }

  function setAcknowledged(acknowledged: boolean) {
    setState((current) => ({ ...current, acknowledged }))
  }

  function submitMock() {
    setState((current) => ({ ...current, signing: true }))
    window.setTimeout(() => {
      setState({ ...initialState, resultOpen: true })
    }, 650)
  }

  return {
    ...state,
    openReview,
    closeReview,
    closeResult,
    setAcknowledged,
    submitMock,
  }
}
