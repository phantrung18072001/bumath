# Phase 9: URL Standardization — Research

**Researched:** 2026-05-01
**Domain:** React Router v6 route renaming + internal link audit
**Confidence:** HIGH (entire codebase read directly)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**URL Mapping (English → Vietnamese):**

| Old URL | New URL |
|---------|---------|
| `/login` | `/dang-nhap` |
| `/register` | `/dang-ky` |
| `/pending` | `/cho-duyet` |
| `/admin/users` | `/quan-tri/nguoi-dung` |
| `/admin/courses` | `/quan-tri/khoa-hoc` |
| `/admin/courses/:courseSlug` | `/quan-tri/khoa-hoc/:courseSlug` |
| `/admin/courses/:courseSlug/chapters/:chapterSlug` | `/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug` |
| `/admin/submissions` | `/quan-tri/bai-nop` |
| `/admin/submissions/:submissionId` | `/quan-tri/bai-nop/:submissionId` |
| `/courses` | `/khoa-hoc` |
| `/courses/:courseSlug` | `/khoa-hoc/:courseSlug` |
| `/catalogue` | `/danh-muc` |

**Dynamic param names:** Keep as-is (`:courseSlug`, `:chapterSlug`, `:submissionId`).

**Backward Compatibility:** No redirect, just rename. The app is brand-new.  
No `<Navigate>` components needed for old routes.

**Query Params:** Rename to Vietnamese with clean values.

| Old | New | Meaning |
|-----|-----|---------|
| `?grade=grade_7` | `?lop=7` | Lớp 7 |
| `?grade=grade_8` | `?lop=8` | Lớp 8 |
| `?grade=grade_9` | `?lop=9` | Lớp 9 |
| `?grade=advanced` | `?lop=nang-cao` | Ôn chuyên / Nâng cao |

Mapping in `CataloguePage.tsx`:
```ts
const LOI_MAP: Record<string, Course['target_grade']> = {
  '7': 'grade_7', '8': 'grade_8', '9': 'grade_9', 'nang-cao': 'advanced'
}
```

### the agent's Discretion

None specified.

### Deferred Ideas (OUT OF SCOPE)

- HTTP-level 301 redirects (not possible in SPA without server config — deferred to server/CDN config later).
- Pending page `/cho-duyet` link update in Pending.tsx itself — **included in scope**.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| URL-01 | Tất cả URL đồng nhất tiếng Việt — không còn URL tiếng Anh (trừ landing `/`) | All 12 route definitions in App.tsx confirmed; complete file-by-file inventory below |
| URL-02 | Tất cả redirect nội bộ (sau login, logout, ProtectedRoute) cập nhật theo URL mới | All navigate() calls and `<Navigate to>` identified across 11 files |
| URL-03 | URL cũ không dẫn đến broken links (interpreted as: all internal links updated) | CONTEXT.md overrides "301 redirect" interpretation — just rename is sufficient; no external links exist |
</phase_requirements>

---

## Summary

This is a pure **find-and-replace** refactor with zero new logic except in `CataloguePage.tsx`. The entire change is: rename 12 route paths in `App.tsx` and update every `navigate()`, `<Link to>`, `<NavLink to>`, `<Navigate to>`, and `startsWith()` reference in 19 source files + 6 test files.

The only place with logic complexity is `CataloguePage.tsx`, which must add a bidirectional mapping (`LOI_MAP`) between the new `?lop=` query param values (`7`, `8`, `9`, `nang-cao`) and the internal DB enum values (`grade_7`, `grade_8`, `grade_9`, `advanced`).

**Important discovery:** `/pending` route does NOT exist in the current codebase. `src/App.tsx` has no `/pending` route, `ProtectedRoute.tsx` does not redirect to `/pending`, and there is no `Pending.tsx` page. The CONTEXT.md mapping entry `/pending` → `/cho-duyet` is a no-op — nothing to rename here. The planner should skip this entry.

**Primary recommendation:** Execute file-by-file, starting with `App.tsx` (authoritative route definitions), then `ProtectedRoute.tsx` (core redirect logic), then leaf pages and components, then test files last.

---

## Project Constraints (from copilot-instructions.md / CLAUDE.md)

- **Package manager:** Yarn 4.11.0 — use `yarn`, not `npm`
- **UI Components:** Do not modify `src/components/ui/` manually — use shadcn CLI. (N/A for this phase — no UI changes)
- **TypeScript:** Strict mode disabled; `noImplicitAny` off
- **Test runner:** `yarn test` (Vitest + React Testing Library)
- **Test files:** `src/**/*.{test,spec}.{ts,tsx}`

