# Phase 6: UX Polish — Research

**Researched:** 2026-04-28
**Domain:** React / Tailwind / Supabase RLS / shadcn/ui — UI polish, navigation, filtering, and access-gating
**Confidence:** HIGH (all findings based on direct source inspection)

---

## Summary

Phase 6 polishes the platform across four distinct concern areas: (1) admin grading queue filtering, (2) student course discovery and navigation improvements, (3) 404/navigation fixes, and (4) a color change on the progress bar track. All changes are purely frontend + one Supabase RLS migration — no new tables, no new backend functions.

The most substantial work is the **student course catalogue**: adding a browsable all-courses page for enrolled students (the current RLS only exposes enrolled courses) and a **course preview mode** that non-enrolled students see when navigating to a course slug. This requires one Supabase migration (broaden course/chapter/lesson SELECT policies) plus two new frontend pages.

**Primary recommendation:** Group changes into 4 plans: (1) navigation + visual quick-wins, (2) admin grading filters, (3) student catalogue page + RLS migration, (4) course preview mode inside CourseDetailPage.

---

## User Constraints (from CONTEXT.md)

_No CONTEXT.md exists for Phase 6 — no locked decisions or deferred items._

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Router DOM | v6 (already installed) | New `/catalogue` route, logo Links | Already in use |
| TanStack React Query | v5 (already installed) | New catalogue query, enrollment status | Already in use |
| shadcn/ui | current (already installed) | Select, Input, Badge filter controls | Already in use |
| Supabase JS | 2.78.0 (pinned) | RLS migration, query extension | Already in use — DO NOT upgrade |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | current | Filter icon (SlidersHorizontal), Lock icon for preview | Already in use |

### No New Installs Required
All libraries needed for Phase 6 are already installed. **Do not introduce any new npm packages.**

---

## Architecture Patterns

### Project Structure (relevant to Phase 6)
```
src/
├── pages/
│   ├── NotFound.tsx              ← fix Vietnamese text
│   ├── student/
│   │   ├── CoursesPage.tsx       ← update empty state CTA + link to catalogue
│   │   ├── CourseDetailPage.tsx  ← add preview mode for non-enrolled students
│   │   └── CataloguePage.tsx     ← NEW: all-courses browsable page
│   └── admin/
│       └── SubmissionsPage.tsx   ← add 4 filter controls
├── components/
│   └── student/
│       └── StudentLayout.tsx     ← logo as Link to /, add "My Courses" nav
├── lib/
│   └── api/
│       └── courses.ts            ← new fetchAllCourses() for catalogue
│       └── submissions.ts        ← extend UngradedSubmission + getUngraded query
└── App.tsx                       ← add /catalogue route
supabase/migrations/
└── 20260428_13_catalogue_rls.sql ← NEW: broaden course/chapter/lesson SELECT
```

### Recommended Plan Structure
- **Plan 1 (Quick wins):** NotFound fix + StudentLayout logo/nav + Progress bar color
- **Plan 2 (Admin filters):** Extend `getUngraded` + add filter UI to SubmissionsPage
- **Plan 3 (Catalogue + RLS):** Migration + new CataloguePage + App.tsx route + api function
- **Plan 4 (Course preview):** Modify CourseDetailPage to detect enrollment + preview mode

---

## Detailed Findings Per Scope Item

### 1. Admin Grading Queue Filters

**Current state (`src/pages/admin/SubmissionsPage.tsx`):**
- Shows ALL ungraded submissions — no filters whatsoever
- Data shape: `UngradedSubmission` — has `profiles.full_name`, `lessons.title`, `lessons.chapters.courses.title`
- **Missing:** `courses.target_grade` (grade 7/8/9/advanced) — not in current select query or type

**Current `getUngraded()` query in `submissions.ts`:**
```typescript
.select(`
  id, user_id, lesson_id, file_path, submitted_at,
  profiles ( full_name ),
  lessons ( title, chapters ( course_id, courses ( title ) ) )
`)
```

