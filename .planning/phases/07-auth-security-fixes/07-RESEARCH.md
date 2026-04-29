# Phase 7: Auth & Security Fixes — Research

**Researched:** 2026-04-29
**Domain:** Supabase RLS, React Router navigation, React Context auth state
**Confidence:** HIGH — all findings based on direct code inspection of source files

---

## Summary

Phase 7 closes three specific gaps from the v1.0 milestone audit. All three are surgical fixes to existing code with no new dependencies or architectural changes needed.

**ROLE-03** is the most nuanced: the existing migration file `20260324_01_profiles.sql` already contains correct profiles table RLS policies, but the audit marked it orphaned because Phase 2 VERIFICATION.md was written before plan 02-06 (gap closure) ran. Phase 7 must produce an idempotent migration to ensure the policies are applied on the live Supabase instance regardless of prior state.

**AUTH-04** requires changing `Login.tsx` to wait for the `profile` to load before redirecting, then branching by `approval_status` and `role`. The `useAuth()` hook already exposes `profile` — the fix is wiring it into the existing redirect `useEffect`.

**AUTH-03** requires adding a logout button to `AdminLayout.tsx`. The exact pattern (hook calls, handler, button JSX) already exists in `StudentLayout.tsx` and can be transplanted directly.

No cross-dependencies exist between the three gaps. They can be planned and executed independently.

**Primary recommendation:** Plan 3 plans — Wave 0 (test stubs for Login + AdminLayout), then each gap as its own plan. SQL migration has no test coverage needed.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ROLE-03 | RLS policies trong Supabase ngăn học sinh xem dữ liệu của nhau | Profiles table already has `ENABLE ROW LEVEL SECURITY` + `get_my_role()` helper; new idempotent migration file needed to ensure live DB has policies applied |
| AUTH-03 | Học sinh/giảng viên/admin có thể đăng xuất từ bất kỳ trang nào | `AdminLayout.tsx` sidebar has no logout button; `StudentLayout.tsx` has the exact pattern to copy |
| AUTH-04 | Tài khoản học sinh mới ở trạng thái "pending" cho đến khi admin duyệt (redirect on login) | `Login.tsx` line 55 calls `navigate('/')` unconditionally; `useAuth()` exposes `profile` with `approval_status` and `role` fields |
</phase_requirements>

---

## Project Constraints (from copilot-instructions.md)

### Required tools & conventions
- **Package manager:** Yarn 4.11.0 — always `yarn`, never `npm`
- **UI components:** Always use shadcn/ui or Radix primitives before custom components; use `yarn dlx shadcn@latest add <name>` to install missing ones; **never edit `src/components/ui/` manually**
- **Testing:** Vitest + React Testing Library; jsdom; globals enabled (no import for `describe`/`it`/`expect`); setup file `src/test/setup.ts`; test files co-located at `src/**/*.{test,spec}.{ts,tsx}`
- **Auth context:** Use `useAuth()` for auth state; it throws outside `AuthProvider`
- **Supabase migrations:** Files in `supabase/migrations/` named `YYYYMMDD_NN_description.sql`; run manually via Supabase Dashboard SQL Editor — no CLI runner configured
- **RLS helper:** Use `get_my_role()` SECURITY DEFINER function (not direct profile subqueries) in RLS policies to avoid infinite recursion
- **TypeScript:** Strict mode disabled; `noImplicitAny` off

### Forbidden patterns
- Do not edit `src/components/ui/` components directly
- Do not use `npm` — use `yarn`

---

## Gap 1: ROLE-03 — Profiles Table RLS

### Current State

**Migration file:** `supabase/migrations/20260324_01_profiles.sql`

