# Phase 2: Auth & Access Control - Research

**Researched:** 2026-03-24
**Domain:** Supabase Auth (phone+password), React Context, RBAC, RLS, React Router v6 protected routes
**Confidence:** HIGH (core stack verified against official docs and existing project code)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Login identifier is phone number + password (not email). Supabase phone auth with password-based flow (no OTP/SMS).
- **D-02:** Registration fields: `số điện thoại` (E.164), `tên học sinh`, `năm sinh`, `địa chỉ`, `mật khẩu`.
- **D-03:** Registration lives on a dedicated `/register` page (not a modal). A `/login` page exists alongside it.
- **D-04:** Existing landing page Header placeholder buttons are wired up to `/login` and `/register` routes — no separate auth layout; the header is the entry point.
- **D-05:** Admin user management lives at `/admin/users` — a table with a status column and a "Chờ duyệt" tab for pending accounts.
- **D-06:** Each row shows: tên học sinh, số điện thoại, năm sinh, địa chỉ, trạng thái (pending / approved / rejected).
- **D-07:** Admin actions on pending accounts: Approve or Reject only (binary, no grade assignment at this phase).
- **D-08:** After registering, students land on a "pending" screen — a card with processing time note (24h), Zalo contact info for the admin, Đăng xuất button.
- **D-09:** Rejected students who log in see rejection wording — same layout as pending screen.
- **D-10:** Both pending and rejected users are blocked from accessing any course content.
- **D-11:** Role-based routing is enforced: students without approval cannot reach course pages, teachers/admins have separate accessible routes.
- **D-12:** RLS policies in Supabase enforce data isolation (students cannot see each other's data).
- **Requirement update:** AUTH-01 changes from email+password to phone+password. Login identifier is the student's phone number (E.164 format, e.g. +84901234567). No email involved in the auth flow.

### Claude's Discretion

- Auth context provider architecture (React Context vs. TanStack Query for session state) — Claude decides the most appropriate pattern.
- Loading state during session check on page load — Claude decides (spinner, skeleton, or instant redirect).
- Exact Supabase phone auth configuration (enabling phone provider in dashboard) — noted in research/plan.
- Phone number format validation (E.164 coercion, +84 prefix handling for Vietnamese numbers) — Claude decides implementation.

### Deferred Ideas (OUT OF SCOPE)

- Email verification — skipped (not needed since phone auth is used, no email in flow)
- Grade/class assignment during approval — deferred to Phase 3 (enrollment management)
- Admin messaging to rejected students — deferred; contact via Zalo is sufficient for v1
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Học sinh có thể tạo tài khoản bằng số điện thoại và mật khẩu (updated: phone not email) | Supabase `signUp({ phone, password })` confirmed; phone provider must be enabled in dashboard |
| AUTH-02 | Học sinh có thể đăng nhập và duy trì session qua các lần reload | `supabase.auth.signInWithPassword({ phone, password })`; `persistSession: true` already set in `src/lib/supabase.ts` |
| AUTH-03 | Học sinh/giảng viên/admin có thể đăng xuất từ bất kỳ trang nào | `supabase.auth.signOut()` + AuthContext exposes `signOut` to all components |
| AUTH-04 | Tài khoản học sinh mới ở trạng thái "pending" cho đến khi admin duyệt | Postgres trigger on `auth.users` insert creates profile with `approval_status='pending'`; ProtectedRoute reads this status |
| AUTH-05 | Admin có thể xem danh sách tài khoản đang chờ duyệt và duyệt/từ chối | `UPDATE profiles SET approval_status = 'approved'/'rejected'` at `/admin/users`; RLS allows admin full access |
| ROLE-01 | Hệ thống có 3 roles: student, teacher, admin với quyền khác nhau | `role` column on `profiles` table; CHECK constraint for 3 values; set at trigger time |
| ROLE-02 | Route được bảo vệ theo role — học sinh không thể truy cập trang admin/teacher | `ProtectedRoute` component wrapping React Router routes; reads role + approval_status from AuthContext |
| ROLE-03 | RLS policies trong Supabase ngăn học sinh xem dữ liệu của nhau | `profiles` table RLS: student sees only own row; admin sees all |
| UX-03 | Giao diện hoàn toàn bằng tiếng Việt | All copy in Vietnamese per UI-SPEC copywriting contract |
</phase_requirements>

---

## Summary

Phase 2 builds authentication and role-based access control on top of the existing Supabase client singleton (`src/lib/supabase.ts`). The stack is already committed: Supabase for auth + DB + RLS, React Router v6 for client routing, React Hook Form + Zod for forms, and shadcn/ui for UI components — all installed and verified in the existing codebase.

The core architectural work is three-layered: (1) a Postgres `profiles` table with trigger auto-creation on signup; (2) a React `AuthContext` provider that wraps the app and exposes `user`, `session`, `profile`, and auth methods; (3) a `ProtectedRoute` component that gates routes by role + approval status. The Supabase phone+password flow uses `signUp({ phone, password })` and `signInWithPassword({ phone, password })` — these are confirmed official API methods that do NOT require SMS/OTP when phone verification is disabled in the Supabase dashboard.

The critical Supabase dashboard steps are: (a) enable Phone provider under Authentication → Providers; (b) set "Confirm phone" / phone verification to disabled (no SMS provider needed for this project). These are one-time manual steps that must be noted in the plan as a prerequisite task.

**Primary recommendation:** Use React Context (not TanStack Query) for auth state. Session state is event-driven via `onAuthStateChange` — it is not a server fetch that benefits from query caching. TanStack Query should be used for the admin user list (a real data fetch). The `AuthContext` holds `{ user, session, profile, loading }` and is populated on `INITIAL_SESSION` / `SIGNED_IN` / `SIGNED_OUT` events.

---

## Project Constraints (from CLAUDE.md)

- **Package manager:** Yarn 4.11.0 — use `yarn`, never `npm install`
- **UI components:** shadcn/ui only — do not modify `src/components/ui/` manually; use `npx shadcn@latest add` if new components are needed (none needed for this phase per UI-SPEC)
- **Form pattern:** React Hook Form + Zod — follow the existing `ConsultationForm.tsx` pattern
- **Routing:** React Router DOM v6 (`BrowserRouter` with `basename={import.meta.env.BASE_URL}`)
- **Styling:** Tailwind utility classes + CSS variables (HSL format in `src/index.css`), dark mode via class strategy
- **Path alias:** `@/` maps to `src/`
- **Testing:** Vitest + React Testing Library, jsdom environment, globals enabled — test files at `src/**/*.{test,spec}.{ts,tsx}`
- **TypeScript:** Strict mode disabled, `noImplicitAny` off — no need to annotate every type, but be explicit on context interfaces
- **Supabase version pinned at 2.78.0** — do not upgrade (Node 18.20.8 constraint; v2.79+ dropped Node 18 support)
- **Vietnamese UI everywhere** — all copy in Vietnamese per UX-03

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.78.0 (pinned) | Auth, database, RLS | Already installed; singleton in `src/lib/supabase.ts` |
| `react-router-dom` | ^6.30.1 | Client routing, protected routes | Already installed, used in `src/App.tsx` |
| `react-hook-form` | ^7.61.1 | Form state management | Already installed, used in ConsultationForm |
| `zod` | ^3.25.76 | Schema validation | Already installed, used in ConsultationForm |
| `@tanstack/react-query` | ^5.83.0 | Server state for admin user list | Already installed, used in App |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | (installed) | Icons: Loader2, Clock, Eye, EyeOff | Spinner, pending screen icon, password toggle |
| `sonner` | (installed) | Toast notifications | Registration success, approve/reject success |
| shadcn/ui components | (installed) | Button, Input, Form, Card, Table, Badge, Tabs | All auth UI — no new installs needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Context for auth | TanStack Query | TQ is better for server data; auth state is event-driven, not poll-based — Context wins here |
| profiles table | `user_metadata` JWT claims for role | JWT claims require token refresh to propagate updates (approval status changes would not be visible immediately); profiles table is real-time queryable |
| Manual `+84` coercion | libphonenumber-js | Library is 145KB+ — project already has `isValidVnPhone` regex in `src/lib/validators.ts`; use that + simple string replacement |

**No new packages needed for this phase.** All required libraries are already installed.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx       # AuthProvider + useAuth hook
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx  # Route guard component
│   └── ui/                  # (existing, do not touch)
├── pages/
│   ├── Index.tsx            # (existing)
│   ├── NotFound.tsx         # (existing)
│   ├── Login.tsx            # /login
│   ├── Register.tsx         # /register
│   ├── Pending.tsx          # /pending
│   └── admin/
│       └── UsersPage.tsx    # /admin/users
├── lib/
│   ├── supabase.ts          # (existing, do not modify)
│   └── validators.ts        # (existing — reuse isValidVnPhone)
└── App.tsx                  # Add routes + AuthProvider wrapper
```

### Pattern 1: AuthContext with onAuthStateChange

**What:** A React Context provider that listens to Supabase auth events, holds `user`, `session`, `profile`, and a `loading` flag. Exposes `signOut` and optionally `refreshProfile`.

**When to use:** Wrap the entire app once. Any component that needs auth state calls `useAuth()`.

**Key implementation notes:**
- Initialize with `loading: true` until `INITIAL_SESSION` event fires
- On `SIGNED_IN`: fetch the user's `profiles` row to get `role` + `approval_status`
- On `SIGNED_OUT`: clear user/session/profile, set loading false
- Unsubscribe from `onAuthStateChange` in the cleanup function (memory leak prevention)
- Do NOT call other Supabase methods inside the `onAuthStateChange` callback synchronously — use `setTimeout(() => fetchProfile(), 0)` or handle in `useEffect` reacting to user change

```typescript
// Source: Supabase official docs - auth-onauthstatechange
// Pattern adapted for this project
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  full_name: string
  phone: string
  year_of_birth: number
  address: string
  role: 'student' | 'teacher' | 'admin'
  approval_status: 'pending' | 'approved' | 'rejected'
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        if (!currentSession) {
          setProfile(null)
          setLoading(false)
        }
        // Defer profile fetch to avoid callback deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single()
              .then(({ data }) => {
                setProfile(data)
                setLoading(false)
              })
          }, 0)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

