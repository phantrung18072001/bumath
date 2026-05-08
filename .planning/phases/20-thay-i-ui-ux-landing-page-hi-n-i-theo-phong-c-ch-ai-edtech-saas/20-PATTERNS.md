# Phase 20: Student + Admin UI/UX — AI EdTech SaaS Design Language - Pattern Map

**Mapped:** 2026-05-08
**Files analyzed:** 13 (1 CSS + 5 student + 2 student components + 5 admin)
**Analogs found:** 13 / 13 (all are existing files being modified — patterns extracted directly from BEFORE state)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/index.css` | config/CSS | — | self (current `:root` block) | exact |
| `src/components/student/StudentLayout.tsx` | layout | request-response | `src/components/admin/AdminLayout.tsx` | role-match |
| `src/components/student/LessonSidebar.tsx` | component | event-driven | `src/components/admin/AdminLayout.tsx` (nav active) | role-match |
| `src/pages/student/CoursesPage.tsx` | page | CRUD | `src/pages/student/CataloguePage.tsx` | exact |
| `src/pages/student/CataloguePage.tsx` | page | CRUD + search | `src/pages/student/CoursesPage.tsx` | exact |
| `src/pages/student/CourseDetailPage.tsx` | page | complex/event-driven | `src/components/student/LessonSidebar.tsx` | role-match |
| `src/pages/student/ProfilePage.tsx` | page | CRUD | `src/pages/student/CoursesPage.tsx` | exact |
| `src/components/admin/AdminLayout.tsx` | layout | request-response | `src/components/student/StudentLayout.tsx` | role-match |
| `src/pages/admin/CoursesPage.tsx` | page | CRUD | `src/pages/admin/PackagesPage.tsx` | exact |
| `src/pages/admin/UsersPage.tsx` | page | CRUD | `src/pages/admin/CoursesPage.tsx` | exact |
| `src/pages/admin/GradingPage.tsx` | page | request-response | `src/pages/admin/SubmissionsPage.tsx` | role-match |
| `src/pages/admin/SubmissionsPage.tsx` | page | CRUD | `src/pages/admin/CoursesPage.tsx` | role-match |
| `src/pages/admin/PackagesPage.tsx` | page | CRUD | `src/pages/admin/CoursesPage.tsx` | exact |

---

## Pattern Assignments

### `src/index.css` (config, CSS custom properties)

**What to change:** `:root` CSS variables + CSS class definitions

**BEFORE — `:root` block (lines 160–209):**
```css
/* Primary = orange */
--primary: 24 95% 53%;           /* #F97316 */
--primary-foreground: 0 0% 100%;
--ring: 24 95% 53%;

--secondary: 200 80% 50%;        /* teal */

--sidebar-primary: 24 95% 53%;
--sidebar-ring: 24 95% 53%;

/* BuMath Design System v2 */
--bm-primary: #F97316;
--bm-secondary: #FB923C;
--bm-cta: #F97316;
--bm-border: #F97316;
```

**AFTER — `:root` block (replace those vars only):**
```css
/* Primary = indigo */
--primary: 245 94% 58%;           /* #4F46E5 */
--primary-foreground: 0 0% 100%;
--ring: 245 94% 58%;

--secondary: 270 67% 47%;         /* #7C3AED purple */

--sidebar-primary: 245 94% 58%;
--sidebar-ring: 245 94% 58%;

