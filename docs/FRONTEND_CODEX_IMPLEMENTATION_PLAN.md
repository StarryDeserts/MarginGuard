# MarginGuard Frontend Codex Implementation Plan

> File: `docs/FRONTEND_CODEX_IMPLEMENTATION_PLAN.md`  
> Purpose: guide Codex through detailed frontend implementation based on the finalized MarginGuard UI/UX assets.

---

## 0. Context

MarginGuard is a browser-only pre-liquidation rescue layer for DeepBook Margin on Sui.

It is not another leverage trading frontend. It is an active risk console and rescue PTB builder that helps users:

1. connect Sui Wallet;
2. manually import a DeepBook Margin Manager ID;
3. read current margin risk;
4. understand risk ratio, liquidation distance, asset/debt exposure, and borrow APR drift;
5. simulate three rescue paths;
6. review and sign wallet-approved rescue PTBs.

The hackathon MVP must stay within these constraints:

- no backend;
- no custom indexer;
- no keeper bot;
- no global position scanning;
- browser-only frontend;
- Sui Wallet + Sui RPC + DeepBook Margin SDK;
- optional lightweight Move contract only for profile / receipt metadata;
- SUI/USDC first;
- Add Collateral PTB first.

These constraints come from the existing project architecture and development plan, which define MarginGuard as a browser-only app with Sui RPC / DeepBook SDK reads, wallet-signed writes, localStorage manager history, and no backend/indexer/keeper infrastructure. :contentReference[oaicite:0]{index=0}

---

## 1. Required UI/UX Skill

### Required skill

Codex must use:

```txt
ui-ux-pro-max
```

### When to use it

Use `ui-ux-pro-max` before and during frontend implementation for:

- converting the finalized UI assets into component architecture;
- translating visual style into Tailwind tokens;
- checking layout fidelity against the UI reference images;
- validating responsive behavior;
- reviewing card, modal, dashboard, CTA, and chart implementation quality;
- ensuring the app remains production-ready rather than a rough prototype.

The existing skill usage plan already positions `ui-ux-pro-max` as the skill to translate approved UI/UX direction into implementable frontend plans after design direction is selected.

### Usage rule

Codex must not use `ui-ux-pro-max` to invent new product scope.

It should only help implement the approved design direction from these assets:

```txt
assets/ui/00-landing-page.png
assets/ui/01-design-system-board.png
assets/ui/02-risk-dashboard.png
assets/ui/03-rescue-simulator.png
assets/ui/04-transaction-review.png
assets/ui/05-rescue-result.png
assets/ui/06-demo-mode.png
```

------

## 2. Final UI Reference Assets

Place all finalized UI images under:

```txt
apps/web/src/assets/ui/
```

or, if the repository prefers static public assets:

```txt
apps/web/public/ui/
```

Recommended filenames:

| Asset                        | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `00-landing-page.png`        | Public landing page visual reference                         |
| `01-design-system-board.png` | Design tokens, cards, buttons, badges, modals, chart language |
| `02-risk-dashboard.png`      | Main app dashboard page reference                            |
| `03-rescue-simulator.png`    | Rescue comparison and simulation page reference              |
| `04-transaction-review.png`  | Transaction review modal reference                           |
| `05-rescue-result.png`       | Transaction submitted / result modal reference               |
| `06-demo-mode.png`           | Demo Mode route reference                                    |

### Asset usage rules

Codex should treat these images as visual references, not exact pixel blueprints.

Follow:

- layout intent;
- component hierarchy;
- visual density;
- color language;
- typography hierarchy;
- risk state emphasis;
- CTA hierarchy;
- modal structure.

Do not replicate:

- text artifacts;
- malformed icons;
- visual noise;
- tiny unreadable labels;
- inconsistent generated details.

The UI/UX workflow requires design system and core screens to be finalized before frontend implementation, and it defines Risk Dashboard, Rescue Simulator, Transaction Review, and Demo Mode as the core product screens.

------

## 3. Recommended Frontend Stack

Use:

```txt
Vite
React
TypeScript
Tailwind CSS
React Router
@tanstack/react-query
@vitejs/plugin-react
@mysten/sui
@mysten/dapp-kit
@mysten/deepbook-v3
clsx
recharts or lightweight SVG charts
```

The engineering plan recommends Vite + React rather than Next.js because MarginGuard v0 must remain a static frontend without API routes, server actions, or hidden backend behavior.

------

## 4. Implementation Strategy

### Core strategy

Implement in this order:

1. static frontend UI;
2. mock data wiring;
3. risk engine pure functions;
4. wallet connection;
5. manager import and localStorage;
6. DeepBook read adapter;
7. Add Collateral PTB;
8. transaction review and result flow;
9. optional Move receipt;
10. P1 reduce-only and TPSL paths.

Do not start by integrating DeepBook SDK or PTB execution.

The first milestone should produce a complete clickable static app using mock data and visual fidelity to the approved UI assets.

------

## 5. Repository Structure

Recommended structure:

