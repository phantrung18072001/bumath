---
phase: 16
status: testing
created: 2026-05-07
---

# Phase 16 — UAT

## Results

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1 | Migration applied (table + bucket exist) | ✅ | |
| 2 | Tab switching — no page reload, sidebar unchanged | ❌ | Video nằm ngoài tab (trên tab bar); mong muốn video ở trên tab bar cố định |
| 3 | Lesson change resets to Tab 1 "Bài giảng" | ⬜ | |
| 4 | No assignment_path → only 2 tabs (Bài giảng + Thảo luận) | ⬜ | |
| 5 | With assignment_path → all 3 tabs visible | ⬜ | |
| 6 | No body scrollbar on any tab | ⬜ | |
| 7 | Admin sees "Thêm tài liệu" button; student does not | ⬜ | |
| 8 | Admin upload: form opens inline, file uploads, list refreshes | ⬜ | |
| 9 | Admin delete: confirm dialog appears, list refreshes after | ⬜ | |
| 10 | Student downloads material via signed URL (new tab) | ⬜ | |
| 11 | LessonProgressButton visible at bottom of Tab 1 | ⬜ | |
| 12 | Tab 3 "Thảo luận" shows placeholder text | ⬜ | |
| 13 | Category filter works in materials list | ⬜ | |

## Current Test
1

## Issues

**I-01 (layout):** Video hiển thị ngoài tab, phía trên tab bar thay vì trong Tab 1. User muốn: video (+ mô tả) luôn hiển thị phía trên tab bar, tabs chia nội dung bên dưới.

**I-02 (empty state):** Section "Tài liệu học tập" hiển thị empty state khi không có tài liệu. User muốn: không render section này nếu không có tài liệu (ít nhất với học sinh).
