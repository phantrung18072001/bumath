---
phase: 20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas
plan: P03
type: execute
wave: 3
depends_on:
  - 20-P01
  - 20-P02
files_modified:
  - src/lib/constants/grades.ts
  - src/pages/admin/CoursesPage.tsx
  - src/pages/admin/UsersPage.tsx
  - src/pages/admin/GradingPage.tsx
  - src/pages/admin/SubmissionsPage.tsx
  - src/pages/admin/PackagesPage.tsx
autonomous: true
requirements:
  - ADM-01
  - ADM-02
  - ADM-03
  - ADM-04

must_haves:
  truths:
    - "All 5 admin pages wrap their table/main content in a `bm-glass-card` div"
    - "All admin page h1 headings use gradient text `bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`"
    - "The `advanced` grade badge uses `bg-indigo-100 text-indigo-700` in src/lib/constants/grades.ts"
    - "PackagesPage local GRADE_BADGE `advanced` entry uses indigo (or references grades.ts)"
    - "No admin page contains hardcoded `#F97316` or `bg-orange-` brand colors on non-semantic elements"
    - "All admin page tests pass"
  artifacts:
    - path: "src/lib/constants/grades.ts"
      provides: "Shared grade badge constant with indigo advanced badge"
      contains: "bg-indigo-100 text-indigo-700"
    - path: "src/pages/admin/CoursesPage.tsx"
      provides: "Admin course list with glass card wrapper and gradient h1"
      contains: "bm-glass-card"
    - path: "src/pages/admin/UsersPage.tsx"
      provides: "Admin user list with glass card wrapper and gradient h1"
      contains: "bm-glass-card"
    - path: "src/pages/admin/GradingPage.tsx"
      provides: "Grading page with glass confirm panel and gradient h1"
      contains: "bm-glass-card"
    - path: "src/pages/admin/SubmissionsPage.tsx"
      provides: "Submissions page with glass card wrapper, glass filter bar, gradient h1"
      contains: "bm-glass-card"
    - path: "src/pages/admin/PackagesPage.tsx"
      provides: "Packages page with glass card wrapper, gradient h1, indigo advanced badge"
      contains: "bm-glass-card"
  key_links:
    - from: "src/lib/constants/grades.ts"
      to: "src/pages/admin/CoursesPage.tsx, CataloguePage.tsx (student)"
      via: "GRADE_BADGE import"
      pattern: "bg-indigo-100 text-indigo-700"
    - from: "src/index.css (.app-admin)"
      to: "src/pages/admin/*.tsx"
      via: "AdminLayout root div has app-admin class (P01)"
      pattern: "app-admin"
---

<objective>
Migrate all admin-facing screens to the AI EdTech SaaS glassmorphism design language.

Purpose: Wrap table/panel content in `.bm-glass-card`, apply gradient text to h1 headings, update the `advanced` grade badge from orange to indigo, and apply glassmorphism to the SubmissionsPage filter bar. Admin pages have fewer hardcoded orange tokens than student pages — most color updates happen automatically via the `.app-admin` CSS var scope established in P01.

Output:
- `src/lib/constants/grades.ts` — `advanced` badge updated to indigo
- 5 admin pages — glassmorphism card wrappers, gradient h1, CTA button gradient (CoursesPage + PackagesPage), glass filter bar (SubmissionsPage), glass confirm panel (GradingPage)
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-CONTEXT.md
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-PATTERNS.md
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-RESEARCH.md
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-P01-SUMMARY.md

<interfaces>
<!-- Admin pages have NO existing card styling — they use bare container divs. -->
<!-- Glass card wrapping pattern: wrap the TABLE (or main content body) in a new div, NOT the page root container. -->

<!-- Admin glassmorphism wrapper pattern (add around table content): -->
<!--
BEFORE (typical admin page structure):
  <div className="container mx-auto px-4 py-8">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-xl font-semibold ...">...</h1>
      <Button ...>Create</Button>
    </div>
    <Table>...</Table>   ← wrap this
  </div>

AFTER:
  <div className="container mx-auto px-4 py-8">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">...</h1>
      <Button className="min-h-[48px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0">Create</Button>
    </div>
    <div className="bm-glass-card p-6">   ← new wrapper
      <Table>...</Table>
    </div>
  </div>
-->

<!-- src/lib/constants/grades.ts current state: -->
<!--
export const GRADE_BADGE: Record<Course['target_grade'], { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
};
→ Change only `advanced` className to: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100'
-->

