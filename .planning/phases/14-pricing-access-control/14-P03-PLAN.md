---
plan: P03
phase: 14
wave: 3
depends_on: [P02]
autonomous: true
files_modified:
  - src/pages/admin/PackagesPage.tsx
  - src/components/admin/PackageFormDialog.tsx
  - src/components/admin/AdminLayout.tsx
  - src/App.tsx
requirements:
  - PRICE-01

must_haves:
  truths:
    - "Route /quan-tri/goi-hoc renders PackagesPage within AdminLayout"
    - "Admin sidebar shows 'Gói học' nav link that navigates to /quan-tri/goi-hoc"
    - "PackagesPage displays packages in a table with STT, Tên gói học, Giá (VND), Lớp phủ, Hành động columns"
    - "PackageFormDialog opens for create ('Tạo gói học mới') and edit ('Chỉnh sửa gói học')"
    - "PackageFormDialog grade checkboxes allow multi-select (at least 1 required)"
    - "Delete confirmation AlertDialog shows before deletion"
    - "Empty state shows 'Chưa có gói học nào' with inline CTA"
  artifacts:
    - path: src/pages/admin/PackagesPage.tsx
      provides: "Admin CRUD page for packages"
      contains: "Quản lý gói học"
    - path: src/components/admin/PackageFormDialog.tsx
      provides: "Create/edit dialog for packages with grade checkboxes"
      contains: "Lớp phủ"
    - path: src/components/admin/AdminLayout.tsx
      provides: "Sidebar with 'Gói học' nav item added"
      contains: "Gói học"
    - path: src/App.tsx
      provides: "Route /quan-tri/goi-hoc registered"
      contains: "quan-tri/goi-hoc"
  key_links:
    - from: "PackagesPage.tsx"
      to: "src/lib/api/packages.ts"
      via: "fetchPackagesPaginated, deletePackage imports"
    - from: "PackageFormDialog.tsx"
      to: "src/lib/api/packages.ts"
      via: "insertPackage, updatePackage imports"
---

# P03 — Admin Package Management UI

**Goal:** Build the `/quan-tri/goi-hoc` admin page for package CRUD (D-11). Pattern is identical to `/quan-tri/khoa-hoc` (CoursesPage.tsx + CourseFormDialog.tsx). Wire into AdminLayout sidebar and App.tsx routing.

---

<task id="T01" type="execute">
  <title>Create PackagesPage.tsx + PackageFormDialog.tsx</title>

  <read_first>
    - src/pages/admin/CoursesPage.tsx (full file — exact analog to replicate, see PATTERNS.md)
    - src/components/admin/CourseFormDialog.tsx (full file — exact analog for dialog pattern)
    - src/lib/api/packages.ts (imports: Package, PackageWithGrades, fetchPackagesPaginated, insertPackage, updatePackage, deletePackage)
    - .planning/phases/14-pricing-access-control/14-UI-SPEC.md § Surface 1 (column headers, empty states, copywriting)
  </read_first>

  <action>

**Create `src/components/admin/PackageFormDialog.tsx`**

Model after `CourseFormDialog.tsx`. Key differences from CourseFormDialog:
- Zod schema: `name` (required), `description` (optional), `price_vnd` (required number ≥ 0), `grades` (array, min 1 item)
- No `target_grade` Select → replaced with 4 Checkbox items in a 2×2 grid for multi-grade selection
- Import `Checkbox` from `@/components/ui/checkbox`
- Submit calls `insertPackage` (create) or `updatePackage` (edit) from `@/lib/api/packages`
- On open with existing package: populate grades from `package.package_grades.map(pg => pg.grade)`

Exact copywriting (from UI-SPEC):
- Create title: "Tạo gói học mới"
- Edit title: "Chỉnh sửa gói học"
- Save button (create): "Lưu gói học"
- Save button (edit): "Cập nhật gói học"
- Cancel button: "Hủy"
- Field label "Giá (VND)": Input type="number" min=0, placeholder="1500000"
- Field label "Lớp phủ" with instruction "(chọn ít nhất một lớp)"
- Checkbox labels: "Lớp 7" / "Lớp 8" / "Lớp 9" / "Ôn chuyên"
- Zod error for empty grades: "Vui lòng chọn ít nhất một lớp."

Zod schema:
```typescript
const packageSchema = z.object({
  name: z.string().min(1, 'Tên gói học không được để trống.'),
  description: z.string().optional(),
  price_vnd: z.coerce.number().min(0, 'Giá phải ≥ 0.'),
  grades: z.array(z.enum(['grade_7', 'grade_8', 'grade_9', 'advanced']))
    .min(1, 'Vui lòng chọn ít nhất một lớp.'),
})
```

