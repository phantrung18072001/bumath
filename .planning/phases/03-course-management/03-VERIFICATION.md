---
phase: 03-course-management
verified: 2026-04-25T10:00:00Z
status: human_needed
score: 13/13 must-haves verified
re_verification: true
  previous_status: human_needed
  previous_score: 7/7
  gaps_closed:
    - "Lesson list row shows YouTube thumbnail via img.youtube.com/vi/{id}/mqdefault.jpg"
    - "Lesson list attachment cell shows filename chip linking to getAssignmentPublicUrl"
    - "Lesson dialog file label renamed to 'Tai lieu dinh kem cho hoc sinh' with Paperclip icon"
    - "Selecting an image file renders inline thumbnail preview via URL.createObjectURL"
    - "Selecting a PDF file renders FileText icon + filename + formatted size chip"
    - "Edit-mode existing attachment shows as icon + filename chip with X-icon Xoa file button"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Verify RLS policies work correctly for student enrollment-based access"
    expected: "An approved student enrolled in course X can read lessons for course X but not for course Y they are not enrolled in"
    why_human: "Requires a live Supabase instance with seeded data and two test user accounts"
  - test: "Verify YouTube thumbnail renders correctly for a real lesson with video_url"
    expected: "80x48px thumbnail loads from img.youtube.com for a lesson with a valid YouTube URL; em dash shown for lesson without URL"
    why_human: "Thumbnail load depends on external YouTube CDN and live session; static analysis confirms wiring but not network success"
  - test: "Verify file upload and download for lesson attachments — full create/edit/remove flow"
    expected: "Admin uploads PDF, filename chip appears in list row linking to the file; edit shows chip with Xoa file button; removing clears the chip"
    why_human: "Requires live Supabase Storage bucket and real file I/O; cannot verify with static analysis"
  - test: "Verify image file preview renders in dialog after file selection"
    expected: "Selecting a JPG/PNG in the dialog shows an inline thumbnail preview; blob URL revoked on dialog close"
    why_human: "Requires browser file picker interaction; blob URL is a runtime artifact not testable with static grep"
---

# Phase 03: Course Management Verification Report

**Phase Goal:** Implement full course management system for admins — courses, chapters, lessons (with YouTube + file attachments), and student enrollment. All CRUD operations must work end-to-end with proper RLS.
**Verified:** 2026-04-25T10:00:00Z
**Status:** human_needed
**Re-verification:** Yes — Plan 03-06 closed 2 UAT gaps (test-10, test-12); previous status was human_needed (7/7).

## Gap Closure Summary (Plan 03-06)

Two UAT gaps diagnosed after the previous verification have been resolved:

1. **test-10 (Lesson list — no video/attachment info):** `LessonsPage.tsx` now has a dedicated Video column rendering an 80x48px YouTube thumbnail via `extractYouTubeID` + `img.youtube.com/vi/{id}/mqdefault.jpg`, and the attachment cell shows a clickable filename chip using `getAssignmentPublicUrl`.
2. **test-12 (Dialog label ambiguous; no preview):** `LessonFormDialog.tsx` label renamed to "Tai lieu dinh kem cho hoc sinh" with a Paperclip icon; selecting an image renders a blob-based thumbnail (with proper `URL.revokeObjectURL` cleanup on unmount); selecting a PDF renders a FileText icon + filename + formatted size chip; edit-mode existing attachment shows as an icon + filename chip with an X-icon "Xoa file" button.

---

## Goal Achievement

### Observable Truths

**From Plans 03-01 through 03-05 — carried forward:**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Phase 03 code is merged into main and deployable | VERIFIED | All 16 Phase 03 source files on main; build passes (2287 modules, 9.3s) |
| 2 | DB schema and application code use consistent column names | VERIFIED | Schema: `target_grade text NOT NULL CHECK (...)` + `assignment_path text` in lessons; all API/UI types match |
| 3 | Admin can create, edit, and delete courses with target grade (COURSE-01) | VERIFIED | `CoursesPage.tsx` + `CourseFormDialog.tsx` wired to `courses.ts` API; full RHF+Zod; `target_grade` enum select end-to-end |
| 4 | Admin can create chapters and ordered lessons with YouTube URLs (COURSE-02, COURSE-03) | VERIFIED | `ChaptersPage.tsx` + `LessonsPage.tsx` with reorder buttons; `LessonFormDialog` validates YouTube via `extractYouTubeID` in Zod `.refine()` |
| 5 | Admin can attach assignment files to lessons (COURSE-04) | VERIFIED | `LessonFormDialog` file input (PDF/image, 10MB limit); `uploadAssignment`/`deleteAssignment` helpers; `assignment_path` column in schema |
| 6 | Admin can assign and remove student enrollments (COURSE-05) | VERIFIED | `UserEnrollmentDialog` + `enrollments.ts` API fully wired; `UsersPage` opens dialog via BookOpen button |
| 7 | RLS policies protect enrolled content per student | VERIFIED | `20260324_course_management_rls.sql`: `is_admin()` + `is_approved_user()` SECURITY DEFINER; admin ALL + student SELECT via enrollment EXISTS check on all 4 tables |

