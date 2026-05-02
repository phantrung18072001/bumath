# Phase 12: Admin Detail Pages - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor and polish 5 existing admin pages:

1. **SubmissionsPage** (`/quan-tri/bai-nop`) — pagination (20/page), add status filter (graded/ungraded), migrate to server-side filter + pagination
2. **GradingPage** (`/quan-tri/bai-nop/:id`) — mobile UX improvement (sticky bottom save bar)
3. **ChaptersPage** (`/quan-tri/khoa-hoc/:slug`) — replace up/down arrows with drag-and-drop reordering (dnd-kit)
4. **LessonsPage** (`/quan-tri/khoa-hoc/:slug/chuong/:slug`) — same drag-and-drop reordering
5. **UsersPage** + **CoursesPage** (Phase 11 pages) — migrate from client-side filter/pagination to fully server-side (Supabase .range(), .ilike(), .eq())

**In scope:**
- All 3 admin list pages adopt server-side filtering + server-side pagination
- SubmissionsPage gains status filter (graded/ungraded) in addition to existing cascading filters
- GradingPage: sticky bottom bar (score + save button) on mobile screens
- ChaptersPage + LessonsPage: dnd-kit drag-and-drop replacing up/down arrow buttons
- Skeleton loading rows replace Loader2 spinner on all modified pages (consistent with Phase 11 pattern)
- Tests updated to cover server-side filter + pagination behavior

**Out of scope:**
- URL query params for filter state (not in Phase 12)
- Any student-facing pages (Phase 13)
- New DB schema or RLS changes

</domain>

<decisions>
## Implementation Decisions

### Server-Side Filter + Pagination (All 3 List Pages)
- **D-01:** UsersPage, CoursesPage, and SubmissionsPage all migrate to fully server-side: filter AND pagination use Supabase query params (`.range()` for pagination, `.ilike()` for search, `.eq()` for role/grade/status). Only fetch current page's rows — no loading all data into memory.
- **D-02:** Page size: UsersPage = 25/page (preserves Phase 11 size), CoursesPage = 20/page (preserves Phase 11 size), SubmissionsPage = 20/page (per roadmap success criteria).
- **D-03:** Filter state remains in local `useState` (no URL query params in Phase 12). Filter change resets `currentPage` to 1.

### Status Filter — SubmissionsPage
- **D-04:** Add status filter (graded/ungraded/all) as a server-side Supabase query param. The existing `getUngraded` function is replaced or overloaded by a new `getAllSubmissions(filters)` function that accepts `{ status?: 'graded' | 'ungraded', grade?, course?, lesson?, studentName?, page, pageSize }`.
- **D-05:** When viewing graded submissions, show same table columns (student, course, lesson, date submitted) plus a score badge column. No `graded_at` date column needed.

### Drag-and-Drop Reordering
- **D-06:** Install `@dnd-kit/core` + `@dnd-kit/sortable` to replace up/down arrow buttons in ChaptersPage and LessonsPage. Rows become draggable via a drag handle icon. On drop, call the existing `reorderChapters`/`reorderLessons` mutation.
- **D-07:** Drag handle uses a `GripVertical` icon (Lucide) as the visual affordance. Existing edit/delete buttons remain unchanged.

### GradingPage Mobile
- **D-08:** On mobile (below `lg` breakpoint), add a sticky bottom bar that pins the score input + "Lưu điểm" button to the bottom of the viewport. Scrollable image area above. Desktop layout (side-by-side sticky sidebar) unchanged.
- **D-09:** The double-confirm ("Bạn chắc chắn...") UI remains — it appears inside the sticky bar on mobile, or in the sidebar on desktop.

### Skeleton Loading
- **D-10:** Replace Loader2 spinner with 5× `<Skeleton className="h-10 w-full rounded-md" />` rows wrapped in `<div className="space-y-2">` with `<div aria-busy="true" aria-label="Đang tải...">` wrapper — consistent with Phase 11 pattern — in SubmissionsPage, ChaptersPage, and LessonsPage.

### Admin Design Rules (carried forward)
- **D-11:** Admin pages use clean admin theme only — no Claymorphism borders, no float symbols, no `--bm-*` variables (Phase 11 D-06).
- **D-12:** Radix Select sentinel value `'all'` (not empty string) for default "show all" options (Phase 6/11 D-07).
- **D-13:** `min-h-[48px]` on all row action buttons (Phase 11 D-08).

