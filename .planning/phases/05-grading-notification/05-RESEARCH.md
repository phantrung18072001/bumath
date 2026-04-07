# Phase 5: Grading & Notification - Research

**Researched:** 2026-04-07
**Domain:** React + Supabase — teacher grading queue, grading dialog, in-app bell notification, student result view
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Teacher Grading Queue (GRADE-01)**
- D-01: Route `/admin/submissions` — add "Chấm bài" link in admin nav
- D-02: Flat table layout — columns: Học sinh | Khóa học | Bài học | Ngày nộp | [Chấm bài button]. Consistent with UsersPage pattern.
- D-03: Table shows only `status = 'submitted'` submissions. Graded submissions NOT shown in default tab.
- D-04: Badge counting pending submissions: "X bài chờ chấm" at top of page.
- D-05: Empty state: "Không có bài nào chờ chấm."

**Grading Flow (GRADE-02, GRADE-03)**
- D-06: Click "Chấm bài" row button → dialog/modal overlay opens. Teacher stays on queue page (no navigation).
- D-07: Dialog layout top-to-bottom: Title | Submission photo (full width, `max-h-[60vh] overflow-y-auto`) | Score input + "/10" label | Comment textarea (optional) | [Hủy] | [Lưu điểm]
- D-08: Photo loaded via signed URL (pattern from Phase 4 `getSubmissionSignedUrl`) — private bucket.
- D-09: After save success: dialog closes, row disappears (query invalidation), toast "Đã lưu điểm".

**Score Scale (GRADE-03)**
- D-10: Scale 0–10 (Vietnam standard). `<Input type="number" min=0 max=10 step=0.5>`. Stored as `numeric(5,2)` — schema already ready.
- D-11: Comment is text field, optional, with UI hint placeholder.

**In-System Bell Notification (GRADE-04 — in-app only, email deferred)**
- D-12: StudentLayout header adds Bell icon (Lucide `Bell`) with badge count = number of graded-but-not-yet-viewed submissions.
- D-13: "Not yet viewed" = `status = 'graded' AND student_viewed_at IS NULL`. Badge hidden when count = 0.
- D-14: `student_viewed_at` — add `timestamptz` column to `submissions` table via new migration. Nullable.
- D-15: When student navigates into a lesson with `status = 'graded'` and `student_viewed_at IS NULL` → auto-update `student_viewed_at = now()` (fire-and-forget, non-blocking).
- D-16: Bell badge query: `SELECT COUNT(*) FROM submissions WHERE user_id = auth.uid() AND status = 'graded' AND student_viewed_at IS NULL`. Use `useQuery` with `refetchInterval: 60_000`.

**Student Result View (GRADE-05)**
- D-17: Results displayed inline in the existing SubmissionArea component from Phase 4 (no new page).
- D-18: When `status = 'graded'`: show submitted photo (thumbnail + click to open full) + "Đã chấm" badge + "Điểm: X/10" + teacher comment (if present).
- D-19: `status = 'submitted'` still shows "Đã nộp — đang chờ chấm".

### Claude's Discretion
- Exact Supabase query to JOIN submissions with profiles + lessons + courses for teacher queue.
- RLS policy for `student_viewed_at` update (students can update own submissions, this field only) — may need separate policy or RPC.
- shadcn/ui Dialog vs Sheet for grading overlay — Dialog preferred (more compact).
- Pagination vs scroll for grading queue — scroll adequate for MVP.

