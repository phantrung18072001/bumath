# Phase 15 — Pattern Map

Analogs for new/modified files. Downstream executors should read these before editing.

---

## Shared course detail

| Target | Role | Closest analog | Notes |
|--------|------|----------------|-------|
| `CourseDetailPage` (+ admin flag) | Page shell, queries, layout | `src/pages/student/CourseDetailPage.tsx` | Add `isAdmin?: boolean`; branch lesson API |
| Admin route wrapper | Auth + layout | `src/App.tsx` routes using `ProtectedRoute` + `AdminLayout` | Mirror imports from current admin course routes |

---

## Sidebar + inline forms

| Target | Role | Closest analog | Notes |
|--------|------|----------------|-------|
| `LessonSidebar` admin branch | List + actions + expand | `src/pages/admin/ChaptersPage.tsx` (DnD, buttons) + `LessonSidebar.tsx` (accordion) | Merge behaviors; keep `min-h-[48px]` |
| Inline chapter form | RHF + Zod + mutation | `src/components/admin/ChapterFormDialog.tsx` | Strip `Dialog`, keep form body |
| Inline lesson form | RHF + Zod + uploads | `src/components/admin/LessonFormDialog.tsx` | Strip `Dialog`, keep form body |

---

## API layer

| Target | Role | Closest analog |
|--------|------|------------------|
| Lesson list (admin) | Fetch | `fetchLessons` in `src/lib/api/lessons.ts` |
| Lesson list (student) | Fetch | `fetchLessonsForStudent` same file |

---

## Audit fixes

| Target | Role | Closest analog |
|--------|------|------------------|
| Wire or remove dead buttons | UX | Existing working buttons in same file (e.g. `toast` + `navigate` patterns elsewhere in admin) |

---

## PATTERN MAPPING COMPLETE
