# Phase 5: Grading & Notification - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Giảng viên/admin có thể xem hàng đợi bài chờ chấm, mở từng bài để xem ảnh và nhập điểm + nhận xét, lưu kết quả. Học sinh nhận thông báo in-system (chuông) khi bài được chấm và xem kết quả trực tiếp trong trang bài học.

**Không thuộc phase này:**
- Email thông báo — hoãn sang v2 (GRADE-04 deferred)
- Nộp lại sau khi đã chấm — v2 (LEARN-V2-03)
- Comment mẫu (saved templates) — v2 (GRADE-V2-01)

</domain>

<decisions>
## Implementation Decisions

### Teacher Grading Queue (GRADE-01)
- **D-01:** Route: `/admin/submissions` — thêm link "Chấm bài" vào admin sidebar nav (cùng với Khóa học, Học sinh).
- **D-02:** Layout: **bảng phẳng** (flat table) — columns: Học sinh | Khóa học | Bài học | Ngày nộp | [Chấm bài button]. Consistent với UsersPage pattern.
- **D-03:** Bảng chỉ hiển thị submissions có `status = 'submitted'` (chưa chấm). Không hiển thị bài đã chấm trong tab mặc định.
- **D-04:** Hiển thị badge đếm tổng số bài chờ: "X bài chờ chấm" ở đầu trang / trong tab nav.
- **D-05:** Empty state khi không có bài nào: "Không có bài nào chờ chấm."

### Grading Flow (GRADE-02, GRADE-03)
- **D-06:** Click "Chấm bài" trong hàng → **dialog/modal overlay** mở lên. Teacher ở lại trang queue, không navigate đi.
- **D-07:** Dialog layout (từ trên xuống):
  - Title: "Chấm bài: [Tên học sinh] — [Tên khóa] — [Tên bài học]"
  - Ảnh bài làm: full width, scrollable nếu ảnh dài (dùng `max-h-[60vh] overflow-y-auto`)
  - Điểm số: input số + nhãn "/10" (bên phải)
  - Nhận xét: textarea, optional nhưng khuyến khích
  - Buttons: [Hủy] | [Lưu điểm]
- **D-08:** Ảnh được load bằng **signed URL** (pattern từ Phase 4 `getSubmissionSignedUrl`) — private bucket.
- **D-09:** Sau khi lưu thành công: dialog đóng, row biến mất khỏi queue (invalidate query), toast "Đã lưu điểm".

### Score Scale (GRADE-03)
- **D-10:** Thang điểm **0–10** (chuẩn Việt Nam). Input kiểu number với `min=0 max=10 step=0.5`. Stored as `numeric(5,2)` — schema đã sẵn sàng.
- **D-11:** Nhận xét (comment) là text field, không bắt buộc nhưng UI hint "Ví dụ: Làm đúng bước 1, cần kiểm tra lại dấu...".

### In-System Bell Notification (GRADE-04 — in-app only, email deferred)
- **D-12:** StudentLayout header thêm **bell icon** (Lucide `Bell`) với badge count = số bài được chấm chưa xem.
- **D-13:** "Chưa xem" = `status = 'graded' AND student_viewed_at IS NULL`. Badge ẩn khi count = 0.
- **D-14:** `student_viewed_at` — thêm cột `timestamptz` vào bảng `submissions` (migration mới). Nullable — null = chưa xem, có giá trị = đã xem.
- **D-15:** Khi học sinh navigate vào bài học và submission có `status = 'graded'` và `student_viewed_at IS NULL` → tự động update `student_viewed_at = now()` (fire-and-forget update, không block render).
- **D-16:** Bell badge query: `SELECT COUNT(*) FROM submissions WHERE user_id = auth.uid() AND status = 'graded' AND student_viewed_at IS NULL`. Dùng `useQuery` với refetch interval hợp lý (hoặc trigger khi user navigate).

### Student Result View (GRADE-05)
- **D-17:** Kết quả hiển thị **inline** trong SubmissionArea đã có từ Phase 4 (không tạo trang mới).
- **D-18:** Khi `status = 'graded'`: show ảnh đã nộp (thumbnail + click mở to) + badge "✅ Đã chấm" + "Điểm: X/10" + nhận xét của giảng viên (nếu có).
- **D-19:** `status = 'submitted'` vẫn hiện: "⏳ Đã nộp — đang chờ chấm" như Phase 4.

