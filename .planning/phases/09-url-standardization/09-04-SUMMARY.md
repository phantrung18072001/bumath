---
plan: 09-04
phase: 09-url-standardization
status: complete
self_check: PASSED
---

## Summary
Updated all URL strings in admin content pages: CoursesPage, ChaptersPage, LessonsPage.

## Key Changes
- CoursesPage.tsx: row-click /admin/courses/:slug → /quan-tri/khoa-hoc/:slug; submissions link
- ChaptersPage.tsx: /chapters/ → /chuong/ in navigate; breadcrumb back to /quan-tri/khoa-hoc
- LessonsPage.tsx: breadcrumb links → /quan-tri/khoa-hoc