### Deferred Ideas (OUT OF SCOPE)
- Email notification when submission graded → GRADE-04, v2 (no email provider in v1)
- Comment templates (saved/reusable) → GRADE-V2-01, v2
- Assignment deadlines → GRADE-V2-02, v2
- View history of all graded submissions (graded history tab) → v2
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GRADE-01 | Giảng viên thấy danh sách tất cả bài đã nộp chưa được chấm | Teacher queue page at `/admin/submissions` — flat table filtered on `status = 'submitted'`, JOIN with profiles + lessons + courses |
| GRADE-02 | Giảng viên có thể xem ảnh bài làm của học sinh đầy đủ | GradingDialog loads signed URL via existing `getSubmissionSignedUrl` — teacher already has Storage RLS read access (Policy in migration 20260407_06) |
| GRADE-03 | Giảng viên có thể nhập điểm số và comment nhận xét trên bài nộp | GradingDialog score input (0–10, step 0.5) + comment textarea. `gradeSubmission()` does `.update({ score, comment, status:'graded' })` — teacher UPDATE RLS already in place |
| GRADE-04 | Học sinh nhận email thông báo khi bài được chấm | In-app only for v1: Bell icon in StudentLayout with unread count query + `student_viewed_at` migration. Email deferred per user decision. |
| GRADE-05 | Học sinh có thể xem điểm và comment của giảng viên trên bài nộp của mình | SubmissionArea already partially shows graded state — extend to show score + comment box. `student_viewed_at` fire-and-forget update on mount. |
</phase_requirements>

---

## Summary

Phase 5 closes the async feedback loop that is BuMath's core value: teacher grades → student sees result. All infrastructure exists from prior phases — the `submissions` table already has `score`, `comment`, `status`, and the teacher UPDATE RLS policy. Storage read access for admin/teacher is also in place. Phase 5 is almost entirely frontend work plus one targeted migration.

The work decomposes into four distinct areas: (1) a new admin page `SubmissionsPage` with a flat queue table, (2) a `GradingDialog` component for inline grading, (3) a `BellNotification` component in StudentLayout header, and (4) extending `SubmissionArea` to display grade results. Each area is independent and can be planned as a separate wave/plan.

The single database change is adding `student_viewed_at timestamptz` to `submissions`. The RLS complexity here is non-trivial: students need UPDATE permission on their own `student_viewed_at` field, but the existing teacher UPDATE policy covers all fields. A SECURITY DEFINER RPC (`mark_submission_viewed`) is the cleanest approach to avoid giving students a blanket UPDATE policy that could let them modify scores.

**Primary recommendation:** Plan 4 waves — migration, API layer, teacher-side UI, student-side UI — in that dependency order.

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.78.0 (pinned) | DB queries, Storage signed URLs, RPC calls | Project-wide backend client |
| @tanstack/react-query | v5 | `useQuery` + `useMutation` for all Supabase ops | Established pattern in every prior phase |
| sonner | latest | Toast notifications | Established in Phase 3/4 |
| lucide-react | latest | Bell icon, Loader2, existing icons | Project icon library |
| shadcn/ui | style=default, slate | Dialog, Table, Badge, Input, Textarea, Skeleton, Button | All components already in `src/components/ui/` |

### No New Packages Required

All libraries needed for Phase 5 are already installed. No `yarn add` step needed.

**Installation:** None.

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
src/
├── pages/admin/
│   └── SubmissionsPage.tsx        # Teacher grading queue (GRADE-01, GRADE-02)
├── components/admin/
│   └── GradingDialog.tsx          # Grading modal (GRADE-02, GRADE-03)
├── components/student/
│   └── BellNotification.tsx       # Bell icon + badge for StudentLayout (GRADE-04)
├── lib/api/
│   └── submissions.ts             # Extend: add getUngraded(), gradeSubmission(),
│                                  #         getUnviewedGradeCount(), markGradeViewed()
└── supabase/migrations/
    └── 20260407_07_student_viewed_at.sql  # Add student_viewed_at column + RPC
```

### Pattern 1: Teacher Queue Query (JOIN across 3 tables)

**What:** Single Supabase query joining submissions → lessons → courses, plus profiles for student name.
**When to use:** SubmissionsPage data fetch.

```typescript
// Verified from existing Phase 4 pattern — extend with JOINs
export interface UngradedSubmission {
  id: string
  user_id: string
  lesson_id: string
  file_path: string
  submitted_at: string
  profiles: { full_name: string }
  lessons: { title: string; courses: { title: string } }
}

export async function getUngraded(): Promise<UngradedSubmission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, user_id, lesson_id, file_path, submitted_at,
      profiles ( full_name ),
      lessons ( title, courses ( title ) )
    `)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as UngradedSubmission[]
}
```