### Pattern 2: ProtectedRoute Component

**What:** A React Router v6 wrapper component that redirects unauthenticated or insufficiently privileged users.

**When to use:** Wrap any `<Route>` that requires auth or a specific role/approval status.

```typescript
// Source: React Router v6 docs + Supabase React patterns
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin'
  requireApproved?: boolean
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireApproved = false,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        aria-label="Đang tải..."
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="sr-only">Đang tải...</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (profile?.approval_status === 'pending' || profile?.approval_status === 'rejected') {
    return <Navigate to="/pending" replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
```

### Pattern 3: Supabase Phone+Password Auth Calls

**What:** Sign up and sign in using phone number + password (E.164 format).

**Important:** `signUp` with phone requires the Phone provider enabled in the Supabase Dashboard (Authentication → Providers → Phone). When phone verification ("Confirm phone") is set to OFF, signup completes immediately without OTP/SMS.

```typescript
// Source: Supabase official docs - auth-passwords + auth-signinwithpassword

// Vietnamese phone → E.164 coercion (reuse src/lib/validators.ts pattern)
function toE164(phone: string): string {
  // Input: "0912345678" → Output: "+84912345678"
  if (phone.startsWith('+84')) return phone
  if (phone.startsWith('0')) return '+84' + phone.slice(1)
  return phone
}

// Sign Up
const { data, error } = await supabase.auth.signUp({
  phone: toE164(phoneInput),
  password,
  options: {
    data: {
      // raw_user_meta_data — passed through to handle_new_user trigger
      full_name: fullName,
      year_of_birth: yearOfBirth,
      address,
    },
  },
})

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  phone: toE164(phoneInput),
  password,
})

// Sign Out
await supabase.auth.signOut()
```

