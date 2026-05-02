# Phase 13: Student Pages - Research

**Researched:** 2026-05-02
**Domain:** React UI Polish — Claymorphism design, TanStack Query infinite scroll, shadcn Sheet drawer
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Student pages use **Claymorphism** — thick teal border (3-4px solid `#0D9488`), double shadow (outer `0 8px 0 #0D9488`, inner light), `rounded-3xl`, white card background on `#F0FDFA` page background.
- **D-02:** Page background: `bg-[#F0FDFA]` (light mint) for student content areas.
- **D-03:** Design system reference: `design-system/bumath/MASTER.md` — Teal+Claymorphism+Light theme.
- **D-04:** Progress bar height: `h-3` or `h-4`, filled color `bg-[#0D9488]`.
- **D-05:** Progress label: `{progress}% hoàn thành` displayed below bar, `text-sm text-muted-foreground`.
- **D-06:** Progress bar is a visual focal point — place near bottom of CardContent, after title and grade badge.
- **D-07:** Search bar goes ABOVE grade filters on its own full-width row. Layout: Row 1 = search, Row 2 = grade pills.
- **D-08:** Grade filters remain as pill/tab buttons with existing URL param pattern `?lop=7`.
- **D-09:** Search is client-side substring match on course title (case-insensitive), AND logic with grade filter.
- **D-10:** **Infinite scroll** — `useInfiniteQuery` with page-based loading. Auto-triggered at scroll threshold.
- **D-11:** Initial page size: 12 courses per page. All loaded courses client-side filtered.
- **D-12:** On mobile (below `lg` breakpoint), sidebar = slide-in drawer from the left.
- **D-13:** Drawer uses shadcn `Sheet` component (left side). Overlay background when open.
- **D-14:** Desktop layout unchanged. Mobile: sidebar hidden, replaced by Sheet drawer.
- **D-15:** Trigger button copy: "Danh sách bài học" with Menu/List icon, `min-h-[48px]`.
- **D-16:** Empty state style: Lucide icon (64px, teal) + heading + body + optional CTA. No illustrations.
- **D-17:** CoursesPage empty state: `BookOpen` icon, "Bạn chưa có khóa học nào", CTA → `/danh-muc`.
- **D-18:** CataloguePage empty state (no results): `Search` icon, "Không tìm thấy kết quả", no CTA.
- **D-19:** CourseDetailPage: no dedicated empty state needed.
- **D-20:** Skeleton loading (4 / 6 cards) over Loader2 spinners.
- **D-21:** `min-h-[48px]` on all interactive tap targets.
- **D-22:** Error state: `<p className="text-destructive text-center py-8">` — plain `<p>` not `<Alert>`.
- **D-23:** Vietnamese UI copy, English variable names and code comments.

### Agent's Discretion
- Exact Claymorphism CSS implementation detail (inline style vs Tailwind arbitrary values for double shadow)
- Infinite scroll implementation detail (IntersectionObserver threshold, loading spinner at bottom)
- Exact padding/spacing inside cards
- `Sheet` drawer animation timing (use shadcn default)

### Deferred Ideas (OUT OF SCOPE)
- URL query params for search state (CataloguePage) — local `useState` is correct for Phase 13
- Animated math symbol floats on student page backgrounds
- "Install all shadcn/radix components" todo
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STUDENT-UI-01 | CoursesPage — card layout, prominent progress bars, clear empty state | Existing page confirmed; needs Claymorphism card class, teal progress, empty state upgrade, URL bug fix |
| STUDENT-UI-02 | CourseDetailPage — responsive sidebar, video as primary content, UX mark complete | Sheet component confirmed installed; breakpoint change md→lg; mobile Tabs removal pattern identified |
| STUDENT-UI-03 | CataloguePage — card grid, grade filter, search, pagination/infinite scroll | `useInfiniteQuery` + `fetchCoursesPaginated` both available; search requires local state only |
| STUDENT-UI-04 | Empty states on all student pages | All empty state copy + icon specs fully defined in CONTEXT.md + UI-SPEC |
| DS-01 | Consistent color/spacing/typography system across all pages | `.bm-clay-card-student` CSS class + font update + bg override pattern fully specified |
| DS-02 | Loading skeleton over spinners | Skeleton component confirmed installed; pattern from Phase 11/12 preserved |
</phase_requirements>

