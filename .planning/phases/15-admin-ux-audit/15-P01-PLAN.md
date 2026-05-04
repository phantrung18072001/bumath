---
plan: P01
phase: 15
wave: 1
depends_on: []
autonomous: true
files_modified:
  - src/App.tsx
  - src/pages/student/CourseDetailPage.tsx
requirements:
  - ADMIN-01

must_haves:
  truths:
    - "Admin course URL `/quan-tri/khoa-hoc/:courseSlug` renders the same CourseDetailPage component family as student `/khoa-hoc/:courseSlug` with admin mode enabled"
    - "Route `/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug` is removed from App.tsx"
    - "When admin mode is on, lesson lists are loaded via `fetchLessons` per chapter, not `fetchLessonsForStudent`"
  artifacts:
    - path: src/App.tsx
      provides: "Admin course detail route points to shared page; nested chapter route removed"
    - path: src/pages/student/CourseDetailPage.tsx
      provides: "isAdmin prop + correct lesson fetch branch"
  key_links:
    - from: "admin route"
      to: "CourseDetailPage"
      via: "isAdmin true"
---

# P01 — Shared course detail shell + routing

**Objective:** Unify admin and student course detail behind one page component and correct data loading for editors.

<threat_model>
**ASVS L1 (UI / routing)**

| ID | Threat | Severity | Mitigation in this plan |
|----|--------|----------|-------------------------|
| T-15-A | Non-admin opens admin URL and mutates content | High | No mutations in P01 — route remains `ProtectedRoute requiredRole=\"admin\"`; only shell |
| T-15-B | Student page accidentally wrapped in admin layout | Medium | Change only the admin route `element=` tree; do not alter `/khoa-hoc/:courseSlug` wrapper |
**Block on:** High only.
</threat_model>

---

<task id="T01" type="execute">
  <title>Wire App.tsx admin course route to shared CourseDetailPage</title>

  <read_first>
    - src/App.tsx (full file)
    - .planning/phases/15-admin-ux-audit/15-CONTEXT.md § D-01, D-05
  </read_first>

  <action>
  1. Remove import of `LessonsPage` and `ChaptersPage` if no longer referenced.
  2. Import the student course detail component (same symbol used today for `/khoa-hoc/:courseSlug`, currently `StudentCourseDetailPage` from `./pages/student/CourseDetailPage`).
  3. Replace the `Route` for `path="/quan-tri/khoa-hoc/:courseSlug"` so `element` renders that component with prop `isAdmin={true}` inside the existing `ProtectedRoute` + `StudentLayout` + `AdminLayout` chain (identical auth wrapper as today).
  4. Delete the `Route` whose path is exactly `/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug`.
  </action>

  <acceptance_criteria>
  - `grep -n 'chuong/:chapterSlug' src/App.tsx` returns no matches
  - `grep -n 'isAdmin' src/App.tsx` returns at least one match on the admin course detail route line
  - `grep -n 'LessonsPage' src/App.tsx` returns no matches (import and route removed)
  - `yarn lint` exits 0
  </acceptance_criteria>
</task>

---

<task id="T02" type="execute">
  <title>Add isAdmin prop + fetchLessons branch on CourseDetailPage</title>

  <read_first>
    - src/pages/student/CourseDetailPage.tsx (full file)
    - src/lib/api/lessons.ts (read `fetchLessons` and `fetchLessonsForStudent` signatures and comments)
    - .planning/phases/15-admin-ux-audit/15-CONTEXT.md § D-04
  </read_first>

  <action>
  1. Extend the default-exported page component to accept optional React props `{ isAdmin?: boolean }` with default `isAdmin = false` when used from the student route without props.
  2. In the `useQuery` that builds `lessonsByChapter`, when `isAdmin === true`, call `fetchLessons(c.id)` inside the `Promise.all`; when false, keep existing `fetchLessonsForStudent(c.id)` behavior unchanged.
  3. Pass `isAdmin={isAdmin}` into `LessonSidebar` (prop may be unused until P02 — TypeScript must allow it: add optional `isAdmin?: boolean` to `LessonSidebarProps` in P02 or add prop now with no UI change).
  4. Ensure student route behavior is unchanged: with default props, same queries and same UI tree as before P01.
  </action>

  <acceptance_criteria>
  - `grep -n 'fetchLessonsForStudent' src/pages/student/CourseDetailPage.tsx` shows the call only inside a branch where `isAdmin` is false (or equivalent ternary)
  - `grep -n 'fetchLessons(' src/pages/student/CourseDetailPage.tsx` shows use when `isAdmin` is true
  - `grep -n 'isAdmin' src/pages/student/CourseDetailPage.tsx` returns at least 3 lines (props + branch + prop pass)
  - `yarn build` exits 0
  </acceptance_criteria>
</task>

---

## PLAN COMPLETE
