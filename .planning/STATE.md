---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Platform Expansion
status: completed
stopped_at: Phase 15 UI-SPEC approved
last_updated: "2026-05-04T11:45:18.515Z"
last_activity: 2026-05-04 — Phase 14 all plans complete (commits 8dbc495, 1b1eb04, e14c7e9, 14154f6, 86040f9)
progress:
  total_phases: 6
  completed_phases: 1
  total_plans: 6
  completed_plans: 6
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-03 — v3.0 milestone started)

**Core value:** Học sinh có thể tự học theo tiến độ và nhận phản hồi cụ thể từ giảng viên trên từng bài làm
**Current focus:** v3.0 Platform Expansion — Phase 16: Lesson Tabs + Study Materials (plan next)

## Current Position

Phase: 15 — Admin UX + Audit ✅ COMPLETE (per ROADMAP + 15-P01..P03 SUMMARY)
Plan: —
Status: Phase 16 ready to plan — `16-CONTEXT.md` present; ROADMAP Phase 16 plans still TBD
Last activity: 2026-05-04 — Phase 14 shipped; Phase 15 artifacts complete on disk

```
v3.0 Progress: ░░░░░░░░░░░░░░░░░░░░ 0/6 phases
```

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01-foundation P01 | 2 | 3 tasks | 7 files |
| Phase 02-auth-access-control P01 | 4min | 3 tasks | 9 files |
| Phase 02-auth-access-control P02 | 15 | 3 tasks | 4 files |
| Phase 02-auth-access-control P03 | 4min | 2 tasks | 2 files |
| Phase 03-course-management P01 | 2min | 4 tasks | 4 files |
| Phase 03-course-management P02 | 5min | 4 tasks | 4 files |
| Phase 03-course-management P03 | 15min | 5 tasks | 4 files |
| Phase 03-course-management P04 | 20min | 5 tasks | 6 files |
| Phase 03-course-management P05 | 2min | 4 tasks | 3 files |
| Phase 04-student-learning-submission P01 | 2min | 2 tasks | 7 files |
| Phase 04-student-learning-submission PP02 | 8min | 2 tasks | 4 files |
| Phase 04-student-learning-submission P03 | 4min | 3 tasks | 4 files |
| Phase 04-student-learning-submission P04 | 8min | 2 tasks | 2 files |
| Phase 04-student-learning-submission P05 | 1min | 1 tasks | 0 files |
| Phase 05-grading-notification P01 | 1min | 2 tasks | 2 files |
| Phase 05-grading-notification P00 | 4 | 2 tasks | 4 files |
| Phase 05-grading-notification P03 | 4min | 2 tasks | 5 files |
| Phase 05-grading-notification P02 | 11min | 3 tasks | 6 files |
| Phase 06-ux-polish P01 | 5 | 3 tasks | 5 files |
| Phase 06-ux-polish P02 | 8min | 3 tasks | 3 files |
| Phase 06-ux-polish P00 | 7min | 5 tasks | 4 files |
| Phase 06-ux-polish P03 | 7min | 3 tasks | 3 files |
| Phase 06-ux-polish PP04 | 5min | 2 tasks | 3 files |
| Phase 06 P05 | 8min | 2 tasks | 1 files |
| Phase 13 P00 | 5 | 3 tasks | 3 files |
| Phase 13-student-pages P01 | 5 | 2 tasks | 2 files |
| Phase 13 P03 | 8min | 2 tasks | 2 files |
| Phase 13-student-pages P02 | 251 | 2 tasks | 2 files |

## Accumulated Context

### Roadmap Evolution

- Phase 6 added: UX Polish — grading filters, student course discovery, nav fixes, progress bar color
- Phase 12.1 inserted after Phase 12: UI fix - error states typography touch targets (URGENT)
- v3.0 Phases 14–19 created 2026-05-03: 31 requirements mapped across 6 phases

### v3.0 Phase Map

