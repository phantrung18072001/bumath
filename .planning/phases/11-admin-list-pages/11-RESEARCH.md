# Phase 11: Admin List Pages — Research

**Researched:** 2026-05-01
**Domain:** React client-side filtering/pagination, shadcn/ui Pagination + Skeleton
**Confidence:** HIGH — all findings verified against codebase directly

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** UsersPage search covers `full_name` OR `phone` (case-insensitive substring). Email is NOT searchable. Placeholder: `Tìm theo tên hoặc số điện thoại…`
- **D-02:** Both pages use local `useState` for filter + search + currentPage. No URL query params in Phase 11.
- **D-03:** Any search or filter change resets `currentPage` to 1.
- **D-04:** Extend existing `UsersPage.test.tsx`; CREATE new `CoursesPage.test.tsx`. New test cases: search, filter, combined AND, pagination slicing, empty-state (filtered vs. no-data).
- **D-05:** Skeleton = `<div aria-busy="true" aria-label="Đang tải..."><div className="space-y-2">{5× <Skeleton className="h-10 w-full rounded-md" />}</div></div>`. Replaces Loader2 block.
- **D-06:** Admin pages use clean admin theme only — no Claymorphism, no `--bm-*` variables.
- **D-07:** Radix Select sentinel value `'all'` (not empty string) for default "show all" options.
- **D-08:** `min-h-[48px]` on all existing row action buttons — preserved verbatim.

### the agent's Discretion

- Exact pagination ellipsis rendering logic (show up to 5 page numbers) — follow shadcn Pagination component conventions and UI-SPEC pattern.
- Error state position (below toolbar, `text-sm text-destructive`) — follow UI-SPEC copywriting contract.
- Toolbar flex layout details — follow UI-SPEC toolbar layout exactly.

### Deferred Ideas (OUT OF SCOPE)

- URL query params for filter/search state — deferred to a later polish phase.
- Email search on UsersPage — would require joining `auth.users`; deferred.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-UI-01 | Users page with pagination (25/page), role filter, search by name/phone | Verified: `Profile` type has `full_name` + `phone` fields; client-side slice pattern confirmed |
| ADMIN-UI-02 | Courses page with pagination (20/page), grade filter, search by title | Verified: `Course` type has `title` + `target_grade`; `GRADE_BADGE` constant covers all 4 grades |
| DS-01 | Consistent color/spacing/typography — clean admin theme only | Verified: UI-SPEC defines exact CSS variable tokens; no new tokens needed |
| DS-02 | Skeleton loading replaces spinner on all data-fetch pages | Verified: `src/components/ui/skeleton.tsx` installed; `Skeleton` already includes `animate-pulse` |
</phase_requirements>

---

## Summary

Phase 11 is a focused enhancement to two existing admin pages. Both pages (`UsersPage.tsx`, `CoursesPage.tsx`) already render a full data table fetched with TanStack Query. The work is exclusively client-side: add a filter toolbar (search input + role/grade select), replace the Loader2 spinner with skeleton rows, slice the filtered array for pagination, and render the shadcn Pagination component.

All shadcn components required (Pagination, Skeleton, Input, Select) are already installed and confirmed present. The `PaginationLink` component renders as an `<a>` tag (not a button), so prev/next disabled state requires CSS approach (`pointer-events-none opacity-50` or `aria-disabled`). The `Skeleton` component includes `animate-pulse` built in — no extra Tailwind class needed.

**Critical gap:** `CoursesPage.test.tsx` does NOT exist. It must be created in Wave 0 before implementing CoursesPage changes.

**Primary recommendation:** Implement as two independent waves (UsersPage → CoursesPage) following the exact UI-SPEC contract. Create CoursesPage.test.tsx in Wave 0.

---

## Standard Stack

### Core (already installed — no new installs)

| Library | Version | Purpose | Confirmed |
|---------|---------|---------|-----------|
| `@/components/ui/skeleton.tsx` | shadcn default | Skeleton loading rows | ✅ exists |
| `@/components/ui/pagination.tsx` | shadcn default | Pagination nav | ✅ exists |
| `@/components/ui/input.tsx` | shadcn default | Search text input | ✅ exists |
| `@/components/ui/select.tsx` | shadcn default | Role/grade filter | ✅ exists |
| `@tanstack/react-query` | installed | Data fetching (queryKey unchanged) | ✅ existing |
| `lucide-react` | installed | `Search` icon for search field | ✅ existing |

