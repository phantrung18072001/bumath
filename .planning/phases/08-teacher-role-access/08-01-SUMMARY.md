---
phase: 08-teacher-role-access
plan: 01
subsystem: auth
tags: [protected-route, role-based-access, react-router, teacher-role]

requires:
  - phase: 02-auth-access-control
    provides: ProtectedRoute with requiredRole prop and useAuth context

provides:
  - ProtectedRoute with allowedRoles prop (multi-role gate, D-05)
  - Role-aware redirect helper: teacher → /admin/submissions, student → /courses (D-06)
  - Grading routes (/admin/submissions, /admin/submissions/:id) open to both admin and teacher

affects: [08-02-teacher-role-access]

tech-stack:
  added: []
  patterns: [allowedRoles array prop alongside requiredRole for multi-role route gating]

key-files:
  created: []
  modified:
    - src/components/auth/ProtectedRoute.tsx
    - src/components/auth/ProtectedRoute.test.tsx
    - src/App.tsx
---

# Plan 08-01 Summary

## What Was Built

Extended `ProtectedRoute` with an `allowedRoles` prop that supports a list of roles, and applied it to the two grading routes in App.tsx so teachers can access the existing SubmissionsPage and GradingPage without admin privileges.

## Final ProtectedRoute Prop Signature

```typescript
type Role = 'student' | 'teacher' | 'admin'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role       // existing — redirects to "/" on mismatch
  allowedRoles?: Array<Role> // new — redirects role-aware on exclusion (D-05)
}
```

## Redirect Map (allowedRoles fallback)

| Excluded role | Redirects to |
|---------------|-------------|
| `teacher` | `/admin/submissions` |
| `student` | `/courses` |
| anything else | `/` |

## Routes Converted in App.tsx

| Route | Before | After |
|-------|--------|-------|
| `/admin/submissions` | `requiredRole="admin"` | `allowedRoles={['admin', 'teacher']}` |
| `/admin/submissions/:submissionId` | `requiredRole="admin"` | `allowedRoles={['admin', 'teacher']}` |
| All other `/admin/*` routes | `requiredRole="admin"` | **unchanged** |

## Test Counts

- Existing tests: 6 (all pass)
- New allowedRoles tests: 5
- **Total: 11/11 passing**

## Self-Check: PASSED
