# Phase 14: Pricing + Access Control — Pattern Map

**Mapped:** 2026-05-04
**Files analyzed:** 15 (9 new, 6 modified)
**Analogs found:** 14 / 15 (1 new file has no codebase analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/pages/admin/PackagesPage.tsx` | page (admin CRUD) | CRUD + request-response | `src/pages/admin/CoursesPage.tsx` | exact |
| `src/components/admin/PackageFormDialog.tsx` | component (form dialog) | request-response | `src/components/admin/CourseFormDialog.tsx` | exact |
| `src/components/admin/UserPackageDialog.tsx` | component (assign dialog) | CRUD | `src/components/admin/UserEnrollmentDialog.tsx` | exact |
| `src/pages/student/ProfilePage.tsx` | page (read-only display) | request-response | `src/pages/student/CoursesPage.tsx` | role-match |
| `src/lib/api/packages.ts` | API layer | CRUD | `src/lib/api/courses.ts` | exact |
| `src/lib/api/user-packages.ts` | API layer | CRUD | `src/lib/api/enrollments.ts` | exact |
| `supabase/migrations/20260504_18_packages_schema.sql` | migration (schema) | batch | `supabase/migrations/20260324_03_course_management_schema.sql` | exact |
| `supabase/migrations/20260504_19_backfill_user_packages.sql` | migration (data backfill) | batch | _(none — novel pattern)_ | none |
| `supabase/migrations/20260504_20_packages_rls_trigger.sql` | migration (RLS + trigger) | batch | `supabase/migrations/20260429_16_profiles_rls.sql` | role-match |
| `src/App.tsx` _(modified)_ | config (routing) | request-response | itself | self |
| `src/components/admin/AdminLayout.tsx` _(modified)_ | component (nav) | event-driven | itself | self |
| `src/components/student/StudentLayout.tsx` _(modified)_ | component (nav) | event-driven | itself | self |
| `src/components/student/LessonContent.tsx` _(modified)_ | component (content) | request-response | itself | self |
| `src/pages/admin/UsersPage.tsx` _(modified)_ | page (admin table) | CRUD | itself | self |
| `vercel.json` _(modified)_ | config (CDN headers) | — | itself | self |

---

## Pattern Assignments

### `src/pages/admin/PackagesPage.tsx` (page, CRUD)

**Analog:** `src/pages/admin/CoursesPage.tsx`

**Imports pattern** (CoursesPage.tsx lines 1–46):
```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Pencil, Trash2, BookOpen, Globe, EyeOff, Search } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { fetchCoursesPaginated, deleteCourse, Course } from '@/lib/api/courses'
import CourseFormDialog from '@/components/admin/CourseFormDialog'
import { GRADE_BADGE } from '@/lib/constants/grades'
```

**State + Query pattern** (CoursesPage.tsx lines 62–93):
```typescript
export default function CoursesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [gradeFilter, setGradeFilter] = useState<'all' | Course['target_grade']>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'courses', { page: currentPage, pageSize: PAGE_SIZE, grade: gradeFilter, search: searchQuery }],
    queryFn: () => fetchCoursesPaginated({ page: currentPage, pageSize: PAGE_SIZE, grade: gradeFilter, search: searchQuery }),
  })

  const courses = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      toast.success('Đã xóa khóa học.')
      setDeletingCourse(null)
    },
    onError: () => {
      toast.error('Xóa không thành công. Vui lòng thử lại.')
    },
  })
