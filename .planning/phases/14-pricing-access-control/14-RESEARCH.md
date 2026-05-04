# Phase 14: Pricing + Access Control — Research

**Researched:** 2026-05-04
**Domain:** Supabase RLS / PostgreSQL column masking / TanStack Query CRUD patterns
**Confidence:** HIGH (all findings verified from codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Admin-configurable grades per package — admin selects one or more `target_grade` values via UI. Not hardcoded.
- **D-02:** Student can own multiple packages. Access = union of all grade coverage.
- **D-03:** `price_vnd` stored in DB, display-only. No payment gateway.
- **D-04:** Schema: `packages(id,name,description,price_vnd,created_at)`, `package_grades(package_id,grade)`, `user_packages(id,user_id,package_id,assigned_at,assigned_by)`
- **D-05:** Column-level security on `lessons.video_url` — returns NULL for unauthorized student. Student still sees title/description.
- **D-06:** Helper function `has_grade_access(grade target_grade)` — SECURITY DEFINER, checks `user_packages JOIN package_grades`.
- **D-07:** RLS checks `user_packages` directly, not `enrollments`.
- **D-08:** `enrollments` table kept for `/khoa-hoc` listing UI. Trigger creates enrollments on package assign.
- **D-09:** Trigger: INSERT on `user_packages` → auto-INSERT enrollments for matching grade courses. DELETE: cascade-delete enrollments on revoke.
- **D-10:** Backfill BEFORE RLS — separate migration files. Existing enrollment records kept.
- **D-11:** `/quan-tri/goi-hoc` — new admin page, CRUD packages. Pattern = CoursesPage.tsx.
- **D-12:** `UserEnrollmentDialog` → replaced by `UserPackageDialog`.
- **D-13:** Admin sidebar: add "Gói học" → `/quan-tri/goi-hoc`.
- **D-14:** `/ho-so` — student profile page with name/email + active packages + grade coverage.
- **D-15:** Header link "Hồ sơ" → `/ho-so` in StudentLayout.
- **D-16:** YouTube: unlisted privacy + `youtube-nocookie.com` embed URL.
- **D-17:** RLS is primary protection layer.
- **D-18:** `vercel.json` add `X-Frame-Options: SAMEORIGIN`.
- **D-19:** Domain restriction (embed only from bumath.vn) → Phase 19.

### Agent's Discretion
- Exact implementation of `has_grade_access()` function (join path, index optimization)
- Order/number of migration files
- Error message for locked lesson (per UI-SPEC: "Bạn chưa có gói học phù hợp" + "Liên hệ giảng viên…")
- Loading/skeleton states for student profile page

### Deferred (OUT OF SCOPE)
- Domain restriction for YouTube embed (Phase 19)
- Pricing on landing page (Phase 19, PRICE-04)
- Package expiry / subscription period (v4)
- Self-service payment gateway (v4+)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PRICE-01 | Admin can create and edit packages (name, price VND, grade coverage) | PackagesPage + PackageFormDialog patterns from CoursesPage + CourseFormDialog |
| PRICE-02 | Admin assigns packages to students (replaces per-course enrollment) | UserPackageDialog replaces UserEnrollmentDialog; new packages API |
| PRICE-03 | Students can only view lessons for grades in their package | `has_grade_access()` + `lessons_view` column masking + locked state in LessonContent |
| PRICE-05 | Students see owned packages in profile page | `/ho-so` route + `getUserPackages()` API + Avatar component (exists) |
| VIDEO-01 | YouTube unlisted, `video_url` RLS-gated, Vercel headers block iframe from other domains | `lessons_view` view + `has_grade_access()` + vercel.json headers section |
</phase_requirements>

---

## Summary

Phase 14 introduces a package-based access control model. Three new DB tables (`packages`, `package_grades`, `user_packages`) replace the manual per-course enrollment workflow. A DB trigger auto-populates `enrollments` when a package is assigned, preserving the existing `/khoa-hoc` listing UI. A new SECURITY DEFINER helper function `has_grade_access()` drives a PostgreSQL security view `lessons_view` that masks `video_url` to NULL for students lacking grade access — enabling the locked lesson state in the frontend without any client-side access logic.

The frontend adds two new pages (`/quan-tri/goi-hoc`, `/ho-so`), replaces one dialog (`UserEnrollmentDialog` → `UserPackageDialog`), and adds three small integration points (AdminLayout nav item, StudentLayout header link, LessonContent locked state). All UI patterns are directly inherited from existing CoursesPage.tsx and UserEnrollmentDialog.tsx.

Three migration files are required in strict order: schema first, backfill second, RLS+trigger+view third.

**Primary recommendation:** Build migrations in strict order (18→19→20). Never backfill and apply RLS in the same migration. The `lessons_view` column masking pattern is the critical DB-side access control that satisfies the "không phải client-side" constraint.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Package CRUD | API / Database | Frontend UI | Data owned in DB; admin UI is thin wrapper |
| Grade access check | Database (RLS + function) | — | Must be server-enforced; function called by RLS policy |
| video_url masking | Database (security view) | — | Must not be client-side; PostgreSQL view with CASE WHEN |
| Enrollment auto-creation | Database (trigger) | — | Must be atomic with package assignment |
| Backfill migration | Database (SQL migration) | — | One-time data transformation before RLS |
| Package assignment UI | Frontend Admin | Database trigger | UI calls INSERT on user_packages; trigger handles cascades |
| Student profile display | Frontend Student | API / Database | Reads user_packages JOIN packages JOIN package_grades |
| Locked lesson UI state | Frontend Student | Database (RLS) | DB returns NULL video_url; frontend renders locked state |
| X-Frame-Options header | CDN / Static (Vercel) | — | vercel.json headers config |

---

## Standard Stack

### Core (Confirmed from codebase)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| React + Vite | 18.x | SPA framework | [VERIFIED: package.json] |
| Supabase JS | 2.x | DB + Auth + RLS client | [VERIFIED: supabase/ directory] |
| TanStack React Query | 5.x | Server state + caching | [VERIFIED: src/components] |
| shadcn/ui | slate preset | Component library | [VERIFIED: components.json] |
| TypeScript | 5.x | Type safety | [VERIFIED: tsconfig.app.json] |
| React Hook Form + Zod | latest | Form validation | [VERIFIED: CourseFormDialog.tsx] |
| Sonner | latest | Toast notifications | [VERIFIED: App.tsx] |
| Lucide React | latest | Icons | [VERIFIED: all components] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Router DOM | 6.x | Client-side routing | `/quan-tri/goi-hoc` and `/ho-so` routes |
| `@radix-ui/react-checkbox` | latest | Checkbox (for grade multi-select) | PackageFormDialog grade selection |

### Avatar component
- `src/components/ui/avatar.tsx` — **ALREADY EXISTS** [VERIFIED: file found]. No yarn add needed.

---

## Schema Design

### `packages` table
```sql
CREATE TABLE public.packages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  price_vnd   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX packages_name_idx ON packages(name);
```

### `package_grades` table (junction)
```sql
CREATE TABLE public.package_grades (
  package_id  uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  grade       text NOT NULL CHECK (grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced')),
  PRIMARY KEY (package_id, grade)
);

CREATE INDEX package_grades_grade_idx ON package_grades(grade);
```
**Note:** Composite PK `(package_id, grade)` is also the unique constraint — no separate UNIQUE needed.

### `user_packages` table
```sql
CREATE TABLE public.user_packages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id  uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, package_id)
);

CREATE INDEX user_packages_user_id_idx ON user_packages(user_id);
CREATE INDEX user_packages_package_id_idx ON user_packages(package_id);
```
**UNIQUE constraint on `(user_id, package_id)`** — prevents duplicate assignments and enables `ON CONFLICT DO NOTHING` in backfill and trigger.

### Existing tables (reference, no changes to schema)
- `lessons.video_url text` — currently a plain nullable column [VERIFIED: 03_course_management_schema.sql]
- `enrollments(id, user_id, course_id, enrolled_at, UNIQUE(user_id, course_id))` [VERIFIED: 03_course_management_schema.sql]
- `courses.target_grade text CHECK (grade_7|grade_8|grade_9|advanced)` [VERIFIED]

---

## RLS Architecture

### Why Column Masking Needs a View

PostgreSQL RLS controls **row** visibility, not column values. To return a row with `video_url = NULL` for unauthorized students (while still returning the row so the frontend can show the locked state), a **PostgreSQL security view** is required.

**The approach:** Create `public.lessons_view` using `security_invoker = true` and `security_barrier = true`. The view uses a CASE WHEN expression to mask `video_url`. The underlying `lessons` table RLS still applies through the view.

### `lessons_view` — Column-masking security view

```sql
CREATE OR REPLACE VIEW public.lessons_view
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  l.id,
  l.chapter_id,
  l.title,
  l.description,
  l.assignment_path,
  l.order_index,
  l.created_at,
  l.updated_at,
  CASE
    WHEN get_my_role() IN ('admin', 'teacher') THEN l.video_url
    WHEN has_grade_access(c.target_grade)      THEN l.video_url
    ELSE NULL
  END AS video_url
FROM public.lessons l
JOIN public.chapters ch ON ch.id = l.chapter_id
JOIN public.courses  c  ON c.id  = ch.course_id;

GRANT SELECT ON public.lessons_view TO authenticated;
```

**Key properties:**
- `security_invoker = true`: View runs with the **caller's** RLS identity — underlying `lessons` table RLS is enforced
- `security_barrier = true`: Prevents query planner from pushing caller-side WHERE clauses past the view's security predicates
- JOINs to `chapters` and `courses` are needed to reach `c.target_grade` for the CASE expression
- Admin/teacher: always get `video_url`
- Student with package: `has_grade_access(grade)` returns true → gets `video_url`
- Student without package: gets `NULL` → frontend shows locked state

**Frontend change (minimal):** `fetchLessons()` in `src/lib/api/lessons.ts` changes `from('lessons')` → `from('lessons_view')` for the read path. INSERT/UPDATE/DELETE functions keep using `from('lessons')` (views are read-only for complex JOINs).

### RLS on `packages`, `package_grades`, `user_packages`

```sql
-- packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_packages" ON public.packages
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "authenticated_read_packages" ON public.packages
  FOR SELECT TO authenticated
  USING (true);  -- All logged-in users can list packages (for UserPackageDialog dropdown)

-- package_grades
ALTER TABLE public.package_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_package_grades" ON public.package_grades
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "authenticated_read_package_grades" ON public.package_grades
  FOR SELECT TO authenticated
  USING (true);

-- user_packages
ALTER TABLE public.user_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_user_packages" ON public.user_packages
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "student_read_own_user_packages" ON public.user_packages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

### Existing `lessons` RLS — Keep as-is for row access

The existing policy `student_read_enrolled_lessons` continues to control ROW visibility (enrolled students can see lesson rows). The view adds column masking on top. **Do not change existing lessons policies** — the trigger maintains enrollments so row access still works via the existing enrollment-based policy.

---

## `has_grade_access()` Function

```sql
CREATE OR REPLACE FUNCTION public.has_grade_access(target_grade text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_packages up
    JOIN package_grades pg ON pg.package_id = up.package_id
    WHERE up.user_id = auth.uid()
      AND pg.grade = target_grade
  )
$$;
```

**Properties:**
- `SECURITY DEFINER` — runs as function owner (bypasses RLS on `user_packages` and `package_grades`), consistent with `get_my_role()` pattern [VERIFIED: 16_profiles_rls.sql]
- `STABLE` — result doesn't change within a single query execution; safe for RLS
- `SET search_path = public` — prevents search_path injection attack [ASSUMED: security best practice]
- Join path: `auth.uid()` → `user_packages.user_id` → `user_packages.package_id` → `package_grades.package_id` → `package_grades.grade`
- Returns `boolean` — fits cleanly in CASE WHEN expression in the view

**Index coverage:** Both `user_packages(user_id)` and `package_grades(grade)` are indexed (see schema above), so this function is efficient even with many records.

---

## DB Trigger — Auto-Enrollment

### INSERT trigger (package assigned → create enrollments)

```sql
CREATE OR REPLACE FUNCTION public.create_enrollments_for_package()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.enrollments (user_id, course_id)
  SELECT NEW.user_id, c.id
  FROM public.package_grades pg
  JOIN public.courses c ON c.target_grade = pg.grade
  WHERE pg.package_id = NEW.package_id
  ON CONFLICT (user_id, course_id) DO NOTHING;  -- Idempotent: existing enrollments untouched

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_enrollments_on_package_assign
  AFTER INSERT ON public.user_packages
  FOR EACH ROW EXECUTE FUNCTION public.create_enrollments_for_package();
```

**Behavior:** On every `user_packages` INSERT, inserts one enrollment per course that matches the package's grade coverage. `ON CONFLICT DO NOTHING` makes it safe to run multiple times (idempotent) — critical for backfill.

### DELETE trigger (package revoked → remove enrollments)

The delete trigger must handle D-02 (student can own multiple packages): only remove enrollments that are no longer covered by ANY other package the student owns.

```sql
CREATE OR REPLACE FUNCTION public.remove_enrollments_for_package()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.enrollments e
  WHERE e.user_id = OLD.user_id
    AND e.course_id IN (
      -- Courses covered by the revoked package's grade
      SELECT c.id
      FROM public.package_grades pg
      JOIN public.courses c ON c.target_grade = pg.grade
      WHERE pg.package_id = OLD.package_id
    )
    AND NOT EXISTS (
      -- Keep enrollment if another active package also covers this course's grade
      SELECT 1
      FROM public.user_packages up2
      JOIN public.package_grades pg2 ON pg2.package_id = up2.package_id
      JOIN public.courses c2 ON c2.id = e.course_id
      WHERE up2.user_id = OLD.user_id
        AND up2.id != OLD.id   -- exclude the just-deleted row (already gone at AFTER DELETE)
        AND pg2.grade = c2.target_grade
    );

  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_remove_enrollments_on_package_revoke
  AFTER DELETE ON public.user_packages
  FOR EACH ROW EXECUTE FUNCTION public.remove_enrollments_for_package();
```

**AFTER DELETE note:** At `AFTER DELETE` trigger time, `OLD.id` is already removed from `user_packages`, so the `up2.id != OLD.id` guard is strictly speaking unnecessary but kept for clarity.

---

## Migration Plan

Three files in strict execution order:

### File 1 — `20260504_18_packages_schema.sql`
**Run FIRST.** Creates tables and indexes. No RLS, no triggers yet (safe to run first — no dependencies).

Content summary:
- `CREATE TABLE packages` with indexes
- `CREATE TABLE package_grades` with indexes
- `CREATE TABLE user_packages` with indexes
- Enable RLS on all three tables
- RLS policies (admin full access + authenticated read)
- **Do NOT include** trigger, `has_grade_access`, or view here

### File 2 — `20260504_19_backfill_user_packages.sql`
**Run SECOND, before File 3.** Backfills `user_packages` from existing `enrollments`. **Must run before RLS migration** because once RLS applies lesson masking, backfill data must already exist.

Content summary:
- Create 4 legacy packages (Lớp 7/8/9/Ôn chuyên) + their `package_grades`
- Populate `user_packages` from existing enrollments (see Backfill Strategy section)
- No trigger, no view, no RLS changes

### File 3 — `20260504_20_packages_rls_trigger.sql`
**Run THIRD (last).** Activates the access control.

Content summary:
- `CREATE OR REPLACE FUNCTION has_grade_access()`
- `CREATE TRIGGER` for INSERT on `user_packages` (auto-enroll)
- `CREATE TRIGGER` for DELETE on `user_packages` (remove enrollments)
- `CREATE VIEW lessons_view` with column masking
- `GRANT SELECT ON lessons_view TO authenticated`
- Optionally: update existing `student_read_enrolled_lessons` policy comment to reflect new access model

---

## Backfill Strategy

Goal: For every student with existing enrollments, create `user_packages` records that cover the same grades, so that after RLS is applied their access is preserved.

```sql
-- ============================================================
-- Step 1: Create one legacy package per grade
-- ============================================================
INSERT INTO public.packages (name, description, price_vnd)
VALUES
  ('Lớp 7 (Legacy)',    'Gói chuyển đổi từ hệ thống cũ — Lớp 7',    0),
  ('Lớp 8 (Legacy)',    'Gói chuyển đổi từ hệ thống cũ — Lớp 8',    0),
  ('Lớp 9 (Legacy)',    'Gói chuyển đổi từ hệ thống cũ — Lớp 9',    0),
  ('Ôn chuyên (Legacy)','Gói chuyển đổi từ hệ thống cũ — Ôn chuyên',0);
-- No ON CONFLICT needed — these names are unique on first run

-- ============================================================
-- Step 2: Associate grades with legacy packages
-- ============================================================
INSERT INTO public.package_grades (package_id, grade)
SELECT p.id,
  CASE p.name
    WHEN 'Lớp 7 (Legacy)'     THEN 'grade_7'
    WHEN 'Lớp 8 (Legacy)'     THEN 'grade_8'
    WHEN 'Lớp 9 (Legacy)'     THEN 'grade_9'
    WHEN 'Ôn chuyên (Legacy)' THEN 'advanced'
  END
FROM public.packages p
WHERE p.name IN ('Lớp 7 (Legacy)', 'Lớp 8 (Legacy)', 'Lớp 9 (Legacy)', 'Ôn chuyên (Legacy)');

-- ============================================================
-- Step 3: Populate user_packages from existing enrollments
-- For each student, for each distinct grade they're enrolled in,
-- create one user_packages record pointing to the legacy package.
-- ============================================================
INSERT INTO public.user_packages (user_id, package_id)
SELECT DISTINCT
  e.user_id,
  p.id AS package_id
FROM public.enrollments e
JOIN public.courses c ON c.id = e.course_id
JOIN public.package_grades pg ON pg.grade = c.target_grade
JOIN public.packages p ON p.id = pg.package_id
WHERE p.name IN ('Lớp 7 (Legacy)', 'Lớp 8 (Legacy)', 'Lớp 9 (Legacy)', 'Ôn chuyên (Legacy)')
ON CONFLICT (user_id, package_id) DO NOTHING;

-- ============================================================
-- Verification query (run after to confirm backfill)
-- ============================================================
-- SELECT u.email, p.name, array_agg(pg.grade)
-- FROM user_packages up
-- JOIN auth.users u ON u.id = up.user_id
-- JOIN packages p ON p.id = up.package_id
-- JOIN package_grades pg ON pg.package_id = p.id
-- GROUP BY u.email, p.name
-- ORDER BY u.email;
```

**Why no `ON CONFLICT` in Step 1:** The backfill file runs only once on a clean DB (no legacy packages exist yet). If re-run, Step 1 INSERT would fail on duplicate names. Admin should not re-run this file — or add ON CONFLICT DO NOTHING if desired for safety.

**What happens to existing `enrollments` rows:** They are kept unchanged (D-10). The trigger's `ON CONFLICT DO NOTHING` in File 3 means the trigger won't duplicate them when/if it fires on new inserts.

---

## Frontend Patterns

### From CoursesPage.tsx [VERIFIED: direct code read]

**Query key pattern:**
```typescript
queryKey: ['admin', 'packages', { page, pageSize, search }]
// Mirrors: ['admin', 'courses', { page, pageSize, grade, search }]
```

**Mutation invalidation:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] })
  toast.success('Đã tạo gói học.')
}
```

**Skeleton loading (5 rows):**
```typescript
{Array.from({ length: 5 }).map((_, i) => (
  <Skeleton key={i} className="h-10 w-full rounded-md" />
))}
```

**Empty state with inline CTA:**
```typescript
<p className="text-sm font-semibold text-foreground mb-1">Chưa có gói học nào</p>
<p className="text-sm text-muted-foreground mb-4">Nhấn "Tạo gói học" để bắt đầu.</p>
<Button onClick={handleOpenCreate}>...</Button>
```

**Page header layout:**
```typescript
<div className="container mx-auto px-4 py-8">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-xl font-semibold leading-[1.3]">Quản lý gói học</h1>
    <Button className="min-h-[48px]" onClick={handleOpenCreate}>
      <Plus className="h-4 w-4 mr-1" />
      Tạo gói học
    </Button>
  </div>
```

### From UserEnrollmentDialog.tsx [VERIFIED: direct code read]

**Query key pattern:**
```typescript
queryKey: ['admin', 'user-packages', user?.id]
// Mirrors: ['admin', 'enrollments', user?.id]
```

**Add mutation shape:**
```typescript
const assignMutation = useMutation({
  mutationFn: () => assignPackage(user!.id, selectedPackageId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'user-packages', user?.id] })
    setSelectedPackageId('')
    toast.success('Đã gán gói học cho học sinh.')
  },
  onError: () => {
    toast.error('Gán không thành công. Vui lòng thử lại.')
  },
})
```

**Revoke mutation shape:**
```typescript
const revokeMutation = useMutation({
  mutationFn: (userPackageId: string) => revokePackage(userPackageId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'user-packages', user?.id] })
    toast.success('Đã thu hồi gói học.')
  },
  onError: () => {
    toast.error('Thu hồi không thành công. Vui lòng thử lại.')
  },
})
```

**Dialog max-width:** `max-w-lg` (same as UserEnrollmentDialog)

### PackageFormDialog — multi-grade checkbox pattern

Unlike CourseFormDialog (single Select for grade), PackageFormDialog uses Checkbox for grade selection:

```typescript
const packageSchema = z.object({
  name:        z.string().min(1, 'Tên gói học không được để trống.'),
  description: z.string().optional(),
  price_vnd:   z.number().min(0).int(),
  grades:      z.array(z.enum(['grade_7','grade_8','grade_9','advanced']))
                 .min(1, 'Chọn ít nhất một lớp.'),
})
```

Checkbox group in 2×2 grid using shadcn `<Checkbox>` (already available in `src/components/ui/checkbox.tsx` [VERIFIED]).

### New API file: `src/lib/api/packages.ts`

```typescript
export interface Package {
  id: string
  name: string
  description: string | null
  price_vnd: number
  created_at: string
  grades?: string[]  // joined from package_grades
}

export interface UserPackage {
  id: string
  user_id: string
  package_id: string
  assigned_at: string
  assigned_by: string | null
  package: Pick<Package, 'id' | 'name' | 'price_vnd'>
  grades: string[]  // from package_grades join
}

export async function fetchPackages(): Promise<Package[]>
export async function insertPackage(payload): Promise<Package>
export async function updatePackage(id, payload): Promise<Package>
export async function deletePackage(id): Promise<void>
export async function getUserPackages(userId: string): Promise<UserPackage[]>
export async function assignPackage(userId: string, packageId: string): Promise<UserPackage>
export async function revokePackage(userPackageId: string): Promise<void>
```

Supabase query for `getUserPackages`:
```typescript
supabase
  .from('user_packages')
  .select('id, user_id, package_id, assigned_at, assigned_by, package:packages(id, name, price_vnd, package_grades(grade))')
  .eq('user_id', userId)
  .order('assigned_at', { ascending: false })
```

### lessons.ts change for column masking

Change `fetchLessons(chapterId)` to read from `lessons_view`:
```typescript
// BEFORE:
const { data, error } = await supabase
  .from('lessons')
  .select('*')
  .eq('chapter_id', chapterId)

// AFTER:
const { data, error } = await supabase
  .from('lessons_view')
  .select('*')
  .eq('chapter_id', chapterId)
```

Admin INSERT/UPDATE/DELETE functions (`insertLesson`, `updateLesson`, `deleteLesson`) keep `from('lessons')` — views with JOINs are not updatable.

---

## Component Integration Points

### 1. AdminLayout.tsx — Add sidebar nav item

**File:** `src/components/admin/AdminLayout.tsx`
**Line 1 (imports):** Add `Package` to lucide-react import:
```typescript
import { Users, BookOpen, ClipboardList, Package } from 'lucide-react'
```

**Lines 13–16 (navItems array):** Add after `Quản lý khóa học`, before `Chấm bài`:
```typescript
const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', icon: Users, adminOnly: true },
  { label: 'Quản lý khóa học', to: '/quan-tri/khoa-hoc', icon: BookOpen, adminOnly: true },
  { label: 'Gói học', to: '/quan-tri/goi-hoc', icon: Package, adminOnly: true },  // ← ADD
  { label: 'Chấm bài', to: '/quan-tri/bai-nop', icon: ClipboardList },
]
```

### 2. LessonContent.tsx — Add locked lesson state

**File:** `src/components/student/LessonContent.tsx`
**Current lines 38–48:**
```typescript
{lesson.video_url && (
  <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted">
    <iframe ... />
  </AspectRatio>
)}
```

**Replace with:**
```typescript
{lesson.video_url ? (
  <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted">
    <iframe
      src={lesson.video_url}
      title={`Video bài học: ${lesson.title}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full border-0"
    />
  </AspectRatio>
) : (
  <AspectRatio ratio={16 / 9}>
    <div className="rounded-lg bg-muted flex flex-col items-center justify-center h-full py-16 px-8 text-center">
      <Lock className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-base font-semibold text-foreground mb-1">
        Bạn chưa có gói học phù hợp
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Liên hệ giảng viên để được gán gói học và truy cập bài giảng này.
      </p>
    </div>
  </AspectRatio>
)}
```

**Import to add:** `Lock` from lucide-react (line 3: `import { ExternalLink, Lock } from 'lucide-react'`)

**Note:** The locked else branch wraps in `<AspectRatio ratio={16/9}>` to maintain layout consistency at the top of LessonContent (per UI-SPEC: "Container: aspect-video ratio (16/9) matching existing AspectRatio wrapper").

### 3. StudentLayout.tsx — Add "Hồ sơ" header link

**File:** `src/components/student/StudentLayout.tsx`
**Lines 79–100 (nav block):** Add after line 87 (`/danh-muc` NavLink), before the admin Shield link at line 88:

```tsx
<NavLink
  to="/ho-so"
  className={({ isActive }) =>
    `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
      isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
    }`
  }
