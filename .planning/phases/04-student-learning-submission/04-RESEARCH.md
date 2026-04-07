# Phase 4: Student Learning & Submission - Research

**Researched:** 2026-04-07
**Domain:** React SPA — student learning portal, YouTube embed, client-side image compression, Supabase Storage, RLS-protected progress tracking
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Route `/courses` — redirect after successful login (student approved).
- **D-02:** Card grid: 2-col desktop, 1-col mobile. Each card: course name, grade label (Toán 7/8/9/Ôn chuyên), progress bar % complete.
- **D-03:** Empty state when no courses: "Bạn chưa được gán vào khóa học nào. Vui lòng liên hệ giảng viên."
- **D-04:** Student pages use a separate compact header (not marketing Header): logo + student name + Đăng xuất button.
- **D-05:** Create `StudentLayout` component shared by all student pages (`/courses`, `/courses/:id`).
- **D-06:** Course detail page (`/courses/:courseId`) uses **sidebar layout**: desktop = left sidebar (collapsible tree with ✓/→/○ icons) + right content (video + description + assignment + submit). Mobile (375px) = 2 tabs "Nội dung" / "Mục lục" — tab switching does NOT reload data.
- **D-07:** URL does not change when selecting a different lesson within the same course — lesson selection via local state (no nested route). Reason: avoid full page reload on lesson switch.
- **D-08:** Breadcrumb: "← Khóa học của tôi" linking back to `/courses`.
- **D-09:** "✓ Đánh dấu đã xem" button when lesson not completed. After click: button becomes "Đã xem ✓" and **disabled** (no toggle back). Progress bar updates immediately (optimistic update).
- **D-10:** Lesson completion is one-way — no unmark. Students only move forward.
- **D-11:** Click "Đề bài: Xem file" → open new tab with Supabase Storage URL. Browser handles PDF/image rendering. Not embedded in page.
- **D-12:** Submission area inline below assignment section in lesson page. Order: video → description → assignment → submit area → mark-complete button.
- **D-13:** Submission area only shown when `lesson.assignment_path !== null`.
- **D-14:** Submission status clearly displayed: "Chưa nộp" / "Đã nộp (đang chờ chấm)" / "Đã chấm — Điểm: X".
- **D-15:** Submit once only — after submission, student can only view submitted image and status. No resubmission (v2).
- **D-16:** Use **`browser-image-compression`** library — compress client-side to <500KB before upload.
- **D-17:** Auto-convert HEIC→JPEG transparently (user unaware) — use `fileType: 'image/jpeg'` option of browser-image-compression, combined with heic2any if needed.
- **D-18:** Show loading state during compress + upload (progress indicator or spinner).

### Claude's Discretion

- Supabase Storage path convention for submissions — e.g., `submissions/{userId}/{lessonId}/{timestamp}.jpg`
- Exact shadcn/ui components for sidebar tree — Accordion, Collapsible, or custom
- `lesson_progress` table schema — must track: user_id, lesson_id, completed_at
- `submissions` table schema — must track: user_id, lesson_id, file_path, submitted_at, status

### Deferred Ideas (OUT OF SCOPE)

- Resubmission (nộp lại) → LEARN-V2-03, Phase 5+ or v2
- Locked lesson sequencing → LEARN-V2-01, v2
- Student dashboard "Tiếp theo" CTA → LEARN-V2-02, v2
- Bottom navigation bar for mobile student portal → v2 (if more sections added)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LEARN-01 | Student sees only their enrolled courses immediately after login | getUserEnrollments() exists in `src/lib/api/enrollments.ts`; query by profile.id; redirect to /courses from login on approved role |
| LEARN-02 | Student can watch lesson via YouTube embed without leaving app | `<AspectRatio>` + `<iframe>` pattern; video_url stored as embed URL in lessons table; existing extractYouTubeID function in Phase 3 |
| LEARN-03 | Student can view/download attached assignment file | `getAssignmentPublicUrl()` exists in `src/lib/api/lessons.ts`; open in new tab via `window.open` |
| LEARN-04 | Student can mark lesson as complete | New `lesson_progress` table + `markLessonComplete()` API function; TanStack Query mutation with optimistic update |
| LEARN-05 | Student sees progress bar % complete per course | Compute (completed lessons / total lessons) * 100 from lesson_progress + lessons count; shadcn `<Progress>` component already installed |
| SUBMIT-01 | Student can upload photo of handwritten work | Supabase Storage `submissions` bucket; file input with `accept="image/*,image/heic"`; `uploadSubmission()` API function |
| SUBMIT-02 | Image compressed client-side to <500KB before upload | `browser-image-compression` v2.0.2 (confirmed current); `heic2any` v0.0.4 for HEIC fallback |
| SUBMIT-03 | Student sees clear assignment status: Chưa nộp / Đã nộp / Đã chấm | `submissions` table with `status` enum; query by user_id + lesson_id enforced by RLS |
| SUBMIT-04 | Student only sees their own submissions | RLS policy on `submissions` table: `user_id = auth.uid()` |
| UX-01 | All main flows work on 375px viewport | Mobile-first design; 2-tab layout replaces sidebar on mobile; test at 375px breakpoint |
| UX-02 | All buttons/interactive areas minimum 48x48px | `min-h-[48px]` on all interactive elements; established pattern from Phase 3 CoursesPage.tsx |
</phase_requirements>

