# Phase 20: Student + Admin UI/UX — AI EdTech SaaS Design Language - Research

**Researched:** 2026-05-08
**Domain:** Tailwind CSS / shadcn UI visual migration — glassmorphism design language
**Confidence:** HIGH (all findings sourced directly from codebase inspection)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Apply "AI EdTech SaaS" visual style across student + admin screens.
- **D-02:** Card style: Claymorphism → **Glassmorphism** (`backdrop-blur-sm bg-white/80 border border-white/30 shadow-lg rounded-[24px]`).
- **D-03:** Primary: `#4F46E5` (indigo). Secondary: `#7C3AED` (purple). Accent: `#06B6D4` (cyan).
- **D-04:** Text: `#0F172A`. Muted text: `#64748B`.
- **D-05/UI-SPEC:** Background on all student/admin screens → `bg-gradient-to-br from-primary/5 via-background to-secondary/20` (login-style gradient). **This REPLACES the original D-05/D-06 lock** — backgrounds are now actively changed to the gradient, not preserved.
- **D-07:** Student cards: `.bm-clay-card-student` → `.bm-glass-card`.
- **D-08:** Admin panels: same glassmorphism style.
- **D-09:** Hover: `hover:shadow-xl hover:-translate-y-1 transition-all duration-200`.
- **D-10:** Typography: 2 weights only (400 + 700). Keep Be Vietnam Pro.
- **D-11:** Gradient text: `bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent` on page-level h1 only.
- **D-12:** Buttons: `bg-indigo-600 hover:bg-indigo-700`. CTA: gradient `from-indigo-600 to-purple-600`.
- **D-13:** Badges: replace orange/teal with indigo/purple. Keep semantic badges (green=enrolled/published, red=destructive, role badges, grade badges).
- **D-14:** Focus rings: `ring-indigo-500` via `--ring` CSS var update.
- **D-15:** Use `ui-ux-pro-max` skill for per-screen audit before implementing.
- **D-16:** Separate audit passes for student vs admin — do NOT bundle.
- **D-17:** Do NOT change `src/components/ui/` shadcn base files directly — className overrides only.

### the agent's Discretion

- Exact task breakdown within plans (within audit-first constraint from D-15/D-16).

### Deferred Ideas (OUT OF SCOPE)

- Landing page (`/`) redesign — untouched.
- Admin dashboard overview/stats page — new feature.
- Dark mode toggle — future enhancement.

</user_constraints>

---

## Summary

