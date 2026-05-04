---
phase: 15
slug: admin-ux-audit
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-04
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` (test block) |
| **Quick run command** | `yarn test` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~30–120 seconds (project-dependent) |

---

## Sampling Rate

- **After every task commit:** Run `yarn lint` (fast) and targeted `yarn test <path>` when tests were added/changed
- **After every plan wave:** Run `yarn test` and `yarn build`
- **Before `/gsd-verify-work`:** Full `yarn test` + `yarn build` green
- **Max feedback latency:** 120 seconds (full suite ceiling)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 15-P01-T01 | P01 | 1 | ADMIN-01 | — | N/A | lint | `yarn lint` | ✅ | ⬜ pending |
| 15-P01-T02 | P01 | 1 | ADMIN-01 | — | N/A | build | `yarn build` | ✅ | ⬜ pending |
| 15-P02-T01 | P02 | 2 | ADMIN-01, ADMIN-02, ADMIN-03 | — | Admin-only mutations behind role | test+lint | `yarn test` ; `yarn lint` | ✅ | ⬜ pending |
| 15-P03-T01 | P03 | 3 | AUDIT-01 | — | N/A | lint+build | `yarn lint` ; `yarn build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing Vitest + RTL setup in `src/test/setup.ts` covers infrastructure.
- **Optional:** Add focused tests for `LessonSidebar` admin-only branches if stable enough before large UI churn; otherwise manual UAT for Wave 2.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No 404 / dead navigation across app | AUDIT-01 | Click surface too large for unit tests alone | Run app (`yarn dev`); click every primary nav + listed admin buttons; confirm no console route errors and no blank 404 for in-scope links |
| Inline form UX (expand/collapse, single focus) | ADMIN-01–03 | Visual timing | As admin: open only one inline form; submit; list refreshes without full navigation |

---

## Validation Sign-Off

- [ ] All tasks have automated verify (`yarn lint` / `yarn test` / `yarn build`) or manual row above
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] No watch-mode flags in CI commands
- [ ] `nyquist_compliant: true` set in frontmatter when phase verification completes

**Approval:** pending