### Pattern 4: Profiles Table + Trigger (SQL Migration)

**What:** A `profiles` table in the `public` schema that extends `auth.users`, plus a trigger to auto-create a profile on signup.

```sql
-- Source: Supabase docs - managing-user-data
-- Migration: create profiles table
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  year_of_birth INTEGER,
  address     TEXT,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger: auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, year_of_birth, address, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    (NEW.raw_user_meta_data ->> 'year_of_birth')::integer,
    NEW.raw_user_meta_data ->> 'address',
    NEW.phone  -- phone is stored on auth.users directly
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Pattern 5: RLS Policies

**What:** Row-level security policies for `profiles` that enforce data isolation.

```sql
-- Source: Supabase docs - row-level-security + custom-claims-rbac

-- Students can only read/update their own row
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Admin can update all profiles (for approve/reject)
CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );
```

**Note on RLS admin check pattern:** The `EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')` subquery is the simpler approach. Supabase recommends wrapping `auth.uid()` in a `(SELECT auth.uid())` to hint the planner to cache it per query rather than re-evaluating per row.

### Pattern 6: Admin User Management with TanStack Query

**What:** The `/admin/users` page fetches all profiles using TanStack Query. Approve/reject mutations use `useMutation`.

```typescript
// Fetch all profiles (admin only — RLS enforces this)
const { data: users, refetch } = useQuery({
  queryKey: ['admin', 'profiles'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
})

// Approve mutation
const approveMutation = useMutation({
  mutationFn: async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: 'approved' })
      .eq('id', userId)
    if (error) throw error
  },
  onSuccess: () => {
    refetch()
    toast.success('Đã duyệt tài khoản thành công.')
  },
})
```

