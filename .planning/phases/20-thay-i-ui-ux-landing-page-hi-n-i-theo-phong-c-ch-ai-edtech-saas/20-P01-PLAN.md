---
phase: 20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas
plan: P01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/index.css
  - src/components/student/StudentLayout.tsx
  - src/components/admin/AdminLayout.tsx
autonomous: true
requirements:
  - CSS-01
  - CSS-02
  - CSS-03
  - BG-01
  - SAFE-01

must_haves:
  truths:
    - "`.app-student` and `.app-admin` CSS selector blocks exist in src/index.css, scoping --primary to 245 94% 58% (indigo)"
    - "Global :root --primary remains 24 95% 53% (orange) — landing page is unaffected"
    - "`.bm-glass-card` class exists in src/index.css with backdrop-filter, -webkit-backdrop-filter, border-radius 24px, and prefers-reduced-motion block"
    - "`.bm-progress-indigo` class exists in src/index.css overriding indicator background to #4F46E5"
    - "StudentLayout root div includes classes `app-student` and `bg-gradient-to-br from-primary/5 via-background to-secondary/20`"
    - "StudentLayout header includes `bg-white/80 backdrop-blur-sm border-b border-white/30`"
    - "AdminLayout root div includes classes `app-admin` and `bg-gradient-to-br from-primary/5 via-background to-secondary/20`"
    - "AdminLayout aside includes `bg-white/80 backdrop-blur-sm border-r border-white/30`"
  artifacts:
    - path: "src/index.css"
      provides: "Scoped CSS variable overrides, .bm-glass-card, .bm-progress-indigo"
      contains: ".app-student"
    - path: "src/components/student/StudentLayout.tsx"
      provides: "Scoped app-student class + gradient background on layout root"
      contains: "app-student"
    - path: "src/components/admin/AdminLayout.tsx"
      provides: "Scoped app-admin class + gradient background on layout root"
      contains: "app-admin"
  key_links:
    - from: "src/index.css (.app-student)"
      to: "src/components/student/StudentLayout.tsx"
      via: "className includes app-student"
      pattern: "app-student"
    - from: "src/index.css (.app-admin)"
      to: "src/components/admin/AdminLayout.tsx"
      via: "className includes app-admin"
      pattern: "app-admin"
    - from: "src/index.css (.bm-glass-card)"
      to: "src/pages/student/* (P02), src/pages/admin/* (P03)"
      via: "className override in JSX"
      pattern: "bm-glass-card"
---

<objective>
Establish the CSS foundation and layout scope classes for the Phase 20 AI EdTech SaaS design language.

Purpose: All indigo/purple CSS variables are scoped under `.app-student` / `.app-admin` wrapper classes — this is the critical safety mechanism that keeps the landing page orange while giving authenticated screens the indigo theme. Wave 2 and Wave 3 executors depend on these classes and `.bm-glass-card` being in place.

Output:
- `src/index.css` — scoped indigo CSS vars, `.bm-glass-card`, `.bm-progress-indigo`, updated `.bm-float-symbol-light`, scoped `.bm-btn-cta` gradient
- `src/components/student/StudentLayout.tsx` — `app-student` scope class + gradient background + glass header
- `src/components/admin/AdminLayout.tsx` — `app-admin` scope class + gradient background + glass sidebar
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-CONTEXT.md
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-PATTERNS.md
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-RESEARCH.md

<interfaces>
<!-- Key CSS class names and JSX patterns the executor needs. -->

From src/index.css (current state — lines to modify):
- Line 19: `.bm-clay-card-student { ... }` — orange card (keep as-is for backwards compat; add new .bm-glass-card after)
- Line 47-50: `.bm-progress-teal` — orange progress (keep; add .bm-progress-indigo after)
- Line 75: `.bm-float-symbol-light { color: #F97316; }` — change to #4F46E5
- Line 139-157: `.bm-btn-cta { background: var(--bm-cta) !important; ... }` — keep as-is; add scoped gradient override
- Line ~160: `@layer base { :root { --primary: 24 95% 53%; ... } }` — DO NOT CHANGE; add .app-student/.app-admin block AFTER this @layer base block