Phase 20 is a pure visual migration: no new features, no API changes, no route changes. The work is a systematic color/class replacement across 11 TSX files + `src/index.css`. The existing orange (#F97316) design language is replaced by indigo (#4F46E5) + purple gradient. The primary mechanism is: (1) update CSS variables in `:root` so that all `text-primary`, `bg-primary`, `ring-ring`, `border-primary` propagate automatically, (2) add `.bm-glass-card` CSS class replacing `.bm-clay-card-student`, (3) hunt down and replace remaining hardcoded `#F97316`/`#92400E`/`#FFEDD5` values across each file.

The codebase audit reveals a clear two-tier pattern: student screens use `bm-clay-card-student` class-based cards, while admin screens use bare table wrappers with no card styling. Both get glassmorphism treatment. Per D-15/D-16, an audit pass (using `ui-ux-pro-max`) must precede each implementation group.

**Primary recommendation:** Execute as 3 plans — P01 (CSS foundation), P02 (student screens), P03 (admin screens). Each plan includes an audit sub-step before implementation.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| CSS variable tokens | CSS Layer (index.css) | — | Root vars propagate to all Tailwind `text-primary` etc automatically |
| Card glassmorphism | CSS Layer + JSX className | — | New CSS class `.bm-glass-card` applied via className override |
| Background gradient | Layout wrapper (StudentLayout, AdminLayout) | — | Applied once at layout level, inherits to all child pages |
| Button color | JSX className override | CSS var propagation | `bm-btn-cta` CSS update + explicit className on key CTAs |
| Badge colors | JSX className — explicit per badge | — | No CSS class abstraction; hardcoded per-badge |
| Progress bar color | CSS class override | — | `.bm-progress-indigo` replaces `.bm-progress-teal` |
| Nav active state | CSS var propagation | — | `text-primary` in StudentLayout NavLink auto-updates |

---

## Standard Stack

> This phase installs **zero new packages**. All tooling is already in place.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui | — | Card, Badge, Button, Progress components | Already scaffolded; className override only |
| Tailwind CSS | — | Utility classes (indigo-*, purple-*, backdrop-blur-sm) | Primary styling mechanism |
| Framer Motion | — | Keep existing animations unchanged | D-09: extend, don't remove |

### No New Installs Required
Per UI-SPEC §Registry Safety: all needed components already installed in `src/components/ui/`. This phase is className overrides + CSS class additions only. [VERIFIED: src/components/ui/ directory contains Card, Badge, Button, Progress, Table, Input, Select, Pagination, AlertDialog]

---

## Architecture Patterns

### System Architecture Diagram

```
src/index.css  ──CSS vars update──►  :root { --primary: indigo; --ring: indigo; --bm-*: indigo }
                                           │
                                           ▼ (propagates automatically)
                                    text-primary, bg-primary, ring-ring
                                    in ALL components that use Tailwind tokens

src/index.css  ──new class──►  .bm-glass-card { backdrop-blur; bg-white/80; border-white/30 }
                                     │
                                     ▼ (applied via className override in JSX)
                    StudentLayout (bg-white → gradient)
                    ├── CoursesPage (bm-clay-card-student → bm-glass-card, orange literals → indigo)
                    ├── CataloguePage (bm-clay-card-student → bm-glass-card, filter pills)
                    ├── CourseDetailPage (locked card, panel bg-white → transparent/card)
                    └── ProfilePage (3× bm-clay-card-student → bm-glass-card)

                    AdminLayout (add gradient bg)
                    ├── admin/CoursesPage (wrap table in bm-glass-card, h1 gradient)
                    ├── admin/UsersPage (wrap table in bm-glass-card, h1 gradient)
                    ├── admin/GradingPage (panels glassmorphism)
                    ├── admin/SubmissionsPage (wrap table in bm-glass-card)
                    └── admin/PackagesPage (wrap table in bm-glass-card, h1 gradient)

                    LessonSidebar (orange borders/colors → indigo variants)
```

### Recommended Project Structure
No structural changes. All edits are within existing files.

---

## Q1: CSS Changes Needed — Exact Current Values

### `.bm-clay-card-student` (src/index.css lines 19–44) — REPLACE CONTENT
```css
/* CURRENT */
.bm-clay-card-student {
  background: #FFFFFF;
  border: 1px solid rgba(249, 115, 22, 0.25);   /* orange */
  border-radius: 16px;
  box-shadow:
    0 2px 8px rgba(249, 115, 22, 0.08),          /* orange tint */
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

### `.bm-btn-cta` (src/index.css lines 139–157) — UPDATE BACKGROUND
```css
/* CURRENT */
.bm-btn-cta {
  background: var(--bm-cta) !important;  /* --bm-cta: #F97316 orange */
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  min-height: 48px;
  cursor: pointer;
  transition: opacity 200ms ease, transform 200ms ease;
}
```

### `.bm-progress-teal` (src/index.css lines 47–50) — KEEP OLD, ADD NEW
```css
/* CURRENT */
.bm-progress-teal [data-slot="progress-indicator"],
.bm-progress-teal > div {
  background-color: #F97316 !important;   /* orange, NOT teal despite name */
}
```

### `:root` CSS Variables (src/index.css lines 160–208) — UPDATE
```css
/* CURRENT values needing change */
--primary: 24 95% 53%;          /* orange #F97316 */
--ring: 24 95% 53%;              /* orange */
--sidebar-primary: 24 95% 53%;  /* orange */
--sidebar-ring: 24 95% 53%;     /* orange */
--bm-primary: #F97316;
--bm-cta: #F97316;
--bm-border: #F97316;
/* --secondary: 200 80% 50%; — currently teal-blue; not causing problems */
```

### NEW classes to add to index.css
Per UI-SPEC — `.bm-glass-card` (glassmorphism card) and `.bm-progress-indigo`.

---

## Q2: Hardcoded Colors Inventory — Per File

### `src/components/student/StudentLayout.tsx`
| Line | Class | Action |
|------|-------|--------|
| 21 | `bg-white` (h-screen wrapper) | → `bg-gradient-to-br from-primary/5 via-background to-secondary/20` |

### `src/pages/student/CoursesPage.tsx`
| Line | Class | Action |
|------|-------|--------|
| 71 | `text-[#92400E]` (h1) | → gradient text classes |
| 92 | `text-[#F97316]` (BookOpen icon) | → `text-indigo-400` |
| 93 | `text-[#92400E]` (empty h2) | → `text-[#0F172A]` |
| 98 | `bm-btn-cta` (Button) | → keep class (CSS update handles it) |
| 121 | `bm-clay-card-student` (Card) | → `bm-glass-card` |
| 123 | `text-[#92400E]` (CardTitle) | → `text-[#0F172A]` |
| 141 | `bg-[#FFEDD5] bm-progress-teal` (Progress) | → `bg-indigo-100 bm-progress-indigo` |

### `src/pages/student/CataloguePage.tsx`
| Line | Class | Action |
|------|-------|--------|
| 91 | `text-[#92400E]` (h1) | → gradient text classes |
| 98 | `bm-btn-cta` (Button) | → keep class (CSS update handles it) |
| 114 | `border-[#F97316] focus-visible:ring-[#F97316]` (Input) | → remove both, use `focus-visible:ring-indigo-500` |
| 128 | `bg-[#F97316] ... border-[#F97316]` (active filter pill) | → `bg-indigo-600 text-white border-indigo-600` |
| 156 | `text-[#F97316]` (Search icon, empty state) | → `text-indigo-400` |
| 157 | `text-[#92400E]` (empty h2) | → `text-[#0F172A]` |
| 167 | `text-[#F97316]` (BookOpen icon, empty state) | → `text-indigo-400` |
| 168 | `text-[#92400E]` (empty h2) | → `text-[#0F172A]` |
| 188 | `bm-clay-card-student` (Card) | → `bm-glass-card` |
| 190 | `text-[#92400E]` (CardTitle) | → `text-[#0F172A]` |
| 253 | `bg-white` (unauthenticated wrapper) | → `bg-gradient-to-br from-primary/5 via-background to-secondary/20` |

### `src/pages/student/CourseDetailPage.tsx`
| Line | Class | Action |
|------|-------|--------|
| 508 | `bg-white border-r border-[#F97316]/20` (sidebar panel) | → `bg-card/50 border-r border-indigo-200/30` |
| 516 | `bg-white` (content panel) | → `bg-transparent` |
| 587 | `border-[#F97316] text-[#F97316] hover:bg-[#F3F0ED]` (mobile menu btn) | → `border-indigo-400 text-indigo-600 hover:bg-indigo-50` |
| 595 | `bg-white` (mobile content panel) | → `bg-transparent` |
| 612 | `text-[#92400E]` (SheetTitle) | → `text-[#0F172A]` |
| 633 | `bg-white border-r border-[#F97316]/20` (unenrolled sidebar) | → `bg-card/50 border-r border-indigo-200/30` |
| 643 | `bg-white` (unenrolled content area) | → `bg-transparent` |
| 645 | `bm-clay-card-student` (locked Card) | → `bm-glass-card` |
| 647 | `bg-[#FFEDD5] border-2 border-[#F97316]` (lock icon container) | → `bg-indigo-50 border-2 border-indigo-400` |
| 648, 700 | `text-[#F97316]` (Lock icons) | → `text-indigo-500` |
| 651 | `text-[#92400E]` (course title in locked card) | → `text-[#0F172A]` |
| 669, 712 | `bm-btn-cta` (Buttons) | → keep class (CSS update handles it) |
| 686, 692 | `data-[state=active]:border-[#F97316]` (Tabs) | → `data-[state=active]:border-indigo-600` |
| 697 | `bg-white` (TabsContent) | → `bg-transparent` |
| 699 | `bg-[#FFEDD5] border-2 border-[#F97316]` (mobile lock icon) | → `bg-indigo-50 border-2 border-indigo-400` |
| 842 | `bg-white` (unauthenticated wrapper) | → `bg-gradient-to-br from-primary/5 via-background to-secondary/20` |

### `src/pages/student/ProfilePage.tsx`
| Line | Class | Action |
|------|-------|--------|
| 26 | `bm-clay-card-student` (PackageCard div) | → `bm-glass-card` |
| 69 | `from-primary/85 via-primary/60 to-indigo-500/50` (hero gradient) | → `from-indigo-600/85 via-indigo-500/60 to-purple-500/50` (explicit, not token) |
| 95 | `bm-clay-card-student` (profile Card) | → `bm-glass-card` |
| 98 | `bg-primary/10` (avatar container) | → `bg-indigo-50` |
| 99 | `text-primary` (initials) | → `text-indigo-600` |
| 125 | `bg-primary/5` (stats container) | → `bg-indigo-50/50` |
| 126 | `text-primary` (package count) | → `text-indigo-600` |
| 140 | `from-primary/60` (study illustration overlay) | → `from-indigo-600/60` |
| 159 | `bm-clay-card-student` (empty packages Card) | → `bm-glass-card` |

### `src/components/student/LessonSidebar.tsx`
| Line | Class | Action |
|------|-------|--------|
| 77 | `border-[#F97316]/15` (chapter AccordionItem border) | → `border-indigo-200/60` |
| 176 | `border-[#F97316]/40 text-[#92400E]/50 hover:text-[#92400E] hover:border-[#F97316]/70 hover:bg-[#FFF7ED]` (add lesson btn) | → `border-indigo-300/50 text-indigo-400 hover:text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50` |
| 331 | `border-[#F97316]/20` (progress section border) | → `border-indigo-200` |
| 334 | `bg-[#FFEDD5] bm-progress-teal` (Progress) | → `bg-indigo-100 bm-progress-indigo` |
| 349 | `border-[#F97316]/20` (chapter footer border) | → `border-indigo-200/60` |
| 353 | `border-[#F97316]/40 text-[#92400E] hover:bg-[#FFEDD5]/50` (add chapter btn) | → `border-indigo-300/60 text-indigo-700 hover:bg-indigo-50/50` |

### `src/components/admin/AdminLayout.tsx`
| Line | Class | Action |
|------|-------|--------|
| 30 | `flex` wrapper (no bg set) | Add `bg-gradient-to-br from-primary/5 via-background to-secondary/20` |
| 33 | `bg-card` (sidebar) | Keep as-is (sidebar has its own bg) |

### `src/pages/admin/CoursesPage.tsx`
| Line | Class | Action |
|------|-------|--------|
| 140 | `container mx-auto px-4 py-8` (root div) | Wrap table content in `<div className="bm-glass-card p-6">` |
| 142 | `text-xl font-semibold leading-[1.3]` (h1) | → add gradient text classes |
| 143 | `Button className="min-h-[48px]"` (Create btn) | → add `bg-gradient-to-r from-indigo-600 to-purple-600 ...` |

### `src/pages/admin/UsersPage.tsx`
| Line | Class | Action |
|------|-------|--------|
| 165 | `container mx-auto px-4 py-8` (root div) | Wrap table in `bm-glass-card` |
| 166 | `text-xl font-semibold` (h1) | → gradient text |
| (none) | No hardcoded orange colors | CSS var update handles the rest |

### `src/pages/admin/GradingPage.tsx`
| Line | Class | Action |
|------|-------|--------|
| 292 | `rounded-lg border p-4 space-y-3 bg-muted` (confirm panel) | → `bm-glass-card p-4 space-y-3` |
| 153 | `text-xl font-semibold` (h1) | → gradient text |

### `src/pages/admin/SubmissionsPage.tsx`
| Line | Class | Action |
|------|-------|--------|
| 149 | `container mx-auto px-4 py-8` (root div) | Wrap table in `bm-glass-card` |
| 151 | `text-xl font-semibold` (h1) | → gradient text |
| 160 | `bg-muted/50 rounded-lg border border-border` (filter bar) | → glassmorphism filter bar |
| 258–259 | `bg-orange-100 text-orange-800` (score badge) | **KEEP** — semantic, not brand color |

### `src/pages/admin/PackagesPage.tsx`
| Line | Class | Action |
|------|-------|--------|
| 114 | `container mx-auto px-4 py-8` (root div) | Wrap table in `bm-glass-card` |
| 116 | `text-xl font-semibold` (h1) | → gradient text |
| 117 | `Button className="min-h-[48px]"` (Create btn) | → gradient CTA button |

---

## Q3: Background Locations — Exact Classnames

| File | Line | Current className | Action |
|------|------|-------------------|--------|
| `src/components/student/StudentLayout.tsx` | 21 | `h-screen overflow-hidden flex flex-col bg-white relative isolate` | Replace `bg-white` → `bg-gradient-to-br from-primary/5 via-background to-secondary/20` |
| `src/components/admin/AdminLayout.tsx` | 30 | `flex` (no bg) | Add `bg-gradient-to-br from-primary/5 via-background to-secondary/20` to `cn()` |
| `src/pages/student/CataloguePage.tsx` | 253 | `min-h-screen bg-white` (unauthenticated wrapper) | → `min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20` |
| `src/pages/student/CourseDetailPage.tsx` | 842 | `min-h-screen bg-white` (unauthenticated wrapper) | → `min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20` |
| `src/pages/student/CourseDetailPage.tsx` | 508, 516, 595, 633, 643, 697 | `bg-white` (inner panel divs) | → `bg-transparent` or `bg-card/50` (see risk area below) |

> **CRITICAL:** The float symbols background div in StudentLayout (line 23) has `className="absolute inset-0 ... hidden"` — the `hidden` class means it's never visible, so float symbol color change is cosmetic but safe to update.

---

## Q4: Card Component Usage

`.bm-clay-card-student` is a **CSS class applied via JSX `className`** prop — NOT a React component wrapper. It's always applied to shadcn `<Card>` or a bare `<div>`. No component abstraction.

### Complete `.bm-clay-card-student` Instance Map

| File | Line | Element | Notes |
|------|------|---------|-------|
| `CoursesPage.tsx` | 121 | `<Card className="bm-clay-card-student border-0 shadow-none p-0 ...">` | Course enrollment card |
| `CataloguePage.tsx` | 188 | `<Card className="bm-clay-card-student border-0 shadow-none p-0 ...">` | Catalogue course card |
| `CourseDetailPage.tsx` | 645 | `<Card className="bm-clay-card-student border-0 shadow-none w-full ...">` | Locked content card |
| `ProfilePage.tsx` | 95 | `<Card className="bm-clay-card-student">` | Profile info card |
| `ProfilePage.tsx` | 159 | `<Card className="bm-clay-card-student">` | Empty packages card |
| `ProfilePage.tsx` | 26 | `<div className="bm-clay-card-student p-4 ...">` | PackageCard component (bare div!) |

**Total: 6 instances** — 5 on shadcn `<Card>`, 1 on bare `<div>` in PackageCard.

### Admin "Card" Pattern
Admin pages currently have NO card styling — they use bare `<div className="container mx-auto px-4 py-8">`. The glassmorphism treatment means wrapping table content (not the page root div) in `<div className="bm-glass-card p-6">`.

---

## Q5: Badge Inventory

### Badges to CHANGE
| File | Line | Current | New |
|------|------|---------|-----|
| `CataloguePage.tsx` | 199 | `bg-green-100 text-green-700 hover:bg-green-100` ("Đã đăng ký" enrolled) | → `bg-cyan-100 text-cyan-700 hover:bg-cyan-100` (UI-SPEC accent color for enrolled) |

> NOTE: The enrolled badge change (green → cyan) is specified in UI-SPEC §Badge Contract as the accent color for "enrolled status indicator only". Verify this is intentional before implementing.

### Badges to KEEP UNCHANGED (semantic)
| File | Badge | Why Keep |
|------|-------|---------|
| All files | Grade badges (blue-100/green-100/purple-100/orange-100) | Semantic color-coding for grade levels |
| `CoursesPage.tsx` admin | `bg-green-100 text-green-700` "Công khai" (published) | Semantic: success/live state |
| `CoursesPage.tsx` admin | `variant="outline"` "Nháp" (draft) | Semantic: inactive state |
| `UsersPage.tsx` | `bg-purple-600 text-white` Admin role | Semantic: role color coding |
| `UsersPage.tsx` | `bg-blue-600 text-white` Teacher role | Semantic: role color coding |
| `UsersPage.tsx` | `variant="secondary"` Student role | Semantic |
| `SubmissionsPage.tsx` | `bg-orange-100 text-orange-800` Score badge | Semantic: numeric score display (orange ≠ orange brand color here) |
| `SubmissionsPage.tsx` | `bg-muted text-muted-foreground` Count badge | Neutral, fine as-is |
| `CataloguePage.tsx` | `variant="outline" text-muted-foreground` "Chưa đăng ký" | Neutral |

---

## Q6: Plan Breakdown Strategy

### Recommended: 3 Plans

**P01 — CSS Foundation** (smallest, highest leverage, must-go-first)
- `src/index.css` only:
  - Update `:root` CSS variables (`--primary`, `--ring`, `--sidebar-primary`, `--sidebar-ring`, `--bm-primary`, `--bm-cta`, `--bm-border`)
  - Add `.bm-glass-card` CSS class with hover + reduced-motion
  - Add `.bm-progress-indigo` CSS class
  - Update `.bm-btn-cta` background to indigo gradient
  - Update `.bm-float-symbol-light` color to indigo (currently `color: #F97316`)
- **Why first:** CSS var changes propagate automatically to ~30+ existing `text-primary`, `bg-primary`, `ring-ring` usages across ALL files — running this first means P02/P03 executors only need to fix the remaining hardcoded literals.

**P02 — Student Screens** (audit + implement)
- Audit step: `ui-ux-pro-max` skill on all student screens (per D-15)
- Implementation:
  - `src/components/student/StudentLayout.tsx` — background
  - `src/pages/student/CoursesPage.tsx` — cards, progress, heading, icons
  - `src/pages/student/CataloguePage.tsx` — cards, filter pills, search, heading, icons
  - `src/pages/student/ProfilePage.tsx` — cards (3), hero gradient, avatar/stats colors
  - `src/pages/student/CourseDetailPage.tsx` — lock cards, panel bg-white, tab borders, CTAs
  - `src/components/student/LessonSidebar.tsx` — borders, progress, add buttons

**P03 — Admin Screens** (audit + implement)
- Audit step: `ui-ux-pro-max` skill on all admin screens (per D-16, separate from student)
- Implementation:
  - `src/components/admin/AdminLayout.tsx` — background gradient
  - `src/pages/admin/CoursesPage.tsx` — glass panel, h1 gradient, CTA button
  - `src/pages/admin/UsersPage.tsx` — glass panel, h1 gradient
  - `src/pages/admin/GradingPage.tsx` — glass panels on confirm box
  - `src/pages/admin/SubmissionsPage.tsx` — glass panel, h1 gradient, filter bar
  - `src/pages/admin/PackagesPage.tsx` — glass panel, h1 gradient, CTA button

> **Alternative split** (if P02 is too large): Split P02 into P02a (StudentLayout + CoursesPage + CataloguePage) and P02b (ProfilePage + CourseDetailPage + LessonSidebar). CourseDetailPage alone has 15+ change points and is the most complex file.

---

## Q7: Risk Areas

### Risk 1: `bg-white` Inner Panels in CourseDetailPage (HIGH)
**Problem:** CourseDetailPage has 6 `bg-white` divs on internal layout panels (lines 508, 516, 595, 633, 643, 697). These are NOT the page background but structural layout containers (sidebar panel, content scroll area). 
**Why risky:** Changing `bg-white` → `bg-transparent` on scroll containers may reveal the gradient background through them (desired), but could expose layout gaps or z-index issues if not done carefully.
**Mitigation:** Change to `bg-transparent` (not gradient), since the layout wrapper already sets the gradient. Test scroll behavior at each breakpoint after change.

### Risk 2: CSS Variable Propagation to Landing Page (MEDIUM)
**Problem:** `--primary` and `--ring` are global CSS vars. The landing page (`src/pages/Index.tsx`) is OUT OF SCOPE, but it uses `text-primary`, `bg-primary` etc. that will automatically change from orange → indigo when vars are updated.
**Why risky:** The user said landing page is satisfactory — inadvertent color change breaks that.
**Investigation needed:** Check `src/pages/Index.tsx` for `text-primary`, `bg-primary` usage before running P01.
**Mitigation:** If landing page uses these tokens, scope variables to a `.student-app` wrapper or use explicit hardcoded values on landing page elements. However, UI-SPEC says landing page is "independent" and uses its own bg — need to verify.

### Risk 3: `Login.tsx` and `Register.tsx` Use `bm-btn-cta` (MEDIUM)
**Problem:** `src/pages/Login.tsx` line 185 and `src/pages/Register.tsx` line 353 both use `bm-btn-cta`. These are auth pages (not student or admin screens), but they're not landing page either.
**Why risky:** `.bm-btn-cta` CSS update in P01 will automatically change button color on Login/Register from orange → indigo gradient. This may or may not be desired. The UI-SPEC doesn't mention these files.
**Mitigation:** Likely acceptable (indigo is more premium than orange). But executor should verify visually.

### Risk 4: `ChatMessage.tsx`, `LessonProgressButton.tsx`, `BellNotification.tsx` Orange Colors (LOW)
**Problem:** These student sub-components have hardcoded orange that's NOT listed in the 11 target files. Specifically:
- `LessonProgressButton.tsx` line 55: `bg-[#F97316] hover:bg-[#ea6c0c] shadow-[0_4px_0_0_#c2540a]` — clay-style button
- `ChatMessage.tsx` lines 50-51: `border-[#F97316]/20 border-l-[#F97316]` — staff message styling
- `BellNotification.tsx` line 64: `bg-[#F97316]/5` — notification header
**Why risky:** These are visual inconsistencies post-migration — the rest of the UI is indigo but these remain orange.
**Mitigation:** Note these as optional cleanup in the audit step. The audit may surface them. They're not blocked, just possibly missed by scope definition.

### Risk 5: `bm-float-symbol-light` Color Change (LOW)
**Problem:** `src/index.css` defines `.bm-float-symbol-light { color: #F97316 }`. The StudentLayout float symbols div has `hidden` class, so they're never visible.
**Why risky:** Zero visual impact currently. Safe to update to indigo or leave as-is.
**Decision:** Update to indigo for completeness (thematic alignment). Zero risk.

### Risk 6: Glassmorphism `backdrop-filter` Safari Compatibility (LOW)
**Problem:** `backdrop-filter: blur(8px)` requires `-webkit-backdrop-filter` prefix for Safari.
**Why risky:** UI-SPEC already includes `-webkit-backdrop-filter` in the `.bm-glass-card` definition — this is handled. [VERIFIED from UI-SPEC §Card Component Contract]
**Mitigation:** Copy the CSS block exactly from UI-SPEC, which includes the prefix.

### Risk 7: Admin `bg-gradient` Leaks to GradingPage Full-Bleed (MEDIUM)
**Problem:** `AdminLayout` has a `fullBleed` prop for CourseDetailPage (admin view). When `fullBleed=true`, the layout wrapper is `h-[calc(100vh-80px)] overflow-hidden`. The gradient background must not cause visual artifacts in the overflow-hidden full-bleed layout.
**Mitigation:** Test the admin CourseDetailPage (which uses `isAdmin=true`) after AdminLayout background change.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Glassmorphism card | Custom shadow/blur CSS from scratch | `.bm-glass-card` CSS class per UI-SPEC exactly | UI-SPEC provides the exact CSS with proper cross-browser prefixes |
| Progress bar color | Custom Progress component | `.bm-progress-indigo` CSS override + `className` prop | Phase pattern already established by `.bm-progress-teal` |
| Gradient text | JS-computed gradient | `bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent` | Tailwind utility, no JS needed |
| CSS variable scoping | Separate CSS files | Update `:root` vars once | Propagates automatically to all Tailwind semantic tokens |

---

## Code Examples

### Glassmorphism Card CSS (add to index.css)
```css
/* Source: UI-SPEC §Card Component Contract */
.bm-glass-card {
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.30);
  border-radius: 24px;
  box-shadow:
    0 10px 15px rgba(0, 0, 0, 0.08),
    0 4px 6px rgba(0, 0, 0, 0.04);
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.bm-glass-card:hover {
  box-shadow:
    0 20px 25px rgba(0, 0, 0, 0.12),
    0 8px 10px rgba(0, 0, 0, 0.06);
  transform: translateY(-4px);
}
@media (prefers-reduced-motion: reduce) {
  .bm-glass-card,
  .bm-glass-card:hover {
    transition: none;
    transform: none;
  }
}
```

### Indigo Progress Bar CSS (add to index.css)
```css
/* Source: UI-SPEC §Progress Bar Contract */
.bm-progress-indigo [data-slot="progress-indicator"],
.bm-progress-indigo > div {
  background-color: #4F46E5 !important;
}
```

### Updated `.bm-btn-cta` (update in index.css)
```css
/* Source: UI-SPEC §Button Contract */
.bm-btn-cta {
  background: linear-gradient(to right, #4F46E5, #7C3AED) !important;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  min-height: 48px;
  cursor: pointer;
  transition: opacity 200ms ease, transform 200ms ease;
}
```

### CSS Variable Updates (update :root block in index.css)
```css
/* Source: UI-SPEC §CSS Variable Updates */
--primary: 245 94% 58%;           /* was: 24 95% 53% */
--primary-foreground: 0 0% 100%;
--ring: 245 94% 58%;              /* was: 24 95% 53% */
--sidebar-primary: 245 94% 58%;
--sidebar-ring: 245 94% 58%;
--bm-primary: #4F46E5;
--bm-cta: #4F46E5;
--bm-border: #4F46E5;
```

### Card JSX Usage Pattern
```tsx
/* Source: UI-SPEC §Card Component Contract */
<Card className="bm-glass-card border-0 shadow-none p-0 overflow-hidden">
  ...
</Card>

/* For bare div instances (ProfilePage PackageCard) */
<div className="bm-glass-card p-4 flex flex-col gap-2">
  ...
</div>
```

### Gradient h1 Heading Pattern
```tsx
/* Source: UI-SPEC §Gradient Text Application */
<h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
  Khóa học của tôi
</h1>
```

### Admin Table Glassmorphism Panel
```tsx
/* Source: UI-SPEC §Admin Table Panel Pattern */
<div className="container mx-auto px-4 py-8">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      Quản lý khóa học
    </h1>
    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white min-h-[48px]">
      Tạo khóa học
    </Button>
  </div>
  {/* toolbar stays outside glass panel */}
  <div className="bm-glass-card p-6">
    <Table>...</Table>
  </div>
</div>
```

### StudentLayout Background Update
```tsx
/* Source: UI-SPEC §Background Rule */
<div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/20 relative isolate">
```

---

## Runtime State Inventory

> SKIPPED — This is a greenfield style migration phase. No data stores, services, or OS registrations embed the design tokens being changed. CSS class names are compile-time only.

---

## Environment Availability

> SKIPPED — This phase has no external tool dependencies. All work is className overrides and CSS class additions within the existing Vite + Tailwind + shadcn stack.

---

## Common Pitfalls

### Pitfall 1: Forgetting `bg-white` is Not the Same as `bg-card`
**What goes wrong:** Replacing `bg-white` on inner layout panels with `bg-gradient-...` instead of `bg-transparent` — this causes double gradient rendering (the layout wrapper gradient + the panel gradient).
**Prevention:** Inner panel divs in CourseDetailPage should become `bg-transparent` (NOT gradient), because the gradient is set once at the layout wrapper level.

### Pitfall 2: CSS Variable Update Breaking Landing Page Colors
**What goes wrong:** `--primary: 245 94% 58%` is global. Landing page uses `text-primary` on certain elements (hero section, nav links) — these silently become indigo.
**Prevention:** Before P01, grep `src/pages/Index.tsx` and `src/components/landing/` for `text-primary`, `bg-primary`. If found, either accept the change (landing page gets indigo too) or scope the variable update to a CSS class selector like `.app-shell :root`.

### Pitfall 3: Removing `border-0 shadow-none` When Swapping Card Classes
**What goes wrong:** Old pattern is `className="bm-clay-card-student border-0 shadow-none p-0"`. When replacing `bm-clay-card-student` → `bm-glass-card`, the executor might drop `border-0 shadow-none` overrides, not realizing `bm-glass-card` sets its own border/shadow that should NOT be overridden.
**Prevention:** Drop `border-0 shadow-none` when switching to `bm-glass-card` (glass card has its own border). Keep `p-0 overflow-hidden` as-is.

### Pitfall 4: Applying Gradient Text to Non-h1 Elements
**What goes wrong:** Applying `bg-clip-text text-transparent` gradient to card titles, table headers, or badge text makes them invisible on transparent/glass backgrounds.
**Prevention:** Gradient text applies ONLY to page-level `<h1>` tags and selected admin section headings. Never apply to card titles, body text, or any text smaller than ~20px.

### Pitfall 5: Missing the `ProfilePage.tsx` Bare `<div>` Card
**What goes wrong:** Grep for `bm-clay-card-student` on `<Card>` components only — misses the bare `<div className="bm-clay-card-student ...">` on line 26 in the `PackageCard` sub-component in ProfilePage.
**Prevention:** Grep for `bm-clay-card-student` across all tsx files (not just `<Card>` elements). The inventory above captures all 6 instances.

### Pitfall 6: Admin `fullBleed` Layout Context for CourseDetailPage
**What goes wrong:** AdminLayout gradient background may look different in `fullBleed=true` mode (used when admin visits `/quan-tri/khoa-hoc/:slug`). The `overflow-hidden` + gradient may create a visual cut-off.
**Prevention:** Test admin CourseDetailPage view after AdminLayout changes. The gradient is subtle (`from-primary/5`) and should not cause noticeable cut-off.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Orange claymorphism (#F97316) | Indigo glassmorphism (#4F46E5) | Phase 20 | Replaces all orange brand tokens |
| `.bm-clay-card-student` (orange border, double orange shadow) | `.bm-glass-card` (backdrop-blur, white/80, subtle shadow) | Phase 20 | All 6 card instances in student screens |
| `.bm-progress-teal` (orange fill — misnomer) | `.bm-progress-indigo` (indigo fill) | Phase 20 | 2 progress bar instances |
| `bg-white` layout wrappers | `bg-gradient-to-br from-primary/5 via-background to-secondary/20` | Phase 20 | StudentLayout, AdminLayout, standalone wrappers |

**Deprecated/outdated after Phase 20:**
- `.bm-clay-card-student`: replaced by `.bm-glass-card` in JSX; CSS rule can be kept for backward compat or removed (no remaining usages after migration)
- `.bm-progress-teal`: replaced by `.bm-progress-indigo`; old class stays in CSS (harmless if unused)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3 + React Testing Library + jsdom |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run --reporter=verbose src/pages/student/ src/components/student/StudentLayout.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

This phase is UI-only (no logic changes). Existing tests verify behavior remains intact after className changes.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CSS-01 | CSS vars update: `--primary` resolves to indigo | Manual visual | `npx vitest run src/pages/student/CoursesPage.test.tsx` (renders without crash) | ✅ |
| CSS-02 | `.bm-glass-card` class present on cards | Unit (className check) | `npx vitest run src/pages/student/CoursesPage.test.tsx` | ✅ (needs assertion update) |
| CSS-03 | `.bm-clay-card-student` NOT present on cards | Unit (className check) | `npx vitest run src/pages/student/CoursesPage.test.tsx` | ✅ (needs assertion update) |
| STU-01 | StudentLayout renders without crash | Unit | `npx vitest run src/components/student/StudentLayout.test.tsx` | ✅ |
| STU-02 | CoursesPage renders course cards | Unit | `npx vitest run src/pages/student/CoursesPage.test.tsx` | ✅ |
| STU-03 | CataloguePage renders with filter pills | Unit | `npx vitest run src/pages/student/CataloguePage.test.tsx` | ✅ |
| STU-04 | CourseDetailPage renders without crash | Unit | `npx vitest run src/pages/student/CourseDetailPage.test.tsx` | ✅ |
| ADM-01 | AdminLayout renders sidebar | Unit | `npx vitest run src/components/admin/AdminLayout.test.tsx` | ✅ |
| ADM-02 | Admin CoursesPage renders table | Unit | `npx vitest run src/pages/admin/CoursesPage.test.tsx` | ✅ |
| ADM-03 | Admin UsersPage renders | Unit | `npx vitest run src/pages/admin/UsersPage.test.tsx` | ✅ (check exists) |
| ADM-04 | Admin SubmissionsPage renders | Unit | `npx vitest run src/pages/admin/SubmissionsPage.test.tsx` | ✅ |
| SAFE-01 | Landing page (`/`) components NOT modified | Grep | `grep -r "bm-glass-card\|indigo-600" src/pages/Index.tsx src/components/landing/` → should be empty | Manual |

### Sampling Rate
- **Per task commit:** `npx vitest run src/` (full suite, ~30s, no integration tests needed)
- **Per wave merge:** `npx vitest run` + manual visual check in browser
- **Phase gate:** Full suite green + visual review of all 11 modified screens before `/gsd-verify-work`

### Wave 0 Gaps
The existing test suite tests behavior (data rendering, interactions) NOT CSS class names. The planner should add targeted className assertions in Wave 0 to verify the migration:

- [ ] Add assertion in `CoursesPage.test.tsx`: card container has class `bm-glass-card`, does NOT have `bm-clay-card-student`
- [ ] Add assertion in `CataloguePage.test.tsx`: same card class check
- [ ] Add assertion in `CoursesPage.test.tsx`: progress element has class `bm-progress-indigo`
- [ ] Add assertion in `StudentLayout.test.tsx`: root div does NOT have `bg-white`, DOES have gradient classes
- [ ] Add assertion in `AdminLayout.test.tsx`: root wrapper has gradient background

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Landing page `src/pages/Index.tsx` does NOT use `text-primary` / `bg-primary` CSS token classes | Risk Area 2 | Landing page silently gets indigo colors after CSS var update |
| A2 | The enrolled badge change from green → cyan (UI-SPEC §Badge Contract) is intentional, not a spec error | Q5 Badge Inventory | Wrong color on "Đã đăng ký" badge |
| A3 | `AdminLayout.tsx` root `div` needs gradient added (currently has no bg class) | Q3 Background Locations | Admin background may already have a bg set elsewhere in the DOM tree |

---

## Open Questions

1. **Landing page CSS token exposure**
   - What we know: `--primary` is a global CSS var; UI-SPEC says landing page is "independent"
   - What's unclear: Does `src/pages/Index.tsx` or `src/components/landing/` use `text-primary`, `bg-primary` tokens that would auto-change to indigo?
   - Recommendation: Executor of P01 MUST grep `src/pages/Index.tsx` and `src/components/landing/` for these tokens before running the CSS var update. If found: either accept the change, or add landing-page-specific overrides.

2. **ChatMessage.tsx, LessonProgressButton.tsx, BellNotification.tsx orange colors — in scope?**
   - What we know: These components have hardcoded orange (#F97316) colors but are NOT in the 11 listed target files
   - What's unclear: Are they implicitly in scope (as sub-components rendered within CourseDetailPage which IS in scope)?
   - Recommendation: Include in the student audit pass (D-15). The audit will surface them, and the implementor can decide per-file.

---

## Sources

### Primary (HIGH confidence)
- `src/index.css` — verified current CSS class values line-by-line
- `src/pages/student/*.tsx` — all 4 files read in full
- `src/pages/admin/*.tsx` — all 5 files read in full
- `src/components/student/StudentLayout.tsx`, `LessonSidebar.tsx` — read in full
- `src/components/admin/AdminLayout.tsx` — read in full
- `.planning/phases/20-*/20-CONTEXT.md` — locked decisions
- `.planning/phases/20-*/20-UI-SPEC.md` — approved design contract

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — historical decisions context

---

## Metadata

**Confidence breakdown:**
- CSS changes inventory: HIGH — directly read from source files
- Architecture patterns: HIGH — based on UI-SPEC (already approved 2026-05-08)
- Pitfalls: HIGH — identified from direct code inspection
- Badge keep/change decisions: HIGH — verified against UI-SPEC §Badge Contract

**Research date:** 2026-05-08
**Valid until:** Stable — no dependencies on external libraries; all changes are in codebase
