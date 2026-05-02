import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
import { Loader2, Plus, Pencil, Trash2, BookOpen, GripVertical } from 'lucide-react'
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
import {
  fetchChapters,
  removeChapter,
  batchReorderChapters,
  Chapter,
} from '@/lib/api/chapters'
import ChapterFormDialog from '@/components/admin/ChapterFormDialog'

interface SortableChapterRowProps {
  chapter: Chapter
  index: number
  onEdit: (chapter: Chapter) => void
  onDelete: (chapter: Chapter) => void
  onViewLessons: (slug: string) => void
}

function SortableChapterRow({ chapter, index, onEdit, onDelete, onViewLessons }: SortableChapterRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

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
      <TableCell className="font-medium w-16">{index + 1}</TableCell>
      <TableCell>{chapter.title}</TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="min-h-[48px]"
          aria-label="Quản lý bài học"
          onClick={() => onViewLessons(chapter.slug)}
        >
          <BookOpen className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-[48px]"
          aria-label="Chỉnh sửa"
          onClick={() => onEdit(chapter)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-[48px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Xóa"
          onClick={() => onDelete(chapter)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

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
    mutationFn: (updates: { id: string; order_index: number }[]) =>
      batchReorderChapters(updates),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'chapters', course?.id] })
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

    const oldIndex = chapters.findIndex((c) => c.id === active.id)
    const newIndex = chapters.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(chapters, oldIndex, newIndex)

    // Optimistic update
    queryClient.setQueryData(['admin', 'chapters', course?.id], reordered)

    // Persist: only update items whose position changed
    const updates = reordered
      .map((c, i) => ({ id: c.id, order_index: i }))
      .filter((_, i) => chapters[i]?.id !== reordered[i]?.id)

    if (updates.length > 0) {
      reorderMutation.mutate(updates)
    }
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
                <Link to="/quan-tri/khoa-hoc">Khóa học</Link>
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
        <div aria-busy="true" aria-label="Đang tải...">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : chapters.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Chưa có chuyên đề nào. Nhấn "Thêm chuyên đề" để bắt đầu.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Tên chuyên đề</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chapters.map((chapter, index) => (
                    <SortableChapterRow
                      key={chapter.id}
                      chapter={chapter}
                      index={index}
                      onEdit={(c) => { handleOpenEdit(c) }}
                      onDelete={setDeletingChapter}
                      onViewLessons={(slug) => navigate(`/quan-tri/khoa-hoc/${courseSlug}/chuong/${slug}`)}
                    />
                  ))}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>
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