From src/components/student/StudentLayout.tsx (current state):
- Line 21: `<div className="h-screen overflow-hidden flex flex-col bg-white relative isolate">`
- Line 54: `<header className="h-20 bg-card border-b border-border flex items-center px-6 sticky top-0 z-10">`

From src/components/admin/AdminLayout.tsx (current state):
- Line 30: `<div className={cn('flex', fullBleed ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-[calc(100vh-80px)]')}>`
- Line 33: `<aside className="w-60 shrink-0 border-r bg-card overflow-y-auto">`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: CSS Foundation — scoped vars, glass card, progress, float symbol</name>
  <files>src/index.css</files>
  <read_first>
    - src/index.css (full file — specifically lines 19–50, 75–80, 139–160, and the @layer base :root block around line 160–210)
    - CLAUDE.md (do NOT modify src/components/ui/ — confirmed this is an index.css-only task)
  </read_first>
  <action>
Make the following 4 changes to src/index.css in order:

**Change 1 — Add `.bm-glass-card` after the `.bm-clay-card-student:hover` block:**
Insert the following CSS block immediately after the `.bm-clay-card-student:hover { ... }` closing brace and before whatever comes next (currently the `@media (prefers-reduced-motion)` block for clay card if present, or `.bm-progress-teal`):

```css
/* === BuMath Glassmorphism Card (Phase 20) === */
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

**Change 2 — Add `.bm-progress-indigo` after the `.bm-progress-teal` block (keep `.bm-progress-teal` untouched for backwards compat):**
Insert immediately after the `.bm-progress-teal > div { ... }` closing brace:

```css
/* === BuMath Indigo Progress Bar Override (Phase 20) === */
.bm-progress-indigo [data-slot="progress-indicator"],
.bm-progress-indigo > div {
  background-color: #4F46E5 !important;
}
```

**Change 3 — Update `.bm-float-symbol-light` color:**
Find the line `color: #F97316;` inside the `.bm-float-symbol-light { ... }` block (around line 75–80) and replace with:
```css
color: #4F46E5;
```

**Change 4 — Add scoped indigo CSS variable block AFTER the closing brace of `@layer base { :root { ... } }` block:**
Find the end of the `@layer base { }` block in src/index.css. After its closing `}`, insert the following block. This keeps global `:root --primary` as orange (landing page safe) while giving authenticated screens indigo:

```css
/* === Phase 20: Indigo theme scoped to authenticated app shells === */
/* Landing page (/) keeps orange primary because it has no .app-student/.app-admin wrapper. */
.app-student,
.app-admin {
  --primary: 245 94% 58%;           /* #4F46E5 indigo */
  --primary-foreground: 0 0% 100%;
  --ring: 245 94% 58%;
  --secondary: 270 67% 47%;         /* #7C3AED purple */
  --sidebar-primary: 245 94% 58%;
  --sidebar-ring: 245 94% 58%;
  --bm-primary: #4F46E5;
  --bm-secondary: #7C3AED;
  --bm-cta: #4F46E5;
  --bm-border: #4F46E5;
}

/* Override bm-btn-cta to use indigo→purple gradient inside authenticated app */
.app-student .bm-btn-cta,
.app-admin .bm-btn-cta {
  background: linear-gradient(to right, #4F46E5, #7C3AED) !important;
}
```

