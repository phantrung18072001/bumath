import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { extractYouTubeID } from '@/lib/youtube'
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
import { fetchChapters, Chapter } from '@/lib/api/chapters'
import {
  fetchLessons,
  removeLesson,
  reorderLessons,
  deleteAssignment,
  getAssignmentPublicUrl,
  parseAssignmentPaths,
  Lesson,
} from '@/lib/api/lessons'
import LessonFormDialog from '@/components/admin/LessonFormDialog'

export default function LessonsPage() {
  const { courseSlug, chapterSlug } = useParams<{ courseSlug: string; chapterSlug: string }>()
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)

  // Fetch course for breadcrumb
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['admin', 'courses'],
    queryFn: fetchCourses,
  })
  const course = courses.find((c) => c.slug === courseSlug)

  // Fetch chapters for breadcrumb
  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ['admin', 'chapters', course?.id],
    queryFn: () => fetchChapters(course!.id),
    enabled: !!course?.id,
  })
  const chapter = chapters.find((ch) => ch.slug === chapterSlug)

  // Fetch lessons for this chapter
  const { data: lessons = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ['admin', 'lessons', chapter?.id],
    queryFn: () => fetchLessons(chapter!.id),
    enabled: !!chapter?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: async (lesson: Lesson) => {
      // Delete attachment first, then delete lesson record
      await deleteAssignment(lesson.assignment_path)
      await removeLesson(lesson.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', chapter?.id] })
      toast.success('Đã xóa bài học.')
      setDeletingLesson(null)
    },
    onError: () => {
      toast.error('Xóa không thành công. Vui lòng thử lại.')
    },
  })

  const reorderMutation = useMutation({
    mutationFn: ({
      lessonA,
      lessonB,
    }: {
      lessonA: Pick<Lesson, 'id' | 'order_index'>
      lessonB: Pick<Lesson, 'id' | 'order_index'>
    }) => reorderLessons(lessonA, lessonB),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', chapter?.id] })
    },
    onError: () => {
      toast.error('Sắp xếp không thành công. Vui lòng thử lại.')
    },
  })

  function handleMoveUp(index: number) {
    if (index === 0) return
    reorderMutation.mutate({
      lessonA: lessons[index],
      lessonB: lessons[index - 1],
    })
  }

  function handleMoveDown(index: number) {
    if (index === lessons.length - 1) return
    reorderMutation.mutate({
      lessonA: lessons[index],
      lessonB: lessons[index + 1],
    })
  }

  function handleOpenCreate() {
    setEditingLesson(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(lesson: Lesson) {
    setEditingLesson(lesson)
    setDialogOpen(true)
  }

  function handleDialogSuccess() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', chapter?.id] })
    setDialogOpen(false)
    setEditingLesson(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header row: breadcrumb + CTA */}
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
              <BreadcrumbLink asChild>
                <Link to={`/admin/courses/${courseSlug}`}>{course?.title ?? 'Chuyên đề'}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{chapter?.title ?? 'Bài học'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button className="min-h-[48px]" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm bài học
        </Button>
      </div>

      <h1 className="text-xl font-semibold leading-[1.3] mb-6">
        Quản lý bài học{chapter ? `: ${chapter.title}` : ''}
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Đang tải..." />
        </div>
      ) : lessons.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Chuyên đề này chưa có bài học nào. Nhấn "Thêm bài học" để thêm.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead className="w-32">Video</TableHead>
                <TableHead>Tên bài học</TableHead>
                <TableHead className="w-56">Đính kèm</TableHead>
                <TableHead>Sắp xếp</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson, index) => (
                <TableRow key={lesson.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    {(() => {
                      const videoId = lesson.video_url ? extractYouTubeID(lesson.video_url) : null
                      return videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={`Thumbnail ${lesson.title}`}
                          loading="lazy"
                          className="w-20 h-12 object-cover rounded border"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )
                    })()}
                  </TableCell>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell>
                    {lesson.assignment_path ? (
                      <div className="flex flex-col gap-1">
                        {parseAssignmentPaths(lesson.assignment_path).map((p) => {
                          const name = p.split('/').pop() ?? p
                          return (
                            <a
                              key={p}
                              href={getAssignmentPublicUrl(p)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 max-w-[14rem] rounded-md border bg-muted/40 px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                              title={name}
                            >
                              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                              <span className="truncate min-w-0">{name}</span>
                            </a>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
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
                        disabled={index === lessons.length - 1 || reorderMutation.isPending}
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
                        aria-label="Chỉnh sửa"
                        onClick={() => handleOpenEdit(lesson)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[48px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        aria-label="Xóa"
                        onClick={() => setDeletingLesson(lesson)}
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

      <LessonFormDialog
        open={dialogOpen}
        chapterId={chapter?.id ?? ''}
        lesson={editingLesson}
        nextOrderIndex={lessons.length}
        onSuccess={handleDialogSuccess}
        onClose={() => {
          setDialogOpen(false)
          setEditingLesson(null)
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingLesson}
        onOpenChange={(open) => !open && setDeletingLesson(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa bài học "{deletingLesson?.title}"? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingLesson && deleteMutation.mutate(deletingLesson)}
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
