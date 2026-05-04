# Phase 15: Admin UX + Audit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-04
**Phase:** 15-admin-ux-audit
**Areas discussed:** Add/Edit scope, URL structure, Audit scope, Form page layout

---

## Add/Edit Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Sửa cũng tách trang riêng | Edit dùng cùng route với Add, phân biệt qua param | ✓ |
| Sửa vẫn dùng dialog | Chỉ tách Add ra trang riêng per requirement | |
| Sửa dùng inline edit | Click edit → row expand thành form tại chỗ | |

**User's choice:** Sửa cũng tách trang riêng (sau đó revised sang inline sau khi URL structure discussion)

| Option | Description | Selected |
|--------|-------------|----------|
| Có, fetch từ DB theo slug/id | Form pre-populate từ API | ✓ |
| Pass data qua router state | Truyền data khi navigate | |

**User's choice:** Fetch từ DB theo slug/id

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ miết Chapter và Lesson | Package forms giữ dialog | ✓ |
| Tất cả admin forms đều tách trang | Scope lớn hơn | |

**User's choice:** Chỉ Chapter và Lesson theo requirement

**Notes:** User ban đầu muốn tách trang riêng nhưng sau khi thảo luận URL structure đã đổi sang inline expandable section. Quyết định cuối: form thêm/sửa là inline trong sidebar của AdminCourseDetailPage.

---

## URL Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Nested dưới course | /quan-tri/khoa-hoc/:courseSlug/them-chuyen-de | |
| Flat admin route | /quan-tri/them-chuyen-de?courseId=... | |
| Inline/expandable section | Form trong cùng trang, không có URL riêng | ✓ |

**User's choice:** Inline/expandable section trong trang (update requirement ADMIN-01/02)

**Notes:** User muốn "giống UI của học sinh, chỉ 1 trang duy nhất" — gom ChaptersPage + LessonsPage thành 1 admin course detail page. Form thêm/sửa không tách URL riêng mà inline expand trong sidebar. Đây là thay đổi so với ADMIN-01/02 ban đầu.

---

## Audit Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Toàn app (admin + student + landing) | Audit tất cả trang | ✓ |
| Chỉ admin pages | Student pages đã audit Phase 13 | |

**User's choice:** Toàn app

| Option | Description | Selected |
|--------|-------------|----------|
| Thêm handler đúng | Wire up đúng navigate/action | ✓ |
| Ẩn button nếu chưa có feature | hidden/disabled | |
| Cả 2: fix được thì fix, chưa có thì ẩn | | |

**User's choice:** Thêm handler đúng, hỏi khi lên plan nếu cần

---

## Form Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| StudentCourseDetailPage layout (2 cột) | Sidebar + content, giống student | ✓ |
| Full-width table layout (giữ hiện tại) | ChaptersPage/LessonsPage style | |

**User's choice:** Student layout 2 cột

| Option | Description | Selected |
|--------|-------------|----------|
| Chapters + lessons liệt kê có expand/collapse | Như student sidebar | ✓ |
| Chỉ chapters, click → cột phải hiển lesson list | 2 level rõ ràng | |

**User's choice:** Expand/collapse giống student sidebar

| Option | Description | Selected |
|--------|-------------|----------|
| Form trong sidebar (nơi liệt kê chapters) | Inline expand trong sidebar | ✓ |
| Trong cột phải (content area) | Form ở content area | |

**User's choice:** Inline trong sidebar

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state + hướng dẫn | Placeholder text | |
| Course info | Thông tin khóa học | |
| Default chọn lesson đầu tiên | Auto-select | ✓ |

**User's choice:** Default chọn lesson đầu tiên

| Option | Description | Selected |
|--------|-------------|----------|
| Lesson detail read-only + nút 'Sửa' | Read view + edit button | ✓ |
| Lesson form inline luôn ở edit mode | Luôn editable | |

**User's choice:** Read-only + nút Sửa (expand inline form khi click)

---

## Claude's Discretion

- Animation cho inline form expand (CSS transition vs Framer Motion)
- Xử lý khi nhiều inline form mở cùng lúc (chỉ 1 mở tại một thời điểm)
- Loading skeleton trong content area phải
- Error state khi course/chapter không tồn tại

## Deferred Ideas

- Package forms tách trang riêng — ngoài scope Phase 15
- Lesson tabs — Phase 16
- In-lesson chat — Phase 17
