# MarginGuard Motion & Animation Design Specification

> File: `docs/MARGINGUARD_MOTION_ANIMATION_SPEC.md`  
> Purpose: define the animation and motion interaction system for the MarginGuard frontend MVP.  
> Target stack: Vite + React + TypeScript + Tailwind CSS + Motion + GSAP.  
> Status: implementation-ready specification for Codex / frontend agents.

---

## 0. Executive Summary

MarginGuard is a risk-management and rescue PTB builder for DeepBook Margin on Sui. Its motion system must communicate **precision, protection, risk awareness, and user control**. Animation should make the product feel alive and premium, but it must never make MarginGuard feel like a game, casino, speculative trading terminal, or auto-rescue bot.

The project should use two complementary animation layers:

1. **Motion layer**: component-level and application-level interactions, inspired by `ibelick/motion-primitives` and implemented with the modern `motion` package.
2. **GSAP layer**: scroll-linked storytelling on the landing page and complex demo / showcase sequences, implemented through the `gsap-framer-scroll-animation` skill patterns.

Default rule:

> Use **Motion** for product UI, state transitions, modal flows, card reveals, route transitions, metric updates, and micro-interactions. Use **GSAP** only for scroll-driven composition, pinned sections, parallax, horizontal scroll, or complex timelines.

---

## 1. Source References

This spec is based on these references:

- `motion-primitives`: https://github.com/ibelick/motion-primitives
- `gsap-framer-scroll-animation` uploaded skill files:
  - `SKILL.md`
  - `gsap.md`
  - `framer.md`
- MarginGuard finalized UI assets:
  - `00-landing-page.png`
  - `01-design-system-board.png`
  - `02-risk-dashboard.png`
  - `03-rescue-simulator.png`
  - `04-transaction-review.png`
  - `05-rescue-result.png`
  - `06-demo-mode.png`

The `motion-primitives` repository should be treated as an implementation philosophy and component-pattern reference: reusable animated primitives, Tailwind-compatible styling, composable React APIs, and restrained premium motion.

---

## 2. Naming Correction

The animation library should be referred to as:

```txt
gsap
```

not:

```txt
gasp
```

Use package names:

```bash
pnpm add motion gsap @gsap/react
```

Optional later:

```bash
pnpm add lenis
```

Do not add Lenis in P0 unless scroll smoothness is a clearly accepted design requirement.

---

## 3. Animation Principles for MarginGuard

### 3.1 Product Feel

Animation should feel:

- precise;
- calm;
- risk-aware;
- premium fintech;
- fast and responsive;
- legible under pressure;
- supportive of decision-making.

Animation should not feel:

- playful in critical flows;
- casino-like;
- meme-like;
- excessively neon;
- distracting;
- slow during risk review;
- like an automated keeper or bot.

### 3.2 Safety Rule

MarginGuard handles pre-liquidation risk. Motion must not obscure:

- current risk ratio;
- warning / liquidatable state;
- liquidation threshold;
- transaction amount;
- before / after risk ratio;
- wallet-signing confirmation;
- failure conditions.

Any animation that delays or hides these elements is unacceptable.

### 3.3 Motion Hierarchy

Use motion to reinforce hierarchy:

| Priority | UI Element | Motion Intensity |
|---:|---|---|
| P0 | Risk status, current RR, CTA, transaction review | Clear but restrained |
| P1 | Cards, charts, panels, secondary metrics | Subtle stagger / fade / transform |
| P2 | Background gradients, decorative lines, product previews | Optional, slow, non-critical |

---

## 4. Library Responsibilities

## 4.1 Motion Responsibilities

Use `motion/react` for:

- route transitions;
- page entry transitions;
- reusable `ScrollReveal` wrappers;
- card grid stagger;
- modal open / close;
- drawer / panel transitions;
- selected rescue plan transitions;
- metric value transitions;
- badge status transitions;
- hover / tap states;
- progress indicators;
- simple scroll-linked progress;
- reduced-motion-aware UI primitives.

