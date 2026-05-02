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
- ✓ Vercel SPA hosting với deep-link routing — v1.0
- ✓ Supabase client singleton (`src/lib/supabase.ts`) với env var plumbing — v1.0
- ✓ Đăng ký / đăng nhập / đăng xuất từ mọi trang — v1.0
- ✓ Admin approval gate cho học sinh (pending → approved → /courses) — v1.0
- ✓ Role-based access control (student / teacher / admin) — v1.0
- ✓ Profiles table RLS (học sinh không thấy data của nhau) — v1.0
- ✓ Admin CRUD khóa học, chương, bài học với YouTube embed — v1.0
- ✓ Admin đính kèm đề bài (PDF/image) vào bài học — v1.0
- ✓ Admin gán học sinh vào khóa học — v1.0
- ✓ Học sinh xem và phát video bài giảng (YouTube embed) — v1.0
- ✓ Học sinh đánh dấu bài đã xem → tự động tính % hoàn thành — v1.0
- ✓ Học sinh nộp bài tập bằng ảnh chụp (compress < 500KB) — v1.0
- ✓ Trạng thái bài tập: Chưa nộp / Đã nộp / Đã chấm — v1.0
- ✓ Giảng viên xem hàng đợi bài nộp, nhập điểm + comment — v1.0
- ✓ Teacher role: đăng nhập → redirect /admin/submissions, thấy sidebar "Chấm bài" — v1.0
- ✓ Học sinh nhận bell notification khi bài được chấm — v1.0
- ✓ Admin grading queue với bộ lọc (lớp, khóa học, bài học, học sinh) — v1.0
- ✓ Student course catalogue tại /catalogue với badge đã/chưa đăng ký — v1.0
- ✓ CourseDetailPage preview mode cho học sinh chưa đăng ký — v1.0
- ✓ Responsive 375px, tap targets 48px, giao diện tiếng Việt — v1.0

### Active (v2.0 — UI Refactor)

- [ ] Toàn bộ UI ngoài landing page được refactor với thiết kế hiện đại, đẹp hơn
- [ ] Các trang danh sách (admin users, courses, submissions; student catalogue, courses) có pagination
- [ ] Các trang danh sách có bộ filter phù hợp (search, grade, status…)
- [ ] URL đồng nhất (English-only hoặc Vietnamese-only — cần quyết định)
- [ ] Email notification khi bài được chấm (GRADE-04 original requirement)

### Out of Scope

- Trắc nghiệm tự chấm — deferred to v2 (planned extension after manual grading works)
- Self-hosted video storage — deferred to v2 (YouTube embed đủ cho MVP)
- Payment/thanh toán — không xây trong v1 (quản lý enrollment thủ công)
- Mobile app (iOS/Android) — web-first, mobile later
- Chat trực tiếp giảng viên–học sinh — complexity cao, ngoài scope LMS cơ bản
- Thống kê/analytics nâng cao — v2+

## Context

**Shipped v1.0 (2026-05-01):** 8 phases, 38 plans, ~12,128 LOC TypeScript. Full async LMS — auth with role-based access, admin course/enrollment management, student learning + submission, teacher grading + bell notifications, UX polish, security hardening.

**Current routes:**
- `/` — Landing page (marketing, untouched)
- `/login`, `/register` — Public auth pages
- `/pending` — Approval pending screen
- `/admin/users` — Admin: user management
- `/admin/courses` — Admin: course list
- `/admin/courses/:courseSlug` — Admin: course detail / chapters
- `/admin/courses/:courseSlug/chapters/:chapterSlug` — Admin: chapter detail / lessons
- `/admin/submissions` — Admin+Teacher: grading queue
- `/admin/submissions/:submissionId` — Admin+Teacher: grade submission
- `/courses` — Student: enrolled courses
- `/courses/:courseSlug` — Student: course detail / lesson view
- `/catalogue` — Student: all courses catalogue

**Backend strategy:** Supabase — Auth, PostgreSQL, Storage, RLS. All policies implemented. No server to maintain.

**Deployment:** Vercel (SPA routing). Live at production URL.

**Target users:** Học sinh THCS lớp 7–9 và ôn thi chuyên Toán — UX đơn giản, mobile-first. Giảng viên và admin — dashboard gọn gàng, nhanh.

**Known tech debt:** `requireApproved` dead code in ProtectedRoute; `GRADE_BADGE` duplicated in UserEnrollmentDialog; hardcoded ADMIN_ZALO_NUMBER in Pending.tsx.

## Constraints

- **Stack**: React + TypeScript + Vite + shadcn/ui — không thay đổi stack frontend
- **Backend**: Supabase — auth, DB, storage đều qua Supabase client
- **Video MVP**: YouTube embed only — không upload video trực tiếp trong v1
- **Package manager**: Yarn 4.11.0 — không dùng npm
- **Language**: Giao diện tiếng Việt, code comments có thể tiếng Anh

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase làm backend | Auth + DB + Storage trong một, không cần tự maintain server, RLS cho phân quyền | ✓ Good — no issues, all RLS policies delivered |
| YouTube embed cho video MVP | Tiết kiệm storage/bandwidth, đủ dùng cho giai đoạn đầu | ✓ Good — works well, students have no issues |
| Bài tập nộp ảnh → chấm thủ công | Phù hợp với bài toán tự luận, dễ triển khai nhanh | ✓ Good — fits Vietnamese handwritten math |
| Admin duyệt tài khoản học sinh | Kiểm soát chất lượng học sinh, tránh truy cập không mong muốn | ✓ Good — approval flow works, simplified in Phase 7 |
| GRADE-04 email → bell notification | Email phức tạp hơn dự kiến; in-app bell đủ dùng cho MVP | ✓ Good — accepted scope adjustment |
| ProtectedRoute `allowedRoles` array API | Backward-compatible extension; teacher+admin share routes cleanly | ✓ Good — clean DX, 0 regressions |

## Evolution

This document evolves at phase transitions and milestone boundaries.

Last updated: Phase 12.1 complete — UI gap closure: touch targets, typography, error states, copywriting, prefers-reduced-motion fixed across admin pages (GradingPage, CoursesPage, UsersPage, SubmissionsPage, ChaptersPage, LessonsPage).

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
*Last updated: 2026-05-02 after Phase 12.1 gap closure — UI violations fixed in 6 admin pages, v2.0 UI Refactor milestone in progress*
