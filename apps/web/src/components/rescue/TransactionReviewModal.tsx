import { LockKeyhole, TriangleAlert } from 'lucide-react'
import { mockMarginState } from '../../lib/demo/mockMarginState'
import { recommendedRescuePlan } from '../../lib/demo/mockRescuePlans'
import { shortAddress } from '../../lib/utils/address'
import { formatRatio, formatUsdc } from '../../lib/utils/format'
import type { RescuePlan } from '../../types/rescue'
import type { AddCollateralExecutionState, AddCollateralReviewModel } from '../../types/tx'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

type TransactionReviewModalProps = {
  open: boolean
  acknowledged: boolean
  plan?: RescuePlan
  reviewModel?: AddCollateralReviewModel
  executionState?: AddCollateralExecutionState
  onAcknowledgedChange: (value: boolean) => void
  onSubmit?: () => void
  onClose: () => void
}

export function TransactionReviewModal({
  open,
  acknowledged,
  plan = recommendedRescuePlan,
  reviewModel,
  executionState = { status: 'idle' },
  onAcknowledgedChange,
  onSubmit,
  onClose,
}: TransactionReviewModalProps) {
  const model = reviewModel ?? getMockPreviewReviewModel(plan)
  const pending = isPendingExecutionState(executionState)
  const canSubmit = model.signingEnabled && model.isExecutable && acknowledged && !pending
  const submitButtonLabel = model.signingEnabled ? 'Sign and Submit with Wallet' : 'Wallet signing not enabled by this preview'
  const subtitle = model.signingEnabled
    ? 'Review the Add Collateral transaction before opening your wallet.'
    : 'PTB preview only. Wallet signing may be disabled by gate, source state, or feature flag.'

  return (
    <Modal
      open={open}
      title="Add Collateral Review"
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="secondary" onClick={onClose}>
            Close Preview
          </Button>
          <Button disabled={!canSubmit} icon={<LockKeyhole className="h-5 w-5" />} onClick={onSubmit}>
            {pending ? 'Processing wallet flow...' : submitButtonLabel}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <section className="rounded-lg border border-guard-border p-4">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">1. Action Summary</h3>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ['Action', 'Add Collateral'],
              ['Execution mode', model.signingEnabled ? 'Wallet execution gated' : 'PTB preview only'],
              ['Market', model.poolKey.replace('_', '/')],
              ['Protocol', 'DeepBook Margin'],
              ['Manager', model.managerShort],
              ['Connected Wallet', model.connectedWalletShort ?? 'Unavailable'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase text-text-muted">{label}</p>
                <p className="mt-1 font-semibold text-text-primary">{value}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-guard-border p-4">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">2. Impact Preview</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-text-secondary">Before RR</p>
              <p className="text-5xl font-semibold text-warning-orange">{formatOptionalRatio(model.beforeRiskRatio)}</p>
              <Badge variant="warning">Preview</Badge>
            </div>
            <div>
              <p className="text-sm text-text-secondary">After RR (est.)</p>
              <p className="text-5xl font-semibold text-safe-green">{formatOptionalRatio(model.afterRiskRatio)}</p>
              <Badge variant="healthy">Estimated</Badge>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Liquidation Threshold</p>
              <p className="text-3xl font-semibold text-text-primary">{formatOptionalRatio(model.liquidationThreshold)}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Target RR</p>
              <p className="text-3xl font-semibold text-safe-green">{formatOptionalRatio(model.targetRiskRatio)}</p>
            </div>
          </div>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border border-guard-border p-4">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">3. Transaction Details</h3>
            <dl className="space-y-3 text-sm">
              {[
                ['Add Amount', model.amountDisplay],
                ['Asset', model.collateralAsset],
                ['Atomic Amount', model.amountAtomic],
                ['Estimated Gas Fee', model.estimatedGas ?? 'Unavailable until wallet review'],
                ['Network', formatNetwork(model.network)],
                ['Live Mode', model.signingEnabled ? 'Enabled by feature gate' : 'Disabled or blocked'],
                ['Source', model.source === 'deepbook' ? 'DeepBook state' : 'Mock fallback'],
                ['Executable', model.isExecutable ? 'yes' : 'no'],
                ['Unsigned TX available', model.unsignedTxAvailable ? 'yes' : 'no'],
                ['Signing enabled', model.signingEnabled ? 'yes' : 'no'],
                ['Exact DeepBook write API', model.exactDeepBookWriteApi],
                ['Builder status', model.buildStatus],
                ['Execution status', executionStatusLabel(executionState)],
                ['Blocked reason', model.blockedReason ?? 'No transaction has been submitted'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-guard-border pb-2">
                  <dt className="text-text-secondary">{label}</dt>
                  <dd className="font-semibold text-text-primary">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-text-muted">
              {model.signingEnabled
                ? 'Your wallet will open only after you acknowledge and click Sign and Submit with Wallet.'
                : 'No wallet opens while this review is blocked or preview-only.'}
            </p>
          </section>
          <section className="rounded-lg border border-warning-orange/70 p-4">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">4. Warnings & Assumptions</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              {model.warnings.map((warning) => (
                <li key={warning} className="flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4 text-warning-orange" />
                  {warning}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-guard-border p-4 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => onAcknowledgedChange(event.target.checked)}
            className="mt-1 h-4 w-4 accent-electric-blue"
          />
          <span>
            I understand my wallet will open only after I click Sign and Submit with Wallet. No transaction is submitted before
            wallet approval.
          </span>
        </label>
        {acknowledged ? (
          <p className="text-xs text-text-muted">
            {model.signingEnabled
              ? 'Acknowledged. Use the submit button to open the wallet prompt.'
              : 'Acknowledged. Signing remains disabled for this review.'}
          </p>
        ) : null}
        {executionState.status === 'blocked' || executionState.status === 'failed' || executionState.status === 'rejected' ? (
          <p className="rounded-lg border border-warning-orange/60 bg-warning-orange/10 p-3 text-sm text-warning-orange">
            {executionState.message}
          </p>
        ) : null}
      </div>
    </Modal>
  )
}

function getMockPreviewReviewModel(plan: RescuePlan): AddCollateralReviewModel {
  return {
    action: 'add-collateral',
    network: 'mainnet',
    managerShort: shortAddress(mockMarginState.manager.objectId),
    poolKey: 'SUI_USDC',
    collateralAsset: 'USDC',
    amountDisplay: formatUsdc(Number(plan.params.addAmountUsdc)),
    amountAtomic: 'mock-preview',
    estimatedGas: '~0.002 SUI',
    beforeRiskRatio: plan.beforeRiskRatio,
    afterRiskRatio: plan.expectedAfterRiskRatio,
    liquidationThreshold: mockMarginState.liquidationRiskRatio,
    targetRiskRatio: plan.targetRiskRatio,
    source: 'mock-preview',
    rescueActionability: 'action-needed',
    isExecutable: false,
    buildStatus: 'not-built',
    unsignedTxAvailable: false,
    signingEnabled: false,
    blockedReason: 'Unsigned PTB is not built in this preview; wallet signing is not enabled by this preview.',
    capabilityStatus: 'verified',
    exactDeepBookWriteApi: 'verified',
    verifiedSdkMethod: 'marginManager.depositQuote',
    warnings: [
      'PTB preview only',
      'No wallet prompt from simulated or blocked state',
      'Wallet signing not enabled by this preview',
      'No transaction has been submitted',
      'Demo values are mock preview values.',
    ],
  }
}

function formatOptionalRatio(value: number | undefined) {
  return value === undefined ? 'Unavailable' : formatRatio(value)
}

function isPendingExecutionState(state: AddCollateralExecutionState) {
  return (
    state.status === 'rereading' ||
    state.status === 'building' ||
    state.status === 'wallet-prompt' ||
    state.status === 'submitted' ||
    state.status === 'confirming' ||
    state.status === 'confirmed' ||
    state.status === 'refreshing-manager'
  )
}

function executionStatusLabel(state: AddCollateralExecutionState) {
  if ('digest' in state) return `${state.status} (${state.digest})`
  if ('message' in state) return `${state.status}: ${state.message}`

  return state.status
}

function formatNetwork(network: AddCollateralReviewModel['network']) {
  if (network === 'mainnet') return 'Mainnet'
  if (network === 'testnet') return 'Testnet'

  return network
}