**From Plan 03-06 — new truths:**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 8 | Lesson list row shows YouTube thumbnail when video_url is present | VERIFIED | `LessonsPage.tsx` line 201-212: `extractYouTubeID(lesson.video_url)` feeds `img.youtube.com/vi/{id}/mqdefault.jpg`; em dash fallback when null |
| 9 | Lesson list attachment cell shows filename chip linking to the file | VERIFIED | Lines 216-231: `getAssignmentPublicUrl(lesson.assignment_path)` as `href`; FileText icon + truncated filename in chip; em dash fallback |
| 10 | Lesson dialog file field uses label "Tai lieu dinh kem cho hoc sinh" with Paperclip icon | VERIFIED | `LessonFormDialog.tsx` line 283-286: `<Paperclip className="h-4 w-4" />` + exact label text confirmed |
| 11 | Selecting an image file in the dialog renders an inline thumbnail preview | VERIFIED | Lines 87-94: `URL.createObjectURL(selectedFile)` in `useEffect` when `selectedFile.type.startsWith('image/')`; `URL.revokeObjectURL` cleanup on return |
| 12 | Selecting a PDF file renders FileText icon + filename chip | VERIFIED | Lines 320-342: `imagePreviewUrl ? <img/> : <FileText/>` block; filename + `formatFileSize` output rendered |
| 13 | Edit-mode existing attachment shows as icon + filename chip with Xoa file button | VERIFIED | Lines 289-309: `isEditing && existingFileName && !removeExisting && !selectedFile` guard; FileText chip + `<X />` icon button calls `setRemoveExisting(true)` |