```txt
marginguard/
  apps/
    web/
      src/
        main.tsx
        App.tsx

        routes/
          Landing.tsx
          Dashboard.tsx
          RescueSimulator.tsx
          Demo.tsx
          Settings.tsx

        components/
          layout/
            AppShell.tsx
            MarketingShell.tsx
            Sidebar.tsx
            TopContextBar.tsx
            NetworkBadge.tsx
            WalletPill.tsx
            StatusPill.tsx

          landing/
            LandingHero.tsx
            LandingNav.tsx
            ProductPreviewPanel.tsx
            WhyMarginGuard.tsx
            HowItWorks.tsx
            LandingCTA.tsx
            ArchitecturePrinciples.tsx

          manager/
            ManagerInput.tsx
            ManagerSelector.tsx
            ManagerContextCard.tsx
            ManagerImportEmptyState.tsx

          risk/
            RiskSummaryHero.tsx
            MetricCard.tsx
            RiskLevelBadge.tsx
            RiskRatioPathChart.tsx
            LiquidationDistanceCard.tsx
            InterestDriftCard.tsx
            DebtCollateralBreakdown.tsx
            RecommendedRescueActionCard.tsx

          rescue/
            RescuePlanGrid.tsx
            RescuePlanCard.tsx
            AddCollateralPlanCard.tsx
            ReduceOnlyPlanCard.tsx
            SmartTpslPlanCard.tsx
            SimulationSummaryPanel.tsx
            LiquidationCushionComparison.tsx
            TransactionReviewModal.tsx
            RescueResultModal.tsx
            FailureConditionsCard.tsx

          demo/
            DemoScenarioStrip.tsx
            DemoScenarioControls.tsx
            DemoRiskPreview.tsx
            DemoStepper.tsx
            DemoRescueRecommendation.tsx
            DemoNotesCard.tsx

          ui/
            Button.tsx
            Card.tsx
            Input.tsx
            Select.tsx
            Badge.tsx
            Tooltip.tsx
            Modal.tsx
            Separator.tsx
            Skeleton.tsx

        hooks/
          useCurrentNetwork.ts
          useLocalManagers.ts
          useDeepBookClient.ts
          useMarginManagerState.ts
          useRiskSnapshot.ts
          useRescuePlans.ts
          useDemoScenario.ts
          useTransactionReview.ts
          useExecuteTx.ts

        lib/
          deepbook/
            client.ts
            poolKeys.ts
            managerAdapter.ts
            normalizeManagerState.ts
            orderAdapter.ts
            tpslAdapter.ts

          risk/
            thresholds.ts
            value.ts
            riskRatio.ts
            liquidation.ts
            interest.ts
            rescuePlans.ts
            sanityChecks.ts

          tx/
            buildAddCollateralTx.ts
            buildReduceOnlyTx.ts
            buildSmartTpslTx.ts
            buildExecuteTriggeredTpslTx.ts
            buildGuardProfileTx.ts
            buildRescueReceiptTx.ts

          demo/
            scenarios.ts
            mockMarginState.ts
            demoPricePath.ts

          storage/
            localManagers.ts

          utils/
            format.ts
            bigint.ts
            cn.ts
            invariant.ts

        types/
          margin.ts
          risk.ts
          rescue.ts
          demo.ts
          tx.ts
```

This structure follows the earlier architecture principle that UI, risk engine, DeepBook SDK adapters, and PTB builders must remain isolated so SDK/API uncertainty does not affect the entire frontend.

------

## 6. Global Design Tokens

Use `01-design-system-board.png` as the primary visual source.

### Tailwind token tasks

| ID     | Task                     | Files                                          | Acceptance Criteria                                          |
| ------ | ------------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| UI-001 | Configure Tailwind theme | `tailwind.config.ts`, `src/styles/globals.css` | Dark navy background, cyan/electric blue accents, green/orange/red risk colors |
| UI-002 | Add font scale           | `tailwind.config.ts`                           | Display, H1, H2, card title, body, caption, metric number    |
| UI-003 | Add card styles          | `components/ui/Card.tsx`                       | Deep navy card, thin border, subtle glow, rounded corners    |
| UI-004 | Add button variants      | `components/ui/Button.tsx`                     | primary, secondary, ghost, danger, disabled, loading         |
| UI-005 | Add badge variants       | `components/ui/Badge.tsx`                      | Healthy, Guarded, Caution, Warning, Liquidatable, P0, P1, Recommended |
| UI-006 | Add input/select styles  | `components/ui/Input.tsx`, `Select.tsx`        | default, focus, error, disabled                              |
| UI-007 | Add modal shell          | `components/ui/Modal.tsx`                      | Center modal, dimmed background, accessible close, footer actions |

### Required visual tokens

```ts
riskColors = {
  healthy: 'green',
  guarded: 'cyan/blue',
  caution: 'yellow',
  warning: 'orange',
  liquidatable: 'red',
}

brandColors = {
  background: 'deep navy',
  surface: 'blue-black',
  surfaceElevated: 'dark card navy',
  border: 'blue-gray',
  accent: 'sui cyan',
  primary: 'electric blue',
}
```

------

## 7. Shared Domain Types

Create these before building pages.

### `types/margin.ts`

```ts
export type AppNetwork = 'mainnet' | 'testnet';

export type SupportedPoolKey = 'SUI_USDC' | 'SUI_DBUSDC';

export type MarginManagerRef = {
  objectId: string;
  poolKey: SupportedPoolKey;
  displayPair: 'SUI/USDC';
  network: AppNetwork;
  owner?: string;
  addedAtMs?: number;
};

export type NormalizedMarginState = {
  manager: MarginManagerRef;
  baseSymbol: 'SUI';
  quoteSymbol: 'USDC' | 'DBUSDC';
  baseAsset: number;
  quoteAsset: number;
  baseDebt: number;
  quoteDebt: number;
  basePriceUsd: number;
  quotePriceUsd: number;
  assetValueUsd: number;
  debtValueUsd: number;
  riskRatio: number;
  liquidationRiskRatio: number;
  targetRiskRatio: number;
  liquidationDistancePct: number;
  borrowApr?: number;
  updatedAtMs: number;
  source: 'deepbook' | 'demo';
};
```