>
  Hồ sơ
</NavLink>
```

**Exact insertion:** After the closing `</NavLink>` for `/danh-muc` (line ~87), before `{profile?.role === 'admin' && ...}` (line ~88). The nav is inside `<nav className="ml-6 hidden sm:flex items-center gap-1">`.

### 4. App.tsx — Add new routes

**File:** `src/App.tsx`
**After line 43** (after `/quan-tri/bai-nop/:submissionId` route), add:
```tsx
<Route path="/quan-tri/goi-hoc" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><PackagesPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
```

**After line 44** (after `/khoa-hoc` student route), add:
```tsx
<Route path="/ho-so" element={<ProtectedRoute><StudentLayout><StudentProfilePage /></StudentLayout></ProtectedRoute>} />
```

**Imports to add:**
```typescript
import PackagesPage from "./pages/admin/PackagesPage"
import StudentProfilePage from "./pages/student/ProfilePage"
```

### 5. UsersPage.tsx — Replace dialog

**File:** `src/pages/admin/UsersPage.tsx`
- Line 34: Change import from `UserEnrollmentDialog` → `UserPackageDialog`
- Line 99: Change button text "Quản lý khóa học" → "Quản lý gói học"
- Lines 246–249: Change `<UserEnrollmentDialog>` → `<UserPackageDialog>` (props unchanged: `open`, `user`, `onClose`)

### 6. vercel.json — Add X-Frame-Options header

**Current content:** Only has `rewrites`. Add `headers` section:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

[VERIFIED: vercel.json currently only has rewrites — no headers key exists]

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/api/packages.ts` | Package, UserPackage types + CRUD + assign/revoke functions |
| `src/pages/admin/PackagesPage.tsx` | `/quan-tri/goi-hoc` — admin CRUD page (pattern: CoursesPage.tsx) |
| `src/components/admin/PackageFormDialog.tsx` | Create/edit package dialog with multi-grade checkboxes (pattern: CourseFormDialog.tsx) |
| `src/components/admin/UserPackageDialog.tsx` | Replaces UserEnrollmentDialog — assign/revoke packages |
| `src/pages/student/ProfilePage.tsx` | `/ho-so` — student profile with identity card + active packages |
| `supabase/migrations/20260504_18_packages_schema.sql` | Migration 18: tables + indexes + basic RLS |
| `supabase/migrations/20260504_19_backfill_user_packages.sql` | Migration 19: backfill legacy packages |
| `supabase/migrations/20260504_20_packages_rls_trigger.sql` | Migration 20: function + trigger + view |

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/api/lessons.ts` | `fetchLessons()`: `from('lessons')` → `from('lessons_view')` |
| `src/components/admin/AdminLayout.tsx` | Add Package import + nav item |
| `src/components/student/LessonContent.tsx` | Replace `&&` video render with ternary + locked state |
| `src/components/student/StudentLayout.tsx` | Add "Hồ sơ" NavLink |
| `src/App.tsx` | Add 2 routes + 2 imports |
| `src/pages/admin/UsersPage.tsx` | Swap UserEnrollmentDialog → UserPackageDialog; button label |
| `vercel.json` | Add headers section |

---

## StudentProfilePage — Key Details

**Data queries:**
```typescript
// Profile (already in AuthContext → use directly)
const { profile } = useAuth()

