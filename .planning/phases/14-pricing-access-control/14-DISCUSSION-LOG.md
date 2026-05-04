# Phase 14: Pricing + Access Control - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-04
**Phase:** 14-pricing-access-control
**Areas discussed:** Package model, Admin assignment UI, Enrollment trigger, Student profile page, Video RLS

---

## Package Model

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed hardcode | Mỗi gói có danh sách grade cố định trong code | |
| Admin-configurable | Admin chọn grades khi tạo/sửa package qua UI | ✓ |

**User's choice:** Admin-configurable — admin tự chọn grades per package

---

| Option | Description | Selected |
|--------|-------------|----------|
| Nhiều gói | Học sinh có thể sở hữu nhiều packages, quyền = union | ✓ |
| Chỉ một gói | Một gói active tại một thời điểm | |

**User's choice:** Nhiều gói — quyền truy cập là union của tất cả packages đang có

---

| Option | Description | Selected |
|--------|-------------|----------|
| Display only | Giá lưu trong DB để hiển thị, không dùng tính toán | ✓ |
| Chỉ lưu tên gói | Giá hardcode trên landing page | |

**User's choice:** Display only — price_vnd lưu trong DB

---

## Admin Assignment UI

| Option | Description | Selected |
|--------|-------------|----------|
| Thay thế dialog | UserEnrollmentDialog → UserPackageDialog | ✓ |
| Bổ sung tab mới | Thêm tab "Gói học" trong dialog hiện tại | |
| Trang riêng /quan-tri/goi-hoc | Tách hoàn toàn | |

**User's choice:** Thay thế dialog — UserEnrollmentDialog replaced bởi UserPackageDialog

---

| Option | Description | Selected |
|--------|-------------|----------|
| Trang /quan-tri/goi-hoc | Trang admin riêng để CRUD packages | ✓ |
| Inline trong UsersPage | Dropdown/button để tạo package mới | |

**User's choice:** Trang /quan-tri/goi-hoc — dedicated admin page

---

## Enrollment Trigger

| Option | Description | Selected |
|--------|-------------|----------|
| DB trigger | INSERT user_packages → Postgres trigger auto-creates enrollments | ✓ |
| RPC (server function) | Client gọi RPC assign_package() | |

**User's choice:** DB trigger

---

| Option | Description | Selected |
|--------|-------------|----------|
| Giữ nguyên, không migrate | Enrollments cũ vẫn hiệu lực | |
| Backfill: grade-matched package | Nhìn vào grade của courses đã enrolled → tạo user_packages tương ứng | ✓ |

**User's choice:** Grade-matched backfill

---

| Option | Description | Selected |
|--------|-------------|----------|
| Cascade xóa enrollment | Xóa user_packages → trigger xóa enrollments tương ứng | ✓ |
| Giữ enrollment | Xóa package không ảnh hưởng enrollment | |

**User's choice:** Cascade xóa

---

**Key clarification:** Học sinh có package grade_7 tự động xem được khóa học grade_7 mới thêm sau.
**Decision:** RLS kiểm tra `user_packages` trực tiếp (không qua enrollments). Enrollment records tạo by trigger cho UI listing, không phải access control source of truth.

---

## Student Profile Page

| Option | Description | Selected |
|--------|-------------|----------|
| Trang /ho-so mới | Route mới hiển thị thông tin học sinh + gói đang có | ✓ |
| Card trong /khoa-hoc | Card "Gói của tôi" ở đầu trang khóa học | |
| Dropdown trong header | Click avatar → dropdown hiện gói | |

**User's choice:** Trang /ho-so mới

---

**Content selected:** Tên + email, Danh sách gói đang có, Grade coverage (badges)
**Entry point:** Header nav trong StudentLayout

---

## Video RLS

| Option | Description | Selected |
|--------|-------------|----------|
| RLS che video_url (NULL) | Học sinh không có quyền nhận NULL, vẫn thấy title | (giữ hướng hiện tại) |
| RLS chặn toàn bộ row | Không có quyền → không thấy lesson luôn | |

**User's choice:** Giữ hướng hiện tại — column-level masking (NULL cho video_url)

---

**YouTube domain restriction discussion:**
- User hỏi: "Có cách nào embed được trên BuMath nhưng direct link YouTube không xem được không?"
- Kết luận: Không thể với YouTube thông thường. Unlisted = anyone with link can watch. Private = embed cũng bị chặn. Domain restriction chỉ có với Cloudflare Stream / Bunny.net.
- Decision: v3 dùng unlisted + RLS. Phase 19 VideoPlayer abstraction để chuẩn bị swap sang provider có domain restriction.

**User's choice:** Chấp nhận approach — unlisted + RLS cho Phase 14, domain restriction defer sang Phase 19.

---

## Claude's Discretion

- Chi tiết implementation của `has_grade_access()` function
- Số lượng và naming convention cho migration files
- Error message khi học sinh không có package
- Loading/skeleton states cho profile page

## Deferred Ideas

- Domain restriction cho YouTube (chỉ embed từ bumath.vn) → Phase 19
- Package expiry/subscription period → v4
- Payment gateway tự động → Out of Scope
