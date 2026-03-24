# Phase 3: Course Management - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin xây dựng và quản lý toàn bộ catalogue khóa học: tạo/sửa/xóa khóa học, chuyên đề, bài học (kèm YouTube video), đính kèm file bài tập, và quản lý enrollment học sinh. Không có giao diện học sinh trong phase này.

**Cấu trúc dữ liệu 3 tầng:**
- **Khóa học** (Course) — tên, mô tả, lớp mục tiêu (7/8/9/chuyên)
- **Chuyên đề** (Chapter) — tiêu đề, thứ tự, thuộc 1 khóa học
- **Bài học** (Lesson) — tiêu đề, YouTube URL, mô tả, thứ tự, file bài tập (optional), thuộc 1 chuyên đề

**Tất cả các lớp (7, 8, 9, chuyên) đều dùng cùng cấu trúc 3 tầng này.**

</domain>

<decisions>
## Implementation Decisions

### Navigation — 3 cấp drill-down
- **D-01:** Admin điều hướng qua 3 trang riêng biệt:
  - `/admin/courses` — danh sách tất cả khóa học (tạo/sửa/xóa khóa, click vào để xem chuyên đề)
  - `/admin/courses/{courseId}` — danh sách chuyên đề trong khóa (có breadcrumb ← Quay lại, tạo/sửa/xóa chuyên đề, click vào để xem bài học)
  - `/admin/courses/{courseId}/chapters/{chapterId}` — danh sách bài học trong chuyên đề (có breadcrumb, tạo/sửa/xóa bài học)
- **D-02:** Mỗi trang có nút "← Quay lại" để navigate lên cấp trên.

### Lesson Reordering
- **D-03:** Mỗi bài học có 2 nút [↑][↓] để điều chỉnh thứ tự. Không dùng drag & drop (không cần thêm thư viện). Áp dụng cho cả chuyên đề trong khóa học và bài học trong chuyên đề.

### Assignment Attachment (File Bài Tập)
- **D-04:** Form tạo/sửa bài học có ô upload file **inline** — admin điền tiêu đề, YouTube URL, mô tả, và upload file trong cùng 1 form.
- **D-05:** File bài tập là optional (không bắt buộc mỗi bài học đều có).
- **D-06:** File lưu trên Supabase Storage. Hiển thị tên file hiện tại với nút [Xóa] nếu đã có file.
- **D-07:** Định dạng hỗ trợ: PDF và ảnh (theo COURSE-04).

### Enrollment — Quản lý từ phía học sinh
- **D-08:** Admin **không** gán học sinh từ trang course. Thay vào đó, enrollment được quản lý từ trang học sinh: `/admin/users` → click vào học sinh → admin thấy và chỉnh sửa danh sách khóa học của học sinh đó.
- **D-09:** Dropdown chọn khóa học (chỉ hiện các khóa học sinh chưa được gán) để thêm enrollment. Xóa enrollment bằng nút [Xóa] trên từng dòng.

### Claude's Discretion
- Form tạo/sửa dùng Dialog (modal) hay trang riêng — Claude quyết định theo UX phù hợp nhất cho từng cấp (có thể Dialog cho course/chapter, full page cho lesson vì có nhiều field hơn).
- Breadcrumb component — dùng shadcn `breadcrumb.tsx` đã có sẵn.
- Confirmation dialog khi xóa — dùng shadcn `alert-dialog.tsx`.
- Supabase Storage bucket name và path convention — Claude quyết định.
- RLS policies cho courses/chapters/lessons/enrollments tables — Claude quyết định pattern (admin full access, student read-only cho enrolled content).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — COURSE-01 through COURSE-05
- `.planning/PROJECT.md` — Constraints section (stack, Supabase, YouTube embed only, Vietnamese UI)
- `.planning/ROADMAP.md` §Phase 3 — Success criteria (4 items) and depends-on chain

### Existing Code (Phase 2 output)
- `src/pages/admin/UsersPage.tsx` — Admin page pattern to follow (table + tabs, TanStack Query, Supabase calls)
- `src/contexts/AuthContext.tsx` — useAuth hook (for role checks in admin pages)
- `src/lib/supabase.ts` — Supabase client singleton
- `src/App.tsx` — Current routing (add `/admin/courses/*` routes here)

### Phase 2 Context (patterns established)
- `.planning/phases/02-auth-access-control/02-CONTEXT.md` — Admin UI lives at `/admin/*`, role-based routing, Vietnamese UI

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable UI Components (shadcn/ui — all available)
- `src/components/ui/card.tsx` — Course/chapter/lesson cards
- `src/components/ui/table.tsx` — List tables (follow UsersPage pattern)
- `src/components/ui/dialog.tsx` — Create/edit modals
- `src/components/ui/alert-dialog.tsx` — Delete confirmation
- `src/components/ui/form.tsx` + `input.tsx` + `textarea.tsx` + `select.tsx` + `label.tsx` — Form fields
- `src/components/ui/badge.tsx` — Grade labels (Lớp 7, Lớp 8, Lớp 9, Chuyên)
- `src/components/ui/breadcrumb.tsx` — Breadcrumb navigation across 3 levels
- `src/components/ui/button.tsx` — All action buttons

### Established Patterns
- TanStack Query for server state (fetch + mutations) — follow UsersPage.tsx pattern
- React Hook Form + Zod for forms — established in Phase 2
- Supabase client from `src/lib/supabase.ts` — direct client calls, no API layer
- `useAuth()` from AuthContext for role verification in admin pages

### Integration Points
- `src/App.tsx` — Add `/admin/courses`, `/admin/courses/:courseId`, `/admin/courses/:courseId/chapters/:chapterId` routes (all wrapped in ProtectedRoute role="admin")
- `src/pages/admin/UsersPage.tsx` — Add enrollment management section (click student → see/edit courses)

### No DnD Library
- No drag-and-drop library installed. Reordering uses [↑][↓] buttons only — no new dependencies needed.

</code_context>

<specifics>
## Specific Ideas

- Grade target selector: 4 options — Lớp 7, Lớp 8, Lớp 9, Ôn chuyên (matches landing page marketing copy)
- YouTube URL field: consider auto-extracting video ID for embed preview (Claude's discretion)
- File upload: show file size and name after selection before saving
- Enrollment from user detail: show course name + grade badge in the enrollment list

</specifics>

<deferred>
## Deferred Ideas

- Bulk enrollment (thêm nhiều học sinh cùng lúc vào 1 khóa) — deferred to v2 (ADMIN-V2-01 covers group enrollment)
- Reordering chuyên đề within course — same [↑][↓] pattern as lessons (Claude handles this consistently)
- Course visibility toggle (ẩn/hiện khóa học) — not in COURSE-01 through COURSE-05 scope

</deferred>

---

*Phase: 03-course-management*
*Context gathered: 2026-03-24*