### Pattern 7: App.tsx Route Structure

**What:** How to integrate AuthProvider and ProtectedRoute into the existing `App.tsx`.

```typescript
// src/App.tsx — updated structure
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Pending from './pages/Pending'
import UsersPage from './pages/admin/UsersPage'

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending" element={<Pending />} />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin" requireApproved>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)
```

### Anti-Patterns to Avoid

- **Using `user_metadata` for role checks in RLS:** `raw_user_meta_data` can be modified by the authenticated user. Use the `profiles` table or `raw_app_meta_data` (writable only via service key) for role storage.
- **Calling Supabase methods inside `onAuthStateChange` callback synchronously:** Creates deadlocks. Always defer with `setTimeout(..., 0)` or trigger a `useEffect` reaction.
- **Fetching session with `getSession()` in every component:** Call once in AuthProvider; distribute via context. `getSession()` reads from local storage — still prefer context distribution.
- **Blocking the full-page render while loading profile:** Show a spinner, not a blank page. The `loading` flag in AuthContext controls this.
- **Not unsubscribing from `onAuthStateChange`:** Causes memory leaks. Always return `subscription.unsubscribe()` from the `useEffect` cleanup.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session persistence across browser reloads | Custom localStorage token management | Supabase client with `persistSession: true` (already configured) | Edge cases: token expiry, refresh, concurrent tabs |
| Phone number validation | Custom regex from scratch | Extend existing `isValidVnPhone` from `src/lib/validators.ts` | Already handles Vietnamese carrier prefixes correctly |
| Form validation | Manual `onChange` error state | React Hook Form + Zod (existing project pattern) | Prevents re-render hell, handles touched/dirty states |
| Loading state spinner | Custom animation CSS | Lucide `Loader2` with `animate-spin` (per UI-SPEC) | Consistent with design system |
| Toast notifications | Custom toast component | `sonner` toast (already installed, used in ConsultationForm) | Already used in project |
| Optimistic UI for admin actions | Complex cache manipulation | TanStack Query `refetch()` after mutation | Simpler; user list is small, re-fetch is fast |

**Key insight:** Every mechanism needed (session persistence, form validation, toast, icons) is already installed. This phase is integration work, not new library adoption.

---

## Common Pitfalls

### Pitfall 1: Phone Provider Not Enabled → signUp Fails Silently

**What goes wrong:** `supabase.auth.signUp({ phone, password })` returns `error.message: "Phone sign ups are disabled"`.
**Why it happens:** Supabase Dashboard → Authentication → Providers → Phone is not enabled, OR "Confirm phone" is on and no SMS provider is configured.
**How to avoid:** Before writing any code, manually enable the Phone provider in the Supabase Dashboard and set phone verification to OFF (no SMS provider required for this project). This is a prerequisite task in Wave 0.
**Warning signs:** `signUp` returns an error with code `phone_provider_disabled` or similar message about phone signups being disabled.

