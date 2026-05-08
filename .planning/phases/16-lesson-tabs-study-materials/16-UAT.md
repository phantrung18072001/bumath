---
phase: 16
status: complete
created: 2026-05-07
updated: 2026-05-08
passed: 12
issues: 0
skipped: 1
---

# Phase 16 — UAT

## Results

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1 | Migration applied (table + bucket exist) | ✅ | |
| 2 | Tab switching — no page reload, sidebar unchanged | ✅ | Fixed: video + description now above tab bar |
| 3 | Lesson change resets to Tab 1 "Bài giảng" | ✅ | |
| 4 | No assignment_path → only 2 tabs (Bài giảng + Thảo luận) | ✅ | |
| 5 | With assignment_path → all 3 tabs visible | ✅ | |
| 6 | No body scrollbar on any tab | ✅ | |
| 7 | Admin sees "Thêm tài liệu" button; student does not | ✅ | Nút chỉ hiển thị ở edit mode — đúng thiết kế |
| 8 | Admin upload: form opens inline, file uploads, list refreshes | ✅ | Fixed: simplified to file picker → thumbnail, no form |
| 9 | Admin delete: confirm dialog appears, list refreshes after | ✅ | |
| 10 | Student downloads material via signed URL (new tab) | ✅ | Download button tải file; Open button mở tab mới |
| 11 | LessonProgressButton visible at bottom of Tab 1 | ✅ | |
| 12 | Tab 3 "Thảo luận" shows placeholder text | ✅ | |
| 13 | Category filter works in materials list | ⏭️ | Out of scope — filter thuộc về thư viện tài liệu global (phase riêng); phase 16 chỉ có Tài liệu đính kèm trong bài học |

## Current Test
1

## Issues

**I-01 (layout):** Video hiển thị ngoài tab, phía trên tab bar thay vì trong Tab 1. User muốn: video (+ mô tả) luôn hiển thị phía trên tab bar, tabs chia nội dung bên dưới.

**I-02 (empty state):** Section "Tài liệu học tập" hiển thị empty state khi không có tài liệu. User muốn: không render section này nếu không có tài liệu (ít nhất với học sinh).

~~**I-03:** Removed — behavior by design. Admin view mode = student UI; add button only in edit mode.~~

**I-05 (admin upload, major):** Admin ở edit mode không thấy UI upload/quản lý tài liệu đính kèm — màn hình edit hiển thị giống student view, không có nút "Thêm tài liệu" hay form upload.

**I-04 (image sizing, cosmetic):** Màn học sinh — "Hình ảnh phản hồi từ giáo viên" và "Nộp bài làm" hiển thị ảnh cứng 200×200px thay vì responsive/auto sizing.
  - Root cause: `SubmissionArea.tsx:175` dùng `h-[100px] w-[100px]`; line 244 dùng `h-32` fixed cho teacher feedback images.

**I-05 (admin upload, major):** Admin ở edit mode không có UI upload/quản lý Tài liệu đính kèm.
  - Root cause: `StudyMaterialsList` nằm trong `LessonContent` (`LessonContent.tsx:159`). Khi admin click "Sửa bài học", `adminPanel` được set → `CourseDetailPage.tsx:510` render `LessonInlineForm` thay thế toàn bộ `LessonContent`, làm mất `StudyMaterialsList`.
  - Fix: Thêm `StudyMaterialsList isAdmin` vào block `lesson-edit` của adminPanel (`CourseDetailPage.tsx:535-543`), bên dưới `LessonInlineForm`.
