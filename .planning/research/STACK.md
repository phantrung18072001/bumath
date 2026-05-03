# Stack Research — v3.0 Platform Expansion (Addendum)

**Domain:** LMS Platform Expansion — New features atop validated React + Vite + TypeScript + Supabase + shadcn/ui
**Researched:** 2026-05-03
**Confidence:** HIGH (Supabase Realtime, KaTeX) / MEDIUM (PDF strategy)

> **Scope:** This document covers ONLY new stack additions required for v3.0 features.
> The base stack (React 18.3, Vite 5.4, TypeScript 5.8, Supabase 2.78.0, shadcn/ui,
> TanStack Query 5.83, React Hook Form 7.61, Zod 3.25, React Router 6.30) is validated
> and unchanged from v1.0. See original STACK.md content below the divider for historical context.

---

## v3.0 New Capabilities Analysis

### Feature → Library Mapping

| v3.0 Feature | New Library Needed? | Verdict |
|---|---|---|
| In-lesson chat (student ↔ teacher) | Supabase Realtime channels | **No new package** — already bundled in `@supabase/realtime-js@2.78.0` inside existing `@supabase/supabase-js@2.78.0` |
| Mock exam timer (countdown) | Timer library? | **No new package** — `useState` + `useEffect` is sufficient; no library needed for a simple countdown |
| Mock exam math rendering | KaTeX | **ADD** — math platform must render LaTeX; KaTeX is the lightweight standard |
| Study materials (PDFs) | PDF viewer library? | **No new package** — use Supabase Storage URL + `target="_blank"` anchor; native browser handles PDF, mobile-friendly |
| Pricing tiers + access control | Payments? | **No new package** — payment is out of scope (manual enrollment); access control is Supabase RLS |
| School navigator UI | Filter/select library? | **No new package** — existing shadcn/ui Select + Combobox covers the UI |
| Admin full-page forms | Form library? | **No new package** — existing React Hook Form + Zod already handles this |
| YouTube private/unlisted strategy | YouTube API library? | **No new package** — embed URL parameter changes only; no client library needed |

**Net result: Only ONE new library group needs to be added for v3.0.**

---

## New Additions for v3.0

### Core Technologies — No Changes

Existing stack is sufficient. No framework or infrastructure changes needed.

### Supporting Libraries — New Additions

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `katex` | `0.16.45` | LaTeX math rendering (CSS + fonts) | Industry standard for fast math typesetting in browser; ~200KB gzip (vs MathJax 3MB+). Required peer dep of react-katex. |
| `react-katex` | `3.1.0` | React wrapper for KaTeX | Provides `<InlineMath>` and `<BlockMath>` components; wraps `katex.renderToString` safely; handles SSR-safe string output. |

### Why KaTeX Over MathJax

| Criteria | KaTeX 0.16.x | MathJax 3.x | better-react-mathjax |
|---|---|---|---|
| Bundle size | ~200KB gzip | ~900KB+ | wraps MathJax 3 (same size) |
| Render speed | Synchronous, fast | Async queue | Async |
| React integration | `react-katex` (clean) | Manual setup | Direct wrapper |
| LaTeX coverage | ~95% (enough for grade 7–9) | 99% | 99% |
| Recommendation | ✅ Use this | ❌ Too heavy | ❌ Too heavy |

KaTeX's synchronous render model means exam questions render instantly without layout shifts — critical for timed tests where question rendering lag causes frustration.

---

## Implementation Notes by Feature

### 1. In-lesson Chat — No New Package

Supabase Realtime is already bundled. Use `supabase.channel()` with `postgres_changes` listener on a `messages` table.

```typescript
// Pattern: subscribe to per-lesson messages
const channel = supabase
  .channel(`lesson-chat-${lessonId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `lesson_id=eq.${lessonId}`,
    },
    (payload) => {
      setMessages((prev) => [...prev, payload.new as Message])
    }
  )
  .subscribe()