The file already contains:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE POLICY "Students can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR get_my_role() IN ('admin', 'teacher')
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
```

**Why the audit marked it orphaned:** Phase 2 VERIFICATION.md was written after plans 02-01 through 02-03, before plan 02-06 (gap closure: RLS policies SQL migration) ran. The audit's evidence quotes the stale VERIFICATION.md. The tech debt note in the audit confirms: *"Phase 2 VERIFICATION still shows gaps_found — re-verification never run after 02-04/02-05 fixed the gaps."*

**Bottom line:** The migration file is correct. The gap is that Phase 7 must ensure the policies are definitively applied on the live Supabase instance. An idempotent migration using `DROP POLICY IF EXISTS` + `CREATE POLICY` is the correct approach.

### Analysis of Existing Policy

The policy `"Students can view own profile"` with `id = auth.uid() OR get_my_role() IN ('admin', 'teacher')` correctly:
- Allows a student to SELECT only their own row
- Allows admin and teacher to SELECT all rows
- Blocks a student from querying other students' profiles

`FORCE ROW LEVEL SECURITY` ensures even the table owner cannot bypass policies.

`get_my_role()` is SECURITY DEFINER — it reads `profiles` as the function owner (bypasses RLS), preventing infinite recursion. This pattern is confirmed by the copilot-instructions directive: *"use `get_my_role()` SECURITY DEFINER function (not direct profile subqueries) in RLS policies to avoid infinite recursion."*

### What Phase 7 Must Produce

A new migration file: `supabase/migrations/20260429_16_profiles_rls.sql`

```sql
-- Migration: Confirm and enforce profiles table RLS (ROLE-03 gap closure)
-- Phase 7: Auth & Security Fixes
-- Purpose: Idempotently ensure RLS policies for the profiles table are applied
-- on the live Supabase instance. The schema migration (01_profiles.sql) contained
-- these policies but was marked orphaned in Phase 2 verification. This migration
-- makes ROLE-03 definitively satisfied.