### Canonical import

```tsx
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
} from 'motion/react';
```

### Default Motion rule

All Motion primitives should live in:

```txt
apps/web/src/components/motion/
```

Do not scatter ad-hoc `motion.div` logic across every page without a wrapper.

---

## 4.2 GSAP Responsibilities

Use GSAP for:

- landing-page scroll storytelling;
- pinned “How it works” sections;
- product preview parallax;
- horizontal scroll sequences;
- demo timeline scenes;
- scroll progress bar if Motion is insufficient;
- complex staged sequences where Motion variants become awkward.

### Canonical GSAP setup

```tsx
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
```

### Default GSAP rule

GSAP code should live in:

```txt
apps/web/src/components/scroll-scenes/
apps/web/src/hooks/animation/
```

Do not put GSAP timelines directly inside route components unless the route component is specifically a scroll scene.

---

## 5. Implementation Architecture

Recommended file structure:

```txt
apps/web/src/
  components/
    motion/
      MotionConfigProvider.tsx
      ScrollReveal.tsx
      StaggerGroup.tsx
      AnimatedNumber.tsx
      AnimatedMetricCard.tsx
      MotionCard.tsx
      MotionButton.tsx
      PageTransition.tsx
      ModalTransition.tsx
      StatusBadgeMotion.tsx
      RiskPulse.tsx
      RouteFade.tsx

    scroll-scenes/
      LandingHeroScene.tsx
      ProductPreviewParallax.tsx
      HowItWorksPinnedScene.tsx
      DemoTimelineScene.tsx
      ArchitectureRevealScene.tsx

  hooks/
    animation/
      useReducedMotionSafe.ts
      useMotionTokens.ts
      useGsapScope.ts
      useScrollDirection.ts
      useAnimatedNumber.ts

  lib/
    animation/
      transitions.ts
      variants.ts
      easing.ts
      durations.ts
      viewport.ts
      gsap.ts
      reducedMotion.ts
```

---

## 6. Motion Tokens

Create:

```txt
apps/web/src/lib/animation/tokens.ts
```

```ts
export const motionDurations = {
  instant: 0.08,
  fast: 0.16,
  base: 0.28,
  slow: 0.45,
  slower: 0.7,
} as const;

export const motionEasing = {
  standard: [0.21, 0.47, 0.32, 0.98],
  emphasized: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
  linear: [0, 0, 1, 1],
} as const;

export const motionOffsets = {
  revealY: 20,
  revealYLarge: 40,
  cardLift: -4,
  modalY: 16,
  pageY: 12,
} as const;

export const viewportDefaults = {
  once: true,
  margin: '-80px',
} as const;
```

### Timing rules

| Motion Type | Duration | Notes |
|---|---:|---|
| Button hover | 0.12-0.18s | Fast; no lag |
| Card hover | 0.16-0.24s | Subtle lift only |
| Page enter | 0.28-0.45s | Avoid slow app feel |
| Modal enter | 0.22-0.32s | Serious, not bouncy |
| Stagger children | 0.04-0.08s gap | Faster than marketing sites |
| Landing scroll scene | Scroll-linked | Use GSAP or Motion scroll values |
| Transaction states | 0.16-0.28s | Must feel responsive |

---

## 7. Core Motion Primitives

## 7.1 `MotionConfigProvider`

Purpose: centralize reduced-motion behavior and default transitions.

```tsx
import { MotionConfig } from 'motion/react';
import { motionEasing, motionDurations } from '@/lib/animation/tokens';

export function MotionConfigProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: motionDurations.base,
        ease: motionEasing.standard,
      }}
    >
      {children}
    </MotionConfig>
  );
}
```

Use this near the app root.

---

## 7.2 `ScrollReveal`

Use for most non-critical page elements entering viewport.