### `types/rescue.ts`

```ts
export type RescueActionType =
  | 'ADD_COLLATERAL'
  | 'REDUCE_ONLY_CLOSE'
  | 'SMART_TPSL';

export type RescueExecutionMode =
  | 'real-ptb'
  | 'p1-sdk-required'
  | 'demo-only';

export type RescuePlan = {
  id: string;
  type: RescueActionType;
  title: string;
  subtitle: string;
  description: string;
  beforeRiskRatio: number;
  expectedAfterRiskRatio?: number;
  targetRiskRatio: number;
  liquidationDistanceBeforePct: number;
  liquidationDistanceAfterPct?: number;
  estimatedGasSui?: number;
  estimatedCostUsd?: number;
  recommended: boolean;
  priority: 'P0' | 'P1';
  executionMode: RescueExecutionMode;
  warnings: string[];
  params: Record<string, string | number | boolean>;
};
```

### `types/demo.ts`

```ts
export type DemoStep =
  | 'IMPORT_MANAGER'
  | 'PRICE_SHOCK'
  | 'RISK_WARNING'
  | 'RESCUE_PLAN'
  | 'REVIEW_PTB'
  | 'RISK_IMPROVED';

export type DemoScenario = {
  id: string;
  title: string;
  market: 'SUI/USDC';
  startPrice: number;
  shockedPrice: number;
  startingRiskRatio: number;
  simulatedRiskRatio: number;
  liquidationThreshold: number;
  targetRiskRatio: number;
  borrowAprBefore: number;
  borrowAprAfter: number;
};
```

------

## 8. Mock Data Requirements

Create:

```txt
src/lib/demo/mockMarginState.ts
src/lib/demo/scenarios.ts
src/lib/demo/mockRescuePlans.ts
```

### Required mock values

Use these values consistently across UI:

```txt
Wallet: 0x3a8b...7cF2
Manager: 0x1234...abcd5678
Network: Mainnet
Market: SUI/USDC Margin Manager

Current RR: 1.17
Starting RR: 1.25
Liquidation Threshold: 1.10
Target Rescue Ratio: 1.30
Liquidation Distance: 6.4%
After Add Collateral RR: 1.30
After Reduce-only RR: 1.27
Smart TPSL Stop-loss: 1.36 USDC
Liquidation Price: 1.29 USDC
Add Collateral Amount: 45 USDC
Reduce-only Size: 22%
Asset Value: $540.00
Debt Value: $461.54
Borrow APR: 6.42%
Demo Borrow APR: 8.20%
Gas Fee: ~0.002 SUI
```

------

## 9. Page Implementation Breakdown

# 9.1 Landing Page

Reference asset:

```txt
00-landing-page.png
```

Route:

```txt
/
```

Files:

```txt
routes/Landing.tsx
components/landing/LandingNav.tsx
components/landing/LandingHero.tsx
components/landing/ProductPreviewPanel.tsx
components/landing/WhyMarginGuard.tsx
components/landing/HowItWorks.tsx
components/landing/ArchitecturePrinciples.tsx
components/landing/LandingCTA.tsx
components/landing/LandingFooter.tsx
```

### Component breakdown

| Component                | Content                                                      | State       |
| ------------------------ | ------------------------------------------------------------ | ----------- |
| `LandingNav`             | Logo, Product, How It Works, Demo, Architecture, Launch App  | Static      |
| `LandingHero`            | Headline, subheadline, CTA buttons, architecture pills       | Static      |
| `ProductPreviewPanel`    | Risk Dashboard-inspired preview with transaction review strip | Static/mock |
| `WhyMarginGuard`         | 3 cards: monitor, simulate, execute safely                   | Static      |
| `HowItWorks`             | 4 steps: Monitor, Simulate, Review, Execute                  | Static      |
| `ArchitecturePrinciples` | No backend, no indexer, no keeper, browser-only, user control | Static      |
| `LandingCTA`             | “Rescue before liquidation.” Launch / Demo buttons           | Static      |

### Required interactions

| Interaction  | Behavior                                 |
| ------------ | ---------------------------------------- |
| Launch App   | Navigate to `/dashboard`                 |
| View Demo    | Navigate to `/demo`                      |
| How It Works | Anchor scroll to section                 |
| Architecture | Anchor scroll to architecture principles |

### Copy corrections for implementation

Use:

```txt
Why MarginGuard
```

instead of:

```txt
Why traders choose MarginGuard
```

Use:

```txt
Monitor risk before liquidation
```

instead of:

```txt
Prevent liquidations
```

Do not include `Pricing` in nav for MVP. Use `Docs` or remove it.

### Acceptance criteria

- Looks visually aligned with the final landing page asset.
- Hero is not too dense.
- Right product preview is readable.
- No backend / no indexer / no keeper appears clearly.
- Page does not imply automatic rescue or 24/7 keeper behavior.
- CTA routes work.
- Mobile layout stacks cleanly.

------

# 9.2 App Shell

Reference assets:

```txt
02-risk-dashboard.png
03-rescue-simulator.png
06-demo-mode.png
```

Files:

