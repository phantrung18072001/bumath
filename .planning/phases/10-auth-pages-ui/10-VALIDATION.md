---
phase: 10
slug: auth-pages-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-01
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `yarn test src/pages/Login.test.tsx` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/pages/Login.test.tsx`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green + manual browser check at 375px and 1024px
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | DS-01 | smoke | `yarn test` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | DS-01 | smoke | `yarn test` | ✅ | ⬜ pending |
| 10-02-01 | 02 | 2 | AUTH-UI-01 | unit | `yarn test src/pages/Login.test.tsx` | ✅ | ⬜ pending |
| 10-02-02 | 02 | 2 | AUTH-UI-02 | unit | `yarn test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

- `src/pages/Login.test.tsx` already exists and covers redirect logic for AUTH-UI-01
- No new test files required — this phase is a pure UI refactor; logic is preserved verbatim
- Vitest + RTL already installed and configured

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login page renders centered card with BuMath logo | AUTH-UI-01 | Visual layout — no snapshot test configured | Open `/dang-nhap` in browser; verify centered white card, logo visible at 375px and 1024px |
| Register 2-col grid collapses on mobile | AUTH-UI-02 | CSS responsive layout — no visual regression test | Open `/dang-ky` in browser at 375px; verify single-column layout; at 640px+, verify 2-col grid |
| BuMath CSS variables and fonts load correctly | DS-01 | Font rendering and CSS variable check | Open DevTools → Elements; verify `--bm-primary: #0D9488` in `:root`; verify Baloo 2 applied to logo |
| Math symbols float animation visible | AUTH-UI-01/02 | CSS keyframe animation | Verify subtle `translateY` oscillation of math symbols in background at ~0.08 opacity |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
