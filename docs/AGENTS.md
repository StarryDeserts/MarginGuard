# AGENTS.md

This file is the long-term instruction document for Codex and other coding agents working on MarginGuard.

Read this file before editing code.

---

## Table of Contents

1. [Project Mission](#project-mission)
2. [Hard Constraints](#hard-constraints)
3. [Required Reading Order](#required-reading-order)
4. [Skill and Repository Usage Order](#skill-and-repository-usage-order)
5. [Operating Procedure for Every Agent Session](#operating-procedure-for-every-agent-session)
6. [Implementation Priorities](#implementation-priorities)
7. [DeepBook SDK Uncertainty Protocol](#deepbook-sdk-uncertainty-protocol)
8. [UI/UX Rules](#uiux-rules)
9. [Coding Standards](#coding-standards)
10. [Testing Expectations](#testing-expectations)
11. [Documentation Update Rules](#documentation-update-rules)
12. [What Not To Do](#what-not-to-do)

---

## Project Mission

MarginGuard is a browser-only risk-management and rescue layer for DeepBook Margin.

It helps a user:

1. connect a Sui wallet;
2. manually import a DeepBook Margin Manager ID;
3. read current margin state;
4. understand risk ratio, liquidation distance, and debt exposure;
5. compare rescue options;
6. build user-signed PTBs for pre-liquidation actions.

MarginGuard v0 is an **active risk console + rescue PTB builder**.

It is not a backend monitoring service, not a keeper network, not a global scanner, and not another leverage trading UI.

---

## Hard Constraints

Agents must not violate these constraints.

1. **No backend.** Do not add Express, Next.js API routes, server actions, serverless functions, databases, hosted queues, cron jobs, or worker services.
2. **No custom indexer.** Do not build global event ingestion or all-user position scanning.
3. **No keeper bot.** Do not add background automation that runs while the user is away.
4. **No custody.** Do not design contracts or code paths that custody user collateral in MarginGuard v0.
5. **No private keys.** Never ask for, store, or generate user private keys in the app.
6. **Manual manager import.** User enters or selects a saved Margin Manager ID. Do not infer all user managers unless an official browser-safe SDK method exists and it does not require indexer behavior.
7. **SUI/USDC first.** Do not expand to multiple markets until the SUI/USDC path works.
8. **Add Collateral first.** Do not prioritize reduce-only or TPSL over the P0 Add Collateral PTB.
9. **Design before implementation.** Core pages must follow the UI/UX workflow and design system direction.
10. **Do not overclaim.** UI copy must not imply guaranteed liquidation prevention or 24/7 monitoring.

---

## Required Reading Order

Before coding, read these files in order:

1. `README.md`
2. `ARCHITECTURE.md`
3. `DEVELOPMENT_PLAN.md`
4. `TASK_BREAKDOWN.md`
5. `FRONTEND_IMPLEMENTATION_PLAN.md`
6. `UIUX_WORKFLOW.md`
7. `GPT_IMAGE_2_PROMPTS.md`
8. `MOVE_CONTRACT_PLAN.md` if working on Move
9. `DEMO_SCRIPT.md` if working on demo or presentation flow
10. `SKILL_USAGE_PLAN.md` if using external skill repositories

If a task conflicts with these docs, stop and update the plan before coding.

---

## Skill and Repository Usage Order

Use external skills and repositories deliberately. Do not blindly mix conventions from multiple skills.

### 1. superpowers

Use for workflow discipline:

- clarify scope;
- split work into small tasks;
- write implementation plans;
- avoid coding before planning;
- maintain red/green testing discipline where practical.

### 2. MystenLabs `sui-dev-skills`

Use as the first technical authority for:

- Sui Move;
- Sui TypeScript SDK;
- PTB construction;
- Sui dApp Kit;
- wallet connection;
- Sui frontend patterns.

### 3. RandyPen `sui-eco-skills`

Use only as a supplement when official Sui skills do not cover:

- DeepBook-specific integration;
- DeepBook Margin examples;
- ecosystem protocol references.

If official Mysten guidance conflicts with ecosystem guidance, use official Mysten guidance unless the official source is silent on DeepBook-specific behavior.

### 4. UI/UX Pro Max Skill

Use after the design direction is established with GPT image prompts.

Use it for:

- design system to component translation;
- Tailwind / React layout implementation planning;
- page-specific UI quality checks;
- responsive behavior.

### 5. GPT image2 prompt playbook

Use before frontend implementation to generate:

1. Design System Board;
2. Landing Page;
3. Risk Dashboard;
4. Rescue Simulator;
5. Transaction Review Modal;
6. Demo Mode / Product Showcase.

---

## Operating Procedure for Every Agent Session

Every Codex session should follow this sequence:

1. Read `AGENTS.md`.
2. Identify the task from `TASK_BREAKDOWN.md`.
3. Confirm whether the task is P0, P1, or P2.
4. Read the relevant plan document.
5. Identify files likely to change.
6. Check whether UI/UX design is required first.
7. Verify SDK/API assumptions before writing integration code.
8. Implement the smallest coherent slice.
9. Run typecheck/test/lint for touched areas.
10. Update docs if scope, architecture, or task status changed.
11. Summarize exactly what changed and what remains.

Do not start by writing code into random files.

---

## Implementation Priorities

### P0 order

1. Static frontend scaffold.
2. Wallet connect.
3. Manager import + localStorage.
4. DeepBook manager read adapter.
5. Risk engine + dashboard.
6. Rescue simulator.
7. Add Collateral PTB.
8. Demo Mode.

### P1 order

1. Reduce-only PTB.
2. Smart TPSL PTB.
3. Execute triggered TPSL.
4. Optional Move GuardProfile / RescueReceipt.
5. Before/after onchain receipt integration.

### P2 order

1. Additional markets.
2. Funding projection improvements.
3. Shareable rescue links.
4. BTCFi roadmap mockups.
5. Solver/backstop architecture docs.

---

## DeepBook SDK Uncertainty Protocol

If a DeepBook Margin SDK API is uncertain:

1. Do not invent a method name in multiple places.
2. Search official Mysten Sui skills/docs first.
3. Search Sui ecosystem DeepBook skills only if official guidance is incomplete.
4. Create or update one adapter function under `lib/deepbook/*`.
5. Keep the React UI dependent on internal normalized types only.
6. Add a short comment explaining what was verified and from where.
7. If unresolved, mark the feature as disabled/P1 and continue P0.

Never block Add Collateral and Demo Mode because reduce-only or TPSL APIs are uncertain.

---

## UI/UX Rules

1. Generate or review the design system before implementing core pages.
2. Use premium fintech SaaS styling: professional, readable, data-focused, trustworthy.
3. Avoid meme, casino, excessive cyberpunk, over-glow, or low-legibility aesthetics.
4. Risk states must be visually clear and accessible.
5. Do not bury the main CTA.
6. Every rescue transaction must have a review modal before wallet signing.
7. Mock/demo values must be visually labeled.
8. UI copy must not imply the app acts while closed.

---

## Coding Standards

### TypeScript

- Use strict TypeScript.
- Prefer explicit domain types in `types/`.
- Avoid `any`; if unavoidable, confine it to SDK adapter boundaries.
- Keep protocol units and UI units clearly separated.
- Use bigint for atomic amounts when required by SDK/PTB code.
- Use number only for display and simulation estimates.

### React

- Keep components presentational where possible.
- Put data fetching in hooks.
- Put Sui/DeepBook calls in adapters.
- Keep risk math out of components.
- Handle loading, empty, error, success states.

### File boundaries

- `components/`: UI only.
- `hooks/`: state and query composition.
- `lib/deepbook/`: SDK integration.
- `lib/risk/`: pure risk math.
- `lib/tx/`: transaction builders.
- `lib/demo/`: mock scenarios.
- `lib/storage/`: localStorage.
- `types/`: shared types.

### Commit style

Use conventional commit style where practical:

- `feat: add wallet connection`
- `fix: handle manager read failure`
- `docs: update demo fallback plan`
- `test: cover add collateral simulation`
- `refactor: isolate DeepBook manager adapter`

---

## Testing Expectations

Minimum tests for P0:

- risk ratio calculation;
- risk classification thresholds;
- add collateral simulation;
- reduce-only simulation estimate;
- interest drift estimate;
- localStorage parse / validation;
- transaction builder smoke tests where feasible.

Manual QA for P0:

- connect wallet;
- import manager;
- refresh page and see saved manager;
- load dashboard;
- run Demo Mode;
- open Add Collateral review modal;
- sign or simulate transaction;
- recover from failed transaction.

---

## Documentation Update Rules

Update documentation when behavior changes.

| If you change... | Update... |
|---|---|
| MVP scope | `README.md`, `DEVELOPMENT_PLAN.md`, `TASK_BREAKDOWN.md` |
| Architecture | `ARCHITECTURE.md`, `AGENTS.md` |
| UI flow | `UIUX_WORKFLOW.md`, `DEMO_SCRIPT.md` |
| Prompt strategy | `GPT_IMAGE_2_PROMPTS.md` |
| External skill usage | `SKILL_USAGE_PLAN.md` |
| Move contract plan | `MOVE_CONTRACT_PLAN.md` |
| Task status | `TASK_BREAKDOWN.md` |

---

## What Not To Do

Do not:

- add backend endpoints;
- add a database;
- add an indexer;
- add a keeper;
- claim 24/7 protection;
- scan all user positions;
- build a generic trading terminal;
- expand beyond SUI/USDC before P0 works;
- create a custody contract;
- hardcode unverified DeepBook package addresses across the app;
- place SDK calls directly inside React components;
- hide mock values as if they are real;
- skip transaction review before wallet signing;
- implement P2 roadmap features before P0.