**Confidence:** HIGH — Supabase PostgREST nested SELECT syntax works for foreign-key relationships. The FK chain is: submissions.lesson_id → lessons.id → courses.id (via chapters.course_id — but lessons has no direct `course_id`). See pitfall below.

### Pattern 2: Grading Mutation

```typescript
// src/lib/api/submissions.ts (add)
export async function gradeSubmission(
  id: string,
  score: number,
  comment: string,
): Promise<void> {
  const { error } = await supabase
    .from('submissions')
    .update({ score, comment, status: 'graded' })
    .eq('id', id)
  if (error) throw error
}
```

Teacher UPDATE RLS policy already exists in `20260407_06_student_learning.sql`.

### Pattern 3: Bell Badge Query (student side)

```typescript
// src/lib/api/submissions.ts (add)
export async function getUnviewedGradeCount(): Promise<number> {
  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'graded')
    .is('student_viewed_at', null)
  if (error) throw error
  return count ?? 0
}
```

Used in `BellNotification` with `refetchInterval: 60_000`.

### Pattern 4: mark_submission_viewed RPC (SECURITY DEFINER)

**What:** Students should only be able to update `student_viewed_at` on their own submissions, not `score`/`comment`. A blanket student UPDATE policy is too permissive.
**Recommendation:** SECURITY DEFINER function.

```sql
-- In migration 20260407_07_student_viewed_at.sql
create or replace function mark_submission_viewed(submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update submissions
  set student_viewed_at = now()
  where id = submission_id
    and user_id = auth.uid()
    and status = 'graded'
    and student_viewed_at is null;
end;
$$;
```

Client call: `supabase.rpc('mark_submission_viewed', { submission_id: id })`

This is fire-and-forget: `markGradeViewed(id).catch(() => {})` — does not block render.

### Pattern 5: GradingDialog State Management

Follow Phase 3/4 dialog pattern (e.g., CourseFormDialog, UserEnrollmentDialog):

```typescript
// SubmissionsPage.tsx
const [gradingSubmission, setGradingSubmission] = useState<UngradedSubmission | null>(null)

// Row button
<Button size="sm" className="min-h-[48px]" onClick={() => setGradingSubmission(row)}>
  Chấm bài
</Button>

// Dialog
<GradingDialog
  submission={gradingSubmission}
  open={!!gradingSubmission}
  onClose={() => setGradingSubmission(null)}
  onSuccess={() => {
    setGradingSubmission(null)
    queryClient.invalidateQueries({ queryKey: ['admin', 'submissions', 'ungraded'] })
    toast.success(`Đã lưu điểm cho ${gradingSubmission?.profiles.full_name}`)
  }}
/>
```

### Pattern 6: BellNotification in StudentLayout

Add between profile name and logout button. Fire-and-forget update happens in SubmissionArea, not here.

```tsx
// src/components/student/BellNotification.tsx
import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getUnviewedGradeCount } from '@/lib/api/submissions'

export default function BellNotification() {
  const { data: count = 0 } = useQuery({
    queryKey: ['student', 'unviewed-grades'],
    queryFn: getUnviewedGradeCount,
    refetchInterval: 60_000,
  })
  return (
    <button
      className="relative min-h-[48px] min-w-[48px] flex items-center justify-center"
      aria-label="Thông báo chấm bài"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span
          className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center leading-none"
          aria-live="polite"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
```

### Anti-Patterns to Avoid

