---
phase: 05-grading-notification
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/20260427_11_teacher_images.sql
  - src/lib/api/submissions.ts
  - src/pages/admin/GradingPage.tsx
  - src/components/admin/GradingDialog.tsx
  - src/pages/admin/SubmissionsPage.tsx
  - src/App.tsx
  - src/components/student/SubmissionArea.tsx
  - src/components/student/BellNotification.tsx
  - src/pages/student/CourseDetailPage.tsx
autonomous: false
gap_closure: true
requirements:
  - GAP-A
  - GAP-B
  - GAP-C
  - GAP-D
user_setup:
  - service: supabase
    why: "Apply pending SQL migrations against the live database"
    dashboard_config:
      - task: "Run supabase/migrations/20260407_07_student_viewed_at.sql in SQL Editor"
        location: "Supabase Dashboard -> SQL Editor"
      - task: "Run supabase/migrations/20260427_10_submissions_fk_profiles.sql in SQL Editor"
        location: "Supabase Dashboard -> SQL Editor"
      - task: "Run supabase/migrations/20260427_11_teacher_images.sql in SQL Editor (created in Task 1)"
        location: "Supabase Dashboard -> SQL Editor"

must_haves:
  truths:
    - "Vietnamese text in the grading view does not visually overlap (line-height >= 1.625)"
    - "Teacher must confirm a second time before a grade is persisted"
    - "Teacher can flip through every image a student attached (prev/next + counter)"
    - "Grading happens at /admin/submissions/:submissionId, not in a modal dialog"
    - "Teacher can attach feedback images while grading and student sees them after grading"
    - "Bell icon opens a dropdown listing graded-unviewed submissions, each linking to the right lesson"
    - "Clicking a notification deep-links to the course page with the correct lesson auto-selected"
  artifacts:
    - path: "supabase/migrations/20260427_11_teacher_images.sql"
      provides: "Adds teacher_images column to submissions"
      contains: "alter table public.submissions"
    - path: "src/pages/admin/GradingPage.tsx"
      provides: "Full-page grading UX with carousel, double confirm, teacher image upload"
      min_lines: 150
    - path: "src/lib/api/submissions.ts"
      provides: "teacher_images on Submission, gradeSubmission accepts optional teacher_images (return type stays Promise<void>), widened getSubmissionSignedUrls param type, new getGradedUnviewed"
      exports: ["gradeSubmission", "getGradedUnviewed", "getSubmissionSignedUrls", "parseFilePaths"]
    - path: "src/components/student/BellNotification.tsx"
      provides: "Dropdown with graded-unviewed list and outside-click close"
    - path: "src/components/student/SubmissionArea.tsx"
      provides: "Renders teacher feedback images when submission is graded"
    - path: "src/pages/student/CourseDetailPage.tsx"
      provides: "Reads ?lesson= query param and auto-selects lesson on mount"
  key_links:
    - from: "src/pages/admin/SubmissionsPage.tsx"
      to: "/admin/submissions/:submissionId"
      via: "react-router navigate()"
      pattern: "navigate\\(.*submissions/"
    - from: "src/pages/admin/GradingPage.tsx"
      to: "gradeSubmission"
      via: "submit handler with confirm step"
      pattern: "gradeSubmission\\("
    - from: "src/components/student/BellNotification.tsx"
      to: "getGradedUnviewed"
      via: "react-query useQuery"
      pattern: "getGradedUnviewed"
    - from: "src/pages/student/CourseDetailPage.tsx"
      to: "useSearchParams"
      via: "lesson query param -> auto select"
      pattern: "searchParams\\.get\\(.lesson.\\)"
---

<objective>
Close the four UAT gaps from Phase 05 (grading + notification): redesign the
admin grading flow as a dedicated page with carousel + double-confirm + teacher
image upload, ensure pending SQL migrations are applied, surface teacher
feedback images to the student, and turn the bell icon into a real
graded-unviewed dropdown that deep-links to the lesson.