/* BuMath Design System v2 */
--bm-primary: #4F46E5;
--bm-secondary: #7C3AED;
--bm-cta: #4F46E5;
--bm-border: #4F46E5;
```

**BEFORE — `.bm-clay-card-student` (lines 19–44):**
```css
.bm-clay-card-student {
  background: #FFFFFF;
  border: 1px solid rgba(249, 115, 22, 0.25);   /* orange tint */
  border-radius: 16px;
  box-shadow:
    0 2px 8px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.06);
  transition: box-shadow 200ms ease, transform 200ms ease;
  cursor: pointer;
}
.bm-clay-card-student:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 16px rgba(249, 115, 22, 0.15),
    0 2px 6px rgba(0, 0, 0, 0.08);
}
```

**AFTER — add `.bm-glass-card` class (insert after `.bm-clay-card-student` block):**
```css
/* === BuMath Glassmorphism Card (Phase 20) === */
.bm-glass-card {
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.30);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(79, 70, 229, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 200ms ease, transform 200ms ease;
  cursor: pointer;
}
.bm-glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(79, 70, 229, 0.14), 0 4px 12px rgba(0, 0, 0, 0.08);
}
@media (prefers-reduced-motion: reduce) {
  .bm-glass-card { transition: none; }
  .bm-glass-card:hover { transform: none; }
}
```

**BEFORE — `.bm-progress-teal` (lines 47–50):**
```css
.bm-progress-teal [data-slot="progress-indicator"],
.bm-progress-teal > div {
  background-color: #F97316 !important;
}
```

**AFTER — add `.bm-progress-indigo` class (keep `.bm-progress-teal` for backwards compat):**
```css
/* === BuMath Indigo Progress Bar Override (Phase 20) === */
.bm-progress-indigo [data-slot="progress-indicator"],
.bm-progress-indigo > div {
  background-color: #4F46E5 !important;
}
```

**BEFORE — `.bm-float-symbol-light` color (line 78):**
```css
color: #F97316;
```

**AFTER:**
```css
color: #4F46E5;
```

**BEFORE — `.bm-btn-cta` (lines 139–157):**
```css
.bm-btn-cta {
  background: var(--bm-cta) !important;   /* resolves to #F97316 */
  ...
}
```
After `--bm-cta` is updated in `:root`, `.bm-btn-cta` resolves to `#4F46E5` automatically — **no structural change needed**.

---

### `src/components/student/StudentLayout.tsx` (layout, request-response)

**Analog:** `src/components/admin/AdminLayout.tsx`

**BEFORE — Root wrapper div (line 21):**
```tsx
<div className="h-screen overflow-hidden flex flex-col bg-white relative isolate">
```

**AFTER:**
```tsx
<div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/20 relative isolate">
```

**BEFORE — NavLink active state (lines 71–73, 80–82, 91–93, 102–104):**
```tsx
className={({ isActive }) =>
  `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
    isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
  }`
}
```
✅ **No change needed** — `text-primary` already uses CSS var `--primary`. After `:root` update, active links auto-resolve to indigo.

**BEFORE — Header bar (line 54):**
```tsx
<header className="h-20 bg-card border-b border-border flex items-center px-6 sticky top-0 z-10">
```

**AFTER (glassmorphism header):**
```tsx
<header className="h-20 bg-white/80 backdrop-blur-sm border-b border-white/30 flex items-center px-6 sticky top-0 z-10">
```

---

### `src/components/student/LessonSidebar.tsx` (component, event-driven)

**Analog:** `src/components/admin/AdminLayout.tsx` (sidebar active pattern)

**BEFORE — Lesson button active state (lines 148–151 and 296–299):**
```tsx
className={cn(
  'flex items-center gap-2 flex-1 min-w-0 px-2 py-2 text-left text-sm hover:bg-sidebar-accent transition-colors rounded-md cursor-pointer',
  activeLessonId === lesson.id && 'bg-sidebar-accent border-l-2 border-primary',
)}
```
✅ **No change needed** — `border-primary` auto-updates via CSS var. Keep as-is.

**BEFORE — Progress bar (line 333):**
```tsx
<Progress
  value={progress}
  className="h-2 bg-[#FFEDD5] bm-progress-teal"
  aria-label={`Tiến độ hoàn thành: ${progress}%`}
/>
```

**AFTER:**
```tsx
<Progress
  value={progress}
  className="h-2 bg-indigo-100 bm-progress-indigo"
  aria-label={`Tiến độ hoàn thành: ${progress}%`}
/>
```

**BEFORE — Progress section border (line 331):**
```tsx
<div className="px-4 py-4 border-b border-[#F97316]/20 shrink-0">
```

