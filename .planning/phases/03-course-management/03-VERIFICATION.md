---
phase: 03-course-management
verified: 2026-03-25T00:00:00Z
status: gaps_found
score: 3/7 must-haves verified
re_verification: false
gaps:
  - truth: "Phase 03 code is merged into main and deployable"
    status: failed
    reason: "All Phase 03 implementation commits exist only on agent worktree branches (worktree-agent-ada3e8a1, worktree-agent-acc5e787, worktree-agent-af493594, worktree-agent-aa2a10b9, worktree-agent-adf99ffd). main branch is at bdac98e which only contains planning documentation for Phase 03. No Phase 03 source files exist on main."
    artifacts:
      - path: "src/lib/api/courses.ts"
        issue: "Does not exist on main branch"
      - path: "src/lib/api/chapters.ts"
        issue: "Does not exist on main branch"
      - path: "src/lib/api/lessons.ts"
        issue: "Does not exist on main branch"
      - path: "src/lib/api/enrollments.ts"
        issue: "Does not exist on main branch"
      - path: "src/lib/youtube.ts"
        issue: "Does not exist on main branch"
      - path: "src/pages/admin/CoursesPage.tsx"
        issue: "Does not exist on main branch"
      - path: "src/pages/admin/ChaptersPage.tsx"
        issue: "Does not exist on main branch"
      - path: "src/pages/admin/LessonsPage.tsx"
        issue: "Does not exist on main branch"
      - path: "src/components/admin/CourseFormDialog.tsx"
        issue: "Does not exist on main branch"
      - path: "src/components/admin/ChapterFormDialog.tsx"
        issue: "Does not exist on main branch"
      - path: "src/components/admin/LessonFormDialog.tsx"
        issue: "Does not exist on main branch"
      - path: "src/components/admin/UserEnrollmentDialog.tsx"
        issue: "Does not exist on main branch"
      - path: "src/types/course.ts"
        issue: "Does not exist on main branch"
      - path: "supabase/migrations/20260324_course_management_rls.sql"
        issue: "Does not exist on main branch"
      - path: "supabase/migrations/20260324_course_management_storage.sql"
        issue: "Does not exist on main branch"
    missing:
      - "Merge worktree-agent-ada3e8a1 (the most complete branch, containing all plans 01-05) into main"

  - truth: "DB schema and application code use consistent column names for grade target and lesson attachment"
    status: failed
    reason: "Two schema mismatches between 20260324_course_management_schema.sql and the application code. (1) The courses table defines 'grade smallint' but courses.ts API, CourseFormDialog, CoursesPage, UserEnrollmentDialog, and enrollments.ts all use 'target_grade' as a string enum (grade_7 | grade_8 | grade_9 | advanced). Supabase queries selecting or inserting 'target_grade' will throw a runtime error because the column does not exist. (2) The lessons table has no 'assignment_path' column but Lesson interface, all lesson CRUD, LessonFormDialog, and LessonsPage all read and write 'assignment_path'. File attachment functionality will fail at runtime."
    artifacts:
      - path: "supabase/migrations/20260324_course_management_schema.sql"
        issue: "courses table uses 'grade smallint' instead of 'target_grade text/enum'; lessons table missing 'assignment_path text' column"
      - path: "src/lib/api/courses.ts"
        issue: "Course interface and CourseInsert type reference 'target_grade' which does not match DB column 'grade'"
      - path: "src/lib/api/lessons.ts"
        issue: "Lesson interface and LessonInsert/LessonUpdate types reference 'assignment_path' which does not exist in DB schema"
      - path: "src/types/course.ts"
        issue: "Uses 'grade: number | null' (matching DB) but is unused by the UI which uses courses.ts Course type with 'target_grade' enum — dead code creating confusion"
    missing:
      - "Update migration 20260324_course_management_schema.sql: rename 'grade smallint' to 'target_grade text NOT NULL' with values 'grade_7'/'grade_8'/'grade_9'/'advanced', or add a new ALTER TABLE migration"
      - "Add 'assignment_path text' column to the lessons table in schema migration"

  - truth: "Admin can create, edit, and delete courses with target grade (COURSE-01)"
    status: partial
    reason: "UI implementation is complete and substantive in the worktree (CoursesPage.tsx, CourseFormDialog.tsx, courses.ts API all wired to Supabase). However, the runtime will fail because courses.target_grade does not exist as a DB column — the query will return an error. Additionally, the code is not on main."
    artifacts:
      - path: ".claude/worktrees/agent-ada3e8a1/src/pages/admin/CoursesPage.tsx"
        issue: "Correct and wired — blocked only by DB schema mismatch on 'target_grade'"
    missing:
      - "Fix schema mismatch (see gap above) then merge to main"

  - truth: "Admin can add lessons with YouTube video URLs and ordered chapters (COURSE-02, COURSE-03)"
    status: partial
    reason: "UI implementation in worktree is complete: ChaptersPage with reorder buttons, LessonsPage with reorder, LessonFormDialog with YouTube URL validation via extractYouTubeID. Runtime will fail because lessons.assignment_path does not exist in DB — insert/update queries will return errors."
    artifacts:
      - path: ".claude/worktrees/agent-ada3e8a1/src/lib/api/lessons.ts"
        issue: "References assignment_path in insert/update — will cause Supabase error"
    missing:
      - "Add assignment_path column to lessons migration then merge to main"

  - truth: "Admin can attach assignment files to lessons (COURSE-04)"
    status: failed
    reason: "LessonFormDialog has complete file upload logic (PDF/image, 10MB limit, Supabase Storage helpers). However lessons.assignment_path column is missing from the DB schema so uploaded file paths cannot be persisted. The assignments storage bucket migration (20260324_course_management_storage.sql) is also not on main."
    artifacts:
      - path: "supabase/migrations/20260324_course_management_schema.sql"
        issue: "lessons table missing assignment_path column"
    missing:
      - "Add 'assignment_path text' column to lessons table"
      - "Merge migrations and code to main"

  - truth: "Admin can assign and remove student enrollments (COURSE-05)"
    status: partial
    reason: "UserEnrollmentDialog and enrollments.ts API are fully implemented and substantive in the worktree. UsersPage is wired with a 'Quan ly khoa hoc' button (BookOpen icon) for approved users. The enrollment query uses 'target_grade' join which will fail at runtime due to the DB schema mismatch. Code is not on main."
    artifacts:
      - path: ".claude/worktrees/agent-ada3e8a1/src/lib/api/enrollments.ts"
        issue: "select query references 'target_grade' in the courses join — will fail if column name is 'grade' in DB"
    missing:
      - "Fix courses schema mismatch, then merge to main"