Purpose: UAT failed on these four items. They block Phase 05 from being
considered done.
Output: One new migration, one new admin page, updates to API + four
components, and a documented manual migration step.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/05-grading-notification/05-01-SUMMARY.md

@src/lib/api/submissions.ts
@src/components/admin/GradingDialog.tsx
@src/pages/admin/SubmissionsPage.tsx
@src/components/student/BellNotification.tsx
@src/components/student/SubmissionArea.tsx
@src/pages/student/CourseDetailPage.tsx
@src/App.tsx
@supabase/migrations/20260407_07_student_viewed_at.sql
@supabase/migrations/20260427_10_submissions_fk_profiles.sql

<interfaces>
<!-- ACTUAL conventions in the existing codebase. -->
<!-- Executor: use these directly, do not re-derive. -->

From src/lib/api/submissions.ts (existing - VERIFIED against source):
- interface Submission { id, user_id, lesson_id, file_path: string, submitted_at, status: 'submitted' | 'graded', score: number | null, comment: string | null, student_viewed_at: string | null }
  NOTE: `file_path` is a JSON-encoded string (a single path or a JSON array of paths). There is NO `files: string[]` field. Use `parseFilePaths(file_path)` to get a `string[]`.
- export function parseFilePaths(filePath: string): string[]   // already exists - decodes JSON array OR returns [filePath] for legacy single path
- export async function gradeSubmission(id: string, score: number, comment: string): Promise<void>   // CURRENT signature - this plan adds an optional 4th arg, return type STAYS Promise<void>
- export async function getSubmissionSignedUrls(filePath: string): Promise<string[]>   // CURRENT signature accepts the raw `file_path` string; this plan widens it to `string | string[]` (parseFilePaths already handles both cases internally)
- export async function getSubmissionSignedUrl(path: string): Promise<string>   // @deprecated legacy single-image - do NOT call
- export async function markGradeViewed(submissionId: string): Promise<void>   // RPC wrapper for mark_submission_viewed

Storage bucket: `submissions`
Existing storage paths (student): `{userId}/{lessonId}/{timestamp}-{rand}.jpg`
New storage paths for teacher feedback: `teacher/{submissionId}/{timestamp}.jpg`

Image compression helper: `compressImage(file: File): Promise<File>` is already
exported from `src/lib/api/submissions.ts` (uses browser-image-compression with
HEIC fallback). Reuse it verbatim - do NOT roll a canvas-based compressor.
</interfaces>
</context>

<tasks>

<!-- ============================================================ -->
<!-- WAVE 1: SCHEMA + API (foundation for everything else)        -->
<!-- ============================================================ -->

<task type="auto">
  <name>Task 1: Create teacher_images migration</name>
  <files>supabase/migrations/20260427_11_teacher_images.sql</files>
  <action>
Create a new SQL migration file. Closes GAP-C (schema half).

Contents:

```sql
-- Phase 05 GAP-C: allow teachers to attach feedback images on a submission.
-- Stored as a JSON array of storage paths (text column for simplicity, no jsonb
-- needed because the app already serialises arrays of paths via JSON.stringify
-- elsewhere; keep it consistent with existing `file_path` column type).

alter table public.submissions
  add column if not exists teacher_images text;

comment on column public.submissions.teacher_images is
  'JSON-encoded array of storage paths (bucket: submissions, prefix: teacher/{submissionId}/) uploaded by the grader.';
```