**AFTER:**
```tsx
<div className="px-4 py-4 border-b border-indigo-200/30 shrink-0">
```

**BEFORE — Chapter item border (line 77):**
```tsx
className={cn('w-full border-0 border-b border-[#F97316]/15 last:border-b-0', ...)}
```

**AFTER:**
```tsx
className={cn('w-full border-0 border-b border-indigo-200/20 last:border-b-0', ...)}
```

**BEFORE — Add lesson button (line 176):**
```tsx
className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-dashed border-[#F97316]/40 text-xs font-medium text-[#92400E]/50 hover:text-[#92400E] hover:border-[#F97316]/70 hover:bg-[#FFF7ED] transition-all duration-200 cursor-pointer group/add"
```

**AFTER:**
```tsx
className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-dashed border-indigo-300/40 text-xs font-medium text-indigo-400/60 hover:text-indigo-600 hover:border-indigo-400/70 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer group/add"
```

**BEFORE — Add chapter button (lines 351–356):**
```tsx
<Button
  type="button"
  variant="outline"
  className="w-full min-h-[44px] gap-1.5 border-[#F97316]/40 text-[#92400E] hover:bg-[#FFEDD5]/50 cursor-pointer"
  onClick={onAddChapter}
>
```

**AFTER:**
```tsx
<Button
  type="button"
  variant="outline"
  className="w-full min-h-[44px] gap-1.5 border-indigo-300/50 text-indigo-600 hover:bg-indigo-50/60 cursor-pointer"
  onClick={onAddChapter}
>
```

**BEFORE — Add chapter container border (line 349):**
```tsx
<div className="px-3 py-3 border-t border-[#F97316]/20">
```

**AFTER:**
```tsx
<div className="px-3 py-3 border-t border-indigo-200/30">
```

---

### `src/pages/student/CoursesPage.tsx` (page, CRUD)

**Analog:** `src/pages/student/CataloguePage.tsx` (same card + badge pattern)

**BEFORE — Page heading (line 71):**
```tsx
<h1 className="text-2xl font-bold mb-4 text-[#92400E]">Khóa học của tôi</h1>
```

**AFTER:**
```tsx
<h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
  Khóa học của tôi
</h1>
```

**BEFORE — Empty state icon (line 92):**
```tsx
<BookOpen className="h-16 w-16 text-[#F97316]" aria-hidden="true" />
```

**AFTER:**
```tsx
<BookOpen className="h-16 w-16 text-indigo-400" aria-hidden="true" />
```

**BEFORE — Empty state h2 (line 93):**
```tsx
<h2 className="text-xl font-bold text-[#92400E]">Bạn chưa có khóa học nào</h2>
```

**AFTER:**
```tsx
<h2 className="text-xl font-bold text-slate-800">Bạn chưa có khóa học nào</h2>
```

**BEFORE — Course Card (line 121):**
```tsx
<Card className="bm-clay-card-student border-0 shadow-none p-0 overflow-hidden h-full min-h-[200px] flex flex-col">
```

**AFTER:**
```tsx
<Card className="bm-glass-card border-0 shadow-none p-0 overflow-hidden h-full min-h-[200px] flex flex-col">
```

**BEFORE — Card title (line 123):**
```tsx
<CardTitle className="text-base font-bold leading-snug text-[#92400E] mb-2">
```

**AFTER:**
```tsx
<CardTitle className="text-base font-bold leading-snug text-slate-800 mb-2">
```

**BEFORE — Progress bar (line 140–143):**
```tsx
<Progress
  value={progress}
  className="h-1.5 bg-[#FFEDD5] bm-progress-teal"
  aria-label={`Tiến độ hoàn thành: ${progress}%`}
/>
```

**AFTER:**
```tsx
<Progress
  value={progress}
  className="h-1.5 bg-indigo-100 bm-progress-indigo"
  aria-label={`Tiến độ hoàn thành: ${progress}%`}
/>
```

---

