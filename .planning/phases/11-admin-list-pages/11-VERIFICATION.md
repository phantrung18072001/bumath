---
phase: 11-admin-list-pages
verified: 2026-05-02T00:09:00Z
status: human_needed
score: 18/18 must-haves verified
re_verification:
  previous_status: human_needed
  previous_score: 10/10
  gaps_closed:
    - "Phone normalization (+84/84 → 0) applied to both stored phone and search query"
    - "UsersPage uses dynamic pageSize useState(10) with Select 10/20/50"
    - "UsersPage STT column with formula (currentPage-1)*pageSize+index+1"
    - "handlePageSizeChange resets currentPage to 1 (UsersPage)"
    - "CoursesPage uses dynamic pageSize useState(10) with Select 10/20/50"
    - "CoursesPage STT column with formula (currentPage-1)*pageSize+index+1"
    - "handlePageSizeChange resets currentPage to 1 (CoursesPage)"
    - "Old PAGE_SIZE=25 (Users) and PAGE_SIZE=20 (Courses) consts removed"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Check visual design consistency of toolbar/pagination/STT UI"
    expected: "Toolbar, filter, STT column, page-size selector, and pagination render consistently with the rest of the admin UI (colors, spacing, typography match DS-01)"
    why_human: "DS-01 is a cross-cutting design system requirement — code inspection confirms correct component imports and Tailwind class usage, but visual fidelity requires rendering in a browser"
---

# Phase 11: Admin List Pages — Verification Report (Re-verification)

**Phase Goal:** Admin list pages (UsersPage and CoursesPage) with search, filter, pagination, and skeleton loading — plus phone normalization, STT column, and dynamic page size (plans 11-03 and 11-04).
**Verified:** 2026-05-02T00:09:00Z
**Status:** human_needed (all 18 automated must-haves verified; DS-01 visual design needs human)
**Re-verification:** Yes — after gap closure from plans 11-03 and 11-04

---

## Goal Achievement

### Observable Truths

#### Original truths (plans 11-01 / 11-02) — regression check

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin can search users by `full_name` or `phone` (case-insensitive) | ✓ VERIFIED | `UsersPage.tsx:150–153` — full_name + normalizePhone check; tests "filters users by full_name search" and "filters users by phone search" pass |
| 2 | Admin can filter users by role (`all`/`student`/`teacher`/`admin`) | ✓ VERIFIED | `UsersPage.tsx:147` — role filter; `handleRoleFilter` resets page; test "filters users by student role" passes |
| 3 | Users list paginates with controls; page resets on filter/search | ✓ VERIFIED | `pageSize=useState(10)`; pagination controls rendered; `handleSearch`/`handleRoleFilter` both call `setCurrentPage(1)` |
| 4 | Skeleton loading replaces Loader2 spinner in UsersPage data fetch | ✓ VERIFIED | `UsersPage.tsx:203–210` — `isLoading` → `<Skeleton>` rows; no Loader2 in UsersPage; test "shows skeleton with aria-label" passes |
| 5 | CoursesPage can search courses by `title` (case-insensitive) | ✓ VERIFIED | `CoursesPage.tsx:146` — `c.title.toLowerCase().includes(q)`; test "filters courses by title search" passes |
| 6 | Admin can filter courses by `target_grade` | ✓ VERIFIED | `CoursesPage.tsx:144` — grade filter; Select has all 5 options; test "filters courses by grade_7" passes |
| 7 | Courses list paginates with controls; page resets on filter/search | ✓ VERIFIED | `pageSize=useState(10)`; both handlers call `setCurrentPage(1)` |
| 8 | Skeleton loading in CoursesPage page-level loading | ✓ VERIFIED | `CoursesPage.tsx:222–229` — `isLoading` → `<Skeleton>`; Loader2 only in action-button pending states; test passes |

