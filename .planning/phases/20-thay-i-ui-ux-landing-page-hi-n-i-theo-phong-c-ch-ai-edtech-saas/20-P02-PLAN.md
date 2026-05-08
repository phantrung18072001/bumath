---
phase: 20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas
plan: P02
type: execute
wave: 2
depends_on:
  - 20-P01
files_modified:
  - src/pages/student/CoursesPage.tsx
  - src/pages/student/CataloguePage.tsx
  - src/pages/student/ProfilePage.tsx
  - src/pages/student/CourseDetailPage.tsx
  - src/components/student/LessonSidebar.tsx
autonomous: true
requirements:
  - STU-01
  - STU-02
  - STU-03
  - STU-04

must_haves:
  truths:
    - "No student page JSX file contains `bm-clay-card-student` (replaced by `bm-glass-card`)"
    - "No student page JSX file contains hardcoded `#F97316`, `#92400E`, `#FFEDD5`, `#FFF7ED`, or `#F3F0ED` color values"
    - "CoursesPage and CataloguePage h1 headings use gradient text classes `bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`"
    - "CoursesPage and LessonSidebar progress bars use `bm-progress-indigo` class"
    - "All student pages render without crash (yarn test passes)"
  artifacts:
    - path: "src/pages/student/CoursesPage.tsx"
      provides: "Student courses list with glassmorphism cards"
      contains: "bm-glass-card"
    - path: "src/pages/student/CataloguePage.tsx"
      provides: "Course catalogue with indigo filter pills and glass cards"
      contains: "bm-glass-card"
    - path: "src/pages/student/ProfilePage.tsx"
      provides: "Profile page with 3 glassmorphism card instances"
      contains: "bm-glass-card"
    - path: "src/pages/student/CourseDetailPage.tsx"
      provides: "Course detail with glass sidebar panel, indigo tabs"
      contains: "bm-glass-card"
    - path: "src/components/student/LessonSidebar.tsx"
      provides: "Lesson sidebar with indigo borders and progress"
      contains: "bm-progress-indigo"
  key_links:
    - from: "src/index.css (.bm-glass-card)"
      to: "src/pages/student/CoursesPage.tsx, CataloguePage.tsx, ProfilePage.tsx, CourseDetailPage.tsx"
      via: "className prop override on shadcn Card and div"
      pattern: "bm-glass-card"
    - from: "src/index.css (.bm-progress-indigo)"
      to: "src/pages/student/CoursesPage.tsx, src/components/student/LessonSidebar.tsx"
      via: "className prop on Progress component"
      pattern: "bm-progress-indigo"
---

<objective>
Migrate all student-facing screens from the orange Claymorphism design to the AI EdTech SaaS indigo Glassmorphism design language.

Purpose: Replace every hardcoded orange token (`#F97316`, `#92400E`, `#FFEDD5`) and `bm-clay-card-student` class with their indigo equivalents across 5 student files. This is the largest change set in Phase 20.

Output:
- 5 files updated: CoursesPage, CataloguePage, ProfilePage, CourseDetailPage, LessonSidebar
- All `bm-clay-card-student` → `bm-glass-card`
- All orange hardcoded colors → indigo equivalents per PATTERNS.md
- Progress bars → `bm-progress-indigo`
- Page h1 headings → gradient text
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-CONTEXT.md
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-PATTERNS.md
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-P01-SUMMARY.md

