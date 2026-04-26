import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, BookOpen } from 'lucide-react'
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
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { fetchCourses, Course } from '@/lib/api/courses'
import {
  fetchChapters,
  removeChapter,
  reorderChapters,
  Chapter,
} from '@/lib/api/chapters'
import ChapterFormDialog from '@/components/admin/ChapterFormDialog'

export default function ChaptersPage() {
  const { courseSlug } = useParams<{ courseSlug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null)

  // Fetch course name for breadcrumb
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['admin', 'courses'],
    queryFn: fetchCourses,
  })
  const course = courses.find((c) => c.slug === courseSlug)

  // Fetch chapters for this course
  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ['admin', 'chapters', course?.id],
    queryFn: () => fetchChapters(course!.id),
    enabled: !!course?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeChapter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'chapters', course?.id] })
      toast.success('Đã xóa chuyên đề.')
      setDeletingChapter(null)
    },
    onError: () => {
      toast.error('Xóa không thành công. Vui lòng thử lại.')
    },
  })

  const reorderMutation = useMutation({
    mutationFn: ({
      chapterA,
      chapterB,
    }: {
      chapterA: Pick<Chapter, 'id' | 'order_index'>
      chapterB: Pick<Chapter, 'id' | 'order_index'>
    }) => reorderChapters(chapterA, chapterB),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'chapters', course?.id] })
    },
    onError: () => {
      toast.error('Sắp xếp không thành công. Vui lòng thử lại.')
    },
  })

  function handleMoveUp(index: number) {
    if (index === 0) return
    reorderMutation.mutate({
      chapterA: chapters[index],
      chapterB: chapters[index - 1],
    })
  }

  function handleMoveDown(index: number) {
    if (index === chapters.length - 1) return
    reorderMutation.mutate({
      chapterA: chapters[index],
      chapterB: chapters[index + 1],
    })
  }

  function handleOpenCreate() {
    setEditingChapter(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(chapter: Chapter) {
    setEditingChapter(chapter)
    setDialogOpen(true)
  }

  function handleDialogSuccess() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'chapters', course?.id] })
    setDialogOpen(false)
    setEditingChapter(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/courses">Khóa học</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course?.title ?? 'Chuyên đề'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button className="min-h-[48px]" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm chuyên đề
        </Button>
      </div>

      <h1 className="text-xl font-semibold leading-[1.3] mb-6">
        Quản lý chuyên đề{course ? `: ${course.title}` : ''}
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Đang tải..." />
        </div>
      ) : chapters.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Chưa có chuyên đề nào. Nhấn "Thêm chuyên đề" để bắt đầu.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Tên chuyên đề</TableHead>
                <TableHead>Sắp xếp</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chapters.map((chapter, index) => (
                <TableRow key={chapter.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{chapter.title}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[40px] px-2"
                        aria-label="Di chuyển lên"
                        disabled={index === 0 || reorderMutation.isPending}
                        onClick={() => handleMoveUp(index)}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[40px] px-2"
                        aria-label="Di chuyển xuống"
                        disabled={index === chapters.length - 1 || reorderMutation.isPending}
                        onClick={() => handleMoveDown(index)}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[48px]"
                        aria-label="Quản lý bài học"
                        onClick={() =>
                          navigate(`/admin/courses/${courseSlug}/chapters/${chapter.slug}`)
                        }
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[48px]"
                        aria-label="Chỉnh sửa"
                        onClick={() => handleOpenEdit(chapter)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[48px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        aria-label="Xóa"
                        onClick={() => setDeletingChapter(chapter)}
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

      <ChapterFormDialog
        open={dialogOpen}
        courseId={course?.id ?? ''}
        chapter={editingChapter}
        nextOrderIndex={chapters.length}
        onSuccess={handleDialogSuccess}
        onClose={() => {
          setDialogOpen(false)
          setEditingChapter(null)
        }}
      />

      <AlertDialog
        open={!!deletingChapter}
        onOpenChange={(open) => !open && setDeletingChapter(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa chuyên đề</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa chuyên đề "{deletingChapter?.title}"? Toàn bộ bài học trong
              chuyên đề sẽ bị xóa theo. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingChapter && deleteMutation.mutate(deletingChapter.id)}
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