---

## Summary

Phase 13 is a **pure UI refactor + feature addition** on three existing functional student pages. No backend changes, no new API functions, no RLS changes. All three pages already render correct data — Phase 13 upgrades their visual design to Claymorphism (teal variant) and adds: infinite scroll to CataloguePage, a Sheet drawer for mobile course detail, and polished empty states throughout.

The codebase is in excellent shape for this work. All required shadcn components (`Sheet`, `Progress`, `Skeleton`, `Card`, `Badge`, `Input`) are confirmed installed. The `fetchCoursesPaginated` API function already exists and supports the infinite scroll pattern. Two existing implementation issues need fixing as part of this phase: (1) `CoursesPage.tsx` links to `/courses/${course.slug}` instead of `/khoa-hoc/${course.slug}` — a URL bug; (2) `CourseDetailPage.tsx` uses `md:` breakpoint for the sidebar split but the UI-SPEC/CONTEXT requires `lg:`.

**Primary recommendation:** Work page-by-page (CoursesPage → CataloguePage → CourseDetailPage), with `src/index.css` CSS additions (`.bm-clay-card-student`, `.bm-progress-teal`, font import) as Wave 0 infrastructure.

---

## Standard Stack

### Core (already installed — no new installs needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui | installed | Card, Badge, Progress, Skeleton, Sheet, Button, Input | Project standard — confirmed in `components.json` |
| `@tanstack/react-query` | installed | `useQuery`, `useInfiniteQuery` | Project standard for all server state |
| `react-router-dom` v6 | installed | `Link`, `useSearchParams`, `useParams` | Project routing standard |
| Lucide React | installed | `BookOpen`, `Search`, `Menu`, `Lock`, `LogIn` icons | Project icon library |
| Tailwind CSS | installed | Utility classes, arbitrary values for Claymorphism | Project styling standard |

### Shadcn Components Confirmed Present
```
src/components/ui/sheet.tsx       ✓  (Sheet, SheetContent, SheetHeader, SheetTitle)
src/components/ui/progress.tsx    ✓
src/components/ui/skeleton.tsx    ✓
src/components/ui/card.tsx        ✓  (Card, CardHeader, CardContent, CardTitle)
src/components/ui/badge.tsx       ✓
src/components/ui/button.tsx      ✓
src/components/ui/input.tsx       ✓
src/components/ui/accordion.tsx   ✓  (used in LessonSidebar)
```

**No `yarn dlx shadcn@latest add` commands needed.**

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `IntersectionObserver` | browser API | Infinite scroll sentinel detection | CataloguePage bottom sentinel div |
| `useInfiniteQuery` | TanStack Query | Page-based data loading | CataloguePage only |

**Installation:** None required.

---

## Architecture Patterns

### Recommended File Structure (Phase 13 touches)
```
src/
├── index.css                             # Wave 0: Add .bm-clay-card-student, .bm-progress-teal, fonts
├── components/student/
│   ├── LessonSidebar.tsx                 # Progress bar teal fill, sidebar bg white
│   └── StudentLayout.tsx                 # bg-[#F0FDFA] on <main>
└── pages/student/
    ├── CoursesPage.tsx                   # Claymorphism cards, new empty state, URL bug fix
    ├── CataloguePage.tsx                 # Infinite scroll, search bar, Claymorphism cards
    └── CourseDetailPage.tsx              # Sheet drawer (mobile), lg: breakpoint, bg fix
```

### Pattern 1: `.bm-clay-card-student` CSS Class
**What:** New CSS class added to `src/index.css` alongside existing `.bm-clay-card` (orange/auth).
**When to use:** On all student page course cards. Applied to shadcn `<Card>` with `border-0 shadow-none` to suppress defaults.