### Pitfall 2: Profile Not Found After signUp (Race Condition with Trigger)

**What goes wrong:** After `signUp` succeeds, the AuthContext immediately tries to fetch the user's profile but gets `null` — the trigger has not yet created the profile row.
**Why it happens:** The `on_auth_user_created` Postgres trigger runs asynchronously from the perspective of the JS client. The auth event fires before the trigger commit propagates.
**How to avoid:** In the `SIGNED_IN` handler, if the profile fetch returns `null`, retry once after 500ms. OR use `upsert` in the trigger to be idempotent. OR accept `profile = null` on initial load and redirect to `/pending` when `profile` is null AND `user` is non-null.
**Warning signs:** `/pending` screen shows correctly then briefly flickers to a different page.

### Pitfall 3: Infinite Redirect Loop Between /login and /pending

**What goes wrong:** A logged-in user with `approval_status = 'pending'` hits `/login`, `ProtectedRoute` sends them to `/pending`, but `/pending` is wrapped in a `ProtectedRoute` that redirects unapproved users — loop.
**Why it happens:** `/pending` must NOT be wrapped in a `ProtectedRoute` that checks approval. It should only require authentication (user exists), not approval.
**How to avoid:** `/pending` is a public page (no ProtectedRoute) OR a minimal ProtectedRoute that only checks `user !== null`, not `approval_status`. The distinction must be explicit in the route definitions.
**Warning signs:** Browser console shows rapid history pushes; URL oscillates between `/login` and `/pending`.

### Pitfall 4: Vietnamese Phone Number E.164 Coercion Bug

**What goes wrong:** User enters "0912345678"; Supabase receives "0912345678" not "+84912345678"; auth fails with "invalid phone number format".
**Why it happens:** Supabase requires E.164 format. Local Vietnamese format starts with `0`, not `+84`.
**How to avoid:** Apply coercion in the form's `onSubmit` handler BEFORE calling Supabase. The `isValidVnPhone` regex in `src/lib/validators.ts` already accepts `0` prefix — coerce to `+84` before submitting. The input always shows the user's original "0..." input.
**Warning signs:** Auth error on valid-looking Vietnamese phone numbers.

### Pitfall 5: RLS Blocks Admin from Reading Other Profiles

**What goes wrong:** Admin visits `/admin/users` and sees only their own profile row (or empty table).
**Why it happens:** The default RLS policy `auth.uid() = id` blocks admin from seeing other users' rows. Admin policy was not created, or is misconfigured.
**How to avoid:** Ensure both policies exist: one for `auth.uid() = id` (all users, own row) AND one for admin role (all rows). Test with a separate admin user account, not the same session.
**Warning signs:** Admin user table shows only 1 row (own profile).

### Pitfall 6: Supabase Session Disappears on First Load

**What goes wrong:** Page loads, session is briefly null (causing redirect to /login), then the INITIAL_SESSION event fires and the user is logged in. This "flicker redirect" is a bad UX.
**Why it happens:** `loading` state starts as `false` or the ProtectedRoute renders before the `INITIAL_SESSION` event.
**How to avoid:** Initialize `loading: true` in AuthContext. ProtectedRoute renders the spinner while `loading === true`. Only render redirect logic after `loading === false`. The `INITIAL_SESSION` event fires synchronously from `localStorage` — this is fast (< 50ms) but not zero.
**Warning signs:** Login page flashes briefly on every page load for authenticated users.

### Pitfall 7: Supabase 2.78.0 Compatibility