### `src/pages/student/CataloguePage.tsx` (page, CRUD + search)

**Analog:** `src/pages/student/CoursesPage.tsx` (same card pattern)

**BEFORE — Page heading (line 91):**
```tsx
<h1 className="text-2xl font-bold text-[#92400E]">Khám phá khóa học</h1>
```

**AFTER:**
```tsx
<h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
  Khám phá khóa học
</h1>
```

**BEFORE — Search input (line 114):**
```tsx
className="pl-9 min-h-[48px] rounded-xl border-[#F97316] focus-visible:ring-[#F97316]"
```

**AFTER:**
```tsx
className="pl-9 min-h-[48px] rounded-xl border-indigo-300 focus-visible:ring-indigo-500"
```

**BEFORE — Grade filter active pill (lines 126–129):**
```tsx
activeGrade === f.value
  ? 'bg-[#F97316] text-white border-[#F97316]'
  : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground',
```

**AFTER:**
```tsx
activeGrade === f.value
  ? 'bg-indigo-600 text-white border-indigo-600'
  : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground',
```

**BEFORE — Empty state icons (lines 156, 167):**
```tsx
<Search className="h-16 w-16 text-[#F97316]" aria-hidden="true" />
<BookOpen className="h-16 w-16 text-[#F97316]" aria-hidden="true" />
```

**AFTER:**
```tsx
<Search className="h-16 w-16 text-indigo-400" aria-hidden="true" />
<BookOpen className="h-16 w-16 text-indigo-400" aria-hidden="true" />
```

**BEFORE — Empty state h2 (lines 157, 168):**
```tsx
<h2 className="text-xl font-bold text-[#92400E]">...</h2>
```

**AFTER:**
```tsx
<h2 className="text-xl font-bold text-slate-800">...</h2>
```

**BEFORE — Course card (line 188):**
```tsx
<Card className="bm-clay-card-student border-0 shadow-none p-0 h-full min-h-[200px] overflow-hidden flex flex-col">
```

**AFTER:**
```tsx
<Card className="bm-glass-card border-0 shadow-none p-0 h-full min-h-[200px] overflow-hidden flex flex-col">
```

**BEFORE — Card title (line 190):**
```tsx
<CardTitle className="text-base font-bold leading-snug text-[#92400E] mb-2">
```

**AFTER:**
```tsx
<CardTitle className="text-base font-bold leading-snug text-slate-800 mb-2">
```

---

### `src/pages/student/CourseDetailPage.tsx` (page, event-driven)

**Analog:** `src/components/student/LessonSidebar.tsx` (sidebar border pattern)

**BEFORE — Sidebar panel (line 508):**
```tsx
<div className="w-[420px] shrink-0 bg-white border-r border-[#F97316]/20 flex flex-col h-full">
```

**AFTER:**
```tsx
<div className="w-[420px] shrink-0 bg-white/80 backdrop-blur-sm border-r border-white/30 flex flex-col h-full">
```

**BEFORE — Content area (line 516):**
```tsx
<div className="flex-1 overflow-y-auto bg-white">
```

**AFTER:**
```tsx
<div className="flex-1 overflow-y-auto bg-white/60">
```

**BEFORE — Mobile menu button (line 587):**
```tsx
className="min-h-[48px] gap-2 border-[#F97316] text-[#F97316] hover:bg-[#F3F0ED] cursor-pointer"
```

**AFTER:**
```tsx
className="min-h-[48px] gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
```

**BEFORE — Mobile content area (line 595):**
```tsx
<div className="flex-1 overflow-y-auto bg-white">
```

**AFTER:**
```tsx
<div className="flex-1 overflow-y-auto bg-white/60">
```

---

### `src/pages/student/ProfilePage.tsx` (page, CRUD)

**Analog:** `src/pages/student/CoursesPage.tsx` (same card pattern)

**BEFORE — Profile Card (line 95):**
```tsx
<Card className="bm-clay-card-student">
```

**AFTER:**
```tsx
<Card className="bm-glass-card">
```