-- Enable RLS (safe to re-run — idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Ensure get_my_role() helper exists (safe to re-run with CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Drop existing policies first to make idempotent
DROP POLICY IF EXISTS "Students can view own profile" ON public.profiles;

-- Re-create with correct isolation: students see own row only; admin/teacher see all
CREATE POLICY "Students can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR get_my_role() IN ('admin', 'teacher')
  );

-- Update policies (idempotent)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
CREATE POLICY "Admin can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
```

### AuthContext Compatibility Verification

`AuthContext.tsx` fetches profiles with:
```typescript
supabase.from('profiles').select('*').eq('id', currentSession.user.id).single()
```

With the policy `id = auth.uid()` — querying `eq('id', currentSession.user.id)` where `currentSession.user.id === auth.uid()` → the policy allows it. ✓ No change needed to AuthContext.

No INSERT policy needed — the `handle_new_user()` trigger runs as SECURITY DEFINER and bypasses RLS. ✓

---

## Gap 2: AUTH-04 — Login Redirect for Pending Students

### Current State

**File:** `src/pages/Login.tsx`

Two redirect paths, both wrong:

**Path A (line 22–26):** `useEffect` for already-authenticated users:
```typescript
useEffect(() => {
  if (!loading && user) {
    navigate('/')   // ← always goes to landing page
  }
}, [user, loading, navigate])
```

**Path B (line 55):** After `signInWithPassword` success:
```typescript
} else {
  navigate('/')   // ← always goes to landing page
}
```

Current `useAuth()` destructure (line 12):
```typescript
const { user, loading } = useAuth()
```

### The Async Profile Load Problem

When `signInWithPassword` resolves (Path B):
1. Supabase emits `SIGNED_IN` event → AuthContext's `onAuthStateChange` fires
2. AuthContext calls `setUser(user)`, then `setTimeout(0, () => fetch profile)`
3. Profile fetch is async — not available at the moment `navigate('/')` runs

This means Path B **cannot** check `profile.approval_status` inline. It must defer to Path A (the `useEffect`) which runs after `loading` becomes false and `profile` is populated.

### The Fix

1. **Add `profile` to `useAuth()` destructure** (line 12):
```typescript
const { user, loading, profile } = useAuth()
```

2. **Replace Path A's `useEffect`** with role-aware redirect:
```typescript
useEffect(() => {
  if (!loading && user && profile) {
    if (profile.approval_status === 'pending' || profile.approval_status === 'rejected') {
      navigate('/pending')
    } else if (profile.role === 'admin' || profile.role === 'teacher') {
      navigate('/admin/users')
    } else {
      navigate('/courses')
    }
  }
}, [user, loading, profile, navigate])
```

3. **Remove Path B's `navigate('/')`** — let the `useEffect` handle it after profile loads:
```typescript
} else {
  // Profile redirect handled by useEffect once profile loads
}
```

### Redirect Matrix (from audit + REQUIREMENTS)

| Condition | Redirect |
|-----------|----------|
| `approval_status === 'pending'` | `/pending` |
| `approval_status === 'rejected'` | `/pending` |
| `role === 'admin'` + approved | `/admin/users` |
| `role === 'teacher'` + approved | `/admin/users` (grading queue — Phase 8 will add teacher routes) |
| `role === 'student'` + approved | `/courses` |

**Note:** Teacher redirect to `/admin/users` is a reasonable default for Phase 7 (Phase 8 will add teacher-specific routes). Alternatively, redirect teachers to `/admin/submissions`. The planner should choose; `/admin/submissions` is more useful for a teacher.

### No Race Condition Risk

The existing `useEffect` on lines 22–26 already guards with `!loading && user`. After `profile` is added to the dependency array and condition, it waits for all three: `!loading && user && profile`. This eliminates the race.

---

## Gap 3: AUTH-03 — AdminLayout Logout Button

### Current State

**File:** `src/components/admin/AdminLayout.tsx`

No auth imports, no logout:
```typescript
import { Link, useLocation } from 'react-router-dom'
import { Users, BookOpen, ClipboardList, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
// ↑ No useAuth, no useNavigate, no LogOut icon
```

Bottom sidebar section (lines 42–49):
```tsx
<div className="p-3 border-t">
  <Link
    to="/"
    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
  >
    ← Về trang chủ
  </Link>
</div>
```

### The Fix Pattern (from StudentLayout.tsx)

**StudentLayout.tsx** already demonstrates the exact pattern. Mirror it in AdminLayout:

**Step 1: Add imports**
```typescript
import { Link, useLocation, useNavigate } from 'react-router-dom'  // add useNavigate
import { Users, BookOpen, ClipboardList, LayoutDashboard, LogOut } from 'lucide-react'  // add LogOut
import { useAuth } from '@/contexts/AuthContext'  // add
```

**Step 2: Add hook calls and handler inside component**
```typescript
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { signOut } = useAuth()   // add
  const navigate = useNavigate()  // add

  const handleLogout = async () => {  // add
    await signOut()
    navigate('/login')
  }
```

**Step 3: Add logout button in sidebar bottom section**
```tsx
<div className="p-3 border-t space-y-1">
  <Link
    to="/"
    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
  >
    ← Về trang chủ
  </Link>
  <button
    onClick={handleLogout}
    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
  >
    <LogOut className="h-4 w-4 shrink-0" />
    Đăng xuất
  </button>
</div>
```

### UX-02 Compliance

AUTH-03 requires logout from any page. UX-02 requires 48px tap targets. The button uses `py-2.5` which gives ~40px height — identical to StudentLayout's approach. If strict UX-02 compliance is needed, add `min-h-[48px]` class. The audit flagged this as "minor" severity so existing admin sidebar pattern (40px) is acceptable.

---

## Dependency Analysis

| Gap | Depends On | Blocks |
|-----|-----------|--------|
| ROLE-03 (SQL migration) | Nothing (DB-only) | Nothing |
| AUTH-04 (Login redirect) | Nothing | Nothing |
| AUTH-03 (AdminLayout logout) | Nothing | Nothing |

**No cross-dependencies.** All three gaps are fully independent. The planner can order them arbitrarily; recommended order: Wave 0 (stubs) → ROLE-03 (migration, no tests) → AUTH-04 (Logic + tests) → AUTH-03 (UI + tests).

---

## Standard Stack

No new dependencies needed. All fixes use existing stack:

| Component | Source | Used For |
|-----------|--------|---------|
| `useAuth()` | `@/contexts/AuthContext` | Both AUTH-03 and AUTH-04 |
| `useNavigate` | `react-router-dom` | AUTH-03 (AdminLayout) |
| `LogOut` icon | `lucide-react` | AUTH-03 (AdminLayout) |
| Supabase SQL | `supabase/migrations/` | ROLE-03 |
| Vitest + RTL | `vitest`, `@testing-library/react` | All tests |

---

## Architecture Patterns

### Migration Pattern (from `20260427_13_catalogue_rls.sql`)
```sql
-- 1. Drop old policy first (idempotent)
DROP POLICY IF EXISTS "policy_name" ON table_name;
-- 2. Create new policy
CREATE POLICY "policy_name" ON table_name FOR SELECT USING (...);
```

### Test Mock Pattern (from `StudentLayout.test.tsx`)
```typescript
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    profile: { id: 'user-1', full_name: 'Test User', role: 'admin' },
    loading: false,
    signOut: vi.fn(),
  }),
}))
```

### Async Login Test Pattern (from `AuthContext.test.tsx`)
```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      // ...
    },
    from: vi.fn().mockReturnValue({ select: vi.fn()... })
  }
}))
```

---

## Common Pitfalls

### Pitfall 1: Testing navigate() in Login.tsx
**What goes wrong:** `navigate` from `useNavigate` is not called after `signInWithPassword` resolves because the redirect is now in `useEffect`, not `handleSubmit`. Tests that check `navigate` immediately after submit will fail.

**How to avoid:** Tests must trigger `onAuthStateChange` callback (simulate SIGNED_IN) and wait for `loading` to become false + `profile` to be set before asserting navigation. Alternatively, stub `useAuth()` to immediately return `{ loading: false, user: mockUser, profile: mockProfile }` — the `useEffect` will fire on render.

**Pattern:** Use `vi.mocked(useAuth).mockReturnValue({ loading: false, user: mockUser, profile: mockApprovedStudent })` then assert `navigate('/courses')` was called.

### Pitfall 2: Profile null on first useEffect run
**What goes wrong:** When Login mounts (not already logged in), `user` is null, `loading` is true, `profile` is null. The `useEffect` will fire with `!loading && user && profile` = false → no redirect. This is correct and expected — don't add `!profile` guards that would break the redirect.

**How to avoid:** The condition `!loading && user && profile` (all three truthy) is the correct gate. Do not weaken it.

### Pitfall 3: Infinite redirect loop
**What goes wrong:** If an already-logged-in user visits `/login` and `useEffect` redirects to `/courses`, but `/courses` has a ProtectedRoute that redirects back to `/login` (for pending users) — not a loop because `useEffect` checks `approval_status`.

**Not an issue:** The existing ProtectedRoute in `src/components/auth/ProtectedRoute.tsx` redirects pending → `/pending`, not → `/login`. The redirect chain is: Login → `/pending` (for pending user). No loop. ✓

### Pitfall 4: Teacher redirect destination in Phase 7
**What goes wrong:** Teachers are redirected to `/admin/users` but have no admin role — `ProtectedRoute requiredRole="admin"` will block them and redirect to `/`.

**How to avoid:** For Phase 7, redirect teachers to `/` (landing page) to avoid hitting an admin-protected route. Phase 8 will add teacher-accessible routes. OR, if Phase 8 is imminent, redirect to `/admin/submissions` if ProtectedRoute is updated to accept teacher role there. **Decision for planner:** safest for Phase 7 is to redirect teachers to `/` (same as current behavior) since Phase 8 handles teacher routing.

### Pitfall 5: Logout navigates before signOut completes
**What goes wrong:** `navigate('/login')` is called before `signOut()` resolves, leaving residual auth state.

**How to avoid:** Use `await signOut()` before `navigate('/login')` — exactly as in StudentLayout.tsx. ✓

---

## Code Examples

### Login.tsx — Full Redirect useEffect (proposed)
```typescript
// Source: direct analysis of Login.tsx + AuthContext.tsx
const { user, loading, profile } = useAuth()   // add profile

