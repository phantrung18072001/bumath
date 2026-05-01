---
phase: 08-teacher-role-access
plan: 02
subsystem: ui
tags: [admin-layout, nav-filtering, login-redirect, teacher-role]

requires:
  - phase: 08-01
    provides: ProtectedRoute allowedRoles prop enabling teacher access to grading routes

provides:
  - AdminLayout role-aware sidebar (teacher sees Chấm bài only)
  - Teacher post-login redirect to /admin/submissions

affects: []

tech-stack:
  added: []
  patterns: [adminOnly flag on navItem to filter sidebar by role]

key-files:
  created: []
  modified:
    - src/components/admin/AdminLayout.tsx
    - src/components/admin/AdminLayout.test.tsx
    - src/pages/Login.tsx
    - src/pages/Login.test.tsx
---

# Plan 08-02 Summary

## What Was Built

Role-aware sidebar filtering in `AdminLayout` so teachers only see the grading queue nav item. Post-login redirect updated so teachers land directly at `/admin/submissions` instead of `/`.

## Nav Visibility Map

| Nav item | Admin | Teacher |
|----------|-------|---------|
| Quản lý tài khoản | ✓ | ✗ |
| Quản lý khóa học | ✓ | ✗ |
| Chấm bài | ✓ | ✓ |

Implementation: `adminOnly: true` flag on first two items; `visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)`.

## Login Redirect Map

| Role | Redirects to |
|------|-------------|
| admin | `/admin/users` (unchanged) |
| teacher | `/admin/submissions` (was `/`) |
| student | `/courses` (unchanged) |

## Sidebar Styling Preserved

All pre-existing classes preserved verbatim: `w-60`, `bg-card`, `border-r`, `min-h-[calc(100vh-48px)]`, `px-3 py-2.5`, `bg-primary text-primary-foreground` (active), `text-muted-foreground hover:bg-muted hover:text-foreground` (inactive).

## Test Changes

- `AdminLayout.test.tsx`: added `vi.mock` for `useAuth`, `setRole` helper, `beforeEach` defaults to admin — 2 new tests for teacher role (5 total, all pass)
- `Login.test.tsx`: updated "redirects to / when role is teacher" → "redirects to /admin/submissions when role is teacher" (5 total, all pass)

## Self-Check: PASSED