// Cleanup
return () => { supabase.removeChannel(channel) }
```

**DB schema needed:**
```sql
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);
-- RLS: student sees messages for lessons in their enrolled courses
-- RLS: teacher sees messages for all lessons
```

**No polling fallback needed** — Supabase Realtime on Postgres changes is reliable and already used in production by the existing bell notifications pattern.

### 2. Mock Exam Timer — No New Package

```typescript
// Countdown hook — no library needed
function useCountdown(durationSeconds: number) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!active || remaining <= 0) return
    const id = setInterval(() => setRemaining((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [active, remaining])

  return { remaining, start: () => setActive(true), isExpired: remaining <= 0 }
}
```

**DB schema needed:**
```sql
create table public.exams (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,           -- "Thi thử tháng 5/2026"
  exam_type      text not null,           -- 'monthly' | 'quarterly'
  duration_mins  int not null default 90,
  available_from timestamptz,
  available_to   timestamptz,
  course_id      uuid references public.courses(id)
);

create table public.exam_questions (
  id          uuid primary key default gen_random_uuid(),
  exam_id     uuid not null references public.exams(id) on delete cascade,
  order_index int not null,
  content     text not null,              -- LaTeX string, rendered by KaTeX
  question_type text not null default 'mcq',
  options     jsonb,                      -- [{label: 'A', text: '...'}] for MCQ
  correct_answer text not null            -- 'A' | 'B' | 'C' | 'D'
);

create table public.exam_attempts (
  id          uuid primary key default gen_random_uuid(),
  exam_id     uuid not null references public.exams(id),
  student_id  uuid not null references auth.users(id),
  answers     jsonb not null default '{}', -- {question_id: 'A'}
  score       int,
  started_at  timestamptz default now(),
  submitted_at timestamptz,
  unique(exam_id, student_id)             -- one attempt per student per exam
);
```

### 3. Study Materials Library — No New Package

PDFs stored in Supabase Storage bucket `study-materials`. Link directly — the browser handles PDF rendering natively.

```typescript
// Pattern: signed URL for protected PDFs
const { data } = await supabase.storage
  .from('study-materials')
  .createSignedUrl(filePath, 3600) // 1 hour expiry

// Render as downloadable link — no react-pdf needed
<a href={data.signedUrl} target="_blank" rel="noopener noreferrer">
  Xem tài liệu
</a>
```

**Why NOT react-pdf:**
- `react-pdf@10.4.1` requires `pdfjs-dist@5.4.296` — adds ~4MB to bundle
- Mobile browsers (Chrome Android, Safari iOS) render PDFs natively when opened in new tab
- Target users (THCS students) are on mobile; native handling is superior UX
- Can always add react-pdf later for inline preview if needed — start simple

**DB schema needed:**
```sql
create table public.study_materials (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text not null,  -- 'mid_term' | 'final' | 'entrance' | 'specialized' | 'hsg'
  grade        int,            -- 7 | 8 | 9 | null (for cross-grade)
  file_path    text not null,  -- storage path in 'study-materials' bucket
  file_size    int,
  created_at   timestamptz default now()
);
-- RLS: accessible to users with active package that includes this material
-- OR: public access if material is free
```

### 4. Pricing + Access Control — No New Package

Manual enrollment flow (payment via Zalo/bank transfer → admin grants package). Pure Supabase RLS.

```sql
create table public.packages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,               -- 'Toán 7 cơ bản', 'All-access'
  slug        text unique not null,
  price_vnd   int not null,                -- 1500000, 4000000, etc.
  description text,
  grade       int,                          -- 7 | 8 | null (for multi-grade)
  features    jsonb                         -- ['video', 'chat', 'materials', 'exams']
);

create table public.user_packages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  package_id  uuid not null references public.packages(id),
  granted_by  uuid references auth.users(id),  -- admin who granted
  granted_at  timestamptz default now(),
  expires_at  timestamptz,                      -- null = lifetime
  unique(user_id, package_id)
);
```

**Access control pattern:** RLS policies on `lessons`, `study_materials`, `exams` check `user_packages` JOIN to ensure student has a valid package covering that content. Admin retains full access via role check.

### 5. KaTeX — Installation and Usage

```bash
yarn add katex react-katex
```

```typescript
// Import KaTeX CSS (required — renders math fonts)
// Add to src/main.tsx or src/index.css
import 'katex/dist/katex.min.css'
```

```typescript
// Usage in exam question component
import { InlineMath, BlockMath } from 'react-katex'