useEffect(() => {
  if (!loading && user && profile) {
    if (profile.approval_status === 'pending' || profile.approval_status === 'rejected') {
      navigate('/pending')
    } else if (profile.role === 'admin' || profile.role === 'teacher') {
      navigate('/admin/users')
    } else {
      navigate('/courses')
    }
  }
}, [user, loading, profile, navigate])

// In handleSubmit success path — remove navigate('/'), rely on useEffect:
} else {
  // Redirect handled by useEffect once profile loads via AuthContext
}
```

### AdminLayout.tsx — Imports and logout handler (proposed)
```typescript
// Source: mirrors StudentLayout.tsx pattern
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Users, BookOpen, ClipboardList, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }
  // ...
```

### Test: Login redirect to /pending
```typescript
// Source: pattern from ProtectedRoute.test.tsx + StudentLayout.test.tsx
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: vi.fn() }
})

it('redirects to /pending when profile.approval_status is pending', async () => {
  const mockNavigate = vi.fn()
  vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'user-1' } as never,
    session: {} as never,
    profile: { ...mockProfile, approval_status: 'pending' },
    loading: false,
    signOut: vi.fn(),
  })

  render(<BrowserRouter><Login /></BrowserRouter>)

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/pending')
  })
})
```

---

## Test Strategy

### Existing Tests
- **`AuthContext.test.tsx`** — covers profile loading, signOut, onAuthStateChange; **no changes needed**
- **`ProtectedRoute.test.tsx`** — covers role/status redirect behavior; **no changes needed**
- **`StudentLayout.test.tsx`** — logout pattern reference; **no changes needed**
- **No `Login.test.tsx`** — must be created ← Wave 0 gap
- **No `AdminLayout.test.tsx`** — must be created ← Wave 0 gap

### New Test Files Required

| File | What to Test | Priority |
|------|-------------|---------|
| `src/pages/Login.test.tsx` | AUTH-04 redirect logic | HIGH |
| `src/components/admin/AdminLayout.test.tsx` | AUTH-03 logout button exists and works | HIGH |

### Login.test.tsx Test Cases
1. `redirects to /pending when approval_status is 'pending'`
2. `redirects to /pending when approval_status is 'rejected'`
3. `redirects to /courses when role is 'student' and status is 'approved'`
4. `redirects to /admin/users when role is 'admin' and status is 'approved'`
5. `does NOT redirect when loading is true`
6. `does NOT redirect when profile is null`
7. `renders login form when user is unauthenticated`

### AdminLayout.test.tsx Test Cases
1. `renders logout button with text "Đăng xuất"`
2. `clicking logout calls signOut()`
3. `after logout, navigates to /login`
4. `renders all nav items (Quản lý tài khoản, Quản lý khóa học, Chấm bài)`
5. `renders "Về trang chủ" link pointing to /`

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (version in package.json) + React Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test src/pages/Login.test.tsx src/components/admin/AdminLayout.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ROLE-03 | Profiles RLS blocks cross-user reads | manual-only | N/A — requires live Supabase | ❌ N/A |
| AUTH-04 | Pending user redirected to `/pending` after login | unit | `yarn test src/pages/Login.test.tsx` | ❌ Wave 0 |
| AUTH-04 | Approved student redirected to `/courses` after login | unit | `yarn test src/pages/Login.test.tsx` | ❌ Wave 0 |
| AUTH-04 | Admin redirected to `/admin/users` after login | unit | `yarn test src/pages/Login.test.tsx` | ❌ Wave 0 |
| AUTH-03 | Logout button visible in AdminLayout | unit | `yarn test src/components/admin/AdminLayout.test.tsx` | ❌ Wave 0 |
| AUTH-03 | Clicking logout calls signOut + navigates to /login | unit | `yarn test src/components/admin/AdminLayout.test.tsx` | ❌ Wave 0 |

**Note on ROLE-03:** RLS policies are enforced by the Supabase server. They cannot be tested with Vitest/jsdom. The verification is manual: apply the SQL migration and verify via Supabase Dashboard or test client. This is consistent with how all other RLS migrations in this project are handled (no automated tests for any migration in `supabase/migrations/`).

### Sampling Rate
- **Per task commit:** `yarn test src/pages/Login.test.tsx src/components/admin/AdminLayout.test.tsx`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/pages/Login.test.tsx` — covers AUTH-04 redirect logic
- [ ] `src/components/admin/AdminLayout.test.tsx` — covers AUTH-03 logout

