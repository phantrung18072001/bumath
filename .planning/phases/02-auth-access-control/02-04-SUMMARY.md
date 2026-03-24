---
phase: 02-auth-access-control
plan: 04
status: completed
created: 2026-03-24T16:45:30+07:00
---

# Wire Admin Route

## What Was Done
Wired the orphaned admin `UsersPage` into `App.tsx` routing. It is protected by the `ProtectedRoute` guard with `requiredRole="admin"`. This ensures only authenticated admin users can access the `/admin/users` page, while unauthorized users are redirected appropriately.

## Key File Changes
- `src/App.tsx`: Added imports for `ProtectedRoute` and `UsersPage`, and added the `<Route path="/admin/users">` element wrapped in `<ProtectedRoute requiredRole="admin">`.

## Self-Check
- [x] All acceptance criteria met
- [x] Build passes
- [x] Tests pass
