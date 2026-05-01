# MarginGuard Development Plan

This document defines the engineering roadmap for building MarginGuard with Codex. It is intentionally implementation-oriented and should be updated whenever the MVP scope changes.

---

## Table of Contents

1. [Development Principles](#development-principles)
2. [Priority Definitions](#priority-definitions)
3. [Phase 0: Documentation and Planning](#phase-0-documentation-and-planning)
4. [Phase 1: Project Initialization](#phase-1-project-initialization)
5. [Phase 2: Wallet Connect](#phase-2-wallet-connect)
6. [Phase 3: Margin Manager Import](#phase-3-margin-manager-import)
7. [Phase 4: DeepBook Margin SDK Read-only Integration](#phase-4-deepbook-margin-sdk-read-only-integration)
8. [Phase 5: Risk Dashboard](#phase-5-risk-dashboard)
9. [Phase 6: Rescue Simulator](#phase-6-rescue-simulator)
10. [Phase 7: Add Collateral PTB](#phase-7-add-collateral-ptb)
11. [Phase 8: Reduce-only PTB](#phase-8-reduce-only-ptb)
12. [Phase 9: Smart TPSL PTB](#phase-9-smart-tpsl-ptb)
13. [Phase 10: Optional Move Contract](#phase-10-optional-move-contract)
14. [Phase 11: Demo Mode](#phase-11-demo-mode)
15. [Phase 12: Submission Polish](#phase-12-submission-polish)
16. [Definition of Done](#definition-of-done)

---

## Development Principles

1. **No backend.** Do not add API routes, serverless functions, databases, queues, workers, or hosted services.
2. **No custom indexer.** The app does not scan all positions. Users manually import their Margin Manager ID.
3. **No keeper bot.** The app does not run 24/7 or claim automated protection while closed.
4. **Browser-first.** Reads use Sui RPC / DeepBook Margin SDK from the browser. Writes are review-gated wallet-signed PTBs only under live QA conditions.
5. **Real P0 path.** Add Collateral PTB is implemented and safety-gated; no live success is claimed without a real digest.
6. **Mock only when labeled.** Demo Mode may use simulated price shocks and fallback state, but the UI must label simulated and estimated values clearly.
7. **Adapter isolation.** DeepBook SDK calls must live behind `lib/deepbook/*`, not inside React components.
8. **Risk engine purity.** Risk math must live in pure functions under `lib/risk/*` and be unit tested.
9. **Design first.** Do not implement core pages before the UI/UX workflow produces a design system and screen plan.
10. **Verify unknown SDK APIs.** Do not invent DeepBook Margin SDK method names. Codex must verify exact APIs from official docs / skills during implementation.

---

## Priority Definitions

### P0: Required for submission

- Wallet connect.
- Manual Margin Manager import.
- Read manager state or provide clearly labeled fallback in Demo Mode.
- Risk Dashboard.
- Rescue Simulator with three plans.
- Add Collateral PTB, implemented and safety-gated.
- Demo Mode.

### P1: Strongly recommended

- Reduce-only PTB.
- Smart TPSL PTB.
- Execute triggered TPSL.
- Optional GuardProfile / RescueReceipt Move package.
- Before/after risk ratio comparison after real transaction confirmation.

### P2: Later extensions

- More markets.
- Better borrow APR model.
- Shareable rescue link.
- BTCFi collateral passport roadmap.
- Solver / backstop / rescue market design.

---

## Phase 0: Documentation and Planning

### Goal

Set up all project instructions before writing code so Codex can develop predictably over many sessions.

### Inputs

- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `UIUX_WORKFLOW.md`
- `GPT_IMAGE_2_PROMPTS.md`
- `FRONTEND_IMPLEMENTATION_PLAN.md`
- `TASK_BREAKDOWN.md`

### Outputs

- Stable documentation package committed to the repository root.
- `docs/` directory if detailed references are split out later.

### Acceptance Criteria

- Codex can open `AGENTS.md` and understand project boundaries.
- All P0/P1/P2 scopes are explicit.
- No document implies backend/indexer/keeper exists in v0.

---

## Phase 1: Project Initialization

### Goal

Create the monorepo and frontend app skeleton.

### Inputs

- `FRONTEND_IMPLEMENTATION_PLAN.md`
- UI/UX design direction from `UIUX_WORKFLOW.md`

### Outputs

- `apps/web` Vite React TypeScript app.
- Tailwind configured.
- pnpm workspace configured.
- Basic lint/typecheck/build scripts.
- `.env.example`.

### Acceptance Criteria

- `pnpm install` succeeds.
- `pnpm dev` starts the app.
- `pnpm build`, `pnpm lint`, and `pnpm typecheck` either pass or are explicitly stubbed with tracked TODOs.
- No backend directories are introduced.

---

## Phase 2: Wallet Connect

### Goal

Connect Sui wallet in the browser and expose wallet state to the app.

### Inputs

- Sui frontend skill / official dApp Kit references.
- Network configuration.

### Outputs

- Wallet provider setup.
- `WalletPanel` component.
- `useCurrentNetwork` hook.
- Network badge and wallet address display.

### Acceptance Criteria

- User can connect and disconnect wallet.
- App displays connected address and selected network.
- No private keys are handled by the app.
- Wallet state is read from wallet adapter only.

---

## Phase 3: Margin Manager Import

### Goal

Let users import a Margin Manager ID manually and persist it locally.

### Inputs

- User wallet address.
- Manual object ID input.
- Supported pool key list.

### Outputs

- `ManagerInput` component.
- `ManagerSelector` component.
- `useLocalManagers` hook.
- `lib/storage/localManagers.ts`.

### Acceptance Criteria

- User can paste a manager object ID.
- User can select SUI/USDC as the market.
- Imported manager is saved to localStorage.
- Refreshing the app preserves saved manager history.
- Invalid object ID formats show client-side validation errors.
- No global position discovery is attempted.

---

## Phase 4: DeepBook Margin SDK Read-only Integration

### Goal

Read imported Margin Manager state from Sui RPC / DeepBook Margin SDK.

### Inputs

- Connected wallet address.
- Imported manager object ID.
- Pool key.
- Network.

### Outputs

- `lib/deepbook/client.ts`.
- `lib/deepbook/managerAdapter.ts`.
- `lib/deepbook/normalizeManagerState.ts`.
- `useDeepBookClient`.
- `useMarginManagerState`.

### Acceptance Criteria

- SDK client creation is centralized.
- Manager state reads are behind an adapter.
- UI receives a normalized `NormalizedMarginState`, not raw SDK response.
- If SDK method names differ from assumptions, Codex updates only the adapter.
- Failed RPC/SDK reads show recoverable UI errors.
- Demo Mode can continue with mock state if no real manager is available.

### Important Note

DeepBook Margin SDK APIs must be verified during implementation using the official Sui skill/docs and, if necessary, Sui ecosystem DeepBook skills. Do not hardcode unverified API names across the app.

---

## Phase 5: Risk Dashboard

### Goal

Show a clear risk cockpit for the imported manager.

### Inputs

- `NormalizedMarginState`.
- Risk thresholds.
- Borrow APR or placeholder if unavailable.

### Outputs

- `RiskGauge`.
- `RiskLevelBadge`.
- `LiquidationDistance`.
- `DebtCollateralBreakdown`.
- `InterestDriftCard`.
- `lib/risk/*` pure functions.

### Acceptance Criteria

- Displays current risk ratio.
- Displays risk status: Healthy / Guarded / Caution / Warning / Liquidatable.
- Displays liquidation threshold and target rescue ratio.
- Displays estimated distance to liquidation.
- Displays borrow APR drift as estimate if borrow APR is available.
- Clearly marks estimated values.
- Risk functions have unit tests.

---

## Phase 6: Rescue Simulator

### Goal

Generate three rescue options from the current risk snapshot.

### Inputs

- Current asset value.
- Current debt value.
- Current risk ratio.
- Target risk ratio.
- Current price.
- Liquidation threshold.

### Outputs

- `RescuePlanGrid`.
- `AddCollateralPlanCard`.
- `ReduceOnlyPlanCard`.
- `SmartTpslPlanCard`.
- `useRescuePlans`.
- `lib/risk/rescuePlans.ts`.

### Acceptance Criteria

- Add Collateral plan computes required additional value.
- Reduce-only plan estimates reduce size and after risk ratio.
- Smart TPSL plan recommends stop-loss above liquidation price.
- Each plan shows before/after risk ratio, cost, upside retained, and warnings.
- P1 plans can be disabled if real PTB path is not yet verified.
- Simulator never claims guaranteed liquidation prevention.

---

## Phase 7: Add Collateral PTB

### Goal

Build and execute the primary real rescue transaction.

### Inputs

- Selected manager.
- Collateral coin type / coin key.
- Amount.
- SDK deposit function verified during implementation.
- Optional GuardProfile ID.

### Outputs

- `lib/tx/buildAddCollateralTx.ts`.
- `TransactionReviewModal`.
- `useBuildRescueTx`.
- `useExecuteTx`.
- Success/failure result UI.

### Acceptance Criteria

- User can select Add Collateral plan.
- App re-reads manager state before building the transaction.
- Transaction review shows action, amount, before risk ratio, expected after risk ratio, and failure conditions.
- Wallet signs and submits the PTB.
- App waits for confirmation.
- Dashboard refreshes after success.
- Errors are displayed without losing app state.

---

## Phase 8: Reduce-only PTB

### Goal

Support partial exposure reduction if SDK/API path is verified.

### Inputs

- Current position direction.
- Reduce percentage or quantity.
- Pool key.
- Slippage settings.
- Verified DeepBook Margin order API.

### Outputs

- `lib/tx/buildReduceOnlyTx.ts`.
- Reduce-only transaction review path.

### Acceptance Criteria

- Existing risky open orders can be optionally canceled if supported.
- Reduce-only market or limit order is built using verified SDK calls.
- User signs explicitly.
- UI explains slippage, partial fill, stale price, and failed order risks.
- If not production-ready by submission, the button remains disabled and clearly labeled as P1.

---

## Phase 9: Smart TPSL PTB

### Goal

Let users create a smart stop-loss / TPSL based on liquidation buffer.

### Inputs

- Liquidation price estimate.
- Risk preference.
- Safety buffer.
- Verified DeepBook Margin TPSL API.

### Outputs

- `lib/tx/buildSmartTpslTx.ts`.
- `lib/tx/buildExecuteTriggeredTpslTx.ts`.
- Smart TPSL plan CTA.

### Acceptance Criteria

- Stop-loss trigger price is recommended above liquidation price.
- User can review trigger price and quantity before signing.
- If supported, triggered orders can be executed permissionlessly.
- No keeper or background service is implied.

---

## Phase 10: Optional Move Contract

### Goal

Add protocol-like onchain receipts without custody or automation.

### Inputs

- `MOVE_CONTRACT_PLAN.md`.
- Sui Move skill.

### Outputs

- `packages/move/sources/margin_guard.move`.
- `Move.toml`.
- Unit tests if time permits.
- Frontend optional integration for profile/receipt.

### Acceptance Criteria

- `GuardProfile` can be created by owner.
- `RescueReceipt` can be recorded by owner.
- Events are emitted.
- Contract does not custody funds.
- Contract cannot trigger rescue transactions automatically.

---

## Phase 11: Demo Mode

### Goal

Provide a stable 3-minute hackathon demo independent of market volatility.

### Inputs

- Mock scenario data.
- Optional real manager state.
- Demo script.

### Outputs

- `/demo` route.
- `DemoScenarioStepper`.
- `DemoPriceSlider`.
- `DemoStateBanner`.
- `lib/demo/*`.

### Acceptance Criteria

- Demo can run without a real manager.
- Demo clearly labels mock/simulated values.
- Demo can optionally show a real manager baseline with simulated shock.
- Demo does not open a live wallet prompt.
- Controlled live Add Collateral QA remains outside Demo Mode.

---

## Phase 12: Submission Polish

### Goal

Prepare the project for judging.

### Outputs

- README polished.
- Demo video script finalized.
- Architecture diagram included.
- Risk disclaimer visible.
- Screenshots added.
- Deployment to a static hosting target if allowed.

### Acceptance Criteria

- Judge can understand in under 60 seconds that MarginGuard is not another leverage UI.
- Demo route is stable.
- App has a fallback path.
- Docs clearly explain no backend, no indexer, no keeper.
- Round 6 submission docs distinguish real DeepBook reads, simulated/demo flows, and gated-live Add Collateral.
- Round 7L demo docs distinguish real DeepBook baseline, simulated shock, estimated projections, and demo fallback.
- Add Collateral PTB is documented as implemented and safety-gated; live signing is disabled by default.
- No live Add Collateral success is claimed unless a real transaction digest is provided.

---

## Definition of Done

A task is done only when:

- code compiles;
- relevant tests pass or are explicitly deferred with reason;
- UI handles loading, error, empty, and success states;
- no MVP constraints are violated;
- changed behavior is documented if it affects architecture, tasks, or demo flow;
- SDK assumptions are isolated behind adapters;
- no unverified long-term roadmap feature is presented as implemented.