```tsx
import { motion, useReducedMotion } from 'motion/react';
import { motionDurations, motionEasing } from '@/lib/animation/tokens';

export function ScrollReveal({
  children,
  delay = 0,
  className,
  y = 28,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: reduced ? 0 : motionDurations.slow,
        delay: reduced ? 0 : delay,
        ease: motionEasing.standard,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

Usage:

```tsx
<ScrollReveal>
  <MetricCard />
</ScrollReveal>
```

---

## 7.3 `StaggerGroup`

Use for card groups: feature cards, metric cards, rescue plan cards.

```tsx
import { motion } from 'motion/react';

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.06,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.36, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export function StaggerGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

Child cards should use:

```tsx
<motion.div variants={staggerItem}>...</motion.div>
```

---

## 7.4 `AnimatedNumber`

Use for risk ratio, asset value, debt value, borrow APR, liquidation distance.

Required behavior:

- animate only display text;
- do not animate actual source state;
- preserve precise final value;
- disable number tweening if reduced motion is preferred;
- do not animate rapidly changing RPC values every few seconds in a distracting way.

Recommended implementation approach:

```tsx
import { animate, useMotionValue, useTransform, motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';

export function AnimatedNumber({
  value,
  format = (n: number) => n.toFixed(2),
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const motionValue = useMotionValue(value);
  const display = useTransform(motionValue, latest => format(latest));

  useEffect(() => {
    if (reduced) {
      motionValue.set(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 0.45,
      ease: [0.21, 0.47, 0.32, 0.98],
    });

    return controls.stop;
  }, [value, reduced, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}
```

---

## 7.5 `RiskPulse`

Use only for warning / liquidatable risk states, and keep it subtle.

Rules:

- Healthy: no pulse.
- Guarded: optional static cyan accent.
- Caution: no continuous pulse.
- Warning: slow border glow pulse, max 2 loops on entry.
- Liquidatable: red pulse, max 3 loops, then steady high-risk state.

Do not run infinite pulsing animations in the dashboard.

---

## 7.6 `StatusBadgeMotion`

Use for transitions between:

```txt
Healthy → Guarded → Caution → Warning → Liquidatable
```

Recommended behavior:

- crossfade label;
- scale from 0.96 to 1;
- color change via CSS class transition;
- no spinning or bouncing.

---

## 7.7 `ModalTransition`

Use for `TransactionReviewModal` and `RescueResultModal`.

Required states:

- overlay fade;
- panel fade + slight y shift;
- no elastic bounce;
- no aggressive scale;
- escape / close should feel immediate.

```tsx
export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalPanel = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.24, ease: [0.21, 0.47, 0.32, 0.98] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.99,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
};
```

---

## 8. Page-Level Animation Specification

## 8.1 Landing Page

Primary library: **Motion + GSAP**

Use Motion for:

- nav entrance;
- hero copy reveal;
- CTA button hover/tap;
- architecture pill stagger;
- feature card stagger;
- final CTA reveal.

Use GSAP for:

- hero product-preview parallax;
- “How it works” pinned stepper if implemented;
- product preview section scroll-linked reveals;
- optional horizontal product screen carousel.

### Required landing interactions

| Element | Animation | Library |
|---|---|---|
| Top nav | fade down, 0.28s | Motion |
| Hero headline | split line / block reveal, 0.45s | Motion |
| Hero product preview | y/parallax on scroll | GSAP or Motion useScroll |
| Architecture pills | staggered fade-up | Motion |
| Why MarginGuard cards | staggered fade-up | Motion |
| How It Works stepper | active step on scroll | GSAP preferred |
| Demo preview | subtle parallax and reveal | GSAP |
| Final CTA | reveal + glow accent | Motion |

### Do not

- create a long cinematic animation that delays CTA visibility;
- animate all product screenshots independently;
- use infinite glowing lines;
- use horizontal scroll unless it adds clarity.

---

## 8.2 Risk Dashboard