```css
/* Add to src/index.css after .bm-clay-card */
.bm-clay-card-student {
  background: #FFFFFF;
  border: 3px solid #0D9488;
  border-radius: 24px;
  box-shadow:
    0 8px 0 #0D9488,
    0 2px 0 rgba(255, 255, 255, 0.8) inset;
  transition: box-shadow 200ms ease, transform 200ms ease;
  cursor: pointer;
}

.bm-clay-card-student:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 0 #0D9488,
    0 2px 0 rgba(255, 255, 255, 0.8) inset;
}

@media (prefers-reduced-motion: reduce) {
  .bm-clay-card-student {
    transition: none;
  }
  .bm-clay-card-student:hover {
    transform: none;
  }
}
```

**Usage on shadcn Card:**
```tsx
<Card className="bm-clay-card-student border-0 shadow-none p-0 overflow-hidden h-full">
```

### Pattern 2: Teal Progress Bar Override
**What:** `.bm-progress-teal` CSS class targets shadcn Progress indicator element.
**When to use:** All `<Progress>` components on student pages.

```css
/* Add to src/index.css */
.bm-progress-teal [data-slot="progress-indicator"],
.bm-progress-teal > div {
  background-color: #0D9488 !important;
}
```

```tsx
<Progress
  value={progress}
  className="h-3 bg-[#CCFBF1] bm-progress-teal"
  aria-label={`Tiến độ hoàn thành: ${progress}%`}
/>
```

**Why this approach:** CLAUDE.md prohibits editing `src/components/ui/` components directly. CSS class override is the established pattern from Phase 6.

### Pattern 3: CataloguePage Infinite Scroll
**What:** Replace `useQuery(fetchAllCourses)` with `useInfiniteQuery(fetchCoursesPaginated)`.
**When to use:** CataloguePage only.

```tsx
// fetchCoursesPaginated already supports { page, pageSize, grade: 'all', search: '' }
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
} = useInfiniteQuery({
  queryKey: ['catalogue-courses'],
  queryFn: ({ pageParam = 1 }) =>
    fetchCoursesPaginated({ page: pageParam, pageSize: 12, grade: 'all', search: '' }),
  getNextPageParam: (lastPage, allPages) =>
    lastPage.data.length === 12 ? allPages.length + 1 : undefined,
  enabled: !authLoading,
})

// Flatten all loaded pages
const allCourses = data?.pages.flatMap(p => p.data) ?? []

// Client-side filter (D-09, D-11)
const filteredCourses = allCourses.filter(c => {
  const matchesGrade = activeGrade === 'all' || c.target_grade === activeGrade
  const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  return matchesGrade && matchesSearch
})
```

**IntersectionObserver sentinel:**
```tsx
const sentinelRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    { threshold: 0.1 }
  )
  if (sentinelRef.current) observer.observe(sentinelRef.current)
  return () => observer.disconnect()
}, [hasNextPage, isFetchingNextPage, fetchNextPage])

// At bottom of grid:
<div ref={sentinelRef} className="h-px" />
```

### Pattern 4: CourseDetailPage Mobile Sheet Drawer
**What:** Replace `<Tabs>` mobile layout with shadcn `Sheet` from the left.
**When to use:** CourseDetailPage on mobile (`< lg` breakpoint).

```tsx
const [drawerOpen, setDrawerOpen] = useState(false)

// Mobile: trigger + Sheet (replaces Tabs entirely)
<div className="block lg:hidden px-4 pt-3 pb-2">
  <Button
    variant="outline"
    onClick={() => setDrawerOpen(true)}
    className="min-h-[48px] gap-2 border-[#0D9488] text-[#0D9488] hover:bg-[#F0FDFA]"
    aria-label="Mở danh sách bài học"
  >
    <Menu className="h-4 w-4" />
    Danh sách bài học
  </Button>
</div>

<Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
  <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0">
    <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
      <SheetTitle className="text-base font-bold text-[#134E4A]">
        Danh sách bài học
      </SheetTitle>
    </SheetHeader>
    <div className="overflow-y-auto h-[calc(100%-56px)]">
      <LessonSidebar
        chapters={chapters}
        lessonsByChapter={lessonsByChapter}
        completedLessonIds={completedLessonIds}
        activeLessonId={activeLessonId}
        onSelectLesson={(lesson) => {
          setActiveLessonId(lesson.id)
          setDrawerOpen(false)  // Auto-close on lesson select
        }}
        progress={progress}
        scrollable={false}
      />
    </div>
  </SheetContent>
</Sheet>

// Desktop: unchanged (existing sidebar)
<div className="hidden lg:flex h-[calc(100vh-48px)]">
  <div className="w-[280px] shrink-0 bg-white border-r border-[#0D9488]/20">
    <LessonSidebar ... />
  </div>
  <div className="flex-1 overflow-y-auto bg-[#F0FDFA]">
    <LessonContent ... />
  </div>
</div>
```