**Changes needed:**
1. Extend the select to include `courses ( title, target_grade )` in the join
2. Update `UngradedSubmission` interface to include `target_grade`
3. Add 4 client-side filter state vars in SubmissionsPage:
   - `filterGrade: string` — Select from unique target_grades in data
   - `filterCourse: string` — Select from unique course titles in data
   - `filterLesson: string` — Select from unique lesson titles in data
   - `filterStudent: string` — text Input for partial name match
4. Derive `filteredData` from `data` applying all 4 filters
5. Filter options derived from loaded data (no extra API calls)

**UI pattern for filters:**
```tsx
// shadcn Select for grade/course/lesson, Input for student name
// All client-side — data already loaded by useQuery
const filteredData = data.filter(row =>
  (!filterGrade || row.lessons.chapters.courses.target_grade === filterGrade) &&
  (!filterCourse || row.lessons.chapters.courses.title === filterCourse) &&
  (!filterLesson || row.lessons.title === filterLesson) &&
  (!filterStudent || row.profiles.full_name.toLowerCase().includes(filterStudent.toLowerCase()))
)
```

**GRADE_BADGE constant** (already in `src/lib/constants/grades.ts`) maps `target_grade` to labels — reuse for grade filter display labels.

**Confidence:** HIGH — all data structures inspected directly.

---

### 2. Student 404 Pages

**Current state (`src/pages/NotFound.tsx`):**
```tsx
<h1 className="mb-4 text-4xl font-bold">404</h1>
<p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
<a href="/" className="text-primary underline hover:text-primary/90">
  Return to Home
</a>
```

**Issues:**
- All text is English — violates UX-03 (Vietnamese UI)
- Uses `<a href="/">` not React Router `Link` (causes full page reload)
- No role-awareness: students who 404 should see a link to `/courses`, not just `/`

**Fix:**
```tsx
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const NotFound = () => {
  const { profile } = useAuth()
  const homeLink = profile?.role === 'student' ? '/courses' : '/'

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Trang không tìm thấy</p>
        <Link to={homeLink} className="text-primary underline hover:text-primary/90">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
```

**Confidence:** HIGH — direct code inspection.

---

### 3. Student Navigation Fixes

**Current state (`src/components/student/StudentLayout.tsx`):**
```tsx
<span className="font-semibold text-primary text-base">BuMath</span>
```
- "BuMath" is a non-interactive `<span>` — no click behavior
- No logo image (only text) — inconsistent with landing page Header which shows logo + "BuMath-X"
- No "Khóa học của tôi" navigation link

**Fix A — Logo click → home page (/):**
```tsx
import { Link } from 'react-router-dom'

// Replace span with Link + image + text
<Link to="/" className="flex items-center gap-2">
  <img
    src={`${import.meta.env.BASE_URL}bumath.jpeg`}
    alt="BuMath"
    className="h-8 w-8 rounded-lg object-cover"
  />
  <span className="font-semibold text-primary text-base">BuMath</span>
</Link>
```

Logo image path: `${import.meta.env.BASE_URL}bumath.jpeg` — same pattern used in landing `Header.tsx`.

**Fix B — "Khóa học của tôi" link:**
Add a nav link in the header between logo and right-side buttons:
```tsx
<nav className="ml-4 hidden sm:flex items-center gap-1">
  <Link
    to="/courses"
    className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
  >
    Khóa học của tôi
  </Link>
</nav>
```
On mobile (sm:hidden), the full_name is already hidden — nav link can also be hidden or included in a compact form.

**Confidence:** HIGH — direct code inspection.

---

### 4. Progress Bar Color Fix

**Current state:**

In `src/components/ui/progress.tsx`:
```tsx
<ProgressPrimitive.Root
  className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
>
  <ProgressPrimitive.Indicator
    className="h-full w-full flex-1 bg-primary transition-all"
  />
```

- **Track**: `bg-secondary` = `--secondary: 200 80% 50%` = **blue/cyan** ← this is the "blue" the user sees
- **Indicator**: `bg-primary` = `--primary: 24 95% 53%` = orange

The `className` prop on `<Progress>` only overrides the root/track element. The indicator color is hardcoded.

**User's request:** "use gray/neutral color instead of current blue" — refers to the **track** being blue.