### Claude's Discretion
- Exact Supabase query để JOIN submissions với profiles + lessons + courses cho teacher queue — Claude thiết kế.
- RLS policy cho `student_viewed_at` update (students can update own submissions, chỉ field này) — Claude thiết kế (cần policy riêng hoặc dùng RPC).
- shadcn/ui Dialog vs Sheet cho grading overlay — Claude chọn (Dialog phù hợp hơn vì compact).
- Pagination vs scroll cho grading queue — Claude quyết định (scroll đủ cho MVP).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — GRADE-01 through GRADE-05, UX-01, UX-02, UX-03
- `.planning/PROJECT.md` — Constraints (stack, Supabase, Vietnamese UI, mobile UX)
- `.planning/ROADMAP.md` §Phase 5 — Success criteria (4 items)

### Existing Code (Phase 4 output — patterns to extend)
- `src/pages/student/CourseDetailPage.tsx` — SubmissionArea location, signed URL usage, submission status display
- `src/lib/api/submissions.ts` — `getSubmissionSignedUrl`, `Submission` type (already has score/comment/status)
- `src/pages/admin/UsersPage.tsx` — Table pattern (shadcn Table, TanStack Query, Tabs, mutation + toast)
- `src/pages/admin/CoursesPage.tsx` — Admin page layout, dialog pattern
- `src/components/student/StudentLayout.tsx` — Header to extend with bell icon
- `src/contexts/AuthContext.tsx` — useAuth for teacher/admin role check
- `src/App.tsx` — Add `/admin/submissions` route

### Database
- `supabase/migrations/20260407_06_student_learning.sql` — `submissions` table schema (score, comment, status, RLS for teacher update already in place)

### Prior Phase Contexts
- `.planning/phases/04-student-learning-submission/04-CONTEXT.md` — D-12 to D-15 (submission area layout, one-shot submission logic)
- `.planning/phases/03-course-management/03-CONTEXT.md` — Admin nav pattern, dialog form pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/dialog.tsx` — For grading modal (shadcn Dialog)
- `src/components/ui/table.tsx` — Teacher grading queue table
- `src/components/ui/badge.tsx` — Submission status badges, bell count
- `src/components/ui/textarea.tsx` — Comment input
- `src/components/ui/input.tsx` — Score number input
- Lucide `Bell` icon — Bell notification in StudentLayout header
- `getSubmissionSignedUrl` in `src/lib/api/submissions.ts` — Already built for viewing submission photos

### Established Patterns
- TanStack Query (`useQuery` + `useMutation`) for all Supabase ops
- Dialog-based forms with shadcn Dialog (Phase 3 pattern)
- Toast notifications via Sonner (Phase 3/4 pattern)
- Vietnamese UI text throughout
- `cn()` utility for conditional classes

### Integration Points
- `submissions` table — needs `student_viewed_at` column (new migration)
- `src/App.tsx` — Add `/admin/submissions` route
- `src/components/student/StudentLayout.tsx` — Add bell icon + badge to header
- Need new API functions: `getUngraded()`, `gradeSubmission()`, `getUnviewedGradeCount()`, `markGradeViewed()`
- Admin sidebar nav — add "Chấm bài" link

</code_context>

<specifics>
## Specific Ideas

- Dialog title pattern: "Chấm bài: Nguyễn Văn A — Toán 7 Cơ bản — Bài 3"
- Score input: `<Input type="number" min={0} max={10} step={0.5} />` + label "/10"
- Bell badge: Lucide Bell + absolute-positioned red dot/number (Lớp 7-9 audience, familiar UX)
- Queue empty state: "Không có bài nào chờ chấm 🎉"
- After grade saved: row removed from list (query invalidation), toast "Đã lưu điểm cho [Tên học sinh]"

</specifics>

<deferred>
## Deferred Ideas

- Email thông báo khi bài được chấm → GRADE-04, v2 (no email provider in v1)
- Comment mẫu tái sử dụng → GRADE-V2-01, v2
- Bài tập có deadline → GRADE-V2-02, v2
- Xem lịch sử tất cả bài đã chấm (graded history tab) → v2

</deferred>

---

*Phase: 05-grading-notification*
*Context gathered: 2026-04-07*
