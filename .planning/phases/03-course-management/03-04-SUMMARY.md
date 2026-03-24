---
phase: 03-course-management
plan: "04"
subsystem: ui
tags: [react, tanstack-query, react-hook-form, zod, supabase, shadcn, storage]

requires:
  - phase: 03-course-management
    plan: "01"
    provides: lessons table in Supabase with assignment_path column
  - phase: 03-course-management
    plan: "03"
    provides: ChaptersPage, chapters API, Chapter type, /admin/courses/:courseId route

provides:
  - extractYouTubeID utility (src/lib/youtube.ts) — handles watch/embed/shorts/youtu.be URLs
  - Lessons API (fetchLessons, insertLesson, updateLesson, removeLesson, reorderLessons)
  - Supabase storage helpers (uploadAssignment, deleteAssignment, getAssignmentPublicUrl) for assignments bucket
  - LessonsPage at /admin/courses/:courseId/chapters/:chapterId with table, reorder buttons, delete dialog
  - LessonFormDialog for create/edit with YouTube URL validation, file upload (<10MB, PDF/image)
  - BookOpen navigation button in ChaptersPage linking to LessonsPage

affects: [05-course-management, student-learning-view]

tech-stack:
  added: []
  patterns:
    - extractYouTubeID converts arbitrary YouTube URL to embed ID via two regex patterns
    - LessonFormDialog uses ScrollArea for tall form content within Dialog
    - File upload path: tmp/{chapterId}/{timestamp}.ext on create; {lessonId}/{timestamp}.ext on edit
    - deleteAssignment called before removeLesson in delete mutation (storage cleanup first)
    - reorderLessons mirrors reorderChapters: two sequential Supabase updates

key-files:
  created:
    - src/lib/youtube.ts
    - src/lib/api/lessons.ts
    - src/pages/admin/LessonsPage.tsx
    - src/components/admin/LessonFormDialog.tsx
  modified:
    - src/App.tsx
    - src/pages/admin/ChaptersPage.tsx

key-decisions:
  - "extractYouTubeID normalises any YouTube URL to video ID; video_url stored as embed URL (https://www.youtube.com/embed/{id})"
  - "Assignment storage path uses tmp/{chapterId} prefix on create (lesson ID not yet known) — acceptable for MVP with no path migration"
  - "File cleanup (deleteAssignment) happens before lesson record delete — if storage delete fails the error surfaces before DB mutation"
  - "BookOpen navigation button added to ChaptersPage (Rule 2 deviation) — lessons page was unreachable without it"

requirements-completed: []

duration: 20min
completed: 2026-03-24
---

# Phase 3 Plan 04: Admin Lessons Page Summary

**Admin lessons CRUD page at /admin/courses/:courseId/chapters/:chapterId with YouTube URL extraction, PDF/image file upload to Supabase Storage, reorder [↑][↓], and delete with storage cleanup**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-03-24
- **Tasks:** 5 (3 commits)
- **Files modified:** 6

## Accomplishments

- `extractYouTubeID()` utility handling watch, embed, shorts, and youtu.be URL formats
- Lessons API with full CRUD, `reorderLessons()`, and `uploadAssignment`/`deleteAssignment`/`getAssignmentPublicUrl` storage helpers
- LessonsPage with 3-level breadcrumb (Khóa học > Tên khóa > Tên chuyên đề), lessons table with FileText attachment indicator, reorder buttons, and delete confirmation dialog
- LessonFormDialog with RHF+Zod validation: title, YouTube URL (validated via extractYouTubeID), description, file upload limited to PDF/image < 10MB
- Scrollable dialog via ScrollArea for tall form content
- File attachment flow: select → show name+size; existing file → show Xóa file button
- Storage cleanup on lesson delete: `deleteAssignment` called before `removeLesson`
- Route `/admin/courses/:courseId/chapters/:chapterId` wired in App.tsx with ProtectedRoute (admin)

## Task Commits

1. **Task 1: Extract utilities and APIs** — `90b5b58` (feat)
2. **Tasks 2+3+4: LessonsPage + LessonFormDialog + route** — `8868666` (feat)
3. **Deviation fix: ChaptersPage navigation button** — `82bfc02` (fix)

## Files Created/Modified

- `src/lib/youtube.ts` — extractYouTubeID regex utility
- `src/lib/api/lessons.ts` — Lesson interface, CRUD, reorderLessons, storage helpers
- `src/pages/admin/LessonsPage.tsx` — Full lessons management page
- `src/components/admin/LessonFormDialog.tsx` — Dialog for creating/editing lessons
- `src/App.tsx` — Added `/admin/courses/:courseId/chapters/:chapterId` route and LessonsPage import
- `src/pages/admin/ChaptersPage.tsx` — Added BookOpen navigation button to LessonsPage

## Decisions Made

- YouTube embed URL stored as `https://www.youtube.com/embed/{id}` in `video_url` column; `extractYouTubeID` handles URL normalisation at form submission time.
- Assignment storage path uses `tmp/{chapterId}/{timestamp}.ext` on create (lesson ID is not yet known). Acceptable for MVP — paths are never surfaced to students directly.
- `deleteAssignment` is called before `removeLesson` in the delete mutation. If storage deletion fails, the DB row is not deleted either, leaving data in a consistent state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added BookOpen navigation button to ChaptersPage**
- **Found during:** Task 2 (building LessonsPage)
- **Issue:** ChaptersPage had no button or link to navigate to the LessonsPage for a chapter — the lessons page would be unreachable from the UI
- **Fix:** Added `useNavigate` and a `BookOpen` icon button to ChaptersPage; clicking navigates to `/admin/courses/:courseId/chapters/:chapterId`
- **Files modified:** `src/pages/admin/ChaptersPage.tsx`
- **Commit:** `82bfc02`

## Known Stubs

None — all data flows are wired to Supabase.

## Self-Check: PASSED
