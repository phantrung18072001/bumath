---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `yarn test` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | INFRA-01 | manual | `curl -I https://<vercel-url>/courses/test` | ✅ | ⬜ pending |
| 1-01-02 | 01 | 1 | INFRA-02 | unit | `yarn test src/lib/supabase.test.ts` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | INFRA-03 | unit | `yarn test src/lib/supabase.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/supabase.test.ts` — tests that supabase client initializes with env vars (INFRA-02, INFRA-03)

*Note: INFRA-01 (Vercel SPA routing) requires manual verification via browser or curl — cannot be automated in unit tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Deep URL `/courses/123` returns app, not 404 | INFRA-01 | Requires live Vercel deployment; cannot simulate in jsdom | Deploy to Vercel, open browser at `https://<url>/courses/123`, confirm app loads (not 404) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