| Phase | Name | Requirements | Key Risk |
|-------|------|--------------|----------|
| 14 | Pricing + Access Control | PRICE-01–03, PRICE-05, VIDEO-01 | Backfill migration order — never combine backfill + RLS change |
| 15 | Admin UX + Audit | AUDIT-01, ADMIN-01–03 | Route ordering: literal before param in App.tsx |
| 16 | Lesson Tabs + Study Materials | LESSON-01–03, MAT-01–03 | Separate `study-materials` bucket; signed URL expiry |
| 17 | In-Lesson Chat | CHAT-01–03 | Realtime channel cleanup — removeChannel on every unmount |
| 18 | Mock Exam System | EXAM-01–06 | Answer separation; server-side timing; UNIQUE constraint |
| 19 | Landing + Navigator + Video | NAV-01–02, LAND-01–03, VIDEO-02, PRICE-04 | Static constants for navigator; VideoPlayer wraps, not replaces |

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Supabase as backend (Auth + DB + Storage + RLS, no server to maintain)
- YouTube embed only for video MVP (no direct upload in v1)
- Admin approval gate before students access any content
- Vercel deployment required before auth work (GitHub Pages breaks SPA deep links)
- [Phase 01-foundation]: Pin @supabase/supabase-js to 2.78.0 — v2.79+ dropped Node 18 support (project runs Node 18.20.8)
- [Phase 01-foundation]: Vercel SPA routing via vercel.json rewrites (not redirects) — rewrites preserve URL visible to user
- [Phase 01-foundation]: Delete deploy.yml permanently — GitHub Pages superseded by Vercel, no value in archiving
- [Phase 02-auth-access-control]: React Context (not TanStack Query) for auth state — session is event-driven via onAuthStateChange
- [Phase 02-auth-access-control]: setTimeout(0) for profile fetch in onAuthStateChange to avoid Supabase callback deadlock
- [Phase 02-auth-access-control]: ProtectedRoute redirects pending/rejected users to /pending; /pending page must not itself use ProtectedRoute (infinite redirect loop)
- [Phase 02-auth-access-control]: Used controlled state for Login (2 fields) and RHF+Zod for Register (6 fields)
- [Phase 02-auth-access-control]: Pending page uses inline auth checks (no ProtectedRoute) to prevent infinite redirect loop
- [Phase 02-auth-access-control]: userEvent.setup() required for Radix Tabs interaction in jsdom — fireEvent.click does not trigger pointer events
- [Phase 02-auth-access-control]: vi.mock hoisting requires all mock functions defined inside factory; named exports (__order, __updateEq) used for per-test data override
- [Phase 03-course-management]: is_admin() and is_approved_user() as SECURITY DEFINER helpers — avoids repeating profiles JOIN in every RLS policy
- [Phase 03-course-management]: Storage read policy permissive for authenticated users — file path discovery blocked by lesson RLS; student upload enforces user_id in path
- [Phase 03-course-management]: target_grade enum values: grade_7/grade_8/grade_9/advanced map to UI labels Lớp 7/8/9/Ôn chuyên
- [Phase 03-course-management]: CourseFormDialog resets via useEffect watching open/course props for clean controlled state
- [Phase 03-course-management]: reorderChapters uses two sequential Supabase updates (no transaction support in JS client) — acceptable for low-concurrency admin UI
- [Phase 03-course-management]: nextOrderIndex (chapters.length) passed from ChaptersPage to ChapterFormDialog for append-to-end ordering on create
- [Phase 03-course-management]: extractYouTubeID normalises any YouTube URL to video ID; video_url stored as embed URL
- [Phase 03-course-management]: Assignment storage path uses tmp/{chapterId} prefix on create — lesson ID not yet known at upload time
- [Phase 03-course-management]: deleteAssignment called before removeLesson — storage failure prevents DB delete (consistent failure state)
- [Phase 04-student-learning-submission]: browser-image-compression with heic2any dynamic import for HEIC fallback — avoids bundle cost
- [Phase 04-student-learning-submission]: getCourseProgress is pure function — progress computed at render, never stored in DB
- [Phase 04-student-learning-submission]: Unique constraint (user_id, lesson_id) on lesson_progress and submissions — one completion/submission per lesson
- [Phase 04-student-learning-submission]: StudentLayout uses sticky 48px header (bg-card/border-b) with min-h-[48px] logout button — meets UX-02 tap target
- [Phase 04-student-learning-submission]: CourseDetailPage created as placeholder stub for Plan 03; progress query enabled only when enrollments.length > 0
- [Phase 04-student-learning-submission]: activeLessonId in local component state — URL stable on lesson switch (D-07)
- [Phase 04-student-learning-submission]: lessonsByChapter Map<string, Lesson[]> for sidebar tree — avoids re-fetch and enables efficient rendering
- [Phase 04-student-learning-submission]: Submission area is a placeholder in Plan 03 — Plan 04 will integrate SubmissionArea component
- [Phase 04-student-learning-submission]: No resubmit UI after first submit (D-15) — once submission exists, show read-only view only
- [Phase 04-student-learning-submission]: queryClient.invalidateQueries(['submissions', courseId]) on upload success — parent CourseDetailPage auto-refetches submission map
- [Phase 04-student-learning-submission]: Phase 04 verification human-approved 2026-04-07 — all 20 items (11 desktop, 6 mobile, 3 edge cases) confirmed passed; Phase 05 is now unblocked
- [Phase 05-grading-notification]: require() lazy import in Wave 0 test stubs — component does not need to exist when test file loads, enabling stubs as verify targets before implementation
- [Phase 05-grading-notification]: SECURITY DEFINER RPC for student_viewed_at update — prevents students from blanket UPDATE policy exposing score/comment fields
- [Phase 05-grading-notification]: mark_submission_viewed RPC triple-checks user_id=auth.uid(), status=graded, student_viewed_at IS NULL — prevents unauthorized access and double-marking
- [Phase 05-grading-notification]: queryKey ['student', 'unviewed-grades'] namespaced to avoid collision with admin queries
- [Phase 05-grading-notification]: refetchInterval 60_000 for bell badge — free-tier safe polling, avoids Realtime subscription overhead
- [Phase 05-grading-notification]: Dynamic import() replaces require() in vitest ESM test stubs — CJS require() fails in Vitest v3 ESM mode even when module exists
- [Phase 05-grading-notification]: useEffect cancellation flag pattern for async signed URL loading in GradingDialog — prevents state updates after unmount
- [Phase 06-ux-polish]: bg-muted className override on Progress — CLAUDE.md prohibits editing src/components/ui/ components directly
- [Phase 06-ux-polish]: Role-aware 404 redirect: students → /courses, others → / for better nav flow
- [Phase 06-ux-polish]: Radix UI SelectItem requires non-empty value: use 'all' sentinel instead of '' for default Select option
- [Phase 06-ux-polish]: CataloguePage.tsx placeholder created — Vite resolves dynamic imports at transform time; stub needed for Wave 0 test loading
- [Phase 06-ux-polish]: fetchAllCourses() separate from fetchCourses() — different ordering allows future divergence
- [Phase 06-ux-polish]: approved_user_read_all_* replaces enrolled-only RLS — enrollment lock enforced by UI not RLS
- [Phase 06-ux-polish]: Replaced CataloguePage placeholder stub with full dual-query implementation (fetchAllCourses + getUserEnrollments)
- [Phase 06-ux-polish]: Fixed test mock leak: empty state test explicitly resets fetchAllCourses to [] since vi.clearAllMocks() does not reset implementations
- [Phase 06]: enrollmentsLoading in composite isLoading prevents mode flash before enrollment query resolves
- [Phase 13]: Student pages use teal card variant (.bm-clay-card-student) on mint background (#F0FDFA)
- [Phase 13-student-pages]: CoursesPage: bm-clay-card-student CSS class with border-0 shadow-none overrides for card styling
- [Phase 13]: Sheet drawer replaces Tabs for enrolled mobile — cleaner UX, lg: breakpoints, preview card
- [Phase 13-student-pages]: useInfiniteQuery replaces useQuery for paginated course loading in CataloguePage
- [Phase 13-student-pages]: Client-side search+grade filter operates on all loaded pages (no re-fetch on type)

### Pending Todos

None yet.

### Blockers/Concerns

- Node 18.20.8 in use: pin `@supabase/supabase-js` to 2.78.0 or upgrade Node to 20 LTS before Phase 2
- Supabase free-tier pauses after 7 days inactivity — decide on Pro upgrade or heartbeat before inviting real students (address end of Phase 1 or Phase 2)
- Phase 4: research client-side image compression library (`browser-image-compression` vs alternatives) and HEIC handling before implementation
- Phase 5: research email delivery provider for Supabase Edge Function (Resend vs SendGrid vs built-in SMTP) before implementation

## Session Continuity

Last session: 2026-05-04 (resume-work)
Stopped at: Session resumed — v3.0 Phase 15 shipped per ROADMAP; Phase 16 has CONTEXT, plans not written (execute after plan)
Resume file: .planning/phases/16-lesson-tabs-study-materials/16-CONTEXT.md