- **Student blanket UPDATE policy:** Do NOT add `create policy "Students can update own submissions"` on the full `submissions` table — students could forge scores. Use the RPC instead.
- **Blocking render on `markGradeViewed`:** The viewed-at update must be fire-and-forget. Do not `await` it or put it in a mutation that blocks UI.
- **Refetching on every component mount:** Bell badge uses `refetchInterval: 60_000`, not `refetchOnMount` or `refetchOnWindowFocus: true` on every visit — too many requests for a free-tier Supabase.
- **Loading signed URL inside the queue table:** Only fetch the signed URL when the dialog opens (lazy), not for every row at mount time.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dialog accessibility (focus trap, ESC) | Custom modal | shadcn `Dialog` (Radix) | Already in `src/components/ui/dialog.tsx`; keyboard nav + ARIA built in |
| Row-level loading state | Custom spinner logic | TanStack Query `isPending` on mutation | Same pattern as Phase 3/4 dialogs |
| Toast messages | Custom notification | Sonner `toast.success()` / `toast.error()` | Already wired in App.tsx |
| Number input validation | Custom validation logic | HTML `min`/`max`/`step` attributes + optional Zod | Score is simple enough; Zod optional for MVP |
| Counting unviewed grades | Manual state tracking | Direct Supabase COUNT query with `head: true` | Single line, no state overhead |

---

## Runtime State Inventory

> Phase 5 adds a column and an RPC — not a rename/refactor. No runtime state migration required.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | `submissions` table rows — existing `student_viewed_at` column does not yet exist | Migration adds nullable column — no backfill needed (null = unseen, correct default for existing rows) |
| Live service config | None | None |
| OS-registered state | None | None |
| Secrets/env vars | None — no new env vars; uses existing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY | None |
| Build artifacts | None | None |

**Migration strategy:** `ALTER TABLE submissions ADD COLUMN student_viewed_at timestamptz;` — nullable, no DEFAULT, existing rows get NULL (correct: existing graded rows show as "unseen" if any; new rows start as unseen until student navigates to the lesson).

---

## Common Pitfalls

### Pitfall 1: Lesson → Course JOIN Path

**What goes wrong:** `lessons` does not have a direct `course_id` column. The chain is `lessons.chapter_id → chapters.id → chapters.course_id`. A naive query `lessons ( title, courses ( title ) )` fails.

**Why it happens:** The schema uses chapters as an intermediate layer: courses → chapters → lessons.

**How to avoid:** Use the full join path in PostgREST syntax:
```typescript
.select(`
  id, user_id, lesson_id, file_path, submitted_at,
  profiles ( full_name ),
  lessons ( title, chapters ( course_id, courses ( title ) ) )
`)
```
Or, alternatively, denormalize in the API function by fetching lessons separately and joining in JS. Verify actual column names against `20260324_03_course_management_schema.sql` before writing the query.

**Warning signs:** Supabase returns a 400 or empty nested object for `courses`.

### Pitfall 2: Teacher Storage RLS — Signed URL

**What goes wrong:** Teacher/admin can call `getSubmissionSignedUrl()` but the Storage SELECT policy uses `(storage.foldername(name))[1] = auth.uid()::text` for students — teachers have a separate policy in the migration. If the teacher policy wasn't applied to the deployed Supabase project, signed URL generation will succeed but the actual image fetch will 403.

**Why it happens:** The migration creates the policies but Supabase Storage policies must be applied via migration runner or the dashboard — they don't auto-apply in dev if migrations haven't been run.

**How to avoid:** Verify in the Supabase dashboard that "Admin and teacher can read all submission files" policy exists on `storage.objects` before testing GradingDialog.

**Warning signs:** Dialog shows the Skeleton forever or `<img>` returns a broken image.

### Pitfall 3: No Admin Layout — "Chấm bài" Nav Link Placement

**What goes wrong:** D-01 says "add link to admin sidebar nav" but there is no shared admin layout or sidebar component. Admin pages (UsersPage, CoursesPage, ChaptersPage) are standalone pages with inline breadcrumbs/headings — no shared nav.

**Why it happens:** The project skipped building a shared admin layout in earlier phases; each admin page is self-contained.

**How to avoid:** "Chấm bài" link should be added as a simple top-level breadcrumb or nav link within `SubmissionsPage.tsx` itself (same style as the Breadcrumb components in CoursesPage/ChaptersPage), plus a direct link added to `UsersPage.tsx` and `CoursesPage.tsx` headers if cross-navigation is needed. This is a UI decision left to Claude's discretion per CONTEXT.md — keep it minimal for MVP (just add the route and a text link in the admin pages).

