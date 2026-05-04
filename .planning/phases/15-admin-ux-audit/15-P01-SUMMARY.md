# P01 Summary — Shared course detail shell + routing

**Status:** Complete

## What Was Built

- Admin route `/quan-tri/khoa-hoc/:courseSlug` renders `CourseDetailPage` with `isAdmin` (same component family as student `/khoa-hoc/:courseSlug`).
- Removed nested route `/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug` and deleted standalone `ChaptersPage` / `LessonsPage` usage from `App.tsx`.
- Lessons for admin load via `fetchLessons` per chapter; students keep `fetchLessonsForStudent` with query key scoped by `admin` | `student`.
- Authenticated admin layout: no duplicate `StudentLayout` — outer route supplies `StudentLayout` + `AdminLayout`; course page uses negative margin to offset `AdminLayout` container padding.

## Artifacts

| File | Change |
|------|--------|
| `src/App.tsx` | Admin course route → `StudentCourseDetailPage isAdmin`; removed chapter slug route and old page imports |
| `src/pages/student/CourseDetailPage.tsx` | `isAdmin` prop, lesson fetch branch, enrollment bypass for admin, back link to `/quan-tri/khoa-hoc` |

## Self-Check

- `yarn build` — PASS