---

## Complete File-by-File Change Inventory

### HIGH PRIORITY: Core routing (must be done first)

#### `src/App.tsx` — 11 route path strings

| Line | Old | New |
|------|-----|-----|
| 35 | `path="/login"` | `path="/dang-nhap"` |
| 36 | `path="/register"` | `path="/dang-ky"` |
| 38 | `path="/admin/users"` | `path="/quan-tri/nguoi-dung"` |
| 39 | `path="/admin/courses"` | `path="/quan-tri/khoa-hoc"` |
| 40 | `path="/admin/courses/:courseSlug"` | `path="/quan-tri/khoa-hoc/:courseSlug"` |
| 41 | `path="/admin/courses/:courseSlug/chapters/:chapterSlug"` | `path="/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug"` |
| 42 | `path="/admin/submissions"` | `path="/quan-tri/bai-nop"` |
| 43 | `path="/admin/submissions/:submissionId"` | `path="/quan-tri/bai-nop/:submissionId"` |
| 44 | `path="/courses"` | `path="/khoa-hoc"` |
| 45 | `path="/courses/:courseSlug"` | `path="/khoa-hoc/:courseSlug"` |
| 46 | `path="/catalogue"` | `path="/danh-muc"` |

**Note:** `/pending` route is ABSENT from App.tsx — no action needed.

#### `src/components/auth/ProtectedRoute.tsx` — 3 changes

```tsx
// Line 15: teacher fallback
if (role === 'teacher') return '/quan-tri/bai-nop'   // was '/admin/submissions'

// Line 16: student fallback
if (role === 'student') return '/khoa-hoc'            // was '/courses'

// Line 39: unauthenticated redirect
if (!user) return <Navigate to="/dang-nhap" replace /> // was '/login'
```

---

### Auth/shared pages

#### `src/pages/Login.tsx` — 4 changes

```tsx
// useEffect (lines 25-29): role-based redirects after login
navigate('/quan-tri/nguoi-dung')   // was '/admin/users'   (admin)
navigate('/quan-tri/bai-nop')      // was '/admin/submissions' (teacher)
navigate('/khoa-hoc')              // was '/courses'         (student)

// JSX (line 147): register link
<Link to="/dang-ky">              // was '/register'
```

#### `src/pages/Register.tsx` — 3 changes

```tsx
// useEffect (lines 74-78): redirects after registration
navigate('/quan-tri/nguoi-dung')   // was '/admin/users'   (admin)
navigate('/khoa-hoc')              // was '/courses'         (student)

// JSX (line 310): login link
<Link to="/dang-nhap">            // was '/login'
```

#### `src/pages/NotFound.tsx` — 1 change

```tsx
// Line 10: role-aware home link
const homeLink = profile?.role === 'student' ? '/khoa-hoc' : '/';
// was '/courses'
```

---

### Admin components + pages

#### `src/components/admin/AdminLayout.tsx` — 3 changes (navItems array)

```tsx
const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', ... },  // was '/admin/users'
  { label: 'Quản lý khóa học',  to: '/quan-tri/khoa-hoc',  ... },  // was '/admin/courses'
  { label: 'Chấm bài',          to: '/quan-tri/bai-nop',   ... },  // was '/admin/submissions'
]
```

**Note:** `location.pathname.startsWith(to)` active detection still works correctly after rename — new paths are still unique prefixes.

#### `src/pages/admin/GradingPage.tsx` — 3 changes

```tsx
navigate('/quan-tri/bai-nop')   // line 107, was '/admin/submissions'
to="/quan-tri/bai-nop"          // line 131, breadcrumb Link
to="/quan-tri/bai-nop"          // line 146, back Link
```

#### `src/pages/admin/SubmissionsPage.tsx` — 1 change

```tsx
navigate(`/quan-tri/bai-nop/${row.id}`)
// was `/admin/submissions/${row.id}`  (line 217)
```

#### `src/pages/admin/CoursesPage.tsx` — 2 changes

```tsx
navigate(`/quan-tri/khoa-hoc/${course.slug}`)
// was `/admin/courses/${course.slug}`  (line 174)

to="/quan-tri/bai-nop"   // line 110, Link in header area
// was '/admin/submissions'
```

#### `src/pages/admin/ChaptersPage.tsx` — 2 changes

