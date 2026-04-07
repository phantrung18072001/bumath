---
phase: 04-student-learning-submission
plan: "03"
subsystem: course-detail-ui
tags: [ui, react, student, lesson, sidebar, video, progress, optimistic-update]
dependency_graph:
  requires:
    - lesson-progress-api (04-01)
    - submissions-api (04-01)
    - student-layout-shell (04-02)
    - student-routes (04-02)
  provides:
    - course-detail-page
    - lesson-sidebar
    - lesson-content
    - lesson-progress-button
  affects:
    - 04-04
    - 04-05
tech_stack:
  added: []
  patterns:
    - TanStack Query nested useQuery (chapters → lessons → progress/submissions)
    - Optimistic update pattern with onMutate/onError/onSettled
    - Map<chapterId, Lesson[]> for sidebar tree rendering
    - Local state activeLessonId (no URL change on lesson switch, D-07)
    - Responsive layout: hidden md:flex (desktop) / block md:hidden (mobile)
key_files:
  created:
    - src/components/student/LessonSidebar.tsx
    - src/components/student/LessonProgressButton.tsx
    - src/components/student/LessonContent.tsx
  modified:
    - src/pages/student/CourseDetailPage.tsx
decisions:
  - "activeLessonId stored in local component state — URL stays stable when switching lessons (D-07)"
  - "lessonsByChapter as Map<string, Lesson[]> — avoids re-fetch, efficient sidebar rendering"
  - "Progress + submissions fetched only when allLessonIds.length > 0 — avoids empty queries"
  - "Submission area is a placeholder div in Plan 03 — Plan 04 will integrate SubmissionArea component"
metrics:
  duration: "4min"
  completed_date: "2026-04-07"
  tasks_completed: 3
  files_created: 3
  files_modified: 1
---

# Phase 4 Plan 3: Course Detail Page — Sidebar, Video, Assignment, Progress Summary

One-liner: Course detail page with 280px collapsible chapter/lesson sidebar (desktop) and 2-tab layout (mobile), YouTube embed, assignment file viewer, optimistic mark-complete, and submission status badges.

## What Was Built

**Task 1: LessonSidebar and LessonProgressButton**

- `src/components/student/LessonSidebar.tsx`:
  - Course progress header: `<Progress value={progress} aria-label="Tiến độ hoàn thành: X%" />` with "% hoàn thành" label
  - Lesson list in `<ScrollArea className="h-[calc(100vh-48px-80px)]">`
  - Chapter sections via `<Accordion type="multiple" defaultValue={chapters.map(c=>c.id)}>` (all expanded by default)
  - Lesson items: `min-h-[48px]`, 16px padding, icon (✓ green-600 / → primary / ○ muted), `aria-current` on active
  - Active lesson: `bg-sidebar-accent border-l-2 border-primary` highlight

- `src/components/student/LessonProgressButton.tsx`:
  - One-way mark complete (D-10) with `useMutation` + optimistic update
  - `onMutate`: cancels queries, adds optimistic record to cache
  - `onError`: rolls back cache + shows `toast.error('Không thể lưu trạng thái...')`
  - `onSettled`: invalidates `['lesson-progress', courseId]` query
  - Completed state: secondary/disabled button "Đã xem ✓"
  - `min-h-[48px] w-full md:w-auto` (UX-02)

**Task 2: LessonContent**

- `src/components/student/LessonContent.tsx`:
  - Empty state when no lesson: "Chọn một bài học để bắt đầu"
  - YouTube embed in `<AspectRatio ratio={16/9}>` with iframe title for accessibility
  - Lesson title (`text-xl font-semibold`) and description (`whitespace-pre-wrap`)
  - Assignment file link: `<Button variant="outline" size="sm" min-h-[48px]>` → `window.open(_blank, noopener)` via `getAssignmentPublicUrl`
  - Submission status badges: Chưa nộp (slate) / Đã nộp (blue) / Đã chấm (green)
  - Placeholder `id="submission-area"` for Plan 04 SubmissionArea integration
  - `<LessonProgressButton>` at bottom; all sections separated by `<Separator className="my-6">`
  - Content padding: `p-4 md:p-8`

**Task 3: CourseDetailPage**

