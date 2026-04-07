---
phase: 04-student-learning-submission
plan: "04"
subsystem: ui
tags: [react, student, submission, image-compression, heic, upload, supabase-storage, tanstack-query]

dependency_graph:
  requires:
    - submissions-api (04-01): compressImage, uploadSubmission, getSubmissionSignedUrl
    - lesson-content (04-03): placeholder div to replace
  provides:
    - submission-area-component
    - lesson-content-integrated
  affects:
    - 04-05
    - phase-05-teacher-grading

tech-stack:
  added: []
  patterns:
    - useMutation with onSuccess/onError toast feedback pattern
    - useEffect for async data loading on prop change (signed URL fetch)
    - queryClient.invalidateQueries after mutation to refresh parent state
    - File input hidden with ref + button click delegation

key-files:
  created:
    - src/components/student/SubmissionArea.tsx
  modified:
    - src/components/student/LessonContent.tsx

key-decisions:
  - "No resubmit UI after first submit (D-15) — once submission exists, show read-only view only"
  - "Signed URL loaded in useEffect on submission.file_path change — avoids duplicate API calls on re-renders"
  - "queryClient.invalidateQueries(['submissions', courseId]) on success — parent CourseDetailPage refreshes submission map"

patterns-established:
  - "SubmissionArea is fully self-contained: handles selection, compression, upload, and display state"
  - "Hidden file input with ref — button click triggers input.click(), real input hidden for styling"

requirements-completed: [SUBMIT-01, SUBMIT-02, SUBMIT-03, SUBMIT-04]

duration: 8min
completed: 2026-04-07
---

# Phase 4 Plan 4: SubmissionArea Component — Photo Upload with Compression and Integration Summary

**SubmissionArea component with client-side HEIC-aware image compression, Supabase Storage upload, and three-state display (unsubmitted/submitted/graded) integrated into LessonContent**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-07T09:30:00Z
- **Completed:** 2026-04-07T09:38:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Photo upload flow: file selection via camera/gallery → client-side HEIC conversion + compression → Supabase Storage upload → submission record insert
- Three submission state renders: Chưa nộp (unsubmitted), Đã nộp (awaiting grade), Đã chấm (graded with score/comment)
- LessonContent's placeholder replaced with live SubmissionArea — stub fully resolved
- All tap targets meet UX-02 (min-h-[48px]), file input has capture="environment" for mobile camera priority

## Task Commits

1. **Prereq: Incorporate Plan 01/02/03 foundation** - `a366b0a` (chore)
2. **Task 1: Create SubmissionArea component** - `0aa4ea3` (feat)
3. **Task 2: Integrate SubmissionArea into LessonContent** - `993c59f` (feat)

## Files Created/Modified

- `src/components/student/SubmissionArea.tsx` — Photo upload with compression, status display, submitted image preview with signed URL
- `src/components/student/LessonContent.tsx` — Replaced submission placeholder with SubmissionArea component, removed inline Badge status logic

## Decisions Made

- No resubmit UI after first submit (D-15) — conditional rendering: submission prop truthy → read-only view, null → upload flow
- Signed URL fetched via useEffect on `submission.file_path` change — only called when needed, errors silently caught
- queryClient.invalidateQueries on success uses `['submissions', courseId]` key — matches CourseDetailPage query key for automatic refetch

## Deviations from Plan

**1. [Rule 3 - Blocking] Cherry-picked Plan 01/02/03 files into parallel worktree**
- **Found during:** Pre-task setup
- **Issue:** Parallel worktree branch didn't have Plan 01/02/03 work (submissions.ts, lesson-progress.ts, StudentLayout, LessonContent, etc.)
- **Fix:** Used `git checkout worktree-agent-a4ffe618 --` to bring student component files, added browser-image-compression and heic2any via yarn, updated App.tsx with student routes, committed as prereq chore
- **Files affected:** All Plan 01/02/03 created files
- **Commit:** a366b0a

---

**Total deviations:** 1 auto-fixed (1 blocking — parallel worktree setup)
**Impact on plan:** Standard parallel execution setup. No scope changes.

## Issues Encountered

None beyond the standard parallel worktree file incorporation (handled as deviation above).

## Known Stubs

None — the submission area placeholder stub from Plan 03 is now fully resolved. SubmissionArea renders live photo upload and status display. Graded state (score + comment) renders read-only fields that will be populated by Phase 5 teacher grading flow.

## Next Phase Readiness

- SubmissionArea complete — student photo upload flow end-to-end functional
- Plan 04-05 (progress tracking, enrollment display) can proceed independently
- Phase 5 (teacher grading) can read submissions and write score/comment — the graded state render in SubmissionArea is already wired

## Self-Check: PASSED

- [x] src/components/student/SubmissionArea.tsx exists with 162 lines
- [x] SubmissionArea contains: compressImage, uploadSubmission, getSubmissionSignedUrl
- [x] SubmissionArea contains: accept="image/*,image/heic", capture="environment"
- [x] SubmissionArea contains: aria-label on file input
- [x] SubmissionArea contains: Chưa nộp, Đã nộp (đang chờ chấm), Đã chấm
- [x] SubmissionArea contains: Đang xử lý..., Chọn ảnh bài làm, Nộp bài
- [x] SubmissionArea contains: IMAGE_TOO_LARGE error handling
- [x] SubmissionArea has min-h-[48px] on at least 2 buttons (3 total)
- [x] SubmissionArea has max-h-[200px] (submitted image) and max-h-[120px] (preview)
- [x] LessonContent contains import SubmissionArea from './SubmissionArea'
- [x] LessonContent contains <SubmissionArea with props
- [x] LessonContent does NOT contain id="submission-area" placeholder
- [x] LessonContent does NOT contain "Plan 04" placeholder comment
- [x] grep -c "SubmissionArea" LessonContent returns 2 (import + usage)
- [x] yarn build succeeds (no TypeScript errors)
- [x] commits a366b0a, 0aa4ea3, 993c59f exist

---
*Phase: 04-student-learning-submission*
*Completed: 2026-04-07*
