---
plan: P02
phase: 15
wave: 2
depends_on:
  - P01
autonomous: false
files_modified:
  - src/components/student/LessonSidebar.tsx
  - src/components/admin/ChapterFormDialog.tsx
  - src/components/admin/LessonFormDialog.tsx
  - src/pages/student/CourseDetailPage.tsx
  - src/pages/admin/ChaptersPage.tsx
  - src/pages/admin/LessonsPage.tsx
requirements:
  - ADMIN-01
  - ADMIN-02
  - ADMIN-03

must_haves:
  truths:
    - "When `isAdmin` is true, sidebar shows reorder handles and add/edit/delete actions per CONTEXT D-03–D-05"
    - "Chapter and lesson create/edit use inline expandable UI in the sidebar, not `Dialog` modals, per D-06–D-10"
    - "Inline forms use shadcn Input/Textarea/Form/Label consistent with existing dialog forms (D-15)"
    - "After successful mutation, queries invalidate and inline form closes without `navigate()` (D-10)"
  artifacts:
    - path: src/components/student/LessonSidebar.tsx
      provides: "Admin controls + inline form mount points"
    - path: src/components/admin/ChapterInlineForm.tsx
      provides: "Optional new file — chapter inline form (may start as refactor of ChapterFormDialog)"
    - path: src/components/admin/LessonInlineForm.tsx
      provides: "Optional new file — lesson inline form"
  key_links:
    - from: "LessonSidebar"
      to: "ChapterInlineForm / LessonInlineForm"
      via: "expanded state in parent or sidebar"
---

# P02 — Admin sidebar: controls + inline forms

**Objective:** Implement CONTEXT decisions D-03 through D-10 and D-14–D-15: admin-only controls and inline chapter/lesson forms inside `LessonSidebar`, reusing form logic from existing dialog components.

<threat_model>
| ID | Threat | Severity | Mitigation |
|----|--------|----------|------------|
| T-15-C | IDOR — edit wrong chapter/lesson | High | Mutations must use IDs from the same `useQuery` tree as the sidebar; no trust of client-only slug without server validation (existing API) |
| T-15-D | XSS via title/description fields | Medium | Keep React controlled inputs; do not introduce `dangerouslySetInnerHTML` for user titles |
**Block on:** High.
</threat_model>

---

<task id="T01" type="execute">
  <title>Extend LessonSidebar for isAdmin + admin actions shell</title>

  <read_first>
    - src/components/student/LessonSidebar.tsx
    - src/pages/admin/ChaptersPage.tsx (DnD + button row patterns)
    - .planning/phases/15-admin-ux-audit/15-UI-SPEC.md § Layout Contract, Sidebar Structure
  </read_first>

  <action>
  1. Add optional prop `isAdmin?: boolean` (default `false`) to `LessonSidebar`.
  2. When `isAdmin` is true: hide the progress block at the top of the sidebar (per UI-SPEC: "hidden when isAdmin"); when false, keep current progress UI unchanged.
  3. When `isAdmin` is true: render per-chapter and per-lesson action affordances (drag handle placeholder OK in this task if DnD lands in T02 — at minimum render non-functional buttons wired with `type="button"` OR skip buttons until T02 if you split; **preferred:** full buttons with handlers stubbed to `toast.info` only if T02 completes same commit — otherwise implement handlers in T02).
  4. Add callback props required for later tasks: `onReorderChapters`, `onReorderLessons`, `onAddChapter`, `onEditChapter`, `onDeleteChapter`, `onAddLesson`, `onEditLesson`, `onDeleteLesson` — typed; CourseDetailPage passes implementations that call existing mutations from admin pages or API modules.
  </action>

  <acceptance_criteria>
  - `grep -n 'isAdmin' src/components/student/LessonSidebar.tsx` returns at least 5 lines
  - `grep -n 'progress' src/components/student/LessonSidebar.tsx` shows conditional rendering tied to `isAdmin` (admin hides block)
  - `yarn test` exits 0 (fix any type errors in callers with minimal stubs)
  </acceptance_criteria>
</task>

---

<task id="T02" type="execute">
  <title>Inline forms + DnD + remove dead admin pages from build</title>

  <read_first>
    - src/components/admin/ChapterFormDialog.tsx
    - src/components/admin/LessonFormDialog.tsx
    - src/pages/admin/ChaptersPage.tsx
    - src/pages/admin/LessonsPage.tsx
    - src/pages/student/CourseDetailPage.tsx
  </read_first>

  <action>
  1. Extract form field JSX + schema from `ChapterFormDialog` into `ChapterInlineForm` (new file under `src/components/admin/`) using a non-dialog container with class `bm-clay-card-student` or equivalent from UI-SPEC; remove reliance on `Dialog` wrapper for the add/edit flow used from sidebar.
  2. Same for `LessonFormDialog` → `LessonInlineForm`.
  3. Move chapter/lesson reorder mutations and sensors from `ChaptersPage`/`LessonsPage` into `CourseDetailPage` (or colocated hooks) and connect to `LessonSidebar` DnD events when `isAdmin`.
  4. Wire expand state: only one inline form open at a time (`expanded` state machine in `CourseDetailPage` per CONTEXT Claude's Discretion).
  5. Delete `src/pages/admin/ChaptersPage.tsx` and `src/pages/admin/LessonsPage.tsx` **only after** no imports reference them (App.tsx already updated in P01).
  6. Keep `ChapterFormDialog`/`LessonFormDialog` as thin wrappers **only if** still used elsewhere; otherwise remove exports and update imports project-wide.
  </action>

  <acceptance_criteria>
  - `test ! -f src/pages/admin/ChaptersPage.tsx` and `test ! -f src/pages/admin/LessonsPage.tsx` both succeed (files removed)
  - `grep -r 'ChaptersPage' src/` returns no matches
  - `grep -r 'LessonsPage' src/` returns no matches
  - `grep -n 'ChapterInlineForm\\|LessonInlineForm' src/components/student/LessonSidebar.tsx` OR parent passes them as children — at least one file under `src/components/admin/` contains string `ChapterInlineForm` as export name
  - `yarn build` exits 0
  </acceptance_criteria>
</task>

---

## PLAN COMPLETE