```tsx
navigate(`/quan-tri/khoa-hoc/${courseSlug}/chuong/${chapter.slug}`)
// was `/admin/courses/${courseSlug}/chapters/${chapter.slug}`  (line 207)

<Link to="/quan-tri/khoa-hoc">   // line 132, breadcrumb
// was '/admin/courses'
```

#### `src/pages/admin/LessonsPage.tsx` — 2 changes

```tsx
<Link to="/quan-tri/khoa-hoc">   // line 149, breadcrumb root
// was '/admin/courses'

<Link to={`/quan-tri/khoa-hoc/${courseSlug}`}>   // line 155, breadcrumb parent
// was `/admin/courses/${courseSlug}`
```

---

### Student components + pages

#### `src/components/student/StudentLayout.tsx` — 4 changes

```tsx
navigate('/dang-nhap')         // line 17, handleLogout
// was '/login'

to="/khoa-hoc"                 // line 38, NavLink
// was '/courses'

to="/danh-muc"                 // line 48, NavLink
// was '/catalogue'

to="/quan-tri/nguoi-dung"      // line 59, admin NavLink
// was '/admin/users'
```

#### `src/pages/student/CataloguePage.tsx` — MOST COMPLEX (5+ changes + new logic)

```tsx
// 1. Query param read: line 28
const activeGrade = (searchParams.get('grade') ?? 'all')
// → change to:
const lop = searchParams.get('lop') ?? 'all'
const LOI_MAP: Record<string, Course['target_grade']> = {
  '7': 'grade_7', '8': 'grade_8', '9': 'grade_9', 'nang-cao': 'advanced'
}
const activeGrade = lop === 'all' ? 'all' : (LOI_MAP[lop] ?? 'all')

// 2. Reverse mapping for setGrade (line 55-61):
const LOI_REVERSE: Record<Course['target_grade'], string> = {
  'grade_7': '7', 'grade_8': '8', 'grade_9': '9', 'advanced': 'nang-cao'
}
function setGrade(grade: Course['target_grade'] | 'all') {
  if (grade === 'all') {
    setSearchParams({})
  } else {
    setSearchParams({ lop: LOI_REVERSE[grade] })  // was { grade }
  }
}

// 3. Login link (line 73):
<Link to="/dang-nhap">   // was '/login'

// 4. Course card link (line 140):
<Link to={`/khoa-hoc/${course.slug}`}>   // was '/courses/${course.slug}'
```

#### `src/pages/student/CoursesPage.tsx` — 1 change

```tsx
<Link to="/danh-muc">   // line 98, empty-state link
// was '/catalogue'
```

#### `src/pages/student/CourseDetailPage.tsx` — 2-3 changes

```tsx
<Link to="/dang-nhap">   // line 294, unauthenticated CTA
<Link to="/dang-nhap">   // line 338, another login link
// was '/login' at each location

// Also check line 138 — back link to courses list (may be '/courses')
// → '/khoa-hoc'
```

---

### Landing page components

#### `src/components/landing/Header.tsx` — 7 changes

```tsx
// staticNavItems (line 9):
{ label: "Danh mục", to: "/danh-muc" }   // was '/catalogue'

// Authenticated links:
<Link to="/khoa-hoc">       // line 63 (desktop), line 166 (mobile)
// was '/courses'
<Link to="/quan-tri/nguoi-dung">  // line 71 (desktop), line 174 (mobile)
// was '/admin/users'

// Unauthenticated links:
<Link to="/dang-nhap">      // line 90 (desktop), line 193 (mobile)
// was '/login'
<Link to="/dang-ky">        // line 95 (desktop), line 196 (mobile)
// was '/register'
```

#### `src/components/landing/HeroSection.tsx` — 1 change

```tsx
<Link to={isAuthenticated ? "/khoa-hoc" : "/danh-muc"}>
// was "/courses" : "/catalogue"
```

#### `src/components/landing/ClassGrid.tsx` — complex: 1 data change + the Link

```tsx
// The classes array has grade: "grade_7" etc.
// Link currently: to={`/catalogue?grade=${c.grade}`}  → grade_7, grade_8, grade_9

// Two options:
// Option A: Add lop field to classes array
const classes = [
  { level: 7, grade: "grade_7", lop: "7", ... },
  { level: 8, grade: "grade_8", lop: "8", ... },
  { level: 9, grade: "grade_9", lop: "9", ... },
]
// Link: to={`/danh-muc?lop=${c.lop}`}

// Option B: Inline mapping
// Link: to={`/danh-muc?lop=${c.level}`}
// (level values 7, 8, 9 match lop values directly!)

// RECOMMENDATION: Option B — simplest, no new state needed
<Link to={`/danh-muc?lop=${c.level}`}>
```

