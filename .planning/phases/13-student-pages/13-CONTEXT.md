# Phase 13: Student Pages - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish three existing student-facing pages with visual upgrades, improved layouts, new search/filter capabilities, and better empty states. All pages are already functional — this phase is a UI refactor and feature addition:

1. **CoursesPage** (`/khoa-hoc`) — card grid with prominent progress bars, polished empty state
2. **CourseDetailPage** (`/khoa-hoc/:courseSlug`) — mobile sidebar as slide-in drawer, video embed as primary content area
3. **CataloguePage** (`/danh-muc`) — add search bar, improve grade filter layout, enrolled/unenrolled badge, scroll or pagination

**Out of scope:**
- Backend changes, new API functions, RLS changes
- Admin pages (Phase 12 complete)
- Landing page (untouched)

</domain>

<decisions>
## Implementation Decisions

### Card Visual Style (All Student Pages)
- **D-01:** Student pages use **Claymorphism** design — thick teal border (3-4px solid `#0D9488`), double shadow (outer `0 8px 0 #0D9488`, inner light), `rounded-3xl`, white card background on `#F0FDFA` page background. Matches auth page tone — student-facing = fun/engaging.
- **D-02:** Page background: `bg-[#F0FDFA]` (light mint) for student content areas, consistent with auth pages.
- **D-03:** Design system reference: `design-system/bumath/MASTER.md` — Teal+Claymorphism+Light theme. Student pages apply this fully.

### Progress Bar — CoursesPage
- **D-04:** Progress bar height: `h-3` or `h-4` (up from `h-2`), filled color `bg-[#0D9488]` (teal primary), not the default muted.
- **D-05:** Progress label: `{progress}% hoàn thành` displayed below the bar, `text-sm text-muted-foreground`.
- **D-06:** Progress bar is a visual focal point of each course card — place it near the bottom of CardContent, after course title and grade badge.

### CataloguePage — Search + Grade Filter Layout
- **D-07:** Search bar goes **above** grade filters on its own full-width row. Layout:
  ```
  Row 1: [Search input — full width, placeholder "Tìm kiếm khóa học..."]
  Row 2: [Grade filter tabs/pills: Tất cả | Lớp 7 | Lớp 8 | Lớp 9 | Ôn chuyên]
  ```
- **D-08:** Grade filters remain as pill/tab buttons (existing URL param pattern `?lop=7` preserved).
- **D-09:** Search is client-side substring match on course title (case-insensitive). Combined with grade filter (AND logic).

### CataloguePage — Scroll Strategy
- **D-10:** **Infinite scroll** — Load more courses as user scrolls. Use TanStack Query `useInfiniteQuery` with page-based loading. No pagination controls visible. "Load more" triggered automatically at scroll threshold.
- **D-11:** Initial page size: 12 courses per page (3 × 4 grid on desktop). Keep all courses client-side filtered after loading (grade filter + search apply to loaded data).

### CourseDetailPage — Mobile Sidebar
- **D-12:** On mobile (below `lg` breakpoint), the lesson list sidebar becomes a **slide-in drawer from the left**. Triggered by a hamburger/menu button in the page header area (above the video).
- **D-13:** The drawer uses shadcn `Sheet` component (left side). Overlay background when open. Close button inside the drawer header.
- **D-14:** Desktop layout unchanged: sidebar sticky on the right (existing `LessonSidebar`). Mobile: sidebar hidden, replaced by Sheet drawer.
- **D-15:** Trigger button copy: "Danh sách bài học" with a `Menu` or `List` Lucide icon, `min-h-[48px]`.

### Empty States (All 3 Pages)
- **D-16:** Style: Large Lucide icon (64px, teal color) + heading + body text + CTA button. No illustrations, no SVG art.
- **D-17:** CoursesPage empty state:
  - Icon: `BookOpen` (teal)
  - Heading: "Bạn chưa có khóa học nào"
  - Body: "Liên hệ giảng viên để được thêm vào khóa học, hoặc khám phá danh mục."
  - CTA: Button "Khám phá khóa học" → `/danh-muc`
- **D-18:** CataloguePage empty state (no results after filter/search):
  - Icon: `Search` (teal)
  - Heading: "Không tìm thấy kết quả"
  - Body: "Thử thay đổi từ khóa hoặc chọn lớp khác."
  - No CTA (user is already on the page)
- **D-19:** CourseDetailPage: no dedicated empty state needed (course always has content when enrolled; unenrolled users see preview mode — existing behavior preserved).