**Warning signs:** Attempting to add a shared sidebar would require refactoring all admin pages — out of scope.

### Pitfall 4: RLS for student_viewed_at Update

**What goes wrong:** If you add a general student UPDATE policy on `submissions`, students can craft a direct API call to update `score` or `comment` fields — breaking data integrity.

**Why it happens:** Supabase RLS doesn't support column-level UPDATE restrictions natively in simple policies.

**How to avoid:** Use the SECURITY DEFINER RPC `mark_submission_viewed(submission_id)` which hardcodes only the `student_viewed_at` field update and checks `user_id = auth.uid()`. Client call is fire-and-forget.

### Pitfall 5: Query Key Collision

**What goes wrong:** `SubmissionsPage` uses `queryKey: ['submissions', ...]` which may collide with the student-side query `['submissions', courseId]` used in `CourseDetailPage`.

**Why it happens:** Sharing a query key prefix across admin and student contexts.

**How to avoid:** Use `['admin', 'submissions', 'ungraded']` for teacher queue (consistent with `['admin', 'profiles']` and `['admin', 'courses']` already in the codebase). Use `['student', 'unviewed-grades']` for bell count query.

---

## Code Examples

### Migration: student_viewed_at column + RPC

```sql
-- supabase/migrations/20260407_07_student_viewed_at.sql
alter table submissions
  add column if not exists student_viewed_at timestamptz;

-- RPC: students can mark their own graded submission as viewed
create or replace function mark_submission_viewed(submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update submissions
  set student_viewed_at = now()
  where id = submission_id
    and user_id = auth.uid()
    and status = 'graded'
    and student_viewed_at is null;
end;
$$;
```

### API Function: markGradeViewed (fire-and-forget client usage)

```typescript
// src/lib/api/submissions.ts (add)
export async function markGradeViewed(submissionId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_submission_viewed', {
    submission_id: submissionId,
  })
  if (error) throw error
}
```

In SubmissionArea (fire-and-forget on mount):
```typescript
useEffect(() => {
  if (submission?.status === 'graded' && !submission.student_viewed_at) {
    markGradeViewed(submission.id).catch(() => {})
  }
}, [submission?.id, submission?.status, submission?.student_viewed_at])
```

### SubmissionArea extension (graded state with score/comment box)

```tsx
// Extend the existing graded branch in SubmissionArea.tsx
{submission.status === 'graded' && (
  <div className="p-3 bg-muted rounded-lg space-y-1">
    <p className="text-sm font-semibold">Điểm: {submission.score}/10</p>
    {submission.comment && (
      <p className="text-sm text-muted-foreground">{submission.comment}</p>
    )}
  </div>
)}
```

Note: The existing code (line 91-98 of SubmissionArea.tsx) already shows `Điểm: {submission.score}` without "/10" — Phase 5 task should update this to show "/10" per D-18.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Separate page for grading each submission | Dialog overlay on queue page | Teacher stays in queue context; faster workflow |
| Polling every second for notifications | 60s refetch interval + on-navigate invalidation | Acceptable latency for async grading; free-tier friendly |
| Email notification | In-app bell (v1) | Email deferred; bell is sufficient for MVP |

---

## Open Questions

1. **Lesson→Course JOIN path**
   - What we know: `lessons` → `chapters` → `courses` (not direct). Schema in `20260324_03_course_management_schema.sql`.
   - What's unclear: Exact PostgREST nested syntax for a 3-level join (lessons.chapters.courses) — needs verification against schema.
   - Recommendation: Verify column names in migration file before writing query. Fallback: fetch lesson + chapter + course separately in JS if PostgREST syntax fails.

2. **Submission type: `student_viewed_at` field**
   - What we know: Phase 4 `Submission` interface in `src/lib/api/submissions.ts` does not include `student_viewed_at`.
   - What's unclear: Whether SubmissionArea receives the submission via existing `getSubmission` / `getSubmissions` which do `select('*')` — this will auto-include the new column after migration.
   - Recommendation: Update the `Submission` TypeScript interface to include `student_viewed_at: string | null` after migration task. `select('*')` already retrieves all columns.

