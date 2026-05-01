# Submission Evidence

Judge-facing evidence package for MarginGuard, the Sui 2026 Overflow submission.

## Project

| Field | Value |
|---|---|
| Project name | MarginGuard |
| One-line pitch | Browser-only DeepBook Margin risk console with real manager baseline reads, simulated stress demos, and a safety-gated Add Collateral PTB path. |
| GitHub repo URL | https://github.com/StarryDeserts/MarginGuard |
| Branch | main |
| Submission commit | Fill after final push; final response reports the actual pushed commit. |
| Latest planning commit | de01843 UI fix |
| Working tree status | Final response records post-push working tree status. |
| Upstream status | Tracks `origin/main`; no ahead/behind marker reported by `git status -sb`. |
| Final build date | 2026-05-02 00:08:26 +08:00 |
| Release artifact / zip name | N/A - static build output in `apps/web/dist`. |
| Deployed URL | Pending user deployment. |
| Demo video URL | Pending user recording. |

If a stable version reference is needed, create or reference a final tag such as `submission-demo-v1` after the final commit is pushed.

## Truth Boundary

Add Collateral PTB is implemented and safety-gated. Live signing is disabled by default. No live Add Collateral success should be claimed unless a real transaction digest is provided.

## Automated Checks

| Check | Status | Notes |
|---|---|---|
| `pnpm verify:submission-safety` | Passed | Scanned 185 text files before final doc result update; final response records post-doc safety rerun. |
| `pnpm -C apps/web typecheck` | Passed | Exited 0. |
| `pnpm -C apps/web lint` | Passed | Exited 0. |
| `pnpm -C apps/web test` | Passed | 28 test files / 122 tests passed. |
| `pnpm -C apps/web build` | Passed | Ran with `VITE_ENABLE_LIVE_ADD_COLLATERAL=false`; exited 0 with non-blocking Vite large chunk warning. |
| `pnpm typecheck` | Passed | Exited 0. |
| `pnpm lint` | Passed | Exited 0. |
| `pnpm test` | Passed | 28 test files / 122 tests passed. |
| `pnpm build` | Passed | Ran with `VITE_ENABLE_LIVE_ADD_COLLATERAL=false`; exited 0 with non-blocking Vite large chunk warning. |

Build live flag state: `VITE_ENABLE_LIVE_ADD_COLLATERAL=false`

Safety scan result: `Passed; final response records post-doc safety rerun`

## Manual QA Status

| Area | Status | Notes |
|---|---|---|
| Static preview route smoke | Passed | Static preview returned HTTP 200 for `/`, `/dashboard`, `/rescue`, `/demo`, `/settings`. Visual/browser wallet QA remains manual. |
| User-provided screenshot QA | Passed | User-provided screenshots reviewed in planning chat: no-debt fix visually confirmed. |
| No-debt baseline UX | Passed | User-provided screenshots showed `No debt`, `N/A`, `No active liquidation risk`, no `1000.00` / `Infinity`, and no urgent Add Collateral recommendation. |
| Wallet connection in browser | Not tested | User manual QA required. |
| Wallet network verification | Not tested | Top bar may show wallet network not verified until user checks it manually. |
| Manual manager import | Not tested | User manual QA required. |
| Real DeepBook dashboard read | Not tested | User manual QA required. |
| Rescue Simulator real baseline | Not tested | User manual QA required. |
| Demo Mode baseline toggle | Not tested | User manual QA required. |
| Live flag on with healthy/no-debt manager remains blocked | Not tested | User manual QA required. |
| Final submission screenshots captured | Not tested | Record uploaded URLs or repo-relative paths only; redact full manager IDs. |
| Demo video recorded | Not tested | Use simulated result unless a real digest exists. |

## Live Transaction Status

| Field | Value |
|---|---|
| Live Add Collateral transaction submitted | N/A - no live Add Collateral transaction submitted. |
| Real transaction digest | N/A. |
| Explorer link | N/A - no live Add Collateral transaction submitted. |

## Screenshot Evidence Checklist

- Landing page.
- Dashboard with wallet/network context and full manager ID redacted.
- Dashboard no-debt real baseline showing no active liquidation risk and no `1000.00` / `Infinity`.
- Rescue Simulator no-debt real baseline plus clearly labeled simulated what-if.
- Demo Mode Real DeepBook baseline + Simulated shock showing no active liquidation risk.
- Simulated Demo Mode action-needed `1.17 -> 1.30` story.
- Field-level labels: Real DeepBook baseline, Simulated shock, Estimated projection, Demo fallback, App target.
- Transaction Review warnings and acknowledgement if shown.
- Mock/simulated result clearly labeled, with no fake Explorer link.
- Deployment URL in browser, after deployment exists.

## Known Limitations

- SUI/USDC is the only supported live Add Collateral path.
- Demo Mode shocks, stressed RR, interest drift, and expected after RR are simulated or estimated, even when seeded from a real baseline.
- If a real manager has no active debt, the action-needed `1.17 -> 1.30` story should be shown through Simulated Demo Mode or clearly labeled simulated what-if, not as the real manager state.
- Reduce-only and Smart TPSL are P1/demo-only, not live PTBs.
- No backend, indexer, keeper, relayer, custody service, private-key handling, or global manager scanner is included.
- Live Add Collateral requires controlled manual QA with a user-controlled action-needed manager and explicit wallet approval.

## Final Go / No-Go

Current label: `Ready after manual QA / deployment`

Reason: Automated checks, safe live-flag-off builds, static preview HTTP smoke, and user-provided no-debt screenshot QA passed. Deployment URL, final screenshots, demo video, wallet QA, and final commit/push evidence still determine whether the final label can be upgraded.
