# Skill Usage Plan

This document defines how MarginGuard should use external skill repositories and UI/UX prompt workflows during development.

---

## Table of Contents

1. [Purpose](#purpose)
2. [Skill Priority Order](#skill-priority-order)
3. [superpowers](#superpowers)
4. [MystenLabs sui-dev-skills](#mystenlabs-sui-dev-skills)
5. [RandyPen sui-eco-skills](#randypen-sui-eco-skills)
6. [ui-ux-pro-max-skill](#ui-ux-pro-max-skill)
7. [GPT image2 UI/UX Prompt Playbook](#gpt-image2-uiux-prompt-playbook)
8. [Conflict Rules](#conflict-rules)
9. [Do Not Blindly Mix Skills](#do-not-blindly-mix-skills)
10. [Phase-by-phase Usage](#phase-by-phase-usage)

---

## Purpose

MarginGuard will be developed over multiple Codex sessions. External skills can improve consistency, but only if they are used deliberately.

This document prevents three common failure modes:

1. Codex starts coding without a plan.
2. Codex mixes conflicting Sui / frontend conventions.
3. Codex implements UI before design direction is stable.

---

## Skill Priority Order

Use the following priority order:

1. **Project docs in this repository** are the source of truth for MarginGuard scope.
2. **superpowers** for workflow and task discipline.
3. **MystenLabs sui-dev-skills** for official Sui / Move / TS SDK / frontend practices.
4. **RandyPen sui-eco-skills** only for ecosystem-specific gaps, especially DeepBook / DeepBook Margin.
5. **GPT image2 prompt playbook** for visual exploration before implementation.
6. **ui-ux-pro-max-skill** for translating approved UI/UX direction into implementable frontend plans.

---

## superpowers

### Repository

`https://github.com/obra/superpowers`

### Purpose

Use superpowers for:

- requirements clarification;
- spec-first development;
- task breakdown;
- implementation planning;
- preventing premature coding;
- maintaining small, reviewable changes;
- encouraging testing and YAGNI.

### When to use

Use at the start of each major phase:

- initial scaffolding;
- DeepBook SDK integration;
- PTB implementation;
- Move contract implementation;
- demo polish.

### MarginGuard-specific instruction

superpowers should enforce this rule:

> Do not write code until the current task has a clear goal, input, output, acceptance criteria, and files likely to change.

---

## MystenLabs sui-dev-skills

### Repository

`https://github.com/MystenLabs/sui-dev-skills/tree/main`

### Purpose

Use as the primary technical authority for:

- idiomatic Move on Sui;
- object model and Sui Move testing;
- Sui TypeScript SDK;
- PTB construction;
- Sui client setup;
- transaction execution;
- browser dApp patterns;
- wallet connection and React hooks.

### When to use

Use for:

- `packages/move` implementation;
- transaction builder modules under `lib/tx/*`;
- wallet connection;
- Sui RPC client setup;
- transaction result handling;
- unit/integration test patterns.

### Priority rule

If this skill conflicts with ecosystem skills, prefer MystenLabs guidance unless the official skill does not cover the DeepBook-specific case.

---

## RandyPen sui-eco-skills

### Repository

`https://github.com/RandyPen/sui-eco-skills/tree/main`

### Purpose

Use as a supplement for:

- DeepBook integration patterns;
- DeepBook Margin examples;
- Sui ecosystem protocol-specific conventions;
- gaps not covered by official Mysten skills.

### When to use

Use only after checking official Mysten skills/docs.

Appropriate tasks:

- investigating DeepBook Margin Manager read methods;
- implementing reduce-only order flow;
- implementing TPSL flow;
- checking examples for DeepBook transaction composition.

### Boundary

Do not let ecosystem examples override MarginGuard v0 constraints. If a sample includes a backend, indexer, or keeper, do not copy that architecture.

---

## ui-ux-pro-max-skill

### Repository

`https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`

### Purpose

Use for:

- translating approved UI/UX into component architecture;
- applying design system rules to React/Tailwind;
- checking UI quality;
- responsive layout recommendations;
- dashboard, fintech, SaaS UI patterns.

### When to use

Use after:

1. Design System Board prompt has been generated;
2. core page prompts have been generated;
3. design direction has been selected;
4. `UIUX_WORKFLOW.md` acceptance criteria are satisfied.

### Boundary

Do not use this skill to invent product scope. It should implement or refine the approved MarginGuard UI direction.

---

## GPT image2 UI/UX Prompt Playbook

### Source

`gpt-image-2-uiux-prompt-playbook.md`

### Purpose

Use to generate high-fidelity UI/UX visual references before implementation.

The required sequence:

1. Design System Board.
2. Landing Page.
3. Risk Dashboard.
4. Rescue Simulator.
5. Transaction Review Modal.
6. Demo Mode / Product Showcase.

### Prompt structure

Every prompt must include:

- Product context;
- Page / screen type;
- Layout;
- Components to include;
- Visual style;
- UX requirements;
- Text requirements;
- Presentation;
- Avoid / negative constraints.

### Boundary

Generated images are design references, not source of truth for protocol behavior. If a visual design conflicts with architecture or security rules, architecture wins.

---

## Conflict Rules

### Official vs ecosystem

If official Mysten guidance conflicts with ecosystem skill guidance:

1. prefer official Mysten guidance;
2. check whether the ecosystem guidance is protocol-specific and official guidance is generic;
3. document the decision if using ecosystem-specific behavior.

### UI design vs architecture

If UI suggests unsupported functionality, such as automatic monitoring, background alerts, or global scanning:

- remove or rewrite the UI;
- label it as roadmap only if useful;
- do not implement it in v0.

### Prompt output vs usability

If GPT image output is beautiful but not implementable:

- iterate prompt for production-ready layout;
- simplify effects;
- preserve readable hierarchy.

---

## Do Not Blindly Mix Skills

Agents must not:

- combine multiple skill outputs without reconciling conflicts;
- copy code samples that add backend infrastructure;
- import unnecessary packages because a skill example used them;
- follow a generic trading UI template instead of MarginGuard's risk-rescue positioning;
- let visual design introduce unsupported product claims.

Every skill output must be filtered through:

1. MarginGuard v0 scope;
2. no backend / no indexer / no keeper;
3. SUI/USDC first;
4. Add Collateral P0 first;
5. user-signed PTBs only.

---

## Phase-by-phase Usage

| Phase | Primary skill/source | Secondary source | Notes |
|---|---|---|---|
| Documentation | superpowers | project docs | Keep tasks small and explicit |
| UI visual exploration | GPT image2 playbook | ui-ux-pro-max | Images first, implementation later |
| Frontend scaffold | Mysten sui-frontend | ui-ux-pro-max | Static Vite app only |
| Wallet connect | Mysten sui-frontend | Mysten TS SDK | Browser wallet only |
| Manager read | Mysten TS SDK | sui-eco DeepBook | SDK APIs must be verified |
| Risk engine | project docs | none | Pure functions, unit tests |
| Add Collateral PTB | Mysten TS SDK | sui-eco DeepBook | P0 real transaction path |
| Reduce-only PTB | sui-eco DeepBook | Mysten TS SDK | P1, disable if unverified |
| Smart TPSL PTB | sui-eco DeepBook | Mysten TS SDK | P1, disable if unverified |
| Move contract | Mysten move | project docs | No custody, receipts only |
| Demo Mode | project docs | ui-ux-pro-max | Mock values must be labeled |
