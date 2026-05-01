# Frontend Implementation Plan

This document translates the MarginGuard product and UI/UX plan into an implementation-ready React architecture. It does not contain final code; it defines structure, boundaries, and engineering tasks.

---

## Table of Contents

1. [Recommended Stack](#recommended-stack)
2. [Application Structure](#application-structure)
3. [Routes](#routes)
4. [Core Components](#core-components)
5. [Core Hooks](#core-hooks)
6. [Library Modules](#library-modules)
7. [Risk Calculation Module](#risk-calculation-module)
8. [PTB Builder Module](#ptb-builder-module)
9. [Storage Module](#storage-module)
10. [Demo Data Module](#demo-data-module)
11. [State Management Strategy](#state-management-strategy)
12. [Responsive Design Strategy](#responsive-design-strategy)
13. [Error and Loading States](#error-and-loading-states)
14. [Implementation Order](#implementation-order)

---

## Recommended Stack

Use:

- Vite;
- React;
- TypeScript;
- Tailwind CSS;
- `@mysten/dapp-kit`;
- `@mysten/sui`;
- `@mysten/deepbook-v3`;
- `@tanstack/react-query`;
- optional `zustand`;
- optional `recharts` or SVG charts;
- pnpm workspaces.

Avoid:

- Next.js API routes;
- server actions;
- backend frameworks;
- databases;
- hosted workers;
- indexer clients that imply global scanning;
- heavy UI frameworks that slow hackathon iteration.

---

## Application Structure

```text
apps/web/src/
  main.tsx
  App.tsx

  routes/
    Landing.tsx
    Dashboard.tsx
    Demo.tsx
    Settings.tsx

  components/
    layout/
    manager/
    risk/
    rescue/
    demo/

  hooks/
    useCurrentNetwork.ts
    useDeepBookClient.ts
    useLocalManagers.ts
    useMarginManagerState.ts
    useRiskSnapshot.ts
    useRescuePlans.ts
    useBuildRescueTx.ts
    useExecuteTx.ts
    useDemoScenario.ts

  lib/
    deepbook/
    risk/
    tx/
    storage/
    demo/
    utils/

  types/
    margin.ts
    risk.ts
    rescue.ts
    demo.ts
    tx.ts
```

---

## Routes

### `/`

Landing page.

Purpose:

- explain product positioning;
- route to dashboard;
- route to demo;
- show no backend / no indexer / no keeper transparency.

### `/dashboard`

Main risk console.

Purpose:

- connect wallet;
- import/select manager;
- read manager state;
- show Risk Dashboard;
- open Rescue Simulator.

### `/demo`

Stable hackathon demo.

Purpose:

- run mock/hybrid demo;
- show price shock;
- show risk worsening;
- show rescue plan;
- optionally review the safety-gated Add Collateral PTB path.

### `/settings`

Optional settings.

Purpose:

- manage saved managers;
- select network;
- set default target ratio;
- clear localStorage.

---

## Core Components

### Layout

| Component | Responsibility |
|---|---|
| `AppShell` | Page frame, nav, responsive shell |
| `NetworkBadge` | Show selected Sui network |
| `WalletPanel` | Wallet connect/disconnect and address |
| `PageHeader` | Title, subtitle, primary action |

### Manager

| Component | Responsibility |
|---|---|
| `ManagerInput` | Manual manager object ID entry |
| `ManagerSelector` | Select saved manager |
| `ManagerStatusCard` | Show active manager, pool, network |
| `ManagerImportEmptyState` | Explain no indexer/manual import |

### Risk

| Component | Responsibility |
|---|---|
| `RiskGauge` | Visual risk ratio display |
| `RiskLevelBadge` | Healthy/Guarded/Caution/Warning/Liquidatable |
| `LiquidationDistance` | Show distance to threshold |
| `InterestDriftCard` | Show borrow APR drift projection |
| `DebtCollateralBreakdown` | Show assets and debts |
| `RiskPathChart` | Show risk transition or projection |

### Rescue

| Component | Responsibility |
|---|---|
| `RescuePlanGrid` | Three rescue plan comparison |
| `AddCollateralPlanCard` | P0 add collateral plan |
| `ReduceOnlyPlanCard` | P1 reduce-only plan |
| `SmartTpslPlanCard` | P1 stop-loss plan |
| `TransactionReviewModal` | Pre-wallet-signing review |
| `RescueResultCard` | Success/failure/expected after state |

### Demo

| Component | Responsibility |
|---|---|
| `DemoScenarioStepper` | Show demo stages |
| `DemoPriceSlider` | Simulated price shock |
| `DemoStateBanner` | Mock/hybrid/real state label |
| `DemoRescueTimeline` | Before/after story |
| `DemoFallbackNotice` | Chain failure fallback explanation |

---

## Core Hooks

| Hook | Responsibility |
|---|---|
| `useCurrentNetwork` | Manage selected network and RPC URL |
| `useLocalManagers` | Save/load/delete manager IDs from localStorage |
| `useDeepBookClient` | Build SDK client with active wallet/network/manager |
| `useMarginManagerState` | Read manager state with React Query |
| `useRiskSnapshot` | Convert manager state into display metrics |
| `useRescuePlans` | Generate three rescue plans |
| `useBuildRescueTx` | Select correct PTB builder for chosen plan |
| `useExecuteTx` | Wallet signing, execution, confirmation wait |
| `useDemoScenario` | Manage demo step, simulated price, mock state |

---

## Library Modules

### `lib/deepbook`

Purpose: isolate DeepBook SDK integration.

Files:

- `client.ts`: create Sui/DeepBook client.
- `poolKeys.ts`: map supported pools by network.
- `managerAdapter.ts`: read manager state.
- `orderAdapter.ts`: reduce-only order helpers.
- `tpslAdapter.ts`: TPSL helpers.
- `normalizeManagerState.ts`: convert raw SDK output into internal type.

Rule: no React component should import raw DeepBook SDK methods directly.

### `lib/risk`

Purpose: pure risk calculations.

Files:

- `thresholds.ts`;
- `value.ts`;
- `riskRatio.ts`;
- `liquidation.ts`;
- `interest.ts`;
- `rescuePlans.ts`;
- `sanityChecks.ts`.

Rule: no network calls here.

### `lib/tx`

Purpose: build browser-side PTBs.

Files:

- `buildAddCollateralTx.ts`;
- `buildReduceOnlyTx.ts`;
- `buildSmartTpslTx.ts`;
- `buildExecuteTriggeredTpslTx.ts`;
- `buildGuardProfileTx.ts`;
- `buildRescueReceiptTx.ts`.

Rule: transaction builders do not sign. Wallet signs outside builders.

### `lib/storage`

Purpose: localStorage utilities.

Files:

- `localManagers.ts`.

Rule: never store secrets or chain state as truth.

### `lib/demo`

Purpose: mock and hybrid demo scenarios.

Files:

- `scenarios.ts`;
- `mockMarginState.ts`;
- `demoPricePath.ts`.

Rule: all mock values must be labeled in UI.

---

## Risk Calculation Module

The risk engine should support these calculations:

| Function | Purpose |
|---|---|
| `calcAssetValueUsd` | Convert base/quote assets into USD value |
| `calcDebtValueUsd` | Convert base/quote debts into USD value |
| `calcRiskRatio` | Assets / debts |
| `classifyRisk` | Map ratio to status |
| `requiredAddCollateralValueUsd` | Amount needed to reach target ratio |
| `simulateAddCollateral` | Expected after ratio after adding collateral |
| `simulateReduceOnly` | Expected after ratio after partial repayment/reduction |
| `simulateInterestDrift` | Project ratio decline from borrow APR |
| `recommendStopLoss` | Recommend trigger above liquidation price |

### Testing requirement

Unit test risk functions with deterministic fixtures.

### Precision requirement

Use display numbers only for UI and simulation. Use protocol atomic amounts/bigint when building transactions.

---

## PTB Builder Module

### Add Collateral

Priority: P0.

Builder responsibilities:

- accept manager key / object ID;
- accept collateral coin and amount;
- use verified SDK deposit path;
- optionally include receipt call if Move package enabled;
- return unsigned transaction.

### Reduce-only

Priority: P1.

Builder responsibilities:

- use verified DeepBook reduce-only order API;
- support partial close amount;
- optionally cancel risky open orders if supported;
- expose slippage/failure warnings.

### Smart TPSL

Priority: P1.

Builder responsibilities:

- use verified DeepBook TPSL API;
- create conditional order with recommended trigger;
- expose execution assumptions;
- optionally build permissionless execute-triggered-order transaction.

### Builder rules

- builders do not call wallet signing;
- builders do not show UI;
- builders do not fetch stale state unless explicitly part of their contract;
- UI must re-fetch state before building;
- transaction review must happen before wallet prompt.

---

## Storage Module

Use localStorage for convenience only.

Allowed records:

- manager object ID;
- display pair;
- pool key;
- network;
- timestamps;
- demo settings.

Not allowed:

- private keys;
- seed phrases;
- signed transactions;
- full historical chain state;
- all-user data;
- anything implying indexer behavior.

---

## Demo Data Module

Demo data should include:

- initial guarded state;
- simulated price drop;
- warning state;
- generated rescue plans;
- post-rescue state;
- fallback transaction result.

Recommended scenario:

```text
Pair: SUI/USDC
Direction: Long SUI
Initial price: 1.50
Shock price: 1.35
Initial risk ratio: 1.25
Warning risk ratio: 1.17
Liquidation threshold: 1.10
Target rescue ratio: 1.30
Recommended Add Collateral: 45 USDC
Recommended Reduce-only: 22%
Recommended Stop-loss: 1.36 USDC
```

Every mock scenario must display "Simulated" or "Demo" labels.

---

## State Management Strategy

### React Query

Use for:

- manager state reads;
- transaction confirmation;
- optional object reads.

### Local component state

Use for:

- modal state;
- selected rescue plan;
- form input;
- target ratio slider.

### Zustand

Use only if state becomes cross-page and hard to manage, such as:

- active manager selection;
- global demo mode;
- design system preferences.

Do not overuse Zustand for chain state.

---

## Responsive Design Strategy

Desktop first for hackathon demo, but not desktop-only.

### Breakpoints

- Desktop: full dashboard grid.
- Tablet: two-column cards, sidebar collapses.
- Mobile: single-column cards, bottom/compact nav.

### Priority on small screens

1. Risk Ratio.
2. Current status.
3. Recommended action.
4. Rescue plan cards.
5. Details and charts.

### Rules

- Do not squeeze desktop dashboard into mobile.
- Keep metric cards readable.
- Avoid tiny chart labels.
- Transaction modal must be usable on mobile.

---

## Error and Loading States

Every data-dependent section needs:

- loading skeleton;
- empty state;
- RPC failure state;
- invalid manager state;
- unsupported pool state;
- transaction pending state;
- transaction rejected state;
- transaction failed state;
- transaction confirmed state.

Error messages should be specific:

- "Could not read this manager on testnet. Check network and object ID."
- "This action requires a connected wallet."
- "Reduce-only PTB is a P1 feature and is not enabled in this build."
- "This value is simulated for Demo Mode."

---

## Implementation Order

1. Project scaffold.
2. Design tokens from UIUX workflow.
3. Landing route shell.
4. Wallet provider.
5. Manager import/localStorage.
6. Mock dashboard with demo data.
7. Risk engine pure functions and tests.
8. DeepBook SDK adapter.
9. Replace mock dashboard with real manager reads.
10. Rescue simulator.
11. Transaction review modal.
12. Add Collateral PTB.
13. Demo Mode.
14. P1 reduce-only / TPSL.
15. Optional Move receipt integration.