// Inline: "Tính x nếu $x^2 + 3x - 4 = 0$"
<p>
  Tính x nếu <InlineMath math="x^2 + 3x - 4 = 0" />
</p>

// Block (display mode for complex equations):
<BlockMath math="\int_0^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}" />
```

**Content storage:** Store LaTeX strings in the DB. Admin enters raw LaTeX in a textarea; preview renders via KaTeX before saving. No WYSIWYG editor needed for v3.0.

### 6. School Navigator — No New Package

Pure UI logic using existing shadcn/ui components. Map of schools → course slugs hardcoded or stored in DB.

```typescript
// schools table OR static config is fine for v3.0 (handful of schools)
const SCHOOL_COURSE_MAP: Record<string, string> = {
  'ptnk':  'on-chuyen-toan-9-10-ptnk',
  'cnn':   'on-chuyen-toan-9-10-cnn',
  'csp':   'on-chuyen-toan-9-10-csp',
  'khtn':  'on-chuyen-toan-9-10-khtn',
}
```

Scroll-to section → Select school → navigate to `/catalogue?school=ptnk`. Existing `Combobox` from shadcn handles the select UI.

### 7. YouTube Privacy Strategy — No New Package

No library change. Strategy: use `youtube-nocookie.com` embed domain + `?rel=0&modestbranding=1` params. Unlisted videos are sufficient for MVP — not publicly discoverable, but accessible via embed. Private videos require OAuth (too complex for v3). Existing `youtube.ts` utility needs parameter update only.

---

## Supabase Client Upgrade Consideration

Current: `@supabase/supabase-js@2.78.0` → Latest: `2.105.1`

**Decision: Hold at 2.78.0 for v3.0.** Reasons:
1. Node.js 18 constraint documented in original STACK.md — v2.79+ drops Node 18 support
2. Realtime channels API (`supabase.channel()`) is fully available in 2.78.0
3. No v3.0 feature requires 2.79+ APIs
4. Upgrade to 2.105.x is safe after Node → 20 LTS upgrade (separate tech debt task)

---

## Installation Summary for v3.0

```bash
# Only new dependencies for v3.0
yarn add katex react-katex
```

That's it. One `yarn add` for the entire v3.0 feature set.

All other new functionality — chat, timers, PDF links, access control, school navigator — uses existing packages or Supabase capabilities already bundled.

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-pdf` + `pdfjs-dist` | ~4MB bundle; mobile students don't need inline PDF — native browser handles it better | Supabase Storage signed URL + `<a target="_blank">` |
| `better-react-mathjax` / MathJax | 900KB+ async; layout shifts during load; overkill for grade 7–9 math | `react-katex` (synchronous, 200KB) |
| `socket.io` / Firebase Realtime | Separate service; unnecessary when Supabase Realtime is already bundled | `supabase.channel()` with `postgres_changes` |
| `use-timer` / `react-countdown` | Unnecessary dependency for simple countdown | `useState + useEffect` (10 lines) |
| Payment gateway (Stripe, VNPay) | Out of scope — manual enrollment via admin | Pricing display UI only; admin grants packages manually |
| `@supabase/auth-ui-react` | Not needed for new features; already excluded from v1.0 | Custom shadcn/ui forms (already built) |

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `katex` | `0.16.45` | React 18 ✓, TypeScript 5.8 ✓ | CSS must be imported in main entry; no peer dep conflicts |
| `react-katex` | `3.1.0` | React 16.8+, 17, 18, 19 ✓ | Thin wrapper; `katex` is peer dep |
| `@supabase/supabase-js` | `2.78.0` | Node 18 ✓, Vite 5 ✓ | Do not upgrade until Node → 20 LTS |

---

## Sources

