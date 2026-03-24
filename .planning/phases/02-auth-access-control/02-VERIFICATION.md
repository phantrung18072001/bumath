---
phase: 02-auth-access-control
verified: 2026-03-24T13:21:00Z
status: gaps_found
score: 4/6 must-haves verified
gaps:
  - truth: "Any logged-in user can log out from any page and is redirected to the login screen"
    status: failed
    reason: "signOut is only exposed on Pending.tsx. No logout button exists in the landing page Header, Index page, or any other page a logged-in user would land on after approval."
    artifacts:
      - path: "src/pages/Pending.tsx"
        issue: "Logout only present here"
      - path: "src/components/landing/Header.tsx"
        issue: "No useAuth import, no signOut button"
      - path: "src/pages/Index.tsx"
        issue: "No useAuth import, no logout mechanism"
    missing:
      - "Logout button accessible from the post-login landing page (e.g. Header component or a persistent nav)"
      - "Any route accessible to an approved, logged-in student must surface a way to sign out"

  - truth: "Admin can view a list of pending accounts and approve or reject each one"
    status: failed
    reason: "UsersPage component is fully implemented and tested, but it is not registered as a route in App.tsx. There is no /admin/users route, no ProtectedRoute wrapping, and no navigation link to reach the page. The page is dead code from a user perspective."
    artifacts:
      - path: "src/pages/admin/UsersPage.tsx"
        issue: "Component exists and is substantive (265 lines), but is orphaned — not imported or routed in App.tsx"
      - path: "src/App.tsx"
        issue: "No /admin/users route, no UsersPage import, no ProtectedRoute with requiredRole='admin'"
    missing:
      - "Route <Route path='/admin/users' element={<ProtectedRoute requiredRole='admin'><UsersPage /></ProtectedRoute>} /> in App.tsx"
      - "Import of UsersPage in App.tsx"
human_verification:
  - test: "Register a new account and confirm the pending screen"
    expected: "After submitting the register form, the user lands on /pending and sees 'Tài khoản đang chờ xét duyệt' with Zalo contact info"
    why_human: "Requires live Supabase phone auth — signUp with phone+password requires Twilio/phone provider configured in Supabase dashboard"
  - test: "Session persists across browser reload"
    expected: "After logging in and refreshing the page, the user is still authenticated (no redirect to /login)"
    why_human: "Requires browser environment with real Supabase session — localStorage persistence cannot be tested in jsdom"
  - test: "Approved student cannot reach /admin/users"
    expected: "Navigating to /admin/users redirects a student-role user to /"
    why_human: "Requires live routing test once the admin route is wired"
---

# Phase 2: Auth & Access Control Verification Report

**Phase Goal:** Users can securely register, log in, and access only the areas their role permits — with an admin approval gate before students reach any content
**Verified:** 2026-03-24T13:21:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | A new visitor can register with email and password and lands on a "pending approval" screen | ? UNCERTAIN | `Register.tsx` calls `supabase.auth.signUp` with `toE164(phone)` + `password`, navigates to `/pending` on success. Supabase phone auth requires dashboard config — untestable without live env. Code path is correct. |
| 2 | A logged-in user's session persists across browser reloads without re-authenticating | ? UNCERTAIN | `AuthContext.tsx` uses `onAuthStateChange` (fires `INITIAL_SESSION` on reload) + Supabase client initialized with `persistSession: true`. Logic is correct; requires browser env to confirm. |
| 3 | Any logged-in user can log out from any page and is redirected to the login screen | FAILED | `signOut` is only accessible from `Pending.tsx`. No logout is present in the Header, Index page, or any other page an approved logged-in user would see. The success criterion requires "any page." |
| 4 | Admin can view a list of pending accounts and approve or reject each one | FAILED | `UsersPage.tsx` is fully built with table, tabs, approve/reject mutations, and 9 passing tests. However it is **not routed** in `App.tsx` — there is no `/admin/users` route and the component is never imported outside its test file. Admin cannot reach this page. |
| 5 | A student who has not been approved cannot access course pages — they see the pending screen | VERIFIED | `ProtectedRoute` redirects any user with `approval_status === 'pending'` or `'rejected'` to `/pending`. Course pages (phase 3+) will be wrapped in `ProtectedRoute`. Logic is solid. |
| 6 | All UI text, labels, and messages are in Vietnamese | VERIFIED | Confirmed in Login.tsx, Register.tsx, Pending.tsx, UsersPage.tsx — all labels, headings, error messages, button text, and empty states are in Vietnamese with proper diacritics. |