human_verification:
  - test: "Verify RLS policies work correctly for student enrollment-based access"
    expected: "An approved student enrolled in course X can read lessons for course X but not for course Y they are not enrolled in"
    why_human: "Requires a live Supabase instance with seeded data and two test user accounts"
  - test: "Verify file upload and download for lesson attachments"
    expected: "Admin can upload a PDF, the filename/size shows in the form, and after saving the FileText icon appears in the lessons table"
    why_human: "Requires live Supabase Storage bucket and file I/O; cannot verify with grep"
---

# Phase 03: Course Management Verification Report

**Phase Goal:** Admin has full control to build the course catalogue — courses, ordered lessons with YouTube videos, assignment attachments, and student enrollment — so content exists for students to consume
**Verified:** 2026-03-25T00:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Phase 03 code is merged into main and deployable | FAILED | main is at bdac98e (docs only); all implementation is in 5 separate worktree branches, never merged |
| 2 | DB schema and application code use consistent column names | FAILED | `courses.grade` (smallint) vs `target_grade` (string enum) in all UI/API; `assignment_path` absent from lessons table |
| 3 | Admin can create/edit/delete courses (COURSE-01) | PARTIAL | CoursesPage + CourseFormDialog fully implemented in worktree but blocked by `target_grade` schema mismatch |
| 4 | Admin can create chapters and ordered lessons (COURSE-02, COURSE-03) | PARTIAL | ChaptersPage + LessonsPage + reorder buttons all implemented; blocked by `assignment_path` mismatch and not on main |
| 5 | Admin can attach assignment files to lessons (COURSE-04) | FAILED | LessonFormDialog upload UI complete, storage bucket migration exists; `assignment_path` column missing from DB schema |
| 6 | Admin can assign/remove student enrollments (COURSE-05) | PARTIAL | UserEnrollmentDialog + enrollments API fully wired; enrollment join query references non-existent `target_grade`; not on main |
| 7 | RLS policies protect enrolled content per student | VERIFIED | 20260324_course_management_rls.sql is substantive — is_admin()/is_approved_user() SECURITY DEFINER helpers, all 4 tables covered; exists on both worktree-agent-af493594 and worktree-agent-ada3e8a1 |

