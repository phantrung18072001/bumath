# Phase 12 — UI Review

**Audited:** 2026-05-02
**Baseline:** 12-UI-SPEC.md (approved design contract)
**Screenshots:** Not captured (Playwright could not authenticate to localhost:8080 — code-only audit)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | "Chuyên đề" substituted for "chương" throughout ChaptersPage; SubmissionsPage title deviates from spec |
| 2. Visuals | 3/4 | Drag-handle and skeleton patterns correct; Loader2 retained on GradingPage initial load (acceptable) |
| 3. Color | 3/4 | Count badge uses raw `bg-orange-100` (not CSS var); `text-primary` on Loader2 icon |
| 4. Typography | 2/4 | `text-base` (16px) and `font-medium` (500) used despite spec declaring 3 sizes / 2 weights only |
| 5. Spacing | 3/4 | One `min-h-[40px]` violation on "Thêm ảnh phản hồi" button; `pb-24` missing from GradingPage mobile image area |
| 6. Experience Design | 3/4 | 3 list pages (Submissions, Chapters, Lessons) missing `isError` fetch-failure UI |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **Missing fetch error states on SubmissionsPage, ChaptersPage, LessonsPage** — Network failure silently shows an empty table with no feedback; users cannot distinguish "no data" from a broken connection — Add `isError` destructuring from `useQuery` and render a `<p className="text-destructive">Không thể tải dữ liệu. Vui lòng thử lại.</p>` block before the empty-state branch on all three pages.

2. **Typography contract breaches: `text-base` + `font-medium` outside declared 3-size / 2-weight spec** — Empty-state headlines in CoursesPage/UsersPage render at 16px (spec max is 20px headings / 14px body); index-number cells in ChaptersPage/LessonsPage and course-title cells in CoursesPage use weight 500 (spec allows only 400 and 600) — Replace `text-base font-semibold` empty-state headings with `text-sm font-semibold`; replace `font-medium` in index/title cells with `font-semibold` or `font-normal` per hierarchy intent.

3. **GradingPage "Thêm ảnh phản hồi" button `min-h-[40px]`** — Violates mandatory D-13 touch-target rule (`min-h-[48px]` on all row action buttons); on mobile this button is below the accessible 48px threshold — Change `GradingPage.tsx:276` from `className="min-h-[40px]"` to `className="min-h-[48px]"`.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Passing:**
- Status filter copy fully matches spec: "Tất cả trạng thái" / "Chưa chấm" / "Đã chấm" (`SubmissionsPage.tsx:167-169`) ✓
- GradingPage CTAs match: "Lưu điểm", "Xác nhận", "Hủy" (`GradingPage.tsx:289, 303, 308`) ✓
- LessonsPage add button: "+ Thêm bài học" (`LessonsPage.tsx:279`) ✓
- Empty state for filtered submissions: "Không có kết quả cho bộ lọc này." / "Không có bài nộp nào." (`SubmissionsPage.tsx:222`) ✓
- Loading aria-label: "Đang tải..." on all skeleton wrappers ✓
- Score badge ungraded label: "Chưa chấm" (`SubmissionsPage.tsx:258`) ✓
- Error toast messages are specific and actionable ("Vui lòng thử lại.") ✓

**Deviations:**

| Element | Spec | Actual | File:Line |
|---------|------|--------|-----------|
| SubmissionsPage page title | "Bài nộp" | "Chấm bài" | `SubmissionsPage.tsx:151` |
| ChaptersPage add button | "+ Thêm chương" | "Thêm chuyên đề" | `ChaptersPage.tsx:228` |
| ChaptersPage empty state | "Chưa có chương nào. Thêm chương đầu tiên." | "Chưa có chuyên đề nào. Nhấn 'Thêm chuyên đề' để bắt đầu." | `ChaptersPage.tsx:246` |
| Delete dialog title | "Xóa {entity}?" (with `?`) | "Xóa chuyên đề" (no `?`) | `ChaptersPage.tsx:297` |
| Error state (fetch fail) | "Không thể tải dữ liệu. Vui lòng thử lại." | No inline error state on list pages | `SubmissionsPage.tsx`, `ChaptersPage.tsx`, `LessonsPage.tsx` |

> **Note on "chuyên đề":** The domain substitution of "chuyên đề" for "chương" is systematic and likely intentional per product decisions. If this is an accepted change it should be reflected in the UI-SPEC. The headline deviation (SubmissionsPage: "Chấm bài" vs spec "Bài nộp") is more jarring — a user looking at the page title sees different language than the nav link.

---

### Pillar 2: Visuals (3/4)