**Score:** 4/6 truths verified (2 failed, 2 uncertain pending human check but structurally sound)

---

### Required Artifacts

| Artifact | Expected | Level 1: Exists | Level 2: Substantive | Level 3: Wired | Status |
|----------|---------|-----------------|---------------------|----------------|--------|
| `src/types/auth.ts` | Profile, AuthContextValue interfaces | YES | YES (18 lines, exports both interfaces) | WIRED — imported by AuthContext, ProtectedRoute, UsersPage | VERIFIED |
| `src/lib/validators.ts` | toE164 + isValidVnPhone exports | YES | YES (17 lines, both functions) | WIRED — imported by Login.tsx, Register.tsx | VERIFIED |
| `src/lib/validators.test.ts` | 10 validator unit tests | YES | YES (10 tests passing) | N/A (test file) | VERIFIED |
| `src/contexts/AuthContext.tsx` | AuthProvider + useAuth | YES | YES (59 lines, onAuthStateChange, deferred profile fetch, signOut) | WIRED — imported by App.tsx (wraps all routes), Login, Register, Pending, UsersPage.test | VERIFIED |
| `src/contexts/AuthContext.test.tsx` | 9 unit tests | YES | YES (9 tests passing) | N/A (test file) | VERIFIED |
| `src/components/auth/ProtectedRoute.tsx` | Route guard with loading/auth/approval/role checks | YES | YES (41 lines, all four guards) | ORPHANED — exists and passes tests but is never used in App.tsx production routing | ORPHANED |
| `src/components/auth/ProtectedRoute.test.tsx` | 8 unit tests | YES | YES (8 tests passing) | N/A (test file) | VERIFIED |
| `src/pages/Login.tsx` | Login page with phone+password form | YES | YES (147 lines, signInWithPassword, toE164, Vietnamese copy) | WIRED — routed at `/login` in App.tsx | VERIFIED |
| `src/pages/Register.tsx` | Register page, 6-field Zod form | YES | YES (297 lines, signUp, RHF+Zod, Vietnamese copy) | WIRED — routed at `/register` in App.tsx | VERIFIED |
| `src/pages/Pending.tsx` | Pending/rejected screen | YES | YES (83 lines, dual state, signOut, Vietnamese copy) | WIRED — routed at `/pending` in App.tsx | VERIFIED |
| `src/pages/admin/UsersPage.tsx` | Admin user management table | YES | YES (265 lines, useQuery, useMutation, tabs, badges) | ORPHANED — no route in App.tsx, no ProtectedRoute wrapping, not imported anywhere in production code | ORPHANED |
| `src/pages/admin/UsersPage.test.tsx` | 9 unit tests | YES | YES (9 tests, all passing) | N/A (test file) | VERIFIED |

---

### Key Link Verification

**Plan 01 key links:**

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `AuthContext.tsx` | `src/lib/supabase.ts` | `import { supabase }` | WIRED | Line 3: `import { supabase } from '@/lib/supabase'` |
| `AuthContext.tsx` | `src/types/auth.ts` | `import { Profile, AuthContextValue }` | WIRED | Line 4: `import { Profile, AuthContextValue } from '@/types/auth'` |
| `ProtectedRoute.tsx` | `AuthContext.tsx` | `import { useAuth }` | WIRED | Line 2: `import { useAuth } from '@/contexts/AuthContext'` |

