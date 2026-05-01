import { useContext } from 'react'
import { ActiveManagerContext } from './activeManagerContext'

export function useActiveManager() {
  const value = useContext(ActiveManagerContext)

  if (!value) {
    throw new Error('useActiveManager must be used within ActiveManagerProvider')
  }

  return value
}
