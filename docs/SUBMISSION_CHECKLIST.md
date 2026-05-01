# Overflow Submission Checklist

Use this checklist before submitting MarginGuard to Sui 2026 Overflow.

## Public Materials

- [ ] README explains the project in under 60 seconds.
- [ ] README distinguishes real, simulated, and gated-live behavior.
- [ ] README distinguishes real DeepBook baseline, simulated shock, and estimated projections.
- [ ] Submission evidence manifest is complete: `docs/SUBMISSION_EVIDENCE.md`.
- [ ] GitHub repo URL, branch, commit hash, and working tree status are recorded.
- [ ] Canonical demo script is `docs/DEMO_SCRIPT.md`.
- [ ] Final demo QA checklist is complete.
- [ ] Deployment instructions are complete.
- [ ] Live Add Collateral QA checklist is linked for optional controlled manual QA.
- [ ] Screenshots are current and redact full manager IDs.
- [ ] Demo video uses current UI and does not imply mock state is live chain state.
- [ ] Visible risk disclaimer is present in README, demo docs, and app review flow.

## Safety Boundaries

- [ ] No backend, API route, serverless function, database, worker, indexer, keeper, relayer, custody logic, private-key handling, or global scanner is added.
- [ ] Public deployment keeps `VITE_ENABLE_LIVE_ADD_COLLATERAL=false` unless explicitly doing controlled manual QA.
- [ ] Public build live signing is disabled: `VITE_ENABLE_LIVE_ADD_COLLATERAL=false` or variable omitted where omission is disabled.
- [ ] Add Collateral PTB is described as implemented and safety-gated.
- [ ] Live signing is described as disabled by default.
- [ ] No live Add Collateral success is claimed unless a real transaction digest is provided.
- [ ] Demo Mode and Rescue Simulator label real baselines, simulated shocks, estimates, and mock/demo results separately.
- [ ] No mock digest is shown as a real onchain confirmation.
- [ ] No fake Explorer link is shown for mock/demo, rejected, or no-digest states.
- [ ] No claim says MarginGuard guarantees liquidation prevention.

## Demo Coverage

- [ ] Landing page shows the product positioning.
- [ ] Dashboard route loads.
- [ ] Wallet connect UI is visible.
- [ ] Manual manager import is visible.
- [ ] Real DeepBook read path can be explained.
- [ ] Current healthy manager remains no-rescue-needed and cannot submit.
- [ ] Current no-debt manager, if used, shows no active liquidation risk and cannot submit.
- [ ] Demo Mode shows simulated action-needed story, optionally seeded from a real manager baseline.
- [ ] Action-needed `1.17 -> 1.30` story is shown via Simulated Demo Mode or clearly labeled simulated what-if when the real manager has no active debt.
- [ ] Demo Mode screenshot/video labels `Real DeepBook baseline`, `Simulated shock`, `Estimated projection`, `Demo fallback`, and `App target` where applicable.
- [ ] Demo Mode is not described as fully live; real baseline + simulated shock is not a live action-needed onchain state.
- [ ] Rescue Simulator uses real manager baseline where eligible and blocks healthy/no-rescue-needed live Add Collateral.
- [ ] Rescue Simulator no-debt real baseline does not show urgent Add Collateral recommendation or active real Transaction Review CTA.
- [ ] Rescue Simulator healthy real manager shows healthy/no-rescue-needed or what-if behavior only, not an urgent live signing CTA.
- [ ] P1 reduce-only and Smart TPSL remain disabled/demo/SDK-required unless separately verified.
- [ ] Add Collateral Transaction Review opens before any wallet prompt.
- [ ] Acknowledgement is required before live wallet submission.
- [ ] Result modal distinguishes mock, rejected, failed, submitted, confirmed, refreshed, and refresh-failed states.

## Static Deployment

- [ ] Build command documented: `pnpm -C apps/web build`.
- [ ] Output directory documented: `apps/web/dist`.
- [ ] Deployed URL recorded: `____________________________`.
- [ ] Environment values reviewed before deployment.
- [ ] Live Add Collateral remains disabled on public demo deployment.
- [ ] Safe PowerShell build environment used:

  ```powershell
  Remove-Item Env:VITE_ENABLE_LIVE_ADD_COLLATERAL -ErrorAction SilentlyContinue
  $env:VITE_ENABLE_LIVE_ADD_COLLATERAL="false"
  ```

## Screenshot Checklist

- [ ] Landing page.
- [ ] Dashboard with no-backend/no-indexer/no-keeper context.
- [ ] Real or fallback Risk Snapshot with manager ID redacted.
- [ ] Demo Mode simulated Warning state.
- [ ] Demo Mode Real DeepBook baseline + Simulated shock state, if real baseline is available.
- [ ] No-debt real baseline, if available, with visible `No debt`, `N/A`, or `No active liquidation risk` labels and no `1000.00` / `Infinity`.
- [ ] Field-level provenance labels visible.
- [ ] Add Collateral Transaction Review.
- [ ] Simulated Result modal.
- [ ] No fake Explorer link and no digest unless real.
- [ ] Settings/manual manager import.

## Video Checklist

- [ ] 2-3 minutes.
- [ ] Mentions no backend, no indexer, no keeper.
- [ ] Shows real read path or explains fallback honestly.
- [ ] Shows current healthy manager blocking if used.
- [ ] Uses Demo Mode for action-needed story if no safe live manager exists.
- [ ] Uses Simulated Demo Mode or clearly labeled simulated what-if for the action-needed story if the real manager has no active debt.
- [ ] Explains starting RR / asset / debt may be real baseline, while shocked price / stressed RR / expected after RR are simulated or estimated.
- [ ] Does not claim Add Collateral was executed onchain unless a real digest is shown.
- [ ] Does not show full manager IDs.

## Final Go / No-Go

- [ ] `pnpm verify:submission-safety` passes.
- [ ] `pnpm -C apps/web typecheck` passes.
- [ ] `pnpm -C apps/web lint` passes.
- [ ] `pnpm -C apps/web test` passes.
- [ ] `pnpm -C apps/web build` passes.
- [ ] Root `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
- [ ] Known limitations are documented.
- [ ] Final go/no-go label is one of `Ready for demo submission`, `Ready after manual QA / deployment`, or `Not ready due to blocker`.