Do NOT change `--primary` inside `@layer base { :root { ... } }`. The global value stays `24 95% 53%` (orange).
  </action>
  <verify>
    <automated>
      grep -n "245 94% 58%" src/index.css
      grep -n "bm-glass-card" src/index.css
      grep -n "bm-progress-indigo" src/index.css
      grep -n "app-student" src/index.css
      grep -n "app-admin" src/index.css
    </automated>
    All five commands must return at least one match each.
    Also confirm global orange is preserved:
    grep -n "24 95% 53%" src/index.css
    Must still return the :root --primary line (not be zero).
  </verify>
  <acceptance_criteria>
    - `grep -c "245 94% 58%" src/index.css` returns ≥ 3 (primary, ring, sidebar-primary inside .app-student/.app-admin)
    - `grep -c "bm-glass-card" src/index.css` returns ≥ 4 (selector, :hover, media query × 2)
    - `grep -c "bm-progress-indigo" src/index.css` returns ≥ 2
    - `grep -c "app-student" src/index.css` returns ≥ 1
    - `grep -c "app-admin" src/index.css` returns ≥ 1
    - `grep -c "24 95% 53%" src/index.css` returns ≥ 1 (orange :root preserved)
    - `grep -c "backdrop-filter: blur(8px)" src/index.css` returns ≥ 1
    - `grep -c "#4F46E5" src/index.css` — at least the .bm-float-symbol-light update + .bm-progress-indigo (≥ 2)
    - NO change to the line `--primary: 24 95% 53%;` inside `@layer base`
  </acceptance_criteria>
  <done>src/index.css has .bm-glass-card (with backdrop-blur + reduced-motion), .bm-progress-indigo, .app-student/.app-admin scoped vars (indigo), global :root --primary still orange, .bm-float-symbol-light color is #4F46E5, and .app-student/.app-admin .bm-btn-cta uses indigo→purple gradient.</done>
</task>

<task type="auto">
  <name>Task 2: Layout wrappers — apply scope class + gradient background</name>
  <files>src/components/student/StudentLayout.tsx, src/components/admin/AdminLayout.tsx</files>
  <read_first>
    - src/components/student/StudentLayout.tsx (full file — focus on root div line ~21, header line ~54)
    - src/components/admin/AdminLayout.tsx (full file — focus on root wrapper line ~30, aside line ~33)
    - CLAUDE.md viewport-filling layout rule (h-screen overflow-hidden pattern — must NOT break)
  </read_first>
  <action>
**StudentLayout.tsx — 2 changes:**

Change 1 — Root div (line ~21). Replace `bg-white` with scope class + gradient:
- BEFORE: `className="h-screen overflow-hidden flex flex-col bg-white relative isolate"`
- AFTER: `className="h-screen overflow-hidden flex flex-col app-student bg-gradient-to-br from-primary/5 via-background to-secondary/20 relative isolate"`

Change 2 — Header bar (line ~54). Apply glassmorphism:
- BEFORE: `className="h-20 bg-card border-b border-border flex items-center px-6 sticky top-0 z-10"`
- AFTER: `className="h-20 bg-white/80 backdrop-blur-sm border-b border-white/30 flex items-center px-6 sticky top-0 z-10"`

Do NOT touch `<main>`, nav links, or any other part of StudentLayout. The h-screen/overflow-hidden/flex-col structure must be preserved exactly per CLAUDE.md viewport rule.

---

**AdminLayout.tsx — 2 changes:**

Change 1 — Root wrapper div (line ~30). Add scope class + gradient to the cn() call:
- BEFORE: `<div className={cn('flex', fullBleed ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-[calc(100vh-80px)]')}>`
- AFTER: `<div className={cn('flex app-admin bg-gradient-to-br from-primary/5 via-background to-secondary/20', fullBleed ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-[calc(100vh-80px)]')}>`

Change 2 — Sidebar aside (line ~33). Apply glassmorphism:
- BEFORE: `<aside className="w-60 shrink-0 border-r bg-card overflow-y-auto">`
- AFTER: `<aside className="w-60 shrink-0 border-r border-white/30 bg-white/80 backdrop-blur-sm overflow-y-auto">`

