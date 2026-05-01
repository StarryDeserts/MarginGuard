import { ArrowRight, Copy, ShieldCheck, TrendingUp } from 'lucide-react'
import { mockMarginState } from '../../lib/demo/mockMarginState'
import { recommendedRescuePlan } from '../../lib/demo/mockRescuePlans'
import { formatApr, formatPct, formatRatio, formatUsdc, formatUsd } from '../../lib/utils/format'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export function ProductPreviewPanel() {
  return (
    <div className="rounded-2xl border border-sui-cyan/45 bg-guard-surface/90 p-4 shadow-[0_0_70px_rgba(0,217,255,0.18)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-5 w-5 text-sui-cyan" />
          Margin<span className="text-sui-cyan">Guard</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="healthy">Mainnet</Badge>
          <Badge variant="neutral">Wallet: 0x1234...abcd5678</Badge>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-warning-orange/50 bg-warning-orange/10 p-4">
          <p className="text-sm text-text-secondary">Current Risk Ratio</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-6xl font-semibold text-warning-orange">{formatRatio(mockMarginState.riskRatio)}</span>
            <Badge variant="warning">Warning</Badge>
          </div>
          <p className="mt-3 text-sm text-text-secondary">Your position is approaching liquidation risk.</p>
        </div>
        <div className="rounded-xl border border-guard-border p-4">
          <p className="text-sm text-text-secondary">Position Context</p>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span>Protocol</span><span>DeepBook Margin</span></div>
            <div className="flex justify-between gap-4"><span>Market</span><span>SUI/USDC</span></div>
            <div className="flex justify-between gap-4"><span>Manager</span><span className="flex items-center gap-1">0x1234...abcd5678 <Copy className="h-3 w-3" /></span></div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Risk Ratio', formatRatio(mockMarginState.riskRatio), 'Warning'],
          ['Liquidation Distance', formatPct(mockMarginState.liquidationDistancePct), 'From threshold'],
          ['Asset Value', formatUsd(mockMarginState.assetValueUsd), 'Total collateral'],
          ['Debt Value', formatUsd(mockMarginState.debtValueUsd), 'Total borrowed'],
          ['Borrow APR', formatApr(mockMarginState.borrowAprDisplayPct), 'Variable'],
        ].map(([label, value, helper]) => (
          <div key={label} className="rounded-xl border border-guard-border bg-guard-bg-soft p-3">
            <p className="text-xs text-text-muted">{label}</p>
            <p className="mt-2 text-xl font-semibold text-text-primary">{value}</p>
            <p className="text-xs text-text-secondary">{helper}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-safe-green/50 bg-safe-green/10 p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-text-primary">Transaction Review Preview</p>
            <p className="mt-2 text-sm text-text-secondary">
              Add {formatUsdc(Number(recommendedRescuePlan.params.addAmountUsdc))} to raise RR from 1.17 Warning to 1.30 Healthy.
            </p>
          </div>
          <Button icon={<ArrowRight className="h-4 w-4" />}>Open Transaction Review</Button>
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
          <TrendingUp className="h-4 w-4 text-sui-cyan" />
          Gated Add Collateral PTB preview. Simulated result unless live QA conditions are met.
        </p>
      </div>
    </div>
  )
}
