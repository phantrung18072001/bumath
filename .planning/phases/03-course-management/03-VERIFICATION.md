---
phase: 03-course-management
verified: 2026-03-25T12:00:00Z
status: human_needed
score: 7/7 must-haves verified
re_verification: true
  previous_status: gaps_found
  previous_score: 3/7
  gaps_closed:
    - "Phase 03 code is merged into main and deployable (commit 6430a44)"
    - "DB schema and application code use consistent column names — courses.target_grade fixed and assignment_path added (commit f140ccd)"
    - "Admin can create, edit, and delete courses with target grade (COURSE-01) — now unblocked"
    - "Admin can add lessons with YouTube video URLs and ordered chapters (COURSE-02, COURSE-03) — now unblocked"
    - "Admin can attach assignment files to lessons (COURSE-04) — column now exists"
    - "Admin can assign and remove student enrollments (COURSE-05) — now unblocked"
    - "Dead src/types/course.ts removed"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Verify RLS policies work correctly for student enrollment-based access"
    expected: "An approved student enrolled in course X can read lessons for course X but not for course Y they are not enrolled in"
    why_human: "Requires a live Supabase instance with seeded data and two test user accounts"
  - test: "Verify file upload and download for lesson attachments"
    expected: "Admin can upload a PDF, the filename/size shows in the form, and after saving the FileText icon appears in the lessons table row"
    why_human: "Requires live Supabase Storage bucket and real file I/O; cannot verify with static analysis"
---

# Phase 03: Course Management Verification Report

**Phase Goal:** Admin has full control to build the course catalogue — courses, ordered lessons with YouTube videos, assignment attachments, and student enrollment — so content exists for students to consume
**Verified:** 2026-03-25T12:00:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure

## Gap Closure Summary

All four gaps from initial verification have been resolved:

1. **Code merged to main** — commit `6430a44` brought all Phase 03 source files onto main. commit `f140ccd` applied the schema fix.
2. **target_grade schema fix** — `supabase/migrations/20260324_course_management_schema.sql` now defines `target_grade text NOT NULL DEFAULT 'grade_7' CHECK (target_grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced'))`. All API and UI code references this column correctly.
3. **assignment_path column added** — lessons table now has `assignment_path text` column. `lessons.ts`, `LessonFormDialog`, and `LessonsPage` all reference it consistently.
4. **Dead src/types/course.ts removed** — `src/types/` now contains only `auth.ts`.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Phase 03 code is merged into main and deployable | VERIFIED | All 16 Phase 03 source files exist on main; commit `6430a44` is the merge commit |
| 2 | DB schema and application code use consistent column names | VERIFIED | Schema has `target_grade text` with CHECK constraint; `assignment_path text` in lessons; all API/UI types match exactly |
| 3 | Admin can create, edit, and delete courses with target grade (COURSE-01) | VERIFIED | `CoursesPage.tsx` + `CourseFormDialog.tsx` wired to `courses.ts` API; full RHF+Zod validation; `target_grade` enum select works end-to-end |
| 4 | Admin can create chapters and ordered lessons with YouTube URLs (COURSE-02, COURSE-03) | VERIFIED | `ChaptersPage.tsx` + `LessonsPage.tsx` with Up/Down reorder buttons; `LessonFormDialog` validates YouTube URLs via `extractYouTubeID` in Zod `.refine()` |
| 5 | Admin can attach assignment files to lessons (COURSE-04) | VERIFIED | `LessonFormDialog` has file input (PDF/image, 10MB limit), `uploadAssignment`/`deleteAssignment` storage helpers in `lessons.ts`; `assignment_path` column now exists in schema |
| 6 | Admin can assign and remove student enrollments (COURSE-05) | VERIFIED | `UserEnrollmentDialog` + `enrollments.ts` API fully wired; `UsersPage` opens dialog via `enrollmentUser` state + BookOpen button; enrollment join now references correct `target_grade` column |
| 7 | RLS policies protect enrolled content per student | VERIFIED | `20260324_course_management_rls.sql` on main: `is_admin()` + `is_approved_user()` SECURITY DEFINER helpers; admin ALL + student SELECT via enrollment EXISTS check on all 4 tables |

