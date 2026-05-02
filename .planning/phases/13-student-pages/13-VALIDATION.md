---
phase: 13
slug: student-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `yarn test src/pages/student/CoursesPage.test.tsx` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/pages/student/[Page].test.tsx` (page-specific)
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-CSS-01 | CSS | 0 | DS-01 | manual | `yarn dev` (visual check) | — | ⬜ pending |
| 13-COURSES-01 | CoursesPage | 1 | STUDENT-UI-01 | unit | `yarn test src/pages/student/CoursesPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 13-COURSES-02 | CoursesPage | 1 | STUDENT-UI-01 | unit | `yarn test src/pages/student/CoursesPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 13-COURSES-03 | CoursesPage | 1 | STUDENT-UI-04 | unit | `yarn test src/pages/student/CoursesPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 13-COURSES-04 | CoursesPage | 1 | DS-02 | unit | `yarn test src/pages/student/CoursesPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 13-DETAIL-01 | CourseDetail | 1 | STUDENT-UI-02 | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx` | ✅ extend | ⬜ pending |
| 13-DETAIL-02 | CourseDetail | 1 | STUDENT-UI-02 | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx` | ✅ extend | ⬜ pending |
| 13-CAT-01 | Catalogue | 1 | STUDENT-UI-03 | unit | `yarn test src/pages/student/CataloguePage.test.tsx` | ✅ extend | ⬜ pending |
| 13-CAT-02 | Catalogue | 1 | STUDENT-UI-03 | unit | `yarn test src/pages/student/CataloguePage.test.tsx` | ✅ extend | ⬜ pending |
| 13-CAT-03 | Catalogue | 1 | STUDENT-UI-04 | unit | `yarn test src/pages/student/CataloguePage.test.tsx` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/student/CoursesPage.test.tsx` — stubs for STUDENT-UI-01, STUDENT-UI-04, DS-02 (new file)
- [ ] `src/index.css` — add `.bm-clay-card-student`, `.bm-progress-teal`, font imports

*Existing files: `CataloguePage.test.tsx` and `CourseDetailPage.test.tsx` require test additions but files already exist.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CSS variables apply correct teal clay card styling | DS-01 | Visual styling not testable in jsdom | Run `yarn dev`, open `/courses`, verify card bg is `#F0FDFA`, border `#99F6E4` |
| Progress bar fill is teal (#0D9488) via `.bm-progress-teal` override | DS-01 | CSS cascade not fully testable in jsdom | Inspect `.bm-progress-teal > div` in DevTools |
| Mobile sidebar: Sheet drawer opens/closes at 375px viewport | STUDENT-UI-02 | Viewport resize not reliable in jsdom | Use DevTools responsive mode at 375px |
| Video embed is primary content area at all viewports | STUDENT-UI-02 | Layout proportion is visual | Open `/khoa-hoc/[slug]/[lessonId]`, verify video fills main area |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
