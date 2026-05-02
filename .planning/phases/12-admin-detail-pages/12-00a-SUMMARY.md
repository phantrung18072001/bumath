---
plan: 12-00a
phase: 12-admin-detail-pages
status: complete
completed: 2026-05-02
---

## Summary

Installed @dnd-kit/core, @dnd-kit/sortable, and @dnd-kit/utilities packages. Added API foundation functions required by subsequent Phase 12 plans.

## What Was Built

- **@dnd-kit packages installed** — @dnd-kit/core@6.3.1, @dnd-kit/sortable@10.0.0, @dnd-kit/utilities@3.2.2
- **batchReorderChapters** — Added to `src/lib/api/chapters.ts`; batch-updates order_index for all chapters after drag-and-drop
- **batchReorderLessons** — Added to `src/lib/api/lessons.ts`; batch-updates order_index for all lessons after drag-and-drop
- **getAllSubmissions + SubmissionsFilter + PaginatedSubmissions** — Added to `src/lib/api/submissions.ts`; server-side filtered and paginated submissions query with status/grade/course/lesson/studentName filters

## Key Files

- `package.json` — dnd-kit dependencies added
- `src/lib/api/chapters.ts` — batchReorderChapters exported
- `src/lib/api/lessons.ts` — batchReorderLessons exported
- `src/lib/api/submissions.ts` — getAllSubmissions, SubmissionsFilter, PaginatedSubmissions exported

## Self-Check: PASSED

All must_have truths verified:
- @dnd-kit packages installed and importable ✓
- batchReorderChapters exported from chapters.ts ✓
- batchReorderLessons exported from lessons.ts ✓
- getAllSubmissions and SubmissionsFilter exported from submissions.ts ✓