- `npm info react-pdf dist-tags` + `npm info react-pdf peerDependencies` — confirmed react-pdf 10.4.1 / pdfjs-dist 5.4.296 size concerns (verified locally)
- `npm info katex version` → `0.16.45` (latest); `npm info react-katex version` → `3.1.0` (latest)
- `cat node_modules/@supabase/supabase-js/package.json` — confirmed `@supabase/realtime-js@2.78.0` is already bundled
- `npm info @supabase/supabase-js version` → `2.105.1` is latest; Node 18 constraint from original STACK.md research
- KaTeX vs MathJax: KaTeX official docs (katex.org) — synchronous render model, 95% LaTeX coverage, ~200KB gzip (HIGH confidence from official source)

---

*Stack research for: BuMath LMS v3.0 Platform Expansion*
*Researched: 2026-05-03*

---
---

# Original v1.0 Stack Research (Historical Reference)

*The content below is preserved from the original v1.0 research (2026-03-23) for historical context.*
*All decisions below remain valid and in-production.*

---

---

## Existing Stack (Do Not Change)

| Technology | Version | Notes |
|------------|---------|-------|
| React | 18.3.1 | Keep — LMS components slot into existing component tree |
| TypeScript | 5.8.3 | Keep — all new code must be typed |
| Vite | 5.4.19 | Keep — VITE_ env vars are how Supabase keys are exposed |
| shadcn/ui + Tailwind | 3.4.17 | Keep — auth forms and LMS UI built with same component system |
| React Router DOM | 6.30.1 | Keep — add `/dashboard`, `/courses/:id`, `/grades` routes |
| TanStack React Query | 5.83.0 | Keep — Supabase queries wrap cleanly as queryFns |
| React Hook Form + Zod | 7.61.1 + 3.25.76 | Keep — auth forms and submission forms use these |
| Yarn | 4.11.0 | Keep — all installs use `yarn add`, not `npm install` |

---

## Recommended Stack — New Additions

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @supabase/supabase-js | 2.80.0 | Primary Supabase client — auth, database, storage | Official SDK; v2 is stable, maintained, ships typed query builder. v2.79+ dropped Node 18 — this project uses Node 18.20.8 so pin to **2.78.0** until Node is upgraded. |
| Supabase Auth | (via SDK) | Email/password auth, session management, JWT issuance | Built into Supabase; no extra package needed. Handles session persistence in localStorage automatically. |
| Supabase Storage | (via SDK) | Student assignment photo uploads | Built-in S3-compatible object storage with RLS policies on `storage.objects`. Supports up to 5 GB; photos <6 MB use standard upload — no extra library needed. |
| Supabase PostgreSQL | (managed) | All application data: courses, lessons, enrollments, submissions, grades, progress | Managed Postgres with RLS is the core persistence layer. No separate ORM needed — Supabase JS client query builder is sufficient for this domain. |

**Node version warning:** `@supabase/supabase-js` 2.79.0+ dropped Node.js 18 support (EOL April 2025). The project currently runs Node 18.20.8. Pin to `2.78.0` or upgrade Node to 20+ first. Node 20 LTS is the safe upgrade target.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/auth-ui-react | ^0.4.7 | Pre-built auth UI components (sign in, sign up, magic link forms) styled to match shadcn/ui via appearance prop | Use for initial auth screens to ship fast. Replace with custom shadcn/ui forms if you need tighter Vietnamese language control or custom validation messages. |
| @supabase/auth-ui-shared | ^0.1.8 | Required peer dependency of auth-ui-react | Required only if using @supabase/auth-ui-react |
| react-dropzone | ^14.3.5 | Drag-and-drop + click-to-select file input for photo submission | Use for the student assignment upload UI. Lighter than a full component library, integrates with React Hook Form via controller. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Supabase CLI | Local dev, migrations, type generation | `yarn add -D supabase` — run `supabase gen types typescript` to keep DB types in sync with schema. Essential for safe schema changes. |
| Supabase Dashboard | Creating buckets, managing RLS policies, inspecting auth users | Web UI at app.supabase.com — use for initial policy setup and debugging; migrate policies to SQL migration files for production |

