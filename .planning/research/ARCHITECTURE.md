# Architecture Research — BuMath v3.0 Platform Expansion

**Domain:** Supabase-backed LMS — React SPA with 3-role auth (student/teacher/admin)
**Researched:** 2026-05-03 (updated for v3.0 milestone)
**Confidence:** HIGH (codebase inspection + Supabase official docs), MEDIUM (Realtime + RLS interaction patterns)

---

## v3.0 Feature Integration Map

Seven features land in this milestone. Their architectural impact ranges from "add a table + component" to "modify existing RLS policies." This document covers each one: what changes, what stays, where the risk is.

| Feature | New Tables | Modified Tables | New Components | Modifies Existing |
|---------|-----------|----------------|---------------|-------------------|
| In-Lesson Chat | `lesson_messages` | — | `LessonChat` | `LessonContent` (tab layout) |
| Mock Exam System | `exam_sessions`, `exam_questions`, `exam_submissions` | — | `ExamListPage`, `ExamTakingPage` | `App.tsx` (routes) |
| Study Materials | `study_materials` | — | `StudyMaterialsPage`, `MaterialsTab` | `LessonContent` (tab), `App.tsx` |
| Pricing + Access Control | `packages`, `package_courses` | `enrollments` (add `package_id`) | `PricingPage`, admin package UI | `lessons` RLS, `enrollments` api |
| School Navigator | — | — | `SchoolNavigator` | `Index.tsx` (landing) |
| Admin Full-Page Forms | — | — | `AddChapterPage`, `AddLessonPage` | `App.tsx` (routes) |
| YouTube Privacy | — | — | — | `LessonContent`, `vercel.json` |

**Critical dependency:** Pricing + Access Control must ship before any lesson is access-gated. Build it in Phase 1 of the milestone, even if the pricing UI is placeholder. The `lessons` RLS policy update is the anchor point everything else depends on.

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        React SPA (Vite + TypeScript)                 │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Public      │  │  Student     │  │  Teacher /   │               │
│  │  Routes      │  │  Routes      │  │  Admin       │               │
│  │  /           │  │  /courses    │  │  Routes      │               │
│  │  /login      │  │  /lessons    │  │  /dashboard  │               │
│  │  /register   │  │  /progress   │  │  /grade      │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                 │                         │
│  ┌──────▼─────────────────▼─────────────────▼───────────────────┐   │
│  │                  AuthContext + ProtectedRoute                  │   │
│  │         (supabase.auth.onAuthStateChange + role check)         │   │
│  └──────────────────────────┬────────────────────────────────────┘   │
│                             │                                         │
│  ┌──────────────────────────▼────────────────────────────────────┐   │
│  │               TanStack Query (server state cache)              │   │
│  │     useQuery(supabaseQueryFn) + useMutation + invalidation     │   │
│  └──────────────────────────┬────────────────────────────────────┘   │
│                             │                                         │
│  ┌──────────────────────────▼────────────────────────────────────┐   │
│  │              Supabase JS Client (singleton)                    │   │
│  │   src/lib/supabase.ts — createClient(url, anonKey)             │   │
│  └──────────────────────────┬────────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────-┘
                              │ HTTPS (JWT in Auth header)
┌─────────────────────────────▼────────────────────────────────────────┐
│                          Supabase Platform                            │
│                                                                       │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────────┐    │
│  │  Auth      │  │  PostgreSQL  │  │  Storage                  │    │
│  │  (users,   │  │  + RLS       │  │  (submissions bucket)     │    │
│  │   sessions,│  │              │  │  Private, RLS-controlled  │    │
│  │   JWT)     │  │              │  │                           │    │
│  └────────────┘  └──────────────┘  └───────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `AuthContext` | Hold session + decoded role; expose to whole app | React Context + `onAuthStateChange` listener |
| `ProtectedRoute` | Block render until session checked; redirect by role | Wrapper around `<Outlet>` checking context |
| Supabase singleton | Single client instance shared across all modules | `src/lib/supabase.ts` export |
| Query hooks (`src/hooks/`) | Wrap Supabase calls in TanStack Query; cache + invalidate | `useQuery` + `useMutation` per domain |
| Query functions (`src/queries/`) | Pure Supabase query logic, no React state | Called by hooks, testable in isolation |
| Storage utilities (`src/lib/storage.ts`) | Upload/download assignment files | Wraps `supabase.storage` |

---

## Database Schema

### Enums

```sql
create type public.user_role as enum ('student', 'teacher', 'admin');
create type public.account_status as enum ('pending', 'approved', 'suspended');
create type public.submission_status as enum ('submitted', 'graded');
```

### Tables

#### `public.profiles`
Extension of `auth.users`. One row per user. Created automatically by trigger on signup.

```sql
create table public.profiles (
  id             uuid primary key references auth.users on delete cascade,
  full_name      text,
  role           public.user_role not null default 'student',
  status         public.account_status not null default 'pending',
  created_at     timestamptz default now()
);
alter table public.profiles enable row level security;
```

**Note:** `status = 'pending'` until an admin approves. RLS blocks pending students from accessing course data.

#### `public.courses`
```sql
create table public.courses (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  grade          smallint check (grade in (7, 8, 9, 10)),  -- 10 = ôn chuyên
  created_by     uuid references public.profiles(id),
  created_at     timestamptz default now()
);
alter table public.courses enable row level security;
```

#### `public.lessons`
```sql
create table public.lessons (
  id             uuid primary key default gen_random_uuid(),
  course_id      uuid not null references public.courses(id) on delete cascade,
  title          text not null,
  description    text,
  youtube_id     text,                -- YouTube video ID (not full URL)
  sort_order     smallint not null default 0,
  created_at     timestamptz default now()
);
alter table public.lessons enable row level security;
```

#### `public.assignments`
Attached to a lesson; holds the problem statement (PDF or image URL in Storage).

```sql
create table public.assignments (
  id             uuid primary key default gen_random_uuid(),
  lesson_id      uuid not null references public.lessons(id) on delete cascade,
  title          text not null,
  description    text,
  file_url       text,               -- path in Supabase Storage (public bucket or signed URL)
  created_at     timestamptz default now()
);
alter table public.assignments enable row level security;
```

#### `public.enrollments`
Controls which students can access which courses. Managed manually by admin for MVP.

```sql
create table public.enrollments (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.profiles(id) on delete cascade,
  course_id      uuid not null references public.courses(id) on delete cascade,
  enrolled_at    timestamptz default now(),
  unique (student_id, course_id)
);
alter table public.enrollments enable row level security;
```

#### `public.lesson_progress`
One row per (student, lesson). Written when student marks a lesson as watched.

```sql
create table public.lesson_progress (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.profiles(id) on delete cascade,
  lesson_id      uuid not null references public.lessons(id) on delete cascade,
  watched_at     timestamptz default now(),
  unique (student_id, lesson_id)
);
alter table public.lesson_progress enable row level security;
```

#### `public.submissions`
Student uploads a photo of their hand-written answer.

