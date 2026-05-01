# Phase 8: Teacher Role Access - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the `teacher` role fully functional: teachers can log in, reach the grading queue (`/admin/submissions`), and grade submissions. This phase does NOT add new grading features — the grading UI already exists and works. The work is entirely about access control and routing.

Requirements: ROLE-01, ROLE-02, GRADE-01, GRADE-02, GRADE-03

</domain>

<decisions>
## Implementation Decisions

### Route Architecture
- **D-01:** Teachers share the existing `/admin/submissions` and `/admin/submissions/:id` routes — no separate `/teacher/*` prefix.
- **D-02:** When a teacher hits an admin-only page (`/admin/users`, `/admin/courses`, `/admin/courses/*`), redirect to `/admin/submissions` — not to `/` (landing page) and not a 403 page.

### Layout & Navigation
- **D-03:** Reuse `AdminLayout` for teachers. Hide the two admin-only nav items (`Quản lý tài khoản` → `/admin/users`, `Quản lý khóa học` → `/admin/courses`) when `profile.role === 'teacher'`. The `Chấm bài` nav item always shows for both roles.
- **D-04:** Sidebar header label stays `Quản lý` for both admin and teacher — no role-specific label change.

### ProtectedRoute API
- **D-05:** Add `allowedRoles?: Array<'student' | 'teacher' | 'admin'>` prop to `ProtectedRoute` alongside the existing `requiredRole` prop (kept for backward compatibility). Grading routes use `allowedRoles={['admin', 'teacher']}`. Non-grading admin routes keep `requiredRole="admin"`.
- **D-06:** When `allowedRoles` is provided and user's role is not in the list, redirect to the role's natural home — for teacher hitting admin-only routes, redirect to `/admin/submissions`; for student hitting any admin route, redirect to `/courses`.

### Post-Login Redirect
- **D-07:** After successful login, teacher role redirects to `/admin/submissions` (the grading queue). Admin keeps current redirect (to `/admin/users`). Student keeps current redirect (to `/courses`).

### Claude's Discretion
- Exact implementation of `allowedRoles` role-redirect logic in ProtectedRoute (switch/map pattern vs. if-else)
- Test approach for new ProtectedRoute prop variants

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Existing Code (must read before planning)
- `src/components/auth/ProtectedRoute.tsx` — current single-role guard; needs `allowedRoles` extension
- `src/App.tsx` — all route definitions; grading routes need `allowedRoles` applied
- `src/components/admin/AdminLayout.tsx` — sidebar `navItems` array; needs role-aware filtering
- `src/pages/Login.tsx` — post-login redirect logic; teacher case needs adding
- `src/types/auth.ts` — `Profile.role` type ('student' | 'teacher' | 'admin') — already correct

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AdminLayout` — already renders all grading UI; just needs nav item filtering by role
- `ProtectedRoute` — clean interface, easy to extend with `allowedRoles` prop
- `SubmissionsPage` and `GradingPage` — fully implemented grading pages, zero changes needed

### Established Patterns
- `useAuth()` hook provides `profile.role` — available in any component for conditional rendering
- Role check pattern in `ProtectedRoute`: `profile?.role !== requiredRole` — extend to `!allowedRoles.includes(profile?.role)`
- Post-login redirect in `Login.tsx` uses profile role switch — teacher case slots in naturally

### Integration Points
- `src/App.tsx` routes: change `<ProtectedRoute requiredRole="admin">` to `<ProtectedRoute allowedRoles={['admin', 'teacher']}>` for `/admin/submissions` and `/admin/submissions/:id`
- `AdminLayout` `navItems` array: wrap admin-only items with role check from `useAuth()`

</code_context>

<specifics>
## Specific Ideas

No specific UI references — teacher layout should match admin layout visually, just with fewer nav items.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

### Reviewed Todos (not folded)
- "Install all shadcn/radix components" — UI component installation task, not related to teacher role access routing work. Deferred.

</deferred>

---

*Phase: 08-teacher-role-access*
*Context gathered: 2026-05-01*