---

## Summary

Phase 4 builds the student-facing learning portal on top of the existing Supabase + TanStack Query + shadcn/ui stack established in Phases 1–3. All required UI primitives are already installed (Card, Progress, Badge, Tabs, Accordion, AspectRatio, ScrollArea). The data access layer has enrollments, courses, chapters, and lessons APIs already written — Phase 4 adds two new tables (`lesson_progress`, `submissions`) and their corresponding API modules.

The key technical challenges are: (1) designing RLS policies for the two new tables so students can only read/write their own records, (2) implementing optimistic updates for lesson completion with rollback on error, and (3) client-side image compression with transparent HEIC-to-JPEG conversion before Supabase Storage upload.

The UI contract is fully specified in `04-UI-SPEC.md`. No new shadcn/ui components need to be installed. The `browser-image-compression` library (v2.0.2, current) and optionally `heic2any` (v0.0.4) need to be added via yarn.

**Primary recommendation:** Follow the TanStack Query + Supabase typed-function pattern from `src/lib/api/` for all new API calls. Write RLS policies first (Wave 0), then API layer, then UI components, then connect them.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.78.0 (pinned) | DB + Storage + Auth queries | Already in project; pinned for Node 18 compatibility |
| @tanstack/react-query | ^5.83.0 | Server state, caching, mutations | Already in project; useQuery + useMutation pattern established |
| react-router-dom | ^6.30.1 | /courses and /courses/:courseId routes | Already in project |
| shadcn/ui (Radix) | installed | Card, Progress, Tabs, Accordion, AspectRatio, etc. | All needed components already installed |
| tailwindcss | ^3.4.17 | Utility styling | Already in project |
| lucide-react | ^0.462.0 | Icons (Check, ChevronRight, Circle, Camera, ExternalLink, Loader2) | Already in project |
| sonner | ^1.7.4 | Toast notifications (success/error) | Already in project |

### New Dependencies for Phase 4

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| browser-image-compression | 2.0.2 | Client-side JPEG/PNG compression to <500KB | Always before upload (SUBMIT-02) |
| heic2any | 0.0.4 | HEIC→JPEG conversion in browser | Needed if browser-image-compression alone doesn't handle HEIC on some devices |

**Version verification (confirmed against npm registry 2026-04-07):**
- `browser-image-compression`: 2.0.2 (latest, last published 2023-03-06)
- `heic2any`: 0.0.4 (latest)

**Installation:**
```bash
yarn add browser-image-compression heic2any
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| browser-image-compression | Compressor.js, canvas resize | browser-image-compression is locked by D-16 |
| heic2any | libheif-js | heic2any is simpler API, sufficient for single-file conversion |
| Local state for active lesson | Nested routes (/courses/:id/lessons/:id) | Locked by D-07 — nested route causes full page reload |

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── pages/student/
│   ├── CoursesPage.tsx          # /courses — enrolled course list
│   └── CourseDetailPage.tsx     # /courses/:courseId — lesson viewer
├── components/student/
│   ├── StudentLayout.tsx        # Shared layout: compact header + body
│   ├── CourseCard.tsx           # Card with progress bar (used in CoursesPage)
│   ├── LessonSidebar.tsx        # Desktop sidebar tree (Accordion chapters + lesson items)
│   ├── LessonContent.tsx        # Right panel: video + description + assignment + submit
│   ├── SubmissionArea.tsx       # Upload photo section with compression logic
│   └── LessonProgressButton.tsx # Mark complete button with optimistic update
└── lib/api/
    ├── lesson-progress.ts       # markLessonComplete(), getLessonProgress()
    └── submissions.ts           # uploadSubmission(), getSubmission(), getSubmissionUrl()
```