```sql
create table public.submissions (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.profiles(id) on delete cascade,
  assignment_id  uuid not null references public.assignments(id) on delete cascade,
  storage_path   text not null,           -- path inside 'submissions' bucket
  status         public.submission_status not null default 'submitted',
  score          numeric(5,2),
  feedback       text,
  graded_by      uuid references public.profiles(id),
  graded_at      timestamptz,
  submitted_at   timestamptz default now(),
  unique (student_id, assignment_id)      -- one submission per student per assignment
);
alter table public.submissions enable row level security;
```

### Auto-Create Profile on Signup (Trigger)

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, status)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'student',   -- all self-registered users start as students
    'pending'    -- admin must approve
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Source:** [Supabase – Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data) (HIGH confidence)

---

## RLS Policy Patterns

### Role Helper Function
Create once; reuse in all policies. Reads role from JWT claims (populated by auth hook) to avoid a DB round-trip.

```sql
create or replace function public.get_my_role()
returns public.user_role
language sql stable
security definer set search_path = ''
as $$
  select (coalesce(
    nullif((select auth.jwt() ->> 'user_role'), ''),
    (select role::text from public.profiles where id = auth.uid())
  ))::public.user_role
$$;
```

**Note:** Wrap in `(SELECT ...)` at call sites so Postgres caches the result per statement, avoiding re-evaluation per row.

### Auth Hook — Inject Role into JWT

Register this function in Supabase Dashboard → Authentication → Hooks → Custom Access Token:

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  claims jsonb;
  user_role public.user_role;
begin
  select role into user_role
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role::text));
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant select on public.profiles to supabase_auth_admin;
```

**Source:** [Custom Claims & RBAC – Supabase Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) (HIGH confidence)

**Important:** `role` and `exp` are reserved JWT claims in Supabase Realtime — use `user_role` as the claim name, not `role`.

### RLS Policies by Table

#### `public.profiles`
```sql
-- Users see their own profile; admins see all
create policy "Users read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid() or (select public.get_my_role()) = 'admin');

-- Users update their own non-sensitive fields
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Only admins can change role or status
-- Enforce via separate admin-only update policy or application logic
```

#### `public.courses`
```sql
-- Approved students see only enrolled courses
create policy "Students see enrolled courses"
  on public.courses for select to authenticated
  using (
    (select public.get_my_role()) in ('teacher', 'admin')
    or (
      (select public.get_my_role()) = 'student'
      and (select status from public.profiles where id = auth.uid()) = 'approved'
      and exists (
        select 1 from public.enrollments e
        where e.course_id = courses.id and e.student_id = auth.uid()
      )
    )
  );

-- Only admin can insert/update/delete courses
create policy "Admin manages courses"
  on public.courses for all to authenticated
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');
```

#### `public.lessons`
```sql
-- Students see lessons of their enrolled courses
create policy "Students see enrolled lessons"
  on public.lessons for select to authenticated
  using (
    (select public.get_my_role()) in ('teacher', 'admin')
    or (
      (select public.get_my_role()) = 'student'
      and (select status from public.profiles where id = auth.uid()) = 'approved'
      and exists (
        select 1 from public.enrollments e
        join public.courses c on c.id = e.course_id
        where c.id = lessons.course_id and e.student_id = auth.uid()
      )
    )
  );

create policy "Admin manages lessons"
  on public.lessons for all to authenticated
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');
```

#### `public.lesson_progress`
```sql
-- Students see and write only their own progress
create policy "Students manage own progress"
  on public.lesson_progress for all to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- Teachers/admins read all progress
create policy "Teachers read all progress"
  on public.lesson_progress for select to authenticated
  using ((select public.get_my_role()) in ('teacher', 'admin'));
```

#### `public.submissions`
```sql
-- Students see only their own submissions
create policy "Students see own submissions"
  on public.submissions for select to authenticated
  using (student_id = auth.uid());

-- Students can insert only for themselves
create policy "Students submit own work"
  on public.submissions for insert to authenticated
  with check (
    student_id = auth.uid()
    and (select public.get_my_role()) = 'student'
    and (select status from public.profiles where id = auth.uid()) = 'approved'
  );

-- Teachers/admins see all submissions for grading
create policy "Teachers read all submissions"
  on public.submissions for select to authenticated
  using ((select public.get_my_role()) in ('teacher', 'admin'));

-- Teachers/admins can update (score + feedback)
create policy "Teachers grade submissions"
  on public.submissions for update to authenticated
  using ((select public.get_my_role()) in ('teacher', 'admin'))
  with check ((select public.get_my_role()) in ('teacher', 'admin'));
```

**Source:** [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security), [RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) (HIGH confidence)

---

## Storage: Assignment Submissions Bucket

### Bucket Setup
Create a **private** bucket named `submissions`. Private = all operations require RLS.

```sql
-- Storage RLS on storage.objects table

-- Students upload to their own folder: submissions/{student_id}/{filename}
create policy "Students upload own submissions"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Students read their own files (to view after upload)
create policy "Students read own submissions"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Teachers/admins read all submissions
create policy "Teachers read all submission files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'submissions'
    and (select public.get_my_role()) in ('teacher', 'admin')
  );
```

### Upload Flow (Frontend)

```
Student selects photo
    ↓
Resize/compress on client (optional, reduces storage cost)
    ↓
supabase.storage.from('submissions')
  .upload(`${userId}/${assignmentId}/${filename}`, file)
    ↓
Get storage_path from response
    ↓
INSERT into public.submissions (student_id, assignment_id, storage_path)
    ↓
Teacher accesses via:
  supabase.storage.from('submissions')
    .createSignedUrl(storage_path, 3600)  // 1-hour signed URL
```

**Source:** [Storage Access Control – Supabase Docs](https://supabase.com/docs/guides/storage/security/access-control) (HIGH confidence)

---

## Frontend Auth Flow

### Supabase Client Singleton

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

One export. Import everywhere. Never instantiate in components.

### AuthContext

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { jwtDecode } from 'jwt-decode'
import { supabase } from '@/lib/supabase'

type UserRole = 'student' | 'teacher' | 'admin' | null
type AccountStatus = 'pending' | 'approved' | 'suspended' | null

interface AuthState {
  session: Session | null
  role: UserRole
  status: AccountStatus
  loading: boolean
}

const AuthContext = createContext<AuthState>({
  session: null, role: null, status: null, loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null, role: null, status: null, loading: true
  })

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const role = session
        ? (jwtDecode<{ user_role?: UserRole }>(session.access_token).user_role ?? null)
        : null
      // Fetch status from profiles for approved check
      // (role comes from JWT, status requires a DB read on init)
      setState(prev => ({ ...prev, session, role, loading: false }))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const role = session
          ? (jwtDecode<{ user_role?: UserRole }>(session.access_token).user_role ?? null)
          : null
        setState(prev => ({ ...prev, session, role }))
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
```

### Protected Route Pattern (React Router v6)

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

type AllowedRole = 'student' | 'teacher' | 'admin'

interface ProtectedRouteProps {
  allowedRoles?: AllowedRole[]
  requireApproved?: boolean    // blocks pending students
}