Gotcha: the existing `file_path` column on `submissions` is `text` storing
JSON-encoded `string[]` (per Phase 05-01 SUMMARY). Match that exact pattern -
do NOT use `jsonb` or `text[]`, otherwise the API helpers will need a
different code path.
  </action>
  <verify>
    <automated>test -f supabase/migrations/20260427_11_teacher_images.sql && grep -q "teacher_images" supabase/migrations/20260427_11_teacher_images.sql</automated>
  </verify>
  <done>Migration file exists, references public.submissions, adds nullable text column teacher_images.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Extend submissions API (teacher_images + getGradedUnviewed) and widen getSubmissionSignedUrls</name>
  <files>src/lib/api/submissions.ts</files>
  <behavior>
    - `Submission` type includes `teacher_images: string[] | null` (decoded from JSON text on read).
    - `gradeSubmission(id, score, comment, teacherImages?)` writes `teacher_images` as JSON-encoded string when provided; when omitted, leaves the column unchanged. Return type STAYS `Promise<void>` (callers do not need the row).
    - `getSubmissionSignedUrls` parameter type widens from `string` to `string | string[]` so callers can pass either the raw `file_path` column value OR a pre-parsed `string[]` (e.g. teacher_images). The internal `parseFilePaths` already handles both forms - just widen the TS signature; minimal body change required.
    - `getGradedUnviewed()` returns submissions where `status = 'graded'` and `student_viewed_at is null`, joined to lesson + chapter + course for routing info, scoped to the current student via RLS.
  </behavior>
  <action>
Update `src/lib/api/submissions.ts` to close GAP-C (API half) and GAP-D (data
fetch).

1. Add to the `Submission` interface (alongside the existing fields):
   ```ts
   teacher_images: string[] | null
   ```
   Wherever rows are returned from Supabase and cast to `Submission`, decode
   `teacher_images` from JSON text (same pattern as `parseFilePaths`):
   ```ts
   const decoded: Submission = {
     ...(row as Submission),
     teacher_images: row.teacher_images ? (JSON.parse(row.teacher_images) as string[]) : null,
   }
   ```
   Apply this in `getSubmission`, `getSubmissions`, and the new
   `getGradedUnviewed` (Step 4). Existing call sites that don't read
   `teacher_images` can keep the simple cast - the field will just be
   `undefined` at runtime, which is fine because the type allows `null`.
   (If TS complains, do the decode in a tiny `mapSubmission(row)` helper and
   route all reads through it.)

2. Update `gradeSubmission` signature - KEEP `Promise<void>`, just add the
   optional 4th argument:
   ```ts
   export async function gradeSubmission(
     id: string,
     score: number,
     comment: string,
     teacherImages?: string[],
   ): Promise<void> {
     const update: Record<string, unknown> = {
       score,
       comment,
       status: 'graded',
     }
     if (teacherImages !== undefined) {
       update.teacher_images = teacherImages.length > 0 ? JSON.stringify(teacherImages) : null
     }
     const { error } = await supabase.from('submissions').update(update).eq('id', id)
     if (error) throw error
   }
   ```
   Do NOT add `.select()` and do NOT change the return type to
   `Promise<Submission>` - the navigator does not need the row, and changing
   it would break existing callers.

3. Widen `getSubmissionSignedUrls` parameter type:
   ```ts
   export async function getSubmissionSignedUrls(
     filePath: string | string[],
   ): Promise<string[]> {
     const paths = Array.isArray(filePath) ? filePath : parseFilePaths(filePath)
     // ...rest unchanged (Promise.all over paths -> createSignedUrl)
   }
   ```
   This is the ONLY body change needed - everything downstream already operates
   on `string[]`. The legacy `getSubmissionSignedUrl(path: string)` wrapper
   keeps its current signature.

4. Add new export for the bell:
   ```ts
   export type GradedUnviewedSubmission = Submission & {
     lesson: {
       id: string
       title: string
       slug: string | null
       chapter: {
         course_id: string
         course: { title: string; slug: string }
       }
     }
   }

   export async function getGradedUnviewed(): Promise<GradedUnviewedSubmission[]> {
     const { data, error } = await supabase
       .from('submissions')
       .select(`
         *,
         lessons:lesson_id (
           id, title, slug,
           chapters:chapter_id (
             course_id,
             courses:course_id ( title, slug )
           )
         )
       `)
       .eq('status', 'graded')
       .is('student_viewed_at', null)
       .order('submitted_at', { ascending: false })

     if (error) throw error
     return (data ?? []).map(/* normalise nested join + decode teacher_images */)
   }
   ```
   Normalise the nested `lessons` -> `chapters` -> `courses` shape into the
   flat `lesson.chapter.course` shape declared above so callers do not have to
   reach through Supabase's relation aliases.

