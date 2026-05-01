import type { ReactNode } from 'react'
import { ActiveManagerContext } from '../../hooks/activeManagerContext'
import { useLocalManagers } from '../../hooks/useLocalManagers'

export function ActiveManagerProvider({ children }: { children: ReactNode }) {
  const value = useLocalManagers()

  return <ActiveManagerContext.Provider value={value}>{children}</ActiveManagerContext.Provider>
}