Primary library: **Motion**

The Risk Dashboard should feel fast and operational.

Recommended animations:

| Element | Animation |
|---|---|
| Page enter | soft fade + y 12 |
| Sidebar active nav | background slide / opacity |
| Top context bar | no heavy motion; static |
| Current Risk Ratio | number tween only on value change |
| Warning badge | crossfade + subtle scale |
| Metric cards | stagger on first page load only |
| Risk chart | path draw or opacity reveal once |
| Recommended action card | fade-up after risk hero |
| Refresh action | small icon spin during loading |

### Risk state animation rules

When risk becomes worse:

```txt
Guarded → Caution → Warning → Liquidatable
```

Use:

- badge color transition;
- number tween;
- subtle border accent;
- optional one-time pulse.

When risk improves:

```txt
Warning → Healthy
```

Use:

- green confirmation accent;
- one-time check icon reveal;
- no confetti.

---

## 8.3 Rescue Simulator

Primary library: **Motion**

Recommended animations:

| Element | Animation |
|---|---|
| Rescue plan cards | staggered fade-up on entry |
| Selected plan | border glow + layout transition |
| Input value changes | animated number update |
| Simulation summary | crossfade on selected plan change |
| Chart update | path transition / opacity crossfade |
| Review PTB button | hover lift + active press |
| P1 SDK-required label | static badge; no warning pulse |

### Plan selection behavior

Use `layout` animations:

```tsx
<motion.div layout>
  <RescuePlanCard />
</motion.div>
```

Selected card:

- border changes smoothly;
- no dramatic zoom;
- no reorder animation unless cards actually reorder.

---

## 8.4 Transaction Review Modal

Primary library: **Motion**

This is a serious confirmation surface. Keep motion restrained.

Required animations:

| Element | Animation |
|---|---|
| Overlay | fade in/out |
| Modal panel | y 16 → 0, opacity 0 → 1 |
| Sections | subtle stagger, max 0.04s between sections |
| Acknowledgement checkbox | checkmark scale 0.8 → 1 |
| Sign button loading | spinner or subtle shimmer |
| Error state | red border flash once |

Do not:

- bounce the modal;
- animate warnings away;
- hide failure conditions under expandable animation by default;
- auto-open wallet before modal review.

---

## 8.5 Rescue Result Modal

Primary library: **Motion**

Recommended animations:

| Element | Animation |
|---|---|
| Success icon | draw/check reveal |
| Timeline steps | sequential step completion |
| Risk improvement numbers | before/after number tween |
| Transaction digest row | fade-in after submitted |
| Buttons | normal hover/tap |

Do not use confetti. A financial risk app should signal confidence, not celebration.

---

## 8.6 Demo Mode

Primary library: **Motion**, optional **GSAP** for story scroll scenes.

Demo Mode is a pitch-friendly screen, but still a product page.

Recommended animations:

| Element | Animation | Library |
|---|---|---|
| Scenario controls | fade-up | Motion |
| Price shock slider | thumb/track transition | Motion/CSS |
| Simulated RR | number tween | Motion |
| Demo stepper | active step transition | Motion |
| Risk timeline | path reveal / point activation | Motion or GSAP |
| Rescue recommendation | card highlight on step change | Motion |
| Full demo walkthrough | optional timeline scene | GSAP |

Use GSAP only if Demo Mode gets a separate pitch-story route with scroll-driven sections.

---

## 9. GSAP Scroll Scene Rules

Create shared GSAP helper:

```txt
apps/web/src/lib/animation/gsap.ts
```

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
```

### Required GSAP conventions

1. Always use `useGSAP`, not plain `useEffect`, in React.
2. Always scope selectors to a `ref`.
3. Always use `ease: 'none'` when `scrub` is enabled.
4. Use `markers: true` only during local debugging; remove before production.
5. Use `ScrollTrigger.batch()` for many similar reveals.
6. Use `invalidateOnRefresh: true` for dynamic measurements.
7. Use `matchMedia` for responsive scroll scenes.
8. Respect `prefers-reduced-motion`.

### Example Landing Parallax Scene

```tsx
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation/gsap';

