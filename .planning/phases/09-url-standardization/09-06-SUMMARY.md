---
plan: 09-06
phase: 09-url-standardization
status: complete
self_check: PASSED
---

## Summary
Updated CourseDetailPage.tsx and all 4 landing components (Header, ClassGrid, IntensiveSection).

## Key Changes
- CourseDetailPage.tsx: back nav /khoa-hoc/danh-muc, /dang-nhap links
- Header.tsx: /khoa-hoc, /dang-nhap links
- ClassGrid.tsx: /danh-muc?lop=\${c.level} (using level not grade enum)
- IntensiveSection.tsx: /danh-muc?lop=nang-cao
