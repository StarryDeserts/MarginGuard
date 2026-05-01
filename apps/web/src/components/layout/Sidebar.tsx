import { Droplet, Home, PlayCircle, Settings, ShieldCheck, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils/cn'
import { Badge } from '../ui/Badge'

const navItems = [
  { label: 'Overview', to: '/dashboard', icon: Home },
  { label: 'Risk Dashboard', to: '/dashboard', icon: TrendingUp },
  { label: 'Rescue Simulator', to: '/rescue', icon: Droplet },
  { label: 'Demo Mode', to: '/demo', icon: PlayCircle },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-guard-border bg-guard-bg-soft/90 p-4 md:min-h-screen md:w-72 md:border-b-0 md:border-r">
      <NavLink to="/" className="mb-5 flex items-center gap-3 text-text-primary md:mb-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-sui-cyan/60 bg-sui-cyan/10 text-sui-cyan">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <span className="text-2xl font-semibold">
          Margin<span className="text-sui-cyan">Guard</span>
        </span>
      </NavLink>
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'focus-ring flex min-h-12 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary md:text-base',
                  isActive && item.label !== 'Overview' && 'border border-sui-cyan/25 bg-sui-cyan/12 text-text-primary',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="mt-5 hidden flex-1 flex-col justify-end gap-3 md:flex">
        <div className="rounded-xl border border-guard-border bg-guard-surface p-4">
          <div className="flex items-center gap-3 text-text-secondary">
            <ShieldCheck className="h-5 w-5" />
            <span>Gated PTB preview</span>
          </div>
          <Badge variant="healthy" className="mt-3">Static preview only</Badge>
        </div>
        <div className="rounded-xl border border-guard-border bg-guard-surface p-4 text-sm text-text-secondary">
          Browser-only risk console
        </div>
      </div>
    </aside>
  )
}