### Anti-Patterns to Avoid
- **Using `<Alert>` for error states:** Replace with `<p className="text-destructive text-center py-8">` per D-22.
- **Using `bg-muted` for Progress track:** Use `bg-[#CCFBF1]` (teal-100 tint).
- **Editing `src/components/ui/*.tsx` directly:** Never — use CSS class overrides instead (CLAUDE.md rule).
- **Not suppressing shadcn Card defaults:** Always add `border-0 shadow-none` when applying `.bm-clay-card-student`.
- **Keeping the `md:` breakpoint for CourseDetailPage sidebar:** Must change to `lg:` per UI-SPEC.
- **Leaving the URL bug in CoursesPage:** Line 118 links to `/courses/${course.slug}` — must be `/khoa-hoc/${course.slug}`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile overlay drawer | Custom drawer with portals | `shadcn Sheet` | Focus trap, aria-modal, animation handled automatically |
| Infinite scroll detection | setInterval or scroll event listener | `IntersectionObserver` API | Battery-efficient, no scroll jank |
| Progress bar teal fill | Custom progress component | CSS class override on existing `<Progress>` | Maintains CLAUDE.md constraint; minimal change |
| Paginated course fetching | Manual pagination logic | `useInfiniteQuery` + existing `fetchCoursesPaginated` | Built-in cache, loading state, getNextPageParam |
| Skeleton loading | Spinner or custom shimmer | `<Skeleton className="rounded-3xl">` | Already installed, DS-02 requirement |

**Key insight:** Every complex interaction pattern (drawer, infinite scroll, skeleton) has a ready-made solution already in the project. Phase 13 is assembly, not invention.

---

## Common Pitfalls

### Pitfall 1: shadcn Card Border Conflict
**What goes wrong:** Applying `.bm-clay-card-student` to a `<Card>` without suppressing shadcn's own border/shadow creates double-border effect.
**Why it happens:** shadcn Card has `border border-border shadow-sm` by default.
**How to avoid:** Always include `border-0 shadow-none` in the `className` alongside `bm-clay-card-student`.
**Warning signs:** Card appears with two visible borders or incorrect shadow.

### Pitfall 2: Progress Indicator Selector Mismatch
**What goes wrong:** `.bm-progress-teal > div` doesn't target the correct inner element, leaving progress bar gray.
**Why it happens:** shadcn Progress renders with `data-slot="progress-indicator"` in newer versions; older renders as bare `div`.
**How to avoid:** Use both selectors: `[data-slot="progress-indicator"], > div { background-color: #0D9488 !important; }`.
**Warning signs:** Progress bar fill stays gray/muted after applying class.

### Pitfall 3: `useInfiniteQuery` flatten pattern
**What goes wrong:** Rendering `data?.pages` directly instead of flattening to `data?.pages.flatMap(p => p.data)`.
**Why it happens:** `useInfiniteQuery` returns a paginated result object, not a flat array.
**How to avoid:** Always flatten: `const allCourses = data?.pages.flatMap(p => p.data) ?? []`.
**Warning signs:** Courses grid shows page objects or nothing renders.

### Pitfall 4: IntersectionObserver Cleanup
**What goes wrong:** Observer keeps triggering after component unmounts, causing state update on unmounted component.
**Why it happens:** useEffect cleanup isn't called when `sentinelRef` dependencies change.
**How to avoid:** Return `() => observer.disconnect()` from the useEffect.
**Warning signs:** Console warnings about setState on unmounted component.