**Plan 02 key links:**

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `Login.tsx` | `src/lib/supabase.ts` | `signInWithPassword` | WIRED | Line 40: `supabase.auth.signInWithPassword(...)` |
| `Register.tsx` | `src/lib/supabase.ts` | `signUp` | WIRED | Line 72: `supabase.auth.signUp(...)` |
| `Login.tsx` | `src/lib/validators.ts` | `import { toE164, isValidVnPhone }` | WIRED | Line 7: `import { isValidVnPhone, toE164 } from '@/lib/validators'` |
| `Register.tsx` | `src/lib/validators.ts` | `import { toE164, isValidVnPhone }` | WIRED | Line 19: `import { isValidVnPhone, toE164 } from '@/lib/validators'` |
| `Pending.tsx` | `AuthContext.tsx` | `import { useAuth }` | WIRED | Line 5: `import { useAuth } from '@/contexts/AuthContext'` |

**Plan 03 key links:**

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `UsersPage.tsx` | `src/lib/supabase.ts` | `supabase.from('profiles')` | WIRED (internal) | Lines 146–151: `supabase.from('profiles').select('*').order(...)` |
| `UsersPage.tsx` | `@tanstack/react-query` | `useQuery + useMutation` | WIRED | Lines 1–2: imports and usage confirmed |
| **`App.tsx`** | **`UsersPage.tsx`** | **Route at `/admin/users`** | **NOT WIRED** | `App.tsx` has no `/admin/users` route, no `UsersPage` import |
| **`App.tsx`** | **`ProtectedRoute`** | **`ProtectedRoute` wrapping admin route** | **NOT WIRED** | `ProtectedRoute` is never used in `App.tsx` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `AuthContext.tsx` | `profile` | `supabase.from('profiles').select('*').eq('id', userId).single()` in `onAuthStateChange` | YES — real DB query | FLOWING |
| `UsersPage.tsx` | `users` | `supabase.from('profiles').select('*').order('created_at', ...)` via `useQuery` | YES — real DB query, error thrown if query fails | FLOWING (but page unreachable) |
| `Login.tsx` | auth result | `supabase.auth.signInWithPassword(...)` | YES — live auth call | FLOWING |
| `Register.tsx` | auth result | `supabase.auth.signUp(...)` | YES — live auth call | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED for browser-only pages (no runnable entry points without a live server and Supabase credentials).

**Module-level check:**

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 38 tests pass | `yarn test` | 38 passed, 0 failed, 6 test files | PASS |
| Build succeeds | `yarn build` | Exit 0, chunk warning only (not an error) | PASS |
| UsersPage exported | Node module check | `export default function UsersPage()` at line 139 | PASS |
| Admin route in App.tsx | grep for `/admin` | No matches | FAIL |
| ProtectedRoute used in App.tsx | grep for ProtectedRoute in App.tsx | No matches | FAIL |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| AUTH-01 | 02-01, 02-02 | Học sinh có thể tạo tài khoản bằng email và mật khẩu | SATISFIED | `Register.tsx` calls `supabase.auth.signUp` with phone+password |
| AUTH-02 | 02-01, 02-02 | Học sinh có thể đăng nhập và duy trì session qua các lần reload | SATISFIED | `AuthContext.tsx` uses `onAuthStateChange` + `persistSession: true` in Supabase client |
| AUTH-03 | 02-01, 02-02 | Học sinh/giảng viên/admin có thể đăng xuất từ bất kỳ trang nào | BLOCKED | `signOut` is only accessible from `Pending.tsx`. Approved users on the landing page have no logout path |
| AUTH-04 | 02-01, 02-02 | Tài khoản học sinh mới ở trạng thái "pending" cho đến khi admin duyệt | SATISFIED | `Register.tsx` navigates to `/pending`. `ProtectedRoute` blocks access with pending/rejected status |
| AUTH-05 | 02-03 | Admin có thể xem danh sách tài khoản đang chờ duyệt và duyệt/từ chối | BLOCKED | `UsersPage.tsx` is built but not routed. Admin cannot navigate to the page |
| ROLE-01 | 02-01, 02-03 | Hệ thống có 3 roles: student, teacher, admin với quyền khác nhau | SATISFIED | `Profile.role: 'student' | 'teacher' | 'admin'` defined; `ProtectedRoute` enforces role differences |
| ROLE-02 | 02-01 | Route được bảo vệ theo role — học sinh không thể truy cập trang admin/teacher | BLOCKED | `ProtectedRoute` component correctly implements this, but it wraps no routes in `App.tsx`. The admin route is not wired, so there is nothing to protect yet. |
| ROLE-03 | NOT IN ANY PLAN | RLS policies trong Supabase ngăn học sinh xem dữ liệu của nhau | ORPHANED | ROLE-03 is listed in the phase requirements in ROADMAP.md but not claimed by any plan (02-01, 02-02, 02-03). No RLS migration files or SQL was created. REQUIREMENTS.md shows it as `[ ]` Pending. |
| UX-03 | 02-02 | Giao diện hoàn toàn bằng tiếng Việt | SATISFIED | Login, Register, Pending, UsersPage all use proper Vietnamese with diacritics |