export function ProductPreviewParallax() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;

      gsap.to('.product-preview', {
        yPercent: -8,
        scale: 1.02,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref}>
      <div className="product-preview">...</div>
    </section>
  );
}
```

---

## 10. Motion-Primitives-Inspired Component Rules

Do not blindly copy third-party components into the app without review. Instead, create a local MarginGuard motion-primitives layer.

### Local primitive requirements

Every animation primitive should be:

- TypeScript-first;
- Tailwind-compatible;
- theme-aware;
- reduced-motion-aware;
- SSR-safe if later migrated to Next.js;
- composable;
- not coupled to DeepBook state;
- easy to delete if overkill.

### Component API standard

Preferred props:

```ts
type BaseMotionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  disabled?: boolean;
};
```

Avoid props like:

```ts
type BadMotionProps = {
  magicalAnimationPreset?: string;
  cinematicMode?: boolean;
  chaos?: boolean;
};
```

Motion should be predictable, not magical.

---

## 11. Accessibility and Reduced Motion

All animation components must support reduced motion.

### Motion reduced-motion standard

Use:

```tsx
import { useReducedMotion } from 'motion/react';
```

Reduced-motion behavior:

| Normal Motion | Reduced Motion |
|---|---|
| fade + y movement | opacity only or instant |
| parallax | disabled |
| pinned scroll timeline | static sections |
| number tween | immediate final value |
| pulse | disabled |
| hover lift | color/border change only |
| modal y shift | fade only |

### GSAP reduced-motion standard

```ts
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) return;
```

or use `gsap.matchMedia()`:

```ts
const mm = gsap.matchMedia();

mm.add(
  {
    reduceMotion: '(prefers-reduced-motion: reduce)',
    desktop: '(min-width: 768px)',
  },
  context => {
    if (context.conditions?.reduceMotion) return;
    // animations
  },
);
```

---

## 12. Performance Rules

### Allowed animated properties

Use primarily:

```txt
transform
opacity
clip-path, only when necessary
```

Prefer transform sub-properties:

```txt
x
y
scale
rotate
rotateX
```

### Avoid animated properties

Do not animate:

```txt
width
height
top
left
right
bottom
margin
padding
box-shadow
filter
backdrop-filter
```

### Rendering rules

- Add `will-change: transform` only to elements actively animating.
- Remove `will-change` from large static containers.
- Do not animate huge dashboard charts every render.
- Do not create one ScrollTrigger per metric card if a batch reveal is enough.
- Do not run infinite loops on risk states.
- Never animate RPC refetch states so aggressively that users cannot read values.

---

## 13. Animation State Matrix

| Domain | State Change | Animation |
|---|---|---|
| Route | page enter/exit | fade + y 12 |
| Wallet | disconnected → connected | wallet pill fade/slide |
| Manager | empty → imported | context card reveal |
| Manager | loading → loaded | skeleton crossfade |
| Risk | ratio value changed | number tween |
| Risk | safe → warning | badge crossfade + border accent |
| Risk | warning → healthy | green confirmation accent |
| Rescue plan | unselected → selected | border glow + layout transition |
| Modal | closed → review | overlay fade + panel rise |
| PTB | idle → signing | button loading state |
| PTB | signing → submitted | modal state transition |
| PTB | submitted → confirmed | progress step sequence |
| Demo | step n → step n+1 | active step slide/fade |
| Landing | section enters | ScrollReveal / GSAP scene |

---

## 14. Per-Component Animation Requirements

## 14.1 Buttons

Use Motion for hover / tap.

```tsx
<motion.button
  whileHover={{ y: -1 }}
  whileTap={{ scale: 0.985 }}
  transition={{ duration: 0.14 }}