**BEFORE — PackageCard wrapper div (line 26):**
```tsx
<div className="bm-clay-card-student p-4 flex flex-col gap-2 transition-shadow duration-200 hover:shadow-lg">
```

**AFTER:**
```tsx
<div className="bm-glass-card p-4 flex flex-col gap-2">
```

**BEFORE — Empty packages card (line 159):**
```tsx
<Card className="bm-clay-card-student">
```

**AFTER:**
```tsx
<Card className="bm-glass-card">
```

---

### `src/components/admin/AdminLayout.tsx` (layout, request-response)

**Analog:** `src/components/student/StudentLayout.tsx`

**BEFORE — Root wrapper (line 30):**
```tsx
<div className={cn('flex', fullBleed ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-[calc(100vh-80px)]')}>
```

**AFTER (add gradient background):**
```tsx
<div className={cn(
  'flex bg-gradient-to-br from-primary/5 via-background to-secondary/20',
  fullBleed ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-[calc(100vh-80px)]'
)}>
```

**BEFORE — Sidebar aside (line 33):**
```tsx
<aside className="w-60 shrink-0 border-r bg-card overflow-y-auto">
```

**AFTER (glassmorphism sidebar):**
```tsx
<aside className="w-60 shrink-0 border-r border-white/30 bg-white/80 backdrop-blur-sm overflow-y-auto">
```

**BEFORE — Active nav link (lines 41–46):**
```tsx
active
  ? 'bg-primary text-primary-foreground'
  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
```
✅ **No change needed** — `bg-primary` auto-updates to indigo via CSS var.

---

### `src/pages/admin/CoursesPage.tsx` (page, CRUD)

**Analog:** `src/pages/admin/PackagesPage.tsx` (same table structure)

**BEFORE — Page root (line 140):**
```tsx
<div className="container mx-auto px-4 py-8">
```
✅ **No change needed** — background comes from AdminLayout wrapper.

**No hardcoded orange/teal colors found.** This page uses `text-primary` and `text-muted-foreground` CSS vars only, which auto-update. Only Badge variants may need review per D-13.

---

### `src/pages/admin/UsersPage.tsx` (page, CRUD)

**Analog:** `src/pages/admin/CoursesPage.tsx`

**Badges already correct:**
```tsx
// RoleBadge (lines 42–49):
<Badge className="bg-purple-600 hover:bg-purple-600 text-white">Admin</Badge>   // keep
<Badge className="bg-blue-600 hover:bg-blue-600 text-white">Giảng viên</Badge>  // keep
<Badge variant="secondary">Học sinh</Badge>                                       // keep
```
✅ Role badges use semantic purple/blue — no change needed per D-13.

**No hardcoded orange/teal found in this file.**

---

### `src/pages/admin/GradingPage.tsx` (page, request-response)

**Analog:** `src/pages/admin/SubmissionsPage.tsx`

**BEFORE — Page root (line 143):**
```tsx
<div className="container mx-auto py-8 max-w-6xl px-4">
```
✅ **No change needed** — background from AdminLayout.

**No hardcoded orange/teal colors found.** This file uses only `text-muted-foreground`, `border`, `bg-muted` tokens — clean already.

---

### `src/pages/admin/SubmissionsPage.tsx` (page, CRUD)

**Analog:** `src/pages/admin/CoursesPage.tsx`

**BEFORE — Page root (line 149):**
```tsx
<div className="container mx-auto px-4 py-8">
```
✅ **No change needed** — background from AdminLayout.

**BEFORE — Filter bar (line 160):**
```tsx
<div className="flex flex-wrap gap-2 mb-6 p-4 bg-muted/50 rounded-lg border border-border">
```

**AFTER (softer glassmorphism filter bar):**
```tsx
<div className="flex flex-wrap gap-2 mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
```

**No other hardcoded orange/teal colors found.**

---

### `src/pages/admin/PackagesPage.tsx` (page, CRUD)

**Analog:** `src/pages/admin/CoursesPage.tsx`