3. **Bell notification: trigger on navigation vs. polling only**
   - What we know: D-16 says `useQuery` with refetch interval — no real-time subscription.
   - What's unclear: Should the bell count also invalidate when student visits a graded lesson (after `markGradeViewed`)? Yes — invalidate `['student', 'unviewed-grades']` after the fire-and-forget update succeeds.
   - Recommendation: After `markGradeViewed` completes (in `.then()`), call `queryClient.invalidateQueries(['student', 'unviewed-grades'])`.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 5 has no external dependencies beyond the existing Supabase project and the project's own codebase. All tools (yarn, Vitest, Supabase client) were verified operational in Phase 4.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library |
| Config file | `vite.config.ts` (vitest config inline) |
| Quick run command | `yarn test src/pages/admin/SubmissionsPage.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GRADE-01 | Teacher sees ungraded submissions table with correct columns | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | Wave 0 |
| GRADE-01 | Empty state renders "Không có bài nào chờ chấm." | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | Wave 0 |
| GRADE-02 | "Chấm bài" button opens dialog with submission photo area | unit | `yarn test src/components/admin/GradingDialog.test.tsx` | Wave 0 |
| GRADE-03 | Saving grade calls gradeSubmission with correct args; dialog closes on success | unit | `yarn test src/components/admin/GradingDialog.test.tsx` | Wave 0 |
| GRADE-04 | Bell badge shows count > 0 when unviewed grades exist | unit | `yarn test src/components/student/BellNotification.test.tsx` | Wave 0 |
| GRADE-04 | Bell badge hidden when count = 0 | unit | `yarn test src/components/student/BellNotification.test.tsx` | Wave 0 |
| GRADE-05 | SubmissionArea shows score + comment when status = 'graded' | unit | `yarn test src/components/student/SubmissionArea.test.tsx` | Wave 0 |
| GRADE-05 | markGradeViewed called on mount when graded and student_viewed_at is null | unit | `yarn test src/components/student/SubmissionArea.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn test src/[relevant-file].test.tsx`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/pages/admin/SubmissionsPage.test.tsx` — covers GRADE-01
- [ ] `src/components/admin/GradingDialog.test.tsx` — covers GRADE-02, GRADE-03
- [ ] `src/components/student/BellNotification.test.tsx` — covers GRADE-04
- [ ] `src/components/student/SubmissionArea.test.tsx` — covers GRADE-05 (may extend existing if file created in Phase 4)

Note: Existing `UsersPage.test.tsx` pattern is the reference for mocking `supabase` and wrapping with `QueryClientProvider`. All new test files should follow the same vi.mock hoisting pattern.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `src/lib/api/submissions.ts`, `src/pages/admin/UsersPage.tsx`, `src/components/student/SubmissionArea.tsx`, `src/components/student/StudentLayout.tsx`, `src/App.tsx`, `supabase/migrations/20260407_06_student_learning.sql`
- `.planning/phases/05-grading-notification/05-CONTEXT.md` — locked decisions
- `.planning/phases/05-grading-notification/05-UI-SPEC.md` — visual/interaction contract

### Secondary (MEDIUM confidence)
- Supabase PostgREST nested SELECT syntax — established pattern from Phase 3 (courses → chapters), extending to 3 levels
- Supabase SECURITY DEFINER RPC pattern — established in Phase 3 (`is_admin()`, `is_approved_user()`)

---

## Metadata

**Confidence breakdown:**
- Migration: HIGH — exact column type and RPC pattern established in prior phases
- API functions: HIGH — extends existing `submissions.ts` with same Supabase client patterns
- Teacher UI (SubmissionsPage + GradingDialog): HIGH — follows UsersPage + CoursesPage/dialog patterns exactly
- Student UI (BellNotification + SubmissionArea extension): HIGH — straightforward, existing component
- Lesson→Course JOIN path: MEDIUM — 3-level join needs verification against schema (see Open Questions #1)
- RLS strategy for student_viewed_at: HIGH — SECURITY DEFINER RPC is the established project pattern

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable stack, no fast-moving dependencies)
