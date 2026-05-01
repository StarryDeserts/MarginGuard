import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopContextBar } from './TopContextBar'

type AppShellProps = {
  title: string
  children: ReactNode
}

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-guard-bg text-text-primary md:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopContextBar title={title} />
        <main className="mx-auto max-w-[1780px] px-4 py-5 md:px-6">{children}</main>
      </div>
    </div>
  )
}
