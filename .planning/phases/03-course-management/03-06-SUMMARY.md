---
plan: 03-06
phase: 03-course-management
status: complete
completed: 2026-04-26
gap_closure: true
closes_gaps: [test-10, test-12]
---

## Summary

Closed two diagnosed UAT gaps in the admin lesson UI — the lessons list and the lesson form dialog now properly surface file/video attachment information.

## Files Modified

### src/pages/admin/LessonsPage.tsx
- Added a **Video** column to the lessons table (between STT and Tên bài học) that renders a 80×48px YouTube thumbnail via `img.youtube.com/vi/{id}/mqdefault.jpg` using `extractYouTubeID` on `lesson.video_url`.
- Replaced the bare `<FileText />` icon in the attachment cell with a **clickable filename chip** (FileText icon + truncated filename) that links to `getAssignmentPublicUrl(lesson.assignment_path)`.
- Added `getAssignmentPublicUrl` to the `@/lib/api/lessons` import.

### src/components/admin/LessonFormDialog.tsx
- Updated lucide-react import to include `Paperclip`, `FileText`, `X`.
- Added `imagePreviewUrl` state with a `useEffect` that creates a blob URL when `selectedFile` is an image and revokes it on cleanup — no blob URL leaks.
- Renamed the file label from "Tệp bài tập (PDF hoặc hình ảnh)" to **"Tài liệu đính kèm cho học sinh"** with a Paperclip icon.
- Existing file in edit mode now renders as an **icon + filename chip** with an X-icon "Xóa file" button.
- Newly selected file renders in a **preview block**: image thumbnail for image files, FileText icon for PDFs, with filename + formatted file size.

## Gap Closure

| Gap | UAT Test | Root Cause | Resolution |
|-----|----------|------------|------------|
| test-10 | Lesson list — no video/attachment info | `video_url` never read; bare icon | Video column + filename chip |
| test-12 | Dialog label ambiguous; no preview | Plain text label; no preview render | Renamed label + inline preview |

## Verification

- `npx eslint src/pages/admin/LessonsPage.tsx src/components/admin/LessonFormDialog.tsx` → No issues
- `yarn build` → Success (2287 modules, no errors)
- Manual smoke test: navigate to a chapter with YouTube lessons and PDF attachments to confirm thumbnails and chips render

## Deferred Items

- Student-facing lesson viewer redesign (Udemy-style course builder noted in UAT footer) — out of scope for this gap-closure plan