### No New Installations Required

> Confirmed from CONTEXT.md D-07 and from `src/components/ui/` directory scan. All 7 components are present. Do not run `yarn dlx shadcn@latest add` for this phase.

---

## Architecture Patterns

### Pattern 1: Filter + Pagination State

All state is local to each page component:

```tsx
// Source: CONTEXT.md D-02, D-03
const [searchQuery, setSearchQuery] = useState('')
const [roleFilter, setRoleFilter] = useState<'all' | Profile['role']>('all')
const [currentPage, setCurrentPage] = useState(1)

// Reset page on any filter change (D-03)
function handleSearch(value: string) {
  setSearchQuery(value)
  setCurrentPage(1)
}
function handleRoleFilter(value: string) {
  setRoleFilter(value as 'all' | Profile['role'])
  setCurrentPage(1)
}
```

### Pattern 2: Client-Side Filter → Slice Pipeline

```tsx
// Source: UI-SPEC Filter/Search Contract
const filtered = users.filter((u) => {
  const matchesRole = roleFilter === 'all' || u.role === roleFilter
  const q = searchQuery.toLowerCase()
  const matchesSearch =
    q === '' ||
    u.full_name.toLowerCase().includes(q) ||
    u.phone.toLowerCase().includes(q)
  return matchesRole && matchesSearch
})

const PAGE_SIZE = 25
const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
const paginated = filtered.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE,
)
```

### Pattern 3: Toolbar Layout

```tsx
// Source: UI-SPEC Toolbar Layout + Accessibility Contract
<div className="flex flex-col sm:flex-row gap-2 mb-6">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
    <Input
      className="pl-9"
      placeholder="Tìm theo tên hoặc số điện thoại…"
      aria-label="Tìm kiếm người dùng"
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
    />
  </div>
  <Select value={roleFilter} onValueChange={handleRoleFilter}>
    <SelectTrigger className="w-full sm:w-[160px]" aria-label="Lọc theo vai trò">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tất cả vai trò</SelectItem>
      <SelectItem value="student">Học sinh</SelectItem>
      <SelectItem value="teacher">Giảng viên</SelectItem>
      <SelectItem value="admin">Admin</SelectItem>
    </SelectContent>
  </Select>
  {!isLoading && (
    <span className="text-sm text-muted-foreground self-center whitespace-nowrap">
      {roleFilter !== 'all' || searchQuery
        ? `${filtered.length} / ${users.length} người dùng`
        : `${users.length} người dùng`}
    </span>
  )}
</div>
```

### Pattern 4: Skeleton Loading Block

```tsx
// Source: CONTEXT.md D-05 + UI-SPEC Skeleton Loading Contract
// NOTE: Skeleton already includes animate-pulse — do NOT add it as extra className
{isLoading ? (
  <div aria-busy="true" aria-label="Đang tải...">
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  </div>
) : /* table or empty state */ }
```

### Pattern 5: Pagination Rendering (Ellipsis Logic)

The shadcn `PaginationLink` renders an `<a>` tag. Disabled state for prev/next must use `aria-disabled` + `pointer-events-none`.

```tsx
// Source: UI-SPEC Pagination Contract — "show up to 5 page numbers"
function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 'ellipsis', total]
  if (current >= total - 2) return [1, 'ellipsis', total - 3, total - 2, total - 1, total]
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
}

// Render only when totalPages > 1 (UI-SPEC)
{totalPages > 1 && (
  <div className="mt-6 flex justify-center">
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        {buildPageNumbers(currentPage, totalPages).map((page, idx) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
```

### Pattern 6: Empty State

