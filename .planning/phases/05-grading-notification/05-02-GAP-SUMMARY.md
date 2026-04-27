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

## Human Actions Required

**Task 6 — Apply 3 SQL migrations to Supabase Dashboard (blocking):**
1. `supabase/migrations/20260407_07_student_viewed_at.sql`
2. `supabase/migrations/20260427_10_submissions_fk_profiles.sql`
3. `supabase/migrations/20260427_11_teacher_images.sql`

Navigate to: Supabase Dashboard → SQL Editor → New query → paste each migration → Run

**Task 7 — End-to-end UAT re-run (blocking)**
Re-run all UAT scenarios from the checklist to confirm grading page, teacher images, and bell dropdown work against live database.
