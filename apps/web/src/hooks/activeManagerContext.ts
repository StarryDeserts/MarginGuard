import { createContext } from 'react'
import type { useLocalManagers } from './useLocalManagers'

export type ActiveManagerContextValue = ReturnType<typeof useLocalManagers>

export const ActiveManagerContext = createContext<ActiveManagerContextValue | null>(null)