Active nav link classes (`bg-primary text-primary-foreground`) inside AdminLayout auto-resolve to indigo via the scoped .app-admin CSS vars — no JSX change needed there.
  </action>
  <verify>
    <automated>yarn test src/components/student/StudentLayout.test.tsx src/components/admin/AdminLayout.test.tsx</automated>
    Both test files must pass (no crashes from className changes).
    Also run grep checks:
    grep -n "app-student" src/components/student/StudentLayout.tsx
    grep -n "app-admin" src/components/admin/AdminLayout.tsx
    grep -n "bg-gradient-to-br" src/components/student/StudentLayout.tsx
    grep -n "bg-gradient-to-br" src/components/admin/AdminLayout.tsx
  </verify>
  <acceptance_criteria>
    - `grep -c "app-student" src/components/student/StudentLayout.tsx` returns ≥ 1
    - `grep -c "app-admin" src/components/admin/AdminLayout.tsx` returns ≥ 1
    - `grep -c "bg-gradient-to-br from-primary/5" src/components/student/StudentLayout.tsx` returns ≥ 1
    - `grep -c "bg-gradient-to-br from-primary/5" src/components/admin/AdminLayout.tsx` returns ≥ 1
    - `grep -c "backdrop-blur-sm" src/components/student/StudentLayout.tsx` returns ≥ 1 (header)
    - `grep -c "backdrop-blur-sm" src/components/admin/AdminLayout.tsx` returns ≥ 1 (aside)
    - `grep -v "bg-white" src/components/student/StudentLayout.tsx | grep -c "bg-white"` — zero plain bg-white on root div
    - `grep -c "h-screen overflow-hidden flex flex-col" src/components/student/StudentLayout.tsx` returns ≥ 1 (viewport rule intact)
    - yarn test on both layout test files exits 0
  </acceptance_criteria>
  <done>StudentLayout root div has `app-student bg-gradient-to-br from-primary/5 via-background to-secondary/20`, header has glassmorphism. AdminLayout root wrapper has `app-admin bg-gradient-to-br from-primary/5 via-background to-secondary/20` inside cn(), aside has glassmorphism. Both layout test files pass.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Global CSS → Landing page | CSS var changes could leak indigo color to landing page components |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-20-01 | Information Disclosure | src/index.css `:root` global `--primary` | mitigate | Scoped override via `.app-student`/`.app-admin` selectors — `:root --primary` stays orange; landing page has neither wrapper class |
| T-20-02 | Tampering | StudentLayout h-screen viewport invariant | mitigate | Task 2 action explicitly preserves `h-screen overflow-hidden flex flex-col`; acceptance criteria verifies the full class string |
| T-20-03 | Denial of Service | `backdrop-filter` Safari compatibility | accept | `-webkit-backdrop-filter` included in `.bm-glass-card` definition; low risk, visual-only degradation |
</threat_model>

<verification>
After both tasks complete:

```bash
# 1. CSS vars scoped correctly
grep -n "245 94% 58%" src/index.css
grep -n "24 95% 53%" src/index.css

# 2. Glass card class exists
grep -n "bm-glass-card" src/index.css

# 3. Layout wrappers have scope class
grep -n "app-student" src/components/student/StudentLayout.tsx
grep -n "app-admin" src/components/admin/AdminLayout.tsx

# 4. Landing page NOT affected
grep -rn "app-student\|app-admin\|indigo" src/pages/Index.tsx src/components/landing/ 2>/dev/null

# 5. Tests pass
yarn test src/components/student/StudentLayout.test.tsx src/components/admin/AdminLayout.test.tsx
```

The landing page grep (step 4) must return empty — no indigo classes introduced into landing files.
</verification>

<success_criteria>
- `.bm-glass-card` class present in src/index.css with `backdrop-filter`, `-webkit-backdrop-filter`, `border-radius: 24px`, and `@media (prefers-reduced-motion)` override
- `.bm-progress-indigo` class present with `background-color: #4F46E5 !important`
- `.app-student, .app-admin { --primary: 245 94% 58%; }` block present; global `:root --primary: 24 95% 53%` unchanged
- StudentLayout root div className contains `app-student` and `bg-gradient-to-br from-primary/5 via-background to-secondary/20`
- AdminLayout root div className contains `app-admin` and `bg-gradient-to-br from-primary/5 via-background to-secondary/20`
- Landing page files (`src/pages/Index.tsx`, `src/components/landing/*.tsx`) contain ZERO new indigo/purple references
- `yarn test src/components/student/StudentLayout.test.tsx src/components/admin/AdminLayout.test.tsx` passes
</success_criteria>

<output>
After completion, create `.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-P01-SUMMARY.md`
</output>