**BEFORE — `advanced` grade badge (lines 44–49):**
```tsx
const GRADE_BADGE: Record<GradeValue, { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}
```

**AFTER — `advanced` badge migrates to indigo (D-13: replace orange/teal badges):**
```tsx
const GRADE_BADGE: Record<GradeValue, { label: string; className: string }> = {
  grade_7:  { label: 'Lớp 7',     className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8:  { label: 'Lớp 8',     className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9:  { label: 'Lớp 9',     className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
}
```

> **Note:** The same `GRADE_BADGE` pattern in `src/lib/constants/grades.ts` (shared import used by admin/CoursesPage, student pages) should be updated at source. Check `src/lib/constants/grades.ts` and update the `advanced` entry there rather than in individual page files.

---

## Shared Patterns

### Pattern 1: `.bm-glass-card` replacement
**Source:** `src/index.css` (new class to add)
**Apply to:** All occurrences of `bm-clay-card-student` in JSX — student pages only

| File | Line(s) | BEFORE | AFTER |
|------|---------|--------|-------|
| `CoursesPage.tsx` | 121 | `bm-clay-card-student border-0 shadow-none p-0 overflow-hidden h-full min-h-[200px] flex flex-col` | `bm-glass-card border-0 shadow-none p-0 overflow-hidden h-full min-h-[200px] flex flex-col` |
| `CataloguePage.tsx` | 188 | `bm-clay-card-student border-0 shadow-none p-0 h-full min-h-[200px] overflow-hidden flex flex-col` | `bm-glass-card border-0 shadow-none p-0 h-full min-h-[200px] overflow-hidden flex flex-col` |
| `ProfilePage.tsx` | 95, 159 | `bm-clay-card-student` | `bm-glass-card` |
| `ProfilePage.tsx` | 26 | `bm-clay-card-student p-4 flex flex-col gap-2 transition-shadow duration-200 hover:shadow-lg` | `bm-glass-card p-4 flex flex-col gap-2` |

### Pattern 2: Hardcoded orange → indigo color migration
**Source:** All student + sidebar files
**Apply to:** Every occurrence of `#F97316`, `#92400E`, `#FFEDD5`, `#FFF7ED`, `#F3F0ED`

| BEFORE token | AFTER token | Semantic meaning |
|---|---|---|
| `text-[#92400E]` | `text-slate-800` | Dark heading text |
| `text-[#F97316]` | `text-indigo-400` (icons) / `text-indigo-600` (interactive) | Orange accent |
| `bg-[#F97316]` | `bg-indigo-600` | Solid fill active state |
| `border-[#F97316]` | `border-indigo-300` | Border accent |
| `border-[#F97316]/20` | `border-indigo-200/30` | Faint border |
| `border-[#F97316]/40` | `border-indigo-300/40` | Medium border |
| `bg-[#FFEDD5]` | `bg-indigo-100` | Progress track background |
| `bg-[#FFF7ED]` | `bg-indigo-50/50` | Hover bg for dashed add buttons |
| `hover:bg-[#FFEDD5]/50` | `hover:bg-indigo-50/60` | Button hover bg |
| `focus-visible:ring-[#F97316]` | `focus-visible:ring-indigo-500` | Input focus ring |

### Pattern 3: Background gradient — layout wrappers only
**Source:** `src/pages/auth/LoginPage.tsx` (reference) and UI-SPEC §Background Rule
**Apply to:** `StudentLayout` root div, `AdminLayout` root div

```tsx
// Target class (add to both layout root divs):
bg-gradient-to-br from-primary/5 via-background to-secondary/20
```

After CSS var update, this resolves to:
- `from-indigo-600/5` (subtle indigo wash)
- `via-white` (background)
- `to-purple-600/20` (soft purple gradient endpoint)

### Pattern 4: `.bm-progress-teal` → `.bm-progress-indigo`
**Source:** `src/index.css` new class
**Apply to:**

