---
plan: P03
phase: 15
wave: 3
depends_on:
  - P02
autonomous: true
files_modified:
  - src/pages/admin/UsersPage.tsx
  - src/pages/admin/CoursesPage.tsx
  - src/pages/admin/GradingPage.tsx
  - src/components/landing/Header.tsx
  - .planning/REQUIREMENTS.md
  - .planning/ROADMAP.md
requirements:
  - AUDIT-01
  - ADMIN-01
  - ADMIN-02
  - ADMIN-03

must_haves:
  truths:
    - "REQUIREMENTS.md ADMIN-01 and ADMIN-02 bullets describe inline expandable forms (not separate pages), matching shipped behavior"
    - "ROADMAP Phase 15 success criteria 2–3 describe inline expansion in sidebar (not separate URLs)"
    - "Known orphan buttons from 15-CONTEXT code_context are wired or intentionally removed with product-approved copy"
  artifacts:
    - path: .planning/REQUIREMENTS.md
      provides: "Traceability text aligned with Phase 15 delivery"
    - path: .planning/ROADMAP.md
      provides: "Success criteria aligned with CONTEXT"
  key_links:
    - from: "AUDIT-01"
      to: "admin + student + landing link fixes"
      via: "this plan tasks"
---

# P03 — Broken-link audit + requirements alignment

**Objective:** Close AUDIT-01 (no dead in-scope links/buttons) and align `REQUIREMENTS.md` / `ROADMAP.md` with inline-form decisions so planners and auditors are not misled.

<threat_model>
| ID | Threat | Severity | Mitigation |
|----|--------|----------|------------|
| T-15-E | `javascript:` or unsafe `href` added while fixing buttons | High | Only use in-app paths from `react-router` `<Link to=\"...\">` or `useNavigate` to known routes |
**Block on:** High.
</threat_model>

---

<task id="T01" type="execute">
  <title>Fix known orphan admin buttons (CONTEXT list)</title>

  <read_first>
    - src/pages/admin/UsersPage.tsx
    - src/pages/admin/CoursesPage.tsx
    - src/pages/admin/GradingPage.tsx
    - .planning/phases/15-admin-ux-audit/15-CONTEXT.md § code_context
  </read_first>

  <action>
  For each file listed in 15-CONTEXT `### Broken Links to Investigate`, add a **concrete** handler or navigation:
  - `UsersPage.tsx` ~line 93: give the Button a real `onClick` (e.g. navigate to existing detail route) **or** convert to `Link` with a valid `to` path that exists in `App.tsx`.
  - `CoursesPage.tsx` lines ~243,252,261,276: same — each control must either submit a form, open a documented dialog that exists in code, or `navigate()` / `<Link>` to a real route.
  - `GradingPage.tsx` lines ~272,284,297,305,336,349,357: same.
  If a feature is genuinely not built, CONTEXT D-12 says ask product — **in execution**, add `TODO(phase16):` comment + `disabled` + `title` tooltip explaining "coming soon" is **NOT** allowed per D-12; instead wire minimal real behavior (e.g. scroll to section, open existing modal) or escalate — for planning, prefer wiring to closest existing route (e.g. course list).
  </action>

  <acceptance_criteria>
  - `grep -n '<Button' src/pages/admin/UsersPage.tsx | head -5` — every Button either has `onClick=` or `asChild` wrapping a child with navigation, or `type=\"submit\"` inside a `<form>`
  - Same check passes for `CoursesPage.tsx` and `GradingPage.tsx` using manual review + `grep '<Button'` showing no orphan pattern (document in commit message if any Button intentionally `disabled` with external blocker)
  - `yarn lint` exits 0
  </acceptance_criteria>
</task>

---

<task id="T02" type="execute">
  <title>Sweep student + landing for broken Link / href / Button</title>

  <read_first>
    - src/App.tsx (all route paths)
    - src/components/landing/Header.tsx
    - src/pages/student/ (list tsx files)
  </read_first>

  <action>
  1. Grep `src/components/landing` and `src/pages/student` for `<Link to={` and string literals — each `to=` value must match a route prefix declared in `App.tsx` (account for dynamic segments).
  2. Fix any 404 paths found (concrete path rewrites).
  3. Header: ensure CTA buttons link to in-app routes or valid external URLs with `https://`.
  </action>

  <acceptance_criteria>
  - `grep -r "to='/[^']*'" src/components/landing src/pages/student | wc -l` is documented in task notes; zero occurrences of obvious stale paths like `/courses` if App uses `/khoa-hoc` (adjust to actual routing table)
  - `yarn build` exits 0
  </acceptance_criteria>
</task>

---

<task id="T03" type="execute">
  <title>Verify REQUIREMENTS.md and ROADMAP Phase 15 match inline forms (fix drift if any)</title>

  <read_first>
    - .planning/REQUIREMENTS.md (Admin UX section)
    - .planning/ROADMAP.md (Phase 15 block)
    - .planning/phases/15-admin-ux-audit/15-CONTEXT.md § domain (requirement update note)
  </read_first>

  <action>
  These files may already be aligned during `/gsd-plan-phase 15`. If `grep` checks in acceptance_criteria fail, apply edits so ADMIN-01/ADMIN-02 describe **inline sidebar forms** on `/quan-tri/khoa-hoc/:courseSlug` (no modal dialog, no child route), ROADMAP Phase 15 success criteria 2–3 match the same, and ADMIN-03 references student chrome (`#F0FDFA`, `bm-clay-card-student`).
  </action>

  <acceptance_criteria>
  - `grep -n 'ADMIN-01' .planning/REQUIREMENTS.md` shows a line containing the substring `inline` or `sidebar`
  - `grep -n 'ADMIN-02' .planning/REQUIREMENTS.md` shows a line containing the substring `inline` or `sidebar`
  - `grep 'them-chuyen-de' .planning/ROADMAP.md` exits 1 (no matches) OR only matches outside Phase 15 block
  </acceptance_criteria>
</task>

---

## PLAN COMPLETE