Props interface:
```typescript
interface PackageFormDialogProps {
  open: boolean
  package: PackageWithGrades | null  // null = create mode
  onSuccess: () => void
  onClose: () => void
}
```

Grade checkboxes rendered in a 2×2 grid:
```tsx
<div className="grid grid-cols-2 gap-2">
  {GRADE_OPTIONS.map(({ value, label }) => (
    <div key={value} className="flex items-center space-x-2">
      <Checkbox
        id={`grade-${value}`}
        checked={field.value.includes(value)}
        onCheckedChange={(checked) => {
          const current = field.value
          field.onChange(
            checked ? [...current, value] : current.filter(g => g !== value)
          )
        }}
      />
      <label htmlFor={`grade-${value}`} className="text-sm font-normal cursor-pointer">
        {label}
      </label>
    </div>
  ))}
</div>
```

GRADE_OPTIONS constant:
```typescript
const GRADE_OPTIONS = [
  { value: 'grade_7' as GradeValue, label: 'Lớp 7' },
  { value: 'grade_8' as GradeValue, label: 'Lớp 8' },
  { value: 'grade_9' as GradeValue, label: 'Lớp 9' },
  { value: 'advanced' as GradeValue, label: 'Ôn chuyên' },
]
```

useEffect to reset form when dialog opens:
```typescript
useEffect(() => {
  if (open) {
    form.reset({
      name: pkg?.name ?? '',
      description: pkg?.description ?? '',
      price_vnd: pkg?.price_vnd ?? 0,
      grades: pkg?.package_grades.map(pg => pg.grade as GradeValue) ?? [],
    })
  }
}, [open, pkg, form])
```

---

**Create `src/pages/admin/PackagesPage.tsx`**

Model after `CoursesPage.tsx`. Key differences (from PATTERNS.md § What to replicate vs. change):
- Remove `navigate` (no drill-down to chapters)
- Remove `gradeFilter` state (packages are not filtered by grade)
- Remove `publishMutation` (no publish toggle for packages)
- Keep search (by name), pagination, loading/empty/table/AlertDialog patterns
- Table columns: STT | Tên gói học | Giá (VND) | Lớp phủ | Hành động
- Import from `@/lib/api/packages` instead of `@/lib/api/courses`
- Import `PackageFormDialog` instead of `CourseFormDialog`

Exact copywriting (UI-SPEC):
- Page h1: "Quản lý gói học" (`text-xl font-semibold leading-[1.3]`)
- CTA button: "Tạo gói học" (`min-h-[48px]`, Plus icon)
- Search placeholder: "Tìm theo tên gói học…"
- Count label: `{n} gói học` (text-sm text-muted-foreground)
- Empty (no packages, no search): heading "Chưa có gói học nào", body "Nhấn 'Tạo gói học' để bắt đầu.", inline "Tạo gói học" CTA button
- Empty (after search): heading "Không tìm thấy kết quả", body "Thử thay đổi từ khóa."
- Delete AlertDialog title: "Xóa gói học"
- Delete AlertDialog description: `Bạn có chắc muốn xóa gói học "${deletingPackage?.name}"? Học sinh sở hữu gói này sẽ mất quyền truy cập.`
- Delete AlertDialog actions: "Hủy" + "Xóa gói học" (destructive)
- Edit button aria-label: `Chỉnh sửa gói ${pkg.name}`
- Delete button aria-label: `Xóa gói ${pkg.name}`

Price formatting in table cell (Vietnamese VND):
```typescript
const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
```

Grade coverage badges in "Lớp phủ" column — render each grade in `pkg.package_grades`:
```tsx
<TableCell>
  <div className="flex flex-wrap gap-1">
    {pkg.package_grades.map(pg => (
      <Badge key={pg.grade} variant="secondary" className={GRADE_BADGE[pg.grade as GradeValue]?.className}>
        {GRADE_BADGE[pg.grade as GradeValue]?.label}
      </Badge>
    ))}
  </div>
</TableCell>
```

GRADE_BADGE constant (same as UserEnrollmentDialog):
```typescript
const GRADE_BADGE: Record<GradeValue, { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}
```

React Query keys:
- List query: `['admin', 'packages', { page: currentPage, pageSize: PAGE_SIZE, search: searchQuery }]`
- Invalidate on mutation: `queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] })`