Gotchas:
- Supabase returns embedded relations as arrays for to-many and as objects for
  to-one - `lessons:lesson_id(...)` is to-one so it comes back as an object,
  but typings often widen to `unknown`. Cast defensively.
- RLS already restricts `submissions` to the current user for students - do
  NOT add an extra `.eq('user_id', user.id)` filter, that would break if an
  admin uses the same helper.
- The `submissions` table does NOT have a `graded_at` column today - sort by
  `submitted_at` instead (or add it via a separate migration if you really
  need recency sort; out of scope for this plan).
  </action>
  <verify>
    <automated>yarn tsc --noEmit</automated>
  </verify>
  <done>
Type compiles. `gradeSubmission` accepts an optional 4th `teacherImages`
argument and STILL returns `Promise<void>`. `getSubmissionSignedUrls` accepts
`string | string[]`. `getGradedUnviewed` exported.
`Submission.teacher_images` is `string[] | null`.
  </done>
</task>

<!-- ============================================================ -->
<!-- WAVE 2: GRADING PAGE (depends on API)                        -->
<!-- ============================================================ -->

<task type="auto" tdd="false">
  <name>Task 3: Build GradingPage with carousel + double-confirm + teacher upload</name>
  <files>
    src/pages/admin/GradingPage.tsx,
    src/App.tsx,
    src/pages/admin/SubmissionsPage.tsx,
    src/components/admin/GradingDialog.tsx
  </files>
  <behavior>
    - Visiting `/admin/submissions/:submissionId` loads the submission and shows the student's images in a carousel with prev/next + "i / N" counter.
    - All Vietnamese text blocks use `leading-relaxed` (Tailwind) so diacritics never overlap.
    - Pressing "Lưu điểm" reveals an inline confirm step ("Bạn chắc chắn muốn lưu điểm X/10?") with "Xác nhận" + "Hủy" buttons. Only "Xác nhận" calls `gradeSubmission`.
    - Grader can attach feedback images (compressed JPEG, uploaded to `submissions/teacher/{submissionId}/{Date.now()}.jpg`); the resulting paths are passed as the 4th arg to `gradeSubmission`.
    - Old `GradingDialog` is no longer rendered; `SubmissionsPage` navigates to the new route instead.
  </behavior>
  <action>
Closes GAP-A in full and the UI half of GAP-C.

