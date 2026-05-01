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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
import { fetchCourses, deleteCourse, publishCourse, Course } from '@/lib/api/courses'
import CourseFormDialog from '@/components/admin/CourseFormDialog'
import { GRADE_BADGE } from '@/lib/constants/grades'

function GradeBadge({ grade }: { grade: Course['target_grade'] }) {
  const { label, className } = GRADE_BADGE[grade] ?? GRADE_BADGE.grade_7
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1)
  return [1, 2, 'ellipsis', total - 1, total]
}

export default function CoursesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [gradeFilter, setGradeFilter] = useState<'all' | Course['target_grade']>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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
    setCurrentPage(1)
  }

  function handleGradeFilter(value: string) {
    setGradeFilter(value as 'all' | Course['target_grade'])
    setCurrentPage(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  // Filter logic: grade AND search (case-insensitive)
  const filtered = courses.filter((c) => {
    const matchesGrade = gradeFilter === 'all' || c.target_grade === gradeFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch = q === '' || c.title.toLowerCase().includes(q)
    return matchesGrade && matchesSearch
  })

  // Pagination slicing
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Count copy logic
  const countCopy = isLoading
    ? ''
    : gradeFilter !== 'all' || searchQuery
      ? `${filtered.length} / ${courses.length} khóa học`
      : `${courses.length} khóa học`

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

      {/* Content: Loading / Empty / Table + Pagination */}
      {isLoading ? (
        <div aria-busy="true" aria-label="Đang tải...">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          {courses.length === 0 ? (
            <>
              <p className="text-base font-semibold text-foreground mb-1">Chưa có khóa học nào</p>
              <p className="text-sm text-muted-foreground mb-4">Nhấn "Tạo khóa học" để bắt đầu.</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-1" />
                Tạo khóa học
              </Button>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-foreground mb-1">Không tìm thấy kết quả</p>
              <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc.</p>
            </>
          )}
        </div>
      ) : (
        <>
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
                {paginated.map((course, index) => (
                  <TableRow key={course.id}>
                    <TableCell className="w-12 text-muted-foreground">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="font-medium">{course.title}</TableCell>
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

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Hiển thị</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[72px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>/ trang</span>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {buildPageNumbers(currentPage, totalPages).map((page, idx) =>
                    page === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
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