```txt
components/layout/AppShell.tsx
components/layout/Sidebar.tsx
components/layout/TopContextBar.tsx
components/layout/WalletPill.tsx
components/layout/NetworkBadge.tsx
components/layout/StatusPill.tsx
```

### Component breakdown

| Component       | Content                                                      | State                    |
| --------------- | ------------------------------------------------------------ | ------------------------ |
| `AppShell`      | Sidebar + topbar + content outlet                            | active route             |
| `Sidebar`       | Logo, Overview, Risk Dashboard, Rescue Simulator, Demo Mode, Settings | active nav               |
| `TopContextBar` | wallet, network, manager ID, market, architecture note       | connected / disconnected |
| `WalletPill`    | short wallet address                                         | connected / disconnected |
| `NetworkBadge`  | Mainnet/Testnet/Wrong network                                | normal / warning         |
| `StatusPill`    | No backend • No indexer • No keeper                          | static                   |

### Sidebar nav mapping

```txt
Overview -> /dashboard
Risk Dashboard -> /dashboard
Rescue Simulator -> /rescue
Demo Mode -> /demo
Settings -> /settings
```

### Acceptance criteria

- Same layout language as Risk Dashboard and Simulator assets.
- Active route is visually clear.
- Sidebar collapses or stacks for smaller screens.
- No app shell page introduces backend/keeper concepts.

------

# 9.3 Risk Dashboard

Reference asset:

```txt
02-risk-dashboard.png
```

Route:

```txt
/dashboard
```

Files:

```txt
routes/Dashboard.tsx
components/risk/RiskSummaryHero.tsx
components/risk/MetricCard.tsx
components/risk/RiskRatioPathChart.tsx
components/manager/ManagerContextCard.tsx
components/risk/RecommendedRescueActionCard.tsx
components/risk/InterestDriftCard.tsx
hooks/useRiskSnapshot.ts
```

### Layout

| Zone         | Components                              |
| ------------ | --------------------------------------- |
| Top summary  | `RiskSummaryHero`, `ManagerContextCard` |
| Metrics row  | `MetricCard` grid                       |
| Bottom left  | `RiskRatioPathChart`                    |
| Bottom right | `RecommendedRescueActionCard`           |

### Required dashboard states

| State             | Description          | UI                              |
| ----------------- | -------------------- | ------------------------------- |
| `no-wallet`       | Wallet not connected | Show connect prompt             |
| `no-manager`      | No manager imported  | Show manager import empty state |
| `loading-manager` | Manager read pending | Skeleton cards                  |
| `manager-error`   | RPC/SDK error        | Recoverable error card          |
| `warning`         | RR 1.17              | Orange risk hero                |
| `healthy`         | RR >= 1.30           | Green/blue healthy hero         |
| `demo-source`     | Mock state           | Show “Simulated” label          |
| `real-source`     | DeepBook state       | Show refreshed timestamp        |

### Required content

```txt
Current Risk Ratio: 1.17
Status: Warning
Liquidation Threshold: 1.10
Target Rescue Ratio: 1.30
Liquidation Distance: 6.4%
Asset Value: $540.00
Debt Value: $461.54
Borrow APR: 6.42%
Interest Drift: Risk ratio may decline over time
Recommended Action: Add 45 USDC to raise RR to 1.30
```

### Actions

| Action                    | Behavior                                               |
| ------------------------- | ------------------------------------------------------ |
| Open Rescue Simulator     | Navigate to `/rescue`                                  |
| Review Add Collateral PTB | Open `TransactionReviewModal` with Add Collateral plan |
| Refresh                   | Refetch manager state                                  |
| Manager copy icon         | Copy object ID                                         |

### Acceptance criteria

- User understands risk in under 10 seconds.
- RR `1.17 Warning` is dominant.
- No backend / no indexer / no keeper remains visible.
- Recommended action is clear.
- Chart lines include target `1.30` and liquidation `1.10`.
- Loading, empty, error, demo, and real states exist.

------

# 9.4 Rescue Simulator

Reference asset:

```txt
03-rescue-simulator.png
```

Route:

```txt
/rescue
```

Files:

```txt
routes/RescueSimulator.tsx
components/rescue/RescuePlanGrid.tsx
components/rescue/AddCollateralPlanCard.tsx
components/rescue/ReduceOnlyPlanCard.tsx
components/rescue/SmartTpslPlanCard.tsx
components/rescue/SimulationSummaryPanel.tsx
components/rescue/LiquidationCushionComparison.tsx
components/rescue/FailureConditionsCard.tsx
hooks/useRescuePlans.ts
```

### Layout

| Zone          | Components                              |
| ------------- | --------------------------------------- |
| Summary strip | Current RR, threshold, target           |
| Main cards    | Add Collateral, Reduce-only, Smart TPSL |
| Right panel   | Simulation Summary                      |
| Bottom left   | Risk Ratio Path                         |
| Bottom middle | Liquidation Cushion Comparison          |
| Bottom right  | Assumptions & Failure Conditions        |

### Rescue plan states

| Plan              | Priority | Execution         |
| ----------------- | -------- | ----------------- |
| Add Collateral    | P0       | Real PTB          |
| Reduce-only Close | P1       | SDK path required |
| Smart TPSL        | P1       | SDK path required |

### Required interactions

