---
phase: 21-tai-lieu-page
plan: P04
subsystem: routing-navigation
tags: [routing, admin-nav, integration, wave-3]
dependency_graph:
  requires: [21-P02, 21-P03]
  provides: [route-wiring-tai-lieu, admin-sidebar-nav-tai-lieu]
  affects: [src/App.tsx, src/components/admin/AdminLayout.tsx]
tech_stack:
  added: []
  patterns: [react-router-v6, protected-route-allowedRoles, admin-sidebar-nav]
key_files:
  created: []
  modified:
    - src/components/admin/AdminLayout.tsx
decisions:
  - "Task 1 (App.tsx routes + imports) already completed by P02/P03 executors as deviations — no duplicate edits"
  - "Admin nav item 'Tài liệu' added WITHOUT adminOnly flag so teachers can see it (per D-05, D-10)"
  - "Pre-existing lint errors (89 problems in unrelated files) are out-of-scope per SCOPE BOUNDARY rule — not fixed"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-18T16:07:04Z"
  tasks_completed: 2
  files_modified: 1
---

# Phase 21 Plan P04: Route Wiring & Admin Nav Integration Summary

**One-liner:** Wired `/tai-lieu` + `/quan-tri/tai-lieu` routes and added "Tài liệu" nav item to AdminLayout sidebar — completing Phase 21 integration.

## Tasks Completed

| # | Task | Status | Commit | Files |
|---|------|--------|--------|-------|
| 1 | Add imports and routes to App.tsx | ✅ Pre-done | `49cf5e0`/`be7054c` | src/App.tsx |
| 2 | Add 'Tài liệu' nav item to AdminLayout + build verify | ✅ Done | `3e19d2c` | src/components/admin/AdminLayout.tsx |

## What Was Built

**Task 1 (Pre-completed by P02/P03 executors):**
- `src/App.tsx` — Import `TaiLieuPage` and `TaiLieuAdminPage`
- Route `/tai-lieu` → `<TaiLieuPage />` (public, no ProtectedRoute)
- Route `/quan-tri/tai-lieu` → `<TaiLieuAdminPage />` (ProtectedRoute `allowedRoles={['admin', 'teacher']}`)

**Task 2 (This executor):**
- `src/components/admin/AdminLayout.tsx` — Appended nav item:
  ```tsx
  { label: 'Tài liệu', to: '/quan-tri/tai-lieu', icon: FileText }
  ```
  No `adminOnly` flag — teachers see this item in the sidebar.
- `yarn build` exits 0 ✅

## Deviations from Plan

### Auto-detected Pre-completion

**1. [Deviation] Task 1 already completed by previous executors**
- **Found during:** Initial file inspection
- **Issue:** P02 and P03 executors had already added imports and routes to App.tsx as deviations
- **Action:** Skipped Task 1 to avoid duplicates — proceeded directly to Task 2
- **Files affected:** None (no duplicate edits made)

### Pre-existing Lint Errors (Out of Scope)

`yarn lint` exits with code 1 due to 89 pre-existing problems (20 errors, 69 warnings) across unrelated files:
- `src/contexts/AuthContext.test.tsx` — prefer-const error
- Various UI component files — react-refresh/only-export-components warnings

**None of the errors are in files modified by this plan** (verified with `grep`). Per SCOPE BOUNDARY rule, these are deferred — not fixed. See deferred items below.

## Verification Results

```
✅ grep 'path="/tai-lieu"' src/App.tsx          → 1 match (public route, no ProtectedRoute)
✅ grep 'path="/quan-tri/tai-lieu"' src/App.tsx → 1 match (allowedRoles admin+teacher)
✅ grep "TaiLieuPage" src/App.tsx               → 2 matches (import + route)
✅ grep "TaiLieuAdminPage" src/App.tsx          → 2 matches (import + route)
✅ grep "quan-tri/tai-lieu" AdminLayout.tsx     → 1 match
✅ grep "Tài liệu" AdminLayout.tsx              → 1 match
✅ No adminOnly flag on tai-lieu nav item
✅ yarn build exits 0
⚠️  yarn lint exits 1 (pre-existing errors, not in modified files)
```

## Known Stubs

None — all routes are fully wired to real page components created in P02 and P03.

## Threat Flags

None — security posture matches threat model:
- T-21-10: `/quan-tri/tai-lieu` protected by `ProtectedRoute allowedRoles={['admin', 'teacher']}` ✅
- T-21-11: `/tai-lieu` intentionally public (D-01) ✅

## Self-Check: PASSED

- `src/components/admin/AdminLayout.tsx` — modified and committed ✅
- Commit `3e19d2c` exists in git log ✅
- Routes verified in App.tsx ✅
- Nav item verified in AdminLayout.tsx ✅
- `yarn build` exits 0 ✅