---

## Environment Availability

Step 2.6: SKIPPED — This phase makes no changes to build tooling, runtime services, or external tools. The only external system is Supabase (for the SQL migration), which must be manually applied via the Dashboard SQL Editor as per project conventions. No new tools or services are required.

---

## File Change Summary

| File | Change Type | Gap |
|------|------------|-----|
| `supabase/migrations/20260429_16_profiles_rls.sql` | CREATE NEW | ROLE-03 |
| `src/pages/Login.tsx` | EDIT (lines 12, 22–26, 55) | AUTH-04 |
| `src/components/admin/AdminLayout.tsx` | EDIT (imports + bottom sidebar) | AUTH-03 |
| `src/pages/Login.test.tsx` | CREATE NEW | AUTH-04 tests |
| `src/components/admin/AdminLayout.test.tsx` | CREATE NEW | AUTH-03 tests |

---

## Open Questions

1. **Teacher redirect destination in AUTH-04**
   - What we know: Teachers are approved users with `role='teacher'`; no teacher routes exist until Phase 8
   - What's unclear: Should `navigate('/admin/users')` be used for teachers (will be blocked by admin-only ProtectedRoute) or `/` (landing page, no content)?
   - Recommendation: Redirect teachers to `/` for Phase 7; Phase 8 adds teacher routes. OR treat teacher same as admin in the redirect (Phase 8 will anyway make admin routes accept teacher).