**What goes wrong:** Upgrading `@supabase/supabase-js` to fix a bug causes build failure on Node 18.
**Why it happens:** STATE.md documents: "Pin @supabase/supabase-js to 2.78.0 — v2.79+ dropped Node 18 support (project runs Node 18.20.8)".
**How to avoid:** Never upgrade supabase-js without first upgrading Node to 20 LTS. The `package.json` already pins this at 2.78.0.
**Warning signs:** `yarn install` produces a Node version compatibility warning, or build fails with a Node 18-related error.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `supabase.auth.user()` (sync, v1 API) | `supabase.auth.getUser()` (async, v2 API) | Supabase JS v2 | Must await; not relevant here since we use `onAuthStateChange` |
| `supabase.auth.session()` (v1) | `supabase.auth.getSession()` or `onAuthStateChange` | Supabase JS v2 | Use event listener in AuthContext, not polling |
| `auth-helpers` package for React | Direct Supabase client + React Context | 2023 | `@supabase/auth-helpers-react` is deprecated; use the client directly |
| `forwardRef` for custom inputs | Native ref in React 19 | React 19 | Not applicable — project uses React 18 (per @types/react ^18.3.23) |

**Deprecated/outdated:**
- `@supabase/auth-helpers-react`: Deprecated. Do not add this package. Use `supabase.auth.onAuthStateChange` with manual React Context instead.
- `supabase.auth.user()` (sync): Removed in v2. Already using v2 (2.78.0).

---

## Supabase Dashboard Prerequisites

These are manual steps that cannot be automated by code — they must be completed before any auth code can be tested:

1. **Enable Phone Provider:** Dashboard → Authentication → Providers → Phone → Enable
2. **Disable phone confirmation:** Under the Phone provider settings, set "Confirm phone" to OFF. This means no SMS OTP is required — phone+password auth works immediately.
3. **No SMS provider needed:** With phone confirmation disabled, MessageBird/Twilio etc. are not required for this project.
4. **Create first admin user:** After the profiles table + trigger are created, the first admin account must be created manually via the Supabase Dashboard → Authentication → Users, then UPDATE their `profiles.role` to `'admin'` and `profiles.approval_status` to `'approved'` via the Table Editor.

**Confidence on phone verification toggle:** MEDIUM. The official docs confirm `signUp({ phone, password })` works without SMS when phone verification is off. The exact dashboard location of the "Confirm phone" toggle was not directly verified via a page screenshot — it may be called "Phone Confirm" or similar. The plan should include a verification step for the implementer.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/dev | Yes | 18.20.8 | — |
| Yarn | Package management | Yes | 4.11.0 | — |
| Supabase project (hosted) | Auth, DB, RLS | Assumed yes (Phase 1 complete) | — | — |
| Supabase phone provider (dashboard) | AUTH-01 | Unknown — requires manual enable | — | No fallback; prerequisite |
| `@supabase/supabase-js` | All auth calls | Yes (pinned 2.78.0) | 2.78.0 | — |
| `react-router-dom` | Protected routes | Yes | ^6.30.1 | — |
| `react-hook-form`, `zod` | Forms | Yes | installed | — |
| shadcn/ui components (all needed ones) | UI | Yes (per UI-SPEC: no new installs needed) | installed | — |

**Missing dependencies with no fallback:**
- Supabase Phone Provider must be manually enabled in the dashboard before any phone auth code can be tested. This is a Wave 0 prerequisite step, not a code task.

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + React Testing Library 16.0.0 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `yarn test src/contexts/AuthContext.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | `signUp({ phone, password })` calls Supabase with E.164 phone | unit | `yarn test src/contexts/AuthContext.test.tsx` | Wave 0 |
| AUTH-01 | Phone coercion: "0912345678" → "+84912345678" | unit | `yarn test src/lib/validators.test.ts` | Wave 0 |
| AUTH-02 | Session persists — `onAuthStateChange` INITIAL_SESSION sets user | unit | `yarn test src/contexts/AuthContext.test.tsx` | Wave 0 |
| AUTH-03 | `signOut()` clears user/session/profile in context | unit | `yarn test src/contexts/AuthContext.test.tsx` | Wave 0 |
| AUTH-04 | Pending user is redirected to /pending by ProtectedRoute | unit | `yarn test src/components/auth/ProtectedRoute.test.tsx` | Wave 0 |
| AUTH-05 | Admin approve mutation calls `UPDATE profiles SET approval_status='approved'` | unit (mock Supabase) | `yarn test src/pages/admin/UsersPage.test.tsx` | Wave 0 |
| ROLE-01 | profile.role is set correctly from trigger (tested via mock) | unit | `yarn test src/contexts/AuthContext.test.tsx` | Wave 0 |
| ROLE-02 | Non-admin is redirected away from /admin/users | unit | `yarn test src/components/auth/ProtectedRoute.test.tsx` | Wave 0 |
| ROLE-03 | RLS policies (SQL migration correctness) | manual — Supabase SQL editor | manual only | N/A |
| UX-03 | All copy is in Vietnamese | manual visual review | manual only | N/A |

**Note on Supabase mocking:** All unit tests must mock `@/lib/supabase` to avoid real network calls. Use `vi.mock('@/lib/supabase')` in vitest. The test env vars are pre-configured in `vitest.config.ts` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` set to test values).