**Passing:**
- No Claymorphism classes (`bm-clay-card`, `bm-float-symbol`, `--bm-*`) present — clean admin theme ✓
- Drag handle column: first column, `GripVertical h-4 w-4 text-muted-foreground`, `aria-label="Kéo để sắp xếp"`, `cursor-grab active:cursor-grabbing` (`ChaptersPage.tsx:80-87`, `LessonsPage.tsx:86-93`) ✓
- Row opacity during drag: `opacity: isDragging ? 0.5 : 1` on both SortableRow components ✓
- Skeleton loading matches spec D-10: 5× `<Skeleton className="h-10 w-full rounded-md" />` in `<div className="space-y-2">` ✓
- Visual hierarchy: `text-xl font-semibold` page titles, `text-muted-foreground` secondary text ✓
- Breadcrumbs on ChaptersPage and LessonsPage provide navigation context ✓
- Filter toolbar has `bg-muted/50 rounded-lg border` containment in SubmissionsPage ✓

**Issues:**
- GradingPage initial loading renders a centered `<Loader2>` spinner instead of a skeleton layout — UI-SPEC D-10 applies to SubmissionsPage/ChaptersPage/LessonsPage, so this is within contract for GradingPage. However it creates a noticeable inconsistency when navigating between pages.
- Mobile GradingPage: the sticky bar has no visual "peek" preview of the comment textarea — users won't know feedback is available on mobile unless they scroll. The spec layout shows only score+save in the sticky bar, which is correctly implemented, but the desktop form contains a comment field that has no mobile equivalent (only a spacer). Low-impact as grading is a desktop-primary action.

---

### Pillar 3: Color (3/4)

**Passing:**
- Score badge: `bg-teal-100 text-teal-800 border-0` (`SubmissionsPage.tsx:254`) — exact spec match ✓
- No hardcoded hex (`#RRGGBB`) or `rgb()` values in any admin page ✓
- No `--bm-*` variable references ✓
- Destructive buttons use `bg-destructive text-destructive-foreground` tokens ✓
- Confirm button uses default `<Button>` which resolves to `bg-primary` ✓

**Issues:**

| Issue | File:Line | Spec Rule |
|-------|-----------|-----------|
| Count badge `bg-orange-100 text-orange-700` — raw Tailwind orange, not `hsl(var(--primary))` CSS variable | `SubmissionsPage.tsx:153` | Accent reserved for primary action buttons; if decorative badge uses orange, should use `bg-orange-100` pattern consistently with teal badge (which also uses raw Tailwind) — acceptable if intentional, but bypasses the CSS variable system |
| `text-primary` on `Loader2` spinner icon | `GradingPage.tsx:122` | Spec: accent "NOT for icons" — loading spinner shouldn't use primary color; `text-muted-foreground` would be more neutral |

> The count badge `bg-orange-100 text-orange-700` is a mild deviation — the spec says accent is for primary CTAs, but using it on an informational count badge is a common UX pattern. Teal for score and orange for count does create a consistent secondary badge language. A cleaner approach would be `bg-muted text-muted-foreground` for the count badge to preserve the "orange = action" signal.

---

### Pillar 4: Typography (2/4)

**Spec contract:** 3 sizes only (13px/text-xs, 14px/text-sm, 20px/text-xl), 2 weights only (400/normal, 600/semibold).

**Actual usage distribution:**

| Class | Count | Spec status |
|-------|-------|-------------|
| `text-sm` | 19 | ✓ declared (14px body) |
| `text-xl` | 6 | ✓ declared (20px heading) |
| `text-xs` | 4 | ✓ declared (13px score/badge) |
| `text-base` | 4 | ✗ undeclared (16px — between body and heading) |
| `font-semibold` | 15 | ✓ declared (600) |
| `font-normal` | 1 | ✓ declared (400) |
| `font-medium` | 3 | ✗ undeclared (500) |
| `font-mono` | 1 | ✗ undeclared (monospace stack on score badge) |

**`text-base` violations (16px) — spec allows 13/14/20px only:**
- `CoursesPage.tsx:189, 198` — empty state headline "Chưa có khóa học nào" / "Không tìm thấy kết quả"
- `UsersPage.tsx:186, 191` — empty state headline "Chưa có tài khoản nào" / "Không tìm thấy kết quả"

**`font-medium` violations (500) — spec allows 400/600 only:**
- `ChaptersPage.tsx:89` — index number cell `<TableCell className="font-medium w-16">`
- `LessonsPage.tsx:95` — index number cell `<TableCell className="font-medium w-16">`
- `CoursesPage.tsx:221` — course title cell `<TableCell className="font-medium">`

**`font-mono` violation:**
- `SubmissionsPage.tsx:254` — score badge `font-mono` — not in spec typography table; visually reasonable for number alignment but undeclared

**Line height:**
- `leading-[1.3]` is used 5 times on h1 elements — spec declares heading line-height as 1.2 (a minor rounding difference but technically deviates from the literal spec value)

---

### Pillar 5: Spacing (3/4)