| File | Line | BEFORE | AFTER |
|------|------|--------|-------|
| `CoursesPage.tsx` | 141 | `bg-[#FFEDD5] bm-progress-teal` | `bg-indigo-100 bm-progress-indigo` |
| `LessonSidebar.tsx` | 333 | `bg-[#FFEDD5] bm-progress-teal` | `bg-indigo-100 bm-progress-indigo` |

### Pattern 5: Card title text color migration
**Source:** All student pages
**Pattern:** `text-[#92400E]` → `text-slate-800` on card titles and page h1/h2

Exception: Page-level `<h1>` gets gradient text:
```tsx
// h1 on CoursesPage and CataloguePage only:
className="... bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
```

### Pattern 6: Glassmorphism sidebar/panel surfaces
**Source:** LoginPage glass pattern (reference); applied consistently

```tsx
// Sidebar panels (LessonSidebar container in CourseDetailPage, AdminLayout aside):
bg-white/80 backdrop-blur-sm border border-white/30
```

### Pattern 7: `advanced` grade badge orange → indigo
**Source:** `src/pages/admin/PackagesPage.tsx` line 48 (and `src/lib/constants/grades.ts` if it's the shared constant)
**Apply to:** Any file with local `GRADE_BADGE` that has `advanced: bg-orange-100 text-orange-700`

```tsx
// BEFORE:
advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' }
// AFTER:
advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' }
```

---

## CSS Variable Auto-Propagation Matrix

> These Tailwind classes use CSS vars and update **automatically** after `:root` is changed — no JSX edits needed.

| Class | CSS Var | BEFORE resolves to | AFTER resolves to |
|---|---|---|---|
| `text-primary` | `--primary` | orange `#F97316` | indigo `#4F46E5` |
| `bg-primary` | `--primary` | orange | indigo |
| `border-primary` | `--primary` | orange | indigo |
| `ring-ring` / `focus:ring-ring` | `--ring` | orange | indigo |
| `bg-primary text-primary-foreground` (AdminLayout active nav) | `--primary` | orange bg | indigo bg |
| `text-primary` (StudentLayout NavLink active) | `--primary` | orange | indigo |
| `bm-btn-cta` | `--bm-cta` | orange | indigo |
| `from-primary/5` / `to-secondary/20` (gradient bg) | `--primary` / `--secondary` | orange/teal | indigo/purple |
| `sidebar-primary` vars | `--sidebar-primary` | orange | indigo |

---

## No Analog Found

All files have real BEFORE state patterns extracted from the codebase. No files lack analogs.

The following files have **no orange/teal hardcoded colors** and require **background/panel CSS only**:

| File | Action Required |
|------|----------------|
| `src/pages/admin/GradingPage.tsx` | Background inherits from AdminLayout — no direct changes needed |
| `src/pages/admin/CoursesPage.tsx` | Background inherits from AdminLayout — no direct changes needed; GRADE_BADGE via shared constant |
| `src/pages/admin/UsersPage.tsx` | Background inherits from AdminLayout — no direct changes needed |
| `src/pages/admin/SubmissionsPage.tsx` | Filter bar glassmorphism update only (Pattern 6) |

---

## Key Invariants (MUST NOT change)

Per D-06/D-17 (as refined in UI-SPEC):

1. **Do NOT edit** `src/components/ui/*.tsx` — className overrides only.
2. **Do NOT touch** `src/pages/Index.tsx` (landing page) — not in scope.
3. **Do NOT change** `useQuery` enabled guards, pagination logic, or data fetching patterns.
4. **Do NOT remove** Framer Motion `motion.div` / `whileInView` on any component.
5. **Semantic badges stay semantic:** green = enrolled/success, red = destructive — do not convert to indigo.
6. The `advanced` orange badge is the **only** non-semantic orange badge; it must migrate to indigo per D-13.

---

## Metadata

**Analog search scope:** `src/components/student/`, `src/components/admin/`, `src/pages/student/`, `src/pages/admin/`, `src/index.css`
**Files scanned:** 13 source files + `src/index.css` (268 lines)
**Pattern extraction date:** 2026-05-08