```tsx
// Source: UI-SPEC Empty State Contract
// Two conditions: (a) no data at all, (b) filter returned zero
{filtered.length === 0 && (
  <div className="text-center py-16">
    {users.length === 0 ? (
      // No data at all
      <>
        <p className="text-base font-semibold text-foreground mb-1">Chưa có tài khoản nào</p>
        <p className="text-sm text-muted-foreground">Hệ thống chưa có người dùng nào đăng ký.</p>
      </>
    ) : (
      // Filter returned zero
      <>
        <p className="text-base font-semibold text-foreground mb-1">Không tìm thấy kết quả</p>
        <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc.</p>
      </>
    )}
  </div>
)}
```

> CoursesPage adds a CTA Button to the "no data at all" empty state (see UI-SPEC).

### Pattern 7: Error State

```tsx
// Source: UI-SPEC Copywriting Contract — below toolbar, text-sm text-destructive
{isError && (
  <p className="text-sm text-destructive mt-2">
    Không thể tải danh sách người dùng. Vui lòng thử lại.
  </p>
)}
```

### Pattern 8: Test Helper for CoursesPage.test.tsx

The existing `UsersPage.test.tsx` mock pattern (vi.mock + `__order` export) must be adapted for CoursesPage which uses `fetchCourses()` from `@/lib/api/courses` instead of direct supabase calls:

```tsx
// Source: UsersPage.test.tsx mock pattern + CoursesPage.tsx import analysis
vi.mock('@/lib/api/courses', () => ({
  fetchCourses: vi.fn(),
  deleteCourse: vi.fn(),
  publishCourse: vi.fn(),
}))

// Per-test setup:
import { fetchCourses } from '@/lib/api/courses'
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetchCourses).mockResolvedValue(defaultCourses)
})
```

### Anti-Patterns to Avoid

- **Debounced search:** UI-SPEC specifies real-time `onChange` filtering. No debounce needed for client-side filter.
- **Server-side pagination:** CONTEXT.md explicitly rules out — all data fetched once, sliced for display.
- **`animate-pulse` on Skeleton:** The `Skeleton` component already includes `animate-pulse` in its base classes. Adding it as a `className` prop is redundant but harmless — just don't double-apply it intentionally.
- **Empty string Select value:** Use sentinel `'all'` not `''` — Radix UI `SelectItem` requires non-empty value (Phase 6 decision, STATE.md).
- **Changing queryKeys:** Keep `['admin', 'profiles']` and `['admin', 'courses']` exactly — other components may depend on these.
- **Claymorphism on admin pages:** No `--bm-*` CSS variables, no clay borders. Admin theme only.
- **Modifying `src/components/ui/` files:** Per CLAUDE.md, never manually modify shadcn components.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination UI | Custom button row | shadcn `Pagination` + `PaginationLink isActive` | Already installed, handles accessibility, keyboard nav, aria-current |
| Loading skeleton | CSS spinner or custom shimmer | `<Skeleton className="h-10 w-full rounded-md" />` | Already installed, animate-pulse built in |
| Filter dropdown | Custom `<select>` or dropdown | shadcn `Select` with sentinel `'all'` | Already installed, Radix keyboard nav, consistent style |
| Search input | Raw `<input>` | shadcn `Input` with Search icon positioned absolutely | Already installed, consistent focus ring behavior |

---

## Common Pitfalls

### Pitfall 1: `PaginationLink` is `<a>` not `<button>`
**What goes wrong:** Adding `disabled` attribute has no effect on `<a>` tags.
**Why it happens:** shadcn `PaginationPrevious`/`PaginationNext` render `<a>` elements, not `<button>`.
**How to avoid:** Use `aria-disabled` + `pointer-events-none opacity-50` className when `currentPage === 1` or `currentPage === totalPages`.
**Warning signs:** Clicking prev/next on boundary pages causes `currentPage` to go to 0 or exceed totalPages.

### Pitfall 2: `currentPage` not reset on filter change
**What goes wrong:** User is on page 3, applies a role filter that returns 10 results (< 1 page), sees empty table on page 3.
**Why it happens:** Filter changes filtered array but doesn't reset `currentPage`.
**How to avoid:** D-03 is locked — always call `setCurrentPage(1)` in BOTH `handleSearch` and `handleFilter`.
**Warning signs:** Empty table when filtered results exist on page 1.

