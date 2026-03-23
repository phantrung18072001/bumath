# Architecture Research

**Domain:** Supabase-backed LMS — React SPA with 3-role auth (student/teacher/admin)
**Researched:** 2026-03-23
**Confidence:** HIGH (Supabase official docs), MEDIUM (integration patterns from verified community sources)

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