**Orphaned Requirement: ROLE-03**

ROLE-03 is assigned to Phase 2 in ROADMAP.md and listed in the phase's requirements but was not included in any plan's `requirements:` frontmatter. No SQL migration, no RLS policy files, and no Supabase dashboard configuration was produced. This requirement was planned for this phase but never executed. It requires human action in the Supabase dashboard to create RLS policies.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/pages/Pending.tsx` | 7 | `const ADMIN_ZALO_NUMBER = '0123456789'` hardcoded | Info | Acknowledged in SUMMARY as intentional; to be replaced with env variable in future plan |
| `src/App.tsx` | all | No `/admin/users` route, no ProtectedRoute wrapping any route | Blocker | Admin page is unreachable; ProtectedRoute component is dead code in production routing |
| `src/components/auth/ProtectedRoute.tsx` | all | Component exists, is tested, but never used in production routing | Warning | Orphaned utility; students could theoretically reach future course pages before ProtectedRoute is wired |

---

### Human Verification Required

**1. Phone registration flow**

**Test:** Attempt to register using a real Vietnamese phone number (e.g. 0912345678) and a password.
**Expected:** Supabase sends an OTP, user is confirmed, navigates to /pending showing "Tài khoản đang chờ xét duyệt"
**Why human:** Requires Supabase phone auth provider (Twilio) configured in dashboard. Cannot test in jsdom.

**2. Session persistence across page reload**

**Test:** Log in successfully, then hard-refresh the browser (F5/Ctrl+R).
**Expected:** User remains logged in — no redirect to /login.
**Why human:** Requires real browser localStorage / Supabase session cookie. jsdom does not persist state.

**3. Approved-student content access gate**

**Test:** Once admin route is wired, approve a student account via the admin panel, then log in as that student and navigate to a future course page.
**Expected:** Student sees course page (not /pending).
**Why human:** Requires live database with an approved profile row.

---

### Gaps Summary

Two gaps block the phase goal:

**Gap 1: Admin page is orphaned (UsersPage not routed)**

`src/pages/admin/UsersPage.tsx` is a complete, tested component with real Supabase queries. However, it was never registered in `App.tsx`. There is no `/admin/users` route and no `ProtectedRoute` wrapping. An admin user logging in has no way to navigate to this page. The success criterion "Admin can view a list of pending accounts and approve or reject each one" cannot be met by code that is unreachable.

**Gap 2: Logout only available from Pending page**

Success criterion 3 requires "any logged-in user can log out from any page." `signOut` from `useAuth()` is called only in `Pending.tsx`. Once a user is approved, they land on `/` (Index.tsx), which has no authentication awareness and no logout button. An approved student or admin has no way to sign out.

**Secondary gap: ROLE-03 not executed**

ROLE-03 (Supabase RLS policies) is listed in the phase requirements but claimed by no plan. This is a database-level security requirement — without RLS, students can query each other's profile rows from the client. REQUIREMENTS.md correctly marks it as pending.

---

_Verified: 2026-03-24T13:21:00Z_
_Verifier: Claude (gsd-verifier)_
