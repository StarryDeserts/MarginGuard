# MarginGuard Architecture

MarginGuard v0 is a browser-only Sui dApp. It uses Sui Wallet, Sui RPC, DeepBook Margin SDK, frontend risk simulation, and optional lightweight Move receipts. It does not run a backend, indexer, or keeper.

---

## Table of Contents

1. [Architecture Goals](#architecture-goals)
2. [High-level Diagram](#high-level-diagram)
3. [Browser-only Boundary](#browser-only-boundary)
4. [Read Flow](#read-flow)
5. [PTB Execution Flow](#ptb-execution-flow)
6. [State Management](#state-management)
7. [DeepBook Margin SDK Boundary](#deepbook-margin-sdk-boundary)
8. [localStorage Usage](#localstorage-usage)
9. [Optional Move Contract Boundary](#optional-move-contract-boundary)
10. [Mock vs Real Execution](#mock-vs-real-execution)
11. [Services We Do Not Build](#services-we-do-not-build)
12. [Security and Safety Principles](#security-and-safety-principles)

---

## Architecture Goals

The architecture optimizes for hackathon feasibility, honest scope, and a credible Sui-native demo.

Primary goals:

- run as a static frontend;
- read a user-provided Margin Manager ID directly from Sui;
- make risk state legible;
- simulate rescue plans locally;
- build user-signed rescue PTBs;
- avoid hidden infrastructure;
- keep DeepBook SDK uncertainty isolated;
- support a reliable demo fallback.

---

## High-level Diagram

```text
┌─────────────────────────────────────┐
│ Browser UI                          │
│ React / Vite / TypeScript           │
│                                     │
│ ┌──────────────┐ ┌────────────────┐ │
│ │ Wallet state │ │ localStorage   │ │
│ └──────┬───────┘ └───────┬────────┘ │
│        │                 │          │
│ ┌──────▼─────────────────▼────────┐ │
│ │ DeepBook SDK Adapter             │ │
│ └──────┬───────────────────────────┘ │
│        │ read-only calls             │
│ ┌──────▼───────────────────────────┐ │
│ │ Risk Engine / Rescue Simulator   │ │
│ └──────┬───────────────────────────┘ │
│        │ selected action             │
│ ┌──────▼───────────────────────────┐ │
│ │ PTB Builders                     │ │
│ └──────┬───────────────────────────┘ │
└────────┼─────────────────────────────┘
         │ unsigned transaction
         ▼
┌─────────────────────────────────────┐
│ Sui Wallet                          │
│ User reviews and signs PTB          │
└────────┬────────────────────────────┘
         │ signed transaction
         ▼
┌─────────────────────────────────────┐
│ Sui Network                         │
│ DeepBook Margin contracts           │
│ Optional MarginGuard Move package   │
└─────────────────────────────────────┘
```

---

## Browser-only Boundary

MarginGuard v0 must be deployable as static assets.

Allowed:

- browser app;
- wallet adapter;
- Sui RPC calls;
- DeepBook Margin SDK calls;
- localStorage;
- frontend-only mock data;
- optional Move package deployed to Sui.

Not allowed:

- Node API server;
- Next.js API route / server action;
- serverless functions;
- hosted database;
- custom indexer;
- cron job;
- queue;
- keeper worker;
- private key service;
- backend transaction builder.

---

## Read Flow

```text
User connects wallet
  ↓
User enters Margin Manager ID
  ↓
App creates DeepBook client with wallet address, network, manager key, pool key
  ↓
DeepBook SDK / Sui RPC reads manager state
  ↓
Adapter normalizes raw response
  ↓
Risk engine computes display metrics
  ↓
Dashboard renders risk status and rescue plans
```

### Read data sources

| Data | Source | Backend required? |
|---|---|---|
| Wallet address | Sui Wallet adapter | No |
| Manager object ID | User input / localStorage | No |
| Manager state | DeepBook Margin SDK / Sui RPC | No |
| Assets and debts | DeepBook Margin SDK / Sui RPC | No |
| Current price | SDK / protocol helper if available | No |
| Risk ratio | SDK preferred; frontend fallback estimate | No |
| Borrow APR | SDK / pool state if available; otherwise estimate placeholder | No |
| Historical events | Not included in v0 | Would require indexer-like flow |
| All at-risk users | Not included in v0 | Requires indexer |

---

## PTB Execution Flow

```text
User chooses a rescue plan
  ↓
App re-fetches latest manager state
  ↓
App rebuilds expected before/after metrics
  ↓
Transaction Review Modal opens
  ↓
User confirms in UI
  ↓
App builds PTB in browser
  ↓
Sui Wallet prompts user
  ↓
User signs and submits
  ↓
App waits for transaction confirmation
  ↓
App refreshes manager state
  ↓
UI shows confirmed or expected after state
```

### PTB builders

| Builder | Priority | Real chain execution required? |
|---|---:|---|
| `buildAddCollateralTx` | P0 | Yes |
| `buildReduceOnlyTx` | P1 | Yes if SDK path verified; otherwise disabled |
| `buildSmartTpslTx` | P1 | Yes if SDK path verified; otherwise disabled |
| `buildExecuteTriggeredTpslTx` | P1 | Yes if TPSL path verified |
| `buildGuardProfileTx` | Optional | Yes if Move package included |
| `buildRescueReceiptTx` | Optional | Yes if Move package included |

---

## State Management

Use three layers of state:

### 1. Server-like chain state

Use React Query for all Sui RPC / DeepBook SDK reads.

Examples:

- manager state;
- pool state;
- transaction confirmation;
- optional profile objects.

Rules:

- all query keys include network and manager ID;
- failed reads show recoverable errors;
- refetch after transaction confirmation;
- do not cache chain state as truth in localStorage.

### 2. Local UI state

Use React local state or Zustand for:

- selected rescue plan;
- modal open/closed;
- target risk ratio;
- demo scenario step;
- risk preference.

### 3. Persistent local preferences

Use localStorage only for:

- saved manager IDs;
- last selected network;
- last selected pool;
- demo preference.

Do not store secrets or signed transactions in localStorage.

---

## DeepBook Margin SDK Boundary

All DeepBook SDK integration must be isolated under:

```text
apps/web/src/lib/deepbook/
```

Recommended files:

```text
client.ts
managerAdapter.ts
orderAdapter.ts
tpslAdapter.ts
poolKeys.ts
normalizeManagerState.ts
```

React components must not call raw SDK methods directly.

### Why this boundary matters

DeepBook Margin SDK method names, return types, and pool configuration may change. The UI and risk engine should depend only on normalized internal types.

If SDK APIs are uncertain:

1. Codex must inspect official Sui / Mysten skill and docs.
2. If not covered, Codex may inspect Sui ecosystem DeepBook skill.
3. The implementation must update the adapter only.
4. The uncertainty must be documented in code comments or a tracking issue.

---

## localStorage Usage

### Key namespace

Use a stable namespace:

```text
marginguard:v0:localManagers
marginguard:v0:lastNetwork
marginguard:v0:demoPrefs
```

### Saved manager schema

```text
LocalManagerRecord
  objectId: string
  poolKey: string
  displayPair: string
  network: testnet | mainnet
  addedAtMs: number
  lastUsedAtMs: number
```

### Rules

- Validate object ID format before saving.
- Allow deleting saved managers.
- Never imply localStorage is an indexer.
- Do not store wallet secrets.
- Do not store private notes that might be sensitive.

---

## Optional Move Contract Boundary

The Move package is optional and must stay lightweight.

Allowed:

- create `GuardProfile`;
- update profile thresholds;
- record `RescueReceipt`;
- emit events for demo and future indexing;
- transfer receipt objects to the user.

Not allowed:

- custody collateral;
- borrow funds;
- withdraw from manager;
- automatically submit rescue transactions;
- authorize keepers to control user funds;
- implement backstop vaults in v0.

The Move package is a proof and coordination primitive, not the rescue engine.

---

## Mock vs Real Execution

| Area | P0 behavior | Labeling requirement |
|---|---|---|
| Wallet connect | Real | No mock label needed |
| Manager import | Real | No mock label needed |
| Manager read | Real preferred; mock fallback allowed in demo | Mock values must be labeled |
| Risk calculations | Frontend estimate | Mark as estimate when not SDK-confirmed |
| Rescue plans | Frontend simulation | Mark as simulated outcome |
| Add Collateral | Real PTB | User reviews wallet transaction |
| Reduce-only | Real if verified; otherwise disabled or mock in demo | Must label P1 / demo-only |
| Smart TPSL | Real if verified; otherwise disabled or mock in demo | Must label P1 / demo-only |
| Guard receipt | Optional real Move call | If omitted, do not fake onchain receipt |

---

## Services We Do Not Build

MarginGuard v0 must not include:

- custom indexer;
- global scanner;
- keeper bot;
- relayer;
- backend alert service;
- Telegram bot;
- Discord bot;
- email service;
- database-backed account system;
- delegated trading service;
- automated liquidation rescue while browser is closed.

If a future roadmap section mentions these, it must be explicitly labeled v1/v2/v3.

---

## Security and Safety Principles

1. **User signs every write.** No hidden transaction submission.
2. **Transaction review before wallet prompt.** Always show action, amount, expected risk effect, fees, and failure conditions.
3. **Re-read before write.** Refresh manager state before constructing PTB.
4. **Do not overpromise.** Risk outputs are estimates unless confirmed after transaction.
5. **Small demo amounts.** Use testnet or small mainnet amounts for live demo.
6. **No custody.** MarginGuard does not hold user collateral.
7. **No secrets.** No private keys or mnemonics in frontend, env files, localStorage, docs, or tests.
8. **SDK isolation.** Keep protocol integration in adapters.
9. **Graceful failure.** Failed reads/writes must preserve user context and explain next steps.