1. Create `src/pages/admin/GradingPage.tsx`:
   - `useParams<{ submissionId: string }>()` -> fetch submission via React Query (`['submission', submissionId]`).
   - Resolve student image URLs by passing the raw column through the (now-widened) helper:
     ```ts
     const studentUrls = await getSubmissionSignedUrls(submission.file_path)
     // OR equivalently:
     // const studentUrls = await getSubmissionSignedUrls(parseFilePaths(submission.file_path))
     ```
     IMPORTANT: There is NO `submission.files` field on the `Submission`
     interface - the column is `file_path: string`. Use either `submission.file_path`
     directly (the helper now accepts a string) OR `parseFilePaths(submission.file_path)`
     to get a `string[]` first. Both work because Task 2 widened the param type
     to `string | string[]`.
   - Carousel: `useState<number>(0)` for index; "prev" / "next" buttons (`Button variant="outline" size="icon"`) wrap with modulo; show `<img src={urls[idx]} className="max-h-[70vh] mx-auto rounded-lg" />` and a counter `{idx + 1} / {urls.length}`.
   - Score input: `Input type="number" min={0} max={10} step={0.5}`.
   - Comment: `Textarea` with `className="leading-relaxed"`.
   - Apply `leading-relaxed` to every paragraph / label / helper text containing Vietnamese (this is the line-height fix from GAP-A.1).
   - Teacher image upload:
     - File input `accept="image/*" multiple`.
     - Reuse the exported `compressImage` helper from `@/lib/api/submissions` (it already handles JPEG compression + HEIC fallback). Do NOT roll a new compressor.
     - For each compressed file: `supabase.storage.from('submissions').upload(\`teacher/${submissionId}/${Date.now()}-${i}.jpg\`, file, { contentType: 'image/jpeg' })`.
     - Track uploaded paths in local state; render thumbnails below the input with a remove (X) button.
   - Save flow (GAP-A.2 - double confirm):
     ```tsx
     const [pendingConfirm, setPendingConfirm] = useState(false);
     // "Lưu điểm" button onClick: setPendingConfirm(true)
     // When pendingConfirm:
     //   render: <Alert><p className="leading-relaxed">Bạn chắc chắn muốn lưu điểm {score}/10?</p>
     //            <Button onClick={handleConfirm}>Xác nhận</Button>
     //            <Button variant="ghost" onClick={() => setPendingConfirm(false)}>Hủy</Button></Alert>
     ```
     `handleConfirm` calls `gradeSubmission(submissionId, score, comment, teacherImagePaths)` (note: returns `Promise<void>` - do NOT try to read the result), then `navigate('/admin/submissions')` and toasts success.
   - On error: toast (Sonner) and DO NOT navigate away.
   - Layout: full-page (`container mx-auto py-8 max-w-5xl`), two-column on `lg:` (carousel left, form right), single column on mobile.

2. `src/App.tsx`:
   - Add `import GradingPage from '@/pages/admin/GradingPage';`
   - Add route inside the same `<Routes>` block, before the catch-all `*`:
     ```tsx
     <Route path="/admin/submissions/:submissionId" element={<GradingPage />} />
     ```

3. `src/pages/admin/SubmissionsPage.tsx`:
   - Remove all state + JSX related to opening `GradingDialog` (the `selectedId`, `open`, `<GradingDialog .../>`, the `onClick={() => setSelectedId(...)}` handler).
   - Replace the row action button with:
     ```tsx
     <Button size="sm" onClick={() => navigate(`/admin/submissions/${row.id}`)}>Chấm</Button>
     ```
   - Add `const navigate = useNavigate();` from `react-router-dom`.
   - Remove the `import GradingDialog ...` line.

4. `src/components/admin/GradingDialog.tsx`:
   - Delete the file. If something elsewhere still imports it, fix that import to point at `GradingPage` route navigation instead. (Run `grep -r "GradingDialog" src/` after deletion to confirm no stragglers.)

Gotchas:
- The dialog's previous behaviour swallowed `Escape` to close; the page must
  not. Just rely on the browser back button + an explicit "Quay lại" link.
- `getSubmissionSignedUrl` (singular, deprecated) MUST NOT be called from this
  page - using it for the first file only is exactly the bug GAP-A.3 reports.
- React Query: invalidate `['submissions']` after a successful grade so
  `SubmissionsPage`'s list refetches when the user navigates back.
- The `submissions` storage bucket already exists and has RLS allowing
  authenticated uploads under any prefix (per Phase 05-01); no new bucket /
  policy work is required for the `teacher/` prefix.
  </action>
  <verify>
    <automated>yarn tsc --noEmit && yarn lint</automated>
  </verify>
  <done>Route works, carousel navigates all images with counter, "Lưu điểm" requires a second click on "Xác nhận", teacher images upload to `teacher/{submissionId}/...` and persist via `gradeSubmission`. `GradingDialog.tsx` removed and unreferenced.</done>
</task>

<!-- ============================================================ -->
<!-- WAVE 3: STUDENT-FACING FEATURES (depend on API + schema)     -->
<!-- ============================================================ -->