// User packages with grade coverage
const { data: userPackages = [], isLoading } = useQuery({
  queryKey: ['student', 'my-packages'],
  queryFn: () => getUserPackages(profile!.id),
  enabled: !!profile,
})
```

**Avatar (initials-based):** `src/components/ui/avatar.tsx` already exists — use `Avatar`, `AvatarFallback` components. Initials = first letter of each word in `full_name`.

**Date formatting for assigned_at:**
```typescript
new Date(pkg.assigned_at).toLocaleDateString('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric'
})
// → "04/05/2026" format
```

**Price formatting (VND):**
```typescript
new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.package.price_vnd)
// → "0 ₫" or "1.500.000 ₫"
```

---

## Validation Architecture

### How to verify each requirement

| Req ID | Verification Method |
|--------|---------------------|
| PRICE-01 | Open `/quan-tri/goi-hoc`. Create package "Test Lớp 7", price 1500000, grade: grade_7 only. Package appears in table. Edit → change name. Delete → confirm dialog → package gone. |
| PRICE-02 | Open UsersPage. Click "Quản lý gói học" on a student. Assign "Test Lớp 7" package. Verify `user_packages` row exists in DB. Verify `enrollments` row also created for grade_7 courses (trigger fired). Revoke → verify both user_packages and enrollment deleted. |
| PRICE-03 | Student A has grade_7 package. Login as Student A. Open a grade_7 lesson → video plays. Login as Student B (no package). Open same lesson → locked state shows (Lock icon + message). Verify `video_url` is NULL in network response for Student B. |
| PRICE-05 | Login as student with assigned package. Go to `/ho-so`. Verify: name, email visible. Package card shows package name + grade badge + assigned date. No packages → empty state visible. |
| VIDEO-01 | (a) Verify `video_url` in DB is a `youtube-nocookie.com` URL. (b) In DevTools Network tab, confirm lesson response for unauthorized student has `video_url: null`. (c) Curl https://[app-domain] with curl -I and verify `x-frame-options: SAMEORIGIN` header in response. |

### Migration Verification

After each migration file:
- **File 18:** Verify 3 new tables exist in Supabase Table Editor with correct columns
- **File 19:** Run verification query (commented at bottom of backfill file). All existing students should appear with ≥1 legacy package
- **File 20:** Test `has_grade_access('grade_7')` in SQL Editor as a student. Test `lessons_view` returns NULL for video_url when student has no package.

---

## Common Pitfalls

### Pitfall 1: Applying RLS Before Backfill
**What goes wrong:** After RLS is applied, `has_grade_access()` returns false for all existing students (no `user_packages` rows) → all `video_url` becomes NULL → existing students lose access.
**Why it happens:** Migrations applied out of order.
**How to avoid:** Run File 18 → File 19 → File 20 in strict sequence. Never skip or combine.
**Warning signs:** After File 20, all lesson pages show locked state for students who should have access.

### Pitfall 2: View Not Respecting Underlying RLS
**What goes wrong:** `lessons_view` returns all lesson rows to all authenticated users, ignoring enrollment-based row policies.
**Why it happens:** `security_invoker` not set — view runs as owner, bypassing caller's RLS identity.
**How to avoid:** Always use `WITH (security_invoker = true, security_barrier = true)` on the view.
**Warning signs:** Non-enrolled students can see lessons from courses they're not in.

### Pitfall 3: Delete Trigger Multi-Package Edge Case
**What goes wrong:** Revoking one package from a student who has two packages covering the same grade removes enrollments that should be kept.
**Why it happens:** Delete trigger doesn't check for other active packages covering the same grade.
**How to avoid:** The `NOT EXISTS (other active packages)` sub-query in `remove_enrollments_for_package()` handles this correctly.
**Warning signs:** After revoking "Lớp 7 A" from a student who also has "Lớp 7 B", their grade_7 enrollments disappear.

### Pitfall 4: fetchLessons Used for Admin Writes
**What goes wrong:** Calling `supabase.from('lessons_view').insert(...)` fails — the view is not updatable (due to JOINs).
**Why it happens:** Forgetting that `lessons_view` is read-only.
**How to avoid:** `insertLesson`, `updateLesson`, `deleteLesson` use `from('lessons')` base table. Only `fetchLessons` uses `from('lessons_view')`.

### Pitfall 5: Package Grade Checkboxes — Empty Array Submission
**What goes wrong:** PackageFormDialog submitted with 0 grades selected.
**Why it happens:** Zod `grades` field not validated for min 1.
**How to avoid:** Zod schema: `.array(z.enum([...])).min(1, 'Chọn ít nhất một lớp.')`.

---

## Code Examples

### Grade-aware package card with badges
```typescript
// Reuse GRADE_BADGE from src/lib/constants/grades.ts
import { GRADE_BADGE } from '@/lib/constants/grades'

