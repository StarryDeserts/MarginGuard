# MarginGuard UI/UX Workflow

MarginGuard must be designed before it is implemented. The goal is a premium fintech SaaS interface that communicates risk, protection, confidence, and control without pretending to be a backend automation service.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Required Workflow](#required-workflow)
3. [Stage 1: Design System Board](#stage-1-design-system-board)
4. [Stage 2: Core Screens](#stage-2-core-screens)
5. [Stage 3: Product Showcase](#stage-3-product-showcase)
6. [Stage 4: Frontend Implementation Handoff](#stage-4-frontend-implementation-handoff)
7. [Core Page Goals](#core-page-goals)
8. [Visual Style](#visual-style)
9. [UX Quality Standards](#ux-quality-standards)
10. [Prompt Iteration Strategy](#prompt-iteration-strategy)
11. [Unacceptable Designs](#unacceptable-designs)
12. [Design Review Checklist](#design-review-checklist)

---

## Design Principles

MarginGuard UI should feel:

- professional;
- trustworthy;
- data clear;
- fast to scan;
- protective rather than speculative;
- suitable for DeFi power users;
- understandable for hackathon judges.

It should not feel like:

- a meme coin app;
- a casino interface;
- a generic trading terminal;
- a cyberpunk concept poster;
- an overdesigned dashboard with unreadable text.

---

## Required Workflow

The design sequence is mandatory:

1. Generate **Design System Board**.
2. Generate **Landing Page**.
3. Generate **Risk Dashboard**.
4. Generate **Rescue Simulator**.
5. Generate **Transaction Review Modal**.
6. Generate **Demo Mode / Product Showcase**.
7. Select or combine the best visual direction.
8. Convert the chosen UI direction into a React/Tailwind implementation plan with ui-ux-pro-max-skill.
9. Implement only after design direction is accepted.

---

## Stage 1: Design System Board

### Goal

Define the visual language before building pages.

### Must include

- color palette;
- typography scale;
- button styles;
- input fields;
- cards;
- badges;
- risk status colors;
- dashboard widgets;
- modal styles;
- chart style;
- desktop and mobile examples.

### Acceptance criteria

- Components look reusable.
- Risk colors are distinct and accessible.
- Typography is readable.
- Style is premium fintech SaaS, not overdone sci-fi.
- The board can guide Tailwind tokens.

---

## Stage 2: Core Screens

Generate each screen separately after design system direction is chosen.

### Required screens

1. Landing Page.
2. Risk Dashboard.
3. Rescue Simulator.
4. Transaction Review Modal.
5. Demo Mode.

### Acceptance criteria

- Each page has clear user intent.
- Each page can be decomposed into React components.
- Main actions are obvious.
- Mock/demo labels are visible where needed.
- No unsupported backend claims appear.

---

## Stage 3: Product Showcase

### Goal

Create pitch-ready visuals.

### Outputs

- one polished desktop dashboard showcase;
- one multi-screen product composition;
- optional laptop mockup for pitch deck;
- optional mobile preview only if responsive design exists.

### Acceptance criteria

- The visual explains the product quickly.
- Screens look coherent.
- Text is legible enough for judges.
- It does not imply functionality outside v0.

---

## Stage 4: Frontend Implementation Handoff

After visual direction is selected, use ui-ux-pro-max-skill to create implementation guidance for:

- Tailwind tokens;
- layout grid;
- component hierarchy;
- responsive rules;
- chart/card styling;
- empty/loading/error states;
- page-specific design constraints.

The handoff must map visuals to files in `FRONTEND_IMPLEMENTATION_PLAN.md`.

---

## Core Page Goals

### Landing Page

Goal: explain that MarginGuard is the safety layer around DeepBook Margin.

Core components:

- top nav;
- hero statement;
- product preview;
- three feature cards: detect risk, simulate rescue, execute PTB;
- architecture strip: no backend, no indexer, user-signed PTBs;
- demo CTA;
- disclaimer.

### Risk Dashboard

Goal: let a user understand their position risk in 10 seconds.

Core components:

- wallet panel;
- manager selector;
- risk gauge;
- risk status badge;
- asset/debt breakdown;
- liquidation distance;
- interest drift projection;
- recommended action.

### Rescue Simulator

Goal: compare rescue actions and tradeoffs.

Core components:

- Add Collateral card;
- Reduce-only Close card;
- Smart TPSL card;
- before/after risk ratio;
- estimated cost;
- remaining upside;
- warnings;
- CTA state: real / P1 / demo-only.

### Transaction Review Modal

Goal: prevent blind signing.

Core components:

- selected action;
- manager ID short display;
- before risk ratio;
- expected after risk ratio;
- asset/debt changes;
- fees and slippage warnings;
- failure conditions;
- primary confirm button;
- secondary cancel button.

### Demo Mode

Goal: run a stable 3-minute judging story.

Core components:

- scenario stepper;
- simulated price path;
- risk transition timeline;
- rescue recommendation;
- transaction execution or fallback;
- before/after summary;
- clear mock labels.

---

## Visual Style

Recommended direction:

- premium fintech SaaS;
- dark mode or deep navy background;
- electric blue / Sui cyan accents;
- restrained green/yellow/orange/red risk colors;
- rounded 16px cards;
- subtle gradients;
- soft glows only for focus states;
- crisp iconography;
- generous spacing;
- high contrast text;
- professional data visualization.

Avoid:

- excessive neon;
- fake holograms;
- trading terminal clutter;
- low contrast gray text;
- tiny chart labels;
- irrelevant crypto mascots;
- decorative charts that do not communicate risk.

---

## UX Quality Standards

A design is acceptable only if:

- the main user task is obvious;
- risk status is visible without reading long text;
- primary CTA is clear;
- dangerous states are visually distinct;
- transaction review is serious and trustworthy;
- estimates are labeled;
- no page needs backend behavior to make sense;
- components can be implemented in React/Tailwind without heroic CSS.

---

## Prompt Iteration Strategy

Use prompt versions:

```text
v1_exploration
v2_refined_layout
v3_production_ready
```

### Iteration prompts

Use these directions when improving output:

- improve hierarchy;
- increase readability;
- reduce visual noise;
- make it more production-ready;
- make charts more realistic;
- clarify CTA;
- make risk states more accessible;
- convert to implementation-friendly React/Tailwind layout.

### Do not iterate by only adding adjectives

Each iteration should specify what must change:

- layout;
- components;
- content hierarchy;
- text clarity;
- risk states;
- spacing;
- responsiveness.

---

## Unacceptable Designs

Reject designs that:

- look like wireframes;
- include unreadable text;
- use fake lorem ipsum;
- show unsupported alerts, bots, or auto-rescue services;
- imply global monitoring;
- look like a generic DEX terminal;
- hide the manager import flow;
- omit transaction review;
- overload dashboard with meaningless charts;
- cannot be implemented with normal responsive layout.

---

## Design Review Checklist

### Product clarity

- [ ] Does the screen explain MarginGuard's value?
- [ ] Does it avoid sounding like another trading frontend?
- [ ] Does it reflect no backend / no indexer / no keeper?

### UI clarity

- [ ] Is the layout scannable?
- [ ] Are cards aligned?
- [ ] Are fonts readable?
- [ ] Are risk colors clear?
- [ ] Are labels realistic?

### UX clarity

- [ ] Is the next action obvious?
- [ ] Are dangerous actions reviewed before signing?
- [ ] Are estimates labeled?
- [ ] Are loading/error/empty states considered?

### Implementation clarity

- [ ] Can this be decomposed into components?
- [ ] Can Tailwind implement the layout?
- [ ] Are complex visual effects optional?
- [ ] Does it fit the planned route/component structure?
