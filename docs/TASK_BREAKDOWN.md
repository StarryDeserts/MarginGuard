# Task Breakdown

This document breaks MarginGuard into Codex-executable epics and tasks. Each task should be implemented in a small, reviewable change.

---

## Table of Contents

1. [Suggested Order](#suggested-order)
2. [Epic 0: Documentation and Workflow](#epic-0-documentation-and-workflow)
3. [Epic 1: Project Scaffold](#epic-1-project-scaffold)
4. [Epic 2: UI/UX Design System](#epic-2-uiux-design-system)
5. [Epic 3: Wallet and Network](#epic-3-wallet-and-network)
6. [Epic 4: Manager Import and Storage](#epic-4-manager-import-and-storage)
7. [Epic 5: DeepBook Read-only Integration](#epic-5-deepbook-read-only-integration)
8. [Epic 6: Risk Engine](#epic-6-risk-engine)
9. [Epic 7: Risk Dashboard](#epic-7-risk-dashboard)
10. [Epic 8: Rescue Simulator](#epic-8-rescue-simulator)
11. [Epic 9: Add Collateral PTB](#epic-9-add-collateral-ptb)
12. [Epic 10: P1 Reduce-only and TPSL](#epic-10-p1-reduce-only-and-tpsl)
13. [Epic 11: Optional Move Contract](#epic-11-optional-move-contract)
14. [Epic 12: Demo Mode and Submission](#epic-12-demo-mode-and-submission)

---

## Suggested Order

1. Documentation and workflow.
2. UI/UX prompts and design direction.
3. Frontend scaffold.
4. Wallet connect.
5. Manager import/localStorage.
6. Mock dashboard.
7. Risk engine.
8. DeepBook read adapter.
9. Real dashboard data.
10. Rescue simulator.
11. Transaction review modal.
12. Add Collateral PTB.
13. Demo Mode.
14. P1 reduce-only/TPSL.
15. Optional Move contract.
16. Polish and submission.

---

## Epic 0: Documentation and Workflow

### Task 0.1: Add repository docs

- Priority: P0
- Skill: superpowers
- Files: `README.md`, `AGENTS.md`, `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `TASK_BREAKDOWN.md`
- Acceptance criteria:
  - docs exist at repository root;
  - no-backend/no-indexer/no-keeper is explicit;
  - Codex can follow task order.
- Do not touch:
  - app source code unless scaffold already exists.

### Task 0.2: Add UI/UX workflow docs

- Priority: P0
- Skill: GPT image2 playbook, ui-ux-pro-max planning only
- Files: `UIUX_WORKFLOW.md`, `GPT_IMAGE_2_PROMPTS.md`
- Acceptance criteria:
  - prompts are complete;
  - Design System Board prompt is first;
  - core page prompts are included.
- Do not touch:
  - frontend implementation before design direction is selected.

---

## Epic 1: Project Scaffold

### Task 1.1: Create pnpm workspace

- Priority: P0
- Skill: superpowers
- Files likely edited:
  - `package.json`
  - `pnpm-workspace.yaml`
  - `.gitignore`
- Acceptance criteria:
  - workspace installs;
  - scripts are defined;
  - no backend package is created.
- Do not touch:
  - Move package unless doing Task 11.

### Task 1.2: Create Vite React app

- Priority: P0
- Skill: ui-ux-pro-max for UI structure, not visual invention
- Files likely edited:
  - `apps/web/*`
- Acceptance criteria:
  - `pnpm dev` works;
  - TypeScript enabled;
  - Tailwind enabled;
  - app has route shell.
- Dependencies:
  - Task 1.1.

---

## Epic 2: UI/UX Design System

### Task 2.1: Generate Design System Board

- Priority: P0
- Skill: GPT image2 prompt playbook
- Files likely edited:
  - `docs/design-system-notes.md` or design assets folder
- Acceptance criteria:
  - selected palette;
  - typography direction;
  - card/button/modal direction;
  - risk state colors.
- Do not touch:
  - implementation code.

### Task 2.2: Convert design system to frontend tokens

- Priority: P0
- Skill: ui-ux-pro-max-skill
- Files likely edited:
  - `tailwind.config.*`
  - `apps/web/src/styles/*`
- Acceptance criteria:
  - design tokens are documented;
  - Tailwind can represent chosen style;
  - no excessive custom CSS.
- Dependencies:
  - Task 2.1.

---

## Epic 3: Wallet and Network

### Task 3.1: Add Sui wallet provider

- Priority: P0
- Skill: Mysten sui-frontend
- Files likely edited:
  - `apps/web/src/main.tsx`
  - `apps/web/src/App.tsx`
  - `apps/web/src/components/layout/WalletPanel.tsx`
- Acceptance criteria:
  - wallet connect works;
  - connected address displays;
  - disconnect state displays.
- Do not touch:
  - PTB builders yet.

### Task 3.2: Add network selection/display

- Priority: P0
- Skill: Mysten Sui TS SDK
- Files likely edited:
  - `useCurrentNetwork.ts`
  - `NetworkBadge.tsx`
- Acceptance criteria:
  - selected network is visible;
  - RPC URL is centralized;
  - localStorage can remember last network.

---

## Epic 4: Manager Import and Storage

### Task 4.1: Manager input component

- Priority: P0
- Skill: none / project docs
- Files likely edited:
  - `components/manager/ManagerInput.tsx`
  - `types/margin.ts`
- Acceptance criteria:
  - user can paste object ID;
  - invalid format shows error;
  - user selects SUI/USDC.

### Task 4.2: localStorage manager history

- Priority: P0
- Skill: none / project docs
- Files likely edited:
  - `hooks/useLocalManagers.ts`
  - `lib/storage/localManagers.ts`
- Acceptance criteria:
  - save manager;
  - list saved managers;
  - delete saved manager;
  - refresh preserves records;
  - no secrets stored.

---

## Epic 5: DeepBook Read-only Integration

### Task 5.1: DeepBook client adapter

- Priority: P0
- Skill: Mysten sui-ts-sdk first; sui-eco DeepBook supplement if needed
- Files likely edited:
  - `lib/deepbook/client.ts`
  - `lib/deepbook/poolKeys.ts`
- Acceptance criteria:
  - client setup is centralized;
  - network-specific pool keys are centralized;
  - no raw client creation inside components.

### Task 5.2: Manager state adapter

- Priority: P0
- Skill: Mysten Sui docs/skills; sui-eco DeepBook if needed
- Files likely edited:
  - `lib/deepbook/managerAdapter.ts`
  - `lib/deepbook/normalizeManagerState.ts`
  - `hooks/useMarginManagerState.ts`
- Acceptance criteria:
  - raw SDK response is normalized;
  - UI uses `NormalizedMarginState`;
  - errors are recoverable;
  - uncertain APIs are isolated.

---

## Epic 6: Risk Engine

### Task 6.1: Risk math functions

- Priority: P0
- Skill: project docs
- Files likely edited:
  - `lib/risk/value.ts`
  - `lib/risk/riskRatio.ts`
  - `lib/risk/thresholds.ts`
  - `lib/risk/interest.ts`
- Acceptance criteria:
  - calculate asset/debt values;
  - calculate risk ratio;
  - classify risk;
  - simulate interest drift;
  - tests added.

### Task 6.2: Rescue simulation functions

- Priority: P0
- Skill: project docs
- Files likely edited:
  - `lib/risk/rescuePlans.ts`
  - `types/rescue.ts`
- Acceptance criteria:
  - add collateral simulation works;
  - reduce-only estimate works;
  - stop-loss recommendation works;
  - outputs warnings and confidence.

---

## Epic 7: Risk Dashboard

### Task 7.1: Build dashboard with mock data

- Priority: P0
- Skill: ui-ux-pro-max-skill
- Files likely edited:
  - `routes/Dashboard.tsx`
  - `components/risk/*`
  - `lib/demo/mockMarginState.ts`
- Acceptance criteria:
  - dashboard is usable with mock state;
  - risk states render correctly;
  - layout is responsive enough for demo.

### Task 7.2: Connect dashboard to real manager state

- Priority: P0
- Skill: Mysten / DeepBook adapters
- Files likely edited:
  - `hooks/useRiskSnapshot.ts`
  - `routes/Dashboard.tsx`
- Acceptance criteria:
  - imported manager drives dashboard;
  - loading/error/empty states work;
  - mock fallback is only used in Demo Mode or explicit fallback.

---

## Epic 8: Rescue Simulator

### Task 8.1: Rescue plan cards

- Priority: P0
- Skill: ui-ux-pro-max-skill
- Files likely edited:
  - `components/rescue/*`
  - `hooks/useRescuePlans.ts`
- Acceptance criteria:
  - three rescue plans appear;
  - each plan shows before/after risk;
  - Add Collateral has active CTA;
  - P1 plans can be disabled with explanation.

### Task 8.2: Transaction Review Modal UI

- Priority: P0
- Skill: ui-ux-pro-max-skill
- Files likely edited:
  - `components/rescue/TransactionReviewModal.tsx`
- Acceptance criteria:
  - shows action details;
  - shows before/after;
  - shows failure conditions;
  - cancel and confirm states work.

---

## Epic 9: Add Collateral PTB

### Task 9.1: Verify SDK deposit path

- Priority: P0
- Skill: Mysten Sui TS SDK; sui-eco DeepBook supplement
- Files likely edited:
  - `lib/deepbook/managerAdapter.ts`
  - `lib/tx/buildAddCollateralTx.ts`
- Acceptance criteria:
  - exact SDK method is verified;
  - notes added if API differs from plan;
  - no unverified method names outside adapter/builder.

### Task 9.2: Build Add Collateral transaction

- Priority: P0
- Skill: Mysten Sui TS SDK
- Files likely edited:
  - `lib/tx/buildAddCollateralTx.ts`
  - `hooks/useBuildRescueTx.ts`
- Acceptance criteria:
  - unsigned PTB is built in browser;
  - builder accepts validated amount;
  - builder does not sign.

### Task 9.3: Execute transaction and refresh

- Priority: P0
- Skill: Mysten sui-frontend / TS SDK
- Files likely edited:
  - `hooks/useExecuteTx.ts`
  - `components/rescue/RescueResultCard.tsx`
- Acceptance criteria:
  - wallet signs;
  - transaction digest displays;
  - app waits for confirmation;
  - manager state refetches;
  - failure is handled.

---

## Epic 10: P1 Reduce-only and TPSL

### Task 10.1: Reduce-only SDK investigation

- Priority: P1
- Skill: sui-eco DeepBook; Mysten TS SDK
- Files likely edited:
  - `lib/deepbook/orderAdapter.ts`
  - `lib/tx/buildReduceOnlyTx.ts`
- Acceptance criteria:
  - verified order API or documented blocker;
  - UI remains safe if not enabled.

### Task 10.2: Smart TPSL SDK investigation

- Priority: P1
- Skill: sui-eco DeepBook; Mysten TS SDK
- Files likely edited:
  - `lib/deepbook/tpslAdapter.ts`
  - `lib/tx/buildSmartTpslTx.ts`
  - `lib/tx/buildExecuteTriggeredTpslTx.ts`
- Acceptance criteria:
  - verified TPSL API or documented blocker;
  - execute-triggered path only shown if verified.

---

## Epic 11: Optional Move Contract

### Task 11.1: Create Move package skeleton

- Priority: P1 optional
- Skill: Mysten move
- Files likely edited:
  - `packages/move/Move.toml`
  - `packages/move/sources/margin_guard.move`
- Acceptance criteria:
  - package builds;
  - no custody logic;
  - profile and receipt objects defined.

### Task 11.2: Add Move tests

- Priority: P1 optional
- Skill: Mysten move
- Files likely edited:
  - `packages/move/tests/*`
- Acceptance criteria:
  - create profile test;
  - record receipt test;
  - owner check test.

### Task 11.3: Optional frontend integration

- Priority: P1 optional
- Skill: Mysten TS SDK
- Files likely edited:
  - `lib/tx/buildGuardProfileTx.ts`
  - `lib/tx/buildRescueReceiptTx.ts`
- Acceptance criteria:
  - profile creation available if package ID configured;
  - receipt recording optional;
  - Add Collateral works without it.

---

## Epic 12: Demo Mode and Submission

### Task 12.1: Demo Mode route

- Priority: P0
- Skill: ui-ux-pro-max-skill
- Files likely edited:
  - `routes/Demo.tsx`
  - `components/demo/*`
  - `lib/demo/*`
- Acceptance criteria:
  - demo runs without real manager;
  - mock labels visible;
  - price shock changes risk state;
  - rescue story is clear.

### Task 12.2: Hybrid demo integration

- Priority: P1
- Skill: project docs / Mysten SDK
- Files likely edited:
  - `hooks/useDemoScenario.ts`
  - `routes/Demo.tsx`
- Acceptance criteria:
  - can start from real manager state;
  - can apply simulated price overlay;
  - simulated shock is not presented as live DeepBook state;
  - Demo Mode cannot open a live wallet prompt.
- Round 7L status:
  - real Mainnet SUI/USDC manager baseline can seed Demo Mode where available;
  - Rescue Simulator can use a real manager baseline where eligible;
  - partial DeepBook state remains display-only;
  - healthy/no-rescue-needed managers remain blocked from live Add Collateral.

### Task 12.3: Submission polish

- Priority: P0
- Skill: superpowers, UI/UX skill
- Files likely edited:
  - `README.md`
  - `docs/DEMO_SCRIPT.md`
  - `docs/SUBMISSION_CHECKLIST.md`
  - `docs/FINAL_DEMO_QA.md`
  - `docs/DEPLOYMENT.md`
  - screenshots/assets
- Acceptance criteria:
  - demo path stable;
  - README explains scope;
  - risk disclaimer visible;
  - no unsupported claims.
- Round 6 status:
  - submission docs must preserve the truth boundary: Add Collateral PTB is implemented and safety-gated, live signing is disabled by default, and no live Add Collateral success is claimed without a real digest;
  - public demo should use Demo Mode fallback when no safe action-needed manager exists.