**Fix:** Pass `className="bg-muted"` to Progress instances to override `bg-secondary`:
```tsx
// In CoursesPage.tsx (line ~130)
<Progress value={progress} className="h-2 mt-2 bg-muted" />

// In LessonSidebar.tsx (line ~31)
<Progress value={progress} className="h-2 bg-muted" />
```

`bg-muted` = `--muted: 30 20% 94%` = light warm gray — neutral and non-distracting.

**CLAUDE.md constraint:** "do not modify shadcn/ui components manually; use the shadcn CLI to add/update" — the fix uses className prop override, NOT modifying the component file directly. ✓

**Confidence:** HIGH — direct code + CSS variable inspection.

---

### 5. Student Course Catalogue (Browsable Before Enrollment)

**Current RLS blocker (CRITICAL):**

From `supabase/migrations/20260324_04_course_management_rls.sql`:
```sql
-- Student: can read courses they are enrolled in ONLY
CREATE POLICY "student_read_enrolled_courses"
  ON courses FOR SELECT
  USING (
    is_approved_user() AND
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = courses.id
        AND enrollments.user_id = auth.uid()
    )
  );
```

Students CANNOT query courses they're not enrolled in. Same restriction exists for chapters and lessons.

**Fix — new migration `20260428_13_catalogue_rls.sql`:**
```sql
-- Drop old restrictive policies
DROP POLICY IF EXISTS "student_read_enrolled_courses" ON courses;
DROP POLICY IF EXISTS "student_read_enrolled_chapters" ON chapters;
DROP POLICY IF EXISTS "student_read_enrolled_lessons" ON lessons;

-- Allow all approved users to browse the full catalogue
CREATE POLICY "approved_user_read_all_courses"
  ON courses FOR SELECT
  USING (is_approved_user());

CREATE POLICY "approved_user_read_all_chapters"
  ON chapters FOR SELECT
  USING (is_approved_user());

CREATE POLICY "approved_user_read_all_lessons"
  ON lessons FOR SELECT
  USING (is_approved_user());
```

**Security consideration:** Lessons contain `video_url` (YouTube embed URL — essentially public once known) and `assignment_path` (storage path). The assignments bucket policy from Phase 3 is already "permissive for authenticated users — file path discovery blocked by lesson RLS". With this change, that RLS guard is removed. However:
- YouTube embed URLs are not secret — they're YouTube public videos
- Assignment PDFs/images in the `assignments` bucket already had permissive read policy
- The product uses manual enrollment (admin controls access) — not payment-gated content
- **Verdict:** Broadening is acceptable for this product context. Admin still controls enrollment; the "lock" is enrollment (teacher assigns students), not RLS.

**New API function `fetchAllCourses()`:**
```typescript
// In src/lib/api/courses.ts
export async function fetchAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('target_grade', { ascending: true })
  if (error) throw error
  return data as Course[]
}
```

**New student page `src/pages/student/CataloguePage.tsx`:**
- Uses `fetchAllCourses()` for all courses
- Uses `getUserEnrollments(profile.id)` to know which ones student is already enrolled in
- Shows enrollment status badge ("Đã đăng ký" / "Chưa đăng ký")
- Clicking a course → `/courses/:courseSlug` (preview or full depending on enrollment)
- Wrapped in `StudentLayout`

**New route in `App.tsx`:**
```tsx
<Route
  path="/catalogue"
  element={
    <ProtectedRoute requiredRole="student">
      <CataloguePage />
    </ProtectedRoute>
  }
/>
```

**Link from StudentLayout header:**
Add "Tất cả khóa học" or "Khám phá khóa học" link alongside "Khóa học của tôi".

**Confidence:** HIGH — RLS migration text inspected directly, pattern matches existing migrations.

---

### 6. Course Preview (Chapters/Lessons List Before Enrollment)

**Approach:** Modify existing `CourseDetailPage.tsx` to detect enrollment and conditionally render.

