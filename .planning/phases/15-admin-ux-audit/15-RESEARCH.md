# Phase 15 — Technical Research

**Question:** What do we need to know to plan Admin UX + Audit well?

**Phase:** 15 — Admin UX + Audit  
**Sources:** `15-CONTEXT.md`, `15-UI-SPEC.md`, `ROADMAP.md` §Phase 15, `REQUIREMENTS.md` (ADMIN-*, AUDIT-01), current `src/` routes and admin pages.

---

## 1. Scope reconciliation (locked vs legacy roadmap)

- **ROADMAP success criteria** still mention dedicated URLs for “Thêm chuyên đề / Thêm bài giảng”. **`15-CONTEXT.md` overrides:** inline expandable forms in the sidebar (no dedicated routes). Planning and execution **must follow CONTEXT**; **P03** updates `REQUIREMENTS.md` and ROADMAP success criteria text so traceability matches shipped behavior.
- **Route ordering:** Any future literal admin routes under `/quan-tri/khoa-hoc/...` must remain **above** `/quan-tri/khoa-hoc/:courseSlug` in `App.tsx` (Phase 14 constraint). This phase **removes** `/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug`, reducing ordering risk.

---

## 2. Current architecture

| Area | Today | Target |
|------|--------|--------|
| Student course | `StudentCourseDetailPage` at `/khoa-hoc/:courseSlug` | Same component (or renamed export) with `isAdmin` (or path-derived) flag |
| Admin course | `ChaptersPage` → `LessonsPage` nested routes | Single route `/quan-tri/khoa-hoc/:courseSlug` → same detail page + admin chrome |
| Lesson data | `fetchLessonsForStudent` in `CourseDetailPage` | When admin: `fetchLessons` per chapter (full list for editors — see `src/lib/api/lessons.ts` comments) |
| Forms | `ChapterFormDialog`, `LessonFormDialog` | Extract field/schema logic → `ChapterInlineForm` / `LessonInlineForm` (no Dialog), embedded in `LessonSidebar` tree |

---

## 3. Key implementation risks

1. **Double-fetch / wrong API:** Using `fetchLessonsForStudent` for admin may hide lessons students cannot see; admin editing requires **`fetchLessons`** for each chapter when `isAdmin === true`.
2. **Layout regression:** Student route must stay unwrapped by `AdminLayout` if that is current behavior; only admin path wraps with `StudentLayout` + `AdminLayout` + detail.
3. **Dnd-kit + accordion:** `ChaptersPage` / `LessonsPage` already implement sortable rows; logic should **move** into sidebar chapter/lesson rows behind `isAdmin` to avoid duplicating reorder API calls.
4. **Single open inline form:** CONTEXT defers “one at a time” to implementer — recommend **one expansion key** in parent state (`expanded: { type: 'chapter' \| 'lesson', id } | null`) to avoid conflicting edits.
5. **Broken-link audit:** CONTEXT lists known dead `Button`s; full AUDIT-01 requires systematic pass: `Link to=`, `<a href>`, `navigate()`, and `Button` without `onClick`/`asChild`+child link/`type="submit"`.

---

## 4. Files likely touched (execution preview)

- `src/App.tsx` — routes only  
- `src/pages/student/CourseDetailPage.tsx` — `isAdmin`, lesson fetch switch, pass props to sidebar  
- `src/components/student/LessonSidebar.tsx` — admin UI + inline forms + optional DnD  
- `src/components/admin/ChapterFormDialog.tsx` / `LessonFormDialog.tsx` — refactor or wrap  
- `src/pages/admin/ChaptersPage.tsx`, `LessonsPage.tsx` — remove from router; delete or thin re-export after migration  
- `src/pages/admin/*.tsx` (Users, Courses, Grading, …) — audit fixes per CONTEXT list  
- `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` — align ADMIN-01/02 and success criteria with inline approach  

---

## 5. Verification approach

- **Automated:** `yarn lint`, `yarn test`, `yarn build` after each wave.  
- **Manual:** Admin walkthrough on `/quan-tri/khoa-hoc/:slug` — add chapter, edit chapter, reorder, add lesson, edit lesson; student walkthrough on `/khoa-hoc/:slug` — no admin controls, enrollment gating unchanged.

---

## Validation Architecture

Nyquist / Dimension 8 hook: validation strategy is captured in **`15-VALIDATION.md`**. Research confirms **Vitest** is the project test runner (`yarn test`). Plans reference concrete commands in `<acceptance_criteria>` and validation table maps tasks → commands.

---

## RESEARCH COMPLETE

Research sufficient to produce `15-VALIDATION.md`, `15-PATTERNS.md`, and wave-based `15-P0x-PLAN.md` files. Re-run with `/gsd-plan-phase 15 --research` only if backend or routing assumptions change materially.
