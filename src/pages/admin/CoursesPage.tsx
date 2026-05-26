import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Pencil, Trash2, BookOpen, Globe, EyeOff, Search } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AdminListCard,
  AdminListFilterRow,
  AdminListPaginationFooter,
} from '@/components/admin/AdminListCard'
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
import { fetchCourses, fetchCoursesPaginated, deleteCourse, publishCourse, Course } from '@/lib/api/courses'
import CourseFormDialog from '@/components/admin/CourseFormDialog'
import { GRADE_BADGE } from '@/lib/constants/grades'
import AdminPageHeader, { ADMIN_PAGE_HEADER_ACTION_BUTTON_CLASS } from '@/components/admin/AdminPageHeader'
import { ADMIN_MODAL_FOOTER_BUTTON_CLASS } from '@/components/admin/adminModalStyles'

function GradeBadge({ grade }: { grade: Course['target_grade'] }) {
  const { label, className } = GRADE_BADGE[grade] ?? GRADE_BADGE.grade_7
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}

export default function CoursesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [gradeFilter, setGradeFilter] = useState<'all' | Course['target_grade']>('all')
  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    gradeFilter: 'all' as 'all' | Course['target_grade'],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'courses', { page: currentPage, pageSize, ...appliedFilters }],
    queryFn: () => fetchCoursesPaginated({
      page: currentPage,
      pageSize,
      grade: appliedFilters.gradeFilter,
      search: appliedFilters.searchQuery
    }),
  })

  const courses = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

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

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      publishCourse(id, published),
    onSuccess: (_, { published }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      toast.success(published ? 'Đã công khai khóa học.' : 'Đã chuyển về bản nháp.')
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại.')
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

  function handleSearch(value: string) {
    setSearchQuery(value)
  }

  function handleGradeFilter(value: string) {
    setGradeFilter(value as 'all' | Course['target_grade'])
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  function applyFilters() {
    setAppliedFilters({ searchQuery, gradeFilter })
    setCurrentPage(1)
  }

  const countCopy = isLoading ? '' : `${totalCount} khóa học`

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý khóa học"
        description="Danh sách khóa học với bộ lọc lớp, tìm kiếm và quản lý trạng thái công khai."
        action={(
          <Button className={ADMIN_PAGE_HEADER_ACTION_BUTTON_CLASS} onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Tạo khóa học
          </Button>
        )}
      />

      <AdminListCard
            filters={(
              <AdminListFilterRow>
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    className="h-10 rounded-lg pl-9"
                    placeholder="Tìm theo tên khóa học…"
                    aria-label="Tìm kiếm khóa học"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <Select value={gradeFilter} onValueChange={handleGradeFilter}>
                  <SelectTrigger className="h-10 w-[170px] shrink-0 rounded-lg" aria-label="Lọc theo lớp">
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
                <Button className="h-10 shrink-0 rounded-lg" onClick={applyFilters}>
                  Tìm kiếm
                </Button>
              </AdminListFilterRow>
            )}
            totalLabel={countCopy}
            footer={(
              <AdminListPaginationFooter
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                onGoPage={setCurrentPage}
              />
            )}
          >
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Tên khóa học</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Lớp mục tiêu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-10 w-44" /></TableCell>
                    </TableRow>
                  ))
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                      {!appliedFilters.searchQuery && appliedFilters.gradeFilter === 'all'
                        ? 'Chưa có khóa học nào. Nhấn "Tạo khóa học" để bắt đầu.'
                        : 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.'}
                    </TableCell>
                  </TableRow>
                ) : courses.map((course, index) => (
                  <TableRow key={course.id}>
                    <TableCell className="w-12 text-muted-foreground">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="font-normal">{course.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {course.description ?? '—'}
                    </TableCell>
                    <TableCell>
                      <GradeBadge grade={course.target_grade} />
                    </TableCell>
                    <TableCell>
                      {course.is_published ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                          <Globe className="h-3 w-3" />
                          Công khai
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground gap-1">
                          <EyeOff className="h-3 w-3" />
                          Nháp
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[48px]"
                          aria-label="Xem chuyên đề"
                          onClick={() => navigate(`/quan-tri/khoa-hoc/${course.slug}`)}
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
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
                          variant={course.is_published ? 'outline' : 'default'}
                          size="sm"
                          className="min-h-[48px] text-xs"
                          disabled={publishMutation.isPending}
                          onClick={() => publishMutation.mutate({ id: course.id, published: !course.is_published })}
                        >
                          {publishMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : course.is_published ? (
                            <><EyeOff className="h-3.5 w-3.5 mr-1" />Ẩn</>
                          ) : (
                            <><Globe className="h-3.5 w-3.5 mr-1" />Công khai</>
                          )}
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
          </AdminListCard>

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
            <AlertDialogCancel className={ADMIN_MODAL_FOOTER_BUTTON_CLASS}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className={`${ADMIN_MODAL_FOOTER_BUTTON_CLASS} bg-destructive text-destructive-foreground hover:bg-destructive/90`}
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
