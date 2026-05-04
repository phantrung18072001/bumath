# P02 Summary — Admin sidebar controls + inline forms

**Status:** Complete

## What Was Built

- `ChapterInlineForm` and `LessonInlineForm`: non-dialog forms using `bm-clay-card-student` / `#F0FDFA` and shadcn Form/Input/Textarea (logic from former dialog bodies).
- `ChapterFormDialog` / `LessonFormDialog` removed from `src/` once nothing imported them — inline forms are the single source.
- `LessonSidebar`: when `isAdmin`, hides progress header; drag handles + reorder via `@dnd-kit`; per-chapter/per-lesson add, edit, delete; `DndContext` + nested `SortableContext` for chapters and lessons.
- `CourseDetailPage`: single `adminPanel` state machine (one inline form at a time), delete confirm `AlertDialog`s, mutations for reorder/delete aligned with former admin pages.

## Artifacts

| File | Change |
|------|--------|
| `src/components/admin/ChapterInlineForm.tsx` | New |
| `src/components/admin/LessonInlineForm.tsx` | New |
| `src/components/student/LessonSidebar.tsx` | Admin UI + DnD |
| `src/pages/student/CourseDetailPage.tsx` | Admin mutations, inline forms, sidebar wiring |
| `src/pages/admin/ChaptersPage.tsx` | Removed |
| `src/pages/admin/LessonsPage.tsx` | Removed |
| `src/pages/admin/ChaptersPage.test.tsx` | Removed |
| `src/pages/admin/LessonsPage.test.tsx` | Removed |

## Self-Check

- `yarn build` — PASS  
- `yarn test` — PASS
