---
status: complete
phase: 03-course-management
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md]
started: 2026-03-25T06:05:00Z
updated: 2026-04-25T16:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Run `yarn dev` from scratch. App boots without errors in the terminal, http://localhost:8080 loads the landing page, and no console errors appear on first load.
result: blocked
blocked_by: environment
reason: "Uncaught Error: supabaseUrl is required — .env.local missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"

### 2. Admin Courses list loads
expected: Logged in as admin, navigate to /admin/courses. Page shows "Quản lý khóa học" heading, a "+ Thêm khóa học" button, and either a list of courses or an empty-state message. No errors or blank screen.
result: pass

### 3. Create a course
expected: Click "+ Thêm khóa học". A dialog opens with fields: Tên khóa học, Mô tả, and a grade dropdown (Lớp 7 / Lớp 8 / Lớp 9 / Ôn chuyên). Fill in a name, pick a grade, submit. The new course appears in the list with a coloured grade badge (blue=7, green=8, purple=9, orange=ôn chuyên). A success toast shows.
result: pass
note: "UI cần cải thiện — user muốn redesign (dùng Stitch hoặc skills). Logged as backlog."

### 4. Edit a course
expected: Click the edit button on an existing course. The dialog opens pre-filled with the course's current name, description, and grade. Change the name and save. The list updates with the new name. A success toast shows.
result: pass

### 5. Delete a course (with confirmation)
expected: Click the delete button on a course. An AlertDialog appears asking for confirmation (not an instant delete). Confirm deletion. The course disappears from the list. A success toast shows.
result: pass

### 6. Navigate into a course's Chapters
expected: From /admin/courses, click through to a course's chapters (e.g., click the course name or a dedicated button). Browser navigates to /admin/courses/:courseId. Page shows "Chuyên đề" or similar heading, a breadcrumb back to "Khóa học", and either a list of chapters or an empty-state message.
result: pass
fix: "Added BookOpen navigation button to CoursesPage (commit f11bc90)"

### 7. Create and edit a chapter
expected: Click "+ Thêm chuyên đề". Dialog opens with a Tên chuyên đề field. Enter a title and save — chapter appears in the list. Click edit on that chapter, change the title, save — list updates.
result: pass

### 8. Reorder chapters with ↑/↓ buttons
expected: With at least 2 chapters, the first chapter shows only a ↓ button (no ↑), and the last shows only ↑ (no ↓). Click ↓ on the first chapter — it swaps position with the second. The new order persists after a page refresh.
result: pass

### 9. Navigate into a chapter's Lessons (BookOpen button)
expected: From the Chapters page, click the BookOpen icon button on a chapter row. Browser navigates to /admin/courses/:courseId/chapters/:chapterId. Page shows a 3-level breadcrumb (Khóa học > Course name > Chapter name) and either a lessons list or empty state.
result: pass

### 10. Create a lesson with a YouTube URL
expected: Click "+ Thêm bài học". Dialog opens with fields: Tên bài học, YouTube URL, Mô tả, and file upload. Enter a valid YouTube URL (any format: watch?v=, youtu.be/, embed/). Submit. Lesson appears in the list. The URL is stored/normalised correctly (no error toast).
result: issue
reported: "UI tệ quá, không hiểu đính kèm ở danh sách là gì, không hiểu thị youtube ở danh sách, không có preview, thêm plan sửa lại UI và update lại UI sau"
severity: major

### 11. YouTube URL validation rejects invalid input
expected: In the lesson dialog, enter a non-YouTube URL (e.g., "https://vimeo.com/123"). The form shows a validation error and does not submit.
result: pass

### 12. File attachment on a lesson
expected: In the lesson create/edit dialog, use the file upload field to attach a PDF or image (< 10 MB). The filename and size display in the form. Submit. In the lessons list, that lesson shows a FileText icon indicating an attachment.
result: issue
reported: "cần có preview đính kèm, sửa tên cho dễ hiểu hơn"
severity: major

### 13. Reorder lessons with ↑/↓ buttons
expected: With at least 2 lessons, clicking ↓ on the first lesson swaps it with the second. Boundary buttons behave the same as chapters (first has no ↑, last has no ↓).
result: pass

### 14. Delete a lesson
expected: Click delete on a lesson. Confirmation dialog appears. Confirm. Lesson disappears from list. If the lesson had a file attachment, the delete should succeed without error (storage cleanup happens first).
result: pass

### 15. Open enrollment dialog for an approved user
expected: On /admin/users, find a user with "Đã duyệt" status. Their row has a "Quản lý khóa học" button (BookOpen icon). Clicking it opens a dialog showing that student's current enrollments and a dropdown to add new ones.
result: pass

### 16. Enroll a student in a course
expected: In the enrollment dialog, select a course from the dropdown and click "Thêm". The course appears in the student's enrollment list inside the dialog. Courses already enrolled in do not appear in the dropdown.
result: pass

### 17. Remove a student's enrollment
expected: In the enrollment dialog, click the trash icon (Xóa) on an enrolled course. The row is removed from the list immediately. The course reappears in the "add" dropdown.
result: pass

### 18. RLS — student cannot see other students' data
expected: Requires live Supabase. Log in as a student enrolled in Course A only. Attempt to directly query courses/chapters/lessons for Course B (or another student's data) — Supabase should return empty results, not an error and not the data.
result: pass

## Summary

total: 18
passed: 15
issues: 2
pending: 0
skipped: 0
blocked: 1
skipped: 0
blocked: 1

## Gaps

- truth: "Lesson list clearly shows YouTube thumbnail/preview, file attachment label with icon, and each lesson row is informative at a glance"
  status: failed
  reason: "User reported: UI tệ quá, không hiểu đính kèm ở danh sách là gì, không hiểu thị youtube ở danh sách, không có preview"
  severity: major
  test: 10
  artifacts: []
  missing: [youtube thumbnail preview in lesson list, file attachment indicator with meaningful label, lesson row redesign]

- truth: "File attachment field in lesson dialog shows a preview of the attached file and uses clear, user-friendly label"
  status: failed
  reason: "User reported: cần có preview đính kèm, sửa tên cho dễ hiểu hơn"
  severity: major
  test: 12
  artifacts: []
  missing: [file preview in dialog (image thumbnail or PDF icon + filename), clearer label for attachment field]

# UI Direction Note (from UAT):
# User wants Udemy-style UI for both admin/teacher (course builder) and student views.
# Fix plans for lesson UI should use Udemy as reference design.