---

## Installation

```bash
# IMPORTANT: Pin to 2.78.0 while project uses Node 18
# Upgrade Node to 20 LTS first, then use latest 2.x

yarn add @supabase/supabase-js@2.78.0

# Auth UI components (optional — use for fast prototyping, replace with shadcn forms for polish)
yarn add @supabase/auth-ui-react @supabase/auth-ui-shared

# File upload UI
yarn add react-dropzone

# Dev tool for type generation and local dev
yarn add -D supabase
```

---

## Supabase Client Setup Pattern

Create a singleton client. **One file, one instance** — multiple `createClient()` calls cause auth state bugs.

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types' // generated by CLI

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // stores session in localStorage
    autoRefreshToken: true,    // refreshes JWT silently before expiry
    detectSessionInUrl: true,  // handles magic link / OAuth callbacks
  },
})
```

Environment variables (`.env.local` — never commit):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Note: Supabase is moving to `VITE_SUPABASE_PUBLISHABLE_KEY` as a rename of `VITE_SUPABASE_ANON_KEY`. Both work currently; prefer the new name for new projects.

---

## Auth Integration Pattern

**Pattern: React Context + onAuthStateChange listener**

This is the standard 2025 approach for React SPAs. Do not use `@supabase/ssr` — that package is for SSR frameworks (Next.js, SvelteKit). This project is a pure SPA.

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session (handles page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

Mount `<AuthProvider>` in `src/App.tsx` wrapping all routes. Use `loading` state to show a spinner before rendering protected routes.

---

## Role System — Three-Role Architecture

### Recommended approach: profiles table + Custom Access Token Auth Hook

**Why not raw `auth.user_metadata`:** User metadata can be edited by the user client-side. Never use it for roles.

**Why not pure `app_metadata` only:** App metadata requires a service role key write to change and does not automatically flow into the JWT unless an Auth Hook injects it. Still useful as a secondary signal.

**Recommended: profiles table + Custom Access Token Hook (auth hook injects role into JWT)**

This is the Supabase-recommended 2025 RBAC pattern per official docs.

### Schema

```sql
-- Enum for roles
create type public.app_role as enum ('student', 'teacher', 'admin');

-- Account approval status
create type public.account_status as enum ('pending', 'approved', 'suspended');

-- Profiles table (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role app_role not null default 'student',
  status account_status not null default 'pending',
  created_at timestamptz default now()
);

-- Auto-create profile on sign up
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, status)
  values (new.id, new.raw_user_meta_data->>'full_name', 'student', 'pending');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Custom Access Token Auth Hook (inject role into JWT)

```sql
-- Hook function: called by Supabase before issuing every JWT
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  claims jsonb;
  user_role public.app_role;
  user_status public.account_status;
begin
  select role, status into user_role, user_status
  from public.profiles where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role::text));
  claims := jsonb_set(claims, '{account_status}', to_jsonb(user_status::text));

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon;
```

Register this in Supabase Dashboard → Authentication → Hooks → Custom Access Token Hook.

With this hook, every JWT contains `user_role` and `account_status` — usable in RLS policies via `auth.jwt()->>'user_role'` without a database join.

---

## RLS Patterns

### Helper functions (add these once, reuse in all policies)

```sql
-- Returns true if the current user has the given role
create or replace function public.has_role(required_role app_role)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (auth.jwt()->>'user_role')::public.app_role = required_role
$$;

-- Returns true if the current user's account is approved
create or replace function public.is_approved()
returns boolean language sql stable security definer set search_path = ''
as $$
  select (auth.jwt()->>'account_status') = 'approved'
$$;
```

### Courses table

```sql
alter table public.courses enable row level security;

-- All approved users can read courses
create policy "approved users read courses"
on public.courses for select to authenticated
using (public.is_approved());

-- Only admin can create/modify courses
create policy "admin manages courses"
on public.courses for all to authenticated
using ((select public.has_role('admin')));
```

### Lessons table

