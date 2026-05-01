import { DAppKitProvider } from '@mysten/dapp-kit-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ActiveManagerProvider } from '../components/manager/ActiveManagerProvider'
import { MotionConfigProvider } from '../components/motion/MotionConfigProvider'
import { dAppKit } from '../lib/sui/dappKit'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DAppKitProvider dAppKit={dAppKit}>
        <BrowserRouter>
          <MotionConfigProvider>
            <ActiveManagerProvider>{children}</ActiveManagerProvider>
          </MotionConfigProvider>
        </BrowserRouter>
      </DAppKitProvider>
    </QueryClientProvider>
  )
}