### Claude's Discretion
- Exact dnd-kit configuration (SortableContext strategy, collision detection algorithm) — use array strategy with closestCenter
- Optimistic vs pessimistic reorder updates — can optimistically update UI before Supabase confirms
- Supabase count query approach for total pages — use `{ count: 'exact', head: false }` option alongside data fetch

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source Pages (existing code to modify)
- `src/pages/admin/SubmissionsPage.tsx` — Current grading queue: client-side filter, no pagination, getUngraded only
- `src/pages/admin/GradingPage.tsx` — Grading detail: flex-col lg:flex-row layout, sticky sidebar on desktop
- `src/pages/admin/ChaptersPage.tsx` — Chapter list: up/down arrow reorder, useMutation reorderChapters
- `src/pages/admin/LessonsPage.tsx` — Lesson list: up/down arrow reorder, useMutation reorderLessons
- `src/pages/admin/UsersPage.tsx` — User management: client-side filter/pagination from Phase 11
- `src/pages/admin/CoursesPage.tsx` — Course management: client-side filter/pagination from Phase 11

### API Functions (to extend/replace)
- `src/lib/api/submissions.ts` — getUngraded, getSubmissionById, gradeSubmission — add getAllSubmissions with filter params
- `src/lib/api/courses.ts` — fetchCourses — add server-side filter + pagination variant
- `src/lib/api/chapters.ts` — fetchChapters, reorderChapters — reorderChapters already works; add any needed pagination
- `src/lib/api/lessons.ts` — fetchLessons, reorderLessons — same as above

### Design System
- `design-system/bumath/MASTER.md` — BuMath v2.0 design system; admin pages use clean admin theme (not Claymorphism)

### Requirements
- `.planning/REQUIREMENTS.md` §ADMIN-UI-03, ADMIN-UI-04, ADMIN-UI-05, DS-01, DS-02 — acceptance criteria

### Supporting Components
- `src/components/ui/skeleton.tsx` — confirmed present (Phase 11)
- `src/components/ui/pagination.tsx` — confirmed present (Phase 11)
- `src/lib/constants/grades.ts` — GRADE_BADGE constant

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` — used in all 4 list pages; preserve markup
- `Skeleton` (shadcn) — already installed, use for loading states
- `Pagination` (shadcn) — already installed from Phase 11
- `SearchableSelect` (inline component in SubmissionsPage) — reusable Popover+Command combobox for cascading filters
- `reorderChapters`, `reorderLessons` — existing Supabase mutations; dnd-kit calls these on drop
- `GRADE_BADGE` — grade label/color constants already used in CoursesPage and SubmissionsPage

### Established Patterns
- `useQuery` + TanStack React Query for data fetching — keep queryKeys consistent
- `useMutation` for mutations (reorder, delete, grade) — preserve all
- `useState` for local UI state (filter, page, sort)
- `overflow-x-auto` on table wrapper — existing, must be preserved
- `min-h-[48px]` on action buttons — Phase 11 requirement

### Integration Points
- `AdminLayout` — wraps all admin pages; no changes needed
- `GradingPage` double-confirm flow — preserve existing `pendingConfirm` state pattern; mobile bar adapts it
- dnd-kit needs wrapping `DndContext` + `SortableContext` around the table body rows

</code_context>

<specifics>
## Specific Ideas

- SubmissionsPage status filter position: add as first filter in the filter bar (before grade/course/lesson cascade)
- Drag handle column: add as first column in ChaptersPage and LessonsPage tables; `GripVertical` icon, cursor-grab
- Mobile sticky bar for GradingPage: `fixed bottom-0 left-0 right-0` with `bg-background border-t p-4`; hidden on `lg:hidden`
- Graded score badge in SubmissionsPage: use existing `Badge` component with teal/green color variant

</specifics>

<deferred>
## Deferred Ideas

- URL query params for filter/search state — local state is sufficient; URL persistence can be added in a later polish phase
- Bulk grading actions — too large for Phase 12 scope
- Advanced sorting (by date, score) on grading queue — not requested

</deferred>

---

*Phase: 12-admin-detail-pages*
*Context gathered: 2026-05-02*