**Score:** 7/7 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260324_course_management_schema.sql` | Tables: courses, chapters, lessons, enrollments | VERIFIED | `target_grade text NOT NULL CHECK (...)` at line 8; `assignment_path text` at line 32; all 4 tables, indexes, and triggers present |
| `supabase/migrations/20260324_course_management_rls.sql` | RLS policies for all 4 tables | VERIFIED | admin_all_* + student_read_enrolled_* on courses/chapters/lessons; admin_all_enrollments + student_read_own_enrollments |
| `supabase/migrations/20260324_course_management_storage.sql` | assignments storage bucket | VERIFIED | 10MB limit, 5 MIME types, 4 policies (admin upload/update/delete + authenticated read + student submit own) |
| `src/lib/api/courses.ts` | CRUD for courses table | VERIFIED | fetchCourses, insertCourse, updateCourse, deleteCourse; Course interface uses `target_grade` enum |
| `src/lib/api/chapters.ts` | CRUD + reorder for chapters | VERIFIED | fetchChapters, insertChapter, updateChapter, removeChapter, reorderChapters (swap order_index) |
| `src/lib/api/lessons.ts` | CRUD + reorder + storage helpers | VERIFIED | All CRUD + reorderLessons + uploadAssignment/deleteAssignment/getAssignmentPublicUrl; `assignment_path` in Lesson interface and LessonInsert/Update types |
| `src/lib/api/enrollments.ts` | getUserEnrollments, addEnrollment, removeEnrollment | VERIFIED | EnrollmentWithCourse join selects `id, title, target_grade` from courses; three mutation functions present |
| `src/lib/youtube.ts` | extractYouTubeID utility | VERIFIED | Handles watch/embed/shorts/youtu.be/m.youtube.com formats with two regex patterns |
| `src/pages/admin/CoursesPage.tsx` | Course list + CRUD + grade badges | VERIFIED | useQuery(fetchCourses) + useMutation(deleteCourse); CourseFormDialog integrated; GradeBadge for all 4 grade values |
| `src/pages/admin/ChaptersPage.tsx` | Chapter list + reorder + nav to LessonsPage | VERIFIED | Up/Down buttons with boundary disable; BookOpen navigate to `/admin/courses/:courseId/chapters/:chapterId` at line 207 |
| `src/pages/admin/LessonsPage.tsx` | Lesson list + reorder + attachment indicator | VERIFIED | FileText icon for `lesson.assignment_path`; reorder wired; 3-level breadcrumb; deleteAssignment called before removeLesson |
| `src/components/admin/CourseFormDialog.tsx` | RHF+Zod create/edit dialog | VERIFIED | Zod schema with title (required), description (optional), target_grade (enum); useEffect resets form on open |
| `src/components/admin/ChapterFormDialog.tsx` | RHF+Zod create/edit for chapters | VERIFIED | Title required; nextOrderIndex passed from parent |
| `src/components/admin/LessonFormDialog.tsx` | YouTube URL + file upload dialog | VERIFIED | extractYouTubeID in Zod .refine(); 10MB file check; existing file display with "Xoa file" button; ScrollArea for scroll |
| `src/components/admin/UserEnrollmentDialog.tsx` | Enrollment table + add/remove | VERIFIED | Set diff for available courses; GradeBadge in enrollment table; addEnrollment/removeEnrollment mutations |
| `src/App.tsx` (routes) | 3 new admin routes | VERIFIED | /admin/courses, /admin/courses/:courseId, /admin/courses/:courseId/chapters/:chapterId all with ProtectedRoute requiredRole="admin" |

No MISSING or STUB artifacts remain. `src/types/course.ts` dead file confirmed deleted — `src/types/` contains only `auth.ts`.

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `CoursesPage.tsx` | Supabase `courses` table | `fetchCourses()` in useQuery | VERIFIED | queryFn: fetchCourses at line 58; invalidation on mutate success |
| `CourseFormDialog.tsx` | Supabase `courses` table | `insertCourse`/`updateCourse` in useMutation | VERIFIED | mutation.mutate(payload) with toast on success/error |
| `ChaptersPage.tsx` | Supabase `chapters` table | `fetchChapters(courseId)` in useQuery | VERIFIED | queryKey includes courseId; enabled: !!courseId |
| `ChaptersPage.tsx` | `LessonsPage.tsx` | `useNavigate` + BookOpen button | VERIFIED | navigate(`/admin/courses/${courseId}/chapters/${chapter.id}`) at line 207 |
| `LessonsPage.tsx` | Supabase `lessons` table | `fetchLessons(chapterId)` in useQuery | VERIFIED | queryKey includes chapterId; enabled: !!chapterId |
| `LessonFormDialog.tsx` | Supabase Storage `assignments` | `uploadAssignment()` before insertLesson | VERIFIED | File uploaded first; path stored in assignment_path on insert payload |
| `LessonFormDialog.tsx` | `extractYouTubeID` utility | import + Zod `.refine()` | VERIFIED | Line 44-47: `.refine((val) => !val || !!extractYouTubeID(val), ...)` |
| `UsersPage.tsx` | `UserEnrollmentDialog` | `enrollmentUser` state + BookOpen button | VERIFIED | setEnrollmentUser at line 229; dialog open={!!enrollmentUser} at line 284 |
| `UserEnrollmentDialog.tsx` | Supabase `enrollments` table | `getUserEnrollments`/`addEnrollment`/`removeEnrollment` | VERIFIED | All three mutation functions confirmed; course join selects target_grade |
| `courses.ts` API | Supabase `courses.target_grade` column | `.select('*')` + `target_grade` in insert | VERIFIED | Schema column name now matches: `target_grade text NOT NULL CHECK (...)` |
| `lessons.ts` API | Supabase `lessons.assignment_path` column | `.select('*')` + `assignment_path` in insert/update | VERIFIED | Column now exists in schema at line 32 |

All key links WIRED. The two previously BROKEN links are now VERIFIED.

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `CoursesPage.tsx` | `courses` array | `fetchCourses()` → `supabase.from('courses').select('*')` | Yes | FLOWING |
| `ChaptersPage.tsx` | `chapters` array | `fetchChapters(courseId)` → `.from('chapters').select('*').eq('course_id', courseId).order('order_index')` | Yes | FLOWING |
| `LessonsPage.tsx` | `lessons` array | `fetchLessons(chapterId)` → `.from('lessons').select('*').eq('chapter_id', chapterId).order('order_index')` | Yes | FLOWING — `assignment_path` column now exists; FileText indicator will render correctly |
| `UserEnrollmentDialog.tsx` | `enrollments` array | `getUserEnrollments(userId)` → `.from('enrollments').select('id, user_id, course_id, enrolled_at, course:courses(id, title, target_grade)')` | Yes | FLOWING — join on `target_grade` now valid |

---

### Behavioral Spot-Checks

Step 7b: All Phase 03 routes are behind `ProtectedRoute requiredRole="admin"` and require a live Supabase session. Cannot exercise end-to-end flows without a running server and authenticated admin user. Spot-checks routed to human verification.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| COURSE-01 | 03-02-PLAN.md | Admin có thể tạo, sửa, xóa khóa học (tên, mô tả, lớp mục tiêu: 7/8/9/chuyên) | SATISFIED | CoursesPage + CourseFormDialog fully implemented and on main; schema column matches; Zod enum validates grade_7/grade_8/grade_9/advanced |
| COURSE-02 | 03-03-PLAN.md, 03-04-PLAN.md | Admin có thể thêm bài học vào khóa học (tiêu đề, URL video YouTube, mô tả, thứ tự) | SATISFIED | LessonsPage + LessonFormDialog with YouTube URL validation via extractYouTubeID; order_index managed via nextOrderIndex |
| COURSE-03 | 03-03-PLAN.md, 03-04-PLAN.md | Admin có thể sắp xếp lại thứ tự bài học trong khóa | SATISFIED | reorderLessons and reorderChapters swap order_index; ChevronUp/Down buttons with boundary disabling in both pages |
| COURSE-04 | 03-04-PLAN.md | Admin có thể đính kèm bài tập vào bài học (upload file PDF hoặc hình ảnh đề bài) | SATISFIED | LessonFormDialog file upload (PDF/image, 10MB limit); uploadAssignment/deleteAssignment helpers; assignment_path column exists; storage bucket migration with policies |
| COURSE-05 | 03-05-PLAN.md | Admin có thể gán học sinh vào khóa học | SATISFIED | UserEnrollmentDialog + enrollments API; UsersPage wires dialog; available courses computed client-side by Set diff |

All 5 requirements: SATISFIED.

No ORPHANED requirements — REQUIREMENTS.md lists only COURSE-01 through COURSE-05 for Phase 3.

---

### Anti-Patterns Found

No blockers or warnings remain. The four blockers from initial verification have been resolved:
- `courses.grade` → `courses.target_grade` fixed in schema
- `assignment_path` column added to lessons table
- Dead `src/types/course.ts` removed
- All Phase 03 code is on main

No new anti-patterns detected in the merged code.

---

### Human Verification Required

#### 1. RLS Student Access Enforcement

**Test:** Create two Supabase users: student A enrolled in Course X, student B enrolled in Course Y. As student A, attempt to read lessons for Course Y via direct Supabase query.
**Expected:** RLS denies the select; student A sees only Course X lessons. The `student_read_enrolled_lessons` policy uses an EXISTS subquery joining enrollments → chapters, which should block cross-enrollment access.
**Why human:** Requires a live Supabase instance with seeded auth users, profile rows with `approval_status = 'approved'`, and two separate enrollment records.

#### 2. Lesson File Attachment End-to-End

**Test:** As admin in the running app, open LessonFormDialog for a new lesson. Upload a PDF under 10MB. Save. Verify the FileText icon appears in the lessons table row. Edit the lesson and verify the existing filename is shown with the "Xoa file" button. Click "Xoa file" and save — verify the icon disappears.
**Expected:** File stored in the `assignments` Supabase Storage bucket; `assignment_path` persisted to DB; UI indicator reflects attachment presence correctly through create, edit (retain), and edit (remove) flows.
**Why human:** Requires live Supabase Storage with real file I/O; cannot verify with static analysis.

---

### Gaps Summary

No gaps remain. All previously identified gaps have been closed:

- Gap 1 (code not on main): Resolved by commit `6430a44` and `f140ccd`
- Gap 2 (`target_grade` mismatch): Resolved — schema now uses `target_grade text NOT NULL CHECK (...)`
- Gap 3 (`assignment_path` missing): Resolved — column added to lessons table at line 32 of schema migration
- Gap 4 (dead type file): Resolved — `src/types/course.ts` deleted

The only remaining items are human verification checks that require a live Supabase environment. All automated verification levels pass: code exists, is substantive, is wired, and data flows through real Supabase queries.

---

_Verified: 2026-03-25T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification: Yes — previous status was gaps_found (3/7), now human_needed (7/7)_