| Interaction       | Behavior                         |
| ----------------- | -------------------------------- |
| Select plan       | Updates `SimulationSummaryPanel` |
| Edit Add Amount   | Recalculate after RR             |
| Edit Reduce %     | Recalculate reduce-only after RR |
| Edit TPSL inputs  | Recalculate TPSL projection      |
| Simulate          | Update chart/comparison          |
| Review PTB        | Open transaction review modal    |
| Back to Dashboard | Navigate `/dashboard`            |

### Required states

| State                   | UI                                        |
| ----------------------- | ----------------------------------------- |
| Add Collateral selected | Green border, recommended badge           |
| Reduce-only selected    | Purple/blue P1 styling                    |
| Smart TPSL selected     | Purple P1 styling                         |
| P1 disabled             | Show `SDK path required`                  |
| Simulation stale        | Show “Estimates update while app is open” |
| Invalid input           | Input error styling                       |
| Insufficient balance    | Warning state                             |

### Acceptance criteria

- Three rescue plans are easy to compare.
- Add Collateral is visually primary.
- P1 actions do not appear as guaranteed MVP execution paths.
- Simulation summary updates from selected plan.
- No auto-execution claim appears.

------

# 9.5 Transaction Review Modal

Reference asset:

```txt
04-transaction-review.png
```

Files:

```txt
components/rescue/TransactionReviewModal.tsx
hooks/useTransactionReview.ts
```

### Trigger points

- Risk Dashboard `Review Add Collateral PTB`
- Rescue Simulator Add Collateral `Review PTB`
- Demo Mode `Review Add Collateral PTB`

### Modal sections

| Section         | Required content                                             |
| --------------- | ------------------------------------------------------------ |
| Header          | Review Rescue Transaction                                    |
| Action Summary  | Add Collateral, Wallet-signed PTB, SUI/USDC, DeepBook Margin, Manager |
| Impact Preview  | Before RR 1.17 → After RR 1.30                               |
| Details         | Amount 45 USDC, gas, wallet, network                         |
| Warnings        | stale price, insufficient balance, SDK call failure, rejected transaction |
| Acknowledgement | “I understand this is an estimate until confirmed onchain.”  |
| Footer          | Cancel, Sign Rescue PTB, Back to Simulator                   |

### Required states

| State          | Behavior                         |
| -------------- | -------------------------------- |
| closed         | Modal hidden                     |
| open-unchecked | Sign button disabled             |
| open-checked   | Sign button enabled              |
| building-tx    | Show loading                     |
| signing        | Wallet signing pending           |
| rejected       | Show recoverable rejection error |
| failed         | Show transaction failure         |
| submitted      | Open result modal                |

### Acceptance criteria

- User cannot sign without review acknowledgement.
- Warnings are visible.
- Button copy does not imply MarginGuard signs automatically.
- Modal is usable on mobile.
- No transaction executes before wallet approval.

------

# 9.6 Rescue Result Modal

Reference asset:

```txt
05-rescue-result.png
```

Files:

```txt
components/rescue/RescueResultModal.tsx
components/rescue/TransactionProgress.tsx
```

### Result states

| State      | UI                                |
| ---------- | --------------------------------- |
| submitted  | Transaction digest visible        |
| confirming | Confirmation timeline active      |
| refreshing | Manager state refresh in progress |
| updated    | Risk updated from manager state   |
| failed     | Failure explanation and retry     |
| rejected   | User rejected wallet signature    |

### Required content

```txt
Rescue PTB Submitted
Action: Add Collateral
Amount: 45 USDC
Transaction Digest: 9kX2...F4a9
Execution Mode: Wallet-signed PTB
Before RR: 1.17 Warning
Expected After RR: 1.30 Healthy
Liquidation Distance: 6.4% -> 17.6%
```

### Actions

| Action                 | Behavior                          |
| ---------------------- | --------------------------------- |
| Back to Risk Dashboard | Navigate `/dashboard` and refetch |
| View Transaction       | Open Sui Explorer                 |
| Run Demo Flow          | Navigate `/demo`                  |
| Close                  | Close result modal                |

### Acceptance criteria

- Expected vs confirmed risk state is clearly labeled.
- User sees transaction digest.
- No fake confirmation if transaction is not confirmed.
- Error states recover without losing context.

------

# 9.7 Demo Mode

Reference asset:

```txt
06-demo-mode.png
```

Route:

```txt
/demo
```

Files:

```txt
routes/Demo.tsx
components/demo/DemoScenarioStrip.tsx
components/demo/DemoScenarioControls.tsx
components/demo/DemoRiskPreview.tsx
components/demo/DemoStepper.tsx
components/demo/DemoRescueRecommendation.tsx
components/demo/DemoNotesCard.tsx
hooks/useDemoScenario.ts
lib/demo/scenarios.ts
lib/demo/demoPricePath.ts
```

### Layout

| Zone           | Components                                                   |
| -------------- | ------------------------------------------------------------ |
| Scenario strip | Scenario, start price, shocked price, starting RR, simulated RR |
| Left controls  | Scenario selector, price shock slider, borrow APR slider     |
| Center preview | Live risk metrics and simulated chart                        |
| Stepper        | Import Manager → Risk Improved                               |
| Right panel    | Recommended Rescue Action, Rescue Comparison, Demo Notes     |

### Required scenario

```txt
Scenario: SUI Price Shock
Start SUI Price: 1.50 USDC
Shocked Price: 1.35 USDC
Starting RR: 1.25 Guarded
Simulated RR: 1.17 Warning
Liquidation Threshold: 1.10
Target Rescue Ratio: 1.30
```

### Demo states