<interfaces>
<!-- Shared indigo token mapping from PATTERNS.md — apply consistently across all 5 files -->
<!--
BEFORE → AFTER (orange hardcoded → indigo):
  text-[#92400E]                           → text-slate-800  (dark headings, card titles)
  text-[#F97316]  (icons)                  → text-indigo-400
  text-[#F97316]  (interactive/buttons)    → text-indigo-600
  bg-[#F97316]    (active fill)            → bg-indigo-600
  border-[#F97316]                         → border-indigo-300
  border-[#F97316]/20                      → border-indigo-200/30
  border-[#F97316]/40                      → border-indigo-300/40
  bg-[#FFEDD5]    (progress track)         → bg-indigo-100
  bg-[#FFF7ED]    (hover bg)               → bg-indigo-50/50
  hover:bg-[#FFEDD5]/50                    → hover:bg-indigo-50/60
  focus-visible:ring-[#F97316]             → focus-visible:ring-indigo-500
  bm-clay-card-student                     → bm-glass-card
  bm-progress-teal                         → bm-progress-indigo

Page h1 gradient text (CoursesPage, CataloguePage):
  className="text-2xl font-bold mb-4 text-[#92400E]"
  → className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"

Note: ProfilePage h1 headings may use text-primary which auto-resolves to indigo inside .app-student — leave those as-is.
Unauthenticated wrappers (bg-white, min-h-screen): add `app-student` + gradient class.
-->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: CoursesPage + CataloguePage — cards, headings, progress, filter pills</name>
  <files>src/pages/student/CoursesPage.tsx, src/pages/student/CataloguePage.tsx</files>
  <read_first>
    - src/pages/student/CoursesPage.tsx (full file)
    - src/pages/student/CataloguePage.tsx (full file)
    - .planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-PATTERNS.md (sections for CoursesPage and CataloguePage)
  </read_first>
  <action>
**src/pages/student/CoursesPage.tsx — 6 changes:**

1. h1 heading (line ~71):
   - BEFORE: `className="text-2xl font-bold mb-4 text-[#92400E]"`
   - AFTER: `className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"`

2. Empty state icon (line ~92):
   - BEFORE: `className="h-16 w-16 text-[#F97316]"` on `<BookOpen>`
   - AFTER: `className="h-16 w-16 text-indigo-400"`

3. Empty state h2 (line ~93):
   - BEFORE: `className="text-xl font-bold text-[#92400E]"`
   - AFTER: `className="text-xl font-bold text-slate-800"`

4. Course card (line ~121):
   - BEFORE: `className="bm-clay-card-student border-0 shadow-none p-0 overflow-hidden h-full min-h-[200px] flex flex-col"`
   - AFTER: `className="bm-glass-card border-0 shadow-none p-0 overflow-hidden h-full min-h-[200px] flex flex-col"`

5. Card title (line ~123):
   - BEFORE: `className="text-base font-bold leading-snug text-[#92400E] mb-2"`
   - AFTER: `className="text-base font-bold leading-snug text-slate-800 mb-2"`

6. Progress bar (line ~141–143):
   - BEFORE: `className="h-1.5 bg-[#FFEDD5] bm-progress-teal"`
   - AFTER: `className="h-1.5 bg-indigo-100 bm-progress-indigo"`

---

**src/pages/student/CataloguePage.tsx — 9 changes:**

1. h1 heading (line ~91):
   - BEFORE: `className="text-2xl font-bold text-[#92400E]"`
   - AFTER: `className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"`

2. Search input (line ~114):
   - BEFORE: `className="pl-9 min-h-[48px] rounded-xl border-[#F97316] focus-visible:ring-[#F97316]"`
   - AFTER: `className="pl-9 min-h-[48px] rounded-xl border-indigo-300 focus-visible:ring-indigo-500"`

3. Grade filter active pill (line ~126–129). Replace only the active-state class string (the inactive-state string remains unchanged):
   - BEFORE (active): `'bg-[#F97316] text-white border-[#F97316]'`
   - AFTER (active): `'bg-indigo-600 text-white border-indigo-600'`

4. Empty-state Search icon (line ~156):
   - BEFORE: `className="h-16 w-16 text-[#F97316]"` on `<Search>`
   - AFTER: `className="h-16 w-16 text-indigo-400"`

5. Empty-state h2 "no results" (line ~157):
   - BEFORE: `className="text-xl font-bold text-[#92400E]"`
   - AFTER: `className="text-xl font-bold text-slate-800"`

6. Empty-state BookOpen icon (line ~167):
   - BEFORE: `className="h-16 w-16 text-[#F97316]"` on `<BookOpen>`
   - AFTER: `className="h-16 w-16 text-indigo-400"`

7. Empty-state h2 "no courses" (line ~168):
   - BEFORE: `className="text-xl font-bold text-[#92400E]"`
   - AFTER: `className="text-xl font-bold text-slate-800"`

8. Course card (line ~188):
   - BEFORE: `className="bm-clay-card-student border-0 shadow-none p-0 h-full min-h-[200px] overflow-hidden flex flex-col"`
   - AFTER: `className="bm-glass-card border-0 shadow-none p-0 h-full min-h-[200px] overflow-hidden flex flex-col"`

9. Card title (line ~190):
   - BEFORE: `className="text-base font-bold leading-snug text-[#92400E] mb-2"`
   - AFTER: `className="text-base font-bold leading-snug text-slate-800 mb-2"`

10. Unauthenticated wrapper (line ~253). Find the top-level div that renders when the user is not logged in (contains `min-h-screen bg-white`):
    - BEFORE: contains `min-h-screen bg-white` (possibly something like `className="min-h-screen bg-white flex items-center justify-center"`)
    - AFTER: replace `bg-white` with `app-student bg-gradient-to-br from-primary/5 via-background to-secondary/20`

IMPORTANT: The enrolled badge (`bg-green-100 text-green-700`) at line ~199 on the "Đã đăng ký" badge must NOT be changed. Keep green (semantic enrolled status per D-13).
  </action>
  <verify>
    <automated>yarn test src/pages/student/CoursesPage.test.tsx src/pages/student/CataloguePage.test.tsx</automated>
    Also:
    grep -n "bm-clay-card-student" src/pages/student/CoursesPage.tsx src/pages/student/CataloguePage.tsx
    (must return no matches — empty output)
    grep -n "#F97316\|#92400E\|#FFEDD5" src/pages/student/CoursesPage.tsx src/pages/student/CataloguePage.tsx
    (must return no matches)
  </verify>
  <acceptance_criteria>
    - `grep -c "bm-clay-card-student" src/pages/student/CoursesPage.tsx` returns 0
    - `grep -c "bm-clay-card-student" src/pages/student/CataloguePage.tsx` returns 0
    - `grep -c "bm-glass-card" src/pages/student/CoursesPage.tsx` returns ≥ 1
    - `grep -c "bm-glass-card" src/pages/student/CataloguePage.tsx` returns ≥ 1
    - `grep -c "bm-progress-indigo" src/pages/student/CoursesPage.tsx` returns ≥ 1
    - `grep -c "from-indigo-600 to-purple-600 bg-clip-text text-transparent" src/pages/student/CoursesPage.tsx` returns ≥ 1
    - `grep -c "from-indigo-600 to-purple-600 bg-clip-text text-transparent" src/pages/student/CataloguePage.tsx` returns ≥ 1
    - `grep -c "bg-indigo-600 text-white border-indigo-600" src/pages/student/CataloguePage.tsx` returns ≥ 1
    - `grep -c "#F97316" src/pages/student/CoursesPage.tsx` returns 0
    - `grep -c "#F97316" src/pages/student/CataloguePage.tsx` returns 0
    - `grep -c "#92400E" src/pages/student/CoursesPage.tsx` returns 0
    - `grep -c "#92400E" src/pages/student/CataloguePage.tsx` returns 0
    - yarn test on both files exits 0
  </acceptance_criteria>
  <done>CoursesPage and CataloguePage have glassmorphism cards, gradient h1, indigo filter pills (CataloguePage), indigo progress bars (CoursesPage), indigo empty-state icons. All orange hardcoded tokens eliminated from both files. Tests pass.</done>
</task>

<task type="auto">
  <name>Task 2: ProfilePage + LessonSidebar — cards, hero gradient, borders</name>
  <files>src/pages/student/ProfilePage.tsx, src/components/student/LessonSidebar.tsx</files>
  <read_first>
    - src/pages/student/ProfilePage.tsx (full file)
    - src/components/student/LessonSidebar.tsx (full file)
    - .planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-PATTERNS.md (sections for ProfilePage and LessonSidebar)
    - .planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-RESEARCH.md (Q2 inventory for ProfilePage and LessonSidebar)
  </read_first>
  <action>
**src/pages/student/ProfilePage.tsx — 9 changes:**

1. PackageCard wrapper div (line ~26):
   - BEFORE: `className="bm-clay-card-student p-4 flex flex-col gap-2 transition-shadow duration-200 hover:shadow-lg"`
   - AFTER: `className="bm-glass-card p-4 flex flex-col gap-2"`

2. Hero gradient (line ~69). Find `from-primary/85 via-primary/60 to-indigo-500/50` in the hero overlay gradient:
   - BEFORE: `from-primary/85 via-primary/60 to-indigo-500/50`
   - AFTER: `from-indigo-600/85 via-indigo-500/60 to-purple-500/50`
   (Replace only these 3 gradient position classes; keep all other classes on the same element unchanged)

3. Profile Card (line ~95):
   - BEFORE: `<Card className="bm-clay-card-student">`
   - AFTER: `<Card className="bm-glass-card">`

4. Avatar container (line ~98):
   - BEFORE: `className="... bg-primary/10 ..."` (small div wrapping user initials)
   - AFTER: replace `bg-primary/10` → `bg-indigo-50`

5. Initials text (line ~99):
   - BEFORE: `className="... text-primary ..."` (the text displaying user initials inside avatar)
   - AFTER: replace `text-primary` → `text-indigo-600`

6. Stats container (line ~125):
   - BEFORE: contains `bg-primary/5` (the stats row background)
   - AFTER: replace `bg-primary/5` → `bg-indigo-50/50`

7. Package count number (line ~126):
   - BEFORE: contains `text-primary` (the numeric count, e.g. "3 khóa học")
   - AFTER: replace `text-primary` → `text-indigo-600`

8. Study illustration gradient overlay (line ~140):
   - BEFORE: contains `from-primary/60` in a gradient class
   - AFTER: replace `from-primary/60` → `from-indigo-600/60`

9. Empty packages Card (line ~159):
   - BEFORE: `<Card className="bm-clay-card-student">`
   - AFTER: `<Card className="bm-glass-card">`

---

**src/components/student/LessonSidebar.tsx — 6 changes:**

1. Chapter AccordionItem border (line ~77). Find `border-[#F97316]/15` on the chapter collapsible row:
   - BEFORE: contains `border-[#F97316]/15`
   - AFTER: replace `border-[#F97316]/15` → `border-indigo-200/60`

2. Add lesson button (line ~176). Replace the full className string:
   - BEFORE: `className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-dashed border-[#F97316]/40 text-xs font-medium text-[#92400E]/50 hover:text-[#92400E] hover:border-[#F97316]/70 hover:bg-[#FFF7ED] transition-all duration-200 cursor-pointer group/add"`
   - AFTER: `className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-dashed border-indigo-300/50 text-xs font-medium text-indigo-400 hover:text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group/add"`

3. Progress section border (line ~331):
   - BEFORE: `className="... border-b border-[#F97316]/20 ..."` (the div wrapping the Progress component)
   - AFTER: replace `border-[#F97316]/20` → `border-indigo-200`

4. Progress bar (line ~334):
   - BEFORE: `className="h-2 bg-[#FFEDD5] bm-progress-teal"`
   - AFTER: `className="h-2 bg-indigo-100 bm-progress-indigo"`

5. Add chapter footer border (line ~349):
   - BEFORE: `className="... border-t border-[#F97316]/20 ..."` (div wrapping the "add chapter" button)
   - AFTER: replace `border-[#F97316]/20` → `border-indigo-200/60`

6. Add chapter Button (line ~353). Replace the className prop value:
   - BEFORE: `className="w-full min-h-[44px] gap-1.5 border-[#F97316]/40 text-[#92400E] hover:bg-[#FFEDD5]/50 cursor-pointer"`
   - AFTER: `className="w-full min-h-[44px] gap-1.5 border-indigo-300/60 text-indigo-700 hover:bg-indigo-50/50 cursor-pointer"`
  </action>
  <verify>
    <automated>yarn test src/pages/student/ProfilePage.test.tsx src/components/student/LessonSidebar.test.tsx</automated>
    Also run:
    grep -n "bm-clay-card-student" src/pages/student/ProfilePage.tsx
    grep -n "#F97316\|#92400E\|#FFEDD5\|#FFF7ED" src/pages/student/ProfilePage.tsx src/components/student/LessonSidebar.tsx
    (both must return no matches)
  </verify>
  <acceptance_criteria>
    - `grep -c "bm-clay-card-student" src/pages/student/ProfilePage.tsx` returns 0
    - `grep -c "bm-glass-card" src/pages/student/ProfilePage.tsx` returns ≥ 3 (PackageCard, profile Card, empty packages Card)
    - `grep -c "bm-progress-indigo" src/components/student/LessonSidebar.tsx` returns ≥ 1
    - `grep -c "#F97316" src/pages/student/ProfilePage.tsx` returns 0
    - `grep -c "#F97316" src/components/student/LessonSidebar.tsx` returns 0
    - `grep -c "#92400E" src/pages/student/ProfilePage.tsx` returns 0
    - `grep -c "#92400E" src/components/student/LessonSidebar.tsx` returns 0
    - `grep -c "from-indigo-600/85" src/pages/student/ProfilePage.tsx` returns ≥ 1
    - `grep -c "border-indigo-300/50" src/components/student/LessonSidebar.tsx` returns ≥ 1 (add lesson button)
    - yarn test on both files exits 0
  </acceptance_criteria>
  <done>ProfilePage has 3 bm-glass-card instances, explicit indigo hero gradient, indigo avatar/stats/count colors. LessonSidebar has all orange border/button/progress tokens replaced with indigo equivalents. No hardcoded orange tokens remain in either file. Tests pass.</done>
</task>

<task type="auto">
  <name>Task 3: CourseDetailPage — glass sidebar panels, lock cards, tabs, unenrolled state</name>
  <files>src/pages/student/CourseDetailPage.tsx</files>
  <read_first>
    - src/pages/student/CourseDetailPage.tsx (full file — large file, scan all bg-white and #F97316 occurrences before editing)
    - .planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-PATTERNS.md (CourseDetailPage section)
    - .planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-RESEARCH.md (Q2 inventory for CourseDetailPage — lines 218–236)
  </read_first>
  <action>
This file has 14 change points. Work through them in line-number order to avoid confusion.

**1. Enrolled sidebar panel (line ~508):**
- BEFORE: `className="w-[420px] shrink-0 bg-white border-r border-[#F97316]/20 flex flex-col h-full"`
- AFTER: `className="w-[420px] shrink-0 bg-white/80 backdrop-blur-sm border-r border-white/30 flex flex-col h-full"`

**2. Enrolled content area (line ~516):**
- BEFORE: `className="flex-1 overflow-y-auto bg-white"`
- AFTER: `className="flex-1 overflow-y-auto bg-white/60"`

**3. Mobile menu button (line ~587):**
- BEFORE: contains `border-[#F97316] text-[#F97316] hover:bg-[#F3F0ED]`
- AFTER: replace those three classes → `border-indigo-300 text-indigo-600 hover:bg-indigo-50`
  (Full replacement: `className="min-h-[48px] gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 cursor-pointer"`)

**4. Mobile content area (line ~595):**
- BEFORE: `className="flex-1 overflow-y-auto bg-white"`
- AFTER: `className="flex-1 overflow-y-auto bg-white/60"`

**5. SheetTitle (line ~612):**
- BEFORE: contains `text-[#92400E]` on the SheetTitle or its child
- AFTER: replace `text-[#92400E]` → `text-[#0F172A]`

**6. Unenrolled sidebar (line ~633):**
- BEFORE: contains `bg-white border-r border-[#F97316]/20` (similar structure to enrolled sidebar at 508)
- AFTER: replace those classes → `bg-card/50 border-r border-indigo-200/30`

**7. Unenrolled content area (line ~643):**
- BEFORE: `className="... bg-white ..."` (the content div in unenrolled state, sibling to the unenrolled sidebar)
- AFTER: replace `bg-white` → `bg-transparent`

**8. Locked content Card (line ~645):**
- BEFORE: `<Card className="bm-clay-card-student border-0 shadow-none w-full ...">` (the card shown to unenrolled users)
- AFTER: replace `bm-clay-card-student` → `bm-glass-card`

**9. Lock icon container — desktop (line ~647):**
- BEFORE: contains `bg-[#FFEDD5] border-2 border-[#F97316]` (the div wrapping the Lock icon)
- AFTER: replace those two classes → `bg-indigo-50 border-2 border-indigo-400`

**10. Lock icon — desktop (line ~648):**
- BEFORE: `className="... text-[#F97316] ..."` on `<Lock>`
- AFTER: replace `text-[#F97316]` → `text-indigo-500`

**11. Course title in locked card (line ~651):**
- BEFORE: contains `text-[#92400E]` on the course title heading
- AFTER: replace `text-[#92400E]` → `text-[#0F172A]`

**12. Tabs active state (lines ~686 and ~692):**
- BEFORE: contains `data-[state=active]:border-[#F97316]` on Tabs trigger(s)
- AFTER: replace `data-[state=active]:border-[#F97316]` → `data-[state=active]:border-indigo-600`
  (There are 2 occurrences — update both)

**13. TabsContent background (line ~697):**
- BEFORE: `className="... bg-white ..."` on a TabsContent div
- AFTER: replace `bg-white` → `bg-transparent`

**14. Lock icon container + icon — mobile (lines ~699–700). Same pattern as desktop (changes 9 & 10):**
- BEFORE: contains `bg-[#FFEDD5] border-2 border-[#F97316]` on container; `text-[#F97316]` on Lock icon
- AFTER: `bg-indigo-50 border-2 border-indigo-400` on container; `text-indigo-500` on Lock icon

**15. Unauthenticated page wrapper (line ~842):**
- BEFORE: contains `min-h-screen bg-white` (top-level fallback for unauthenticated users)
- AFTER: replace `bg-white` → `app-student bg-gradient-to-br from-primary/5 via-background to-secondary/20`

After all edits: run `grep -n "#F97316\|#92400E\|#FFEDD5\|bm-clay-card-student" src/pages/student/CourseDetailPage.tsx` — must return empty.
  </action>
  <verify>
    <automated>yarn test src/pages/student/CourseDetailPage.test.tsx</automated>
    Also:
    grep -n "bm-clay-card-student" src/pages/student/CourseDetailPage.tsx
    grep -n "#F97316\|#92400E\|#FFEDD5\|#F3F0ED" src/pages/student/CourseDetailPage.tsx
    (both must return no matches)
  </verify>
  <acceptance_criteria>
    - `grep -c "bm-clay-card-student" src/pages/student/CourseDetailPage.tsx` returns 0
    - `grep -c "bm-glass-card" src/pages/student/CourseDetailPage.tsx` returns ≥ 1
    - `grep -c "#F97316" src/pages/student/CourseDetailPage.tsx` returns 0
    - `grep -c "#92400E" src/pages/student/CourseDetailPage.tsx` returns 0
    - `grep -c "backdrop-blur-sm" src/pages/student/CourseDetailPage.tsx` returns ≥ 1 (sidebar panel)
    - `grep -c "bg-indigo-50 border-2 border-indigo-400" src/pages/student/CourseDetailPage.tsx` returns ≥ 2 (desktop + mobile lock container)
    - `grep -c "data-\[state=active\]:border-indigo-600" src/pages/student/CourseDetailPage.tsx` returns ≥ 2 (both tab triggers)
    - yarn test exits 0
    - Full student test suite: `yarn test src/pages/student/` passes
  </acceptance_criteria>
  <done>CourseDetailPage has glassmorphism sidebar panels, indigo lock icon containers, indigo tab active borders, transparent/glass content backgrounds, and no remaining orange hardcoded tokens. All student tests pass.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| StudentLayout (.app-student) → child pages | Scoped CSS vars propagate into all child page components |
| Unauthenticated page wrappers | These fall outside StudentLayout; need explicit app-student class for CSS var scope |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-20-04 | Tampering | CourseDetailPage bg-white inner panels | mitigate | Change to bg-white/80 or bg-transparent (not bg-background gradient) so layout structure is preserved; scroll containers tested post-change |
| T-20-05 | Information Disclosure | Unauthenticated CataloguePage/CourseDetailPage wrappers lack .app-student | mitigate | Task 1 and Task 3 explicitly add `app-student` class to unauthenticated wrappers at lines ~253 and ~842 |
| T-20-06 | Denial of Service | `bm-glass-card` cursor:pointer on non-interactive divs | accept | .bm-glass-card CSS includes cursor:pointer by design (from PATTERNS.md); all card wrappers are intended to be clickable |
</threat_model>

<verification>
After all 3 tasks complete:

```bash
# No clay cards remain in any student file
grep -rn "bm-clay-card-student" src/pages/student/ src/components/student/

# No hardcoded orange tokens remain
grep -rn "#F97316\|#92400E\|#FFEDD5\|#FFF7ED\|#F3F0ED" src/pages/student/ src/components/student/

# Glass cards present in all modified files
grep -l "bm-glass-card" src/pages/student/CoursesPage.tsx src/pages/student/CataloguePage.tsx src/pages/student/ProfilePage.tsx src/pages/student/CourseDetailPage.tsx

# Progress bars updated
grep -rn "bm-progress-indigo" src/pages/student/ src/components/student/

# Full student test suite
yarn test src/pages/student/ src/components/student/
```

Both grep-for-old (must be empty) and grep-for-new (must have results) must pass.
</verification>

<success_criteria>
- `grep -rn "bm-clay-card-student" src/pages/student/ src/components/student/` returns 0 matches
- `grep -rn "#F97316\|#92400E\|#FFEDD5" src/pages/student/ src/components/student/` returns 0 matches
- `bm-glass-card` appears in CoursesPage, CataloguePage, ProfilePage (×3), CourseDetailPage
- `bm-progress-indigo` appears in CoursesPage and LessonSidebar
- Gradient h1 (`from-indigo-600 to-purple-600 bg-clip-text text-transparent`) present in CoursesPage and CataloguePage
- `yarn test src/pages/student/ src/components/student/` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-P02-SUMMARY.md`
</output>