### Sampling Rate

- **Per task commit:** `yarn test src/[relevant-file].test.{ts,tsx}`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/contexts/AuthContext.test.tsx` — covers AUTH-01, AUTH-02, AUTH-03, ROLE-01
- [ ] `src/components/auth/ProtectedRoute.test.tsx` — covers AUTH-04, ROLE-02
- [ ] `src/pages/admin/UsersPage.test.tsx` — covers AUTH-05
- [ ] `src/lib/validators.test.ts` — covers phone coercion (E.164 conversion function)

---

## Open Questions

1. **Exact "Confirm phone" dashboard setting name and location**
   - What we know: Official docs confirm phone+password works without SMS when verification is disabled
   - What's unclear: Exact toggle name in the Supabase Dashboard UI (may have been updated since docs were written)
   - Recommendation: Wave 0 includes a task: "Open Dashboard → Authentication → Providers → Phone, screenshot and confirm the 'Confirm phone' or equivalent toggle is set to OFF"

2. **First admin account creation process**
   - What we know: No self-registration path for admin; must be manually created
   - What's unclear: Whether to seed an admin via SQL migration or create via Dashboard UI
   - Recommendation: Document as a Wave 0 task: create admin user via Dashboard and UPDATE role via SQL. Include exact SQL snippet in the plan.

3. **Header authenticated state for admin**
   - What we know: UI-SPEC says `/admin/users` includes landing page Header with "authenticated header state — shows user info + Đăng xuất"
   - What's unclear: The existing `Header.tsx` does not read auth state — it has hardcoded login/register buttons
   - Recommendation: The Header should be updated to conditionally show the user's name + Đăng xuất button when authenticated. This is in scope (AUTH-03 + D-04). The exact Header modification should be in the plan.

---

## Sources

### Primary (HIGH confidence)

- Supabase official docs — `auth-signinwithpassword`: phone+password support confirmed
- Supabase official docs — `auth-onauthstatechange`: event list, unsubscribe pattern, async deadlock warning
- Supabase official docs — `managing-user-data`: profiles table trigger pattern (handle_new_user)
- Supabase official docs — `auth/passwords`: phone+password signUp, SMS provider only needed when phone verification is ON
- Existing codebase — `src/lib/supabase.ts`: `persistSession: true`, `autoRefreshToken: true` already configured
- Existing codebase — `src/lib/validators.ts`: `isValidVnPhone` regex already handles 0-prefix and +84-prefix
- `vitest.config.ts`: jsdom env, globals, setupFiles, test env vars confirmed

### Secondary (MEDIUM confidence)

- Supabase docs — `custom-claims-and-role-based-access-control-rbac`: JWT claim pattern; adapted to simpler `profiles` table subquery approach for this project's scale
- Supabase docs — `row-level-security`: RLS policy structure for admin access
- Web search (multiple sources agreeing): React Context + `onAuthStateChange` is the canonical pattern for Supabase + React SPA (not auth-helpers, which is deprecated)

### Tertiary (LOW confidence)

- Exact Supabase Dashboard UI for "Confirm phone" toggle location — not directly verified via live dashboard screenshot; inferred from docs and community sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed installed at exact versions
- Architecture patterns: HIGH — direct from Supabase official docs + existing project code patterns
- Pitfalls: HIGH (most), MEDIUM (phone confirm toggle exact UI location)
- SQL migrations: HIGH — direct from Supabase docs trigger pattern
- RLS policies: MEDIUM — pattern verified from docs but not tested against live project

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (Supabase auth API is stable; phone+password has been stable since v2)