### Pitfall 5: Mobile Breakpoint Inconsistency
**What goes wrong:** Existing `CourseDetailPage` uses `md:flex / md:hidden` breakpoints; UI-SPEC requires `lg:flex / lg:hidden`.
**Why it happens:** Original code was written before Phase 13 design decisions.
**How to avoid:** Change ALL breakpoint classes in the enrolled and preview layout sections from `md:` to `lg:`.
**Warning signs:** Desktop sidebar appears/hides at wrong viewport width (768px vs 1024px).

### Pitfall 6: URL Bug in CoursesPage
**What goes wrong:** CoursesPage line 118 has `to={'/courses/${course.slug}'}` — broken link after Phase 9 URL standardization.
**Why it happens:** Legacy code not updated during URL standardization phase.
**How to avoid:** Change to `to={'/khoa-hoc/${course.slug}'}` as part of Phase 13 CoursesPage task.
**Warning signs:** Clicking an enrolled course card navigates to a 404.

### Pitfall 7: Font Import Not Updated
**What goes wrong:** `src/index.css` still imports `Be Vietnam Pro`; UI-SPEC requires `Baloo 2` (headings) + `Comic Neue` (body).
**Why it happens:** Font change is specified in UI-SPEC but hasn't been implemented yet.
**How to avoid:** Replace the `@import` and `font-family` declaration in `@layer base` as the first action in Wave 0.
**Warning signs:** Page headings don't display in the expected rounded/playful Baloo 2 style.

### Pitfall 8: CataloguePage `user` prop missing for auth check
**What goes wrong:** `CataloguePage` uses `useAuth()` destructuring with `{ user, profile, loading: authLoading }`. If the `Sheet` or `useInfiniteQuery` refactor loses this destructuring, the `isAuthenticated` check breaks.
**Why it happens:** Refactoring the query section can accidentally drop the auth destructuring.
**How to avoid:** Keep the `const { user, profile, loading: authLoading } = useAuth()` line intact.

---

## Code Examples

### Empty State — CoursesPage (D-17)
```tsx
// Source: CONTEXT.md D-17, UI-SPEC §CoursesPage Empty State
<div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
  <BookOpen className="h-16 w-16 text-[#0D9488]" aria-hidden="true" />
  <h2 className="text-xl font-bold text-[#134E4A]">Bạn chưa có khóa học nào</h2>
  <p className="text-base text-muted-foreground max-w-sm">
    Liên hệ giảng viên để được thêm vào khóa học, hoặc khám phá danh mục.
  </p>
  <Link to="/danh-muc">
    <Button className="bm-btn-cta min-h-[48px] px-6">
      Khám phá khóa học
    </Button>
  </Link>
</div>
```

### Grade Filter Pills (CataloguePage)
```tsx
// Source: CONTEXT.md D-08, UI-SPEC §Grade Filter Pill States
<div className="flex flex-wrap gap-2 mt-3 mb-6">
  {GRADE_FILTERS.map(f => (
    <button
      key={f.value}
      onClick={() => setGrade(f.value)}
      className={[
        'rounded-full px-4 py-2 text-sm font-bold transition-colors duration-150 cursor-pointer min-h-[44px] border',
        activeGrade === f.value
          ? 'bg-[#0D9488] text-white border-[#0D9488]'
          : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground',
      ].join(' ')}
    >
      {f.label}
    </button>
  ))}
</div>
```

### Search Bar (CataloguePage)
```tsx
// Source: CONTEXT.md D-07, UI-SPEC §Search Bar
const [searchQuery, setSearchQuery] = useState('')

<div className="relative mt-4 mb-3">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    type="search"
    placeholder="Tìm kiếm khóa học..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-9 min-h-[48px] rounded-xl border-[#0D9488] focus-visible:ring-[#0D9488]"
    aria-label="Tìm kiếm khóa học"
  />
</div>
```