### Pitfall 3: Total count shows wrong value when filters active
**What goes wrong:** Count shows `X người dùng` instead of `X / Y người dùng` when a filter is active.
**Why it happens:** Using `filtered.length` for both the count and total without tracking whether any filter is active.
**How to avoid:** Check `roleFilter !== 'all' || searchQuery !== ''` to decide between `"{n} / {total}"` format and simple `"{n}"` format.

### Pitfall 4: Skeleton `animate-pulse` doubled
**What goes wrong:** `Skeleton` component base classes already include `animate-pulse`. Adding it as className prop is harmless but indicates misunderstanding.
**Why it happens:** Developer adds `animate-pulse` manually expecting it's not built in.
**Verified from:** `src/components/ui/skeleton.tsx`: `"animate-pulse rounded-md bg-muted"` in base.

### Pitfall 5: CoursesPage.test.tsx mock pattern differs from UsersPage
**What goes wrong:** Trying to mock `supabase.from()` for CoursesPage when it uses `fetchCourses()` from `@/lib/api/courses`.
**Why it happens:** UsersPage calls supabase directly; CoursesPage calls `fetchCourses()` abstraction.
**How to avoid:** Mock `@/lib/api/courses` module, not `@/lib/supabase`, for CoursesPage tests.

### Pitfall 6: Empty state text mismatch
**What goes wrong:** Tests check for "Chưa có tài khoản nào được tạo." but Phase 11 changes this to "Chưa có tài khoản nào".
**Why it happens:** Existing test (line 125 of UsersPage.test.tsx) checks old empty state message; Phase 11 replaces `UsersTable.emptyMessage` prop with structured empty state block.
**How to avoid:** Update the existing `shows empty state message when no users exist` test to match new heading/body copy from UI-SPEC.

---

## Runtime State Inventory

> Not applicable — Phase 11 is a client-side code modification phase with no rename, no migration, and no runtime state changes.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest v3.2.4 + React Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test src/pages/admin/UsersPage.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-UI-01 | Search `full_name` filters correct rows | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ (extend) |
| ADMIN-UI-01 | Search `phone` filters correct rows | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ (extend) |
| ADMIN-UI-01 | Role filter shows only matching rows | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ (extend) |
| ADMIN-UI-01 | Combined role + search ANDed | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ (extend) |
| ADMIN-UI-01 | Pagination: only 25 rows on page 1 when >25 | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ (extend) |
| ADMIN-UI-01 | Empty state (filtered zero) renders | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ (extend) |
| DS-02 | Skeleton renders during isLoading | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ (extend) |
| ADMIN-UI-02 | Search `title` filters correct courses | unit | `yarn test src/pages/admin/CoursesPage.test.tsx` | ❌ Wave 0 |
| ADMIN-UI-02 | Grade filter shows only matching courses | unit | `yarn test src/pages/admin/CoursesPage.test.tsx` | ❌ Wave 0 |
| ADMIN-UI-02 | Pagination: only 20 rows on page 1 when >20 | unit | `yarn test src/pages/admin/CoursesPage.test.tsx` | ❌ Wave 0 |
| ADMIN-UI-02 | Empty state (no data) with CTA button | unit | `yarn test src/pages/admin/CoursesPage.test.tsx` | ❌ Wave 0 |
| DS-02 | Skeleton renders during isLoading (courses) | unit | `yarn test src/pages/admin/CoursesPage.test.tsx` | ❌ Wave 0 |

### Wave 0 Gaps

- [ ] `src/pages/admin/CoursesPage.test.tsx` — must be created before implementing CoursesPage (covers ADMIN-UI-02 + DS-02). Uses `vi.mock('@/lib/api/courses', ...)` pattern (NOT supabase mock).
- [ ] Existing `UsersPage.test.tsx` empty-state test (line 125) checks old message `"Chưa có tài khoản nào được tạo."` — must be updated to match new UI-SPEC copy: heading `"Chưa có tài khoản nào"`.

---

## Code Examples

### Complete State Initialization (UsersPage)

```tsx
// Source: CONTEXT.md D-02
const [searchQuery, setSearchQuery] = useState('')
const [roleFilter, setRoleFilter] = useState<'all' | Profile['role']>('all')
const [currentPage, setCurrentPage] = useState(1)
```

### Complete State Initialization (CoursesPage)

