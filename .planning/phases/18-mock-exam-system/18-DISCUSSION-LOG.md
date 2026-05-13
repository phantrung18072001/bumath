# Phase 18: Mock Exam System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 18-mock-exam-system
**Areas discussed:** Cấu trúc đề thi & câu hỏi, Timing & one-attempt, Chấm điểm & hiển thị kết quả, Luồng quản trị đợt thi

---

## Cấu trúc đề thi & câu hỏi

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ trắc nghiệm 1 đáp án đúng | Ship nhanh, rủi ro thấp | ✓ |
| Trắc nghiệm + tự luận text/LaTeX | Linh hoạt hơn nhưng phức tạp hơn | |
| Trắc nghiệm + upload ảnh lời giải | UX giàu hơn nhưng tăng scope storage/chấm | |

**User's choice:** Chỉ trắc nghiệm 1 đáp án đúng.
**Notes:** Giữ phạm vi chặt cho Phase 18.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ text + LaTeX | Không dùng ảnh | |
| Text + LaTeX + ảnh minh họa | Khớp roadmap KaTeX + image | ✓ |

**User's choice:** Text + LaTeX + ảnh minh họa.

| Option | Description | Selected |
|--------|-------------|----------|
| Thứ tự cố định theo admin | Dễ kiểm soát/chấm | ✓ |
| Random mỗi học sinh | Giảm trao đổi đáp án | |
| Random theo nhóm câu | Nâng cao, phức tạp | |

**User's choice:** Thứ tự cố định.

| Option | Description | Selected |
|--------|-------------|----------|
| Khóa sửa đề khi đã bắt đầu | Công bằng, nhất quán | ✓ |
| Sửa và áp dụng cho người vào sau | Có nguy cơ lệch đề | |
| Sửa mọi lúc | Rủi ro rất cao | |

**User's choice:** Khóa sửa đề khi đã bắt đầu.

---

## Timing & one-attempt

| Option | Description | Selected |
|--------|-------------|----------|
| Timer bắt đầu khi bấm “Bắt đầu thi” | Cá nhân hóa attempt, vẫn enforce server-side | ✓ |
| Timer theo starts_at toàn session | Cứng, có thể thiệt cho người vào muộn | |
| Hybrid | Phức tạp hơn | |

**User's choice:** Timer bắt đầu khi học sinh bấm bắt đầu.

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-submit khi hết giờ | Tránh mất trắng | ✓ |
| Hết giờ coi như không nộp | Khắt khe | |
| Grace period | Tăng edge cases | |

**User's choice:** Auto-submit.

| Option | Description | Selected |
|--------|-------------|----------|
| Cho vào lại + khôi phục bài làm tạm | UX tốt, cần autosave | ✓ |
| Cho vào lại nhưng làm lại từ đầu | UX kém | |
| Không cho vào lại | Quá gắt | |

**User's choice:** Cho vào lại và khôi phục.

| Option | Description | Selected |
|--------|-------------|----------|
| Tính attempt từ lúc bắt đầu | Khớp UNIQUE/session-user rule | ✓ |
| Tính attempt khi submit | Dễ lách start/restart | |
| Cho admin reset trong phase này | Mở rộng scope | |

**User's choice:** Tính attempt từ lúc bắt đầu.

---

## Chấm điểm & hiển thị kết quả

| Option | Description | Selected |
|--------|-------------|----------|
| Trả điểm ngay sau submit | Khớp EXAM-05 | ✓ |
| Trả điểm khi admin công bố | Delay feedback | |
| Trả điểm theo lịch | Delay feedback | |

**User's choice:** Trả điểm ngay.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ tổng điểm | Ít thông tin | |
| Tổng điểm + đúng/sai từng câu, không lộ đáp án | Cân bằng feedback và bảo mật đề | ✓ |
| Lộ đáp án đầy đủ | Rủi ro rò đề | |

**User's choice:** Tổng điểm + đúng/sai từng câu (không lộ đáp án).

| Option | Description | Selected |
|--------|-------------|----------|
| Thang 10 | Dễ hiểu với học sinh | |
| Raw score | Minh bạch số câu đúng | |
| Hiện cả hai | Đầy đủ ngữ cảnh | ✓ |

**User's choice:** Hiện cả thang 10 và raw score.

| Option | Description | Selected |
|--------|-------------|----------|
| Server nhận trước ends_at, quá hạn từ chối rõ ràng | Đúng EXAM-06 | ✓ |
| Retry không giới hạn sau ends_at | Sai boundary | |
| Grace 30s | Tăng complexity | |

**User's choice:** Enforce cứng theo server-side `ends_at`.

---

## Luồng quản trị đợt thi

| Option | Description | Selected |
|--------|-------------|----------|
| draft → published → closed | Lifecycle rõ ràng | ✓ |
| published/closed | Thiếu trạng thái chuẩn bị | |
| Không có trạng thái | Khó vận hành | |

**User's choice:** draft → published → closed.

| Option | Description | Selected |
|--------|-------------|----------|
| Publish khi có >=1 câu và đủ đáp án đúng | Guardrail tối thiểu cần thiết | ✓ |
| Publish rỗng rồi bổ sung sau | Rủi ro lỗi vận hành | |
| Chỉ cần tiêu đề + thời gian | Rủi ro chất lượng đề | |

**User's choice:** Bắt buộc có câu hỏi + đáp án hợp lệ trước khi publish.

| Option | Description | Selected |
|--------|-------------|----------|
| Được sửa full nếu chưa bắt đầu | Linh hoạt trước giờ thi | ✓ |
| Chỉ sửa metadata | Hạn chế quá mức | |
| Khóa toàn bộ sau publish | Thiếu linh hoạt | |

**User's choice:** Cho sửa toàn bộ trước khi bắt đầu.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ xóa khi chưa có ai bắt đầu | Bảo toàn lịch sử attempt | ✓ |
| Xóa mọi lúc | Mất dữ liệu/rủi ro audit | |
| Không xóa, chỉ close | Có thể dư session rác | |

**User's choice:** Chỉ xóa khi chưa có attempt.

---

## the agent's Discretion

- Chi tiết UI countdown/cảnh báo thời gian.
- Chi tiết kỹ thuật autosave và khôi phục bài làm tạm.
- Tổ chức API/query keys theo chuẩn codebase hiện có.

## Deferred Ideas

- Todo reviewed but deferred: `2026-04-27-install-all-shadcn-radix-components.md` (không thuộc phạm vi exam).
- Tự luận/upload ảnh trong mock exam.
- Admin reset attempt thủ công.