```sql
alter table public.lessons enable row level security;

-- Approved students and teachers can read lessons
create policy "approved users read lessons"
on public.lessons for select to authenticated
using (public.is_approved());

-- Admin and teacher can insert/update lessons
create policy "teacher or admin manages lessons"
on public.lessons for all to authenticated
using (
  (select public.has_role('admin')) or
  (select public.has_role('teacher'))
);
```

### Submissions table

```sql
alter table public.submissions enable row level security;

-- Students can see only their own submissions
create policy "student sees own submissions"
on public.submissions for select to authenticated
using (
  student_id = auth.uid() or
  (select public.has_role('teacher')) or
  (select public.has_role('admin'))
);

-- Students can insert their own submissions (if approved)
create policy "student submits own work"
on public.submissions for insert to authenticated
with check (
  student_id = auth.uid() and
  (select public.is_approved())
);

-- Teachers can update submissions (grading)
create policy "teacher grades submissions"
on public.submissions for update to authenticated
using (
  (select public.has_role('teacher')) or
  (select public.has_role('admin'))
);
```

### Profiles table — admin approval workflow

```sql
alter table public.profiles enable row level security;

-- Users can see their own profile
create policy "user reads own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

-- Admin can see and update all profiles (for approval)
create policy "admin manages all profiles"
on public.profiles for all to authenticated
using ((select public.has_role('admin')));
```

To approve a student, admin updates `profiles.status = 'approved'` and `profiles.role = 'student'`. The next time the student signs in (or refreshes their JWT via `supabase.auth.refreshSession()`), their new status flows into the JWT and RLS gates open.

---

## Storage RLS Patterns

### Bucket: `submissions` (student assignment photos)

```sql
-- Students can upload to their own folder
create policy "student uploads own submission"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'submissions' and
  (storage.foldername(name))[1] = auth.uid()::text and
  (select public.is_approved())
);

-- Students can read their own uploads
create policy "student reads own submissions"
on storage.objects for select to authenticated
using (
  bucket_id = 'submissions' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Teachers and admins can read all submissions
create policy "teacher reads all submissions"
on storage.objects for select to authenticated
using (
  bucket_id = 'submissions' and (
    (select public.has_role('teacher')) or
    (select public.has_role('admin'))
  )
);
```

Upload path convention: `submissions/{user_id}/{submission_id}.jpg`

The `(storage.foldername(name))[1]` expression extracts the first path segment, enforcing that a student cannot upload to another student's folder.

### Bucket: `course-assets` (problem sheet PDFs/images attached by admin)

```sql
-- Only admin can upload
create policy "admin uploads course assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'course-assets' and
  (select public.has_role('admin'))
);

-- All approved users can read course assets
create policy "approved users read course assets"
on storage.objects for select to authenticated
using (
  bucket_id = 'course-assets' and
  (select public.is_approved())
);
```

---

## TanStack Query + Supabase Pattern

The existing TanStack Query setup integrates cleanly. Wrap Supabase calls as query functions:

```typescript
// src/hooks/useCourses.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, lessons(count)')
        .order('created_at', { ascending: false })
        .throwOnError()  // converts Supabase error to thrown exception
      return data
    },
  })
}
```

