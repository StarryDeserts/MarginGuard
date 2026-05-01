# Final Demo QA

Use this checklist before recording the Overflow demo video or doing a live judge walkthrough.

Date: `________________`

Commit: `________________`

Branch: `________________`

Deployed URL: `________________`

Tester: `________________`

## Command Checklist

- [ ] `pnpm install` completed if dependencies changed.
- [ ] `pnpm verify:submission-safety`.
- [ ] `pnpm -C apps/web typecheck`.
- [ ] `pnpm -C apps/web lint`.
- [ ] `pnpm -C apps/web test`.
- [ ] `pnpm -C apps/web build`.
- [ ] `pnpm typecheck`.
- [ ] `pnpm lint`.
- [ ] `pnpm test`.
- [ ] `pnpm build`.

## Browser And Wallet Checklist

- [ ] Browser profile has Sui wallet extension installed if testing wallet connection.
- [ ] Wallet is connected only when intentionally testing wallet UI.
- [ ] Selected network is Mainnet for current SUI/USDC manager read.
- [ ] No private keys, seed phrases, or full manager IDs are visible in recording.
- [ ] Public demo deployment has live Add Collateral disabled unless doing controlled manual QA.

## Route Smoke Checklist

- [ ] `/` loads landing page.
- [ ] `/dashboard` loads risk console.
- [ ] `/rescue` loads rescue simulator.
- [ ] `/demo` loads Demo Mode without manager or wallet.
- [ ] `/settings` loads manager settings.

## Live Flag Off Checklist

Start:

```powershell
pnpm -C apps/web dev --host 127.0.0.1
```

- [ ] Connect wallet.
- [ ] Import/select manager if available.
- [ ] If review is available, confirm wallet signing is disabled.
- [ ] Confirm no wallet prompt opens from review open or acknowledgement alone.

## Live Flag On With Current Healthy Manager

Start:

```powershell
$env:VITE_ENABLE_LIVE_ADD_COLLATERAL="true"; pnpm -C apps/web dev --host 127.0.0.1
```

- [ ] Connect wallet intentionally.
- [ ] Open current real healthy Mainnet SUI/USDC manager.
- [ ] Confirm DeepBook read works if RPC/wallet are available.
- [ ] Confirm risk state is no-rescue-needed.
- [ ] Confirm Add Collateral preview/signing remains blocked.
- [ ] Confirm no wallet prompt opens.
- [ ] Confirm copy says `No rescue needed while RR is above target.`

Do not alter risk ratio, target ratio, actionability, or mock state to force this manager into action-needed.

## Real DeepBook Read Checklist

- [ ] Manager ID was imported manually.
- [ ] Manager ID is redacted in screenshots/video.
- [ ] Source label shows DeepBook state when read succeeds.
- [ ] Partial/read-error/unavailable states are honest if read is incomplete.
- [ ] localStorage is not presented as chain truth.

## Demo Mode Simulated Action-Needed Checklist

- [ ] Demo Mode works without wallet and without manager.
- [ ] Simulated labels are visible.
- [ ] If a real Mainnet SUI/USDC manager is loaded, Demo Mode can switch to `Real Manager Baseline + Simulated Shock`.
- [ ] Real baseline fields are labeled `Real DeepBook`; shocked price and stressed RR are labeled simulated/estimate.
- [ ] Price shock moves risk toward Warning/action-needed.
- [ ] Add Collateral is the P0 recommended path.
- [ ] Reduce-only and Smart TPSL are P1/demo-only or SDK-required.
- [ ] No live wallet prompt opens from demo-only state.

## Rescue Simulator Real Baseline Checklist

- [ ] With a full DeepBook baseline, Rescue Simulator shows `Real DeepBook baseline`.
- [ ] With partial DeepBook data, Rescue Simulator shows display-only partial data and does not enable live submit.
- [ ] With the current healthy manager, Rescue Simulator says healthy/no-rescue-needed and does not show an urgent Add Collateral signing CTA.
- [ ] Without a readable manager, Rescue Simulator falls back to simulated plans.

## Transaction Review Checklist

- [ ] Opens before wallet prompt.
- [ ] Shows Add Collateral action.
- [ ] Shows manager short ID, connected wallet if available, network, market, asset, amount, before RR, expected after RR, target RR, and liquidation threshold.
- [ ] Shows source state and live mode status.
- [ ] Shows warnings about USDC deposit, manager ID verification, ownership not inferred, non-custody, irreversible wallet approval, and final wallet details.
- [ ] Sign and Submit is disabled until acknowledgement and live gates pass.
- [ ] No-rescue-needed review cannot submit.

## Result Modal Checklist

- [ ] Mock/demo result is clearly labeled mock.
- [ ] Mock/demo result has no explorer link.
- [ ] Wallet rejected state says no transaction submitted.
- [ ] Failed state does not claim risk improvement.
- [ ] Submitted state appears only after a real digest.
- [ ] Confirmed state appears only after confirmation wait.
- [ ] Refreshed state appears only after manager re-read succeeds.
- [ ] Refresh-failed state says latest manager state could not be read and can retry manager read only.

## Optional Live Add Collateral Checklist

Only use [LIVE_ADD_COLLATERAL_QA.md](LIVE_ADD_COLLATERAL_QA.md) Part C if all are true:

- [ ] You control the manager.
- [ ] The amount is small and acceptable to lose.
- [ ] Mainnet is intentionally selected.
- [ ] Manager ID, wallet, amount, and asset match review and wallet.
- [ ] `VITE_ENABLE_LIVE_ADD_COLLATERAL=true` is explicitly enabled.
- [ ] Manager state is real DeepBook action-needed, not mock/demo.

Do not force live execution if no safe action-needed manager exists. Use Demo Mode fallback for video.

## Screenshot Checklist

- [ ] Landing page.
- [ ] Dashboard with wallet/network context.
- [ ] Manager import/settings with full IDs redacted.
- [ ] Real DeepBook read or honest unavailable/read-error state.
- [ ] No-rescue-needed block for current healthy manager if used.
- [ ] Demo Mode Warning/action-needed state.
- [ ] Transaction Review warnings.
- [ ] Simulated Result modal.

## Video Recording Checklist

- [ ] 2-3 minute target.
- [ ] Explain no backend, no indexer, no keeper.
- [ ] Explain manual manager import.
- [ ] Explain real vs simulated vs gated-live behavior.
- [ ] Explain real baseline vs simulated shock if Demo Mode uses an imported manager.
- [ ] Do not show full manager IDs.
- [ ] Do not claim live Add Collateral success without real digest.
- [ ] Use Demo Mode fallback if no safe action-needed manager exists.

## Final Go / No-Go

Go only if:

- [ ] Verification commands pass or failures are documented as non-blocking with exact cause.
- [ ] Safety scan passes.
- [ ] Demo path is stable.
- [ ] Docs match the actual app.
- [ ] No public material overclaims live execution, automatic protection, or background monitoring.

Decision: `GO / NO-GO`