function GradesCoverage({ grades }: { grades: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {grades.map(grade => {
        const { label, className } = GRADE_BADGE[grade as keyof typeof GRADE_BADGE]
        return (
          <Badge key={grade} variant="secondary" className={className}>
            {label}
          </Badge>
        )
      })}
    </div>
  )
}
```

### Avatar initials pattern (ProfilePage)
```typescript
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Usage:
<Avatar className="w-14 h-14">
  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
    {getInitials(profile.full_name)}
  </AvatarFallback>
</Avatar>
```

### Price VND formatter
```typescript
const formatVND = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

// Renders: "1.500.000 ₫" or "0 ₫"
```

---

## Environment Availability

Step 2.6: All dependencies are within the existing project (Supabase, React, shadcn). No external tools needed beyond existing stack. Migrations run manually via Supabase Dashboard SQL Editor per project convention.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | PostgreSQL `WITH (security_invoker = true)` on views is supported in the Supabase instance (requires Postgres 15+) | RLS Architecture | If using Postgres 14, use `ALTER VIEW ... OWNER TO authenticated` workaround or explicit SECURITY INVOKER setting |
| A2 | `SET search_path = public` in SECURITY DEFINER functions prevents search_path injection | has_grade_access() | Security risk if omitted — low probability but best practice |
| A3 | Supabase PostgREST automatically exposes `lessons_view` via the REST API (standard behavior for views in public schema) | Frontend Patterns | If not, run `NOTIFY pgrst, 'reload schema'` after creating view |

**All other claims in this research are VERIFIED from direct codebase inspection.**

---

## Sources

### Primary (HIGH confidence — direct codebase read)
- `src/components/admin/UserEnrollmentDialog.tsx` — dialog pattern, query/mutation shapes
- `src/pages/admin/CoursesPage.tsx` — CRUD page pattern, loading/empty states, skeleton rows
- `src/components/admin/CourseFormDialog.tsx` — form dialog pattern with react-hook-form + zod
- `src/components/admin/AdminLayout.tsx` — navItems array, icon pattern
- `src/components/student/LessonContent.tsx` — exact lines for locked state integration
- `src/components/student/StudentLayout.tsx` — exact location for Hồ sơ NavLink
- `src/App.tsx` — route structure + ProtectedRoute pattern
- `src/lib/api/enrollments.ts` — API function pattern for packages API
- `src/lib/constants/grades.ts` — GRADE_BADGE constant (reuse in new components)
- `supabase/migrations/20260324_03_course_management_schema.sql` — lessons table schema
- `supabase/migrations/20260324_04_course_management_rls.sql` — existing lessons RLS
- `supabase/migrations/20260429_16_profiles_rls.sql` — SECURITY DEFINER function pattern
- `vercel.json` — current content (rewrites only, no headers)
- `src/components/ui/avatar.tsx` — confirmed exists, no install needed
- `src/components/ui/checkbox.tsx` — confirmed exists for PackageFormDialog

### Secondary (ASSUMED — Postgres docs pattern)
- PostgreSQL view `security_invoker` option — Postgres 15+ feature for security-barrier views
- `SECURITY DEFINER` + `SET search_path` best practice

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all verified from package.json and source files
- Schema design: HIGH — derived from existing schema patterns + CONTEXT.md D-04
- RLS/view architecture: HIGH — verified existing RLS patterns; view approach is standard PostgreSQL
- Migration strategy: HIGH — verified from existing migrations + CONTEXT.md D-10
- Frontend integration points: HIGH — exact line numbers from direct file read

**Research date:** 2026-05-04
**Valid until:** Stable (no external dependencies that change rapidly)
