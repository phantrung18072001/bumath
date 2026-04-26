---
status: pending
phase: 04-student-learning-submission
source: [04-VERIFICATION.md, slug-url-migration]
started: 2026-04-26T22:47:00+07:00
updated: 2026-04-26T22:47:00+07:00
---

## Tests

### 1. Mobile Viewport Layout (375px)

**Test:** Open /courses and /courses/:courseSlug in Chrome DevTools at 375px width.
**Expected:** /courses shows 1-column card grid; /courses/:courseSlug shows "Nội dung" / "Mục lục" tabs (no sidebar); no horizontal scroll on either page; switching tabs does not reload data.
**Why human:** Responsive layout correctness requires visual inspection; overflow can only be confirmed in a real browser.
result: PENDING

---

### 2. 48px Tap Target Verification

**Test:** Use Chrome DevTools to inspect button heights on: logout button, sidebar lesson items, mark-complete button, "Chọn ảnh bài làm" button, "Nộp bài" button.
**Expected:** All measure at least 48px in height.
**Why human:** Rendered size depends on CSS cascade; code sets min-h-[48px] but browser verification is definitive.
result: PENDING

---

### 3. YouTube Video Embed

**Test:** Open a lesson that has a valid YouTube video_url; confirm the video plays inside the page.
**Expected:** 16:9 video player appears and plays YouTube content without leaving the app.
**Why human:** Requires a real lesson record with a video URL and a running browser.
result: PENDING

---

### 4. End-to-End Submission Flow (requires Phase 4 migration applied)

**Test:** After applying `supabase/migrations/20260407_06_student_learning.sql`, log in as an approved student, open a lesson with an assignment, select a photo, and submit.
**Expected:** "Đang xử lý..." loading state → toast "Nộp bài thành công!" → submitted thumbnail visible → "Đã nộp (đang chờ chấm)" badge shown → "Chọn ảnh bài làm" button no longer visible.
**Why human:** End-to-end flow requires live Supabase with migration applied.
result: PENDING

---

### 5. Slug-based Course URL Navigation

**Test:** From /courses, click on any course card.
**Expected:** The browser URL changes to `/courses/<slug>` (e.g., `/courses/toan-lop-7`), NOT a UUID. The course detail page loads correctly with all chapters and lessons visible.
**Why human:** Requires a live browser with the DB migration applied (slug column populated).
result: PENDING

---

### 6. Invalid Slug Shows 404 UI

**Test:** Manually navigate to `/courses/khong-ton-tai` (a slug that does not exist in the database).
**Expected:** The page shows "Không tìm thấy khóa học" message (not a blank page, not a crash).
**Why human:** Requires a live browser and live Supabase to confirm the null-course guard triggers correctly.
result: PENDING

---

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