**Enrollment check:**
```typescript
// Add to CourseDetailPage queries
const { data: enrollments } = useQuery({
  queryKey: ['enrollments', profile?.id],
  queryFn: () => getUserEnrollments(profile!.id),
  enabled: !!profile?.id,
})
const isEnrolled = !!enrollments?.some(e => e.course_id === courseId)
```

After the RLS migration, `fetchCourseBySlug`, `fetchChapters`, and `fetchLessons` will work for any approved user (enrolled or not). So the data-fetching logic barely changes — just add the enrollment check.

**Preview mode UI (when !isEnrolled):**
```tsx
// Show chapters list with lesson count, lock icon on each lesson
// No video player, no submission area, no progress tracking
{chapters.map(chapter => (
  <div key={chapter.id} className="border rounded-lg p-4">
    <h3 className="font-semibold">{chapter.title}</h3>
    <ul>
      {(lessonsByChapter.get(chapter.id) ?? []).map(lesson => (
        <li key={lesson.id} className="flex items-center gap-2 py-1 text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          <span className="text-sm">{lesson.title}</span>
        </li>
      ))}
    </ul>
  </div>
))}
<p className="text-muted-foreground text-sm mt-4">
  Vui lòng liên hệ giảng viên để được đăng ký khóa học này.
</p>
```

**Full mode UI (when isEnrolled):**
Existing sidebar + LessonContent layout — no changes.

**Confidence:** HIGH — direct code inspection of CourseDetailPage and enrollment API.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Grade/course filter dropdowns | Custom select | shadcn/ui `<Select>` | Already in codebase; keyboard accessible |
| Student name text filter | Custom search box | shadcn/ui `<Input>` | Already in codebase |
| Enrollment status badges | Custom badges | shadcn/ui `<Badge>` with GRADE_BADGE pattern | Consistent with existing badge usage |
| Course catalogue fetch | Custom pagination/cursor | Simple `fetchAllCourses()` with client-side filter | Low data volume (< 50 courses for v1) |

---

## Common Pitfalls

### Pitfall 1: RLS Migration — Policy Name Conflicts
**What goes wrong:** Running `CREATE POLICY` without first dropping the old policy throws Postgres error `policy already exists`.
**How to avoid:** Always `DROP POLICY IF EXISTS` before `CREATE POLICY` in migration files. See pattern in existing migrations.

### Pitfall 2: ProtectedRoute requiredRole for Catalogue
**What goes wrong:** If `ProtectedRoute` checks for `requiredRole="student"`, admins navigating to `/catalogue` would be redirected.
**How to avoid:** The catalogue is student-facing; admins use `/admin/courses`. If an admin navigates to `/catalogue`, they'll be redirected. This is acceptable — don't try to make it role-agnostic.

### Pitfall 3: Enrollment Loading Race in CourseDetailPage Preview
**What goes wrong:** If enrollment query resolves after chapters/lessons, the page briefly shows full mode then switches to preview (or vice versa).
**How to avoid:** Show loading skeleton until BOTH `isLoading` (chapters) AND enrollment query are resolved before deciding preview vs. full mode. Add `enrollmentsLoading` to the `isLoading` composite.

### Pitfall 4: Filter dropdowns showing duplicates
**What goes wrong:** Multiple submissions for the same course create duplicate entries in the course filter dropdown.
**How to avoid:** Derive unique values with `Array.from(new Set(data.map(...)))` before rendering Select options.

### Pitfall 5: Progress className Override Specificity
**What goes wrong:** Tailwind class `bg-muted` passed via `className` may not override `bg-secondary` if Tailwind's merge order puts component class last.
**How to avoid:** The Progress component uses `cn(..., className)` — `className` is last, so it wins. `tailwind-merge` (used in `cn()`) handles conflicting bg-* classes correctly — the last one wins.
**Verification:** Confirmed `cn()` uses `clsx + tailwind-merge` from `src/lib/utils.ts`.

### Pitfall 6: `fetchCourses()` vs `fetchAllCourses()` confusion
**What goes wrong:** Both admin and student use course fetching. Admin uses `fetchCourses()` (already works via admin policy). After adding student policy, students could also use `fetchCourses()`.
**How to avoid:** Create a distinct `fetchAllCourses()` function for the catalogue even if the implementation is similar — keeps admin and student data flows clearly separated and allows future divergence (e.g., adding `is_published` filter for students only).