<task type="auto" tdd="false">
  <name>Task 4: Show teacher feedback images in SubmissionArea</name>
  <files>src/components/student/SubmissionArea.tsx</files>
  <behavior>
    - When `submission.status === 'graded'` AND `submission.teacher_images` is a non-empty array, the component renders those images below the existing score/comment block.
    - When `teacher_images` is null/empty, nothing extra is rendered (no broken image, no empty heading).
    - All new Vietnamese text uses `leading-relaxed`.
  </behavior>
  <action>
Closes the student half of GAP-C.

1. After the existing graded block (the one that shows score + comment), add:
   ```tsx
   {submission.status === 'graded' && submission.teacher_images && submission.teacher_images.length > 0 && (
     <div className="mt-4 space-y-2">
       <h4 className="font-semibold leading-relaxed">Hình ảnh phản hồi từ giáo viên</h4>
       <TeacherImages paths={submission.teacher_images} />
     </div>
   )}
   ```

2. Implement `TeacherImages` (note: pass the `string[]` directly - the
   widened `getSubmissionSignedUrls` accepts it):
   ```tsx
   function TeacherImages({ paths }: { paths: string[] }) {
     const { data: urls } = useQuery({
       queryKey: ['teacher-images', paths],
       queryFn: () => getSubmissionSignedUrls(paths),
       enabled: paths.length > 0,
     });
     if (!urls) return null;
     return (
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
         {urls.map((u, i) => (
           <a key={i} href={u} target="_blank" rel="noreferrer">
             <img src={u} alt={`Phản hồi ${i + 1}`} className="rounded-md border w-full h-32 object-cover" />
           </a>
         ))}
       </div>
     );
   }
   ```

Gotchas:
- `getSubmissionSignedUrls` already exists and (after Task 2) accepts both
  `string` and `string[]`; reuse it - do NOT roll a new signed URL helper.
- React Query key must include `paths` (or a hash of them) so that re-grading
  with new images busts the cache.
  </action>
  <verify>
    <automated>yarn tsc --noEmit</automated>
  </verify>
  <done>Graded submissions with teacher_images render a grid of feedback images; ungraded or imageless submissions render nothing extra.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 5: Bell dropdown with graded-unviewed list + outside-click close</name>
  <files>
    src/components/student/BellNotification.tsx,
    src/pages/student/CourseDetailPage.tsx
  </files>
  <behavior>
    - Clicking the bell toggles a dropdown panel anchored under the icon.
    - The panel lists each graded-unviewed submission: lesson title, course title, score (e.g. "8.5/10").
    - Each item is a link to `/courses/:courseSlug?lesson=:lessonId`.
    - Clicking outside the panel (or the bell again) closes it.
    - `CourseDetailPage` reads `?lesson=` on mount and auto-selects/scrolls to that lesson; if the param is missing it behaves exactly as before.
  </behavior>
  <action>
Closes GAP-D.

