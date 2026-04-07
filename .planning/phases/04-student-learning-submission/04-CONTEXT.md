# Phase 4: Student Learning & Submission - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Học sinh đã được approved và enrolled có thể: xem danh sách khóa học của mình, điều hướng vào từng khóa xem bài giảng (YouTube embed), đánh dấu bài đã xem, xem đề bài đính kèm, upload ảnh bài làm tay, và theo dõi tiến độ học qua progress bar.

**Không thuộc phase này:**
- Grading (chấm bài) — Phase 5
- Nộp lại sau khi đã nộp — v2 (LEARN-V2-03)
- Locked lesson sequencing — v2 (LEARN-V2-01)

</domain>

<decisions>
## Implementation Decisions

### Course List Layout (LEARN-01)
- **D-01:** Route: `/courses` — redirect sau khi đăng nhập thành công (student approved).
- **D-02:** Hiển thị card grid: 2 cột desktop, 1 cột mobile. Mỗi card: tên khóa, nhãn lớp (Toán 7/8/9/Ôn chuyên), progress bar % hoàn thành.
- **D-03:** Empty state khi không có khóa nào: hiện thông báo "Bạn chưa được gán vào khóa học nào. Vui lòng liên hệ giảng viên."

### Student Navigation & Layout
- **D-04:** Student pages dùng **header gọn riêng** (không phải Header marketing): logo + tên học sinh + nút Đăng xuất. Header marketing có nav marketing không phù hợp với trải nghiệm học.
- **D-05:** Tạo `StudentLayout` component dùng chung cho tất cả student pages (`/courses`, `/courses/:id`).

### Course Detail Navigation (LEARN-02, LEARN-04, LEARN-05)
- **D-06:** Trang chi tiết khóa học (`/courses/:courseId`) dùng **sidebar layout**:
  - Desktop: sidebar trái (danh sách chuyên đề + bài học dạng collapsible tree, có icon ✓/→/○ theo trạng thái) + content phải (video embed + mô tả + đề bài + nộp bài).
  - Mobile (375px): **2 tab ở trên** — "Nội dung" (content mặc định) và "Mục lục" (sidebar tree). Tab switching không reload dữ liệu.
- **D-07:** URL không thay đổi khi chọn bài học khác trong cùng khóa — lesson được select qua state local (không phải nested route). Lý do: tránh full page reload khi chuyển bài.
- **D-08:** Breadcrumb: "← Khóa học của tôi" link về `/courses`.

### Completion Marking (LEARN-04, LEARN-05)
- **D-09:** Nút "✓ Đánh dấu đã xem" hiện khi bài chưa xem. Sau khi bấm: nút chuyển thành "Đã xem ✓" và **disabled** (không toggle lại được). Progress bar cập nhật ngay lập tức (optimistic update).
- **D-10:** Lesson completion là một chiều — không có unmark. Giả định học sinh chỉ tiến trước.

### Assignment File Viewer (LEARN-03)
- **D-11:** Click "Đề bài: [Xem file]" → **mở tab mới** với URL Supabase Storage. Browser tự handle PDF/image rendering. Không embed trong trang.

### Assignment Submission UX (SUBMIT-01, SUBMIT-02, SUBMIT-03, SUBMIT-04)
- **D-12:** Khu vực nộp bài nằm **inline bên dưới** phần đề bài trong trang bài học, thứ tự: video → mô tả → đề bài → nộp bài → nút đánh dấu đã xem.
- **D-13:** Chỉ hiển thị khu vực nộp bài khi bài học có đính kèm đề bài (assignment_path != null).
- **D-14:** Trạng thái nộp bài hiển thị rõ: "Chưa nộp" / "Đã nộp (đang chờ chấm)" / "Đã chấm — Điểm: X".
- **D-15:** **Nộp 1 lần duy nhất** — sau khi nộp, chỉ xem ảnh đã nộp và trạng thái. Không cho nộp lại (v2).

### Image Compression (SUBMIT-02)
- **D-16:** Dùng thư viện **`browser-image-compression`** — compress ảnh client-side xuống <500KB trước khi upload.
- **D-17:** **Tự động convert HEIC→JPEG** (transparent với user) — dùng option `fileType: 'image/jpeg'` của browser-image-compression kết hợp với heic2any nếu cần. Học sinh dùng iPhone không cần biết về format.
- **D-18:** Hiện loading state trong khi compress + upload (progress indicator hoặc spinner).

