# Roadmap: BuMath LMS

## Milestones

- ✅ **v1.0 MVP** — Phases 1-8, 38 plans (shipped 2026-05-01) — [Archive](.planning/milestones/v1.0-ROADMAP.md)
- ✅ **v2.0 UI Refactor** — Phases 9-13, 26 plans (shipped 2026-05-03) — [Archive](.planning/milestones/v2.0-ROADMAP.md)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–8) — SHIPPED 2026-05-01</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed
- [x] Phase 2: Auth & Access Control (7/7 plans) — completed 2026-03-24
- [x] Phase 3: Course Management (6/6 plans) — completed
- [x] Phase 4: Student Learning & Submission (5/5 plans) — completed 2026-04-07
- [x] Phase 5: Grading & Notification (5/5 plans) — completed 2026-04-08
- [x] Phase 6: UX Polish (6/6 plans) — completed 2026-04-27
- [x] Phase 7: Auth & Security Fixes (5/5 plans) — completed 2026-04-29
- [x] Phase 8: Teacher Role Access (2/2 plans) — completed 2026-05-01

Full details: [.planning/milestones/v1.0-ROADMAP.md](.planning/milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>✅ v2.0 UI Refactor (Phases 9–13) — SHIPPED 2026-05-03</summary>

- [x] Phase 9: URL Standardization (7/7 plans) — completed 2026-05-01
- [x] Phase 10: Auth Pages UI (2/2 plans) — completed 2026-05-01
- [x] Phase 11: Admin List Pages (5/5 plans) — completed 2026-05-01
- [x] Phase 12: Admin Detail Pages (6/6 plans) — completed 2026-05-02
- [x] Phase 12.1: UI Fix — Error States, Typography, Touch Targets (2/2 plans) — completed 2026-05-02
- [x] Phase 13: Student Pages (4/4 plans) — completed 2026-05-03

Full details: [.planning/milestones/v2.0-ROADMAP.md](.planning/milestones/v2.0-ROADMAP.md)

</details>

### 📋 v3.0 Platform Expansion (Phases 14–19)

- [x] **Phase 14: Pricing + Access Control** — Package model, DB-enforced lesson access, admin assignment UI, student package view
- [x] **Phase 15: Admin UX + Audit** — Inline sidebar forms on shared course detail, broken link sweep (2026-05-04)
- [x] **Phase 16: Lesson Tabs + Study Materials Library** — 3-tab lesson layout, PDF library with category × grade filter (completed 2026-05-07)
- [x] **Phase 17: In-Lesson Chat** — Realtime student↔teacher messaging scoped per lesson, unread badge (completed 2026-05-08)
- [ ] **Phase 18: Mock Exam System** — Timed exam sessions, KaTeX questions, server-side enforcement, one-attempt rule
- [ ] **Phase 19: Landing Page + Navigator + Video Abstraction** — School navigator, course content sections, VideoPlayer abstraction, pricing display

## Phase Details

### Phase 14: Pricing + Access Control
**Goal**: Bài học chỉ hiển thị cho học sinh có package phù hợp — quyền truy cập được kiểm soát bởi DB, không phải client-side
**Depends on**: Phase 13 (enrolled student flow already live)
**Requirements**: PRICE-01, PRICE-02, PRICE-03, PRICE-05, VIDEO-01
**Success Criteria** (what must be TRUE):
  1. Admin có thể tạo package mới (tên, giá, grade coverage) và sửa package đã có trong trang quản trị
  2. Admin có thể gán package cho học sinh — khi gán xong, bảng `enrollments` tự động được populate (trigger)
  3. Học sinh không có package phù hợp bị chặn ở bài học với thông báo rõ ràng (không crash, không silent blank)
  4. Học sinh đã có package thấy đúng package đang sở hữu trong trang profile của mình
  5. `video_url` chỉ trả về qua RLS cho học sinh có quyền truy cập; unlisted + `youtube-nocookie.com` embed domain
**Plans**: 6 plans
- [x] 14-P01-PLAN.md — Database schema: packages, package_grades, user_packages + backfill migration + has_grade_access() + lessons_view + enrollment triggers
- [x] 14-P02-PLAN.md — API layer: packages.ts CRUD, user-packages.ts assign/revoke, fetchLessonsForStudent added to lessons.ts
- [x] 14-P03-PLAN.md — Admin Package Management UI: PackagesPage + PackageFormDialog + AdminLayout sidebar nav + App.tsx route
- [x] 14-P04-PLAN.md — Admin User Package Assignment UI: UserPackageDialog replaces UserEnrollmentDialog in UsersPage
- [x] 14-P05-PLAN.md — Student Profile Page (/ho-so) + locked lesson state in LessonContent + CourseDetailPage → lessons_view
- [x] 14-P06-PLAN.md — Vercel security headers: X-Frame-Options SAMEORIGIN in vercel.json
**UI hint**: yes

**⚠️ Migration constraint:** Backfill existing enrollments trước khi thay đổi RLS — không gộp backfill + RLS trong một migration. Mọi RLS policy mới phải dùng `get_my_role()` và `is_approved_user()`.

---

### Phase 15: Admin UX + Audit
**Goal**: Admin có thể thêm/sửa chuyên đề và bài giảng inline trong sidebar trên cùng trang course detail với học sinh; toàn bộ button/link trong app dẫn đến URL hợp lệ
**Depends on**: Phase 14
**Requirements**: AUDIT-01, ADMIN-01, ADMIN-02, ADMIN-03
**Success Criteria** (what must be TRUE):
  1. Không còn button hoặc link nào trong app dẫn đến 404 hoặc không có `href`/`onClick` handler
  2. Click "Thêm chuyên đề" mở form inline trong sidebar trên `/quan-tri/khoa-hoc/:courseSlug` (không dialog, không route con riêng)
  3. Click "Thêm bài giảng" mở form inline trong sidebar dưới đúng chuyên đề (không dialog, không route con riêng)
  4. Form inline dùng card/spacing/typography nhất quán với student-side (`#F0FDFA`, `bm-clay-card-student`, shadcn form controls)
**Plans**: P01 (shared shell + routing), P02 (sidebar admin + inline forms), P03 (audit + docs alignment)
**UI hint**: yes

- [x] 15-P01-PLAN.md — Shared `CourseDetailPage` + `isAdmin`; admin lessons via `fetchLessons`; remove `/chuong/:chapterSlug` route
- [x] 15-P02-PLAN.md — `LessonSidebar` admin + DnD; `ChapterInlineForm` / `LessonInlineForm`; remove `ChaptersPage` / `LessonsPage`
- [x] 15-P03-PLAN.md — Header nav dead routes fixed; requirements already aligned for inline forms

**⚠️ Route ordering:** Mọi literal route `/quan-tri/khoa-hoc/...` (nếu thêm sau này) phải đứng trước param route `/quan-tri/khoa-hoc/:courseSlug` trong `App.tsx`.

---

### Phase 16: Lesson Tabs + Study Materials Library
**Goal**: Trang bài học có 3 tab rõ ràng; học sinh và admin có thể upload/browse/download tài liệu PDF theo category và grade
**Depends on**: Phase 14 (access control RLS must be live before materials inherit it)
**Requirements**: LESSON-01, LESSON-02, LESSON-03, MAT-01, MAT-02, MAT-03
**Success Criteria** (what must be TRUE):
  1. Trang xem bài học hiển thị 3 tab: "Bài giảng", "Chấm bài", "Tài liệu & Kiểm tra" — chuyển tab không reload trang
  2. Tab "Chấm bài" chứa đúng submission area và grading status hiện tại (không mất tính năng cũ)
  3. Admin có thể upload tài liệu PDF với category (giữa kỳ, cuối kỳ, vào 10, HSG, chuyên toán) và grade (7/8/9)
  4. Học sinh đã approved có thể filter tài liệu theo category và grade, click để download
  5. Tab "Tài liệu & Kiểm tra" trong bài học hiển thị materials liên quan đến grade của khóa học đó
**Plans**: 4 plans
Plans:
- [ ] 18-01-PLAN.md — DB schema + RLS + RPC enforcement for sessions/questions/attempts/grading
- [ ] 18-02-PLAN.md — API contracts + Wave 0 tests for admin/student exam flows
- [ ] 18-03-PLAN.md — Admin exam session lifecycle + question authoring UI
- [ ] 18-04-PLAN.md — Student open-exam list + timed attempt + immediate result UI
**UI hint**: yes

**⚠️ Storage:** Tạo bucket `study-materials` riêng biệt (không dùng bucket `assignments`). Signed URL 1 giờ, regenerate mỗi lần load trang.

---

### Phase 17: In-Lesson Chat
**Goal**: Học sinh có thể hỏi giảng viên trực tiếp trong ngữ cảnh từng bài học; giảng viên thấy và trả lời câu hỏi mới ngay lập tức
**Depends on**: Phase 16 (tab structure must exist — Chat slots into Tab 3)
**Requirements**: CHAT-01, CHAT-02, CHAT-03
**Success Criteria** (what must be TRUE):
  1. Học sinh gửi câu hỏi trong bài học và thấy tin nhắn xuất hiện ngay trong Chat tab
  2. Giảng viên/admin vào cùng bài học, thấy câu hỏi và có thể reply — học sinh thấy reply trong real-time
  3. Chat tab hiển thị badge số tin nhắn chưa đọc (vd: "Chat (2)") khi có câu hỏi mới
  4. Chuyển sang bài học khác và quay lại không tạo ra duplicate messages hoặc orphaned subscriptions
**Plans**: 4 plans
- [ ] 17-01-PLAN.md — DB foundation: lesson_chat_messages + lesson_chat_reads tables, RLS policies, delete_chat_message + get_teacher_unread_chat_count RPCs, REPLICA IDENTITY FULL
- [ ] 17-02-PLAN.md — API contract (src/lib/api/lesson-chat.ts) + Wave 0 test scaffolds (ChatPanel, ChatMessage, ChatInput, BellNotification chat-unread stubs)
- [ ] 17-03-PLAN.md — ChatMessage + ChatInput + ChatPanel components; integrate into LessonContent.tsx Tab 3 (remove !isAdmin guards); activate component tests
- [ ] 17-04-PLAN.md — Extend BellNotification.tsx with merged graded+chat unread badge; activate chat-unread tests
**UI hint**: yes

**⚠️ Realtime:** Mọi `supabase.channel().subscribe()` PHẢI có cleanup `return () => supabase.removeChannel(channel)`. Chỉ mở channel khi Chat tab active (lazy-open). Deduplicate messages bằng UUID. Test với React StrictMode bật.

---

### Phase 18: Mock Exam System
**Goal**: Học sinh có thể tham gia thi thử trong cửa sổ thời gian quy định và xem điểm ngay sau khi nộp; admin quản lý đợt thi và đề bài
**Depends on**: Phase 17 (Realtime pattern established; exam photo upload reuses submission pattern)
**Requirements**: EXAM-01, EXAM-02, EXAM-03, EXAM-04, EXAM-05, EXAM-06
**Success Criteria** (what must be TRUE):
  1. Admin có thể tạo đợt thi (tên, loại, thời gian bắt đầu/kết thúc, đề bài PDF) và thêm câu hỏi có LaTeX/ảnh kèm đáp án
  2. Học sinh thấy danh sách đợt thi đang mở, vào làm bài với countdown đếm ngược theo thời gian thực từ `started_at` trong DB
  3. Học sinh chỉ được nộp bài đúng 1 lần — cố submit lần 2 bị chặn với thông báo rõ ràng
  4. Nộp bài sau khi `ends_at` bị server-side từ chối (không phụ thuộc client clock)
  5. Học sinh thấy điểm ngay sau khi nộp bài thành công
**Plans**: TBD
**UI hint**: yes

**⚠️ Security:** Đáp án phải trong bảng riêng `exam_question_answers` với student-blocking RLS. Chấm điểm qua `SECURITY DEFINER` DB function — không trả raw answers về browser. `UNIQUE(exam_session_id, user_id)` trên bảng submissions.
**⚠️ Dependency:** `yarn add katex react-katex` chỉ thêm ở phase này.

---

### Phase 19: Landing Page + School Navigator + Video Abstraction
**Goal**: Landing page có đủ nội dung giới thiệu khóa học, bảng giá, school navigator và video player có thể swap provider; học sinh tìm đúng khóa học từ landing page
**Depends on**: Phase 14 (pricing data ready to display), Phase 16 (study materials available for navigator target courses)
**Requirements**: NAV-01, NAV-02, LAND-01, LAND-02, LAND-03, VIDEO-02, PRICE-04
**Success Criteria** (what must be TRUE):
  1. Landing page có section giới thiệu đầy đủ Toán 7 (Cơ bản + Nâng cao) và Toán 8 (Cơ bản + Nâng cao) với nội dung khóa học
  2. Landing page có section ôn chuyên 9→10 với các chương trình A→Z, cấp tốc, Tứ trụ (PTNK/CNN/CSP/KHTN)
  3. Học sinh chọn trường chuyên mục tiêu → click "Tìm kiếm" → được điều hướng đến khóa học phù hợp
  4. Landing page hiển thị bảng giá 6 gói (Lớp 7: 1.5M, Lớp 8: 1.5M, Cấp tốc: 2M, Ôn chuyên: 3M, Tứ trụ: 2.5M, Toàn bộ: 4M) với định dạng VND đúng
  5. `VideoPlayer` component nhận `provider` prop — YouTube và self-hosted URL đều render đúng mà không cần thay đổi parent components
**Plans**: TBD
**UI hint**: yes

**Note:** VideoPlayer abstraction KHÔNG xóa YouTube — chỉ wrap nó. School Navigator dùng static constants map, không cần DB.

### Phase 20: Student + Admin UI/UX — AI EdTech SaaS Design Language

**Goal:** Áp dụng design language hiện đại (glassmorphism, indigo/purple palette, premium SaaS aesthetic) lên toàn bộ màn hình học sinh và quản trị — giữ nguyên backgrounds hiện tại, chỉ nâng cấp cards, buttons, badges và interactive elements
**Requirements**: TBD
**Depends on:** Phase 19
**Plans:** 4/4 plans complete

**Background lock rule:** Mọi plan trong phase này phải giữ nguyên background colors (`#F0FDFA` mint cho student, current bg cho admin). Chỉ sửa card/button/badge styles.

Plans:
- [ ] TBD (run /gsd:plan-phase 20 to break down)

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 14. Pricing + Access Control | 6/6 | ✅ Complete | 8dbc495, 1b1eb04, e14c7e9, 14154f6, 86040f9 |
| 15. Admin UX + Audit | 3/3 | ✅ Complete | - |
| 16. Lesson Tabs + Study Materials | 4/4 | ✅ Complete | - |
| 17. In-Lesson Chat | 4/4 | ✅ Complete | 2026-05-08 |
| 18. Mock Exam System | 4/4 | ✅ Complete | - |
| 19. Landing Page + Navigator + Video | 1/1 | ✅ Complete | 2026-05-18 |
| 20. UI/UX Redesign (P01–P04) | 4/4 | ✅ Complete | 2026-05-18 |
| 21. Tài liệu Page | 0/? | Not started | - |

---

### Phase 21: Tài liệu Page

**Goal:** Trang `/tai-lieu` công khai — browse và download tài liệu PDF theo grade. Trang admin `/quan-tri/tai-lieu` cho giáo viên upload.

**Scope:**
1. Migration: `lesson_id` nullable, thêm grade `advanced`, category optional
2. API: thêm `fetchStandaloneStudyMaterials(grade?)` vào `study-materials.ts`
3. Trang `/tai-lieu` (public) — grid cards, filter theo grade
4. Trang `/quan-tri/tai-lieu` (admin + teacher) — upload form + danh sách quản lý
5. Routes + AdminLayout nav link

**Depends on:** Phase 16 (study_materials table + API exists)