/>
```

Rules:

- Do not lift danger buttons dramatically.
- Disabled buttons must not animate.
- Loading state uses spinner or subtle opacity shift.

---

## 14.2 Cards

Use a local `MotionCard` wrapper.

Default hover:

```txt
y: -2
border-color: slightly brighter
background gradient: static CSS transition
```

Do not use large tilt or strong 3D effects in dashboard cards. Reserve 3D tilt for marketing preview cards only if it remains subtle.

---

## 14.3 Charts

Use restrained chart reveals.

Risk path chart:

- initial opacity reveal;
- optional path draw once;
- target and liquidation threshold lines appear first;
- current RR marker appears last.

Do not animate chart axes constantly.

---

## 14.4 Metric Cards

Metric cards should animate:

- initial card reveal;
- number updates;
- small status badge changes.

They should not animate:

- every background gradient on hover;
- every chart line on every refetch;
- layout dimensions.

---

## 14.5 Navigation

Landing nav:

- may hide / reveal on scroll using Motion.

App sidebar:

- should remain stable;
- active item indicator can slide;
- no collapse/expand animation unless responsive sidebar is implemented.

---

## 15. Route Transition Rules

Use route transitions only for app sections:

```txt
/dashboard
/rescue
/demo
/settings
```

Do not use heavy route transitions between modal steps.

Example:

```tsx
export const routeTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] },
};
```

---

## 16. Dependency Rules

Add dependencies:

```bash
pnpm add motion gsap @gsap/react
```

Do not add:

```bash
pnpm add framer-motion
```

unless a dependency specifically requires the legacy package. Use `motion/react` as the canonical import.

Do not add `motion-primitives` as a hard dependency unless Codex verifies its package API and tree-shaking behavior. Prefer local implementation of the specific primitives needed by MarginGuard.

---

## 17. Codex Implementation Plan

### Phase A: Base Animation Infrastructure

| ID | Priority | Task | Files |
|---|---:|---|---|
| ANIM-001 | P0 | Install `motion`, `gsap`, `@gsap/react` | `package.json` |
| ANIM-002 | P0 | Add motion tokens | `lib/animation/tokens.ts` |
| ANIM-003 | P0 | Add MotionConfigProvider | `components/motion/MotionConfigProvider.tsx` |
| ANIM-004 | P0 | Add ScrollReveal | `components/motion/ScrollReveal.tsx` |
| ANIM-005 | P0 | Add StaggerGroup + variants | `components/motion/StaggerGroup.tsx`, `lib/animation/variants.ts` |
| ANIM-006 | P0 | Add ModalTransition variants | `components/motion/ModalTransition.tsx` |
| ANIM-007 | P0 | Add GSAP helper | `lib/animation/gsap.ts` |
| ANIM-008 | P0 | Add reduced-motion helpers | `hooks/animation/useReducedMotionSafe.ts` |

### Phase B: App UI Motion

| ID | Priority | Page | Task |
|---|---:|---|---|
| ANIM-101 | P0 | AppShell | Add route/page fade transitions |
| ANIM-102 | P0 | Landing | Add hero and feature reveal animations |
| ANIM-103 | P0 | Dashboard | Add metric-card stagger and number tweening |
| ANIM-104 | P0 | Dashboard | Add risk badge transition |
| ANIM-105 | P0 | Rescue | Add rescue-card selection transition |
| ANIM-106 | P0 | Transaction Review | Add modal enter/exit and checkbox animation |
| ANIM-107 | P0 | Rescue Result | Add success timeline step animation |
| ANIM-108 | P0 | Demo Mode | Add demo stepper and simulated metric transitions |

### Phase C: Scroll Scenes

| ID | Priority | Page | Task |
|---|---:|---|---|
| ANIM-201 | P1 | Landing | Product preview parallax scene |
| ANIM-202 | P1 | Landing | How It Works pinned or active-step scroll scene |
| ANIM-203 | P1 | Landing | Product preview horizontal section, if useful |
| ANIM-204 | P1 | Demo | Optional story-mode scroll timeline |

Do not implement Phase C before Phase A and B are stable.

---

## 18. QA Checklist

### General

- [ ] All animations are disabled or simplified under `prefers-reduced-motion`.
- [ ] No animation hides critical risk or transaction information.
- [ ] No infinite pulse runs on dashboard cards.
- [ ] All motion uses `transform` and `opacity` unless explicitly justified.
- [ ] No GSAP markers remain in production.
- [ ] GSAP animations use `useGSAP` and are scoped to refs.
- [ ] Scrubbed GSAP animations use `ease: 'none'`.
- [ ] `useTransform` values are passed to `motion.*` elements via `style`.
- [ ] Route transitions do not cause layout jump.
- [ ] Modal animations do not delay keyboard accessibility.

### Product-specific

- [ ] Risk Ratio is readable throughout every transition.
- [ ] Warning / Liquidatable states remain visually prominent.
- [ ] Transaction Review warnings are never hidden by animation.
- [ ] Add Collateral remains the clearest P0 action.
- [ ] Reduce-only and Smart TPSL P1 labels do not animate like errors.
- [ ] Demo Mode motion clearly labels simulated values.
- [ ] Landing page motion does not imply auto-monitoring, keeper bots, or guaranteed liquidation prevention.

---

## 19. Acceptance Criteria

This animation system is accepted when:

1. The app has a reusable local motion-primitives layer.
2. Motion is used for component-level animation and state transitions.
3. GSAP is used only where scroll-linked timelines are genuinely needed.
4. The Landing Page feels premium but still focused.
5. The Dashboard remains calm, readable, and operational.
6. The Rescue Simulator makes comparison clearer, not busier.
7. Transaction Review remains serious and safe.
8. Rescue Result communicates confirmation without confetti or hype.
9. Demo Mode tells a clear story without implying background automation.
10. Reduced-motion users get a complete, non-broken experience.

---

## 20. Suggested Codex Prompt

Use this prompt when implementing the animation layer:

```txt
You are implementing MarginGuard's animation and motion interaction system.