**Score:** 13/13 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260324_course_management_schema.sql` | Tables: courses, chapters, lessons, enrollments | VERIFIED | `target_grade text NOT NULL CHECK (...)` + `assignment_path text`; all 4 tables, indexes, triggers |
| `supabase/migrations/20260324_course_management_rls.sql` | RLS policies for all 4 tables | VERIFIED | admin_all_* + student_read_enrolled_* on all 4 tables |
| `supabase/migrations/20260324_course_management_storage.sql` | assignments storage bucket | VERIFIED | 10MB limit, 5 MIME types, 4 policies |
| `src/lib/api/courses.ts` | CRUD for courses table | VERIFIED | fetchCourses, insertCourse, updateCourse, deleteCourse |
| `src/lib/api/chapters.ts` | CRUD + reorder for chapters | VERIFIED | Full CRUD + reorderChapters (swap order_index) |
| `src/lib/api/lessons.ts` | CRUD + reorder + storage helpers | VERIFIED | Full CRUD + reorderLessons + uploadAssignment/deleteAssignment/getAssignmentPublicUrl |
| `src/lib/api/enrollments.ts` | getUserEnrollments, addEnrollment, removeEnrollment | VERIFIED | Three mutation functions + EnrollmentWithCourse join |
| `src/lib/youtube.ts` | extractYouTubeID utility | VERIFIED | Handles watch?v=, youtu.be/, embed/, shorts/, m.youtube.com formats |
| `src/pages/admin/CoursesPage.tsx` | Course list + CRUD + grade badges | VERIFIED | useQuery + useMutation; GradeBadge for all 4 grade values |
| `src/pages/admin/ChaptersPage.tsx` | Chapter list + reorder + nav to LessonsPage | VERIFIED | Up/Down buttons; BookOpen navigates to lessons route |
| `src/pages/admin/LessonsPage.tsx` | Lesson list + thumbnail column + attachment chip + reorder | VERIFIED | Video column with YouTube thumbnail; filename chip with getAssignmentPublicUrl href |
| `src/components/admin/CourseFormDialog.tsx` | RHF+Zod create/edit dialog | VERIFIED | Zod enum; useEffect reset on open |
| `src/components/admin/ChapterFormDialog.tsx` | RHF+Zod create/edit for chapters | VERIFIED | Title required; nextOrderIndex from parent |
| `src/components/admin/LessonFormDialog.tsx` | YouTube URL + file upload dialog with preview | VERIFIED | Paperclip label; blob-URL image preview with cleanup; PDF chip; edit-mode chip with Xoa file |
| `src/components/admin/UserEnrollmentDialog.tsx` | Enrollment table + add/remove | VERIFIED | Set diff for available courses; GradeBadge in table |
| `src/App.tsx` (routes) | 3 new admin routes | VERIFIED | /admin/courses, /admin/courses/:courseId, /admin/courses/:courseId/chapters/:chapterId all with ProtectedRoute requiredRole="admin" |

All 16 artifacts: VERIFIED. No MISSING, STUB, or ORPHANED artifacts.

---

### Key Link Verification

**Carried forward from previous verification:**

| From | To | Via | Status |
|------|----|-----|--------|
| `CoursesPage.tsx` | Supabase `courses` table | `fetchCourses()` in useQuery | VERIFIED |
| `ChaptersPage.tsx` | Supabase `chapters` table | `fetchChapters(courseId)` in useQuery | VERIFIED |
| `LessonsPage.tsx` | Supabase `lessons` table | `fetchLessons(chapterId)` in useQuery | VERIFIED |
| `LessonFormDialog.tsx` | Supabase Storage | `uploadAssignment()` before insert | VERIFIED |
| `UsersPage.tsx` | `UserEnrollmentDialog` | `enrollmentUser` state + BookOpen | VERIFIED |
| `UserEnrollmentDialog.tsx` | Supabase `enrollments` table | getUserEnrollments/addEnrollment/removeEnrollment | VERIFIED |

**New links from Plan 03-06:**

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/pages/admin/LessonsPage.tsx` | `src/lib/youtube.ts` | `extractYouTubeID` import | VERIFIED | Line 6: import; used at line 201 in JSX render |
| `src/pages/admin/LessonsPage.tsx` | `src/lib/api/lessons.ts` | `getAssignmentPublicUrl` import | VERIFIED | Lines 37-43: multi-line import block; used at line 218 as `href` attribute |
| `src/components/admin/LessonFormDialog.tsx` | browser File API | `URL.createObjectURL` on selectedFile image | VERIFIED | Line 89: create; line 91: `revokeObjectURL` cleanup via useEffect return |

All key links: WIRED.

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `LessonsPage.tsx` — Video column | `lesson.video_url` | `fetchLessons(chapterId)` → Supabase `.from('lessons').select('*')` | Yes — stored as embed URL from form submission | FLOWING |
| `LessonsPage.tsx` — Attachment cell | `lesson.assignment_path` | Same query above | Yes — storage path stored on lesson insert/update | FLOWING |
| `LessonFormDialog.tsx` — image preview | `imagePreviewUrl` state | `URL.createObjectURL(selectedFile)` triggered by `useEffect([selectedFile])` | Yes — runtime blob from browser File API | FLOWING |
| `LessonFormDialog.tsx` — edit-mode chip | `existingFileName` derived | `lesson.assignment_path.split('/').pop()` | Yes — derived from DB-stored path | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Production build succeeds | `yarn build` | 2287 modules, no errors, 9.30s | PASS |
| `extractYouTubeID` imported and used in render | grep LessonsPage.tsx | Line 6 (import) + line 201 (JSX call) | PASS |
| `getAssignmentPublicUrl` imported and used as href | grep LessonsPage.tsx | Line 41 (import) + line 218 (href attribute) | PASS |
| `URL.createObjectURL` with `revokeObjectURL` cleanup | grep LessonFormDialog.tsx | Lines 89 + 91 | PASS |
| Label text matches spec | grep LessonFormDialog.tsx | Line 285 exact match | PASS |
| No anti-patterns (TODO/FIXME/return null) | grep both modified files | Only HTML placeholder= attrs; no stubs | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| COURSE-01 | 03-02-PLAN.md | Admin co the tao, sua, xoa khoa hoc (ten, mo ta, lop muc tieu: 7/8/9/chuyen) | SATISFIED | CoursesPage + CourseFormDialog; Zod enum validates grade_7/grade_8/grade_9/advanced |
| COURSE-02 | 03-03, 03-04, 03-06 | Admin co the them bai hoc vao khoa hoc (tieu de, URL video YouTube, mo ta, thu tu) | SATISFIED | LessonFormDialog with YouTube validation; list now shows thumbnail confirming video data is surfaced |
| COURSE-03 | 03-03, 03-04 | Admin co the sap xep lai thu tu bai hoc trong khoa | SATISFIED | reorderLessons/reorderChapters swap order_index; ChevronUp/Down with boundary disabling |
| COURSE-04 | 03-04, 03-06 | Admin co the dinh kem bai tap vao bai hoc (upload file PDF hoac hinh anh de bai) | SATISFIED | File upload with 10MB limit; image preview + PDF chip in dialog; filename chip in list linking to file |
| COURSE-05 | 03-05-PLAN.md | Admin co the gan hoc sinh vao khoa hoc | SATISFIED | UserEnrollmentDialog + enrollments API; UsersPage wires dialog |