### Font Update in src/index.css
```css
/* Source: UI-SPEC §Design System, Font note */
/* REPLACE: @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro...') */
/* WITH: */
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700&family=Comic+Neue:wght@400;700&display=swap');

/* In @layer base body rule: */
body {
  @apply bg-background text-foreground;
  font-family: 'Comic Neue', cursive;  /* body text */
}
/* For headings, add: */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Baloo 2', sans-serif;
}
```

### StudentLayout bg fix
```tsx
// Source: UI-SPEC §StudentLayout Header
// BEFORE:
<main className="min-h-[calc(100vh-48px)] bg-background">
// AFTER:
<main className="min-h-[calc(100vh-48px)] bg-[#F0FDFA]">
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fetch all courses once (`useQuery`) | Page-based loading (`useInfiniteQuery`) | Phase 13 | Better perceived performance for larger catalogues |
| Mobile Tabs (content/mục lục) | Sheet drawer from left | Phase 13 | Cleaner UX — content always visible, drawer overlay |
| Generic card styles | Claymorphism `.bm-clay-card-student` | Phase 13 | Brand-consistent with auth pages |
| Orange progress (bg-muted) | Teal progress (`bm-progress-teal`) | Phase 13 | Design system compliance |
| Alert component for errors | Plain `<p className="text-destructive">` | Phase 12.1 | Simpler, consistent with established pattern |

**Fixed issues in this phase:**
- `CoursesPage` URL bug: `/courses/${slug}` → `/khoa-hoc/${slug}`
- `CourseDetailPage` breakpoint: `md:` → `lg:` for sidebar/drawer split

---

## Open Questions

1. **Font change scope**
   - What we know: UI-SPEC explicitly requires replacing `Be Vietnam Pro` with `Baloo 2 + Comic Neue`
   - What's unclear: Whether changing body font will visually break the landing page or admin pages (those pages weren't designed with `Comic Neue` in mind)
   - Recommendation: Apply `Baloo 2` to headings only; keep `Be Vietnam Pro` as the base body font OR scope `Comic Neue` to `.student-pages` wrapper only to avoid regression. The executor should assess impact before making global changes.

2. **`fetchCoursesPaginated` for infinite scroll vs `fetchAllCourses` slicing**
   - What we know: `fetchCoursesPaginated` exists and supports `{ page, pageSize, grade: 'all', search: '' }`. D-11 says "keep all courses client-side filtered after loading."
   - What's unclear: If `useInfiniteQuery` fetches pages without grade/search, the client-side filter may show fewer than 12 cards per page (e.g., page 1 has 10 Lớp_9 and 2 Lớp_7 — filtering to Lớp_7 shows only 2).
   - Recommendation: This is acceptable UX (infinite scroll continues loading until all Lớp_7 courses are visible). The alternative — fetching ALL courses upfront and slicing — avoids this but defeats infinite scroll's purpose. Use `fetchCoursesPaginated` with `grade: 'all', search: ''` (server-unfiltered) per decisions.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 13 is a pure frontend UI change. No new external tools, CLIs, databases, or services. All dependencies (`shadcn`, `TanStack Query`, `Lucide`, `Tailwind`) are already installed and confirmed present.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test src/pages/student/CoursesPage.tsx` (no dedicated test yet → Wave 0 gap) |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STUDENT-UI-01 | CoursesPage renders clay cards with progress bars | unit | `yarn test src/pages/student/CoursesPage.test.tsx` | ❌ Wave 0 |