- `src/pages/student/CourseDetailPage.tsx` — full replacement of Plan 02 placeholder:
  - `useParams<{ courseId }>()` + `useAuth()` for profile.id
  - Nested queries: fetchChapters → fetchLessons (Promise.all) → getLessonProgress + getSubmissions
  - `Map<chapterId, Lesson[]>` + flat `allLessons` array derived for queries
  - `completedLessonIds = new Set(progressData.map(p => p.lesson_id))`
  - `submissionMap = new Map(submissionsData.map(s => [s.lesson_id, s]))`
  - `getCourseProgress(allLessonIds, completedLessonIds)` for progress %
  - `useEffect` auto-selects first lesson on initial load
  - Desktop: `hidden md:flex h-[calc(100vh-48px)]` with `w-[280px]` sidebar
  - Mobile: `block md:hidden` with `<Tabs>` "Nội dung" / "Mục lục" tabs (`min-h-[48px]`)
  - Breadcrumb "← Khóa học của tôi" linking to /courses (D-08)
  - Loading: Skeleton placeholders; Error: Alert with Vietnamese message
  - Empty state for course with no chapters

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| prereq | 5780792 | chore(04-03): incorporate Plan 01/02 API foundation and student layout into worktree |
| 1 | 60f19f5 | feat(04-03): create LessonSidebar and LessonProgressButton components |
| 2 | 147efbb | feat(04-03): create LessonContent component |
| 3 | 10fb318 | feat(04-03): build CourseDetailPage with sidebar/tab layout and data fetching |

## Deviations from Plan

**1. [Rule 3 - Blocking] Cherry-picked Plan 01/02 files into parallel worktree**
- **Found during:** Pre-task setup
- **Issue:** Parallel worktree branch didn't have Plan 01/02 work (lesson-progress.ts, submissions.ts, grades.ts, StudentLayout, CoursesPage, student routes) — committed on separate worktree branch
- **Fix:** Used git cherry-pick --no-commit to bring in commits b7e9eef, 0748e41, fa6899a from worktree-agent-aaf2362e, then committed as single prerequisite chore commit
- **Files affected:** All Plan 01/02 created files
- **Commit:** 5780792

## Known Stubs

- `src/components/student/LessonContent.tsx` line ~69: `id="submission-area"` div — submission upload UI is not yet wired. Only shows status badges (Chưa nộp / Đã nộp / Đã chấm). Plan 04 will integrate the `SubmissionArea` component with photo upload, compression, and preview.

## Self-Check: PASSED

- [x] src/components/student/LessonSidebar.tsx exists (min 40 lines)
- [x] src/components/student/LessonProgressButton.tsx exists (min 30 lines)
- [x] src/components/student/LessonContent.tsx exists (min 60 lines)
- [x] src/pages/student/CourseDetailPage.tsx modified (min 80 lines, not placeholder)
- [x] LessonSidebar contains Accordion, AccordionItem, ScrollArea, min-h-[48px], aria-current, text-green-600, border-l-2 border-primary
- [x] LessonProgressButton contains markLessonComplete, onMutate, onError, onSettled, Đánh dấu đã xem, Đã xem ✓, Không thể lưu trạng thái, min-h-[48px]
- [x] LessonContent contains AspectRatio ratio={16/9}, Video bài học:, getAssignmentPublicUrl, window.open _blank noopener, Đề bài: Xem file, all 3 badge states, LessonProgressButton, min-h-[48px]
- [x] CourseDetailPage contains useParams, fetchChapters, fetchLessons, getLessonProgress, getSubmissions, useState, hidden md:flex, block md:hidden, Tabs/TabsList/TabsTrigger, Nội dung, Mục lục, ← Khóa học của tôi, w-[280px], min-h-[48px], LessonSidebar, LessonContent, StudentLayout
- [x] Key links verified: CourseDetailPage → chapters.ts (fetchChapters), lessons.ts (fetchLessons), lesson-progress.ts (getLessonProgress), submissions.ts (getSubmissions); LessonProgressButton → lesson-progress.ts (markLessonComplete); LessonContent → lessons.ts (getAssignmentPublicUrl)
- [x] yarn build succeeds (4 tasks done, no TypeScript errors)
- [x] commits 5780792, 60f19f5, 147efbb, 10fb318 exist
