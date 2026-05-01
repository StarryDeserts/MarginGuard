# Submission Evidence

Judge-facing evidence package for MarginGuard, the Sui 2026 Overflow submission.

## Project

| Field | Value |
|---|---|
| Project name | MarginGuard |
| One-line pitch | Browser-only DeepBook Margin risk console with real manager baseline reads, simulated stress demos, and a safety-gated Add Collateral PTB path. |
| GitHub repo URL | https://github.com/StarryDeserts/MarginGuard |
| Branch | main |
| Commit hash | 906842a |
| Latest commit | 906842a Initial commit |
| Working tree status | Dirty — Round 8 documentation/evidence changes are uncommitted |
| Upstream status | Tracks `origin/main`; no ahead/behind marker reported by `git status -sb` |
| Final build date | 2026-05-01 18:06:58 +08:00 |
| Release artifact / zip name | N/A — static build output in `apps/web/dist` |
| Deployed URL | Pending user deployment |
| Demo video URL | Pending user recording |

## Truth Boundary

Add Collateral PTB is implemented and safety-gated. Live signing is disabled by default. No live Add Collateral success should be claimed unless a real transaction digest is provided.

## Automated Checks

| Check | Status | Notes |
|---|---|---|
| `pnpm verify:submission-safety` | Passed | Scanned 184 text files. |
| `pnpm -C apps/web typecheck` | Passed | Exited 0. |
| `pnpm -C apps/web lint` | Passed | Exited 0. |
| `pnpm -C apps/web test` | Passed | 27 test files / 111 tests passed. |
| `pnpm -C apps/web build` | Passed | Ran with `VITE_ENABLE_LIVE_ADD_COLLATERAL=false`; exited 0 with non-blocking Vite chunk/plugin timing warnings. |
| `pnpm typecheck` | Passed | Exited 0. |
| `pnpm lint` | Passed | Exited 0. |
| `pnpm test` | Passed | 27 test files / 111 tests passed. |
| `pnpm build` | Passed | Ran with `VITE_ENABLE_LIVE_ADD_COLLATERAL=false`; exited 0 with non-blocking Vite chunk/plugin timing warnings. |

Build live flag state: `VITE_ENABLE_LIVE_ADD_COLLATERAL=false`

Safety scan result: `Passed`

## Manual QA Status

| Area | Status | Notes |
|---|---|---|
| Static preview route smoke | Passed | Static preview returned HTTP 200 for `/`, `/dashboard`, `/rescue`, `/demo`, `/settings`. |
| Wallet connection in browser | Not tested | User manual QA required. |
| Manual manager import | Not tested | User manual QA required. |
| Real DeepBook dashboard read | Not tested | User manual QA required. |
| Rescue Simulator real baseline | Not tested | User manual QA required. |
| Demo Mode baseline toggle | Not tested | User manual QA required. |
| No-debt baseline UX | Not tested | If current real manager has no debt, confirm `No debt` / `N/A` / `No active liquidation risk` and no urgent Add Collateral recommendation. |
| Live flag on with healthy manager remains blocked | Not tested | User manual QA required. |
| Screenshots captured | Not tested | Full manager IDs must be redacted. |
| Demo video recorded | Not tested | Use simulated result unless a real digest exists. |

## Live Transaction Status

| Field | Value |
|---|---|
| Live Add Collateral transaction submitted | N/A — no live Add Collateral transaction submitted. |
| Real transaction digest | N/A — no live Add Collateral transaction submitted. |
| Explorer link | N/A — no live Add Collateral transaction submitted. |

## Screenshot Evidence Checklist

- Landing page.
- Dashboard with wallet/network context.
- Dashboard real DeepBook baseline or honest read-error/unavailable state.
- Rescue Simulator real baseline or healthy/no-rescue-needed state.
- No-debt real baseline, if available, showing no active liquidation risk and no `1000.00` / `Infinity`.
- Demo Mode simulated fallback.
- Demo Mode Real DeepBook baseline + Simulated shock, if a real baseline is available.
- Field-level labels: Real DeepBook baseline, Simulated shock, Estimated projection, Demo fallback, App target.
- Transaction Review warnings and acknowledgement.
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

Current label: `Ready after manual QA / version lock`

Reason: Automated checks, safety scan, safe live-flag-off builds, and static preview HTTP route smoke passed. Wallet/manager manual QA, deployment URL, screenshots, video, and version lock still require user action because Round 8 documentation/evidence changes are uncommitted.