| State       | Description                     |
| ----------- | ------------------------------- |
| idle        | Default scenario loaded         |
| guarded     | RR 1.25                         |
| warning     | RR 1.17                         |
| rescue-plan | Add Collateral highlighted      |
| review      | Transaction review modal opened |
| improved    | After RR 1.30 shown             |
| fallback    | Transaction failure simulated   |

### Required interactions

| Interaction               | Behavior                               |
| ------------------------- | -------------------------------------- |
| Scenario selector         | Changes scenario                       |
| Price shock slider        | Updates price and RR                   |
| Borrow APR slider         | Updates borrow APR / drift             |
| Run Scenario              | Applies selected stress                |
| Open Rescue Simulator     | Navigate `/rescue` with selected state |
| Review Add Collateral PTB | Open TransactionReviewModal            |
| Stepper click             | Optional: jump between demo stages     |

### Acceptance criteria

- All simulated values are labeled.
- Demo works without real manager.
- Demo does not imply background monitoring.
- Demo tells a 3-minute story clearly.
- Add Collateral remains recommended P0 path.

------

# 9.8 Settings / Manager Import

Reference assets:

```txt
01-design-system-board.png
02-risk-dashboard.png
```

Route:

```txt
/settings
```

Files:

```txt
routes/Settings.tsx
components/manager/ManagerInput.tsx
components/manager/ManagerSelector.tsx
components/manager/ManagerImportEmptyState.tsx
hooks/useLocalManagers.ts
lib/storage/localManagers.ts
```

### Required features

| Feature        | Behavior                    |
| -------------- | --------------------------- |
| Add manager    | User pastes object ID       |
| Select market  | SUI/USDC                    |
| Save locally   | localStorage only           |
| Delete manager | Remove saved manager        |
| Select network | Mainnet/Testnet             |
| Clear data     | Remove localStorage records |

### Required states

| State                    | UI                  |
| ------------------------ | ------------------- |
| empty                    | No manager imported |
| invalid object ID        | Input error         |
| saved                    | Success state       |
| wrong network            | Warning             |
| localStorage unavailable | Error message       |

### Acceptance criteria

- No backend persistence.
- No scanning for all managers.
- Clear user-facing explanation: “Manager imported manually. No indexer required.”

------

## 10. State Matrix

| Domain      | States                                                       | Components                                              |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| Wallet      | disconnected, connected, wrong-network                       | `WalletPill`, `TopContextBar`, `TransactionReviewModal` |
| Manager     | none, input-invalid, imported, loading, error                | `ManagerInput`, `ManagerContextCard`, `Dashboard`       |
| Risk        | healthy, guarded, caution, warning, liquidatable             | `RiskSummaryHero`, `RiskLevelBadge`, `MetricCard`       |
| Data source | real, demo, simulated, stale                                 | `DemoStateBanner`, `RiskDashboard`, `DemoMode`          |
| Rescue plan | none, add-collateral, reduce-only, smart-tpsl                | `RescuePlanGrid`, `SimulationSummaryPanel`              |
| PTB         | idle, building, review, signing, submitted, confirmed, failed, rejected | `TransactionReviewModal`, `RescueResultModal`           |
| Demo        | idle, shock-applied, warning, plan-selected, review-open, improved | `DemoStepper`, `DemoScenarioControls`                   |

------

## 11. Detailed Development Task Table

