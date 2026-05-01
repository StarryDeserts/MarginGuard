import type { ReactNode } from 'react'

type MarketingShellProps = {
  children: ReactNode
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-guard-bg text-text-primary">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:80px_80px] opacity-25" />
      <div className="relative">{children}</div>
    </div>
  )
}