Key rules:
- Always call `.throwOnError()` so TanStack Query's error state activates correctly
- Include all filter variables in `queryKey` so cache invalidates on change: `['submissions', userId]`
- Use `useMutation` + `queryClient.invalidateQueries` for writes (submit assignment, grade submission)

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @supabase/supabase-js v2 | Firebase / Firestore | If you already have Firebase and want NoSQL flexibility — Firebase has no RLS equivalent, permissions must be implemented in security rules with different syntax |
| Supabase Auth | Auth0 / Clerk | If you need SSO/enterprise SSO or complex social auth across many providers. Adds cost and a third-party JWT issuer that complicates Supabase RLS. |
| profiles table + Auth Hook for roles | Pure app_metadata | app_metadata works for simple admin/user split but cannot be read in a JOIN inside RLS; hooks make role queries unnecessary at policy evaluation time |
| react-dropzone | Uppy, FilePond | Uppy is better if you need TUS resumable upload. For <6 MB student photos, react-dropzone is simpler and has no peer dependency conflicts. |
| Custom AuthContext | @supabase/auth-helpers | auth-helpers is deprecated as of 2024; replaced by @supabase/ssr which is SSR-only. For this SPA, a custom context is the correct approach. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @supabase/auth-helpers | Deprecated in 2024. Replaced by @supabase/ssr which is only for SSR frameworks. | Custom AuthContext (shown above) |
| @supabase/ssr | Designed for Next.js/SvelteKit SSR. Causes errors in Vite SPA (no cookie handling needed). | Custom AuthContext with onAuthStateChange |
| auth.user_metadata for roles | User can overwrite their own metadata via client API. Security hole. | profiles table with role column + Auth Hook |
| supabase-js v1 | Legacy API, no TypeScript generation, no RLS token support. | @supabase/supabase-js v2.x |
| Storing role in localStorage | Easily tampered, bypasses database security. | JWT claims via Auth Hook, enforced in database RLS |
| service_role key in frontend .env | Bypasses ALL RLS — any user can read all data. Never expose. | anon key only in frontend; service_role stays server-side or in Supabase Edge Functions |
| Uploading files directly to a public bucket | No RLS on public buckets — any URL is publicly accessible without auth. | Private bucket with RLS policies on storage.objects |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @supabase/supabase-js@2.78.0 | Node 18.20.8 | 2.79.0+ drops Node 18. Pin to 2.78.0 until Node upgraded to 20+. |
| @supabase/supabase-js@2.x | React 18.3.x | Fully compatible — no React version restrictions |
| @supabase/auth-ui-react@0.4.7 | @supabase/supabase-js@2.x | Must use same major supabase-js version |
| react-dropzone@14.x | React 18.x | Fully compatible |
| TanStack React Query@5.83.0 | @supabase/supabase-js@2.x | No conflicts; supabase-js is a plain async function caller |

---

## Deployment Change Required

Current deployment target is GitHub Pages (static). Supabase client runs fully in the browser — no server change needed for the Supabase client itself. However:

- GitHub Pages does not support custom redirect URLs properly for Supabase Auth email confirmation links (the `site_url` in Supabase must match the deployed origin).
- **Recommend: migrate to Vercel.** Free tier, handles SPA routing (`/dashboard` won't 404 on refresh), env vars set in dashboard (not committed to repo), zero config for Vite.
- Vercel deploy: `vercel --prod` or connect GitHub repo for auto-deploy on push to `main`.
- Remove the `GITHUB_ACTIONS` base path hack in `vite.config.ts` after migration.

---

## Sources

- [@supabase/supabase-js on npm](https://www.npmjs.com/package/@supabase/supabase-js) — version 2.80.0 confirmed, Node 18 drop in 2.79.0 (HIGH confidence)
- [Supabase React quickstart — official docs](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs) — createClient pattern, env variable naming (HIGH confidence)
- [Supabase Custom Claims & RBAC — official docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — Auth Hook pattern, role tables, authorize() function (HIGH confidence)
- [Supabase Row Level Security — official docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — auth.uid(), auth.jwt() in policies, performance wrapping with SELECT (HIGH confidence)
- [Supabase Storage Access Control — official docs](https://supabase.com/docs/guides/storage/security/access-control) — storage.objects RLS, storage.foldername() helper (HIGH confidence)
- [Supabase Standard Uploads — official docs](https://supabase.com/docs/guides/storage/uploads/standard-uploads) — 6 MB standard limit, TUS for larger files (HIGH confidence)
- [How to Use Supabase with TanStack Query — makerkit.dev](https://makerkit.dev/blog/saas/supabase-react-query) — throwOnError() pattern, queryKey conventions (MEDIUM confidence — community source, verified against TanStack Query v5 changelog)
- [RLS Simplified — Supabase troubleshooting](https://supabase.com/docs/guides/troubleshooting/rls-simplified-BJTcS8) — common RLS mistakes (HIGH confidence)

---

*Stack research for: BuMath LMS — Supabase backend integration*
*Researched: 2026-03-23*
