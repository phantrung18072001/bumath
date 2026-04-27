---
phase: 05-grading-notification
plan: 02-GAP
status: complete
completed_at: 2026-04-27T12:52:09Z
---

# 05-02 GAP Plan Summary

## What Was Built

**Task 1 — SQL migration:** Created `supabase/migrations/20260427_11_teacher_images.sql` adding `teacher_images TEXT` column to `public.submissions` with comment documenting the JSON-encoded storage path array format.

**Task 2 — submissions API extended:**
- Added `teacher_images: string[] | null` field to `Submission` interface
- Added `mapSubmission()` helper that decodes `teacher_images` JSON text → `string[]`
- Applied `mapSubmission` in `getSubmission` and `getSubmissions` return paths
- Updated `gradeSubmission()` with optional 4th arg `teacherImages?: string[]` — serializes to JSON when provided
- Widened `getSubmissionSignedUrls()` to accept `string | string[]` — skips parseFilePaths when given array
- Added `getSubmissionById(id)` for teacher grading page
- Added `GradedUnviewedSubmission` type and `getGradedUnviewed()` query (joins lesson + chapter + course, filters graded + unviewed, ordered newest-first)

**Task 3 — GradingPage + routing refactor:**
- Created `src/pages/admin/GradingPage.tsx` (>200 lines): full-page UX with image carousel (prev/next, counter), score input, comment textarea, teacher image upload with thumbnails, double-confirm save flow, Vietnamese text with `leading-relaxed`
- Added route `/admin/submissions/:submissionId` in `App.tsx` inside admin protected block
- Rewrote `SubmissionsPage.tsx` to use `useNavigate` + route to `/admin/submissions/${row.id}`, removed all GradingDialog state
- Deleted `GradingDialog.tsx` and `GradingDialog.test.tsx` (no remaining references in `src/`)

**Task 4 — Teacher feedback images in SubmissionArea:**
- Added `TeacherImages` internal component using `useQuery` + `getSubmissionSignedUrls` with `string[]` paths
- Rendered below score/comment block when `submission.teacher_images.length > 0`
- Grid layout: 2 cols mobile, 3 cols sm+, each image links to full-size URL in new tab

**Task 5 — Bell dropdown + deep-link:**
- Rewrote `BellNotification.tsx`: `useRef` + `useEffect` outside-click handler, `useQuery(getGradedUnviewed)` with 60s refetch, dropdown panel listing submissions linking to `/courses/${slug}?lesson=${lessonId}`
- Updated `CourseDetailPage.tsx`: `useSearchParams`, `lessonIdFromQuery`, `useEffect` that finds lesson by ID and calls `scrollIntoView` via `requestAnimationFrame`

## Verification

- `yarn tsc --noEmit`: PASS (0 errors)
- `yarn lint` (files we changed): PASS (0 errors in changed files; 8 pre-existing errors in `AuthContext.test.tsx` × 6 worktrees and `LessonFormDialog.tsx` — all pre-existing, none introduced)
- GradingDialog removed: PASS (`grep -r "GradingDialog" src/` → no matches)
- All 5 tasks complete: PASS

## Commit

`226ecda` feat(phase-05-gap): close GAP-A/B/C/D - grading page, teacher images, bell dropdown

## Post-execution fixes (UAT session 2026-04-27)

During UAT the following bugs were found and fixed:

- **`lessons.slug` does not exist** — removed `slug` from `getGradedUnviewed` select query and `GradedUnviewedSubmission` type (lessons table has no slug column)
- **Storage 400 on teacher upload** — added missing INSERT policy `supabase/migrations/20260427_12_teacher_storage_upload_policy.sql` for `teacher/` prefix in submissions bucket
- **Bell badge not decrementing** — `SubmissionArea` was invalidating wrong query key (`['student','unviewed-grades']` vs `['graded-unviewed']`); fixed to use matching key for instant badge decrement
- **UI improvements**: two-column sticky layout (image left, form right), `react-medium-image-zoom` for click-to-zoom, container widened to `max-w-6xl`, image `max-h` removed

## Human Actions — COMPLETED ✅

**Task 6:** All 4 migrations applied to live Supabase:
1. `20260407_07_student_viewed_at.sql` ✅
2. `20260427_10_submissions_fk_profiles.sql` ✅
3. `20260427_11_teacher_images.sql` ✅
4. `20260427_12_teacher_storage_upload_policy.sql` ✅

**Task 7 — UAT: APPROVED 2026-04-27**
All 15 test cases passed (B1-B2, A1-A6, C1-C2, D1-D5).