<!-- PackagesPage has a LOCAL GRADE_BADGE starting at line ~44 — must also be updated there. -->
<!-- src/pages/admin/SubmissionsPage.tsx — score badge bg-orange-100/text-orange-800 (lines 258-259) is SEMANTIC (numeric score display) — keep unchanged per D-13. -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Grades constant + CoursesPage + UsersPage + PackagesPage</name>
  <files>
    src/lib/constants/grades.ts,
    src/pages/admin/CoursesPage.tsx,
    src/pages/admin/UsersPage.tsx,
    src/pages/admin/PackagesPage.tsx
  </files>
  <read_first>
    - src/lib/constants/grades.ts (full file)
    - src/pages/admin/CoursesPage.tsx (full file)
    - src/pages/admin/UsersPage.tsx (full file)
    - src/pages/admin/PackagesPage.tsx (full file)
    - .planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-PATTERNS.md (sections for admin CoursesPage, UsersPage, PackagesPage)
    - .planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-RESEARCH.md (Q2 inventory for admin CoursesPage, UsersPage, PackagesPage; Q5 badge inventory)
  </read_first>
  <action>
**src/lib/constants/grades.ts — 1 change:**

Update the `advanced` entry in the `GRADE_BADGE` constant (line ~7):
- BEFORE: `advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' }`
- AFTER: `advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' }`

Leave grade_7, grade_8, grade_9 entries UNCHANGED.

---

**src/pages/admin/CoursesPage.tsx — 3 changes:**

1. h1 heading (line ~142). Find `text-xl font-semibold leading-[1.3]` (or similar) on the page title:
   - BEFORE: `className="text-xl font-semibold leading-[1.3]"` (or with additional classes)
   - AFTER: add gradient text classes → `className="text-xl font-bold leading-[1.3] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"`

2. Create/CTA Button (line ~143). Find the primary Button for creating a course:
   - BEFORE: `className="min-h-[48px]"` (or similar)
   - AFTER: `className="min-h-[48px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"`

3. Wrap table content in glass card. Find the element containing the Table (or the main table/list component) inside the `container` div. Add a wrapper:
   - BEFORE: `<Table ...>` (or whatever contains the table) sitting directly inside the container div
   - AFTER: wrap the Table (and any table-related controls like pagination) in: `<div className="bm-glass-card p-6"> ... </div>`
   Do NOT wrap the heading row (h1 + Button) — that stays outside the glass card.

---

**src/pages/admin/UsersPage.tsx — 2 changes:**

1. h1 heading (line ~166). Find `text-xl font-semibold` on the page title:
   - BEFORE: `className="text-xl font-semibold"` (or with additional classes)
   - AFTER: `className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"`

2. Wrap table content in glass card. Find the Table (or list component) inside the container div and wrap it:
   - AFTER wrapping: `<div className="bm-glass-card p-6"> ... </div>`
   Role badges (purple-600 Admin, blue-600 Teacher, secondary Student) are SEMANTIC — do NOT change them per D-13.

---

**src/pages/admin/PackagesPage.tsx — 3 changes:**

1. Local GRADE_BADGE constant (line ~44–49). Update the `advanced` entry in the local copy:
   - BEFORE: `advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' }`
   - AFTER: `advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' }`

2. h1 heading (line ~116). Find `text-xl font-semibold` on the page title:
   - BEFORE: `className="text-xl font-semibold"` (or with additional classes)
   - AFTER: `className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"`

3. Create/CTA Button (line ~117). Find the primary Button for creating a package:
   - BEFORE: `className="min-h-[48px]"` (or similar with no gradient)
   - AFTER: `className="min-h-[48px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"`

