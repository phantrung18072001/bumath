# Phase 11: Admin List Pages - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Add client-side pagination, search input, and filter controls to the existing `UsersPage.tsx`
and `CoursesPage.tsx`. Replace Loader2 spinner with Skeleton rows in both pages.

**In scope:**
- UsersPage: search (full_name + phone), role filter (all/student/teacher/admin), pagination 25/page
- CoursesPage: search (title), grade filter (all/grade_7/grade_8/grade_9/advanced), pagination 20/page
- Skeleton loading (5× rows) replacing Loader2 in both pages
- Extended vitest tests for new filter/search/pagination behavior
- All existing mutations, dialogs, AlertDialogs, and row actions preserved verbatim

**Out of scope:**
- URL query params for filter state (Phase 11 uses local useState only)
- New shadcn component installations (all required components already present)
- Server-side pagination (client-side slice only — all data fetched once)
- Any new DB queries or RLS changes

</domain>

<decisions>
## Implementation Decisions

### Search Scope
- **D-01:** UsersPage search covers `full_name` OR `phone` (case-insensitive substring). Email is NOT searchable — it lives in `auth.users` and is not in the `profiles` client-side payload. Placeholder copy: `Tìm theo tên hoặc số điện thoại…`

### Filter State
- **D-02:** Both pages use local `useState` for filter + search + currentPage. State resets when admin navigates away. No URL query params in Phase 11. (Simpler; URL params can be added in a later polish phase if needed.)

### Filter Reset on Change
- **D-03:** Any search or filter change resets `currentPage` to 1. (Matches UI-SPEC contract.)

### Test Coverage
- **D-04:** Extend the existing `UsersPage.test.tsx` and `CoursesPage.test.tsx` files. New cases to add:
  - Search input filters correct rows (matching vs. non-matching)
  - Role filter (Users) / grade filter (Courses) shows only matching rows
  - Filter reset: both filters together AND'd correctly
  - Pagination: only 25/20 rows visible on page 1 when data exceeds page size
  - Empty state renders when filtered results are zero (vs. no-data empty state)

### Skeleton Loading
- **D-05:** Replace `Loader2` spinner block in both pages with 5× `<Skeleton className="h-10 w-full rounded-md" />` rows wrapped in `<div className="space-y-2">`. Use `<div aria-busy="true" aria-label="Đang tải...">` wrapper.

### Admin Design Rules (carried forward)
- **D-06:** Admin pages use clean admin theme only — no Claymorphism borders, float symbols, or `--bm-*` variables. Those patterns are auth-page only (Phase 10).
- **D-07:** Radix Select sentinel value `'all'` (not empty string) for default "show all" options — Phase 6 decision.
- **D-08:** `min-h-[48px]` on all existing row action buttons — preserved verbatim.

### Claude's Discretion
- Exact pagination ellipsis rendering logic (show up to 5 page numbers) — follow shadcn Pagination component conventions and UI-SPEC pattern
- Error state position (below toolbar, `text-sm text-destructive`) — follow UI-SPEC copywriting contract
- Toolbar flex layout details — follow UI-SPEC toolbar layout exactly

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI Design Contract
- `.planning/phases/11-admin-list-pages/11-UI-SPEC.md` — Complete visual/interaction contract: toolbar layout, filter options, pagination, skeleton, empty states, copywriting, accessibility. This is the authoritative spec for all UI implementation.

### Source Pages (existing code to modify)
- `src/pages/admin/UsersPage.tsx` — Current implementation: single profiles query, Loader2 spinner, UsersTable sub-component, UserEnrollmentDialog
- `src/pages/admin/CoursesPage.tsx` — Current implementation: courses query + mutations (delete, publish), CourseFormDialog, AlertDialog, Breadcrumb, GRADE_BADGE

### Existing Test Files (to extend)
- `src/pages/admin/UsersPage.test.tsx` — Existing test coverage; extend with filter/search/pagination cases
- `src/pages/admin/CoursesPage.test.tsx` — Existing test coverage; extend with filter/search/pagination cases

### Supporting Files
- `src/components/ui/pagination.tsx` — shadcn Pagination component (installed)
- `src/components/ui/skeleton.tsx` — shadcn Skeleton component (installed)
- `src/lib/constants/grades.ts` — GRADE_BADGE constant with grade_7/grade_8/grade_9/advanced labels and Tailwind classes
- `src/index.css` — CSS variables; confirm `--primary`, `--muted-foreground`, `--destructive` tokens

### Requirements
- `.planning/REQUIREMENTS.md` §ADMIN-UI-01, ADMIN-UI-02, DS-01, DS-02 — acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/table.tsx` + `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — existing table markup preserved; only add filter toolbar + pagination around it
- `src/components/ui/badge.tsx` — `RoleBadge` (UsersPage) and `GradeBadge` (CoursesPage) sub-components exist; do not change
- `src/components/ui/button.tsx` — existing CTA and row action buttons; preserve all
- `src/components/ui/input.tsx` — use for search field; wrap in relative div for left icon
- `src/components/ui/select.tsx` — use for role/grade filter; sentinel `'all'` for default
- `src/components/ui/skeleton.tsx` — confirmed present; use for loading rows
- `src/components/ui/pagination.tsx` — confirmed present; shadcn Pagination with `PaginationLink isActive`

### Established Patterns
- `useQuery` from TanStack React Query for data fetching — keep queryKeys `['admin', 'profiles']` and `['admin', 'courses']` unchanged
- `useState` for local UI state — consistent with both pages' current patterns
- `overflow-x-auto` on table wrapper — existing, must be preserved
- Lucide icons already used: `Search` (for search input left icon), `ChevronLeft`, `ChevronRight` (for pagination) — all in lucide-react

### Integration Points
- `AdminLayout` provides container `px-6 py-8` for UsersPage wrapper; `container mx-auto px-4 py-8` is CoursesPage's own wrapper — do not change outer containers
- `UserEnrollmentDialog`, `CourseFormDialog`, `AlertDialog` — all preserved verbatim; no interaction with new filter/pagination state

</code_context>

<specifics>
## Specific Ideas

- UsersPage toolbar order: `[Search flex-1] [Role filter w-160px] [Count span]`
- CoursesPage toolbar order: same structure with grade filter
- Count copy: `{n} / {total} người dùng` when filtered, `{n} người dùng` unfiltered (hidden while loading)
- Empty state when filtered-to-zero: heading `Không tìm thấy kết quả` / body `Thử thay đổi từ khóa hoặc bộ lọc.` (no CTA)
- Empty state when no data at all (UsersPage): heading `Chưa có tài khoản nào` / body `Hệ thống chưa có người dùng nào đăng ký.`
- Empty state when no data at all (CoursesPage): heading `Chưa có khóa học nào` / body `Nhấn "Tạo khóa học" để bắt đầu.` + CTA Button

</specifics>

<deferred>
## Deferred Ideas

- URL query params for filter/search state — local state is correct for Phase 11; URL persistence can be added in a UI polish phase later
- Email search on UsersPage — would require joining auth.users; deferred (phone search covers practical use case)

### Reviewed Todos (not folded)
- **"Install all shadcn/radix components"** (area: ui, score: 0.3) — all components needed for Phase 11 are already installed (skeleton, pagination, input, select confirmed). This todo is not actionable for Phase 11; reviewed and deferred.

</deferred>

---

*Phase: 11-admin-list-pages*
*Context gathered: 2026-05-01*
