# Phase 18: Mock Exam System - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 18 triển khai hệ thống thi thử để:
- Admin tạo đợt thi theo tháng/quý với thời gian mở/đóng cụ thể.
- Admin tạo câu hỏi có text + LaTeX + ảnh minh họa, có đáp án đúng để chấm tự động.
- Học sinh vào làm bài trong cửa sổ thời gian hợp lệ, chỉ 1 lần duy nhất.
- Server cưỡng chế hạn nộp theo `ends_at` và trả điểm ngay sau khi nộp thành công.

Ngoài phạm vi phase này:
- Reset attempt bởi admin (để phase sau nếu cần).
- Trắc nghiệm realtime nâng cao/chống gian lận nâng cao.
- Luồng tự luận upload ảnh trong mock exam.

</domain>

<decisions>
## Implementation Decisions

### Cấu trúc đề thi & câu hỏi
- **D-01:** Phase 18 chỉ dùng câu hỏi trắc nghiệm 1 đáp án đúng (A/B/C/D).
- **D-02:** Nội dung câu hỏi hỗ trợ text + LaTeX + ảnh minh họa.
- **D-03:** Thứ tự câu hỏi cố định theo thứ tự admin cấu hình (không random).
- **D-04:** Khi đợt thi đã bắt đầu, khóa chỉnh sửa bộ câu hỏi để đảm bảo công bằng.

### Timing, reconnect, one-attempt
- **D-05:** Timer của học sinh bắt đầu khi bấm “Bắt đầu thi” lần đầu (lưu mốc bắt đầu theo attempt).
- **D-06:** Khi hết giờ, hệ thống tự động submit các đáp án hiện có.
- **D-07:** Nếu F5/mất mạng: cho vào lại khi chưa nộp và chưa quá `ends_at`, đồng thời khôi phục bài làm tạm.
- **D-08:** One-attempt được tính từ thời điểm bắt đầu thi: đã có attempt thì chặn bắt đầu lần 2.

### Chấm điểm & hiển thị kết quả
- **D-09:** Trả điểm ngay sau khi nộp bài thành công.
- **D-10:** Học sinh thấy tổng điểm + trạng thái đúng/sai từng câu, không lộ đáp án chuẩn.
- **D-11:** Hiển thị cả raw score (số câu đúng) và điểm quy đổi thang 10.
- **D-12:** Server chỉ chấp nhận submit hợp lệ trước `ends_at`; quá hạn trả lỗi rõ ràng.

### Luồng quản trị đợt thi
- **D-13:** Session có vòng đời `draft` → `published` → `closed` (đóng theo thời gian).
- **D-14:** Chỉ được publish khi có ít nhất 1 câu và mỗi câu có đáp án đúng hợp lệ.
- **D-15:** Session đã publish nhưng chưa bắt đầu được phép chỉnh sửa đầy đủ.
- **D-16:** Chỉ cho xóa session khi chưa có học sinh bắt đầu làm.

### the agent's Discretion
- Chi tiết UX countdown, cảnh báo còn ít thời gian, và cách hiển thị trạng thái auto-submit.
- Chi tiết kỹ thuật autosave câu trả lời (interval/debounce) miễn đảm bảo phục hồi ổn định sau reconnect.
- Cách tổ chức API layer và phân tách query keys theo pattern hiện tại của codebase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product scope & acceptance
- `.planning/ROADMAP.md` — §Phase 18: Mock Exam System (goal, success criteria, security constraints, dependency `katex`/`react-katex`).
- `.planning/REQUIREMENTS.md` — EXAM-01..EXAM-06 (tạo đợt thi, thêm câu hỏi, one-attempt, trả điểm ngay, server-side deadline enforcement).
- `.planning/PROJECT.md` — v3.0 context và constraints stack (React + TS + Supabase).

### Prior phase decisions to carry forward
- `.planning/phases/14-pricing-access-control/14-CONTEXT.md` — pattern RLS + `SECURITY DEFINER`, access control ở DB, không trust client.
- `.planning/phases/16-lesson-tabs-study-materials/16-CONTEXT.md` — tách rõ lesson submission flow khỏi mock exam flow.
- `.planning/phases/17-in-lesson-chat/17-CONTEXT.md` — pattern realtime cleanup/reconnect discipline và polling strategy.

### Code touchpoints for integration
- `src/components/student/LessonContent.tsx` — ngữ cảnh tab học tập hiện có, nơi liên kết tới trải nghiệm học sinh.
- `src/lib/api/submissions.ts` — pattern API + status handling + Supabase error handling có thể tái sử dụng cách tổ chức.
- `src/pages/student/CourseDetailPage.tsx` — state/query orchestration pattern cho student flows.
- `src/components/student/SubmissionArea.tsx` — tham chiếu pattern upload/status UI (không tái dùng trực tiếp cho exam answers).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TanStack Query` đã dùng nhất quán cho fetch/mutation ở student/admin pages.
- `Supabase API modules` trong `src/lib/api/*` đã có pattern rõ cho pagination, filter, mutation, error propagation.
- `Status-oriented UI` (submitted/graded) trong `SubmissionArea` cung cấp reference tốt cho exam attempt status.

### Established Patterns
- Security-critical logic đặt ở DB/RLS + RPC (đã dùng ở phases trước), không dựa vào client-side checks.
- Route/page tách rõ admin và student, có sẵn layout cho mở rộng màn hình exam list/exam attempt.
- Polling/realtime cần cleanup chặt (bài học từ Phase 17), tránh leak channel/subscription.

### Integration Points
- Tạo API mới dưới `src/lib/api/` cho exam sessions, questions, attempts, results.
- Bổ sung student page cho danh sách đợt thi mở + trang làm bài.
- Bổ sung admin page để tạo/publish session và author câu hỏi.
- Migrations Supabase cho schema exam + constraints + RPC chấm điểm server-side.

</code_context>

<specifics>
## Specific Ideas

- Auto-submit khi hết giờ là bắt buộc để tránh mất bài do thao tác tay chậm.
- Không random câu trong phase đầu để dễ kiểm thử và đối soát khi có khiếu nại.
- Kết quả hiển thị đúng/sai từng câu nhưng không lộ đáp án chuẩn để hạn chế rò đề.

</specifics>

<deferred>
## Deferred Ideas

- Todo đã review nhưng không fold vào Phase 18: **"Install all shadcn/radix components"** (`2026-04-27-install-all-shadcn-radix-components.md`) — lệch scope exam domain.
- Trắc nghiệm + tự luận/upload ảnh trong mock exam — để phase mở rộng sau khi flow trắc nghiệm ổn định.
- Admin reset attempt thủ công — deferred cho EXAM-ADV/v4.

</deferred>

---

*Phase: 18-mock-exam-system*
*Context gathered: 2026-05-13*