1. `src/components/student/BellNotification.tsx`:
   - Add state: `const [open, setOpen] = useState(false);`
   - Add ref: `const containerRef = useRef<HTMLDivElement>(null);`
   - Add data fetch:
     ```ts
     const { data: items = [] } = useQuery({
       queryKey: ['graded-unviewed'],
       queryFn: getGradedUnviewed,
       refetchInterval: 60_000,
     });
     ```
     Replace the existing badge count source with `items.length`.
   - Outside-click handler:
     ```ts
     useEffect(() => {
       if (!open) return;
       const onDown = (e: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
           setOpen(false);
         }
       };
       document.addEventListener('mousedown', onDown);
       return () => document.removeEventListener('mousedown', onDown);
     }, [open]);
     ```
   - JSX:
     ```tsx
     <div ref={containerRef} className="relative">
       <button onClick={() => setOpen(o => !o)} aria-label="Thông báo" className="relative">
         <Bell className="h-5 w-5" />
         {items.length > 0 && (
           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
             {items.length}
           </span>
         )}
       </button>
       {open && (
         <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
           {items.length === 0 ? (
             <p className="p-4 text-sm text-muted-foreground leading-relaxed">Chưa có bài nào được chấm.</p>
           ) : (
             <ul className="divide-y">
               {items.map(item => {
                 const courseSlug = item.lesson.chapter.course.slug;
                 const href = `/courses/${courseSlug}?lesson=${item.lesson.id}`;
                 return (
                   <li key={item.id}>
                     <Link to={href} onClick={() => setOpen(false)} className="block p-3 hover:bg-muted">
                       <p className="font-medium leading-relaxed">{item.lesson.title}</p>
                       <p className="text-xs text-muted-foreground leading-relaxed">{item.lesson.chapter.course.title}</p>
                       {typeof item.score === 'number' && (
                         <p className="text-sm leading-relaxed">Điểm: {item.score}/10</p>
                       )}
                     </Link>
                   </li>
                 );
               })}
             </ul>
           )}
         </div>
       )}
     </div>
     ```
   - Imports: `useEffect, useRef, useState` from 'react'; `useQuery` from `@tanstack/react-query`; `Link` from `react-router-dom`; `Bell` from `lucide-react`; `getGradedUnviewed` from `@/lib/api/submissions`.