### Design Rules Carried Forward
- **D-20:** Skeleton loading (4 cards / 6 cards) over Loader2 spinners — consistent with Phase 11/12 pattern.
- **D-21:** `min-h-[48px]` on all interactive tap targets (buttons, links styled as buttons).
- **D-22:** Error state: `<p className="text-destructive text-center py-8">Không thể tải dữ liệu. Vui lòng thử lại.</p>` — consistent with Phase 12.1 pattern.
- **D-23:** Vietnamese UI copy throughout. English variable names and code comments.

### Agent's Discretion
- Exact Claymorphism CSS implementation detail (whether to use inline style or Tailwind arbitrary values for the double shadow)
- Infinite scroll implementation detail (Intersection Observer threshold, loading spinner at bottom)
- Exact padding/spacing inside cards
- `Sheet` drawer animation timing (use shadcn default)

</decisions>

<specifics>
## Specific Ideas

- Progress bar teal fill: use `style={{ '--progress-fill': '#0D9488' }}` override OR add a `bg-[#0D9488]` to the Progress indicator element per Phase 6 pattern (`bg-muted` override on Progress)
- CoursesPage card hover: `hover:translate-y-[-2px] transition-transform duration-150` — subtle lift on hover
- Grade filter pills: active state = teal background (`bg-[#0D9488] text-white`), inactive = ghost/outline
- Infinite scroll: use `IntersectionObserver` on a sentinel div at the bottom of the grid

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `design-system/bumath/MASTER.md` — BuMath v2.0 design system. Teal+Claymorphism+Light is the authoritative styling reference for student pages.

### Source Pages (existing code to modify)
- `src/pages/student/CoursesPage.tsx` — Enrolled courses list; card grid + progress; skeleton + empty state already exist but need visual upgrade
- `src/pages/student/CataloguePage.tsx` — Course catalogue; grade filter + URL params exist; add search bar + infinite scroll
- `src/pages/student/CourseDetailPage.tsx` — Lesson view; LessonSidebar + LessonContent; add mobile drawer

### Student Components
- `src/components/student/LessonSidebar.tsx` — Existing sidebar component; needs mobile visibility toggle
- `src/components/student/StudentLayout.tsx` — Student layout wrapper; header bar

### Design Pattern References (from completed phases)
- `src/pages/Login.tsx` — Claymorphism card implementation reference (thick border, double shadow, `rounded-3xl`)
- `src/pages/Register.tsx` — Claymorphism card + floating math symbols reference
- `src/pages/admin/UsersPage.tsx` — Search + filter toolbar pattern (use for CataloguePage toolbar reference)

### UI Components (confirm installed)
- `src/components/ui/sheet.tsx` — shadcn Sheet for mobile sidebar drawer (confirm installed; install with `yarn dlx shadcn@latest add sheet` if missing)
- `src/components/ui/progress.tsx` — Progress bar (already installed)
- `src/components/ui/skeleton.tsx` — Skeleton (already installed)

### Requirements
- `.planning/REQUIREMENTS.md` §STUDENT-UI-01, STUDENT-UI-02, STUDENT-UI-03, STUDENT-UI-04, DS-01, DS-02 — acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Card`, `CardHeader`, `CardContent`, `CardTitle` (shadcn) — already used in student pages; will get Claymorphism wrapper/override classes
- `Progress` (shadcn) — installed; Phase 6 pattern: add `bg-muted` className override; Phase 13 needs teal fill
- `Badge` (shadcn) — used for grade + enrollment status badges; preserve
- `Skeleton` (shadcn) — installed, use for loading states
- `GRADE_BADGE` from `src/lib/constants/grades.ts` — grade label/color constants; reuse
- `useInfiniteQuery` (TanStack React Query) — available; use for CataloguePage infinite scroll

### Established Patterns
- `useQuery` with `enabled: !!profile?.id` guard — pattern from Phase 4; keep
- URL search params (`?lop=7`) for grade filter in CataloguePage — existing; preserve
- `getCourseProgress()` pure function from `src/lib/api/lesson-progress.ts` — pure, keep as-is
- `getUserEnrollments()` + `enrolledCourseIds` Set — existing enrolled badge logic; preserve

### Integration Points
- `StudentLayout` wraps all student pages; no changes to layout wrapper
- `LessonSidebar` currently renders inline in `CourseDetailPage`; needs conditional desktop/mobile rendering
- `Sheet` from shadcn needed for mobile drawer — check if installed, add if not

</code_context>

<deferred>
## Deferred Ideas

- URL query params for search state (CataloguePage search box) — local `useState` is correct for Phase 13; URL persistence is a polish item
- Animated math symbol floats on student page backgrounds — belongs in a future design polish phase
- "Install all shadcn/radix components" todo — components needed are already installed; not actionable for Phase 13

</deferred>

---

*Phase: 13-student-pages*
*Context gathered: 2026-05-02*