| STUDENT-UI-01 | CoursesPage empty state renders BookOpen icon + CTA | unit | `yarn test src/pages/student/CoursesPage.test.tsx` | ❌ Wave 0 |
| STUDENT-UI-02 | CourseDetailPage mobile: Sheet drawer trigger button renders | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx` | ✅ (extend existing) |
| STUDENT-UI-02 | CourseDetailPage desktop: LessonSidebar renders inline | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx` | ✅ (extend existing) |
| STUDENT-UI-03 | CataloguePage search input renders and filters | unit | `yarn test src/pages/student/CataloguePage.test.tsx` | ✅ (extend existing) |
| STUDENT-UI-03 | CataloguePage shows "Không tìm thấy kết quả" when filtered empty | unit | `yarn test src/pages/student/CataloguePage.test.tsx` | ✅ (extend existing) |
| STUDENT-UI-04 | CoursesPage empty state: all three elements (icon, heading, CTA) | unit | `yarn test src/pages/student/CoursesPage.test.tsx` | ❌ Wave 0 |
| DS-02 | Skeleton renders during loading (not spinner) | unit | `yarn test src/pages/student/CoursesPage.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn test src/pages/student/[Page].test.tsx`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/pages/student/CoursesPage.test.tsx` — covers STUDENT-UI-01, DS-02 (CoursesPage had no test file previously)

*(Existing test files: `CataloguePage.test.tsx` and `CourseDetailPage.test.tsx` require test additions but files exist)*

---

## Project Constraints (from copilot-instructions.md / CLAUDE.md)

| Directive | Impact on Phase 13 |
|-----------|-------------------|
| **Package manager: Yarn 4.11.0** | Use `yarn dlx shadcn@latest add` (not npm), `yarn test` (not npx vitest) |
| **Always use shadcn/ui or Radix before custom components** | Confirmed: Sheet, Progress, Skeleton, Card all used |
| **Do NOT edit `src/components/ui/` directly** | Progress teal fill uses `.bm-progress-teal` CSS override, not component edit |
| **Always invoke `ui-ux-pro-max` skill before designing UI** | UI-SPEC already produced and approved — satisfied |
| **Pre-delivery checklist:** no emoji icons, cursor-pointer on clickables, 4.5:1 contrast, 150–300ms transitions, focus states, responsive at 375/768/1024/1440px | `.bm-clay-card-student` includes `cursor: pointer`, 200ms transitions, reduced-motion, `focus-visible:ring-[#0D9488]` on inputs |
| **TypeScript strict mode disabled** | No `any` suppression needed; explicit type annotations optional |

---

## Sources

### Primary (HIGH confidence)
- `src/pages/student/CoursesPage.tsx` — Current implementation, confirmed URL bug on line 118
- `src/pages/student/CataloguePage.tsx` — Current implementation, confirmed `useQuery` pattern to replace
- `src/pages/student/CourseDetailPage.tsx` — Current `md:` breakpoint confirmed (lines 192, 215, 258, 308)
- `src/lib/api/courses.ts` — Confirmed `fetchCoursesPaginated` exists with `{ page, pageSize, grade, search }` params
- `src/components/ui/sheet.tsx` — Confirmed present (via `ls src/components/ui/`)
- `src/index.css` — Confirmed: `Be Vietnam Pro` font, `.bm-clay-card` (orange), `.bm-btn-cta` present; `.bm-clay-card-student` NOT yet present
- `src/components/student/LessonSidebar.tsx` — Confirmed `bg-muted` on Progress, `scrollable` prop exists
- `src/components/student/StudentLayout.tsx` — Confirmed `bg-background` on `<main>` (needs change to `bg-[#F0FDFA]`)
- `.planning/phases/13-student-pages/13-CONTEXT.md` — All locked decisions
- `.planning/phases/13-student-pages/13-UI-SPEC.md` — All component specs, exact copy, responsive breakpoints

### Secondary (MEDIUM confidence)
- `vitest.config.ts` — Test framework confirmed: Vitest + jsdom + globals
- `src/pages/student/CataloguePage.test.tsx` — Test pattern confirmed: dynamic import, `vi.mock`, `waitFor`
- `src/pages/student/CourseDetailPage.test.tsx` — Test pattern confirmed for LessonSidebar mock

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — All components confirmed present via filesystem check
- Architecture: HIGH — All patterns derived from existing code + approved UI-SPEC
- Pitfalls: HIGH — URL bug and breakpoint mismatch verified directly in source code
- Infinite scroll: MEDIUM — `useInfiniteQuery` + `fetchCoursesPaginated` pattern is standard, but the exact `getNextPageParam` logic should be verified during implementation

**Research date:** 2026-05-02
**Valid until:** 2026-06-02 (stable stack, no fast-moving dependencies)