#### New must-haves (plans 11-03 / 11-04)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 9 | Searching `0912345678` and `+84912345678` both match the same user | ✓ VERIFIED | `UsersPage.tsx:36–38`: `normalizePhone` strips `+84`/`84` → `0`; `line 152`: applied to both `u.phone` and `q` before `includes()` — both inputs normalize to `0912345678` |
| 10 | Searching `84912345678` also matches (bare 84 prefix → 0) | ✓ VERIFIED | Regex `/^\+84\|^84/` handles bare `84` prefix; `normalizePhone('84912345678')` → `'0912345678'` ✓ |
| 11 | UsersPage pagination uses dynamic page size (default 10, options 10/20/50) | ✓ VERIFIED | `UsersPage.tsx:117`: `useState(10)`; Select at lines 236–245 with values 10/20/50; test "shows pagination when more than 10 users" — 15-user dataset shows User 1–10, not User 11 |
| 12 | UsersPage STT column — sequential numbers relative to current page | ✓ VERIFIED | `UsersPage.tsx:73`: `<TableHead>STT</TableHead>`; `line 85`: `{(currentPage-1)*pageSize+index+1}` — page 2 index 0 → 11 ✓ |
| 13 | Changing page size resets UsersPage to page 1 | ✓ VERIFIED | `UsersPage.tsx:141–144`: `handlePageSizeChange` calls `setPageSize(Number(value))` AND `setCurrentPage(1)` |
| 14 | CoursesPage pagination uses dynamic page size (default 10, options 10/20/50) | ✓ VERIFIED | `CoursesPage.tsx:80`: `useState(10)`; Select at lines 343–353 with values 10/20/50; test "shows pagination when more than 10 courses" — 15-course dataset shows Khóa học 1–10, not 11 |
| 15 | CoursesPage STT column — sequential numbers relative to current page | ✓ VERIFIED | `CoursesPage.tsx:254`: `<TableHead>STT</TableHead>`; `line 265`: `{(currentPage-1)*pageSize+index+1}` ✓ |
| 16 | Changing page size resets CoursesPage to page 1 | ✓ VERIFIED | `CoursesPage.tsx:137–140`: `handlePageSizeChange` calls `setPageSize(Number(value))` AND `setCurrentPage(1)` |
| 17 | No stale `PAGE_SIZE` const remains in either file | ✓ VERIFIED | `grep PAGE_SIZE UsersPage.tsx CoursesPage.tsx` returns nothing — both consts fully replaced by `useState(10)` |
| 18 | All 29 tests pass | ✓ VERIFIED | `vitest run` → 15 UsersPage + 14 CoursesPage = **29/29 passed** (exit code 0) |

