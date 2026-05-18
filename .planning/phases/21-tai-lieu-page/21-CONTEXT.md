# Phase 21 — Tài liệu Page: Context & Decisions

**Phase:** 21  
**Slug:** tai-lieu-page  
**Goal:** Trang `/tai-lieu` công khai hiển thị tài liệu PDF theo grade; trang admin `/quan-tri/tai-lieu` cho giáo viên/admin upload.

---

## Decisions

### D-01: Access control `/tai-lieu`
**Decision:** Công khai — không cần đăng nhập.  
`/tai-lieu` không dùng `<ProtectedRoute>`. Bất kỳ ai cũng có thể browse và download.

### D-02: Filter — chỉ theo grade, bỏ category
**Decision:** Bỏ hoàn toàn filter category (giữa kỳ, cuối kỳ, vào 10, HSG, chuyên toán). Chỉ filter theo grade: Lớp 7 / Lớp 8 / Lớp 9 / Ôn thi chuyên.  
Grade "advanced" được map sang label "Ôn thi chuyên" theo `GRADE_BADGE` convention đã có.

### D-03: Tài liệu standalone vs lesson-linked
**Decision:** Tạo loại tài liệu "standalone" — không gắn với lesson nào.  
`lesson_id` cần được `ALTER TABLE` thành `nullable`. Standalone materials có `lesson_id = NULL`.  
Lesson-linked materials (Phase 16) giữ nguyên `lesson_id NOT NULL` logic ở UI, chỉ thay DB constraint.

### D-04: DB migration
**Decision:** Migration mới:
1. `ALTER TABLE study_materials ALTER COLUMN lesson_id DROP NOT NULL`
2. Thêm `grade` value `'advanced'` vào CHECK constraint (hiện chỉ có grade_7/8/9)
3. Bỏ CHECK constraint `category` hoặc make category nullable (vì không dùng trong UI mới)

### D-05: Vị trí admin upload
**Decision:** Trang admin mới `/quan-tri/tai-lieu` — `src/pages/admin/TaiLieuAdminPage.tsx`.  
Thêm vào `AdminLayout` nav. Chỉ `admin` và `teacher` (allowedRoles) mới truy cập được.

### D-06: API layer
**Decision:** Thêm function mới vào `src/lib/api/study-materials.ts`:
- `fetchStandaloneStudyMaterials(grade?: StudyMaterialGrade)` — filter `lesson_id IS NULL`, sort by `created_at DESC`  
Không tạo file mới — extend file hiện có.

### D-07: Trang UI `/tai-lieu` — layout tham chiếu toanmath.com
**Decision:** Grid card layout. Mỗi card hiển thị: title, grade badge, icon PDF, nút download.  
Filter grade dạng tab hoặc button group ở trên. Không cần pagination nếu < 100 items (scroll đơn giản).

### D-08: Download behavior
**Decision:** Click download → generate signed URL (TTL 1h) → `window.open(url, '_blank')`.  
Reuse `getStudyMaterialSignedUrl` từ Phase 16. Không cần track lượt download ở phase này.

### D-09: Admin upload form
**Decision:** Reuse/adapt `StudyMaterialUploadForm` — bỏ trường `lessonId` (hardcode NULL), bỏ `category`, chỉ cần `title` + `file` + `grade`. Có thể inline form trên trang admin (không cần dialog).

### D-10: Route `/quan-tri/tai-lieu` trong AdminLayout nav
**Decision:** Thêm link trong `AdminLayout.tsx` nav items — icon `FileText`, label "Tài liệu".

---

## Reusable Assets (Phase 16)

| Asset | File | Reuse |
|-------|------|-------|
| API CRUD + signed URLs | `src/lib/api/study-materials.ts` | Extend (add fetchStandalone) |
| Upload form | `src/components/student/StudyMaterialUploadForm.tsx` | Adapt (remove lessonId, category) |
| List component | `src/components/student/StudyMaterialsList.tsx` | Không reuse trực tiếp — tạo mới cho public page |
| DB schema | `study_materials` table | Migration để nullable lesson_id |

---

## Out of Scope (Phase 21)

- Search tài liệu theo tên
- Phân trang/infinite scroll
- Preview PDF inline
- Thống kê lượt download
- Tài liệu có trả phí / enrollment-gated