**Score:** 3/7 truths verified (RLS policies + chapter reorder logic + YouTube extraction utility are technically sound; blocked by merge gap and two schema mismatches)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260324_course_management_schema.sql` | Tables: courses, chapters, lessons, enrollments | STUB on main / PARTIAL in worktree | Present in worktree-agent-af493594 and ada3e8a1. Missing `assignment_path` column in lessons; `courses.grade` should be `target_grade` |
| `supabase/migrations/20260324_course_management_rls.sql` | RLS policies for all 4 tables | MISSING on main / VERIFIED in worktree | Fully substantive — admin ALL + student SELECT via enrollment check |
| `supabase/migrations/20260324_course_management_storage.sql` | assignments storage bucket | MISSING on main / VERIFIED in worktree | 10MB limit, PDF/image MIME types, 4 policies |
| `src/types/course.ts` | TypeScript interfaces | MISSING on main / ORPHANED in worktree | Uses `grade: number` (matches schema) but entire UI uses `courses.ts` Course type with `target_grade`; dead code |
| `src/lib/api/courses.ts` | CRUD for courses table | MISSING on main / VERIFIED in worktree | Substantive: fetch/insert/update/delete wired to Supabase |
| `src/lib/api/chapters.ts` | CRUD + reorder for chapters | MISSING on main / VERIFIED in worktree | Substantive: includes reorderChapters swapping order_index |
| `src/lib/api/lessons.ts` | CRUD + reorder + storage helpers | MISSING on main / STUB in worktree | assignment_path column referenced but absent from DB; rest is substantive |
| `src/lib/api/enrollments.ts` | getUserEnrollments, addEnrollment, removeEnrollment | MISSING on main / STUB in worktree | Supabase join references `target_grade` which doesn't exist in DB |
| `src/lib/youtube.ts` | extractYouTubeID utility | MISSING on main / VERIFIED in worktree | Handles watch/embed/shorts/youtu.be formats with two regex patterns |
| `src/pages/admin/CoursesPage.tsx` | Course list + CRUD + grade badges | MISSING on main / VERIFIED in worktree | Fully wired: useQuery fetchCourses, useMutation deleteCourse, CourseFormDialog integrated |
| `src/pages/admin/ChaptersPage.tsx` | Chapter list + reorder + nav to LessonsPage | MISSING on main / VERIFIED in worktree | BookOpen nav button confirmed at line 207; reorder buttons with boundary disable |
| `src/pages/admin/LessonsPage.tsx` | Lesson list + reorder + attachment indicator | MISSING on main / VERIFIED in worktree | FileText indicator for assignment_path; reorder wired; 3-level breadcrumb |
| `src/components/admin/CourseFormDialog.tsx` | RHF+Zod create/edit dialog | MISSING on main / VERIFIED in worktree | Full validation: title (required), description (optional), target_grade (enum select) |
| `src/components/admin/ChapterFormDialog.tsx` | RHF+Zod create/edit for chapters | MISSING on main / VERIFIED in worktree | Title validation only; nextOrderIndex passed from parent |
| `src/components/admin/LessonFormDialog.tsx` | YouTube URL + file upload dialog | MISSING on main / VERIFIED in worktree | extractYouTubeID validation, file size/type check, ScrollArea, storage cleanup on edit |
| `src/components/admin/UserEnrollmentDialog.tsx` | Enrollment table + add/remove | MISSING on main / VERIFIED in worktree | Available courses computed client-side by Set diff; grade badges matching CoursesPage palette |
| `src/App.tsx` (routes) | 3 new admin routes | MISSING on main / VERIFIED in worktree | /admin/courses, /admin/courses/:courseId, /admin/courses/:courseId/chapters/:chapterId all wired with ProtectedRoute admin guard |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `CoursesPage.tsx` | Supabase `courses` table | `fetchCourses()` in useQuery | WIRED in worktree | useQuery with queryFn: fetchCourses confirmed at line 56-59 |
| `CourseFormDialog.tsx` | Supabase `courses` table | `insertCourse`/`updateCourse` in useMutation | WIRED in worktree | mutation.mutate calls confirmed; toast on success/error |
| `ChaptersPage.tsx` | Supabase `chapters` table | `fetchChapters(courseId)` in useQuery | WIRED in worktree | Confirmed with courseId param |
| `ChaptersPage.tsx` | `LessonsPage.tsx` | `useNavigate` + BookOpen button | WIRED in worktree | navigate at line 207 confirmed |
| `LessonsPage.tsx` | Supabase `lessons` table | `fetchLessons(chapterId)` in useQuery | WIRED in worktree | Confirmed with chapterId param |
| `LessonFormDialog.tsx` | Supabase Storage `assignments` | `uploadAssignment()` | WIRED in worktree | Upload before insertLesson confirmed |
| `LessonFormDialog.tsx` | `extractYouTubeID` utility | import + Zod refine | WIRED in worktree | Zod schema uses extractYouTubeID in .refine() at line 44-47 |
| `UsersPage.tsx` | `UserEnrollmentDialog` | `enrollmentUser` state + onManageEnrollments prop | WIRED in worktree | Line 229 and 283 confirmed |
| `UserEnrollmentDialog.tsx` | Supabase `enrollments` table | `getUserEnrollments`/`addEnrollment`/`removeEnrollment` | WIRED in worktree | All three mutation fns confirmed |
| `courses.ts` API | Supabase `courses.target_grade` column | `.select('*')` + `target_grade` in insert | BROKEN | DB column is `grade smallint`, not `target_grade text` |
| `lessons.ts` API | Supabase `lessons.assignment_path` column | `.select('*')` + `assignment_path` in insert | BROKEN | Column does not exist in DB schema |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `CoursesPage.tsx` | `courses` array | `fetchCourses()` → Supabase `.from('courses').select('*')` | Yes (real DB query) | FLOWING — but will fail at runtime if `target_grade` column absent |
| `ChaptersPage.tsx` | `chapters` array | `fetchChapters(courseId)` → `.from('chapters').select('*').eq('course_id', courseId).order('order_index')` | Yes | FLOWING |
| `LessonsPage.tsx` | `lessons` array | `fetchLessons(chapterId)` → `.from('lessons').select('*').eq('chapter_id', chapterId).order('order_index')` | Yes | FLOWING — but `assignment_path` column absent means field will always be null even after DB migration fix |
| `UserEnrollmentDialog.tsx` | `enrollments` array | `getUserEnrollments(userId)` → `.from('enrollments').select('...course:courses(id, title, target_grade)')` | Yes | FLOWING — but join on `target_grade` will fail at runtime |

### Behavioral Spot-Checks

Step 7b: SKIPPED — all Phase 03 code is in worktree branches not on main; the dev server runs against main branch code which has no Phase 03 routes or components.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| COURSE-01 | 03-02-PLAN.md | Admin có thể tạo, sửa, xóa khóa học (tên, mô tả, lớp mục tiêu: 7/8/9/chuyên) | BLOCKED | CoursesPage + CourseFormDialog implemented; blocked by `target_grade` DB mismatch and not on main |
| COURSE-02 | 03-03-PLAN.md, 03-04-PLAN.md | Admin có thể thêm bài học vào khóa học (tiêu đề, URL video YouTube, mô tả, thứ tự) | BLOCKED | LessonsPage + LessonFormDialog implemented with YouTube extraction; blocked by `assignment_path` mismatch and not on main |
| COURSE-03 | 03-03-PLAN.md, 03-04-PLAN.md | Admin có thể sắp xếp lại thứ tự bài học trong khóa | BLOCKED | reorderLessons and reorderChapters both implemented with [UP][DOWN] buttons; blocked by not on main |
| COURSE-04 | 03-04-PLAN.md | Admin có thể đính kèm bài tập vào bài học (upload file PDF hoặc hình ảnh đề bài) | BLOCKED | LessonFormDialog file upload complete; storage bucket migration written; `assignment_path` column missing from DB schema |
| COURSE-05 | 03-05-PLAN.md | Admin có thể gán học sinh vào khóa học | BLOCKED | UserEnrollmentDialog + enrollments API complete; blocked by `target_grade` mismatch in enrollment join and not on main |

All 5 requirements are BLOCKED. The implementation code is substantive and correct in structure, but two cross-cutting defects prevent any of it from running: (1) unmerged worktree code, (2) DB schema column mismatches.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `supabase/migrations/20260324_course_management_schema.sql` | 8 | `grade smallint` — column name differs from all application code using `target_grade` | Blocker | All course CRUD and enrollment queries will fail at runtime with "column does not exist" |
| `supabase/migrations/20260324_course_management_schema.sql` | 26-35 | lessons table has no `assignment_path` column | Blocker | All lesson insert/update/select involving attachments will fail; attachment feature entirely non-functional |
| `src/types/course.ts` | 1-68 | Duplicate type file with different shape from `courses.ts` — uses `grade: number`, UI uses `target_grade` enum | Warning | Dead code causing confusion; both files define Course but with incompatible types |
| Multiple worktree branches | — | Implementation code never merged to main | Blocker | Phase goal cannot be tested or deployed |

### Human Verification Required

#### 1. RLS Student Access Enforcement

**Test:** Create two Supabase users: student A enrolled in Course X, student B enrolled in Course Y. As student A, attempt to read lessons for Course Y.
**Expected:** RLS denies the select; student A sees only Course X lessons.
**Why human:** Requires live Supabase instance with seeded auth users and enrolled records.

#### 2. Lesson File Attachment End-to-End

**Test:** As admin, open LessonFormDialog for a new lesson. Upload a PDF under 10MB. Save. Verify the FileText icon appears in the lessons table row. Edit the lesson and verify the file name is shown with the "Xoa file" button.
**Expected:** File stored in `assignments` bucket, `assignment_path` persisted, indicator visible in UI.
**Why human:** Requires live Supabase Storage with real file I/O; cannot verify with static analysis.

### Gaps Summary

Phase 03 code is **functionally complete in the worktree** but is blocked from goal achievement by three layered problems:

**Gap 1 — Code not on main (critical):** All Phase 03 source files exist exclusively on agent worktree branches. The `main` branch has only planning documents. Nothing can be deployed or tested. The most complete branch is `worktree-agent-ada3e8a1` which contains all plans 01–05.

**Gap 2 — `target_grade` column mismatch (critical):** The DB schema migration defines `courses.grade smallint` but every piece of application code (5 files) uses `courses.target_grade` as a string enum. Any Supabase query touching this column will fail with a runtime error. This impacts COURSE-01 and COURSE-05.

**Gap 3 — `assignment_path` column missing (critical):** The `lessons` table in the DB migration has no `assignment_path` column. The `Lesson` type, all lesson API calls, LessonFormDialog, and LessonsPage all depend on it. The entire file attachment feature (COURSE-04) is non-functional as a result, and even basic lesson creation will throw errors due to the column being in the INSERT payload.

**Root cause of gaps 2 and 3:** Plan 01 (schema) and Plans 02-05 (UI) were executed by different agent instances. The schema was written with `grade smallint` and no `assignment_path`; the UI agents independently designed their types with `target_grade` enum and `assignment_path`, creating an undetected divergence between the data layer and the application layer.

**Remediation priority:**
1. Fix the schema migration (rename `grade` → `target_grade` text, add `assignment_path` to lessons)
2. Merge `worktree-agent-ada3e8a1` into `main` (it is the most complete branch and contains all plans)

---

_Verified: 2026-03-25T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