**Passing:**
- min-h-[48px] found 19 times across all row action buttons ✓ (D-13 substantially met)
- Filter toolbar padding: `p-4` (16px = md token) ✓
- Mobile sticky bar: `p-4` ✓
- Page wrapper: `px-4 py-8` on all pages ✓
- Section headings: `mb-6` spacing ✓
- `overflow-x-auto` on table wrappers ✓

**Issues:**

| Issue | File:Line | Rule |
|-------|-----------|------|
| `min-h-[40px]` on "Thêm ảnh phản hồi" button — fails D-13 40px < 48px | `GradingPage.tsx:276` | D-13: `min-h-[48px]` on all row action buttons (mandatory) |
| Missing `overflow-y-auto` + `pb-24` on GradingPage mobile image area — spec requires both to prevent sticky bar overlap | `GradingPage.tsx:159-200` | UI-SPEC: "Scrollable image area: overflow-y-auto with pb-24" |

> The `h-32 lg:hidden` spacer div at line 371 provides functional content padding but the spec explicitly requires `pb-24` on the image container and `overflow-y-auto` for scroll isolation — without `overflow-y-auto` on the image container, the entire page scrolls rather than the image area independently (important if image is very tall).

**Arbitrary width values** (`w-[180px]`, `w-[150px]`, `w-[200px]` for filter widths) — not a spacing violation; arbitrary widths for UI controls are standard practice and consistent with Phase 11 patterns.

---

### Pillar 6: Experience Design (3/4)

**Passing:**
- Skeleton loading on all 3 list pages (`SubmissionsPage`, `ChaptersPage`, `LessonsPage`) — 5× rows, `aria-busy="true" aria-label="Đang tải..."` ✓ (D-10)
- `CoursesPage` and `UsersPage` also have skeleton loading ✓
- All 6 pages have empty state handling with contextual copy ✓
- Mutation disabled states: delete button disabled while `deleteMutation.isPending` ✓
- Grading form disabled while `saving || uploadingImages` ✓
- Filter cascade: course disabled when grade='all', lesson disabled when course='all' ✓
- Optimistic drag reorder with query invalidation on error ✓
- Double-confirm flow mirrors between desktop and mobile GradingPage ✓
- AlertDialog for destructive deletes on ChaptersPage, LessonsPage, CoursesPage ✓
- All icon-only buttons have `aria-label` ✓
- Toast feedback on all mutations (success and error) ✓
- GradingPage error state: inline `text-destructive` paragraph + back link ✓

**Issues:**

| Issue | Pages | Impact |
|-------|-------|--------|
| No `isError` check on main list queries | `SubmissionsPage.tsx`, `ChaptersPage.tsx`, `LessonsPage.tsx` | Supabase/network failure renders empty table silently; user cannot distinguish 0 results from fetch failure |
| GradingPage Loader2 loading container has no `aria-label` | `GradingPage.tsx:119-125` | Screen readers get no feedback during load (low impact — full-page load is short-lived) |
| `prefers-reduced-motion` for dnd-kit — spec accessibility checklist item | `ChaptersPage.tsx`, `LessonsPage.tsx` | Animated drag on reduced-motion OS setting may cause discomfort; dnd-kit supports this via `modifiers` or CSS |

**Fix pattern for missing isError (SubmissionsPage example):**
```tsx
const { data, isLoading, isError } = useQuery({ ... })

// In JSX, before skeleton/table branch:
{isError ? (
  <p className="text-destructive py-8 text-center">
    Không thể tải dữ liệu. Vui lòng thử lại.
  </p>
) : isLoading ? (
  <div aria-busy="true" aria-label="Đang tải..."> ... </div>
) : submissions.length === 0 ? (
  ...
) : ( ... )}
```

---

## Registry Safety

Registry audit: 0 third-party shadcn registry blocks declared in UI-SPEC. `@dnd-kit/core` and `@dnd-kit/sortable` are npm packages (not shadcn registry blocks) — no registry vetting required. Audit skipped per protocol.

---

## Files Audited

| File | Lines | Audit Coverage |
|------|-------|----------------|
| `src/pages/admin/SubmissionsPage.tsx` | 317 | Full |
| `src/pages/admin/GradingPage.tsx` | 375 | Full |
| `src/pages/admin/ChaptersPage.tsx` | 321 | Full |
| `src/pages/admin/LessonsPage.tsx` | ~380 | Full |
| `src/pages/admin/UsersPage.tsx` | ~254 | Sections 140–253 |
| `src/pages/admin/CoursesPage.tsx` | ~380 | Sections 140–220 |
| `.planning/phases/12-admin-detail-pages/12-UI-SPEC.md` | 248 | Full |
| `.planning/phases/12-admin-detail-pages/12-CONTEXT.md` | 146 | Full |

*Grep scans covered all `.tsx` files under `src/pages/admin/` for copywriting, color, typography, spacing, and experience pattern audits.*
