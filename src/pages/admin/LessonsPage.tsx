import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Loader2, Plus, Pencil, Trash2, FileText, GripVertical } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
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
  batchReorderLessons,
  deleteAssignment,
  getAssignmentPublicUrl,
  parseAssignmentPaths,
  Lesson,
} from '@/lib/api/lessons'
import LessonFormDialog from '@/components/admin/LessonFormDialog'

interface SortableLessonRowProps {
  lesson: Lesson
  index: number
  onEdit: (lesson: Lesson) => void
  onDelete: (lesson: Lesson) => void
}

function SortableLessonRow({ lesson, index, onEdit, onDelete }: SortableLessonRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id })

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const videoId = lesson.video_url ? extractYouTubeID(lesson.video_url) : null

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1"
          aria-label="Kéo để sắp xếp"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-normal w-16">{index + 1}</TableCell>
      <TableCell className="w-32">
        {videoId ? (
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt={`Thumbnail ${lesson.title}`}
            loading="lazy"
            className="w-20 h-12 object-cover rounded border"
          />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>{lesson.title}</TableCell>
      <TableCell className="w-56">
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
      <TableCell className="text-right space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="min-h-[48px]"
          aria-label="Chỉnh sửa"
          onClick={() => onEdit(lesson)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-[48px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Xóa"
          onClick={() => onDelete(lesson)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

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
  const { data: lessons = [], isLoading, isError } = useQuery<Lesson[]>({
    queryKey: ['admin', 'lessons', chapter?.id],
    queryFn: () => fetchLessons(chapter!.id),
    enabled: !!chapter?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: async (lesson: Lesson) => {
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
    mutationFn: (updates: { id: string; order_index: number }[]) =>
      batchReorderLessons(updates),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', chapter?.id] })
      toast.error('Sắp xếp thất bại. Vui lòng thử lại.')
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = lessons.findIndex((l) => l.id === active.id)
    const newIndex = lessons.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(lessons, oldIndex, newIndex)

    // Optimistic update
    queryClient.setQueryData(['admin', 'lessons', chapter?.id], reordered)

    // Persist
    const updates = reordered
      .map((l, i) => ({ id: l.id, order_index: i }))
      .filter((_, i) => lessons[i]?.id !== reordered[i]?.id)

    if (updates.length > 0) {
      reorderMutation.mutate(updates)
    }
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
                <Link to="/quan-tri/khoa-hoc">Khóa học</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/quan-tri/khoa-hoc/${courseSlug}`}>{course?.title ?? 'Chuyên đề'}</Link>
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

      {isError ? (
        <p className="text-destructive py-8 text-center">
          Không thể tải dữ liệu. Vui lòng thử lại.
        </p>
      ) : isLoading ? (
        <div aria-busy="true" aria-label="Đang tải...">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : lessons.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Chuyên đề này chưa có bài học nào. Nhấn "Thêm bài học" để thêm.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead className="w-32">Video</TableHead>
                    <TableHead>Tên bài học</TableHead>
                    <TableHead className="w-56">Đính kèm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessons.map((lesson, index) => (
                    <SortableLessonRow
                      key={lesson.id}
                      lesson={lesson}
                      index={index}
                      onEdit={handleOpenEdit}
                      onDelete={setDeletingLesson}
                    />
                  ))}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>
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