PAGE_SIZE = 20. Use the exact same pagination component pattern as CoursesPage.
  </action>

  <acceptance_criteria>
    - [ ] File `src/pages/admin/PackagesPage.tsx` exists
    - [ ] File `src/components/admin/PackageFormDialog.tsx` exists
    - [ ] `grep -c "Quản lý gói học" src/pages/admin/PackagesPage.tsx` returns at least 1
    - [ ] `grep -c "Tạo gói học" src/pages/admin/PackagesPage.tsx` returns at least 2 (h1 area + empty state)
    - [ ] `grep -c "Chưa có gói học nào" src/pages/admin/PackagesPage.tsx` returns 1
    - [ ] `grep -c "Xóa gói học" src/pages/admin/PackagesPage.tsx` returns at least 1
    - [ ] `grep -c "Tạo gói học mới" src/components/admin/PackageFormDialog.tsx` returns 1
    - [ ] `grep -c "Chỉnh sửa gói học" src/components/admin/PackageFormDialog.tsx` returns 1
    - [ ] `grep -c "Lớp phủ" src/components/admin/PackageFormDialog.tsx` returns 1
    - [ ] `grep -c "Checkbox" src/components/admin/PackageFormDialog.tsx` returns at least 2 (import + usage)
    - [ ] `grep -c "grades.*min(1" src/components/admin/PackageFormDialog.tsx` returns 1
    - [ ] `grep -c "fetchPackagesPaginated" src/pages/admin/PackagesPage.tsx` returns 1
    - [ ] `grep -c "insertPackage\|updatePackage" src/components/admin/PackageFormDialog.tsx` returns 2
    - [ ] `grep -c "formatVND\|NumberFormat" src/pages/admin/PackagesPage.tsx` returns at least 1
    - [ ] `yarn tsc --noEmit` passes without new errors
  </acceptance_criteria>
</task>

---

<task id="T02" type="execute">
  <title>Wire AdminLayout.tsx sidebar + App.tsx route</title>

  <read_first>
    - src/components/admin/AdminLayout.tsx (full file — navItems array pattern, icon import pattern)
    - src/App.tsx lines 1–50 (existing route pattern for /quan-tri/* routes)
    - src/pages/admin/PackagesPage.tsx (just created — needed for import in App.tsx)
  </read_first>

  <action>

**1. Update `src/components/admin/AdminLayout.tsx`**

Add "Gói học" nav item to the `navItems` array. Import `Package` icon from `lucide-react`.

Current imports line: `import { Users, BookOpen, ClipboardList } from 'lucide-react'`
Change to: `import { Users, BookOpen, ClipboardList, Package } from 'lucide-react'`

Current `navItems` array:
```typescript
const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', icon: Users, adminOnly: true },
  { label: 'Quản lý khóa học', to: '/quan-tri/khoa-hoc', icon: BookOpen, adminOnly: true },
  { label: 'Chấm bài', to: '/quan-tri/bai-nop', icon: ClipboardList },
]
```

New `navItems` array — insert "Gói học" as the 3rd item (after "Quản lý khóa học", before "Chấm bài"), `adminOnly: true`:
```typescript
const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', icon: Users, adminOnly: true },
  { label: 'Quản lý khóa học', to: '/quan-tri/khoa-hoc', icon: BookOpen, adminOnly: true },
  { label: 'Gói học', to: '/quan-tri/goi-hoc', icon: Package, adminOnly: true },
  { label: 'Chấm bài', to: '/quan-tri/bai-nop', icon: ClipboardList },
]
```

**2. Update `src/App.tsx`**

Add the import for `PackagesPage` alongside existing admin page imports. Then add the route after the `/quan-tri/khoa-hoc` route group.

Add import (place with other admin page imports):
```typescript
import PackagesPage from './pages/admin/PackagesPage'
```

Add route (after the existing `/quan-tri/khoa-hoc/:courseSlug/...` route, before `/quan-tri/bai-nop`):
```tsx
<Route path="/quan-tri/goi-hoc" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><PackagesPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
```
  </action>

  <acceptance_criteria>
    - [ ] `grep -c "Gói học" src/components/admin/AdminLayout.tsx` returns 1
    - [ ] `grep -c "quan-tri/goi-hoc" src/components/admin/AdminLayout.tsx` returns 1
    - [ ] `grep -c "Package" src/components/admin/AdminLayout.tsx` returns at least 2 (import + navItems usage)
    - [ ] `grep -c "quan-tri/goi-hoc" src/App.tsx` returns 1
    - [ ] `grep -c "PackagesPage" src/App.tsx` returns 2 (import + route element)
    - [ ] `yarn tsc --noEmit` passes without new errors
  </acceptance_criteria>
</task>

---

## Must Haves

- [ ] `/quan-tri/goi-hoc` renders PackagesPage in AdminLayout (route exists)
- [ ] Admin sidebar shows "Gói học" link (adminOnly: true)
- [ ] PackagesPage h1 = "Quản lý gói học"
- [ ] PackagesPage empty state = "Chưa có gói học nào" / "Nhấn 'Tạo gói học' để bắt đầu."
- [ ] PackageFormDialog creates packages with multi-grade checkbox selection
- [ ] Delete confirmation shows "Xóa gói học" AlertDialog
- [ ] TypeScript compiles without errors

## PLAN COMPLETE