2. `src/pages/student/CourseDetailPage.tsx`:
   - Import `useSearchParams` from `react-router-dom`.
   - `const [searchParams] = useSearchParams();`
   - `const lessonIdFromQuery = searchParams.get('lesson');`
   - In the existing effect that initialises the active lesson (or add a new `useEffect` that runs once lessons are loaded):
     ```ts
     useEffect(() => {
       if (!lessonIdFromQuery || !lessons?.length) return;
       const found = lessons.find(l => l.id === lessonIdFromQuery);
       if (found) {
         setActiveLessonId(found.id);   // use whatever the existing state setter is named
         // optional: scroll into view
         requestAnimationFrame(() => {
           document.getElementById(`lesson-${found.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
         });
       }
     }, [lessonIdFromQuery, lessons]);
     ```
   - When the user clicks a notification and lands here, also call
     `markGradeViewed(submissionId)` if appropriate. NOTE: the bell items
     do not currently include `submissionId` -> lesson is enough; the existing
     "mark viewed" trigger should already fire when the lesson view records a
     view. If not, add an extra effect that, when `lessonIdFromQuery` matches a
     graded submission of the current user, calls the RPC. Keep this minimal -
     do not refactor the lesson page wholesale.

Gotchas:
- The existing `BellNotification` likely uses `onClick` on a wrapped `Button`
  from shadcn; switch to a plain `<button>` so that clicks INSIDE the dropdown
  links do not bubble through the toggle handler. (Or `e.stopPropagation()` on
  the toggle.)
- `Link` navigation does NOT remount `CourseDetailPage` when already on the
  same course slug - the new effect must depend on `lessonIdFromQuery` so it
  reruns when only the query string changes.
- Keep the dropdown z-index above the page header (`z-50` is enough given the
  current header is `z-40`).
  </action>
  <verify>
    <automated>yarn tsc --noEmit && yarn lint</automated>
  </verify>
  <done>Bell shows real graded-unviewed list, dropdown closes on outside click, navigating to a notification opens the right course page with the correct lesson active.</done>
</task>

<!-- ============================================================ -->
<!-- WAVE 4: HUMAN GATE for migrations + smoke test               -->
<!-- ============================================================ -->

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 6: Apply pending Supabase migrations</name>
  <what-built>Three SQL migrations exist in `supabase/migrations/` but have not been applied to the live Supabase project.</what-built>
  <how-to-verify>
    Closes GAP-B.

    Open Supabase Dashboard -> SQL Editor for the BuMath project, then run
    each of the following migrations in order. Paste the file contents into
    the editor and execute. After each, confirm "Success. No rows returned"
    or similar.

    1. `supabase/migrations/20260407_07_student_viewed_at.sql`
       - Adds `student_viewed_at timestamptz` to `submissions`.
       - Creates RPC `mark_submission_viewed(submission_id uuid)`.

    2. `supabase/migrations/20260427_10_submissions_fk_profiles.sql`
       - Adds the missing FK from `submissions.student_id` -> `profiles.id`
         so PostgREST joins resolve.

    3. `supabase/migrations/20260427_11_teacher_images.sql` (created in Task 1)
       - Adds nullable `teacher_images text` column to `submissions`.

    Smoke check after applying:
    - In SQL Editor: `select column_name from information_schema.columns where table_name='submissions' and column_name in ('student_viewed_at','teacher_images');` -> should return both rows.
    - In SQL Editor: `select proname from pg_proc where proname='mark_submission_viewed';` -> should return one row.
    - Reload the app and confirm the bell badge no longer 500s.
  </how-to-verify>
  <resume-signal>Type "applied" once all three migrations have been executed successfully, or describe any error.</resume-signal>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 7: End-to-end UAT re-run</name>
  <what-built>All four UAT gaps (A-D) are now closed in code and the database.</what-built>
  <how-to-verify>
    1. As an admin, open `/admin/submissions`, click "Chấm" on a submission with multiple images.
       - URL is `/admin/submissions/:id`, NOT a modal.
       - Use prev/next to flip through every image; counter "i / N" updates.
       - Vietnamese labels do not visibly overlap (line-height looks comfortable).
       - Upload 1-2 feedback images; thumbnails appear.
       - Enter score 8.5 + a Vietnamese comment, click "Lưu điểm".
       - A confirm prompt appears with "Bạn chắc chắn muốn lưu điểm 8.5/10?".
       - Cancel once to verify it does NOT save; click "Lưu điểm" then "Xác nhận" to save.
       - Toast says success; you are returned to the list.

    2. As the student who owns that submission:
       - Bell icon shows a red badge with count >= 1.
       - Click bell -> dropdown lists the graded lesson with score 8.5/10 and the course title.
       - Click outside -> dropdown closes.
       - Click the item -> lands on the course page with that exact lesson auto-selected/highlighted.
       - In the lesson view, the submission area shows score, comment, AND a grid of the teacher's feedback images.

    3. Refresh - bell badge decrements (after the lesson view marks it viewed).
  </how-to-verify>
  <resume-signal>Type "approved" or describe any remaining issues per gap (A/B/C/D).</resume-signal>
</task>

</tasks>

<verification>
- `yarn tsc --noEmit` passes (no type errors after Submission shape change).
- `yarn lint` passes.
- `grep -r "GradingDialog" src/` returns no matches (file deleted, no stale imports).
- `grep -n "leading-relaxed" src/pages/admin/GradingPage.tsx` returns multiple hits (the line-height fix is actually applied).
- `grep -n "getSubmissionSignedUrls" src/pages/admin/GradingPage.tsx` returns at least one hit (no legacy singular call on this page).
- The three SQL migrations have been executed against the live Supabase project (Task 6).
- Manual UAT (Task 7) passes for all four gaps.
</verification>

<success_criteria>
- GAP-A: Grading is a dedicated page with carousel, double-confirm, and proper Vietnamese line-height.
- GAP-B: All three pending migrations are applied; bell + grading no longer error on missing columns/FK.
- GAP-C: Teachers can attach feedback images during grading; students see them once graded.
- GAP-D: Bell icon opens a real notifications dropdown; clicking an item deep-links to the correct lesson.
</success_criteria>

<output>
After completion, create `.planning/phases/05-grading-notification/05-02-GAP-SUMMARY.md`
documenting which gaps were closed, the new files added, the migration steps the user
performed, and any deviations from this plan.
</output>