### Pattern 1: TanStack Query + Supabase Typed Function

**What:** All data fetching via `useQuery` with typed API functions that throw on error. Mutations use `useMutation` + `queryClient.invalidateQueries`.
**When to use:** Every Supabase read/write in this phase.
**Example (from existing `src/lib/api/enrollments.ts`):**
```typescript
// Follows this exact pattern for new lesson_progress and submissions APIs
export async function getLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed_at')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds)  // filter to this course's lessons
  if (error) throw error
  return data as LessonProgress[]
}
```

### Pattern 2: Optimistic Update with Rollback

**What:** On "mark complete" click, immediately update UI state before API call resolves. Roll back on error and show toast.
**When to use:** LEARN-04 mark complete button (D-09).
**Example:**
```typescript
// Source: TanStack Query v5 optimistic updates pattern
const mutation = useMutation({
  mutationFn: (lessonId: string) => markLessonComplete(userId, lessonId),
  onMutate: async (lessonId) => {
    await queryClient.cancelQueries({ queryKey: ['lesson-progress', courseId] })
    const previous = queryClient.getQueryData(['lesson-progress', courseId])
    queryClient.setQueryData(['lesson-progress', courseId], (old: LessonProgress[]) => [
      ...old,
      { lesson_id: lessonId, completed_at: new Date().toISOString() }
    ])
    return { previous }
  },
  onError: (_err, _lessonId, context) => {
    queryClient.setQueryData(['lesson-progress', courseId], context?.previous)
    toast.error('Không thể lưu trạng thái. Vui lòng thử lại.')
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['lesson-progress', courseId] })
  },
})
```

### Pattern 3: Client-Side Image Compression

**What:** Use `browser-image-compression` before Supabase Storage upload. Convert HEIC files to JPEG first.
**When to use:** SUBMIT-02 — always before `supabase.storage.from('submissions').upload()`.
**Example:**
```typescript
import imageCompression from 'browser-image-compression'

async function compressAndUpload(file: File): Promise<string> {
  const options = {
    maxSizeMB: 0.5,          // 500KB limit (SUBMIT-02)
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',  // auto-converts HEIC to JPEG (D-17)
  }
  const compressed = await imageCompression(file, options)
  // Guard: reject if still > 500KB after compression
  if (compressed.size > 512_000) {
    throw new Error('IMAGE_TOO_LARGE')
  }
  // Upload to Supabase Storage
  const path = `submissions/${userId}/${lessonId}/${Date.now()}.jpg`
  const { error } = await supabase.storage.from('submissions').upload(path, compressed, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) throw error
  return path
}
```

### Pattern 4: YouTube Embed

**What:** Embed YouTube video using `<AspectRatio ratio={16/9}>` wrapping an `<iframe>` with `src` set to the embed URL stored in `lessons.video_url`.
**When to use:** LEARN-02 — every lesson with a non-null video_url.
**Example:**
```tsx
// video_url is stored as embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)
// established in Phase 3 — extractYouTubeID normalises any YouTube URL to embed URL
<AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden">
  <iframe
    src={lesson.video_url}
    title={`Video bài học: ${lesson.title}`}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="w-full h-full border-0"
  />
</AspectRatio>
```

### Pattern 5: Supabase Storage Path Convention (Claude's Discretion)

**Recommended path:** `submissions/{userId}/{lessonId}/{timestamp}.jpg`

Rationale:
- Mirrors existing `assignments` bucket pattern (`{pathPrefix}/{timestamp}.ext`)
- `userId` as first segment enables RLS storage policy using `(storage.foldername(name))[1] = auth.uid()::text`
- `lessonId` as second segment groups submissions per lesson for easy admin listing in Phase 5
- Timestamp ensures uniqueness even if student somehow submits twice before RLS blocks it

### Pattern 6: Mobile Tabs Layout

