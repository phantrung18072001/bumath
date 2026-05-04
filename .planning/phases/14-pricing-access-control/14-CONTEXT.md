# Phase 14: Pricing + Access Control - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 14 delivers the package model and DB-enforced access control:
- Admin can create and manage packages (name, price, admin-configurable grade coverage)
- Admin assigns packages to students (replaces course-by-course enrollment dialog)
- DB trigger auto-creates enrollments when package is assigned; cascade-deletes on revoke
- RLS on `lessons.video_url` checks `user_packages` directly — authorized students get URL, others get NULL
- Backfill migration: existing enrollments → grade-matched `user_packages` records (separate migration from RLS changes)
- Student profile page `/ho-so` shows name, email, active packages, grade coverage

**NOT in this phase**: Pricing display on landing page (Phase 19), VideoPlayer abstraction (Phase 19), domain restriction for video (Phase 19 via Cloudflare Stream/Bunny.net).

</domain>

<decisions>
## Implementation Decisions

### Package Model
- **D-01:** Admin-configurable grades per package — admin chọn một hoặc nhiều `target_grade` values (grade_7, grade_8, grade_9, advanced) khi tạo/sửa package qua UI. Không hardcode.
- **D-02:** Một học sinh có thể sở hữu nhiều packages cùng lúc. Quyền truy cập = union của tất cả grade coverage từ tất cả packages đang có.
- **D-03:** Giá (`price_vnd`) lưu trong DB để admin biết và hiển thị thông tin nội bộ. Display only — không có payment gateway (Out of Scope). Enrollment sau khi admin xác nhận thanh toán offline.
- **D-04:** Schema gợi ý:
  - `packages` table: `id, name, description, price_vnd, created_at`
  - `package_grades` table: `package_id, grade` (junction — một package có thể cover nhiều grades)
  - `user_packages` table: `id, user_id, package_id, assigned_at, assigned_by`

### Access Control (RLS Architecture)
- **D-05:** RLS trên `lessons` sử dụng column-level security — `video_url` trả về NULL nếu học sinh không có package phù hợp. Học sinh vẫn thấy lesson title/description (để hiển thị locked state), chỉ mất video URL.
- **D-06:** Helper function mới `has_grade_access(grade target_grade)` — SECURITY DEFINER, kiểm tra `user_packages JOIN package_grades` cho `auth.uid()`. RLS policy sử dụng function này.
- **D-07:** RLS access check dùng `user_packages` trực tiếp, KHÔNG qua bảng `enrollments`. Nghĩa là học sinh có package grade_7 tự động truy cập được mọi khóa học grade_7 — kể cả khóa học được thêm SAU khi gán package.
- **D-08:** Bảng `enrollments` vẫn giữ nguyên cho "/khoa-hoc" listing UI. Trigger tạo enrollment khi package được gán (xem D-09). Enrollments không phải nguồn truth cho access control.

### Enrollment Trigger
- **D-09:** DB trigger `on INSERT on user_packages` → tự động INSERT enrollments cho tất cả courses thuộc grade được cover bởi package đó (tại thời điểm gán). ON DELETE RESTRICT/CASCADE: xóa `user_packages` → trigger xóa enrollment tương ứng.
- **D-10:** Backfill migration (chạy TRƯỚC migration RLS):
  1. Nhìn vào `enrollments` hiện tại của từng học sinh → xác định các grades đã có
  2. Tìm hoặc tạo package tương ứng cho từng grade (ví dụ: "Lớp 7 Legacy", "Lớp 9 Legacy")
  3. Tạo `user_packages` records grade-matched
  4. Enrollment records cũ GIỮ NGUYÊN (trigger skip nếu enrollment đã tồn tại với UNIQUE constraint)
  - **⚠️ CRITICAL:** Backfill migration và RLS migration là 2 file riêng biệt. Không gộp.

### Admin UI
- **D-11:** `/quan-tri/goi-hoc` — trang mới trong admin sidebar để CRUD packages (tên, giá, grade coverage). Pattern tương tự `/quan-tri/khoa-hoc`.
- **D-12:** `UserEnrollmentDialog` trong UsersPage được **thay thế** bằng `UserPackageDialog` — admin chọn packages từ danh sách để gán/thu hồi, không gán course-by-course nữa.
- **D-13:** Admin sidebar thêm link "Gói học" → `/quan-tri/goi-hoc`.

### Student Profile
- **D-14:** Route mới `/ho-so` trong StudentLayout. Hiển thị: tên + email (từ profiles), danh sách gói đang có (từ user_packages JOIN packages), grade coverage (badges grade_7/grade_8/grade_9/advanced).
- **D-15:** Link vào `/ho-so` từ StudentLayout header — thêm bên cạnh nút đăng xuất.