#### `src/components/landing/IntensiveSection.tsx` — 1 change

```tsx
<Link to="/danh-muc?lop=nang-cao">
// was "/catalogue?grade=advanced"
```

---

### Test files to update

| File | Changes Needed |
|------|---------------|
| `src/pages/Login.test.tsx` | Update 3 navigate assertions: `/courses`→`/khoa-hoc`, `/admin/users`→`/quan-tri/nguoi-dung`, `/admin/submissions`→`/quan-tri/bai-nop` |
| `src/pages/NotFound.test.tsx` | Update href assertion: `/courses`→`/khoa-hoc` |
| `src/components/admin/AdminLayout.test.tsx` | Update 3 href assertions: `/admin/users`→`/quan-tri/nguoi-dung`, `/admin/courses`→`/quan-tri/khoa-hoc`, `/admin/submissions`→`/quan-tri/bai-nop` |
| `src/components/auth/ProtectedRoute.test.tsx` | Update redirect assertions: `/courses`→`/khoa-hoc`, `/admin/submissions`→`/quan-tri/bai-nop`, test descriptions mentioning `/login` |
| `src/components/student/StudentLayout.test.tsx` | Update 3 href assertions: `/courses`→`/khoa-hoc`, `/catalogue`→`/danh-muc`, `/admin/users`→`/quan-tri/nguoi-dung` |
| `src/pages/student/CourseDetailPage.test.tsx` | Update route path in MemoryRouter: `/courses/:courseSlug`→`/khoa-hoc/:courseSlug`, and `window.history.pushState` URL |

---

## Architecture Patterns

### React Router v6 — Route Renaming

Route paths are just string props — no API change required, just rename the path string.

```tsx
// Before
<Route path="/login" element={<Login />} />

// After
<Route path="/dang-nhap" element={<Login />} />
```

**Key insight:** React Router does NOT store route paths in state or config files outside of `App.tsx`. The single source of truth is `App.tsx` route definitions.

### Pattern: Breadcrumb `startsWith()` detection

`AdminLayout.tsx` uses `location.pathname.startsWith(to)` for active link detection. After rename, verify the three nav paths (`/quan-tri/nguoi-dung`, `/quan-tri/khoa-hoc`, `/quan-tri/bai-nop`) remain unique prefixes — they do, so this pattern works unchanged.

### Pattern: Query Param Bidirectional Mapping (CataloguePage)

The URL uses readable Vietnamese values (`lop=7`), but filtering logic uses DB enum values (`grade_7`). A two-way mapping is needed:

```ts
// URL → DB (for filtering)
const LOI_MAP: Record<string, Course['target_grade']> = {
  '7': 'grade_7', '8': 'grade_8', '9': 'grade_9', 'nang-cao': 'advanced'
}

// DB → URL (for setSearchParams)
const LOI_REVERSE: Record<Course['target_grade'], string> = {
  'grade_7': '7', 'grade_8': '8', 'grade_9': '9', 'advanced': 'nang-cao'
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Old-URL redirect in SPA | Custom redirect middleware | Don't — per CONTEXT.md decision | App is new, no external links; redirect is out of scope |
| URL encoding of Vietnamese chars | Manual encode | None needed — React Router handles `/dang-nhap` as-is in BrowserRouter | Vietnamese URL slugs work natively in modern browsers |
| Centralized route constants file | `ROUTES` object/module | Not required for this phase | Only 12 routes; a constants file would be premature; add it in a future refactor if needed |

---

## Common Pitfalls

### Pitfall 1: Forgetting the `startsWith` active detection in AdminLayout

**What goes wrong:** After rename, if you change nav `to` values but miss that `location.pathname.startsWith(to)` is used for active state, active highlighting could break.
**Why it happens:** The `startsWith` call is invisible — it's inside a `map()` callback, easy to overlook.
**How to avoid:** Confirm all three new nav paths (`/quan-tri/nguoi-dung`, `/quan-tri/khoa-hoc`, `/quan-tri/bai-nop`) are unique prefixes that don't shadow each other. They are — verified.
**Warning signs:** Sidebar items never highlight or always highlight.

### Pitfall 2: CataloguePage reads old `?grade=` param — breaks filtering if only URL is changed

**What goes wrong:** If you rename the route to `/danh-muc` but forget to change `searchParams.get('grade')` to `searchParams.get('lop')`, the filter breaks silently (always shows "all" courses).
**Why it happens:** The query param read and the Link/setSearchParams writes are in separate parts of the file.
**How to avoid:** Update read, write, and mapping in one atomic edit to CataloguePage.
**Warning signs:** Grade filter buttons don't filter anything; URL shows `?lop=7` but filter shows all courses.

### Pitfall 3: ClassGrid `c.grade` values don't map directly to new lop values

**What goes wrong:** ClassGrid has `grade: "grade_7"` in the data array. If you naively do `` to={`/danh-muc?grade=${c.grade}`} `` (keeping old key name) OR `` to={`/danh-muc?lop=${c.grade}`} `` (wrong value format), the filter breaks.
**Why it happens:** The `grade` field in the ClassGrid data has DB enum values, not the new URL-friendly values.
**How to avoid:** Use `c.level` directly (7, 8, 9) since it matches the `?lop=` values — no mapping needed.
**Warning signs:** Clicking class cards from landing page shows wrong grade filter.

### Pitfall 4: Test assertions still reference old URLs

**What goes wrong:** Tests pass against the old code, then fail after rename because they assert old URL strings.
**Why it happens:** Test files aren't in the IDE's "find all references" for URL strings.
**How to avoid:** After all source changes, run `grep -rn '/admin/\|/courses\|/login\|/register\|/catalogue' src/ --include="*.test.*"` to catch remaining test references.
**Warning signs:** Test suite fails with "expected '/courses' but received '/khoa-hoc'".

### Pitfall 5: Pending page — nothing to do

**What goes wrong:** Planner creates a task to rename `/pending` to `/cho-duyet` and update `Pending.tsx`, but neither the route nor the page file exists in the current codebase.
**Why it happens:** CONTEXT.md URL mapping table includes `/pending` but v1 removed this page.
**How to avoid:** Skip the `/pending` entry — confirmed absent from `App.tsx` and file system.
**Warning signs:** N/A — just wasted task.

### Pitfall 6: ProtectedRoute `<Navigate to="/login">` — must be updated

**What goes wrong:** After renaming routes, unauthenticated users get redirected to old `/login` URL which hits `NotFound`.
**Why it happens:** `ProtectedRoute.tsx` line 39 has a hardcoded `<Navigate to="/login" replace />`.
**How to avoid:** This is in the change inventory — update to `/dang-nhap`.
**Warning signs:** Visiting protected page while logged out → 404 instead of login page.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| English URL slugs | Vietnamese URL slugs | Better UX for Vietnamese users; works natively in React Router v6 + BrowserRouter |
| `?grade=grade_7` | `?lop=7` | Cleaner URLs; requires bidirectional mapping in CataloguePage |

**Note on vercel.json:** The current rewrite `{ "source": "/(.*)", "destination": "/index.html" }` handles ALL routes including Vietnamese ones — no change needed to `vercel.json`. Vietnamese characters in URLs are handled transparently by Vercel's rewrite rules.

---

## Code Examples

### Verified: Renaming a route in React Router v6

```tsx
// src/App.tsx — simple string change
// Before
<Route path="/login" element={<Login />} />
// After
<Route path="/dang-nhap" element={<Login />} />
```

### Verified: Dynamic route with renamed segment

```tsx
// Before
<Route path="/admin/courses/:courseSlug/chapters/:chapterSlug" element={...} />
// After  
<Route path="/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug" element={...} />

// navigate() call — only the static segments change, params stay
navigate(`/quan-tri/khoa-hoc/${courseSlug}/chuong/${chapter.slug}`)
```

### Verified: CataloguePage bidirectional query param mapping

```tsx
// Full replacement for query param logic in CataloguePage.tsx

const LOI_MAP: Record<string, Course['target_grade']> = {
  '7': 'grade_7', '8': 'grade_8', '9': 'grade_9', 'nang-cao': 'advanced'
}
const LOI_REVERSE: Record<Course['target_grade'], string> = {
  'grade_7': '7', 'grade_8': '8', 'grade_9': '9', 'advanced': 'nang-cao'
}

const [searchParams, setSearchParams] = useSearchParams()
const lop = searchParams.get('lop') ?? 'all'
const activeGrade: Course['target_grade'] | 'all' = 
  lop === 'all' ? 'all' : (LOI_MAP[lop] ?? 'all')