4. Wrap table content in glass card. Find the Table (and pagination if any) inside the container div and wrap it:
   - AFTER wrapping: `<div className="bm-glass-card p-6"> ... </div>`
  </action>
  <verify>
    <automated>yarn test src/pages/admin/CoursesPage.test.tsx src/pages/admin/UsersPage.test.tsx src/pages/admin/PackagesPage.test.tsx</automated>
    Also:
    grep -n "bg-orange-100 text-orange-700" src/lib/constants/grades.ts
    (must return no matches — advanced badge updated)
    grep -n "bg-indigo-100 text-indigo-700" src/lib/constants/grades.ts
    grep -n "bg-indigo-100 text-indigo-700" src/pages/admin/PackagesPage.tsx
    (both must have matches)
  </verify>
  <acceptance_criteria>
    - `grep -c "bg-orange-100 text-orange-700" src/lib/constants/grades.ts` returns 0
    - `grep -c "bg-indigo-100 text-indigo-700" src/lib/constants/grades.ts` returns ≥ 1
    - `grep -c "bg-orange-100 text-orange-700" src/pages/admin/PackagesPage.tsx` returns 0
    - `grep -c "bg-indigo-100 text-indigo-700" src/pages/admin/PackagesPage.tsx` returns ≥ 1
    - `grep -c "bm-glass-card" src/pages/admin/CoursesPage.tsx` returns ≥ 1
    - `grep -c "bm-glass-card" src/pages/admin/UsersPage.tsx` returns ≥ 1
    - `grep -c "bm-glass-card" src/pages/admin/PackagesPage.tsx` returns ≥ 1
    - `grep -c "from-indigo-600 to-purple-600 bg-clip-text text-transparent" src/pages/admin/CoursesPage.tsx` returns ≥ 1
    - `grep -c "from-indigo-600 to-purple-600 bg-clip-text text-transparent" src/pages/admin/UsersPage.tsx` returns ≥ 1
    - `grep -c "from-indigo-600 to-purple-600 bg-clip-text text-transparent" src/pages/admin/PackagesPage.tsx` returns ≥ 1
    - `grep -c "from-indigo-600 to-purple-600 hover:from-indigo-700" src/pages/admin/CoursesPage.tsx` returns ≥ 1 (CTA button)
    - `grep -c "from-indigo-600 to-purple-600 hover:from-indigo-700" src/pages/admin/PackagesPage.tsx` returns ≥ 1 (CTA button)
    - yarn test on all 3 admin page test files exits 0
  </acceptance_criteria>
  <done>grades.ts `advanced` badge is indigo. PackagesPage local GRADE_BADGE `advanced` is indigo. CoursesPage, UsersPage, PackagesPage all have glass card table wrapper and gradient h1. CoursesPage and PackagesPage CTAs have indigo gradient. All 3 test files pass.</done>
</task>

<task type="auto">
  <name>Task 2: GradingPage + SubmissionsPage — glass panels, filter bar, gradient headings</name>
  <files>src/pages/admin/GradingPage.tsx, src/pages/admin/SubmissionsPage.tsx</files>
  <read_first>
    - src/pages/admin/GradingPage.tsx (full file)
    - src/pages/admin/SubmissionsPage.tsx (full file)
    - .planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-PATTERNS.md (sections for GradingPage and SubmissionsPage)
    - .planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-RESEARCH.md (Q2 inventory for GradingPage and SubmissionsPage lines 281–300)
  </read_first>
  <action>
**src/pages/admin/GradingPage.tsx — 2 changes:**

1. h1 heading (line ~153). Find `text-xl font-semibold` on the page title:
   - BEFORE: `className="text-xl font-semibold"` (or with additional classes)
   - AFTER: `className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"`

2. Confirm panel (line ~292). Find the panel div with `rounded-lg border p-4 space-y-3 bg-muted` (the confirmation/action panel):
   - BEFORE: `className="rounded-lg border p-4 space-y-3 bg-muted"`
   - AFTER: `className="bm-glass-card p-4 space-y-3"`

GradingPage has no hardcoded orange colors — CSS vars (`text-primary`, `bg-primary`) auto-resolve to indigo inside `.app-admin`. Do NOT change any other elements.

---

**src/pages/admin/SubmissionsPage.tsx — 3 changes:**

1. h1 heading (line ~151). Find `text-xl font-semibold` on the page title:
   - BEFORE: `className="text-xl font-semibold"` (or with additional classes)
   - AFTER: `className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"`

2. Filter bar (line ~160). Find the filter div with `bg-muted/50 rounded-lg border border-border`:
   - BEFORE: `className="flex flex-wrap gap-2 mb-6 p-4 bg-muted/50 rounded-lg border border-border"`
   - AFTER: `className="flex flex-wrap gap-2 mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30"`

3. Wrap table content in glass card. Find the Table (and pagination if any) inside the container div and wrap it:
   - AFTER wrapping: `<div className="bm-glass-card p-6"> ... </div>`

IMPORTANT: The score badge at lines ~258–259 uses `bg-orange-100 text-orange-800`. This is a SEMANTIC badge (numeric score display) — do NOT change it per D-13. Only the brand-color orange values are being replaced.