### YouTube Video Security
- **D-16:** Video YouTube dùng **unlisted** privacy. Embed URL dùng `youtube-nocookie.com` (không set cookies).
- **D-17:** RLS là lớp bảo vệ chính — `video_url` chỉ trả về cho học sinh có package phù hợp. Nếu học sinh chia sẻ URL → unavoidable với YouTube.
- **D-18:** `vercel.json` thêm `X-Frame-Options: SAMEORIGIN` để ngăn BuMath app bị embed trong iframe từ domain khác.
- **D-19:** Domain restriction thực sự (chỉ embed từ bumath.vn) → Phase 19, khi VideoPlayer abstraction cho phép swap sang Cloudflare Stream hoặc Bunny.net.

### Claude's Discretion
- Implementation chi tiết của `has_grade_access()` function (join path, index optimization)
- Order của migration files (bao nhiêu files, naming)
- Error message hiển thị khi học sinh không có package ("Bạn chưa có gói học phù hợp" + CTA liên hệ admin)
- Loading/skeleton states cho student profile page

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Pricing (PRICE-01, PRICE-02, PRICE-03, PRICE-05) — acceptance criteria cho package CRUD, assignment, RLS, profile
- `.planning/REQUIREMENTS.md` §Video (VIDEO-01) — YouTube unlisted + RLS + Vercel headers
- `.planning/ROADMAP.md` §Phase 14 — Success Criteria và migration constraint

### Existing Code to Extend
- `src/components/admin/UserEnrollmentDialog.tsx` — file này sẽ bị REPLACE bởi UserPackageDialog
- `src/lib/api/enrollments.ts` — enrollment API, trigger sẽ thay thế manual insert
- `src/components/admin/AdminLayout.tsx` — thêm sidebar link "Gói học"
- `src/App.tsx` — thêm routes `/quan-tri/goi-hoc` và `/ho-so`

### RLS Patterns (từ Phase 02-03)
- Dùng `SECURITY DEFINER` helper functions (`get_my_role()`, `is_approved_user()`) làm pattern
- New function: `has_grade_access(grade)` — tương tự pattern trên
- Migration constraint: backfill BEFORE RLS (từ STATE.md Phase 14 key risk)

### No External Specs
- Không có ADR hay external spec file cho phase này — requirements đầy đủ trong decisions trên.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UserEnrollmentDialog.tsx` — layout/pattern có thể tái sử dụng cho `UserPackageDialog` (Dialog + Table + Select + mutation pattern)
- `src/components/ui/Badge.tsx` — grade badges đã có trong `UserEnrollmentDialog`, tái sử dụng cho package grade display
- `src/lib/api/enrollments.ts` — `getUserEnrollments()` pattern cho `getUserPackages()` API mới
- Admin page pattern (`CoursesPage.tsx`, `UsersPage.tsx`) — CRUD table + dialog pattern cho `/quan-tri/goi-hoc`

### Established Patterns
- RLS helpers: `SECURITY DEFINER` functions trong Supabase (Phase 02-03 pattern)
- TanStack React Query: `useQuery` + `useMutation` + `queryClient.invalidateQueries` pattern
- Supabase migrations: Một file per concern, backfill tách khỏi schema change
- `target_grade` enum: `grade_7 | grade_8 | grade_9 | advanced` — dùng trong `packages_grades` junction

### Integration Points
- `AdminLayout.tsx` — thêm sidebar nav item "Gói học"
- `App.tsx` — thêm routes `/quan-tri/goi-hoc` và `/ho-so`
- `StudentLayout.tsx` — thêm header link "Hồ sơ" → `/ho-so`
- Supabase DB: Cần 3 bảng mới (`packages`, `package_grades`, `user_packages`) + 2 triggers + 1 helper function + RLS policy update trên `lessons`

</code_context>

<specifics>
## Specific Ideas

- **"Khi thêm khóa học mới vào grade, học sinh có package tự động xem được"** — đây là lý do RLS check `user_packages` trực tiếp thay vì enrollments. Planner cần đảm bảo RLS policy dùng grade-based check, không enrollment-based.
- **Video URL protection limit**: YouTube không hỗ trợ "embeddable nhưng direct link không xem được". Chấp nhận limitation này cho v3. Phase 19 VideoPlayer abstraction để chuẩn bị swap sang provider có domain restriction (Cloudflare Stream / Bunny.net).
- **Backfill approach**: Nhìn vào grade của courses trong `enrollments` → tạo grade-matched packages. Nếu học sinh có enrollments cho grade_7 + grade_9 → tạo 2 `user_packages` entries.

</specifics>

<deferred>
## Deferred Ideas

- **Domain restriction cho YouTube embed** (chỉ load từ bumath.vn) → Phase 19 via VideoPlayer abstraction + Cloudflare Stream/Bunny.net
- **Pricing hiển thị trên landing page** (bảng giá 6 gói) → Phase 19 (PRICE-04)
- **Package expiry / subscription period** — không được đề cập trong v3 requirements. Nếu cần, thêm `expires_at` vào `user_packages` trong v4.
- **Self-service package purchase** — Payment gateway tự động (VNPay, Momo) → Out of Scope, v4+

</deferred>

---

*Phase: 14-pricing-access-control*
*Context gathered: 2026-05-04*