export function ProtectedRoute({
  allowedRoles,
  requireApproved = false
}: ProtectedRouteProps) {
  const { session, role, status, loading } = useAuth()

  if (loading) return <div>Đang tải...</div>

  if (!session) return <Navigate to="/login" replace />

  if (allowedRoles && role && !allowedRoles.includes(role as AllowedRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (requireApproved && status === 'pending') {
    return <Navigate to="/pending-approval" replace />
  }

  return <Outlet />
}
```

### Route Structure in App.tsx

```typescript
// src/App.tsx — extend existing routes
<Routes>
  {/* Public */}
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/pending-approval" element={<PendingApproval />} />

  {/* Student routes — approved students only */}
  <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} requireApproved />}>
    <Route path="/courses" element={<CourseList />} />
    <Route path="/courses/:courseId" element={<CourseDetail />} />
    <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonView />} />
  </Route>

  {/* Teacher routes */}
  <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
    <Route path="/dashboard/submissions" element={<SubmissionDashboard />} />
    <Route path="/dashboard/submissions/:id/grade" element={<GradeSubmission />} />
  </Route>

  {/* Admin routes */}
  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route path="/admin/users" element={<UserManagement />} />
    <Route path="/admin/courses" element={<CourseManagement />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
```

**Source:** [Protected Routes in React Router 6 with Supabase](https://medium.com/@seojeek/protected-routes-in-react-router-6-with-supabase-authentication-and-oauth-599047e08163), [React Supabase Auth Template](https://dev.to/mmvergara/react-supabase-auth-template-with-protected-routes-41ib) (MEDIUM confidence, verified with Supabase session patterns)

---

## Recommended Project Structure

```
src/
├── lib/
│   ├── supabase.ts          # Singleton Supabase client
│   ├── storage.ts           # Upload/signed URL helpers
│   └── utils.ts             # Existing cn() utility
│
├── contexts/
│   └── AuthContext.tsx      # Session, role, status — global auth state
│
├── components/
│   ├── ProtectedRoute.tsx   # Route guard wrapper
│   ├── landing/             # Existing landing page sections
│   └── ui/                  # Existing shadcn/ui components
│
├── queries/                 # Pure Supabase query functions (no React)
│   ├── courses.ts           # getCourses(), getCourseById()
│   ├── lessons.ts           # getLessons(), markWatched()
│   ├── submissions.ts       # getSubmissions(), createSubmission(), grade()
│   └── profiles.ts          # getProfile(), approveUser()
│
├── hooks/                   # TanStack Query wrappers around queries/
│   ├── useCourses.ts        # useCoursesQuery(), useEnrollmentsQuery()
│   ├── useLessons.ts        # useLessonsQuery(), useMarkWatched()
│   ├── useSubmissions.ts    # useSubmissionsQuery(), useGradeMutation()
│   └── use-toast.ts         # Existing
│
├── pages/
│   ├── Index.tsx            # Existing landing page
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── PendingApproval.tsx
│   ├── student/
│   │   ├── CourseList.tsx
│   │   ├── CourseDetail.tsx
│   │   └── LessonView.tsx
│   ├── teacher/
│   │   ├── SubmissionDashboard.tsx
│   │   └── GradeSubmission.tsx
│   └── admin/
│       ├── UserManagement.tsx
│       └── CourseManagement.tsx
│
└── App.tsx                  # Updated with new routes + AuthProvider
```

### Structure Rationale

- **`queries/`:** Pure functions separated from hooks. Testable without React context. Re-usable across components.
- **`hooks/`:** TanStack Query wrappers. One hook file per domain. Follows the makerkit pattern: `useQuery({ queryFn: () => queriesFn(client, params) })`.
- **`contexts/`:** Separate from hooks. Auth state is special — it wraps the whole app and isn't a server-state concern for TanStack Query.
- **`pages/` by role:** Flat enough to navigate; grouped enough to avoid cross-role confusion.

---

## Architectural Patterns

### Pattern 1: Queries Separated from Hooks

**What:** Query logic lives in `src/queries/*.ts` as plain async functions. `src/hooks/*.ts` wraps them in `useQuery`/`useMutation`.

**When to use:** Always for Supabase data access. Enables testing query logic without rendering components.

**Trade-offs:** Small added indirection. Worth it when hooks are tested separately from data-fetching logic.

```typescript
// src/queries/courses.ts
export async function getEnrolledCourses(client: SupabaseClient, studentId: string) {
  const { data } = await client
    .from('courses')
    .select('*, enrollments!inner(student_id)')
    .eq('enrollments.student_id', studentId)
    .throwOnError()
  return data
}

// src/hooks/useCourses.ts
export function useEnrolledCoursesQuery() {
  const client = supabase  // singleton
  const { session } = useAuth()
  return useQuery({
    queryKey: ['courses', 'enrolled', session?.user.id],
    queryFn: () => getEnrolledCourses(client, session!.user.id),
    enabled: !!session,
  })
}
```

**Source:** [How to Use Supabase with TanStack Query (React Query v5)](https://makerkit.dev/blog/saas/supabase-react-query) (MEDIUM confidence)

### Pattern 2: Admin Approval Flow via `profiles.status`

**What:** New registrations land with `status = 'pending'`. Admin sets `status = 'approved'`. RLS blocks pending users from course data at the DB level. Frontend redirects to `/pending-approval` screen.

**When to use:** This project (manual enrollment control).

**Trade-offs:** Requires admin action before student can use the product. No built-in Supabase feature; entirely custom via profiles table + RLS.

```typescript
// Admin approves a user — uses supabase-js admin client or service role
const { error } = await supabase
  .from('profiles')
  .update({ status: 'approved' })
  .eq('id', userId)
```

### Pattern 3: Progress Computed from `lesson_progress` Table

**What:** No denormalized `progress_percent` stored. Compute completion percentage on the fly: `watched_count / total_lessons_in_course * 100`.

**When to use:** MVP scale (< 10k lessons). Avoids update anomalies when admin adds/removes lessons.

**Trade-offs:** Adds a JOIN per progress query. Acceptable until query becomes slow; materialized view or denormalized column is the v2 upgrade path.

```sql
-- Efficient progress query via Supabase view or RPC
select
  c.id,
  c.title,
  count(l.id) as total_lessons,
  count(lp.id) as watched_lessons,
  round(count(lp.id)::numeric / nullif(count(l.id), 0) * 100, 0) as percent
from courses c
join lessons l on l.course_id = c.id
left join lesson_progress lp
  on lp.lesson_id = l.id and lp.student_id = auth.uid()
group by c.id, c.title;
```

---

## Data Flow

### Student Views a Lesson

```
Student navigates to /courses/:courseId/lessons/:lessonId
    ↓
ProtectedRoute checks: session exists? role = student? status = approved?
    ↓
useLessonQuery(lessonId) → supabase.from('lessons').select().eq('id', lessonId)
    ↓
RLS checks: student enrolled in this lesson's course AND status = approved
    ↓
Component renders: YouTube embed from lesson.youtube_id
    ↓
Student clicks "Đã xem" → useMarkWatchedMutation()
    ↓
INSERT into lesson_progress (student_id, lesson_id)
    ↓
queryClient.invalidateQueries(['progress', courseId])
    ↓
Progress bar re-renders with new %
```

### Student Submits Assignment

```
Student selects photo file
    ↓
File → supabase.storage.from('submissions').upload(`${userId}/${assignmentId}/${uuid}`)
    ↓
Storage RLS: confirms (foldername)[1] = auth.uid()
    ↓
On upload success → INSERT into submissions (student_id, assignment_id, storage_path)
    ↓
Table RLS: confirms student_id = auth.uid() AND role = student AND status = approved
    ↓
queryClient.invalidateQueries(['submissions', assignmentId])
```

### Teacher Grades a Submission

```
Teacher opens SubmissionDashboard
    ↓
useSubmissionsQuery() → supabase.from('submissions').select('*, student:profiles(*)')
    ↓
RLS: allows read for role in ('teacher', 'admin')
    ↓
Teacher clicks submission → creates signedUrl for storage_path (1hr expiry)
    ↓
Teacher enters score + feedback → useGradeMutation()
    ↓
UPDATE submissions SET score, feedback, graded_by, graded_at, status='graded'
    ↓
RLS: confirms role in ('teacher', 'admin')
    ↓
queryClient.invalidateQueries(['submissions'])
```

### Auth State Flow

```
App loads
    ↓
AuthProvider → supabase.auth.getSession()
    ↓ session found?                    ↓ no session
role = decode JWT user_role claim    session = null, loading = false
status = fetch profiles.status
loading = false
    ↓
onAuthStateChange listener active for all future events
    ↓ SIGNED_IN                         ↓ SIGNED_OUT
update session + role + status      clear session, invalidate all queries
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–500 users | Current design is fine. Supabase free tier handles this easily. |
| 500–5k users | Add index on `lesson_progress(student_id, lesson_id)`, `submissions(student_id)`, `enrollments(student_id, course_id)`. Enable Supabase connection pooling (PgBouncer). |
| 5k–50k users | Consider materializing progress percentages via a scheduled Postgres function. Separate read-heavy queries to Supabase read replicas if available. |
| 50k+ users | This is a Vietnamese THCS platform — unlikely in v1. Revisit only if product grows significantly. |

### Scaling Priorities

1. **First bottleneck:** RLS policy evaluation cost on large tables. Fix: ensure every `auth.uid()` comparison column is indexed. Use `(SELECT auth.uid())` wrapper so Postgres caches per statement.
2. **Second bottleneck:** Progress computation JOIN. Fix: add materialized view or store `watched_count` as a denormalized column updated by trigger.

---

## Anti-Patterns

### Anti-Pattern 1: Multiple Supabase Client Instances

**What people do:** Call `createClient()` inside components or hooks directly.

**Why it's wrong:** Creates a new client on every render, breaks session management, causes multiple `onAuthStateChange` listeners, auth state becomes inconsistent.

**Do this instead:** Export one singleton from `src/lib/supabase.ts`. Import that everywhere.

### Anti-Pattern 2: Skipping `.throwOnError()` on Queries

**What people do:** `const { data, error } = await supabase.from('x').select()` and forget to handle `error`.

**Why it's wrong:** TanStack Query's `error` state stays empty even when Supabase returns an error, because Supabase doesn't throw by default. Silent failures are hard to debug.

**Do this instead:** Chain `.throwOnError()` on every Supabase query inside `queryFn`. Let TanStack Query's error boundary or `isError` state handle it.

### Anti-Pattern 3: Storing Role in `raw_user_meta_data`

**What people do:** Set role during `signUp({ options: { data: { role: 'teacher' } } })` and trust it from `user_meta_data`.

**Why it's wrong:** `raw_user_meta_data` is writable by the client via `supabase.auth.updateUser()`. A student can set their own role to 'admin'.

**Do this instead:** Store role in `public.profiles.role` (controlled by your app, not editable by the user via Supabase auth APIs). Inject it into JWT via the custom access token hook so RLS can use it.

**Source:** [Supabase RLS Docs — raw_app_meta_data vs raw_user_meta_data](https://supabase.com/docs/guides/database/postgres/row-level-security) (HIGH confidence)

### Anti-Pattern 4: Querying Auth State Without Loading Guard

**What people do:** Check `session !== null` immediately on first render.

**Why it's wrong:** `getSession()` is async. On first render, session is `null` even for logged-in users. Causes redirect to `/login` on page refresh.

**Do this instead:** Gate all auth-dependent renders on `loading === false`. The `ProtectedRoute` component above handles this with `if (loading) return <div>Đang tải...</div>`.

### Anti-Pattern 5: Using RLS to Replace Server-Side Validation

**What people do:** Rely solely on RLS, skip application-level validation.

**Why it's wrong:** RLS is the security floor, not the entire security model. Business rules (e.g., "a student cannot submit to an assignment they're not enrolled in") should be validated in the mutation function before the INSERT, and enforced again at the DB level by RLS.

**Do this instead:** Validate in the mutation → let RLS enforce at DB level. Defense in depth.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | `supabase.auth.*` via JS client | Session in localStorage; auto-refreshes token |
| Supabase PostgreSQL | `supabase.from('table').select/insert/update` | All queries subject to RLS |
| Supabase Storage | `supabase.storage.from('bucket').upload/download/createSignedUrl` | `submissions` bucket is private |
| YouTube | `<iframe>` embed with `youtube_id` from lessons table | No API key needed for embed |
| Google Sheets (existing) | Existing `ConsultationForm` POST — keep unchanged | No migration needed |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `AuthContext` → Routes | React Context (`useAuth()`) | All protected routes read from this context |
| `queries/` → `hooks/` | Direct function call inside `queryFn` | No event bus; explicit dependency |
| `hooks/` → Components | TanStack Query state (`data`, `isPending`, `isError`) | No prop drilling needed |
| `pages/` → Storage | Via `src/lib/storage.ts` helpers | Centralises signed URL + upload logic |
| Supabase Auth → JWT → RLS | Custom access token hook injects `user_role` | Hook must be registered in Supabase Dashboard |

---

## Sources

- [Supabase Row Level Security — Official Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence
- [Custom Claims & RBAC — Supabase Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — HIGH confidence
- [Supabase Managing User Data — Official Docs](https://supabase.com/docs/guides/auth/managing-user-data) — HIGH confidence
- [Storage Access Control — Supabase Docs](https://supabase.com/docs/guides/storage/security/access-control) — HIGH confidence
- [RLS Performance Best Practices — Supabase Docs](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — HIGH confidence
- [How to Use Supabase with TanStack Query (React Query v5)](https://makerkit.dev/blog/saas/supabase-react-query) — MEDIUM confidence
- [React Supabase Auth Template with Protected Routes](https://dev.to/mmvergara/react-supabase-auth-template-with-protected-routes-41ib) — MEDIUM confidence

---

*Architecture research for: Supabase-backed LMS with 3-role auth*
*Researched: 2026-03-23*

---

# v3.0 Architecture: Integration Analysis

**Milestone:** Platform Expansion — 7 new features added to existing BuMath LMS
**Researched:** 2026-05-03
**Confidence:** HIGH (codebase inspection + Supabase official docs)

---

## Existing Architecture (Verified from Codebase)

### Actual DB Tables (as-built)
```
profiles (id, full_name, phone, year_of_birth, address, role, approval_status, created_at)
courses (id, title, description, target_grade, thumbnail_url, slug, is_published, created_at, updated_at)
chapters (id, course_id, title, description, order_index, slug, created_at, updated_at)
lessons (id, chapter_id, title, description, video_url, assignment_path, order_index, slug, created_at, updated_at)
enrollments (id, user_id, course_id, enrolled_at)
lesson_progress (id, user_id, lesson_id, completed_at)
submissions (id, user_id, lesson_id, file_path, submitted_at, status, score, comment)
```

### Actual RLS Helper Functions
```sql
get_my_role()       -- SECURITY DEFINER — reads role from profiles, avoids recursion
is_admin()          -- SECURITY DEFINER — wraps get_my_role() = 'admin'
is_approved_user()  -- SECURITY DEFINER — checks approval_status = 'approved'
```

### Actual API Layer Pattern
Each feature has `src/lib/api/{feature}.ts` exporting typed functions. No separate hooks directory.
TanStack Query `useQuery`/`useMutation` calls are inlined in page/component files with `queryKey` arrays.

### Actual Route Pattern (Vietnamese URLs)
```
/dang-nhap, /dang-ky
/quan-tri/nguoi-dung, /quan-tri/khoa-hoc, /quan-tri/bai-nop
/khoa-hoc, /khoa-hoc/:courseSlug
/danh-muc
```
Routes use `<ProtectedRoute requiredRole="admin">` or `<ProtectedRoute allowedRoles={['admin', 'teacher']}>`.

### Actual Component Structure
```
src/components/student/LessonContent.tsx   — video + description + assignment + submission + progress button
src/components/student/LessonSidebar.tsx   — chapter/lesson tree
src/components/student/SubmissionArea.tsx  — file upload + status display
src/components/student/BellNotification.tsx
src/pages/student/CourseDetailPage.tsx     — desktop split-pane + mobile sheet drawer
```

---

## Feature 1: In-Lesson Chat

### New Table
```sql
CREATE TABLE lesson_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text NOT NULL,
  parent_id   uuid REFERENCES lesson_messages(id) ON DELETE CASCADE, -- for threaded replies
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lesson_messages_lesson_id_idx ON lesson_messages(lesson_id);
CREATE INDEX lesson_messages_user_id_idx ON lesson_messages(user_id);

-- Enable Realtime (required for Supabase Realtime subscriptions)
ALTER TABLE lesson_messages REPLICA IDENTITY FULL;
```

### RLS Policies
```sql
ALTER TABLE lesson_messages ENABLE ROW LEVEL SECURITY;

-- Students see all messages in lessons for their enrolled courses
-- (own messages + teacher replies — enrollment scopes visibility naturally)
CREATE POLICY "student_read_lesson_messages"
  ON lesson_messages FOR SELECT
  USING (
    get_my_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN chapters ch ON ch.id = (SELECT chapter_id FROM lessons WHERE id = lesson_messages.lesson_id)
      WHERE e.course_id = ch.course_id AND e.user_id = auth.uid()
    )
  );

-- Students can insert own messages (enrolled lessons only)
CREATE POLICY "student_insert_lesson_messages"
  ON lesson_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    get_my_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN chapters ch ON ch.id = (SELECT chapter_id FROM lessons WHERE id = lesson_messages.lesson_id)
      WHERE e.course_id = ch.course_id AND e.user_id = auth.uid()
    )
  );

-- Teachers/admins see and write all messages
CREATE POLICY "teacher_admin_all_lesson_messages"
  ON lesson_messages FOR ALL
  USING (get_my_role() IN ('teacher', 'admin'))
  WITH CHECK (get_my_role() IN ('teacher', 'admin') AND user_id = auth.uid());
```

**RLS Note:** The `(SELECT chapter_id FROM lessons WHERE id = lesson_messages.lesson_id)` subquery is a correlated subquery — Postgres evaluates it per row. For acceptable performance at LMS scale (< 50k rows), this is fine. If it becomes a bottleneck, add `lesson_id → course_id` denormalized column to `lesson_messages`.

### Supabase Realtime Integration
```typescript
// src/lib/api/lesson-messages.ts
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface LessonMessage {
  id: string
  lesson_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  profile?: { full_name: string; role: string }
}

export function subscribeToLessonMessages(
  lessonId: string,
  onMessage: (msg: LessonMessage) => void
): RealtimeChannel {
  return supabase
    .channel(`lesson_messages:${lessonId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'lesson_messages',
        filter: `lesson_id=eq.${lessonId}`,
      },
      (payload) => onMessage(payload.new as LessonMessage)
    )
    .subscribe()
}
```

**Realtime Consideration:** Supabase Realtime `postgres_changes` with row-level filter (`lesson_id=eq.X`) works but the filter is applied server-side on the Realtime server, not as a DB-level RLS filter. RLS still applies — a student not enrolled will not receive the event. Use `channel.unsubscribe()` in `useEffect` cleanup to avoid memory leaks.

**Important:** Supabase Realtime must be enabled for the `lesson_messages` table in Dashboard → Database → Replication. Add `lesson_messages` to the publication.

### New Component
```
src/components/student/LessonChat.tsx   — message list + input box, uses subscribeToLessonMessages
```

### Modified Component
`src/components/student/LessonContent.tsx` → refactor to 3-tab layout:
```
Tab 1: Video + Description (current content)
Tab 2: Chấm bài (existing SubmissionArea, moved here)
Tab 3: Chat (new LessonChat component)
```

### Data Flow
```
LessonContent renders tab "Chat"
    ↓
LessonChat mounts → fetchLessonMessages(lessonId) [initial load via TanStack Query]
    ↓
subscribeToLessonMessages(lessonId) → RealtimeChannel.subscribe()
    ↓
New message arrives via INSERT → onMessage callback → append to local state
    ↓
User sends message → insertLessonMessage({lesson_id, user_id, content})
    ↓ (own message appears optimistically or via Realtime)
On unmount: channel.unsubscribe()
```

---

## Feature 2: Mock Exam System

### New Tables
```sql
CREATE TABLE exam_sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  type       text NOT NULL CHECK (type IN ('monthly', 'quarterly')),
  start_at   timestamptz NOT NULL,
  end_at     timestamptz NOT NULL,
  is_active  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE exam_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  content     text NOT NULL,           -- question text (markdown OK)
  answer_key  text NOT NULL,           -- correct answer (stored encrypted or hashed for production; plain text for v3 MVP)
  points      numeric(5,2) NOT NULL DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX exam_questions_session_id_idx ON exam_questions(session_id);

CREATE TABLE exam_submissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers      jsonb NOT NULL DEFAULT '{}', -- {question_id: answer_text}
  score        numeric(5,2),
  submitted_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id)             -- one submission per student per exam
);
CREATE INDEX exam_submissions_session_id_idx ON exam_submissions(session_id);
CREATE INDEX exam_submissions_user_id_idx ON exam_submissions(user_id);
```

### RLS Policies
```sql
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

-- exam_sessions: public read when active (students browse available exams)
CREATE POLICY "anyone_read_active_exam_sessions"
  ON exam_sessions FOR SELECT
  USING (is_active = true AND is_approved_user());

CREATE POLICY "admin_all_exam_sessions"
  ON exam_sessions FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- exam_questions: students see questions only when exam is active and in window
-- CRITICAL: answer_key must NOT be exposed to students via this policy
-- Solution: create a view that excludes answer_key for student reads
CREATE POLICY "student_read_exam_questions"
  ON exam_questions FOR SELECT
  USING (
    is_approved_user() AND
    EXISTS (
      SELECT 1 FROM exam_sessions s
      WHERE s.id = exam_questions.session_id
        AND s.is_active = true
        AND now() BETWEEN s.start_at AND s.end_at
    )
  );

CREATE POLICY "admin_all_exam_questions"
  ON exam_questions FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- exam_submissions: students manage own, admin sees all
CREATE POLICY "student_own_exam_submissions"
  ON exam_submissions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    is_approved_user() AND
    -- Enforce time window on INSERT
    EXISTS (
      SELECT 1 FROM exam_sessions s
      WHERE s.id = exam_submissions.session_id
        AND s.is_active = true
        AND now() BETWEEN s.start_at AND s.end_at
    )
  );

CREATE POLICY "admin_all_exam_submissions"
  ON exam_submissions FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
```

**Answer Key Security:** The `answer_key` column MUST NOT reach the browser before submission. Two safe approaches:
1. **Server-side grading via RPC:** Student submits answers → `CALL grade_exam_submission(submission_id)` → DB function compares answers to answer_key and sets score. Student never sees answer_key column.
2. **Hashed answers:** Store `md5(lower(trim(answer_key)))` and hash student answers client-side before comparing. Simple for multiple choice; not suitable for free text.

**Recommended for v3:** Server-side RPC grading. The RLS policy on `exam_questions` can be a view that excludes `answer_key`:
```sql
CREATE VIEW exam_questions_public AS
  SELECT id, session_id, content, points, order_index, created_at
  FROM exam_questions;
-- Grant SELECT on the view to authenticated; revoke direct SELECT on exam_questions
```

### Auto-Grading RPC
```sql
CREATE OR REPLACE FUNCTION grade_exam_submission(p_submission_id uuid)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_session_id uuid;
  v_answers jsonb;
  v_total numeric := 0;
  v_earned numeric := 0;
  rec RECORD;
BEGIN
  SELECT session_id, answers INTO v_session_id, v_answers
  FROM exam_submissions WHERE id = p_submission_id AND user_id = auth.uid();

  FOR rec IN SELECT id, answer_key, points FROM exam_questions WHERE session_id = v_session_id LOOP
    v_total := v_total + rec.points;
    IF lower(trim(v_answers ->> rec.id::text)) = lower(trim(rec.answer_key)) THEN
      v_earned := v_earned + rec.points;
    END IF;
  END LOOP;

  UPDATE exam_submissions
  SET score = v_earned, submitted_at = now()
  WHERE id = p_submission_id;

  RETURN v_earned;
END;
$$;
```

### New Routes
```
/thi-thu                     — StudentExamListPage (list active/upcoming exams)
/thi-thu/:sessionId          — StudentExamTakingPage (time-bounded exam form)
/thi-thu/:sessionId/ket-qua  — StudentExamResultPage (show score after submit)
/quan-tri/thi-thu            — AdminExamListPage
/quan-tri/thi-thu/tao        — AdminExamCreatePage
/quan-tri/thi-thu/:sessionId — AdminExamDetailPage (manage questions, results)
```

### New API Files
```
src/lib/api/exam-sessions.ts
src/lib/api/exam-questions.ts   — fetchExamQuestions (uses _public view)
src/lib/api/exam-submissions.ts — createExamSubmission, gradeExamSubmission (calls RPC)
```

---

## Feature 3: Study Materials

### New Table
```sql
CREATE TABLE study_materials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  category    text NOT NULL CHECK (category IN ('midterm', 'final', 'entrance', 'hsg', 'specialized', 'top4')),
  grade       smallint CHECK (grade IN (7, 8, 9)),  -- null = all grades
  file_path   text NOT NULL,   -- path in 'materials' storage bucket
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX study_materials_category_idx ON study_materials(category);
CREATE INDEX study_materials_grade_idx ON study_materials(grade);
```

### Storage Bucket
```sql
-- Public read bucket (materials are freely accessible to authenticated users)
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- Admin can upload
CREATE POLICY "admin_upload_materials"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'materials' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Anyone authenticated can read (or make bucket fully public for anon access)
CREATE POLICY "authenticated_read_materials"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'materials');
```

### RLS Policies
```sql
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

-- Any approved user can read study materials
CREATE POLICY "approved_users_read_materials"
  ON study_materials FOR SELECT
  USING (is_approved_user());

-- Unauthenticated users can browse material metadata (optional: for landing page teaser)
-- Only if you want public visibility — otherwise restrict to authenticated
CREATE POLICY "admin_all_materials"
  ON study_materials FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
```

### New Routes
```
/tai-lieu                    — StudentMaterialsPage (filterable by grade + category)
/quan-tri/tai-lieu           — AdminMaterialsPage
```

### LessonContent Tab Integration
The "Tài liệu+Kiểm tra" tab in `LessonContent` should show:
- Study materials filtered by the current course's `target_grade`
- Any `exam_sessions` that are currently active

```typescript
// In LessonContent tab 3:
// - fetchStudyMaterials({ grade: course.target_grade }) — already have courseId from props
// - fetchActiveExamSessions() — sessions where is_active=true and now() in window
```

---

## Feature 4: Pricing + Access Control

### Critical Build Order Note
**This feature MUST be built first** among the data-model features. The `lessons` RLS policy may need updating, and all other features assume the access model is settled.

**Decision: Keep enrollment-based access, add `package_id` as metadata only.**
- Admin creates a package → assigns courses to it
- When enrolling a student, admin selects a package → the UI auto-creates individual course enrollments for all courses in that package
- `enrollments.package_id` records which package triggered the enrollment (for audit/cancel/display)
- **Lesson RLS stays unchanged** — access is still determined by `enrollments` table
- This avoids a complex RLS change and keeps the existing lesson access check working

### New Tables
```sql
CREATE TABLE packages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  price_vnd   integer NOT NULL,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE package_courses (
  package_id  uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, course_id)
);
```

### Modify Enrollments Table
```sql
ALTER TABLE enrollments ADD COLUMN package_id uuid REFERENCES packages(id) ON DELETE SET NULL;
```

### RLS Policies
```sql
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_courses ENABLE ROW LEVEL SECURITY;

-- Anyone can read active packages (pricing page is public/semi-public)
CREATE POLICY "public_read_active_packages"
  ON packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin_all_packages"
  ON packages FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- package_courses: same visibility as packages
CREATE POLICY "public_read_package_courses"
  ON package_courses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM packages WHERE id = package_courses.package_id AND is_active = true)
  );

CREATE POLICY "admin_all_package_courses"
  ON package_courses FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
```

### Enrollment API Update
```typescript
// src/lib/api/enrollments.ts — new function
export async function addEnrollmentWithPackage(
  userId: string,
  packageId: string
): Promise<Enrollment[]> {
  // 1. Fetch all courses in the package
  const { data: pkgCourses } = await supabase
    .from('package_courses')
    .select('course_id')
    .eq('package_id', packageId)

  // 2. Insert one enrollment per course
  const enrollments = pkgCourses!.map(pc => ({
    user_id: userId,
    course_id: pc.course_id,
    package_id: packageId,
  }))

  const { data, error } = await supabase
    .from('enrollments')
    .insert(enrollments)
    .select()
  if (error) throw error
  return data as Enrollment[]
}
```

### New Routes
```
/bang-gia                    — PricingPage (public, landing-style page)
/quan-tri/goi-hoc            — AdminPackagesPage (CRUD packages + assign courses)
```

### Modified Component
`UsersPage.tsx` or `UserEnrollmentDialog.tsx` → add package selector when enrolling a student

---

## Feature 5: School Navigator

### Architecture
Pure frontend component. No DB. No new routes.

### New Component
```
src/components/landing/SchoolNavigator.tsx
```

### Static Data Structure
```typescript
// src/lib/constants/schools.ts
export interface School {
  name: string        // "PTNK", "Chuyên Lê Hồng Phong", etc.
  slug: string        // course slug to navigate to
  grade?: number      // optional: highlight grade 9 prep courses
}

export const SCHOOL_NAVIGATOR_DATA: School[] = [
  { name: 'PTNK', slug: 'on-chuyen-toan-ptnk' },
  { name: 'Chuyên Nguyễn Thượng Hiền', slug: 'on-chuyen-toan-nguyen-thuong-hien' },
  // ...
]
```

### Integration with Index.tsx
Add `<SchoolNavigator />` section in the landing page after the courses overview section. The component renders a grid/list of school buttons; clicking navigates to `/danh-muc` or `/khoa-hoc/:courseSlug`.

---

## Feature 6: Admin Full-Page Forms

### New Routes
```typescript
// In App.tsx — add inside admin ProtectedRoute block:
<Route
  path="/quan-tri/khoa-hoc/:courseSlug/them-chuyen-de"
  element={<ProtectedRoute requiredRole="admin">...<AddChapterPage />...</ProtectedRoute>}
/>
<Route
  path="/quan-tri/khoa-hoc/:courseSlug/chuyen-de/:chapterSlug/them-bai-giang"
  element={<ProtectedRoute requiredRole="admin">...<AddLessonPage />...</ProtectedRoute>}
/>
```

### New Pages
```
src/pages/admin/AddChapterPage.tsx   — form extracted from ChaptersPage modal
src/pages/admin/AddLessonPage.tsx    — form extracted from LessonsPage modal
```

### Implementation Pattern
Both pages should:
1. Read `:courseSlug` / `:chapterSlug` from `useParams()`
2. Re-use the existing form validation logic (currently inside dialog components in ChaptersPage / LessonsPage)
3. On submit → `insertChapter()` / `insertLesson()` → navigate back to parent page with `useNavigate()`
4. Re-use the existing shadcn/ui form + Zod validation

**Modification needed:** Extract form logic from `ChaptersPage.tsx` dialog into a standalone `ChapterForm.tsx` component, usable both in the dialog (for backwards compat) and the new page.

---

## Feature 7: YouTube Privacy

### No new tables or routes.

### Changes Required

**`src/components/student/LessonContent.tsx` iframe:**
```typescript
// Change embed domain from youtube.com to youtube-nocookie.com
// Add privacy-enhancing params
const embedUrl = lesson.video_url?.replace(
  'youtube.com/embed/',
  'youtube-nocookie.com/embed/'
) + '?rel=0&modestbranding=1&iv_load_policy=3'
```

**`vercel.json` — add Referer-Policy header:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Referrer-Policy", "value": "strict-origin" }
      ]
    }
  ]
}
```

**Note on `strict-origin`:** With `Referrer-Policy: strict-origin`, the browser sends only the origin (e.g., `https://bumath.vn`) as the referrer, not the full path. YouTube can check this to restrict embedding to known domains if you configure it in YouTube Studio → Advanced Settings → Embedding. This is the practical approach short of self-hosting.

**`src/lib/youtube.ts` — update URL transformer:**
Verify existing `src/lib/youtube.ts` transforms embed URLs to use `youtube-nocookie.com`. If not, add the transform there.

---

## Updated System Architecture Diagram (v3.0)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     React SPA (Vite + TypeScript)                        │
│                                                                           │
│  Public Routes         Student Routes        Admin/Teacher Routes        │
│  /                     /khoa-hoc             /quan-tri/nguoi-dung        │
│  /bang-gia             /khoa-hoc/:slug        /quan-tri/khoa-hoc         │
│  /tai-lieu (semi-pub)  /danh-muc             /quan-tri/bai-nop           │
│  /thi-thu (listing)    /thi-thu/:id          /quan-tri/thi-thu           │
│                                              /quan-tri/tai-lieu          │
│                                              /quan-tri/goi-hoc           │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │            AuthContext (useAuth) + ProtectedRoute                  │  │
│  └──────────────────────────────┬─────────────────────────────────────┘  │
│                                 │                                         │
│  ┌──────────────────────────────▼─────────────────────────────────────┐  │
│  │                   TanStack Query (server state)                     │  │
│  │   queryKey patterns: ['lessons', lessonId], ['exam', sessionId]    │  │
│  └──────────────────────────────┬─────────────────────────────────────┘  │
│                                 │                                         │
│  ┌────────────────────┐  ┌──────▼──────────┐  ┌────────────────────────┐ │
│  │  src/lib/api/*.ts  │  │ supabase.ts     │  │  Realtime Channel      │ │
│  │  (one file/domain) │  │ (singleton)     │  │  lesson_messages       │ │
│  └────────────────────┘  └──────┬──────────┘  └────────────────────────┘ │
└─────────────────────────────────┼───────────────────────────────────────-┘
                                  │ HTTPS + WSS (Realtime)
┌─────────────────────────────────▼────────────────────────────────────────┐
│                         Supabase Platform                                 │
│                                                                           │
│  Auth         PostgreSQL + RLS         Storage            Realtime       │
│               profiles                 submissions (private)  lesson_    │
│               courses/chapters/lessons materials (public)   messages    │
│               enrollments              assignments (public)              │
│               lesson_progress                                            │
│               submissions                                                │
│               lesson_messages          ← NEW                            │
│               exam_sessions            ← NEW                            │
│               exam_questions           ← NEW                            │
│               exam_submissions         ← NEW                            │
│               study_materials          ← NEW                            │
│               packages                 ← NEW                            │
│               package_courses          ← NEW                            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries: New vs Modified

### New Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `LessonChat` | `src/components/student/LessonChat.tsx` | Realtime message list + send input |
| `SchoolNavigator` | `src/components/landing/SchoolNavigator.tsx` | School → course slug mapper |
| `ExamTimer` | `src/components/student/ExamTimer.tsx` | Countdown for exam time window |
| `MaterialCard` | `src/components/student/MaterialCard.tsx` | File download card with category badge |

### New Pages
| Page | Route | Purpose |
|------|-------|---------|
| `StudentExamListPage` | `/thi-thu` | List available exams |
| `StudentExamTakingPage` | `/thi-thu/:sessionId` | Timed exam form |
| `StudentExamResultPage` | `/thi-thu/:sessionId/ket-qua` | Score + answer review |
| `StudentMaterialsPage` | `/tai-lieu` | Filterable materials browser |
| `PricingPage` | `/bang-gia` | Package pricing display |
| `AddChapterPage` | `/quan-tri/khoa-hoc/:slug/them-chuyen-de` | Full-page chapter form |
| `AddLessonPage` | `/quan-tri/khoa-hoc/:slug/chuyen-de/:chSlug/them-bai-giang` | Full-page lesson form |
| `AdminExamListPage` | `/quan-tri/thi-thu` | Admin exam management |
| `AdminMaterialsPage` | `/quan-tri/tai-lieu` | Admin material upload/manage |
| `AdminPackagesPage` | `/quan-tri/goi-hoc` | Package CRUD |

### Modified Components
| Component | Change |
|-----------|--------|
| `LessonContent.tsx` | Refactor to 3-tab layout (Video+Desc / Chấm bài / Chat) |
| `App.tsx` | Add 8 new routes |
| `vercel.json` | Add Referrer-Policy header |
| `UsersPage.tsx` / `UserEnrollmentDialog.tsx` | Add package selector |
| `AdminLayout.tsx` | Add sidebar links for new admin pages |
| `src/lib/youtube.ts` | Enforce `youtube-nocookie.com` domain |
| `enrollments.ts` | Add `addEnrollmentWithPackage()` function |

### New API Files
| File | Functions |
|------|-----------|
| `src/lib/api/lesson-messages.ts` | `fetchLessonMessages`, `insertLessonMessage`, `subscribeToLessonMessages` |
| `src/lib/api/exam-sessions.ts` | `fetchActiveExamSessions`, `fetchExamSessionById`, admin CRUD |
| `src/lib/api/exam-questions.ts` | `fetchExamQuestions` (uses `_public` view) |
| `src/lib/api/exam-submissions.ts` | `createExamSubmission`, `gradeExamSubmission` (calls RPC) |
| `src/lib/api/study-materials.ts` | `fetchStudyMaterials`, `insertStudyMaterial`, `deleteStudyMaterial` |
| `src/lib/api/packages.ts` | `fetchPackages`, `fetchPackageWithCourses`, admin CRUD |

---

## Suggested Build Order

Dependencies determine order. Access control before content features.

```
Phase 1: Pricing + Access Control (packages, package_courses, enrollments.package_id)
  └─ Reason: No lesson content changes, but establishes data model used by enrollment UI.
             Build now, even if PricingPage is placeholder. Admin can start assigning packages.

Phase 2: Study Materials (study_materials table + storage bucket + pages)
  └─ Reason: Independent feature, no deps on phases 3-6. Quick win with real value.
             The "Tài liệu+Kiểm tra" tab in LessonContent can reference this.

Phase 3: LessonContent Tab Refactor (modify LessonContent.tsx to 3-tab layout)
  └─ Reason: Must happen before Chat and Materials-in-tab features. Both depend on this
             structural change. Do the tab layout first with existing content moved.

Phase 4: In-Lesson Chat (lesson_messages + Realtime + LessonChat component)
  └─ Reason: Depends on Phase 3 tab layout. Realtime requires careful testing.
             Enable Realtime on lesson_messages in Supabase Dashboard.

Phase 5: Mock Exam System (exam tables + pages + grading RPC)
  └─ Reason: Independent of other features. Large feature — own phase.
             Answer key security (view-based access) is critical before launch.

Phase 6: Admin Full-Page Forms (AddChapterPage, AddLessonPage)
  └─ Reason: Pure frontend refactor. Low risk. Can go anytime but benefits from
             stable routing structure (all new routes established by phases 1-5).

Phase 7: School Navigator + YouTube Privacy + Landing Page + Audit
  └─ Reason: All are frontend-only changes with zero DB impact.
             Group together as the "polish" phase.
```

---

## RLS Safety Checklist

All new policies follow the established safe pattern:

| Rule | Applied Where |
|------|--------------|
| Use `get_my_role()` (SECURITY DEFINER) instead of querying `profiles` directly in policy | All new policies |
| Use `is_approved_user()` for student-facing content | `lesson_messages`, `exam_sessions`, `study_materials`, `exam_submissions` |
| `WITH CHECK` on INSERT policies to prevent spoofing `user_id` | `lesson_messages`, `exam_submissions` |
| Time-window enforcement in WITH CHECK for exam submissions | `exam_submissions` insert policy |
| `answer_key` never exposed to student role | `exam_questions` view + policy |
| Admin policies use both `USING` and `WITH CHECK` | All admin-all policies |

### ⚠️ RLS Pitfall: Infinite Recursion
**Never** write a policy on any table that `SELECT`s from `profiles` directly (without SECURITY DEFINER wrapper). The existing `get_my_role()` and `is_admin()` functions are already SECURITY DEFINER. All v3.0 policies use these helpers — do not inline `SELECT role FROM profiles WHERE id = auth.uid()` directly in a policy body.

---

## Supabase Realtime: Feasibility Assessment

**Verdict: FEASIBLE with caveats.**

**What works:**
- `postgres_changes` subscriptions on `lesson_messages` table with `lesson_id` filter
- RLS applies — student sees only their enrolled lessons' messages
- Channel cleanup via `channel.unsubscribe()` in `useEffect` return

**What to watch:**
- **Realtime must be enabled** for the `lesson_messages` table in Supabase Dashboard → Database → Replication → supabase_realtime publication. `ALTER TABLE lesson_messages REPLICA IDENTITY FULL;` is required.
- **Connection limits:** Supabase free tier = 200 concurrent Realtime connections. For a small-scale LMS this is fine. Pro tier = 500+.
- **Filter granularity:** The `filter: 'lesson_id=eq.X'` param reduces client-side noise but is broadcast from the server to matching subscribers. It is NOT a DB-level security gate — RLS remains the security gate.
- **Stale subscriptions:** If a student has two browser tabs open on the same lesson, they get two subscriptions. Handle with `channel.unsubscribe()` in cleanup and avoid duplicate state appends (check by `id` before appending).

**Channel pattern (production-safe):**
```typescript
useEffect(() => {
  if (!lessonId) return
  const channel = subscribeToLessonMessages(lessonId, (msg) => {
    setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
  })
  return () => { supabase.removeChannel(channel) }
}, [lessonId])
```

---

## Sources

- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security — HIGH confidence
- Supabase Realtime docs: https://supabase.com/docs/guides/realtime/postgres-changes — HIGH confidence
- Supabase Storage: https://supabase.com/docs/guides/storage/security/access-control — HIGH confidence
- Codebase inspection of all migration files + src/lib/api/*.ts — HIGH confidence
- Supabase RLS performance: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv — HIGH confidence

---

*v3.0 architecture updated: 2026-05-03*