---

## Code Examples

### Admin Filter — Extend UngradedSubmission type
```typescript
// Source: src/lib/api/submissions.ts (current + extension)
export interface UngradedSubmission {
  id: string
  user_id: string
  lesson_id: string
  file_path: string
  submitted_at: string
  profiles: { full_name: string }
  lessons: {
    title: string
    chapters: {
      course_id: string
      courses: { title: string; target_grade: Course['target_grade'] }  // ← ADD target_grade
    }
  }
}
```

### Admin Filter — Updated getUngraded query
```typescript
// Source: src/lib/api/submissions.ts
export async function getUngraded(): Promise<UngradedSubmission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, user_id, lesson_id, file_path, submitted_at,
      profiles ( full_name ),
      lessons ( title, chapters ( course_id, courses ( title, target_grade ) ) )
    `)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as UngradedSubmission[]
}
```

### Admin Filter UI — Filter state + derived filteredData
```tsx
// Source: SubmissionsPage.tsx pattern
const [filterGrade, setFilterGrade] = useState('')
const [filterCourse, setFilterCourse] = useState('')
const [filterLesson, setFilterLesson] = useState('')
const [filterStudent, setFilterStudent] = useState('')

const filteredData = (data ?? []).filter(row =>
  (!filterGrade || row.lessons.chapters.courses.target_grade === filterGrade) &&
  (!filterCourse || row.lessons.chapters.courses.title === filterCourse) &&
  (!filterLesson || row.lessons.title === filterLesson) &&
  (!filterStudent ||
    row.profiles.full_name.toLowerCase().includes(filterStudent.toLowerCase()))
)

const uniqueCourses = Array.from(new Set((data ?? []).map(r => r.lessons.chapters.courses.title)))
const uniqueLessons = Array.from(new Set((data ?? []).map(r => r.lessons.title)))
```

### RLS Migration Pattern
```sql
-- Source: matches pattern in 20260324_04_course_management_rls.sql
DROP POLICY IF EXISTS "student_read_enrolled_courses" ON courses;

CREATE POLICY "approved_user_read_all_courses"
  ON courses FOR SELECT
  USING (is_approved_user());
```

### Catalogue Page — Query pattern
```tsx
// Source: mirrors CoursesPage.tsx pattern
const { data: allCourses = [] } = useQuery({
  queryKey: ['courses', 'all'],
  queryFn: fetchAllCourses,
  enabled: !!profile?.id,
})
const { data: enrollments = [] } = useQuery({
  queryKey: ['enrollments', profile?.id],
  queryFn: () => getUserEnrollments(profile!.id),
  enabled: !!profile?.id,
})
const enrolledCourseIds = new Set(enrollments.map(e => e.course_id))
```

### Progress bar color fix
```tsx
// Source: direct override via className prop (no component modification)
// In CoursesPage.tsx:
<Progress value={progress} className="h-2 mt-2 bg-muted" />

// In LessonSidebar.tsx:
<Progress value={progress} className="h-2 bg-muted" />
```

---

## Environment Availability

Step 2.6: SKIPPED — no new external dependencies. All changes are frontend + Supabase SQL migrations using the existing stack.

---

## Validation Architecture

**Config:** `workflow.nyquist_validation: true` — validation section required.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| ID | Behavior | Test Type | Automated Command | File Exists? |
|----|----------|-----------|-------------------|-------------|
| UX-P6-01 | Admin filter reduces table rows by grade/course/lesson/student | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ❌ Wave 0 |
| UX-P6-02 | NotFound shows Vietnamese text | unit | `yarn test src/pages/NotFound.test.tsx` | ❌ Wave 0 |
| UX-P6-03 | StudentLayout logo is a link to / | unit | `yarn test src/components/student/StudentLayout.test.tsx` | ❌ Wave 0 |
| UX-P6-04 | CataloguePage renders all courses with enrollment badges | unit | `yarn test src/pages/student/CataloguePage.test.tsx` | ❌ Wave 0 |
| UX-P6-05 | CourseDetailPage shows preview mode when not enrolled | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx` | ❌ Wave 0 |