**Score:** 18/18 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/pages/admin/UsersPage.tsx` | Phone normalization + STT column + dynamic page size | ✓ VERIFIED | 297 lines; `normalizePhone` at line 36; `useState(10)` at 117; STT head/cell at lines 73/85; `handlePageSizeChange` at 141; page-size Select 10/20/50 at 236–245 |
| `src/pages/admin/UsersPage.test.tsx` | Updated tests for pageSize=10 | ✓ VERIFIED | 15 tests, all passing; pagination test uses 15 users, asserts User 10 visible / User 11 not visible on page 1 |
| `src/pages/admin/CoursesPage.tsx` | STT column + dynamic page size | ✓ VERIFIED | 430 lines; `useState(10)` at 80; STT head/cell at lines 254/265; `handlePageSizeChange` at 137; page-size Select at 343–353 |
| `src/pages/admin/CoursesPage.test.tsx` | Updated tests for pageSize=10 | ✓ VERIFIED | 14 tests, all passing; pagination test uses 15 courses, asserts Khóa học 10 visible / Khóa học 11 not visible on page 1 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `normalizePhone()` | filter predicate | applied to both `u.phone` and `q` before `includes()` | ✓ WIRED | `UsersPage.tsx:152`: `normalizePhone(u.phone.toLowerCase()).includes(normalizePhone(q))` |
| `pageSize` state | `UsersTable` sub-component | passed as `currentPage` + `pageSize` props | ✓ WIRED | `UsersPage.tsx:227–232`: `<UsersTable users={paginated} currentPage={currentPage} pageSize={pageSize} …>` |
| `pageSize` state | paginated slice | replaces `PAGE_SIZE` in `totalPages` + `slice()` | ✓ WIRED | `UsersPage.tsx:156–160`; `CoursesPage.tsx:151–155` |
| `handlePageSizeChange` | `setCurrentPage(1)` | called inside handler | ✓ WIRED | Both files: page reset is the second statement in `handlePageSizeChange` |
| `UsersPage.tsx` | `@/components/ui/skeleton` | `import { Skeleton }` | ✓ WIRED | Line 24; used at line 207 |
| `CoursesPage.tsx` | `@/components/ui/skeleton` | `import { Skeleton }` | ✓ WIRED | Line 24; used at line 226 |
| `UsersPage.tsx` | `@/components/ui/pagination` | named imports | ✓ WIRED | Lines 25–33; used in pagination block lines 248–284 |
| `CoursesPage.tsx` | `@/components/ui/pagination` | named imports | ✓ WIRED | Lines 25–33; used in pagination block lines 355–391 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `UsersPage.tsx` | `users` → `filtered` → `paginated` | `supabase.from('profiles').select('*').order(...)` | Yes — real Supabase query via `useQuery` | ✓ FLOWING |
| `CoursesPage.tsx` | `courses` → `filtered` → `paginated` | `fetchCourses` → `@/lib/api/courses` → Supabase | Yes — real API call via `useQuery` with `queryFn: fetchCourses` | ✓ FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| UsersPage — all 15 tests pass | `vitest run UsersPage.test.tsx` | 15/15 passed | ✓ PASS |
| CoursesPage — all 14 tests pass | `vitest run CoursesPage.test.tsx` | 14/14 passed | ✓ PASS |
| Total test suite (both files) | `vitest run` | **29/29 passed, 0 failures** | ✓ PASS |
| normalizePhone present in UsersPage | `grep -c normalizePhone UsersPage.tsx` | 3 occurrences (definition + 2 uses) | ✓ PASS |
| PAGE_SIZE const removed from both files | `grep PAGE_SIZE UsersPage.tsx CoursesPage.tsx` | (empty — no matches) | ✓ PASS |
| Commits exist in git history | `git log --oneline` | `ae2b9fb` (UsersPage 11-03), `1469a31` (CoursesPage 11-04) | ✓ PASS |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ADMIN-UI-01 | 11-01, 11-03 | Users list with pagination, role filter, search by name/phone with normalization | ✓ SATISFIED | `UsersPage.tsx`: `normalizePhone`, `roleFilter`, `pageSize=useState(10)`, Select 10/20/50, STT column; 15 passing tests |
| ADMIN-UI-02 | 11-02, 11-04 | Courses list with pagination, grade filter (7/8/9/advanced), search by title | ✓ SATISFIED | `CoursesPage.tsx`: `gradeFilter`, `pageSize=useState(10)`, Select 10/20/50, STT column; 14 passing tests |
| DS-01 | 11-01, 11-02 | Design system consistency (colors, spacing, typography) + state management (page reset on filter) | ✓ SATISFIED (state mgmt) / ? HUMAN (visual) | Page reset: both pages call `setCurrentPage(1)` in all filter/search/pageSize handlers. Visual fidelity: needs browser — see Human Verification section |
| DS-02 | 11-01, 11-02 | Skeleton loading replaces spinner in page-level loading states | ✓ SATISFIED | Both pages: `isLoading` branch renders `<Skeleton>` rows; `Loader2` in CoursesPage only for action-button pending states (correct) |

**Orphaned requirements:** None. All four IDs claimed in plan frontmatter are implemented.

**Note:** REQUIREMENTS.md tracking table still shows all four IDs as "Pending" — documentation gap only; functionality is fully implemented and tested.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `CoursesPage.tsx` | 4 | `Loader2` import retained | ℹ️ Info | Not a stub — actively used in delete button (line 424) pending state. Page-level loading correctly uses `Skeleton`. |
| `UsersPage.test.tsx` | 166–178 | Phone search test types `987654` (works w/o normalization too) | ℹ️ Info | The test validates phone search but doesn't specifically verify the `+84`/`84`→`0` normalization edge cases. Code logic is provably correct (regex verified). Not a blocker. |

**No blockers. No warnings.**

---

### Human Verification Required

#### 1. DS-01 Visual Design Consistency

**Test:** Navigate to `/quan-tri/nguoi-dung` and `/quan-tri/khoa-hoc` in a browser. Verify the new STT column, page-size selector (Hiển thị 10 / trang), and updated pagination bar render consistently with the rest of the admin UI.
**Expected:** Colors, spacing, typography, and component sizing for STT column (`text-muted-foreground w-12`), page-size Select, and "Hiển thị X / trang" label feel visually consistent with other admin pages. No jarring differences in padding, font size, or column widths.
**Why human:** DS-01 is a cross-cutting design system requirement — code inspection confirms correct Tailwind class usage (`text-muted-foreground`, `w-12`, `h-8`, `text-sm`) and component imports, but pixel-level visual fidelity requires rendering in a browser.

---

### Gaps Summary

No functional gaps. All 18 automated must-haves from plans 11-01 through 11-04 are fully verified:

- **Phone normalization** (11-03): `normalizePhone` strips `+84`/`84` prefix → `0`, applied symmetrically to both stored phone and search query. Searching `0912…`, `+84912…`, or `84912…` all match the same user record.
- **Dynamic page size + STT** (11-03 Users, 11-04 Courses): `PAGE_SIZE` hardcoded consts replaced by `useState(10)` in both pages; Select with 10/20/50 options visible next to pagination; STT column shows `(currentPage-1)*pageSize+index+1`; changing page size resets to page 1.
- **Regression**: all 29 tests still pass (15 UsersPage + 14 CoursesPage); no regressions introduced.
- **DS-01** (state management): both pages reset `currentPage` to 1 on search, filter, and page-size changes.
- **DS-02**: both pages use `<Skeleton>` for page-level loading.

One human-verification item remains: DS-01 visual design consistency of the new STT column and page-size selector.

---

_Verified: 2026-05-02T00:09:00Z_
_Verifier: the agent (gsd-verifier)_