**What:** On mobile (375px), replace the sidebar with a `<Tabs>` component at top of page. "Nội dung" tab = content panel. "Mục lục" tab = lesson tree. Both tabs share the same TanStack Query cache — no data re-fetch on switch (D-06, D-07).
**Example:**
```tsx
// Mobile breakpoint — show Tabs. Desktop — show flex row with sidebar.
<div className="block md:hidden">
  <Tabs defaultValue="content">
    <TabsList className="w-full h-12">  {/* 48px height for UX-02 */}
      <TabsTrigger value="content" className="flex-1">Nội dung</TabsTrigger>
      <TabsTrigger value="outline" className="flex-1">Mục lục</TabsTrigger>
    </TabsList>
    <TabsContent value="content"><LessonContent ... /></TabsContent>
    <TabsContent value="outline"><LessonSidebar ... /></TabsContent>
  </Tabs>
</div>
<div className="hidden md:flex h-[calc(100vh-48px)]">
  <LessonSidebar ... />
  <LessonContent ... />
</div>
```

### Database Schema (Claude's Discretion)

**`lesson_progress` table:**
```sql
create table lesson_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_id   uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)  -- one completion record per student per lesson
);

-- RLS
alter table lesson_progress enable row level security;
create policy "Students can insert own progress"
  on lesson_progress for insert
  with check (user_id = auth.uid());
create policy "Students can read own progress"
  on lesson_progress for select
  using (user_id = auth.uid());
-- No update/delete for students — completion is one-way (D-10)
```

**`submissions` table:**
```sql
create table submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    uuid not null references lessons(id) on delete cascade,
  file_path    text not null,
  submitted_at timestamptz not null default now(),
  status       text not null default 'submitted'
                check (status in ('submitted', 'graded')),
  score        numeric(5,2),        -- nullable; populated in Phase 5
  comment      text,                -- nullable; populated in Phase 5
  unique (user_id, lesson_id)       -- one submission per student per lesson (D-15)
);

-- RLS
alter table submissions enable row level security;
create policy "Students can insert own submissions"
  on submissions for insert
  with check (user_id = auth.uid());
create policy "Students can read own submissions"
  on submissions for select
  using (user_id = auth.uid());
-- No update/delete for students (D-15)
-- Teachers/admin read-all policy added in Phase 5
```