SubmissionsPage has no other hardcoded orange colors — CSS var propagation via `.app-admin` handles the rest.
  </action>
  <verify>
    <automated>yarn test src/pages/admin/GradingPage.test.tsx src/pages/admin/SubmissionsPage.test.tsx</automated>
    Also:
    grep -n "bm-glass-card" src/pages/admin/GradingPage.tsx src/pages/admin/SubmissionsPage.tsx
    grep -n "from-indigo-600 to-purple-600 bg-clip-text" src/pages/admin/GradingPage.tsx src/pages/admin/SubmissionsPage.tsx
    (both must have matches)
    grep -n "bg-muted/50 rounded-lg border border-border" src/pages/admin/SubmissionsPage.tsx
    (must return no matches — filter bar updated)
  </verify>
  <acceptance_criteria>
    - `grep -c "bm-glass-card" src/pages/admin/GradingPage.tsx` returns ≥ 1 (confirm panel)
    - `grep -c "bm-glass-card" src/pages/admin/SubmissionsPage.tsx` returns ≥ 1 (table wrapper)
    - `grep -c "from-indigo-600 to-purple-600 bg-clip-text text-transparent" src/pages/admin/GradingPage.tsx` returns ≥ 1
    - `grep -c "from-indigo-600 to-purple-600 bg-clip-text text-transparent" src/pages/admin/SubmissionsPage.tsx` returns ≥ 1
    - `grep -c "bg-white/60 backdrop-blur-sm rounded-xl border border-white/30" src/pages/admin/SubmissionsPage.tsx` returns ≥ 1
    - `grep -c "bg-muted/50 rounded-lg border border-border" src/pages/admin/SubmissionsPage.tsx` returns 0
    - `grep -c "bg-orange-100 text-orange-800" src/pages/admin/SubmissionsPage.tsx` returns ≥ 1 (semantic score badge kept)
    - yarn test on both files exits 0
    - Full admin test suite: `yarn test src/pages/admin/ src/components/admin/` passes
  </acceptance_criteria>
  <done>GradingPage has gradient h1 and glass confirm panel. SubmissionsPage has gradient h1, glass filter bar, and glass table wrapper. Semantic score badge (orange) preserved. Full admin test suite passes.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| AdminLayout (.app-admin) → child pages | CSS vars propagate indigo to all admin page children automatically |
| Shared grades.ts constant | Change propagates to all consumers (admin CoursesPage, CataloguePage student, PackagesPage) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-20-07 | Tampering | src/lib/constants/grades.ts shared constant mutation | accept | Only `advanced` entry changed; grade_7/8/9 color codes preserved; change is intentional (D-13: replace orange brand badges) |
| T-20-08 | Information Disclosure | SubmissionsPage score badge bg-orange-100 | accept | Semantic badge kept per D-13 — orange here means "numeric score display", not brand color; accepted as low risk |
| T-20-09 | Tampering | Admin table glass card wrapper changes DOM structure | mitigate | Glass wrapper is purely visual; table data, pagination, and query logic are untouched; acceptance criteria requires test suite to pass |
</threat_model>

<verification>
After both tasks complete:

```bash
# 1. Advanced badge migrated in shared constant
grep -n "bg-orange-100 text-orange-700" src/lib/constants/grades.ts
# Must return 0 matches

# 2. All admin pages have glass card
grep -l "bm-glass-card" src/pages/admin/CoursesPage.tsx src/pages/admin/UsersPage.tsx src/pages/admin/GradingPage.tsx src/pages/admin/SubmissionsPage.tsx src/pages/admin/PackagesPage.tsx
# Must list all 5 files

# 3. All admin pages have gradient h1
grep -rn "from-indigo-600 to-purple-600 bg-clip-text text-transparent" src/pages/admin/
# Must return ≥ 5 matches (one per page)

# 4. Full test suite
yarn test src/pages/admin/ src/components/admin/ src/lib/
# Must pass

# 5. Full phase test suite (landing page + student + admin)
yarn test
# Must pass
```
</verification>

<success_criteria>
- `grep -c "bg-orange-100 text-orange-700" src/lib/constants/grades.ts` returns 0
- `grep -c "bg-indigo-100 text-indigo-700" src/lib/constants/grades.ts` returns ≥ 1
- `bm-glass-card` present in all 5 admin page files
- Gradient h1 (`bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`) present in all 5 admin page files
- SubmissionsPage filter bar uses `bg-white/60 backdrop-blur-sm rounded-xl border border-white/30`
- GradingPage confirm panel uses `bm-glass-card`
- Semantic score badge `bg-orange-100 text-orange-800` in SubmissionsPage preserved (unchanged)
- `yarn test` (full suite) exits 0
- Landing page: `grep -rn "bm-glass-card\|app-admin\|app-student" src/pages/Index.tsx src/components/landing/` returns 0 — landing page files unmodified throughout the phase
</success_criteria>

<output>
After completion, create `.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-P03-SUMMARY.md`
</output>
