# P03 Summary — Admin Package Management UI

**Status:** Complete
**Commit:** e14c7e9

## What Was Built

### src/components/admin/PackageFormDialog.tsx (new)
- Create/edit dialog modeled after CourseFormDialog
- Zod schema: name (required), description (optional), price_vnd (number ≥ 0), grades (array min 1)
- 4 grade Checkboxes in 2×2 grid with multi-select (grade_7/8/9/advanced)
- useEffect resets form on open with existing package data
- Create mode: "Tạo gói học mới" / "Lưu gói học"
- Edit mode: "Chỉnh sửa gói học" / "Cập nhật gói học"
- Cancel: "Hủy"

### src/pages/admin/PackagesPage.tsx (new)
- Admin CRUD list page at /quan-tri/goi-hoc
- Search by name, pagination (PAGE_SIZE=20), loading skeletons
- Table columns: STT | Tên gói học | Giá (VND) | Lớp phủ | Hành động
- Vietnamese VND formatting via Intl.NumberFormat
- Grade coverage badges per package row
- Delete AlertDialog with "Học sinh sở hữu gói này sẽ mất quyền truy cập" warning
- Empty states: "Chưa có gói học nào" / "Không tìm thấy kết quả"
- React Query keys: ['admin', 'packages', { page, pageSize, search }]

### src/components/admin/AdminLayout.tsx (modified)
- Added Package icon import from lucide-react
- Added 'Gói học' nav item (adminOnly: true) between 'Quản lý khóa học' and 'Chấm bài'

### src/App.tsx (modified)
- Added import for PackagesPage
- Added route /quan-tri/goi-hoc (ProtectedRoute requiredRole="admin")

## Verification

- ✅ Route /quan-tri/goi-hoc registered
- ✅ AdminLayout sidebar shows 'Gói học' (adminOnly: true)
- ✅ PackagesPage h1 = "Quản lý gói học"
- ✅ PackageFormDialog: "Tạo gói học mới" / "Chỉnh sửa gói học"
- ✅ PackageFormDialog: grade checkboxes with Zod min-1 validation
- ✅ Delete AlertDialog: "Xóa gói học"
- ✅ TypeScript: no errors

## Requirements Satisfied

- PRICE-01: Admin package CRUD UI (create, edit, delete, list)