**Supabase Storage `submissions` bucket:**
```sql
-- Create bucket (can be done in Supabase dashboard or migration)
-- Private bucket (not public) — use createSignedUrl for viewing submitted images
-- Storage RLS: students can upload to their own userId folder
create policy "Students can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Students can read own submissions"
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

Note: Use `createSignedUrl` (not `getPublicUrl`) for submitted images because the submissions bucket should be private (student data).

### Anti-Patterns to Avoid

- **Fetching all courses then filtering client-side:** Use `getUserEnrollments(userId)` which already does a DB-side JOIN. Never fetch `fetchCourses()` for student pages — that returns ALL courses regardless of enrollment.
- **Nested routes for lesson selection:** Locked by D-07. Local state only.
- **Uploading without compression:** Always run `imageCompression()` first, even for small files — it also handles the HEIC conversion (D-16, D-17).
- **Public bucket for submissions:** Submissions are student work, use private bucket + signed URLs.
- **Forgetting the UNIQUE constraint on `(user_id, lesson_id)` in submissions:** Without it, a race condition could allow duplicate submissions.
- **Storing progress percentage in DB:** Calculate completion % at query time from `lesson_progress` count vs total lesson count. Avoids stale denormalized data.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image compression | Custom canvas resize loop | `browser-image-compression` | Handles quality/size tradeoffs, web worker threading, multiple formats |
| HEIC detection + convert | Manual MIME-type check + ArrayBuffer inspection | `fileType: 'image/jpeg'` option in browser-image-compression | Library handles it transparently; heic2any as fallback |
| Progress percentage | Storing computed % in DB | Compute: `(completedCount / totalCount) * 100` in query layer | Always fresh, no sync issues |
| YouTube ID extraction | Regex over URL | Already done — Phase 3 `extractYouTubeID` normalises to embed URL at save time; just use `lesson.video_url` directly | Already solved |
| Collapsible chapter list | Custom accordion | shadcn `<Accordion type="multiple">` — already installed | Handles keyboard nav, aria, animation |
| Scroll container for sidebar | overflow-y: auto with custom scrollbar | shadcn `<ScrollArea>` — already installed | Cross-browser consistent scrollbar |

**Key insight:** All UI primitives are already in the project. The only new code is API layer (2 new modules), Supabase schema (2 tables + 1 bucket), and page/component composition.

---

## Common Pitfalls

### Pitfall 1: HEIC Compression Failure on Older iOS

**What goes wrong:** `browser-image-compression` with `fileType: 'image/jpeg'` handles HEIC on most devices, but some older iOS Safari versions fail silently or throw.
**Why it happens:** HEIC support in browser APIs is inconsistent. Safari supports HEIC display but not always programmatic conversion via Canvas.
**How to avoid:** Wrap compression in try/catch. If it throws and input MIME is `image/heic`, attempt `heic2any(file, { toType: 'image/jpeg' })` first, then compress the result.
**Warning signs:** User reports "Đang xử lý..." spinner that never resolves on iPhone.

### Pitfall 2: Optimistic Update Stale After Error Rollback

**What goes wrong:** After a failed mark-complete, the lesson list shows the lesson as complete even though it isn't.
**Why it happens:** `onError` rollback sets old data, but `onSettled` re-fetches and the stale server state is re-applied.
**How to avoid:** In `onSettled`, always call `queryClient.invalidateQueries` so the server state is refetched and becomes authoritative.

### Pitfall 3: RLS Blocks `lesson_progress` Insert

**What goes wrong:** `markLessonComplete()` returns a Supabase RLS error even for the authenticated student.
**Why it happens:** The `lesson_progress` INSERT policy uses `user_id = auth.uid()` but the application code passes the `profile.id` (which is `auth.uid()`) — this should work. The failure occurs if the table was created without enabling RLS or the policy is wrong.
**How to avoid:** Test RLS policies manually in Supabase SQL editor before Phase 4 implementation. Run: `set role authenticated; set request.jwt.claims = '{"sub": "test-user-id"}'; insert into lesson_progress...`.
**Warning signs:** Supabase returns `{code: "42501", message: "new row violates row-level security policy"}`.

### Pitfall 4: Mobile 375px Tab Content Overflow

**What goes wrong:** Lesson content (video + description + assignment + submit button) overflows horizontally on 375px, requiring horizontal scroll.
**Why it happens:** YouTube embed aspect-ratio container defaults to full width but inner elements have fixed widths or horizontal padding that adds up.
**How to avoid:** Content panel must use `p-4` (not `p-8`) on mobile. YouTube iframe uses `w-full` inside AspectRatio. All elements inside content panel use `w-full` or `max-w-full`.
**Warning signs:** Test at exactly 375px in Chrome DevTools before submitting.

### Pitfall 5: Submission File Input Not Triggering Camera on Mobile

**What goes wrong:** `<input type="file">` on mobile doesn't offer camera capture.
**Why it happens:** Missing `capture="environment"` attribute.
**How to avoid:** Use `accept="image/*,image/heic" capture="environment"` on the file input. The `capture` attribute opens the rear camera by default on mobile browsers.

### Pitfall 6: `getUserEnrollments` Returns Empty After Redirect

**What goes wrong:** Student logs in, gets redirected to `/courses`, but sees empty state "Bạn chưa được gán..." even though they are enrolled.
**Why it happens:** Query runs before `profile.id` is available (loading state from AuthContext).
**How to avoid:** Gate the `useQuery` call with `enabled: !!profile?.id`. Show skeleton while `profile` is null.

---

## Code Examples

Verified patterns from existing codebase (Phase 3):

### Progress Percentage Computation

```typescript
// Compute at query/render time — never store as a column
function getCourseProgress(
  lessonIds: string[],
  completedLessonIds: Set<string>
): number {
  if (lessonIds.length === 0) return 0
  const completed = lessonIds.filter(id => completedLessonIds.has(id)).length
  return Math.round((completed / lessonIds.length) * 100)
}

