# Final Demo QA

Use this checklist before recording the Overflow demo video or doing a live judge walkthrough.

Date: `2026-05-01`

Submission commit: `fill after final push`

Latest planning commit: `de01843`

Branch: `main`

GitHub repo URL: `https://github.com/StarryDeserts/MarginGuard`

Working tree status: `Final response records post-push working tree status`

Upstream status: `Tracks origin/main; no ahead/behind marker reported by git status -sb`

Final build date: `2026-05-02 00:08:26 +08:00`

Release artifact / zip name: `N/A — static build output in apps/web/dist`

Deployed URL: `________________`

Tester: `________________`

## Round 9 Submission Lock Record

Use only these status values: `Not tested`, `Passed`, `Failed`, `N/A`.

| Item | Status | Evidence / notes |
|---|---|---|
| GitHub repo URL recorded | Passed | `https://github.com/StarryDeserts/MarginGuard`. |
| Final commit hash recorded | Not tested | Fill after final push; final response reports the actual pushed commit. |
| Branch recorded | Passed | `main`. |
| Working tree clean or intentionally accepted | Not tested | Pending final Round 9 commit/push and final git snapshot. |
| Public build live flag state | Passed | App and root builds ran with `VITE_ENABLE_LIVE_ADD_COLLATERAL=false` in the same PowerShell command. |
| App-level safe build completed | Passed | `pnpm -C apps/web build` exited 0; Vite large chunk warning is non-blocking. |
| Root safe build completed | Passed | `pnpm build` exited 0; Vite large chunk warning is non-blocking. |
| Safety scan completed | Passed | `pnpm verify:submission-safety` passed and scanned 185 text files before final doc result update; final response records post-doc safety rerun. |
| Static preview route smoke | Passed | Static preview returned HTTP 200 for `/`, `/dashboard`, `/rescue`, `/demo`, `/settings`; visual/browser wallet QA remains manual. |
| Deployment URL recorded | Not tested | Fill only after public static deployment exists. |
| User-provided screenshot QA reviewed | Passed | User-provided screenshots reviewed in planning chat: no-debt fix visually confirmed. |
| Final submission screenshots captured | Not tested | Full manager IDs must be redacted; record uploaded URLs or repo-relative paths only. |
| Demo video captured | Not tested | No live success claim without digest. |
| Live Add Collateral transaction submitted | N/A | N/A — no live Add Collateral transaction submitted. |
| Real transaction digest | N/A | N/A — no live Add Collateral transaction submitted. |
| Final go/no-go label | Not tested | Pending commit/push, deployment/screenshots/video evidence, and final git snapshot. |

## Command Checklist

- [ ] Safe build environment confirmed:

  ```powershell
  Remove-Item Env:VITE_ENABLE_LIVE_ADD_COLLATERAL -ErrorAction SilentlyContinue
  $env:VITE_ENABLE_LIVE_ADD_COLLATERAL="false"
  ```

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

Static preview command:

```powershell
pnpm -C apps/web preview --host 127.0.0.1
```

If Codex cannot observe routes in a browser/static preview session, leave route status as `Not tested — user manual`. Do not mark route smoke as passed from build success alone.

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
- [ ] If the real manager has explicit zero debt, Dashboard shows `No debt` / `No active liquidation risk` instead of `1000.00` or `Infinity`.

## Demo Mode Simulated Action-Needed Checklist

- [ ] Demo Mode works without wallet and without manager.
- [ ] Simulated labels are visible.
- [ ] If a real Mainnet SUI/USDC manager is loaded, Demo Mode can switch to `Real Manager Baseline + Simulated Shock`.
- [ ] Real baseline fields are labeled `Real DeepBook`; shocked price and stressed RR are labeled simulated/estimate.
- [ ] If the real baseline has no debt, Demo Mode shows `No debt`, `N/A`, and `No active liquidation risk`, with no `0.00 USDC` Add Collateral recommendation.
- [ ] Simulated Demo Mode still shows the action-needed `1.17 -> 1.30` story when needed for video.
- [ ] Price shock moves risk toward Warning/action-needed.
- [ ] Add Collateral is the P0 recommended path.
- [ ] Reduce-only and Smart TPSL are P1/demo-only or SDK-required.
- [ ] No live wallet prompt opens from demo-only state.

## Rescue Simulator Real Baseline Checklist

- [ ] With a full DeepBook baseline, Rescue Simulator shows `Real DeepBook baseline`.
- [ ] With partial DeepBook data, Rescue Simulator shows display-only partial data and does not enable live submit.
- [ ] With real no-debt data, Rescue Simulator says no real rescue is needed and labels any action-needed story as simulated what-if.
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
- [ ] Rescue Simulator shows `Real DeepBook baseline`, `Partial DeepBook baseline`, or clearly simulated fallback.
- [ ] No-debt screenshots show `No debt`, `N/A`, or `No active liquidation risk`, not `1000.00` or `Infinity`.
- [ ] Demo Mode simulated Warning/action-needed state.
- [ ] Demo Mode labels `Real DeepBook baseline`, `Simulated shock`, `Estimate`, `App target`, and `Demo fallback` where applicable.
- [ ] Public/default build shows live signing disabled or equivalent safe copy.
- [ ] Transaction Review warnings.
- [ ] Simulated Result modal.
- [ ] No fake Explorer link and no digest unless a real digest exists.

## Video Recording Checklist

- [ ] 2-3 minute target.
- [ ] Explain no backend, no indexer, no keeper.
- [ ] Explain manual manager import.
- [ ] Explain real vs simulated vs gated-live behavior.
- [ ] Explain real baseline vs simulated shock if Demo Mode uses an imported manager.
- [ ] Explain that starting RR, asset value, and debt value may come from real baseline, while shocked price, stressed RR, expected after RR, and interest drift are simulated or estimated.
- [ ] Do not call Demo Mode fully live.
- [ ] If Rescue Simulator uses a healthy real manager, explain healthy baseline / what-if only and no urgent live signing CTA.
- [ ] If the real manager has no active debt, explain that the real baseline proves read/safety blocking and use Simulated Demo Mode for the Warning/Add Collateral story.
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

Decision: `Ready for demo submission / Ready after manual QA / deployment / Not ready due to blocker`
