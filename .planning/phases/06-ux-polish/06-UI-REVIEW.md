# Phase 06 — UI Review

**Audited:** 2026-04-28
**Baseline:** `06-UI-SPEC.md` (approved design contract)
**Screenshots:** Not captured — dev server at port 8080 detected but Playwright not installed; code-only audit performed.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Most copy matches spec; student filter placeholder drifted ("Tìm kiếm học sinh..." vs "Tìm học sinh..."); preview mode copy combined in one string with `\n` |
| 2. Visuals | 3/4 | All screens have clear focal points; SlidersHorizontal icon missing from filter bar; preview mode uses centred card (improvement over spec's list, but undeclared) |
| 3. Color | 3/4 | bg-muted progress track fix confirmed; BellNotification uses hardcoded `bg-red-500` / `text-[10px]` instead of design tokens |
| 4. Typography | 2/4 | `font-medium` (weight 500) used in 5 places after spec explicitly removed it; `text-lg` in preview card not in declared type scale |
| 5. Spacing | 2/4 | `py-1.5` (6px, off 4pt grid) on catalogue filter pills — spec decision log explicitly called this out; `gap-5` (20px) in preview Card off scale |
| 6. Experience Design | 3/4 | Comprehensive state coverage; `/catalogue` and `/courses/:slug` missing ProtectedRoute (intentional anon-support expansion but departs from spec) |

**Overall: 16/24**

---

## Top 3 Priority Fixes

1. **`font-medium` used in 5 locations after spec removed weight 500** — Users see inconsistent text weight; grade filter buttons and tab triggers appear lighter than spec's semibold system — Fix: change `font-medium` → `font-semibold` in `CataloguePage.tsx:89` (grade filter pills) and `CourseDetailPage.tsx:220, 226, 310, 316` (tab triggers).

2. **`py-1.5` (6px) on CataloguePage grade filter buttons breaks the 4-point spacing grid** — Spec decision log explicitly documents "Nav link `py-1.5` → `py-2`" as a correction; applying the same undeclared value to new filter buttons introduces off-grid inconsistency and sub-optimal touch targets — Fix: change `py-1.5` → `py-2` in `CataloguePage.tsx:89`.

3. **Preview mode combined copy string uses `\n` which doesn't render as a line break in JSX** — The two sentences merge into a single run-on paragraph in the browser; spec requires them as separate visual elements — Fix in `CourseDetailPage.tsx:287, 328`: split into two `<p>` tags: `"Bạn chưa đăng ký khóa học này."` and `"Vui lòng liên hệ giảng viên để được đăng ký khóa học này."` (note: current implementation also truncates the CTA, dropping "khóa học này" at the end).

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

Overall all user-facing copy is Vietnamese. The contract's exact strings are matched for all primary screens.

**✓ Passing:**
- `NotFound.tsx`: "Trang không tìm thấy" ✓, "Về trang chủ" ✓, role-aware redirect ✓
- `StudentLayout.tsx`: "Khóa học của tôi" ✓, "Khám phá khóa học" ✓, `aria-label="Trang chủ BuMath"` ✓
- `CataloguePage.tsx`: "Khám phá khóa học" ✓, "Tất cả các khóa học đang có tại BuMath" ✓, "Đã đăng ký" ✓, "Chưa đăng ký" ✓, "Chưa có khóa học nào" ✓
- `SubmissionsPage.tsx`: "Tất cả lớp" ✓, "Tất cả khóa học" ✓, "Tất cả bài học" ✓, "Hiển thị {N} / {total} bài nộp" ✓, "Không tìm thấy bài nộp nào phù hợp với bộ lọc." ✓
- `CoursesPage.tsx`: "Khám phá tất cả khóa học →" ✓ in empty state

**⚠️ Issues:**

1. **`SubmissionsPage.tsx:161`** — Student filter placeholder reads `"Tìm kiếm học sinh..."` but spec contract (`§ Copywriting Contract → Admin Grading Filters`) declares exact string `"Tìm học sinh..."`. Diverges by 3 characters ("kiếm ").

2. **`CourseDetailPage.tsx:287, 328`** — Preview mode copy is a single string template literal:
   ```
   'Bạn chưa đăng ký khóa học này.\nVui lòng liên hệ giảng viên để được đăng ký.'
   ```
   - `\n` in JSX text content renders as whitespace (not a line break) — the two sentences visually merge
   - CTA text is truncated: spec requires "...để được đăng ký **khóa học này**." — "khóa học này" is missing
   - Spec requires these as two separate `<p>` elements in distinct visual sections (lock notice banner + contact CTA block)

3. **`SubmissionsPage.tsx:63`** — `CommandInput` placeholder `"Tìm..."` is generic. This is the search box inside the combobox dropdown (not user-visible in default state), but still sub-spec.

---

### Pillar 2: Visuals (3/4)

**✓ Passing:**
- All screens have declared primary focal points matching spec
- StudentLayout header has clear visual hierarchy: Logo → Nav → Bell → Logout
- CataloguePage has grade filter pill tabs (bonus feature — improves discoverability beyond spec)
- All interactive elements pair icons with visible text labels (no icon-only buttons)
- Course cards have `hover:shadow-md transition-shadow` ✓
- Preview mode desktop: 2-column layout (sidebar showing lesson list + centred lock card) is visually polished and an improvement over spec's simpler chapter list

**⚠️ Issues:**

1. **`SlidersHorizontal` icon missing from filter bar** — `§ Icons Required` table in UI-SPEC.md lists `SlidersHorizontal` (`h-4 w-4`) for the SubmissionsPage filter bar label/icon visual affordance. The filter bar has no icon label, making it look like a plain content row rather than a filter control group. The implementation uses a custom `SearchableSelect` (Popover+Command combo) instead of the spec'd `<Select>` — this is an upgrade (adds search) but loses the `SlidersHorizontal` indicator.

2. **Preview mode design departs from spec's chapter-list layout** — Spec (`§ Screen 6`) shows: lock banner → chapter accordion → lessons with Lock icons → CTA. Implementation shows: centred Card with large lock icon + combined message (desktop); LessonSidebar has the chapter list (accessible via sidebar/tab). The spec's intent of making the content outline visible in the locked view is partially met (sidebar visible on desktop), but the main content pane doesn't surface lesson titles as specified.

3. **`CataloguePage.tsx` grade filter pills** — Undeclared `rounded-full` pill component added beyond spec. Visually appropriate but unverified in design system.

---

### Pillar 3: Color (3/4)

**✓ Passing:**
- `bg-muted` confirmed on progress track in **both** call sites:
  - `CoursesPage.tsx:135` — `className="h-2 mt-2 bg-muted"` ✓
  - `LessonSidebar.tsx:33` — `className="h-2 bg-muted"` ✓
- No `bg-secondary` remaining on progress components ✓
- Only 1 hardcoded hex found in codebase — `chart.tsx` (shadcn-generated, not Phase 6 code) ✓
- Green enrolled badge: `bg-green-100 text-green-700` matches spec ✓
- Accent usage (84 occurrences across app) is distributed across spec-declared uses (CTAs, logo, active nav, progress fill, bell badge, grade badges)

**⚠️ Issues:**

1. **`BellNotification.tsx:38`** — Hardcoded `bg-red-500` on notification count badge instead of design token `bg-destructive`. `bg-red-500` = `#ef4444` (pure Tailwind red); `bg-destructive` = `hsl(0 84% 60%)` ≈ `#f03030` — similar but not token-compliant. BellNotification is in Phase 6's affected file scope.

2. **`BellNotification.tsx:38`** — `text-[10px]` hardcoded size on badge counter. Should use `text-xs` (12px) at minimum, and ideally a standard token. This is a pre-existing issue surviving Phase 6.

---

### Pillar 4: Typography (2/4)

**Spec declares:** Weight scale = Regular (400) + Semibold (600) only. Weight 500 (Medium) explicitly removed. Weight 700 (Bold) only on 404 number. Type sizes: `text-sm`, `text-xl`, `text-2xl`, `text-4xl`.

**✓ Passing:**
- 404 page: `text-4xl font-bold` ✓ (permitted single-element exception)
- Headings: `text-2xl font-semibold` ✓ (CataloguePage, CoursesPage, CourseDetailPage)
- Section headings: `text-xl font-semibold` ✓
- Body: `text-sm` ✓ widely used
- Logo text: `text-base font-semibold` ✓ (acceptable — `text-base` not in the 4-size page maximum but logo is persistent chrome, not page content)

**⚠️ Issues:**

1. **`font-medium` (weight 500) used after spec removed it — 5 occurrences:**
   - `CataloguePage.tsx:89` — Grade filter buttons: `text-sm font-medium transition-colors`. These are interactive elements — spec says all formerly "medium" interactive elements use 600 Semibold. **Should be `font-semibold`.**
   - `CourseDetailPage.tsx:220, 226, 310, 316` — Tab triggers (Nội dung / Mục lục) use `font-medium`. Pre-existing but untouched during Phase 6 polish.
   - `BellNotification.tsx:64` — Notification title uses `font-medium`. Pre-existing.

2. **`text-lg` (18px) in preview mode** — `CourseDetailPage.tsx:277`: `<h2 className="text-lg font-semibold">` for the course title in the centred lock card. `text-lg` is not in the declared type scale (sm/xl/2xl/4xl). Course titles elsewhere use `text-xl` — this creates inconsistency. **Should be `text-xl`.**

3. **`text-xs` (12px) in BellNotification** — `BellNotification.tsx:67`: `<p className="text-xs text-muted-foreground">` for notification preview text. Spec states: "do not go below 14px for any user-facing copy" (`text-xs` = 12px). Pre-existing issue, not addressed in Phase 6 polish pass.

---

### Pillar 5: Spacing (2/4)

**Spec declares 8-point scale:** 4/8/16/24/32/48/64px. `py-1.5` (6px) explicitly corrected to `py-2` in spec decisions log.

**✓ Passing:**
- Filter bar container: `gap-2` (8px) ✓ (spec decision log: gap-3 → gap-2 applied correctly)
- Nav link padding: `px-3 py-2` ✓ (spec decision log fix applied)
- Page padding: `p-6 md:p-8` ✓ on CataloguePage and CoursesPage
- Header: `h-12` (48px) ✓, `px-4` ✓
- Card padding: `p-4` ✓ throughout

**⚠️ Issues:**

1. **`CataloguePage.tsx:89`** — Grade filter pill buttons use `py-1.5` (6px padding):
   ```
   'rounded-full px-4 py-1.5 text-sm font-medium transition-colors border'
   ```
   6px is not on the 4-point grid (valid values: 4/8/12/16...). The spec decision log entry #2 explicitly documents this exact pattern fix: "Nav link `py-1.5` → `py-2`". The same off-grid value was reintroduced in new undeclared filter buttons. **Fix: `py-1.5` → `py-2`.**

2. **`CourseDetailPage.tsx:272, 322`** — Preview mode Card uses `gap-5` (20px):
   ```
   <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-5">
   ```
   `gap-5` = 20px — not in the declared spacing set {4/8/16/24/32/48/64px}. **Fix: `gap-5` → `gap-4` (16px) or `gap-6` (24px).**

3. **`SubmissionsPage.tsx:118`** — Heading row uses `gap-3` (12px) between h1 and count badge:
   ```
   <div className="flex items-center gap-3 mb-6">
   ```
   12px is off the declared 8-point scale (next valid values: 8px `gap-2` or 16px `gap-4`). While the spec decision log targeted the filter controls specifically, the heading row uses the same off-grid value. Low priority but inconsistent.

4. **`SubmissionsPage.tsx:129`** — Filter bar uses `grid grid-cols-4` instead of spec's `flex flex-wrap`. On narrow screens, 4 fixed columns compress controls below usable width. Spec explicitly declares `flex flex-wrap` for mobile wrapping behaviour.

---

### Pillar 6: Experience Design (3/4)

**✓ Passing:**
- Loading states: 41 occurrences — Skeleton cards on CataloguePage/CoursesPage ✓, Loader2 spinner on SubmissionsPage ✓, composite `isLoading` prevents enrollment mode flash ✓
- Error states: 30 occurrences — `Alert variant="destructive"` on CataloguePage, CoursesPage, CourseDetailPage ✓
- Empty states: 10+ — "Chưa có khóa học nào" ✓, "Không có bài nào chờ chấm." ✓, filter empty state ✓, CoursesPage empty state with catalogue link ✓
- Accessibility: `aria-label` on logo link ✓, filter selects ✓, student input ✓, progress bars ✓, Lock icons `aria-hidden="true"` ✓
- Touch targets: `min-h-[48px]` on all buttons ✓
- Cascading filter logic (course filter disabled until grade selected) — UX improvement beyond spec ✓
- Anon user support on `/catalogue` and `/courses/:slug` — deliberate expansion beyond spec, handled gracefully ✓

**⚠️ Issues:**

1. **`/catalogue` route missing `ProtectedRoute`** — `App.tsx:47`:
   ```tsx
   <Route path="/catalogue" element={<StudentCataloguePage />} />
   ```
   Spec declares `requiredRole="student"`. Implementation intentionally supports anonymous browsing (CataloguePage handles `isAuthenticated` internally). This is a deliberate UX improvement (public course discovery), but it's an undocumented departure from the spec contract. If anonymous support is the intended design, the spec should be updated.

2. **`/courses/:courseSlug` route also lacks `ProtectedRoute`** — `App.tsx:46` — same pattern; CourseDetailPage handles auth state internally. Consistent with CataloguePage approach but both are spec deviations.

3. **`BellNotification.tsx:67`** — `text-xs` (12px) for notification body text — below the 14px minimum for user-facing copy per spec accessibility contract. Pre-existing, not fixed in this polish phase.

4. **Filter bar uses `grid-cols-4` not `flex-wrap`** — On viewports < ~640px, 4 fixed columns compress to ~80px each — filter controls become difficult to use without horizontal scroll.

---

## Registry Safety

No third-party registries declared in UI-SPEC.md. Only shadcn official components used. Registry audit: not required.

---

## Files Audited

| File | Status |
|------|--------|
| `src/pages/NotFound.tsx` | ✓ Audited |
| `src/components/student/StudentLayout.tsx` | ✓ Audited |
| `src/pages/student/CataloguePage.tsx` | ✓ Audited |
| `src/pages/student/CoursesPage.tsx` | ✓ Audited |
| `src/pages/student/CourseDetailPage.tsx` | ✓ Audited |
| `src/pages/admin/SubmissionsPage.tsx` | ✓ Audited |
| `src/components/student/LessonSidebar.tsx` | ✓ Audited (progress fix) |
| `src/components/student/BellNotification.tsx` | ✓ Audited (pre-existing issues) |
| `src/App.tsx` | ✓ Audited (route wiring) |
| `.planning/phases/06-ux-polish/06-UI-SPEC.md` | ✓ Used as baseline |