// Usage in course card:
// <Progress value={progress} className="h-2 mt-2" aria-label={`Tiến độ hoàn thành: ${progress}%`} />
```

### Grade Badge (reuse from CoursesPage.tsx — Phase 3 established pattern)

```typescript
// Source: src/pages/admin/CoursesPage.tsx
const GRADE_BADGE: Record<Course['target_grade'], { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}
// Extract to shared component or lib/constants — reused in Phase 4 student course list
```

### Supabase Storage Signed URL for Private Bucket

```typescript
// Use for displaying submitted images (private bucket)
export async function getSubmissionSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('submissions')
    .createSignedUrl(path, 3600) // 1 hour TTL
  if (error) throw error
  return data.signedUrl
}
// Note: Unlike getPublicUrl (used for assignments bucket), createSignedUrl
// requires an active session — correct for student-private data.
```

### Lesson Completion Check Guard

```typescript
// Used to toggle button state and prevent duplicate submissions
const isCompleted = (lesson: Lesson, progress: LessonProgress[]): boolean =>
  progress.some(p => p.lesson_id === lesson.id)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| TanStack Query v4 (useQuery options API differs) | TanStack Query v5 (^5.83.0) | v5 released Oct 2023 | `enabled` option works the same; `onSuccess`/`onError` callbacks moved to `useEffect`; use `onSettled` in mutations |
| supabase-js v2.79+ | Pinned to 2.78.0 | Phase 1 decision | No change needed — keep pin |
| Public storage bucket for all files | Private bucket for submissions | Phase 4 new | Use `createSignedUrl` not `getPublicUrl` for submissions |

**Deprecated/outdated:**
- TanStack Query `onSuccess` callback in `useQuery`: Removed in v5. Use `useEffect` watching `data` instead if side effects are needed on fetch.
- `useQuery` `isLoading` vs `isPending`: In v5, `isLoading` is true when fetching AND no cached data; use `isPending` for first load. Both are available.

---

## Open Questions

1. **Does Phase 3 need to be fully deployed before Phase 4 can be executed?**
   - What we know: Phase 3 created the `courses`, `chapters`, `lessons`, `enrollments` tables and their RLS policies. Phase 4 needs those tables to exist.
   - What's unclear: Are Phase 3 Supabase migrations applied to the live Supabase project?
   - Recommendation: Verify the Supabase project has all Phase 3 tables before Phase 4 Wave 0. If not, Wave 0 must apply Phase 3 migrations first.

2. **`heic2any` in Vitest jsdom environment**
   - What we know: `heic2any` uses browser APIs (ArrayBuffer, Blob). jsdom provides these.
   - What's unclear: Whether compression tests with `heic2any` will work in jsdom without real HEIC data.
   - Recommendation: Mock `browser-image-compression` and `heic2any` in tests — don't actually compress in unit tests.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, dev server | Yes | 18.20.8 | — |
| Yarn | Package install | Yes | 4.11.0 | — |
| browser-image-compression | SUBMIT-02 | Not yet installed | — | Must install via `yarn add` |
| heic2any | SUBMIT-02 (HEIC fallback) | Not yet installed | — | browser-image-compression `fileType` option may suffice alone |
| Supabase project | All DB/Storage | Assumed live | supabase-js 2.78.0 | — |
| All required shadcn/ui components | UI | Yes — all installed | See package.json | — |
| Vitest | Testing | Yes | ^3.2.4 | — |

**Missing dependencies with no fallback:**
- `browser-image-compression` — must install before implementing SUBMIT-02

**Missing dependencies with fallback:**
- `heic2any` — may not be needed if `browser-image-compression`'s `fileType: 'image/jpeg'` handles all HEIC cases. Install conditionally after testing on actual HEIC file.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^3.2.4 + React Testing Library ^16.0.0 |
| Config file | `vite.config.ts` (vitest config inline) |
| Quick run command | `yarn test src/lib/api/lesson-progress.test.ts src/lib/api/submissions.test.ts` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LEARN-01 | getUserEnrollments returns only current user's enrollments | unit | `yarn test src/lib/api/enrollments.test.ts -x` | No — Wave 0 |
| LEARN-04 | markLessonComplete inserts progress record | unit | `yarn test src/lib/api/lesson-progress.test.ts -x` | No — Wave 0 |
| LEARN-05 | getCourseProgress returns correct % from progress array | unit | `yarn test src/lib/api/lesson-progress.test.ts -x` | No — Wave 0 |
| SUBMIT-01 | uploadSubmission uploads to correct path | unit | `yarn test src/lib/api/submissions.test.ts -x` | No — Wave 0 |
| SUBMIT-02 | compressAndUpload produces file < 500KB | unit | `yarn test src/lib/api/submissions.test.ts -x` | No — Wave 0 |
| SUBMIT-03 | getSubmission returns status for user+lesson pair | unit | `yarn test src/lib/api/submissions.test.ts -x` | No — Wave 0 |
| SUBMIT-04 | RLS blocks student from reading another student's submission | manual | SQL editor test in Supabase | N/A |
| UX-01 | /courses renders on 375px without horizontal scroll | smoke | Manual DevTools + visual inspection | N/A |
| UX-02 | All interactive elements ≥48px tap target | smoke | Manual DevTools | N/A |
| LEARN-02 | YouTube iframe renders with correct src and title | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx -x` | No — Wave 0 |
| LEARN-03 | Assignment file link opens new tab | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx -x` | No — Wave 0 |