| ID     | Priority | Page / Module     | Task                                           | Files                                               | Skill                              | Dependencies                   | Acceptance Criteria                                     |
| ------ | -------- | ----------------- | ---------------------------------------------- | --------------------------------------------------- | ---------------------------------- | ------------------------------ | ------------------------------------------------------- |
| FE-001 | P0       | Project           | Create Vite React TS app                       | `apps/web/*`                                        | ui-ux-pro-max for structure review | none                           | App runs with `pnpm dev`                                |
| FE-002 | P0       | Styling           | Configure Tailwind and global styles           | `tailwind.config.ts`, `globals.css`                 | ui-ux-pro-max                      | FE-001                         | Tokens match design board                               |
| FE-003 | P0       | Assets            | Add final UI references                        | `src/assets/ui/*`                                   | none                               | FE-001                         | All 7 reference images are stored                       |
| FE-004 | P0       | UI primitives     | Build Button/Card/Badge/Input/Modal primitives | `components/ui/*`                                   | ui-ux-pro-max                      | FE-002                         | Variants match design system                            |
| FE-005 | P0       | Layout            | Build MarketingShell                           | `components/layout/MarketingShell.tsx`              | ui-ux-pro-max                      | FE-004                         | Landing layout works                                    |
| FE-006 | P0       | Landing           | Implement Landing Page                         | `routes/Landing.tsx`, `components/landing/*`        | ui-ux-pro-max                      | FE-005                         | Matches final landing asset                             |
| FE-007 | P0       | Layout            | Build AppShell / Sidebar / TopContextBar       | `components/layout/*`                               | ui-ux-pro-max                      | FE-004                         | App shell matches dashboard assets                      |
| FE-008 | P0       | Mock data         | Add mock manager/risk/rescue data              | `lib/demo/*`                                        | none                               | FE-001                         | Static pages can render                                 |
| FE-009 | P0       | Dashboard         | Implement static Risk Dashboard                | `routes/Dashboard.tsx`, `components/risk/*`         | ui-ux-pro-max                      | FE-007, FE-008                 | Matches Risk Dashboard asset                            |
| FE-010 | P0       | Rescue            | Implement static Rescue Simulator              | `routes/RescueSimulator.tsx`, `components/rescue/*` | ui-ux-pro-max                      | FE-007, FE-008                 | Matches Rescue Simulator asset                          |
| FE-011 | P0       | Modal             | Implement Transaction Review Modal             | `TransactionReviewModal.tsx`                        | ui-ux-pro-max                      | FE-010                         | Review flow opens from Add Collateral                   |
| FE-012 | P0       | Result            | Implement Rescue Result Modal                  | `RescueResultModal.tsx`                             | ui-ux-pro-max                      | FE-011                         | Submitted/result states render                          |
| FE-013 | P0       | Demo              | Implement Demo Mode static page                | `routes/Demo.tsx`, `components/demo/*`              | ui-ux-pro-max                      | FE-007, FE-008                 | Matches Demo Mode asset                                 |
| FE-014 | P0       | Routing           | Add React Router routes                        | `App.tsx`                                           | none                               | FE-006, FE-009, FE-010, FE-013 | `/`, `/dashboard`, `/rescue`, `/demo`, `/settings` work |
| FE-015 | P0       | Risk engine       | Implement pure risk functions                  | `lib/risk/*`                                        | none                               | FE-008                         | Unit tests pass                                         |
| FE-016 | P0       | Simulator logic   | Wire rescue plan calculations                  | `useRescuePlans.ts`, `lib/risk/rescuePlans.ts`      | none                               | FE-015                         | Add Collateral sim reaches 1.30                         |
| FE-017 | P0       | Demo logic        | Wire demo scenario state                       | `useDemoScenario.ts`                                | none                               | FE-015                         | Sliders update simulated RR                             |
| FE-018 | P0       | Storage           | Implement manager localStorage                 | `useLocalManagers.ts`, `localManagers.ts`           | none                               | FE-007                         | Add/delete/select manager                               |
| FE-019 | P0       | Wallet            | Add dapp-kit wallet connect                    | `main.tsx`, `WalletPanel.tsx`, `TopContextBar.tsx`  | Sui frontend skill                 | FE-007                         | Wallet address displays                                 |
| FE-020 | P0       | Network           | Add network state                              | `useCurrentNetwork.ts`                              | Sui frontend skill                 | FE-019                         | Mainnet/testnet badge works                             |
| FE-021 | P0       | DeepBook adapter  | Create client/manager adapter stubs            | `lib/deepbook/*`                                    | Sui / DeepBook skill               | FE-020                         | Adapter boundary compiles                               |
| FE-022 | P0       | Manager read      | Replace mock with manager query                | `useMarginManagerState.ts`                          | Sui / DeepBook skill               | FE-021                         | Dashboard can read manager                              |
| FE-023 | P0       | PTB builder       | Implement Add Collateral builder               | `buildAddCollateralTx.ts`                           | Sui TS SDK skill                   | FE-022                         | Unsigned tx builds                                      |
| FE-024 | P0       | Execute           | Wire signing/execution hook                    | `useExecuteTx.ts`                                   | Sui frontend skill                 | FE-023                         | Wallet signing flow opens                               |
| FE-025 | P0       | Refresh           | Refetch manager after tx                       | `RescueResultModal.tsx`, query invalidation         | none                               | FE-024                         | Dashboard refreshes after success                       |
| FE-026 | P0       | QA                | Add visual and state QA checklist              | `docs/QA.md`                                        | ui-ux-pro-max                      | all static pages               | Checklist complete                                      |
| FE-027 | P1       | Reduce-only       | Investigate SDK path                           | `orderAdapter.ts`, `buildReduceOnlyTx.ts`           | DeepBook skill                     | FE-010                         | P1 path documented/enabled or disabled                  |
| FE-028 | P1       | Smart TPSL        | Investigate SDK path                           | `tpslAdapter.ts`, `buildSmartTpslTx.ts`             | DeepBook skill                     | FE-010                         | P1 path documented/enabled or disabled                  |
| FE-029 | P1       | Move receipt      | Optional receipt PTB                           | `buildRescueReceiptTx.ts`                           | Sui Move / TS SDK                  | FE-024                         | Receipt optional, not blocking                          |
| FE-030 | P0       | Submission polish | Final polish pass                              | all routes                                          | ui-ux-pro-max                      | FE-001–FE-026                  | No visual regressions                                   |

------

## 12. Page-Level Acceptance Criteria

### Landing Page

-  Looks like final landing reference.
-  No `Pricing` nav unless product owner explicitly keeps it.
-  Clear CTA to Launch App and View Demo.
-  No overclaim about preventing liquidation.
-  No backend/indexer/keeper clearly visible.

### Risk Dashboard

-  Current RR is dominant.
-  Warning state is clear.
-  Manager context is visible.
-  Recommended action is visible.
-  Chart includes target 1.30 and liquidation 1.10.
-  Loading/error/empty states exist.

### Rescue Simulator

-  Three rescue cards render.
-  Add Collateral is Recommended / P0 / Real PTB.
-  Reduce-only and Smart TPSL are P1 / SDK path required.
-  Simulation summary updates.
-  Review PTB opens modal.

### Transaction Review

-  Before/after RR visible.
-  Amount and gas visible.
-  Failure conditions visible.
-  Acknowledgement required.
-  Wallet signing language is explicit.

### Rescue Result

-  Transaction digest visible.
-  Expected vs confirmed state is labeled.
-  Manager refresh status visible.
-  User can return to dashboard.

