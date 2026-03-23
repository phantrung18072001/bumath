# BuMath LMS

## What This Is

Nền tảng học toán trực tuyến dành cho học sinh THCS (lớp 7–9) và ôn thi chuyên Toán. Admin và giảng viên quản lý khóa học, upload bài giảng dạng video (YouTube embed), giao bài tập; học sinh đăng ký tài khoản, theo dõi tiến độ học, nộp bài dưới dạng ảnh chụp bài làm tay và nhận kết quả chấm trực tiếp trên hệ thống.

## Core Value

Học sinh có thể tự học theo tiến độ và nhận phản hồi cụ thể từ giảng viên trên từng bài làm — giữ được chất lượng dạy học 1-1 trong môi trường online.

## Requirements

### Validated

- ✓ Landing page marketing với thông tin khóa học (grades 7, 8, 9, ôn chuyên) — existing
- ✓ Form tư vấn/đăng ký quan tâm gửi về Google Sheets — existing
- ✓ Responsive design, hỗ trợ tiếng Việt (font Be Vietnam Pro) — existing
- ✓ Navigation header với placeholder cho login/register — existing

### Active

**Auth & Accounts**
- [ ] Học sinh tự đăng ký tài khoản (email + password)
- [ ] Admin duyệt tài khoản học sinh trước khi học được
- [ ] Giảng viên/admin có tài khoản với quyền riêng biệt
- [ ] Đăng nhập, đăng xuất, session persistent

**Course Management (Admin)**
- [ ] Admin tạo/sửa/xóa khóa học (tên, mô tả, lớp mục tiêu)
- [ ] Admin thêm bài học vào khóa học (tiêu đề, video YouTube, mô tả)
- [ ] Admin sắp xếp thứ tự bài học trong khóa
- [ ] Admin đính kèm bài tập vào bài học (file PDF hoặc hình ảnh đề bài)

**Learning Experience (Student)**
- [ ] Học sinh xem danh sách khóa học được phép truy cập
- [ ] Học sinh xem và phát video bài giảng (YouTube embed)
- [ ] Học sinh đánh dấu bài đã xem → tự động tính % hoàn thành khóa
- [ ] Học sinh nộp bài tập bằng cách upload ảnh chụp bài làm

**Grading (Giảng viên)**
- [ ] Giảng viên xem danh sách bài nộp của học sinh
- [ ] Giảng viên nhập điểm và viết nhận xét/comment trên bài nộp
- [ ] Học sinh nhận thông báo và xem kết quả chấm bài

**Progress Tracking**
- [ ] Hiển thị bài nào đã xem / chưa xem trong từng khóa
- [ ] Progress bar % hoàn thành theo khóa học
- [ ] Trạng thái bài tập: chưa nộp / đã nộp / đã chấm + điểm

### Out of Scope

- Trắc nghiệm tự chấm — deferred to v2 (planned extension after manual grading works)
- Self-hosted video storage — deferred to v2 (YouTube embed đủ cho MVP)
- Payment/thanh toán — không xây trong v1 (quản lý enrollment thủ công)
- Mobile app (iOS/Android) — web-first, mobile later
- Chat trực tiếp giảng viên–học sinh — complexity cao, ngoài scope LMS cơ bản
- Thống kê/analytics nâng cao — v2+

## Context

**Codebase hiện tại:** React 18 + TypeScript + Vite SPA. Landing page đã hoàn chỉnh. Routing (React Router v6), form handling (React Hook Form + Zod), server state (TanStack Query), UI (shadcn/ui + Tailwind) đã sẵn sàng mở rộng. Hiện deploy lên GitHub Pages (static).

**Backend strategy:** Supabase — cung cấp Auth, PostgreSQL database, Storage (cho file bài tập), và Realtime. Đây là lựa chọn phù hợp nhất cho MVP: không cần tự maintain server, có Row Level Security cho phân quyền học sinh/giảng viên/admin.

**Deployment:** Cần chuyển từ GitHub Pages thuần tĩnh sang hosting có thể gọi Supabase client (Vercel hoặc Netlify phù hợp hơn về lâu dài).

**Target users:** Học sinh THCS lớp 7, 8, 9 — ưu tiên UX đơn giản, dễ dùng trên điện thoại. Giảng viên toán — cần dashboard chấm bài gọn gàng, nhanh.

## Constraints

- **Stack**: React + TypeScript + Vite + shadcn/ui — không thay đổi stack frontend
- **Backend**: Supabase — auth, DB, storage đều qua Supabase client
- **Video MVP**: YouTube embed only — không upload video trực tiếp trong v1
- **Package manager**: Yarn 4.11.0 — không dùng npm
- **Language**: Giao diện tiếng Việt, code comments có thể tiếng Anh

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase làm backend | Auth + DB + Storage trong một, không cần tự maintain server, RLS cho phân quyền | — Pending |
| YouTube embed cho video MVP | Tiết kiệm storage/bandwidth, đủ dùng cho giai đoạn đầu | — Pending |
| Bài tập nộp ảnh → chấm thủ công | Phù hợp với bài toán tự luận, dễ triển khai nhanh | — Pending |
| Admin duyệt tài khoản học sinh | Kiểm soát chất lượng học sinh, tránh truy cập không mong muốn | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-23 after initialization*
