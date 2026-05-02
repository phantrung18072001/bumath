---
plan: 12-01
phase: 12-admin-detail-pages
status: complete
completed: 2026-05-02
---

## Summary

Rewrote ChaptersPage and LessonsPage to support drag-and-drop reordering using @dnd-kit. Users can now drag rows to reorder chapters/lessons; order is persisted to Supabase via batch update on drag end.

## What Was Built

- **ChaptersPage.tsx** — Full rewrite: DndContext + SortableContext wrapping table rows; `SortableChapterRow` component with GripVertical drag handle; `handleDragEnd` calls `batchReorderChapters`; optimistic UI via queryClient invalidation
- **LessonsPage.tsx** — Full rewrite: same dnd-kit pattern; `SortableLessonRow` with GripVertical; `handleDragEnd` calls `batchReorderLessons`
- **Test fixes** — `beforeEach` mock restoration pattern; `waitFor()` for chained-query loading tests

## Key Files

- `src/pages/admin/ChaptersPage.tsx`
- `src/pages/admin/LessonsPage.tsx`
- `src/pages/admin/ChaptersPage.test.tsx`
- `src/pages/admin/LessonsPage.test.tsx`

## Commit

d526cd9 — Plan 12-01: dnd-kit drag reorder ChaptersPage/LessonsPage