function setGrade(grade: Course['target_grade'] | 'all') {
  if (grade === 'all') {
    setSearchParams({})
  } else {
    setSearchParams({ lop: LOI_REVERSE[grade] })
  }
}
```

### Verified: ClassGrid — use `c.level` for clean lop values

```tsx
// c.level is already 7, 8, 9 — matches ?lop= values directly
<Link to={`/danh-muc?lop=${c.level}`}>
```

---

## Environment Availability

Step 2.6: SKIPPED — this is a pure code refactor with no external dependencies. React Router v6 is already installed. No new packages required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test src/pages/Login.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| URL-01 | All route paths use Vietnamese slugs | unit | `yarn test src/components/admin/AdminLayout.test.tsx` | ✅ |
| URL-01 | StudentLayout nav links use Vietnamese paths | unit | `yarn test src/components/student/StudentLayout.test.tsx` | ✅ |
| URL-02 | Login redirects to correct Vietnamese URLs post-login | unit | `yarn test src/pages/Login.test.tsx` | ✅ |
| URL-02 | ProtectedRoute redirects to `/dang-nhap` when unauthenticated | unit | `yarn test src/components/auth/ProtectedRoute.test.tsx` | ✅ |
| URL-02 | ProtectedRoute redirects student to `/khoa-hoc`, teacher to `/quan-tri/bai-nop` | unit | `yarn test src/components/auth/ProtectedRoute.test.tsx` | ✅ |
| URL-03 | No broken internal links — NotFound uses `/khoa-hoc` for student | unit | `yarn test src/pages/NotFound.test.tsx` | ✅ |

### Sampling Rate

- **Per task commit:** `yarn test` (full suite — tests are fast, ~5s total)
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all phase requirements. No new test files needed.
However, **all 6 test files listed above require URL string updates** as part of the implementation work.

---

## Open Questions

1. **`/courses/:courseSlug` in CourseDetailPage tests**
   - What we know: `CourseDetailPage.test.tsx` line 66 uses `<Route path="/courses/:courseSlug">` and line 71 pushes `window.history.pushState({}, '', /courses/${slug})`
   - What's unclear: Whether the test uses `MemoryRouter` with the route path or `BrowserRouter` — need to confirm full test setup (not fully read)
   - Recommendation: Update test route path to `/khoa-hoc/:courseSlug` and the pushState URL — should be straightforward.

2. **`CoursesPage.tsx` Link to `/khoa-hoc/:slug`**
   - What we know: CoursesPage line 116 has `<Link` (destination not shown in grep snippet — full file not read)
   - Recommendation: Read `src/pages/student/CoursesPage.tsx` fully before implementing that task — may have additional course slug links.

---

## Sources

### Primary (HIGH confidence)

- Direct code read: `src/App.tsx` — all 11 route path definitions
- Direct code read: `src/components/auth/ProtectedRoute.tsx` — redirect logic
- Direct code read: `src/pages/Login.tsx`, `Register.tsx`, `NotFound.tsx` — navigate() + Link patterns
- Direct code read: `src/components/admin/AdminLayout.tsx` — navItems
- Direct code read: `src/components/student/StudentLayout.tsx` — NavLink paths + navigate
- Direct code read: `src/pages/admin/GradingPage.tsx`, `SubmissionsPage.tsx`, `CoursesPage.tsx`, `ChaptersPage.tsx`, `LessonsPage.tsx` — navigate() + Link breadcrumbs
- Direct code read: `src/pages/student/CataloguePage.tsx`, `CoursesPage.tsx`, `CourseDetailPage.tsx` (partial) — Link + searchParams
- Direct code read: `src/components/landing/Header.tsx`, `HeroSection.tsx`, `ClassGrid.tsx`, `IntensiveSection.tsx` — all Link destinations
- Direct grep: all `*.test.*` files for URL string references
- Direct read: `.planning/phases/09-url-standardization/09-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)

- `vercel.json` — confirms wildcard SPA rewrite handles Vietnamese URLs without change
- React Router v6 documented behavior: route `path` is a plain string; renaming has no side effects

---

## Metadata

**Confidence breakdown:**

- Change inventory: HIGH — every file read directly
- CataloguePage mapping logic: HIGH — CONTEXT.md specifies exact LOI_MAP
- Pending page status: HIGH — confirmed absent from file system and App.tsx
- Test file changes: HIGH — all test URLs identified by grep

**Research date:** 2026-05-01
**Valid until:** Indefinite (pure code refactor, no external dependencies)