### Existing Tests (must stay green)
- `src/pages/admin/SubmissionsPage.test.tsx` — already exists, must pass after filter addition
- `src/pages/admin/UsersPage.test.tsx` — unrelated, must not break
- `src/components/student/BellNotification.test.tsx` — unrelated, must not break
- `src/components/student/SubmissionArea.test.tsx` — unrelated, must not break

### Sampling Rate
- **Per task commit:** `yarn test` (full suite — fast, < 30s)
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/pages/admin/SubmissionsPage.test.tsx` — filter behavior stubs (REQ UX-P6-01)
- [ ] `src/pages/NotFound.test.tsx` — Vietnamese text + Link (REQ UX-P6-02)
- [ ] `src/components/student/StudentLayout.test.tsx` — logo link (REQ UX-P6-03)
- [ ] `src/pages/student/CataloguePage.test.tsx` — catalogue render (REQ UX-P6-04)
- [ ] `src/pages/student/CourseDetailPage.test.tsx` — preview mode (REQ UX-P6-05)

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| No filtering in grading queue | Client-side filter UI using already-loaded data | No extra API calls — zero performance cost |
| Logo as non-interactive span | Logo as React Router Link | SPA navigation, no page reload |
| Enrollment-gated courses RLS | Approved-user SELECT on all courses + frontend preview gate | Students can discover content; enrollment still controls full access |

---

## Open Questions

1. **Catalogue route placement — `/catalogue` vs. `/courses/catalogue`**
   - What we know: existing student routes are `/courses` and `/courses/:slug`
   - What's unclear: whether `/catalogue` conflicts with course slug (a course named "catalogue" would collide at `/courses/catalogue`)
   - Recommendation: Use `/catalogue` (top-level) — clean separation, no slug collision risk

2. **"Khóa học của tôi" link in StudentLayout on mobile**
   - What we know: mobile header is 48px, already has logo + bell + logout
   - What's unclear: whether there's enough room for a nav link on small screens
   - Recommendation: Hide "Khóa học của tôi" text on mobile (sm:hidden), visible from sm breakpoint up

3. **SubmissionsPage.test.tsx already exists — update or supplement?**
   - What we know: file exists at `src/pages/admin/SubmissionsPage.test.tsx`
   - What's unclear: current test content (not read — not needed for research)
   - Recommendation: Plan 2 (admin filters) should update existing test file to add filter behavior cases, not create a new file

---

## Sources

### PRIMARY (HIGH confidence — direct file inspection)
- `src/pages/admin/SubmissionsPage.tsx` — grading queue current state
- `src/lib/api/submissions.ts` — UngradedSubmission type + getUngraded query
- `src/pages/student/CoursesPage.tsx` — student course page current state
- `src/pages/student/CourseDetailPage.tsx` — course detail current state
- `src/components/student/StudentLayout.tsx` — header + navigation current state
- `src/components/ui/progress.tsx` — Progress component implementation
- `src/index.css` — CSS variable values (--primary, --secondary, --muted)
- `src/lib/constants/grades.ts` — GRADE_BADGE map for filter labels
- `supabase/migrations/20260324_04_course_management_rls.sql` — current RLS policies
- `src/App.tsx` — current route structure
- `src/pages/NotFound.tsx` — current 404 page
- `CLAUDE.md` — project conventions (package manager: yarn, shadcn policy)
- `.planning/config.json` — nyquist_validation: true, granularity: coarse

---

## Metadata

**Confidence breakdown:**
- Quick wins (NotFound, logo, progress color): HIGH — trivial, direct code changes
- Admin grading filters: HIGH — data shape inspected, pattern is standard React state
- RLS migration: HIGH — existing migration SQL reviewed, pattern is consistent
- Catalogue page: HIGH — existing CoursesPage is a direct template
- Course preview mode: HIGH — CourseDetailPage structure inspected, enrollment API confirmed

**Research date:** 2026-04-28
**Valid until:** 2026-06-01 (stable stack, no fast-moving dependencies)