### Claude's Discretion
- Supabase Storage path cho submissions — Claude quyết định convention (e.g., `submissions/{userId}/{lessonId}/{timestamp}.jpg`).
- Exact shadcn/ui components dùng cho sidebar tree — Claude chọn (Accordion, Collapsible, hay custom).
- lesson_progress table schema — Claude thiết kế (cần track: user_id, lesson_id, completed_at).
- submissions table schema — Claude thiết kế (cần: user_id, lesson_id, file_path, submitted_at, status).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — LEARN-01 through LEARN-05, SUBMIT-01 through SUBMIT-04, UX-01, UX-02
- `.planning/PROJECT.md` — Constraints (stack, Supabase, YouTube embed only, Vietnamese UI, mobile-first)
- `.planning/ROADMAP.md` §Phase 4 — Success criteria (6 items)

### Existing Code (Phase 3 output — patterns to follow)
- `src/pages/admin/CoursesPage.tsx` — TanStack Query + Supabase pattern for course listing
- `src/pages/admin/LessonsPage.tsx` — Lesson list pattern with breadcrumb navigation
- `src/lib/api/courses.ts` — Existing Supabase course query (getCourses, getCourse)
- `src/lib/api/enrollments.ts` — Enrollment queries (getUserEnrollments)
- `src/lib/api/lessons.ts` — Lesson + assignment queries
- `src/lib/api/chapters.ts` — Chapter queries
- `src/contexts/AuthContext.tsx` — useAuth hook (user, profile for student identity)
- `src/App.tsx` — Routing (add /courses/* routes here)

### Phase 3 Context (patterns established)
- `.planning/phases/03-course-management/03-CONTEXT.md` — 3-tier structure (course/chapter/lesson), Supabase Storage pattern, enrollment design

### Phase 2 Context
- `.planning/phases/02-auth-access-control/02-CONTEXT.md` — ProtectedRoute pattern, role-based routing, Vietnamese UI

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx` — Course cards on listing page
- `src/components/ui/progress.tsx` — Progress bar (shadcn) for course completion %
- `src/components/ui/tabs.tsx` — Mobile sidebar/content toggle
- `src/components/ui/badge.tsx` — Grade label chips (Toán 7, Lớp 8, Ôn chuyên)
- `src/components/ui/accordion.tsx` — Chapter collapsible in sidebar
- `src/components/auth/ProtectedRoute.tsx` — Wrap all `/courses/*` routes with `requiredRole="student"` (or approved check)
- `src/lib/supabase.ts` — Supabase client singleton
- `src/lib/api/` — Pattern: typed functions returning Supabase data, used with TanStack Query

### Established Patterns
- TanStack Query (`useQuery`) for all Supabase data fetching
- Dialog-based forms (Phase 3) — NOT reused here (no admin forms in Phase 4)
- shadcn/ui + Tailwind utility classes for all styling
- `cn()` from `src/lib/utils.ts` for conditional class names
- Vietnamese UI text throughout

### Integration Points
- `src/App.tsx` — Add `/courses` and `/courses/:courseId` routes (wrapped in ProtectedRoute)
- `src/contexts/AuthContext.tsx` — `profile.id` needed for lesson_progress and submission queries
- Supabase Storage — new `submissions` bucket (or folder) needed alongside existing `assignments` bucket
- Supabase DB — new tables needed: `lesson_progress`, `submissions`
- Existing `enrollments` table — query to filter courses shown to student

</code_context>

<specifics>
## Specific Ideas

- Sidebar lesson list icons: ✓ (completed), → (current/active), ○ (not started)
- Course card mockup: card grid 2-col desktop / 1-col mobile, progress bar per course
- Lesson page layout: video → mô tả → đề bài [Xem file] → nộp bài section → [✓ Đánh dấu đã xem]
- Mobile: 2 tabs "Nội dung" / "Mục lục" replacing sidebar

</specifics>

<deferred>
## Deferred Ideas

- Nộp lại (resubmission) → LEARN-V2-03, Phase 5+ hoặc v2
- Locked lesson sequencing → LEARN-V2-01, v2
- Student dashboard "Tiếp theo" CTA → LEARN-V2-02, v2
- Bottom navigation bar cho mobile student portal → v2 (nếu có nhiều section hơn)

</deferred>

---

*Phase: 04-student-learning-submission*
*Context gathered: 2026-04-07*