All 5 requirements: SATISFIED. No ORPHANED requirements.

---

### Anti-Patterns Found

None. The `placeholder=` matches from grep are HTML input placeholder attributes (user-facing hint text in Vietnamese), not code stubs. Both modified files are clean:
- No TODO/FIXME/XXX comments
- No `return null`, `return []`, `return {}`, or `=> {}` stub patterns
- No hardcoded empty props passed to child components

---

### Human Verification Required

#### 1. RLS Student Access Enforcement

**Test:** Create two Supabase users: student A enrolled in Course X, student B enrolled in Course Y. As student A, attempt to read lessons for Course Y via direct Supabase query.
**Expected:** RLS denies the select; student A sees only Course X lessons. The `student_read_enrolled_lessons` policy uses an EXISTS subquery joining enrollments to chapters.
**Why human:** Requires a live Supabase instance with seeded auth users, profile rows with `approval_status = 'approved'`, and two separate enrollment records.

#### 2. YouTube Thumbnail Renders Correctly in Lesson List

**Test:** Navigate to a chapter that has at least one lesson with a YouTube video URL and one without. Observe the Video column.
**Expected:** Lesson with video shows an 80x48px thumbnail loaded from `img.youtube.com`; lesson without video shows an em dash.
**Why human:** Thumbnail loading depends on the external YouTube CDN and a live authenticated session. Static analysis confirms the code path is wired but cannot confirm network success.

#### 3. Lesson File Attachment End-to-End Flow

**Test:** As admin, open LessonFormDialog for a new lesson, upload a PDF under 10MB, save. Then open edit mode for that lesson and verify: (a) the filename chip appears with Xoa file button, (b) clicking Xoa file removes the chip and clears the attachment on save.
**Expected:** File stored in the `assignments` Supabase Storage bucket; `assignment_path` persisted to DB; filename chip in list row links to the public URL; chip in edit dialog reflects stored state; removal clears both storage and DB column.
**Why human:** Requires live Supabase Storage with real file I/O.

#### 4. Image Preview in Lesson Dialog

**Test:** As admin, open LessonFormDialog for a new lesson and select a JPG or PNG file using the file picker.
**Expected:** Immediately after selection, an inline thumbnail preview renders using a blob URL. After closing the dialog, the preview is cleaned up with no memory leak.
**Why human:** Requires browser file picker interaction; blob URL is a runtime artifact that cannot be tested with static grep.

---

### Gaps Summary

No gaps remain. Phase 03 is fully implemented across all 6 plans:

- Plans 03-01 through 03-05: Core CRUD for courses/chapters/lessons/enrollments, RLS policies, storage bucket (verified in previous round at 7/7).
- Plan 03-06: UI polish gap-closure — YouTube thumbnail column and improved attachment display in both list and dialog (6 new truths verified in this round).

All 13 must-have truths pass automated verification. The only open items are 4 human verification checks that require a live Supabase environment or browser interaction. No automated gaps remain.

---

_Verified: 2026-04-25T10:00:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification: Yes — Plan 03-06 gap closure; previous status was human_needed (7/7), now human_needed (13/13)_