```tsx
// Source: CONTEXT.md D-02
const [searchQuery, setSearchQuery] = useState('')
const [gradeFilter, setGradeFilter] = useState<'all' | Course['target_grade']>('all')
const [currentPage, setCurrentPage] = useState(1)
```

### Filter Pipeline (CoursesPage)

```tsx
// Source: UI-SPEC Filter/Search Contract
const filtered = courses.filter((c) => {
  const matchesGrade = gradeFilter === 'all' || c.target_grade === gradeFilter
  const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
  return matchesGrade && matchesSearch
})
const PAGE_SIZE = 20
const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
const paginated = filtered.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE,
)
```

### CoursesPage Grade Filter Select

```tsx
// Source: UI-SPEC Filter/Search Contract (CoursesPage Filters section)
<Select value={gradeFilter} onValueChange={(v) => { setGradeFilter(v as any); setCurrentPage(1) }}>
  <SelectTrigger className="w-full sm:w-[160px]" aria-label="Lọc theo lớp">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Tất cả lớp</SelectItem>
    <SelectItem value="grade_7">Lớp 7</SelectItem>
    <SelectItem value="grade_8">Lớp 8</SelectItem>
    <SelectItem value="grade_9">Lớp 9</SelectItem>
    <SelectItem value="advanced">Ôn chuyên</SelectItem>
  </SelectContent>
</Select>
```

---

## Environment Availability

> Step 2.6: SKIPPED — Phase 11 is purely client-side code changes. No external services, CLIs, or databases are added or modified. Supabase queries are unchanged.

---

## Project Constraints (from copilot-instructions.md / CLAUDE.md)

| Directive | Requirement |
|-----------|-------------|
| Package manager | `yarn` only — never `npm` |
| shadcn components | Never modify `src/components/ui/` manually; use CLI to add/update |
| Always use shadcn/Radix | Check `src/components/ui/` before implementing custom components |
| Vitest globals | No need to import `describe`, `it`, `expect` — globals enabled |
| TypeScript | Strict mode OFF; `noImplicitAny` OFF |
| Testing setup | `src/test/setup.ts` includes `matchMedia` polyfill — required for component tests |
| Toolbar touch targets | `min-h-[48px]` on all row action buttons (existing pattern) |
| Admin theme | No Claymorphism, no `--bm-*` variables on admin pages |
| Sentinel value | Radix Select uses `'all'` not `''` for default "show all" (Phase 6 decision) |

---

## Sources

### Primary (HIGH confidence — verified from codebase)

- `src/pages/admin/UsersPage.tsx` — current implementation, existing state + query patterns
- `src/pages/admin/CoursesPage.tsx` — current implementation, mutations, dialogs preserved verbatim
- `src/pages/admin/UsersPage.test.tsx` — existing 6 tests passing; mock pattern for supabase
- `src/components/ui/pagination.tsx` — PaginationLink is `<a>` not `<button>`; isActive prop; exports verified
- `src/components/ui/skeleton.tsx` — already includes `animate-pulse` in base className
- `src/lib/constants/grades.ts` — GRADE_BADGE with grade_7/grade_8/grade_9/advanced keys
- `src/types/auth.ts` — Profile: full_name, phone, role fields confirmed
- `src/lib/api/courses.ts` — Course: title, target_grade fields; fetchCourses() is the mock target
- `.planning/phases/11-admin-list-pages/11-UI-SPEC.md` — canonical design contract for all UI patterns
- `.planning/phases/11-admin-list-pages/11-CONTEXT.md` — all locked decisions D-01 through D-08
- `vitest.config.ts` — Vitest v3, jsdom, globals: true, setupFiles confirmed

### Secondary (MEDIUM confidence)

- `STATE.md` — Radix Select `'all'` sentinel decision traced back to Phase 6 (`CataloguePage` pattern)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all components verified present in filesystem
- Architecture: HIGH — patterns derived directly from existing code + UI-SPEC
- Pitfalls: HIGH — each pitfall verified against actual source files
- Test infrastructure: HIGH — test runner confirmed working (6 tests pass)

**Research date:** 2026-05-01
**Valid until:** Stable phase; valid until code changes (no time pressure)