Read:
- docs/MARGINGUARD_MOTION_ANIMATION_SPEC.md
- docs/FRONTEND_CODEX_IMPLEMENTATION_PLAN.md
- AGENTS.md
- ARCHITECTURE.md
- FRONTEND_IMPLEMENTATION_PLAN.md

Use:
- motion for component-level animations and state transitions
- gsap + @gsap/react for scroll-linked landing/demo scenes only
- local motion primitives inspired by ibelick/motion-primitives
- gsap-framer-scroll-animation skill rules for ScrollTrigger and Motion hooks

Install:
pnpm add motion gsap @gsap/react

Implement first:
1. lib/animation/tokens.ts
2. components/motion/MotionConfigProvider.tsx
3. components/motion/ScrollReveal.tsx
4. components/motion/StaggerGroup.tsx
5. components/motion/AnimatedNumber.tsx
6. components/motion/ModalTransition.tsx
7. lib/animation/gsap.ts
8. hooks/animation/useReducedMotionSafe.ts

Then apply motion to:
- Landing Page hero, feature cards, CTA, architecture pills
- Risk Dashboard metric cards, risk number, risk badge
- Rescue Simulator plan cards and selected-plan state
- Transaction Review modal
- Rescue Result timeline
- Demo Mode stepper and simulated metrics

Do not:
- animate layout-heavy properties
- add infinite dashboard pulses
- use GSAP where Motion is enough
- hide warnings or transaction failure conditions
- imply auto-rescue, keeper bots, or guaranteed liquidation prevention
- ship GSAP markers in production

Acceptance:
- reduced motion works
- all routes remain readable
- app still feels like premium fintech risk software
- animations improve clarity rather than adding spectacle
```