### Sampling Rate

- **Per task commit:** `yarn test src/lib/api/`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/api/lesson-progress.test.ts` — covers LEARN-04, LEARN-05
- [ ] `src/lib/api/submissions.test.ts` — covers SUBMIT-01, SUBMIT-02, SUBMIT-03
- [ ] `src/lib/api/enrollments.test.ts` — covers LEARN-01 (getUserEnrollments with mocked Supabase)
- [ ] `src/pages/student/CourseDetailPage.test.tsx` — covers LEARN-02, LEARN-03

All test files follow the vi.mock hoisting pattern established in `src/contexts/AuthContext.test.tsx`.

---

## Project Constraints (from CLAUDE.md)

- **Package manager:** Yarn 4.11.0 — use `yarn`, not `npm`
- **Stack:** shadcn/ui (Radix) + Tailwind CSS + Framer Motion + React Hook Form + Zod + TanStack React Query + React Router DOM v6 + Lucide React
- **Font:** "Be Vietnam Pro" for Vietnamese language support
- **Styling:** Tailwind utilities + CSS variables (HSL, in `src/index.css`) + `cn()` from `src/lib/utils.ts`
- **Path alias:** `@/` maps to `src/`
- **shadcn/ui components:** Do NOT modify `src/components/ui/` manually — use shadcn CLI to add/update
- **TypeScript:** Strict mode disabled, `noImplicitAny` off
- **Tests:** Vitest + React Testing Library; jsdom; globals enabled (no imports for `describe`, `it`, `expect`); setup at `src/test/setup.ts`; run single file with `yarn test src/path/to/file.test.ts`
- **Vietnamese UI:** All user-facing text in Vietnamese (UX-03, locked)
- **Product focus:** THCS grades 7–9 and ôn thi chuyên Toán — all new content examples should reflect this audience

---

## Sources

### Primary (HIGH confidence)

- Source inspection: `src/lib/api/enrollments.ts`, `src/lib/api/lessons.ts`, `src/lib/api/courses.ts`, `src/lib/api/chapters.ts` — existing API patterns verified by reading
- Source inspection: `src/App.tsx`, `src/components/auth/ProtectedRoute.tsx`, `src/contexts/AuthContext.tsx` — routing and auth patterns verified
- Source inspection: `package.json` — all library versions confirmed
- `.planning/phases/04-student-learning-submission/04-CONTEXT.md` — locked decisions
- `.planning/phases/04-student-learning-submission/04-UI-SPEC.md` — visual + interaction contract
- npm registry: `browser-image-compression@2.0.2` and `heic2any@0.0.4` confirmed current

### Secondary (MEDIUM confidence)

- TanStack Query v5 optimistic updates pattern — verified against known v5 API (mutations `onMutate`/`onError`/`onSettled`)
- Supabase Storage RLS with `storage.foldername()` helper — established pattern from Phase 3 context

### Tertiary (LOW confidence)

- HEIC conversion behavior on older iOS Safari — based on known browser compatibility; should be validated against a real HEIC file from an iPhone

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified from package.json and npm registry
- Architecture: HIGH — directly derived from existing Phase 3 patterns in codebase
- Database schema: HIGH — follows Supabase conventions with proper RLS
- Pitfalls: MEDIUM — most from direct code analysis; HEIC pitfall is LOW (single source)
- Test mapping: HIGH — matches existing test infrastructure in project

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable libraries; main risk is heic2any behavior on device)
