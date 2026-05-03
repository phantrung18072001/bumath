# Requirements: BuMath LMS v3.0

**Defined:** 2026-05-03
**Core Value:** Học sinh có thể tự học theo tiến độ và nhận phản hồi cụ thể từ giảng viên trên từng bài làm

## v3.0 Requirements

### Audit

- [ ] **AUDIT-01**: Admin/dev có thể thấy và fix toàn bộ button/link chưa có URL hoặc dẫn đến 404

### Pricing

- [ ] **PRICE-01**: Admin có thể tạo và sửa package (tên, giá VND, grade coverage)
- [ ] **PRICE-02**: Admin có thể gán package cho học sinh (thay thế enrollment thủ công hiện tại)
- [ ] **PRICE-03**: Học sinh chỉ xem được bài học thuộc grade trong package đã được gán
- [ ] **PRICE-04**: Landing page hiển thị bảng giá 6 gói (Lớp 7: 1.5M, Lớp 8: 1.5M, Cấp tốc: 2M, Ôn chuyên: 3M, Tứ trụ: 2.5M, Toàn bộ: 4M)
- [ ] **PRICE-05**: Học sinh xem được gói đang sở hữu trong trang profile

### Admin UX

- [ ] **ADMIN-01**: Trang "Thêm chuyên đề" là trang riêng (không phải dialog), có URL riêng
- [ ] **ADMIN-02**: Trang "Thêm bài giảng" là trang riêng (không phải dialog), có URL riêng
- [ ] **ADMIN-03**: Trang thêm chuyên đề/bài giảng có thiết kế nhất quán với student-side UI

### Lesson UI

- [ ] **LESSON-01**: Trang xem bài học có 3 tab: "Bài giảng", "Chấm bài", "Tài liệu & Kiểm tra"
- [ ] **LESSON-02**: Tab "Chấm bài" chứa submission area và grading status (nội dung hiện tại)
- [ ] **LESSON-03**: Tab "Tài liệu & Kiểm tra" chứa study materials liên quan và link đến đợt thi thử

### Chat

- [ ] **CHAT-01**: Học sinh có thể gửi câu hỏi cho giảng viên trong ngữ cảnh từng bài học cụ thể
- [ ] **CHAT-02**: Giảng viên và admin có thể reply và xem toàn bộ tin nhắn theo bài học
- [ ] **CHAT-03**: Giảng viên thấy badge thông báo khi có câu hỏi mới chưa trả lời

### Materials

- [ ] **MAT-01**: Admin có thể upload tài liệu PDF với category (giữa kỳ, cuối kỳ, vào 10, HSG, chuyên toán) và grade (7/8/9)
- [ ] **MAT-02**: Tất cả học sinh đã approved có thể xem và tải tài liệu
- [ ] **MAT-03**: Trang tài liệu có filter theo category và grade

### Exam

- [ ] **EXAM-01**: Admin có thể tạo đợt thi thử (tên, loại tháng/quý, thời gian bắt đầu/kết thúc)
- [ ] **EXAM-02**: Admin có thể thêm câu hỏi vào đợt thi (text/LaTeX và/hoặc ảnh đính kèm) kèm đáp án
- [ ] **EXAM-03**: Học sinh thấy danh sách đợt thi đang mở và có thể vào làm bài
- [ ] **EXAM-04**: Học sinh chỉ được nộp bài 1 lần mỗi đợt thi
- [ ] **EXAM-05**: Học sinh xem được điểm sau khi nộp bài
- [ ] **EXAM-06**: Thời hạn nộp bài tính từ `ends_at` trong DB (server-side), không phải local clock

### Navigator

- [ ] **NAV-01**: Landing page có section "Ôn thi chuyên toán" với danh sách trường THPT chuyên HCMC (PTNK, CNN, CSP, KHTN và các trường khác)
- [ ] **NAV-02**: Học sinh chọn trường mục tiêu → click "Tìm kiếm" → điều hướng đến khóa học phù hợp

### Landing

- [ ] **LAND-01**: Landing page giới thiệu Toán 7 (Cơ bản + Nâng cao)
- [ ] **LAND-02**: Landing page giới thiệu Toán 8 (Cơ bản + Nâng cao)
- [ ] **LAND-03**: Landing page giới thiệu ôn chuyên 9→10: đầy đủ A→Z chuyên đề, bài tập trọng tâm, cấp tốc từ 0→8+, Tứ trụ (PTNK/CNN/CSP/KHTN)

### Video

- [ ] **VIDEO-01**: Video YouTube dùng unlisted, `video_url` chỉ trả về cho học sinh có quyền truy cập (RLS), Vercel headers chặn embed từ domain khác
- [ ] **VIDEO-02**: VideoPlayer component abstract hoá provider — hỗ trợ YouTube embed và self-hosted URL để dễ swap về sau

## v4 Requirements (Deferred)

### Analytics

- **ANALYTICS-01**: Admin xem thống kê học tập (tỉ lệ hoàn thành, điểm trung bình theo lớp)
- **ANALYTICS-02**: Học sinh xem learning progress tổng hợp theo tuần/tháng

### Notifications

- **NOTIF-01**: Email notification khi bài được chấm (đã deferred từ v1.0)

### Exam Advanced

- **EXAM-ADV-01**: Cho phép làm lại bài thi sau khi hết hạn (admin có thể reset)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment gateway tự động (VNPay, Momo) | Enrollment thủ công đủ dùng cho giai đoạn hiện tại |
| Self-hosted video storage v3 | YouTube unlisted + abstract layer đủ; self-host là v4+ |
| Trắc nghiệm tự chấm real-time | Mock exam system đủ phức tạp; auto-grade sau v3 |
| Mobile app (iOS/Android) | Web-first |
| Chat video/audio | Text chat đủ dùng cho hỏi đáp toán |

## Traceability

*(Populated during roadmap creation — v3.0 Phases 14–19)*

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUDIT-01 | Phase 15 | Pending |
| PRICE-01 | Phase 14 | Pending |
| PRICE-02 | Phase 14 | Pending |
| PRICE-03 | Phase 14 | Pending |
| PRICE-04 | Phase 19 | Pending |
| PRICE-05 | Phase 14 | Pending |
| ADMIN-01 | Phase 15 | Pending |
| ADMIN-02 | Phase 15 | Pending |
| ADMIN-03 | Phase 15 | Pending |
| LESSON-01 | Phase 16 | Pending |
| LESSON-02 | Phase 16 | Pending |
| LESSON-03 | Phase 16 | Pending |
| CHAT-01 | Phase 17 | Pending |
| CHAT-02 | Phase 17 | Pending |
| CHAT-03 | Phase 17 | Pending |
| MAT-01 | Phase 16 | Pending |
| MAT-02 | Phase 16 | Pending |
| MAT-03 | Phase 16 | Pending |
| EXAM-01 | Phase 18 | Pending |
| EXAM-02 | Phase 18 | Pending |
| EXAM-03 | Phase 18 | Pending |
| EXAM-04 | Phase 18 | Pending |
| EXAM-05 | Phase 18 | Pending |
| EXAM-06 | Phase 18 | Pending |
| NAV-01 | Phase 19 | Pending |
| NAV-02 | Phase 19 | Pending |
| LAND-01 | Phase 19 | Pending |
| LAND-02 | Phase 19 | Pending |
| LAND-03 | Phase 19 | Pending |
| VIDEO-01 | Phase 14 | Pending |
| VIDEO-02 | Phase 19 | Pending |

**Coverage:**
- v3.0 requirements: 31 total
- Mapped to phases: 31 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-03*
*Last updated: 2026-05-03 after initial definition*