### Demo Mode

-  Scenario controls work with mock data.
-  Simulated labels visible.
-  Stepper tells story clearly.
-  Recommended rescue path visible.
-  Demo works without wallet/manager.

------

## 13. Testing Plan

### Unit tests

Create tests for:

```txt
lib/risk/value.ts
lib/risk/riskRatio.ts
lib/risk/thresholds.ts
lib/risk/rescuePlans.ts
lib/risk/interest.ts
lib/storage/localManagers.ts
```

Required cases:

| Test                         | Expected                         |
| ---------------------------- | -------------------------------- |
| Asset/debt value calculation | deterministic USD values         |
| Risk ratio                   | asset / debt                     |
| Risk classification          | 1.17 -> Warning, 1.30 -> Healthy |
| Add Collateral simulation    | 1.17 -> 1.30                     |
| Reduce-only simulation       | 1.17 -> ~1.27                    |
| Interest drift               | risk ratio declines over time    |
| localStorage validation      | invalid object ID rejected       |

### Manual QA

| Flow              | Steps                                    |
| ----------------- | ---------------------------------------- |
| Landing           | Open `/`, click Launch App               |
| Dashboard mock    | Open `/dashboard`, see RR 1.17           |
| Rescue simulation | Open `/rescue`, select all three plans   |
| Review modal      | Open modal, check acknowledgement gating |
| Result modal      | Submit mock tx, see result               |
| Demo flow         | Open `/demo`, run scenario               |
| Manager storage   | Add/delete manager in settings           |
| Wallet            | Connect/disconnect wallet                |
| Responsive        | Check desktop, tablet, mobile widths     |

------

## 14. Codex Operating Rules

Before coding, Codex must read:

```txt
AGENTS.md
README.md
ARCHITECTURE.md
DEVELOPMENT_PLAN.md
FRONTEND_IMPLEMENTATION_PLAN.md
TASK_BREAKDOWN.md
docs/FRONTEND_CODEX_IMPLEMENTATION_PLAN.md
```

Codex must also inspect these UI assets:

```txt
00-landing-page.png
01-design-system-board.png
02-risk-dashboard.png
03-rescue-simulator.png
04-transaction-review.png
05-rescue-result.png
06-demo-mode.png
```

### Development rule

Implement static UI first.

Do not integrate DeepBook SDK, wallet transaction execution, or Move contracts until the static UI, mock state, and risk engine are stable.

### Scope rule

Do not add:

- backend endpoints;
- serverless API routes;
- database;
- custom indexer;
- keeper bot;
- global scanner;
- Telegram/Discord alert service;
- hidden transaction execution;
- custody contract.

### Copy rule

Do not use copy that implies guaranteed liquidation prevention.

Prefer:

```txt
Monitor risk before liquidation
Reduce liquidation risk
Rescue before liquidation
Estimate until confirmed onchain
```

Avoid:

```txt
Prevent liquidations
Guaranteed protection
Auto-rescue
24/7 monitoring
```

------

## 15. Suggested First Codex Prompt

Use this prompt to start implementation:

```txt
You are implementing the MarginGuard frontend MVP.

Read:
- AGENTS.md
- README.md
- ARCHITECTURE.md
- DEVELOPMENT_PLAN.md
- FRONTEND_IMPLEMENTATION_PLAN.md
- TASK_BREAKDOWN.md
- docs/FRONTEND_CODEX_IMPLEMENTATION_PLAN.md

Use these UI references:
- apps/web/src/assets/ui/00-landing-page.png
- apps/web/src/assets/ui/01-design-system-board.png
- apps/web/src/assets/ui/02-risk-dashboard.png
- apps/web/src/assets/ui/03-rescue-simulator.png
- apps/web/src/assets/ui/04-transaction-review.png
- apps/web/src/assets/ui/05-rescue-result.png
- apps/web/src/assets/ui/06-demo-mode.png

Required skill:
Use ui-ux-pro-max to translate the approved UI assets into React/Tailwind layout, design tokens, components, and responsive behavior.

First milestone:
Implement static frontend UI only.

Do not integrate real DeepBook SDK yet.
Do not build a backend.
Do not build an indexer.
Do not build a keeper.
Do not execute real transactions.

Implement:
1. Vite + React + TypeScript + Tailwind setup
2. Design tokens and UI primitives
3. Landing page
4. AppShell / Sidebar / TopContextBar
5. Static Risk Dashboard with mock data
6. Static Rescue Simulator with mock data
7. Transaction Review Modal
8. Rescue Result Modal
9. Static Demo Mode page
10. Mock risk/rescue/demo data

Acceptance:
- All routes render
- UI matches reference assets closely
- Mock data is clearly labeled where simulated
- Add Collateral is the P0 recommended path
- Reduce-only and Smart TPSL are P1 / SDK path required
- No backend/indexer/keeper assumptions appear
```

------

## 16. Definition of Done for Frontend Static MVP

The static frontend milestone is done when:

- all routes render without runtime errors;
- visual layout matches the approved UI assets;
- mock state powers Dashboard, Rescue Simulator, Transaction Review, Rescue Result, and Demo Mode;
- responsive layout is acceptable for desktop and tablet;
- no backend, indexer, or keeper code exists;
- all write-action buttons open review/result UI only, not real transactions;
- risk math functions are isolated and tested;
- DeepBook SDK integration is stubbed behind adapters;
- the next milestone can safely add wallet connection and real manager reads.