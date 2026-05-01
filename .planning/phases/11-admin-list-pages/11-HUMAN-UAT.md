---
status: resolved
phase: 11-admin-list-pages
source: [11-VERIFICATION.md]
started: 2026-05-01T14:22:00Z
updated: 2026-05-01T16:30:00Z
---

## Current Test

resolved

## Tests

### 1. Visual design consistency of admin list pages
expected: Toolbar (search + filter), table, and pagination on UsersPage (/quan-tri/nguoi-dung) and CoursesPage (/quan-tri/khoa-hoc) should feel visually consistent with the rest of the admin UI (colors, spacing, typography). Toolbar should be neatly aligned, skeleton rows visible during loading, pagination appears only when items exceed page limit.
result: 2 issues reported and fixed:
- Pagination layout broken (selector appeared alone on 1-page views) → gated inside totalPages > 1, changed to flex-wrap layout
- CoursesPage header had "Khóa học" breadcrumb and "Chấm bài →" link cluttering the toolbar → both removed

## Summary

total: 1
passed: 1
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
