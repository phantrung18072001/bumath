import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { fetchCourses, deleteCourse, Course } from '@/lib/api/courses'
import CourseFormDialog from '@/components/admin/CourseFormDialog'

const GRADE_BADGE: Record<Course['target_grade'], { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}

function GradeBadge({ grade }: { grade: Course['target_grade'] }) {
  const { label, className } = GRADE_BADGE[grade] ?? GRADE_BADGE.grade_7
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}

export default function CoursesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['admin', 'courses'],
    queryFn: fetchCourses,
  })

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

  function handleOpenCreate() {
    setEditingCourse(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(course: Course) {
    setEditingCourse(course)
    setDialogOpen(true)
  }

  function handleDialogSuccess() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
    setDialogOpen(false)
    setEditingCourse(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Khóa học</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button className="min-h-[48px]" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Tạo khóa học
        </Button>
      </div>

      <h1 className="text-xl font-semibold leading-[1.3] mb-6">Quản lý khóa học</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Đang tải..." />
        </div>
      ) : courses.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Chưa có khóa học nào. Nhấn "Tạo khóa học" để bắt đầu.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Lớp mục tiêu</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {course.description ?? '—'}
                  </TableCell>
                  <TableCell>
                    <GradeBadge grade={course.target_grade} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[48px]"
                        aria-label="Chỉnh sửa"
                        onClick={() => handleOpenEdit(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[48px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        aria-label="Xóa"
                        onClick={() => setDeletingCourse(course)}
                      >
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

      <CourseFormDialog
        open={dialogOpen}
        course={editingCourse}
        onSuccess={handleDialogSuccess}
        onClose={() => {
          setDialogOpen(false)
          setEditingCourse(null)
        }}
      />

      <AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa khóa học "{deletingCourse?.title}"? Toàn bộ chuyên đề và bài
              học trong khóa sẽ bị xóa theo. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingCourse && deleteMutation.mutate(deletingCourse.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
