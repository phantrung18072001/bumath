# Phase 8: Teacher Role Access - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 08-teacher-role-access
**Areas discussed:** Route architecture, Layout & navigation, ProtectedRoute API, Post-login redirect

---

## Route Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Separate /teacher/* routes | Clean separation, aligns with Phase 2 D-11 | |
| Share /admin/* with teachers | Less code, admin URL namespace shared | ✓ |
| /admin/* + /teacher redirect alias | Middle ground with indirection | |

**User's choice:** Share existing /admin/submissions routes with teachers — no new route prefix.

**Follow-up: wrong-role redirect**

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect to /admin/submissions | Teacher lands at the only allowed place | ✓ |
| Redirect to / (landing page) | Current default behavior | |
| Show 403-style page | Extra page, more informative | |

**User's choice:** Redirect to /admin/submissions when teacher hits admin-only pages.

---

## Layout & Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse AdminLayout, hide admin-only items | Minimal code change, role-aware filtering | ✓ |
| Create separate TeacherLayout | Clean separation, duplicates shell code | |
| No sidebar — full-width layout | Simpler but diverges from admin look | |

**User's choice:** Reuse AdminLayout, hide "Quản lý tài khoản" and "Quản lý khóa học" nav items for teacher role.

**Sidebar header label**

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 'Quản lý' for both roles | No change, simpler | ✓ |
| Role-specific label | 'Giảng viên' for teacher | |

**User's choice:** Keep 'Quản lý' label for both roles.

---

## ProtectedRoute API

| Option | Description | Selected |
|--------|-------------|----------|
| allowedRoles array prop | Explicit, readable, backward compat with requiredRole | ✓ |
| minimumRole hierarchy | Elegant but roles don't perfectly stack | |
| requiredRole as string \| string[] | Overload existing prop, messier type | |

**User's choice:** `allowedRoles?: Role[]` prop alongside existing `requiredRole`.

---

## Post-Login Redirect

| Option | Description | Selected |
|--------|-------------|----------|
| /admin/submissions | Direct to grading queue | ✓ |
| /admin/submissions + welcome toast | Same destination with greeting | |
| You decide | Defer to Claude | |

**User's choice:** Teacher redirects to `/admin/submissions` after login.

---

## Claude's Discretion

- Exact implementation of `allowedRoles` role-redirect logic in ProtectedRoute
- Test approach for new ProtectedRoute prop variants

## Deferred Ideas

None.
