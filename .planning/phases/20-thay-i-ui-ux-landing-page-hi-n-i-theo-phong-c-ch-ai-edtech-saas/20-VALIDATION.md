---
phase: 20
slug: thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-08
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3 + React Testing Library + jsdom |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `yarn test src/pages/student/ src/pages/admin/ src/components/student/ src/components/admin/` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command above
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Behavior | Test Type | Automated Command | File Exists |
|---------|------|------|-------------|----------|-----------|-------------------|-------------|
| 20-P01-CSS-vars | P01 | 1 | CSS-01 | `--primary` var updated to indigo in :root | Manual visual + grep | `grep -n "245 94% 58%" src/index.css` | ✅ |
| 20-P01-glass-card | P01 | 1 | CSS-02 | `.bm-glass-card` class defined in index.css | Grep | `grep -n "bm-glass-card" src/index.css` | ✅ |
| 20-P01-clay-removed | P01 | 1 | CSS-03 | `.bm-clay-card-student` removed from JSX | Grep | `grep -rn "bm-clay-card-student" src/pages/ src/components/student/` → empty | ✅ |
| 20-P01-bg-gradient | P01 | 1 | BG-01 | StudentLayout root uses gradient bg | Unit (className) | `npx vitest run src/components/student/StudentLayout.test.tsx` | ✅ |
| 20-P01-landing-safe | P01 | 1 | SAFE-01 | Landing page NOT affected by --primary change | Grep | `grep -r "bm-glass-card\|indigo-600" src/pages/Index.tsx src/components/landing/` → empty | Manual |
| 20-P02-student-render | P02 | 2 | STU-01 | All student pages render without crash | Unit | `npx vitest run src/pages/student/` | ✅ |
| 20-P02-courses-glass | P02 | 2 | STU-02 | CoursesPage cards use bm-glass-card | Unit (className) | `npx vitest run src/pages/student/CoursesPage.test.tsx` | ✅ |
| 20-P02-catalogue-pills | P02 | 2 | STU-03 | CataloguePage filter pills use indigo | Unit | `npx vitest run src/pages/student/CataloguePage.test.tsx` | ✅ |
| 20-P02-detail-render | P02 | 2 | STU-04 | CourseDetailPage renders without crash | Unit | `npx vitest run src/pages/student/CourseDetailPage.test.tsx` | ✅ |
| 20-P03-admin-layout | P03 | 3 | ADM-01 | AdminLayout renders without crash | Unit | `npx vitest run src/components/admin/AdminLayout.test.tsx` | ✅ |
| 20-P03-admin-courses | P03 | 3 | ADM-02 | Admin CoursesPage renders table | Unit | `npx vitest run src/pages/admin/CoursesPage.test.tsx` | ✅ |
| 20-P03-admin-users | P03 | 3 | ADM-03 | Admin UsersPage renders | Unit | `npx vitest run src/pages/admin/UsersPage.test.tsx` | ✅ |
| 20-P03-admin-subs | P03 | 3 | ADM-04 | Admin SubmissionsPage renders | Unit | `npx vitest run src/pages/admin/SubmissionsPage.test.tsx` | ✅ |

---

## Wave 0 Requirements

Existing infrastructure covers all phase behaviors — this is a UI-only className/CSS migration with no logic changes. No Wave 0 test stubs required.

**Note:** Some tests may need minor assertion updates where they assert on specific className values (e.g., `bm-clay-card-student` → `bm-glass-card`). These updates are part of the migration tasks, not new Wave 0 work.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Landing page color unchanged | SAFE-01 | `text-primary` in landing is in scope but must stay orange-compatible or planner must scope CSS vars to admin/student context | After P01: check `BuMath<span class="text-primary">` renders with indigo on landing — if broken, switch to scoped CSS vars approach |
| Glassmorphism visual quality | CSS-02 | Backdrop-blur is a visual effect not testable in jsdom | After P02: manual browser check that cards show blur/frosted-glass effect |
| Gradient background smooth | BG-01 | Visual gradient not testable in jsdom | After P01: manual check gradient is subtle and readable |
| No WCAG contrast regression | SAFE-02 | Jsdom doesn't compute contrast | After P03: spot-check indigo text on white/glass backgrounds with browser DevTools |

---

## Critical Risk: CSS Variable Landing Page Leak

**Risk:** Changing `--primary` from orange (`24 95% 53%`) to indigo (`245 94% 58%`) affects ALL `text-primary` / `bg-primary` usages globally — including the landing page which has 20+ instances.

**Mitigation options (planner must choose one):**
1. **Scoped override (preferred):** Apply `--primary: indigo` only under `.student-context` and `.admin-context` wrapper classes, keeping landing page orange. Requires adding wrapper class to StudentLayout and AdminLayout.
2. **Global + landing override:** Update `--primary` globally to indigo, then add explicit orange overrides in `src/components/landing/` and `src/pages/Index.tsx` where needed.
3. **No CSS var change:** Use explicit `bg-indigo-600` / `text-indigo-600` Tailwind classes everywhere instead of `bg-primary` / `text-primary`.

The planner MUST pick one approach and be consistent across all plans.

---

## Validation Sign-Off

- [ ] All tasks have automated verify or manual instructions
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0: not required (existing infrastructure sufficient)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