```

**Page layout + toolbar pattern** (CoursesPage.tsx lines 135–175):
```tsx
return (
  <div className="container mx-auto px-4 py-8">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold leading-[1.3]">Quản lý khóa học</h1>
      <Button className="min-h-[48px]" onClick={handleOpenCreate}>
        <Plus className="h-4 w-4 mr-1" />
        Tạo khóa học
      </Button>
    </div>

    {/* Toolbar */}
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          className="pl-9"
          placeholder="Tìm theo tên khóa học…"
          aria-label="Tìm kiếm khóa học"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <Select value={gradeFilter} onValueChange={handleGradeFilter}>
        <SelectTrigger className="w-full sm:w-[160px]" aria-label="Lọc theo lớp">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả lớp</SelectItem>
          <SelectItem value="grade_7">Lớp 7</SelectItem>
          <SelectItem value="grade_8">Lớp 8</SelectItem>
          <SelectItem value="grade_9">Lớp 9</SelectItem>
          <SelectItem value="advanced">Ôn chuyên</SelectItem>
        </SelectContent>
      </Select>
      {!isLoading && (
        <span className="text-sm text-muted-foreground self-center whitespace-nowrap">
          {countCopy}
        </span>
      )}
    </div>
```

**Loading / empty / table pattern** (CoursesPage.tsx lines 177–290):
```tsx
{isLoading ? (
  <div aria-busy="true" aria-label="Đang tải...">
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  </div>
) : courses.length === 0 ? (
  <div className="text-center py-16">
    {!searchQuery && gradeFilter === 'all' ? (
      <>
        <p className="text-sm font-semibold text-foreground mb-1">Chưa có khóa học nào</p>
        <p className="text-sm text-muted-foreground mb-4">Nhấn "Tạo khóa học" để bắt đầu.</p>
        <Button onClick={handleOpenCreate}><Plus className="h-4 w-4 mr-1" />Tạo khóa học</Button>
      </>
    ) : (
      <>
        <p className="text-sm font-semibold text-foreground mb-1">Không tìm thấy kết quả</p>
        <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc.</p>
      </>
    )}
  </div>
) : (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">STT</TableHead>
          <TableHead>Tên khóa học</TableHead>
          <TableHead>Mô tả</TableHead>
          <TableHead>Lớp mục tiêu</TableHead>
          <TableHead className="text-right">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course, index) => (
          <TableRow key={course.id}>
            <TableCell className="w-12 text-muted-foreground">{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
            <TableCell className="font-normal">{course.title}</TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
              {course.description ?? '—'}
            </TableCell>
            <TableCell><GradeBadge grade={course.target_grade} /></TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 flex-wrap justify-end">
                <Button variant="outline" size="sm" className="min-h-[48px]"
                  aria-label="Chỉnh sửa" onClick={() => handleOpenEdit(course)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm"
                  className="min-h-[48px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Xóa" onClick={() => setDeletingCourse(course)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)}
```

**Delete confirmation AlertDialog pattern** (CoursesPage.tsx lines 345–368):
```tsx
<AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Xóa khóa học</AlertDialogTitle>
      <AlertDialogDescription>
        Bạn có chắc muốn xóa khóa học "{deletingCourse?.title}"? Hành động này không thể hoàn tác.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Hủy</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={() => deletingCourse && deleteMutation.mutate(deletingCourse.id)}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
        Xóa
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**What to replicate vs. change for PackagesPage:**
- ✅ Replicate: all state/query structure, toolbar, loading/empty/table/pagination, AlertDialog confirm, dialog open/close handlers, `queryClient.invalidateQueries` key pattern
- 🔄 Change: remove `navigate` (no drill-down), remove `publishMutation` (packages have no publish toggle), swap `gradeFilter` → search-only (or keep grade filter for package grade coverage), swap `CourseFormDialog` → `PackageFormDialog`, swap API imports (`fetchPackagesPaginated`, `deletePackage`), column headers: `Tên gói`, `Mô tả`, `Giá (VND)`, `Lớp phủ`, `Hành động`

---

### `src/components/admin/PackageFormDialog.tsx` (component, request-response)

**Analog:** `src/components/admin/CourseFormDialog.tsx`

**Full file pattern** (CourseFormDialog.tsx lines 1–204):
```typescript
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Course, insertCourse, updateCourse } from '@/lib/api/courses'

const courseSchema = z.object({
  title: z.string().min(1, 'Tên khóa học không được để trống.'),
  description: z.string().optional(),
  target_grade: z.enum(['grade_7', 'grade_8', 'grade_9', 'advanced'], {
    required_error: 'Vui lòng chọn lớp mục tiêu.',
  }),
})

type CourseFormValues = z.infer<typeof courseSchema>

const GRADE_OPTIONS: { value: Course['target_grade']; label: string }[] = [
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn chuyên' },
]

interface CourseFormDialogProps {
  open: boolean
  course: Course | null
  onSuccess: () => void
  onClose: () => void
}

export default function CourseFormDialog({ open, course, onSuccess, onClose }: CourseFormDialogProps) {
  const isEditing = !!course

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: { title: '', description: '', target_grade: 'grade_7' },
  })

  // Reset form when dialog opens or editing target changes
  useEffect(() => {
    if (open) {
      if (course) {
        form.reset({ title: course.title, description: course.description ?? '', target_grade: course.target_grade })
      } else {
        form.reset({ title: '', description: '', target_grade: 'grade_7' })
      }
    }
  }, [open, course, form])

  const mutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      if (isEditing) return updateCourse(course.id, values)
      return insertCourse(values)
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Đã cập nhật khóa học.' : 'Đã tạo khóa học thành công.')
      onSuccess()
    },
    onError: () => {
      toast.error('Lưu không thành công. Vui lòng kiểm tra lại thông tin.')
    },
  })

  function onSubmit(values: CourseFormValues) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* FormField pattern — replicate for each field */}
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên khóa học</FormLabel>
                <FormControl><Input placeholder="..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl><Textarea rows={3} placeholder="..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Select field — single grade */}
            <FormField control={form.control} name="target_grade" render={({ field }) => (
              <FormItem>
                <FormLabel>Lớp mục tiêu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-[48px]"><SelectValue placeholder="Chọn lớp..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GRADE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Đóng</Button>
              <Button type="submit" disabled={mutation.isPending} className="min-h-[48px]">
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {isEditing ? 'Lưu khóa học' : 'Tạo khóa học'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

**What to replicate vs. change for PackageFormDialog:**
- ✅ Replicate: entire Dialog + Form + FormField + useMutation + useEffect reset structure
- 🔄 Change:
  - Schema fields: `name` (string, required), `description` (string, optional), `price_vnd` (number ≥ 0), `grades` (array of grade enums, min 1)
  - `grades` field uses multi-select (checkboxes via `@radix-ui/react-checkbox` or shadcn Checkbox) — not a single Select
  - Import `insertPackage`, `updatePackage` from `@/lib/api/packages`
  - Field labels: "Tên gói học", "Mô tả", "Giá (VND)", "Lớp phủ"
  - `price_vnd` is a number Input; use `z.coerce.number().int().min(0)`
  - `grades` is `z.array(z.enum([...])).min(1, 'Chọn ít nhất 1 lớp.')`

---

### `src/components/admin/UserPackageDialog.tsx` (component, CRUD)

**Analog:** `src/components/admin/UserEnrollmentDialog.tsx`

**Full file pattern** (UserEnrollmentDialog.tsx lines 1–218):
```typescript
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { fetchCourses, Course } from '@/lib/api/courses'
import {
  getUserEnrollments, addEnrollment, removeEnrollment, EnrollmentWithCourse,
} from '@/lib/api/enrollments'
import { Profile } from '@/types/auth'

const GRADE_BADGE: Record<Course['target_grade'], { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}

interface UserEnrollmentDialogProps {
  open: boolean
  user: Profile | null
  onClose: () => void
}

export default function UserEnrollmentDialog({ open, user, onClose }: UserEnrollmentDialogProps) {
  const queryClient = useQueryClient()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')

  // Fetch all courses available in the system
  const { data: allCourses = [] } = useQuery<Course[]>({
    queryKey: ['admin', 'courses'],
    queryFn: fetchCourses,
    enabled: open && !!user,
  })

  // Fetch enrollments for this specific user
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ['admin', 'enrollments', user?.id],
    queryFn: () => getUserEnrollments(user!.id),
    enabled: open && !!user,
  })

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id))
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(c.id))

  const addMutation = useMutation({
    mutationFn: () => addEnrollment(user!.id, selectedCourseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'enrollments', user?.id] })
      setSelectedCourseId('')
      toast.success('Đã thêm khóa học cho học sinh.')
    },
    onError: () => {
      toast.error('Thêm không thành công. Học sinh có thể đã đăng ký khóa học này.')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (enrollmentId: string) => removeEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'enrollments', user?.id] })
      toast.success('Đã xóa khóa học khỏi danh sách của học sinh.')
    },
    onError: () => {
      toast.error('Xóa không thành công. Vui lòng thử lại.')
    },
  })

  function handleAdd() {
    if (!selectedCourseId) return
    addMutation.mutate()
  }

  function handleClose() {
    setSelectedCourseId('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quản lý khóa học — {user?.full_name}</DialogTitle>
        </DialogHeader>

        {/* Current list */}
        <div>
          <h3 className="text-sm font-medium mb-2">Khóa học đã đăng ký</h3>
          {enrollmentsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Đang tải..." />
            </div>
          ) : enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Học sinh chưa đăng ký khóa học nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khóa học</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">{enrollment.course.title}</TableCell>
                      <TableCell><GradeBadge grade={enrollment.course.target_grade} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label="Xóa khóa học"
                          onClick={() => removeMutation.mutate(enrollment.id)}
                          disabled={removeMutation.isPending && removeMutation.variables === enrollment.id}
                        >
                          {removeMutation.isPending && removeMutation.variables === enrollment.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Add new */}
        {availableCourses.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Thêm khóa học</h3>
            <div className="flex gap-2">
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="flex-1 min-h-[48px]">
                  <SelectValue placeholder="Chọn khóa học..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <span className="flex items-center gap-2">
                        {course.title} <GradeBadge grade={course.target_grade} />
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="min-h-[48px]" onClick={handleAdd}
                disabled={!selectedCourseId || addMutation.isPending}>
                {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Thêm
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

**What to replicate vs. change for UserPackageDialog:**
- ✅ Replicate: Dialog structure, two-query pattern (all packages + user's packages), add/remove mutations, `enabled: open && !!user`, `queryClient.invalidateQueries`, Select-with-add, Table-with-remove, loading/empty states
- 🔄 Change:
  - Title: "Quản lý gói học — {user?.full_name}"
  - Import `fetchPackages` (all), `getUserPackages`, `assignPackage`, `revokePackage` from `@/lib/api/packages` and `@/lib/api/user-packages`
  - Query key: `['admin', 'user-packages', user?.id]`
  - Table columns: "Tên gói", "Lớp phủ" (grade badges from `package.grades[]`), "Xóa"
  - Available packages = all packages not yet in user's set (filter by `package_id`)
  - Grade coverage display: map over `userPackage.package.grades` and render a `GradeBadge` per grade

---

### `src/pages/student/ProfilePage.tsx` (page, request-response)

**Analog:** `src/pages/student/CoursesPage.tsx`

**Imports + auth + query pattern** (student/CoursesPage.tsx lines 1–30):
```typescript
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getUserEnrollments } from '@/lib/api/enrollments'
import StudentLayout from '@/components/student/StudentLayout'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesPage() {
  const { profile } = useAuth()

  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
  } = useQuery({
    queryKey: ['enrollments', profile?.id],
    queryFn: () => getUserEnrollments(profile!.id),
    enabled: !!profile?.id,  // ← guard: prevent flash before profile loads
  })
```

**Layout wrapper pattern** (student/CoursesPage.tsx lines 68–72):
```tsx
return (
  <StudentLayout>
    <div className="p-8 md:p-10">
      <h1 className="text-2xl font-bold mb-4 text-[#92400E]">Khóa học của tôi</h1>
```

**Loading skeleton pattern** (student/CoursesPage.tsx lines 81–87):
```tsx
{isLoading && (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-[200px] rounded-2xl" />
    ))}
  </div>
)}
```

**Empty state pattern** (student/CoursesPage.tsx lines 89–103):
```tsx
{!isLoading && !enrollmentsError && enrollments?.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <BookOpen className="h-16 w-16 text-[#F97316]" aria-hidden="true" />
    <h2 className="text-xl font-bold text-[#92400E]">Bạn chưa có khóa học nào</h2>
    <p className="text-base text-muted-foreground max-w-sm">
      Liên hệ giảng viên để được thêm vào khóa học, hoặc khám phá danh mục.
    </p>
  </div>
)}
```

**Grade badge pattern** (student/CoursesPage.tsx lines 113–115):
```typescript
import { GRADE_BADGE } from '@/lib/constants/grades'
// Usage:
const gradeBadge = GRADE_BADGE[course.target_grade]
// → { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' }
```

**What to replicate vs. change for ProfilePage:**
- ✅ Replicate: `StudentLayout` wrapper, `useAuth()` for `profile`, `useQuery` with `enabled: !!profile?.id`, Skeleton loading, empty state, `GRADE_BADGE` for grade rendering
- 🔄 Change:
  - Query function: `getUserPackages(profile.id)` from `@/lib/api/user-packages`
  - Page title: "Hồ sơ của tôi"
  - Display: Card with avatar (from `src/components/ui/avatar.tsx`), name, email, then a list of active packages
  - Each package row: package name + list of grade badges (`package.grades.map(g => <GradeBadge grade={g} />)`)
  - Empty state: "Bạn chưa có gói học nào. Liên hệ giảng viên để đăng ký."
  - No progress bar, no course link — pure profile display

---

### `src/lib/api/packages.ts` (API layer, CRUD)

**Analog:** `src/lib/api/courses.ts`

**Interface + basic CRUD pattern** (courses.ts lines 1–83):
```typescript
import { supabase } from '@/lib/supabase'

export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  target_grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
  is_published: boolean
  created_at: string
  updated_at: string
}

export type CourseInsert = Pick<Course, 'title' | 'description' | 'target_grade'>
export type CourseUpdate = Partial<CourseInsert>

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Course[]
}

export async function insertCourse(payload: CourseInsert): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Course
}

export async function updateCourse(id: string, payload: CourseUpdate): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Course
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}
```

**Paginated fetch pattern** (courses.ts lines 110–154):
```typescript
export interface CoursesFilter {
  page: number
  pageSize: number
  grade: 'all' | Course['target_grade']
  search: string
}

export interface PaginatedCourses {
  data: Course[]
  total: number
}

export async function fetchCoursesPaginated(params: CoursesFilter): Promise<PaginatedCourses> {
  const { page, pageSize, grade, search } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('courses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (grade !== 'all') {
    query = query.eq('target_grade', grade)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return {
    data: (data ?? []) as Course[],
    total: count ?? 0,
  }
}
```

**What to replicate vs. change for packages.ts:**
- ✅ Replicate: all Supabase call patterns (`.from().select().insert().update().delete()`), error-throw convention, `PaginatedX` interface, `fetchXPaginated` with `.range()` + `count: 'exact'`
- 🔄 Change:
  - Interface `Package`: `{ id, name, description, price_vnd, created_at, grades: GradeValue[] }` — `grades` is fetched via `package_grades` join: `select('*, package_grades(grade)')`
  - No slug, no `is_published`, no `updated_at`
  - `insertPackage`: must insert into `packages` then into `package_grades` for each grade (two Supabase calls or a DB function). Prefer two sequential inserts with the returned ID.
  - `updatePackage`: update `packages` row + delete old `package_grades` + re-insert new ones
  - `fetchPackages()` (no pagination): `select('*, package_grades(grade)')` — used by UserPackageDialog dropdown

---

### `src/lib/api/user-packages.ts` (API layer, CRUD)

**Analog:** `src/lib/api/enrollments.ts`

**Full file pattern** (enrollments.ts lines 1–42):
```typescript
import { supabase } from '@/lib/supabase'
import { Course } from '@/lib/api/courses'

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
}

export interface EnrollmentWithCourse extends Enrollment {
  course: Pick<Course, 'id' | 'title' | 'slug' | 'target_grade'>
}

export async function getUserEnrollments(userId: string): Promise<EnrollmentWithCourse[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, enrolled_at, course:courses(id, title, slug, target_grade, description)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as EnrollmentWithCourse[]
}

export async function addEnrollment(userId: string, courseId: string): Promise<Enrollment> {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })
    .select()
    .single()
  if (error) throw error
  return data as Enrollment
}

export async function removeEnrollment(enrollmentId: string): Promise<void> {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId)
  if (error) throw error
}
```

**What to replicate vs. change for user-packages.ts:**
- ✅ Replicate: `import { supabase }`, interface extension pattern (`UserPackageWithPackage extends UserPackage`), `.eq('user_id', userId)`, `.order()`, `.select().single()`, `(data ?? []) as unknown as T[]`
- 🔄 Change:
  - Table: `user_packages`
  - Interface `UserPackage`: `{ id, user_id, package_id, assigned_at, assigned_by }`
  - Interface `UserPackageWithPackage`: extends `UserPackage` with `package: { id, name, description, price_vnd, grades: { grade: GradeValue }[] }`
  - `getUserPackages(userId)` → `select('*, package:packages(id, name, description, price_vnd, package_grades(grade))')`
  - `assignPackage(userId, packageId)` → insert `{ user_id, package_id, assigned_by: (await supabase.auth.getUser()).data.user?.id }`
  - `revokePackage(userPackageId)` → delete by `id`

---

### `supabase/migrations/20260504_18_packages_schema.sql` (migration, schema)

**Analog:** `supabase/migrations/20260324_03_course_management_schema.sql`

**Table + index + RLS pattern** (03_course_management_schema.sql lines 1–77):
```sql
-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  target_grade text NOT NULL DEFAULT 'grade_7' CHECK (target_grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced')),
  thumbnail_url text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Enrollments table (links students to courses)
CREATE TABLE IF NOT EXISTS enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON enrollments(course_id);
```

**What to replicate vs. change for 18_packages_schema.sql:**
- ✅ Replicate: `CREATE TABLE IF NOT EXISTS`, `uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `timestamptz NOT NULL DEFAULT now()`, `REFERENCES auth.users(id) ON DELETE CASCADE`, `UNIQUE(...)`, `CREATE INDEX IF NOT EXISTS`, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- 🔄 Change:
  - Three tables: `packages(id,name,description,price_vnd,created_at)`, `package_grades(package_id,grade,PRIMARY KEY(package_id,grade))`, `user_packages(id,user_id,package_id,assigned_at,assigned_by,UNIQUE(user_id,package_id))`
  - `package_grades.grade` CHECK: `IN ('grade_7', 'grade_8', 'grade_9', 'advanced')`
  - Indexes: `packages_name_idx`, `package_grades_grade_idx`, `user_packages_user_id_idx`, `user_packages_package_id_idx`
  - RLS policies after schema (use `get_my_role()` pattern from migration 16): `admin_all_packages`, `authenticated_read_packages`, same for `package_grades` and `user_packages`
  - **Do NOT include** `has_grade_access`, triggers, or view — those go in file 20

---

### `supabase/migrations/20260504_20_packages_rls_trigger.sql` (migration, RLS + trigger)

**Analog:** `supabase/migrations/20260429_16_profiles_rls.sql`

**SECURITY DEFINER helper function pattern** (16_profiles_rls.sql lines 17–21):
```sql
-- CREATE OR REPLACE is idempotent — safe to re-run
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;
```

**DROP + RECREATE policy pattern** (16_profiles_rls.sql lines 26–36):
```sql
DROP POLICY IF EXISTS "Students can view own profile" ON public.profiles;

CREATE POLICY "Students can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR get_my_role() IN ('admin', 'teacher')
  );
```

**What to replicate vs. change for 20_packages_rls_trigger.sql:**
- ✅ Replicate: `CREATE OR REPLACE FUNCTION ... SECURITY DEFINER STABLE`, `DROP POLICY IF EXISTS` before `CREATE POLICY`, section comments (`-- ===`)
- 🔄 Change (4 sections in order):
  1. **`has_grade_access(target_grade text)` function** — `LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public`, queries `user_packages JOIN package_grades WHERE up.user_id = auth.uid() AND pg.grade = target_grade`, returns `boolean`
  2. **INSERT trigger** — `CREATE OR REPLACE FUNCTION create_enrollments_for_package() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public`, inserts `enrollments` for all courses matching package grade, `ON CONFLICT (user_id, course_id) DO NOTHING`; then `CREATE TRIGGER trg_create_enrollments_on_package_assign AFTER INSERT ON user_packages FOR EACH ROW EXECUTE FUNCTION ...`
  3. **DELETE trigger** — `remove_enrollments_for_package()`, deletes enrollments that are no longer covered by any remaining package (NOT EXISTS subquery on remaining `user_packages`)
  4. **`lessons_view`** — `CREATE OR REPLACE VIEW public.lessons_view WITH (security_invoker = true, security_barrier = true) AS SELECT ... CASE WHEN get_my_role() IN ('admin','teacher') THEN l.video_url WHEN has_grade_access(c.target_grade) THEN l.video_url ELSE NULL END AS video_url FROM lessons l JOIN chapters ch ON ... JOIN courses c ON ...`; `GRANT SELECT ON lessons_view TO authenticated`

---

## Modifications to Existing Files

### `src/App.tsx` — Add 2 routes

**Current route pattern** (App.tsx lines 38–46) — copy this exact structure:
```tsx
<Route path="/quan-tri/nguoi-dung" element={
  <ProtectedRoute requiredRole="admin">
    <StudentLayout><AdminLayout><UsersPage /></AdminLayout></StudentLayout>
  </ProtectedRoute>
} />
<Route path="/khoa-hoc" element={<ProtectedRoute><StudentCoursesPage /></ProtectedRoute>} />
```

**Add these two routes** (before the `*` catch-all, after existing admin routes):
```tsx
// New: PackagesPage admin route
import PackagesPage from "./pages/admin/PackagesPage";
<Route path="/quan-tri/goi-hoc" element={
  <ProtectedRoute requiredRole="admin">
    <StudentLayout><AdminLayout><PackagesPage /></AdminLayout></StudentLayout>
  </ProtectedRoute>
} />

// New: Student ProfilePage route
import StudentProfilePage from "./pages/student/ProfilePage";
<Route path="/ho-so" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
```

---

### `src/components/admin/AdminLayout.tsx` — Add "Gói học" nav item

**Current navItems array** (AdminLayout.tsx lines 13–17):
```typescript
import { Users, BookOpen, ClipboardList } from 'lucide-react'

const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', icon: Users, adminOnly: true },
  { label: 'Quản lý khóa học', to: '/quan-tri/khoa-hoc', icon: BookOpen, adminOnly: true },
  { label: 'Chấm bài', to: '/quan-tri/bai-nop', icon: ClipboardList },
]
```

**Add after "Quản lý khóa học":**
```typescript
import { Package } from 'lucide-react'  // or use `BookMarked` if Package not available

{ label: 'Gói học', to: '/quan-tri/goi-hoc', icon: Package, adminOnly: true },
```

---

### `src/components/student/StudentLayout.tsx` — Add "Hồ sơ" NavLink

**Current nav pattern** (StudentLayout.tsx lines 67–100):
```tsx
<nav className="ml-6 hidden sm:flex items-center gap-1">
  <NavLink
    to="/khoa-hoc"
    className={({ isActive }) =>
      `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
        isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
      }`
    }
  >
    Khóa học của tôi
  </NavLink>
  <NavLink
    to="/danh-muc"
    className={({ isActive }) =>
      `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
        isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
      }`
    }
  >
    Khám phá khóa học
  </NavLink>
  {/* admin link... */}
</nav>
```

**Add "Hồ sơ" NavLink** using identical className pattern (copy-paste the pattern, just change `to` and label):
```tsx
<NavLink
  to="/ho-so"
  className={({ isActive }) =>
    `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
      isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
    }`
  }
>
  Hồ sơ
</NavLink>
```

---

### `src/components/student/LessonContent.tsx` — Add locked lesson state

**Current video render pattern** (LessonContent.tsx lines 38–48):
```tsx
{/* 1. YouTube embed */}
{lesson.video_url && (
  <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted">
    <iframe
      src={lesson.video_url}
      title={`Video bài học: ${lesson.title}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full border-0"
    />
  </AspectRatio>
)}
```

**Replace with locked-state conditional** — video_url is NULL when DB RLS masks it:
```tsx
{lesson.video_url ? (
  <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted">
    <iframe
      src={lesson.video_url}
      title={`Video bài học: ${lesson.title}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full border-0"
    />
  </AspectRatio>
) : (
  <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-center p-6">
      <Lock className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <p className="text-base font-semibold text-foreground">Bạn chưa có gói học phù hợp</p>
      <p className="text-sm text-muted-foreground">Liên hệ giảng viên để đăng ký gói học và mở khóa bài học này.</p>
    </div>
  </AspectRatio>
)}
```

Add `import { Lock } from 'lucide-react'` to existing imports (line 4).

---

### `src/pages/admin/UsersPage.tsx` — Swap dialog

**Current import + usage** (UsersPage.tsx lines 34, 57–65, 246–250):
```typescript
import UserEnrollmentDialog from '@/components/admin/UserEnrollmentDialog'
// ...
function UsersTable({ ..., onManageEnrollments }: { ..., onManageEnrollments: (user: Profile) => void }) { ...
  <Button onClick={() => onManageEnrollments(user)}>
    <BookOpen className="h-4 w-4 mr-1" />
    Quản lý khóa học
  </Button>
// ...
<UserEnrollmentDialog
  open={!!enrollmentUser}
  user={enrollmentUser}
  onClose={() => setEnrollmentUser(null)}
/>
```

**Change to** (3 surgical edits):
1. `import UserPackageDialog from '@/components/admin/UserPackageDialog'`
2. Button label: `Quản lý gói học` (keep same `BookOpen` icon or swap to `Package`)
3. `<UserPackageDialog open={!!enrollmentUser} user={enrollmentUser} onClose={() => setEnrollmentUser(null)} />`

Rename internal state + handler to reflect the new semantic (optional but clearer):
```typescript
const [packageUser, setPackageUser] = useState<Profile | null>(null)
// onManageEnrollments → onManagePackages
// setEnrollmentUser → setPackageUser
```

---

### `vercel.json` — Add X-Frame-Options header

**Current file** (vercel.json lines 1–5):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Replace with** (add `headers` section per Vercel docs pattern):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
      ]
    }
  ]
}
```

---

## Shared Patterns

### Auth / Role Check
**Source:** `src/components/auth/ProtectedRoute` (via `src/contexts/AuthContext`)
**Apply to:** `PackagesPage`, `ProfilePage` (in App.tsx route wrapper)
```tsx
// Admin pages:
<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout>...</AdminLayout></StudentLayout></ProtectedRoute>
// Student pages:
<ProtectedRoute><StudentProfilePage /></ProtectedRoute>
```

### `useAuth()` profile guard
**Source:** `src/pages/student/CoursesPage.tsx` line 22
**Apply to:** `ProfilePage.tsx`
```typescript
const { profile } = useAuth()
// ...
enabled: !!profile?.id,  // prevents query before auth resolves
```

### TanStack Query invalidation
**Source:** `src/pages/admin/CoursesPage.tsx` lines 86–88
**Apply to:** `PackagesPage`, `UserPackageDialog`
```typescript
queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] })
// or for user-scoped:
queryClient.invalidateQueries({ queryKey: ['admin', 'user-packages', user?.id] })
```

### Grade badge display
**Source:** `src/lib/constants/grades.ts` (imported via `GRADE_BADGE`)
**Apply to:** `PackagesPage`, `PackageFormDialog`, `UserPackageDialog`, `ProfilePage`
```typescript
import { GRADE_BADGE } from '@/lib/constants/grades'
// const { label, className } = GRADE_BADGE[grade]
// <Badge variant="secondary" className={className}>{label}</Badge>
```

### Toast notifications
**Source:** `src/components/admin/CourseFormDialog.tsx` lines 107–113
**Apply to:** All mutating operations in Phase 14
```typescript
import { toast } from 'sonner'
// onSuccess: toast.success('...')
// onError: toast.error('...')
```

### Supabase call convention
**Source:** `src/lib/api/courses.ts` lines 18–25
**Apply to:** `packages.ts`, `user-packages.ts`
```typescript
const { data, error } = await supabase.from('table').select('*')...
if (error) throw error
return data as T
```

### SECURITY DEFINER function skeleton
**Source:** `supabase/migrations/20260429_16_profiles_rls.sql` lines 17–21
**Apply to:** `20_packages_rls_trigger.sql` — `has_grade_access()`, trigger functions
```sql
CREATE OR REPLACE FUNCTION public.function_name(param type)
RETURNS return_type
LANGUAGE sql        -- or plpgsql for triggers
SECURITY DEFINER
STABLE              -- omit for VOLATILE trigger functions
SET search_path = public
AS $$
  -- body
$$;
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `supabase/migrations/20260504_19_backfill_user_packages.sql` | migration (data backfill) | batch | No prior backfill migration exists in this codebase. Pattern is pure SQL: INSERT INTO packages, INSERT INTO package_grades, INSERT INTO user_packages ... SELECT DISTINCT from enrollments JOIN courses JOIN package_grades; use `ON CONFLICT (user_id, package_id) DO NOTHING` |

---

## Metadata

**Analog search scope:** `src/pages/admin/`, `src/pages/student/`, `src/components/admin/`, `src/components/student/`, `src/lib/api/`, `supabase/migrations/`
**Files scanned:** 20+
**Pattern extraction date:** 2026-05-04
