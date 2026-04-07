# Phase 4: Student Learning & Submission - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-07
**Phase:** 04-student-learning-submission
**Areas discussed:** Course list layout, Course detail navigation, Completion marking, Assignment submission UX, Image compression, Assignment file viewer, Student nav/layout

---

## Course Detail Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar layout | Desktop sidebar left (collapsible chapter/lesson tree) + content right. Mobile: 2 tabs "Nội dung"/"Mục lục" | ✓ |
| 3 trang drill-down | Mirror admin navigation: 3 separate pages with breadcrumbs | |

**User's choice:** Sidebar layout
**Notes:** Mobile: tab/toggle ở trên (2 tab: Nội dung / Mục lục)

---

## Completion Marking

| Option | Description | Selected |
|--------|-------------|----------|
| Nút thủ công | Button "✓ Đánh dấu đã xem" — học sinh quyết định khi nào xong | ✓ |
| Tự động khi vào trang | Auto-mark on page open | |

**User's choice:** Nút thủ công
**Notes:** Sau khi bấm: nút chuyển thành "Đã xem ✓" và disabled (one-way, không toggle lại)

---

## Assignment Submission UX

| Option | Description | Selected |
|--------|-------------|----------|
| Inline bên dưới video | Khu vực nộp bài nằm trong trang bài học, bên dưới đề bài | ✓ |
| Tab riêng | Trang bài học có 2 tab: "Bài giảng" và "Nộp bài" | |

**User's choice:** Inline bên dưới video
**Notes:** Nộp 1 lần duy nhất (không cho nộp lại — v2)

---

## Image Compression

| Option | Description | Selected |
|--------|-------------|----------|
| browser-image-compression | Popular, async API, HEIC support via option | ✓ |
| Compressorjs | Lighter, callback-based, no HEIC | |
| Canvas API | No dependency, manual logic, no HEIC | |

**User's choice:** browser-image-compression

| HEIC Option | Description | Selected |
|-------------|-------------|----------|
| Tự động convert HEIC→JPEG | Transparent với user, browser-image-compression option | ✓ |
| Báo lỗi nếu HEIC | Validate và reject HEIC files | |

**User's choice:** Tự động convert HEIC→JPEG

---

## Course List Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Card grid | 2 cột desktop / 1 cột mobile, mỗi card có progress bar | ✓ |
| List đơn giản | 1 dòng per course | |

**User's choice:** Card grid, route `/courses`

---

## Assignment File Viewer

| Option | Description | Selected |
|--------|-------------|----------|
| Mở tab mới | Click → mở Supabase Storage URL trong tab mới | ✓ |
| Lightbox/modal preview | Dialog trong trang | |

**User's choice:** Mở tab mới

---

## Student Nav/Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Header gọn riêng | Logo + tên học sinh + Đăng xuất. Không có nav marketing. | ✓ |
| Dùng chung Header hiện có | Header marketing đã có auth state | |

**User's choice:** Header gọn riêng (StudentLayout component)

---

## Claude's Discretion

- Supabase Storage path convention cho submissions
- Exact shadcn/ui component cho sidebar tree (Accordion vs Collapsible)
- lesson_progress table schema
- submissions table schema

## Deferred Ideas

- Nộp lại (resubmission) → v2 / LEARN-V2-03
- Locked lesson sequencing → v2 / LEARN-V2-01
- Student dashboard "Tiếp theo" CTA → v2 / LEARN-V2-02
- Bottom navigation bar mobile → v2