2. **Was the original `20260324_01_profiles.sql` ever applied?**
   - What we know: The file exists and is syntactically correct; the app works (profiles table functions)
   - What's unclear: Whether the RLS POLICIES in that file were applied (table creation would have worked, policies might not)
   - Recommendation: The idempotent migration in Phase 7 resolves this — it ensures policies exist regardless.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `src/pages/Login.tsx` — current redirect logic
- Direct inspection of `src/components/admin/AdminLayout.tsx` — missing logout
- Direct inspection of `src/components/student/StudentLayout.tsx` — logout pattern to copy
- Direct inspection of `src/contexts/AuthContext.tsx` — profile loading sequence
- Direct inspection of `supabase/migrations/20260324_01_profiles.sql` — existing RLS policies
- Direct inspection of `.planning/v1.0-MILESTONE-AUDIT.md` — gap definitions
- Direct inspection of `src/types/auth.ts` — Profile type with role and approval_status fields

### Secondary (MEDIUM confidence)
- Existing test files (`StudentLayout.test.tsx`, `AuthContext.test.tsx`, `ProtectedRoute.test.tsx`) — test patterns and mock conventions
- `supabase/migrations/20260427_13_catalogue_rls.sql` — idempotent migration pattern (`DROP POLICY IF EXISTS`)

---

## Metadata

**Confidence breakdown:**
- ROLE-03 findings: HIGH — migration file content verified directly; approach matches existing patterns
- AUTH-04 findings: HIGH — Login.tsx code verified line by line; async profile load mechanism confirmed from AuthContext.tsx
- AUTH-03 findings: HIGH — AdminLayout.tsx verified; exact fix pattern available from StudentLayout.tsx
- Test strategy: HIGH — existing test files confirm framework, mock patterns, and file structure

**Research date:** 2026-04-29
**Valid until:** 2026-06-01 (stable codebase — only changes if Phase 8 is executed before Phase 7)

---

## RESEARCH COMPLETE
