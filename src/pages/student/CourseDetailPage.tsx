import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, LogIn, Menu, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import StudentLayout from '@/components/student/StudentLayout'
import Header from '@/components/landing/Header'
import LessonSidebar from '@/components/student/LessonSidebar'
import LessonContent from '@/components/student/LessonContent'
import ChapterInlineForm from '@/components/admin/ChapterInlineForm'
import LessonInlineForm from '@/components/admin/LessonInlineForm'
import CourseFormDialog from '@/components/admin/CourseFormDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
import { fetchCourseBySlug, deleteCourse } from '@/lib/api/courses'
import {
  fetchChapters,
  removeChapter,
  batchReorderChapters,
  type Chapter,
} from '@/lib/api/chapters'
import {
  fetchLessonsForStudent,
  fetchLessons,
  removeLesson,
  batchReorderLessons,
  moveLessonToChapter,
  deleteAssignment,
  type Lesson,
} from '@/lib/api/lessons'
import { getLessonProgress, getCourseProgress } from '@/lib/api/lesson-progress'
import { getSubmissions } from '@/lib/api/submissions'
import { getUserEnrollments } from '@/lib/api/enrollments'
import { GRADE_BADGE } from '@/lib/constants/grades'
import { toast } from 'sonner'
import StudyMaterialsList from '@/components/student/StudyMaterialsList'
import type { StudyMaterialGrade } from '@/lib/api/study-materials'

function toMaterialGrade(grade?: string): StudyMaterialGrade {
  if (grade === 'grade_7' || grade === 'grade_8' || grade === 'grade_9') return grade
  return 'grade_9'
}

type AdminPanelState =
  | null
  | { kind: 'chapter-create' }
  | { kind: 'chapter-edit'; chapter: Chapter }
  | { kind: 'lesson-create'; chapterId: string }
  | { kind: 'lesson-edit'; chapterId: string; lesson: Lesson }

export default function CourseDetailPage({ isAdmin = false }: { isAdmin?: boolean }) {
  const { courseSlug } = useParams<{ courseSlug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, profile, loading: authLoading } = useAuth()
  const isAuthenticated = !authLoading && !!user
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const lessonIdFromQuery = searchParams.get('lesson')
  const [adminPanel, setAdminPanel] = useState<AdminPanelState>(null)
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null)
  const [deletingLesson, setDeletingLesson] = useState<{ chapterId: string; lesson: Lesson } | null>(null)
  const [courseFormOpen, setCourseFormOpen] = useState(false)
  const [courseDeleteConfirm, setCourseDeleteConfirm] = useState(false)

  const { data: course, isLoading: courseLoading, isError: courseError } = useQuery({
    queryKey: ['course', courseSlug],
    queryFn: () => fetchCourseBySlug(courseSlug!),
    enabled: !!courseSlug,
  })
  const courseId = course?.id

  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
  } = useQuery({
    queryKey: ['enrollments', profile?.id],
    queryFn: () => getUserEnrollments(profile!.id),
    enabled: isAuthenticated && !isAdmin && !!profile?.id,
  })

  const isEnrolled = isAdmin || (isAuthenticated && !!enrollments?.some(e => e.course_id === courseId))

  const {
    data: chapters,
    isLoading: chaptersLoading,
    isError: chaptersError,
  } = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => fetchChapters(courseId!),
    enabled: !!courseId,
  })

  const lessonScope = isAdmin ? 'admin' : 'student'
  const {
    data: lessonsByChapter,
    isLoading: lessonsLoading,
    isError: lessonsError,
  } = useQuery({
    queryKey: ['lessons', courseId, lessonScope],
    queryFn: async () => {
      const fetchOne = isAdmin ? fetchLessons : fetchLessonsForStudent
      const allLessons = await Promise.all(chapters!.map(c => fetchOne(c.id)))
      return new Map<string, Lesson[]>(chapters!.map((c, i) => [c.id, allLessons[i]]))
    },
    enabled: !!chapters && chapters.length > 0,
  })

  const allLessons: Lesson[] = lessonsByChapter
    ? Array.from(lessonsByChapter.values()).flat()
    : []
  const allLessonIds = allLessons.map(l => l.id)

  const { data: progressData } = useQuery({
    queryKey: ['lesson-progress', courseId],
    queryFn: () => getLessonProgress(profile!.id, allLessonIds),
    enabled: isAuthenticated && !isAdmin && !!profile?.id && allLessonIds.length > 0,
  })

  const completedLessonIds = new Set(
    isAdmin ? [] : (progressData?.map(p => p.lesson_id) ?? []),
  )

  const { data: submissionsData } = useQuery({
    queryKey: ['submissions', courseId],
    queryFn: () => getSubmissions(profile!.id, allLessonIds),
    enabled: isAuthenticated && !isAdmin && !!profile?.id && allLessonIds.length > 0,
  })

  const submissionMap = new Map(submissionsData?.map(s => [s.lesson_id, s]) ?? [])

  const progress = isAdmin ? 0 : getCourseProgress(allLessonIds, completedLessonIds)

  useEffect(() => {
    if (!activeLessonId && chapters && lessonsByChapter) {
      const firstChapter = chapters[0]
      const firstLesson = lessonsByChapter.get(firstChapter?.id)?.[0]
      if (firstLesson) setActiveLessonId(firstLesson.id)
    }
  }, [chapters, lessonsByChapter, activeLessonId])

  const allLessonIdsKey = allLessons.map(l => l.id).join(',')
  useEffect(() => {
    if (!lessonIdFromQuery || !allLessons.length) return
    const found = allLessons.find((l: Lesson) => l.id === lessonIdFromQuery)
    if (found) {
      setActiveLessonId(found.id)
      requestAnimationFrame(() => {
        document.getElementById(`lesson-${found.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- allLessonIdsKey tracks allLessons identity
  }, [lessonIdFromQuery, allLessonIdsKey])

  const activeLesson = allLessons.find(l => l.id === activeLessonId) ?? null
  const activeSubmission = activeLessonId ? submissionMap.get(activeLessonId) ?? null : null

  const isLoading = authLoading || courseLoading || chaptersLoading ||
    (!!chapters && chapters.length > 0 && !lessonsByChapter && !lessonsError) ||
    (isAuthenticated && !isAdmin && enrollmentsLoading)

  const hasError = courseError || chaptersError || lessonsError

  function invalidateCourseContent() {
    if (!courseId) return
    queryClient.invalidateQueries({ queryKey: ['chapters', courseId] })
    queryClient.invalidateQueries({ queryKey: ['lessons', courseId, 'admin'] })
    queryClient.invalidateQueries({ queryKey: ['lessons', courseId, 'student'] })
  }

  const deleteCourseMutation = useMutation({
    mutationFn: () => deleteCourse(courseId!),
    onSuccess: () => {
      toast.success('Đã xóa khóa học.')
      navigate('/quan-tri/khoa-hoc')
    },
    onError: () => toast.error('Xóa không thành công. Vui lòng thử lại.'),
  })

  const deleteChapterMutation = useMutation({
    mutationFn: (id: string) => removeChapter(id),
    onSuccess: () => {
      invalidateCourseContent()
      toast.success('Đã xóa chuyên đề.')
      setDeletingChapter(null)
    },
    onError: () => toast.error('Xóa không thành công. Vui lòng thử lại.'),
  })

  const deleteLessonMutation = useMutation({
    mutationFn: async ({ lesson }: { chapterId: string; lesson: Lesson }) => {
      await deleteAssignment(lesson.assignment_path)
      await removeLesson(lesson.id)
    },
    onSuccess: () => {
      invalidateCourseContent()
      toast.success('Đã xóa bài học.')
      setDeletingLesson(null)
    },
    onError: () => toast.error('Xóa không thành công. Vui lòng thử lại.'),
  })

  const reorderChaptersMutation = useMutation({
    mutationFn: (updates: { id: string; order_index: number }[]) => batchReorderChapters(updates),
    onError: () => {
      invalidateCourseContent()
      toast.error('Sắp xếp thất bại. Vui lòng thử lại.')
    },
  })

  const reorderLessonsMutation = useMutation({
    mutationFn: (updates: { id: string; order_index: number }[]) => batchReorderLessons(updates),
    onError: () => {
      invalidateCourseContent()
      toast.error('Sắp xếp thất bại. Vui lòng thử lại.')
    },
  })

  function handleReorderChapters(reordered: Chapter[]) {
    if (!courseId || !chapters) return
    queryClient.setQueryData(['chapters', courseId], reordered)
    const updates = reordered
      .map((c, i) => ({ id: c.id, order_index: i }))
      .filter((_, i) => chapters[i]?.id !== reordered[i]?.id)
    if (updates.length > 0) reorderChaptersMutation.mutate(updates)
  }

  function handleReorderLessons(chapterId: string, reordered: Lesson[]) {
    if (!lessonsByChapter) return
    const nextMap = new Map(lessonsByChapter)
    nextMap.set(chapterId, reordered)
    queryClient.setQueryData(['lessons', courseId, 'admin'], nextMap)
    const prev = lessonsByChapter.get(chapterId) ?? []
    const updates = reordered
      .map((l, i) => ({ id: l.id, order_index: i }))
      .filter((_, i) => prev[i]?.id !== reordered[i]?.id)
    if (updates.length > 0) reorderLessonsMutation.mutate(updates)
  }

  const moveLessonMutation = useMutation({
    mutationFn: ({ lessonId, toChapterId, newIndex }: { lessonId: string; toChapterId: string; newIndex: number; fromChapterId: string; fromList: Lesson[]; toList: Lesson[] }) =>
      moveLessonToChapter(lessonId, toChapterId, newIndex),
    onSuccess: (_, { fromList, toList }) => {
      const fromUpdates = fromList.map((l, i) => ({ id: l.id, order_index: i }))
      const toUpdates = toList.map((l, i) => ({ id: l.id, order_index: i }))
      Promise.all([
        fromUpdates.length ? batchReorderLessons(fromUpdates) : Promise.resolve(),
        toUpdates.length ? batchReorderLessons(toUpdates) : Promise.resolve(),
      ]).finally(() => invalidateCourseContent())
      toast.success('Đã di chuyển bài học.')
    },
    onError: () => {
      invalidateCourseContent()
      toast.error('Di chuyển không thành công. Vui lòng thử lại.')
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEndDnd(event: DragEndEvent) {
    if (!isAdmin || !chapters || !lessonsByChapter) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId.startsWith('chapter:') && overId.startsWith('chapter:')) {
      const oldIndex = chapters.findIndex((c) => `chapter:${c.id}` === activeId)
      const newIndex = chapters.findIndex((c) => `chapter:${c.id}` === overId)
      if (oldIndex < 0 || newIndex < 0) return
      handleReorderChapters(arrayMove(chapters, oldIndex, newIndex))
      return
    }

    if (activeId.startsWith('lesson:') && overId.startsWith('lesson:')) {
      const activeLessonId = activeId.replace('lesson:', '')
      const overLessonId = overId.replace('lesson:', '')
      let activeChapterId: string | null = null
      let overChapterId: string | null = null
      for (const c of chapters) {
        const ls = lessonsByChapter.get(c.id) ?? []
        if (ls.some((l) => l.id === activeLessonId)) activeChapterId = c.id
        if (ls.some((l) => l.id === overLessonId)) overChapterId = c.id
      }
      if (!activeChapterId || !overChapterId) return
      if (activeChapterId === overChapterId) {
        const list = [...(lessonsByChapter.get(activeChapterId) ?? [])]
        const oldIndex = list.findIndex((l) => l.id === activeLessonId)
        const newIndex = list.findIndex((l) => l.id === overLessonId)
        if (oldIndex < 0 || newIndex < 0) return
        handleReorderLessons(activeChapterId, arrayMove(list, oldIndex, newIndex))
      } else {
        const overList = lessonsByChapter.get(overChapterId) ?? []
        const newIndex = overList.findIndex((l) => l.id === overLessonId)
        handleMoveLesson(activeLessonId, activeChapterId, overChapterId, newIndex >= 0 ? newIndex : overList.length)
      }
      return
    }

    if (activeId.startsWith('lesson:') && (overId.startsWith('chapter:') || overId.startsWith('end:'))) {
      const activeLessonId = activeId.replace('lesson:', '')
      const toChapterId = overId.startsWith('end:') ? overId.replace('end:', '') : overId.replace('chapter:', '')
      let fromChapterId: string | null = null
      for (const c of chapters) {
        if ((lessonsByChapter.get(c.id) ?? []).some((l) => l.id === activeLessonId)) {
          fromChapterId = c.id
          break
        }
      }
      if (!fromChapterId || fromChapterId === toChapterId) return
      const toList = lessonsByChapter.get(toChapterId) ?? []
      handleMoveLesson(activeLessonId, fromChapterId, toChapterId, toList.length)
    }
  }

  function handleMoveLesson(lessonId: string, fromChapterId: string, toChapterId: string, newIndex: number) {
    if (!lessonsByChapter) return
    const nextMap = new Map(lessonsByChapter)
    const fromList = [...(nextMap.get(fromChapterId) ?? [])]
    const lesson = fromList.find((l) => l.id === lessonId)
    if (!lesson) return
    const filteredFrom = fromList.filter((l) => l.id !== lessonId)
    const toList = [...(nextMap.get(toChapterId) ?? [])]
    toList.splice(newIndex, 0, { ...lesson, chapter_id: toChapterId })
    nextMap.set(fromChapterId, filteredFrom)
    nextMap.set(toChapterId, toList)
    queryClient.setQueryData(['lessons', courseId, 'admin'], nextMap)
    moveLessonMutation.mutate({ lessonId, toChapterId, newIndex, fromChapterId, fromList: filteredFrom, toList: [...toList] })
  }

  const backLink = (
    <Link
      to={isAdmin ? '/quan-tri/khoa-hoc' : isAuthenticated ? '/khoa-hoc' : '/danh-muc'}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {isAdmin ? 'Quản lý khóa học' : isAuthenticated ? 'Khóa học của tôi' : 'Danh mục khóa học'}
    </Link>
  )

  const adminFormDialog = isAdmin && courseId && chapters ? (
    <Dialog open={adminPanel !== null} onOpenChange={(open) => { if (!open) setAdminPanel(null) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {adminPanel?.kind === 'chapter-create' && 'Thêm chuyên đề'}
            {adminPanel?.kind === 'chapter-edit' && 'Sửa chuyên đề'}
            {adminPanel?.kind === 'lesson-create' && 'Thêm bài học'}
            {adminPanel?.kind === 'lesson-edit' && 'Sửa bài học'}
          </DialogTitle>
        </DialogHeader>
        {(adminPanel?.kind === 'chapter-create') && (
          <ChapterInlineForm
            courseId={courseId}
            chapter={null}
            nextOrderIndex={chapters.length}
            onSuccess={() => { invalidateCourseContent(); setAdminPanel(null) }}
            onCancel={() => setAdminPanel(null)}
          />
        )}
        {(adminPanel?.kind === 'chapter-edit') && (
          <ChapterInlineForm
            courseId={courseId}
            chapter={adminPanel.chapter}
            nextOrderIndex={chapters.length}
            onSuccess={() => { invalidateCourseContent(); setAdminPanel(null) }}
            onCancel={() => setAdminPanel(null)}
          />
        )}
        {(adminPanel?.kind === 'lesson-create') && (
          <LessonInlineForm
            chapterId={adminPanel.chapterId}
            lesson={null}
            nextOrderIndex={(lessonsByChapter?.get(adminPanel.chapterId) ?? []).length}
            onSuccess={() => { invalidateCourseContent(); setAdminPanel(null) }}
            onCancel={() => setAdminPanel(null)}
          />
        )}
        {(adminPanel?.kind === 'lesson-edit') && (
          <LessonInlineForm
            chapterId={adminPanel.chapterId}
            lesson={adminPanel.lesson}
            nextOrderIndex={(lessonsByChapter?.get(adminPanel.chapterId) ?? []).length}
            onSuccess={() => { invalidateCourseContent(); setAdminPanel(null) }}
            onCancel={() => setAdminPanel(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  ) : null

  const sidebarShared = isAdmin && chapters && lessonsByChapter
    ? {
        chapters,
        lessonsByChapter,
        completedLessonIds,
        activeLessonId,
        onSelectLesson: (lesson: Lesson) => { setActiveLessonId(lesson.id); setAdminPanel(null) },
        progress,
        isAdmin: true,
        onReorderChapters: handleReorderChapters,
        onReorderLessons: handleReorderLessons,
        onAddChapter: () => setAdminPanel({ kind: 'chapter-create' }),
        onEditChapter: (c: Chapter) => setAdminPanel({ kind: 'chapter-edit', chapter: c }),
        onDeleteChapter: (c: Chapter) => setDeletingChapter(c),
        onAddLesson: (chapterId: string) => setAdminPanel({ kind: 'lesson-create', chapterId }),
        onEditLesson: (chapterId: string, lesson: Lesson) =>
          setAdminPanel({ kind: 'lesson-edit', chapterId, lesson }),
        onDeleteLesson: (chapterId: string, lesson: Lesson) => setDeletingLesson({ chapterId, lesson }),
        onMoveLesson: handleMoveLesson,
      }
    : {
        chapters: chapters ?? [],
        lessonsByChapter: lessonsByChapter ?? new Map(),
        completedLessonIds,
        activeLessonId,
        onSelectLesson: (lesson: Lesson) => setActiveLessonId(lesson.id),
        progress,
        isAdmin: false,
      }

  const pageContent = (
    <>
      {hasError && (
        <div className="px-4 lg:px-8 py-4">
          <div className="mb-3">{backLink}</div>
          <p className="text-destructive text-center py-8">
            Không thể tải dữ liệu. Vui lòng thử lại.
          </p>
        </div>
      )}

      {!isLoading && !hasError && !course && (
        <div className="px-4 lg:px-8 pt-4 pb-16 text-center">
          <div className="text-left mb-8">{backLink}</div>
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy khóa học</h2>
          <p className="text-base text-muted-foreground">
            Khóa học này không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="px-4 lg:px-8 pb-4 space-y-3 pt-4">
          <Skeleton className="h-6 w-40 rounded-xl" />
          <Skeleton className="h-4 w-24 rounded-xl" />
          <Skeleton className="h-[360px] w-full rounded-3xl" />
          <Skeleton className="h-4 w-3/4 rounded-xl" />
          <Skeleton className="h-4 w-1/2 rounded-xl" />
        </div>
      )}

      {!isLoading && !hasError && chapters && chapters.length === 0 && !isAdmin && (
        <div className="px-4 lg:px-8 pt-4 pb-16 text-center">
          <div className="text-left mb-8">{backLink}</div>
          <h2 className="text-xl font-semibold mb-2">Khóa học chưa có bài giảng</h2>
          <p className="text-base text-muted-foreground">
            Giảng viên đang cập nhật nội dung. Vui lòng quay lại sau.
          </p>
        </div>
      )}

      {!isLoading && !hasError && chapters && chapters.length === 0 && isAdmin && courseId && (
        <div className="px-4 py-4">
          <div className="mb-4">{backLink}</div>
          <p className="text-muted-foreground mb-3">Chưa có chuyên đề. Thêm chuyên đề để bắt đầu.</p>
          <Button type="button" className="cursor-pointer min-h-[48px]" onClick={() => setAdminPanel({ kind: 'chapter-create' })}>
            Thêm chuyên đề
          </Button>
        </div>
      )}

      {!isLoading && !hasError && chapters && chapters.length > 0 && lessonsByChapter && (
        isEnrolled ? (
          <>
            <div className="hidden lg:flex h-[calc(100vh-80px)] border-t border-border overflow-hidden">
              <div className="w-[420px] shrink-0 bg-white/80 backdrop-blur-sm border-r border-indigo-200/60 flex flex-col h-full">
                <div className="flex-1 min-h-0 flex flex-col">
                  <LessonSidebar
                    {...sidebarShared}
                    scrollable
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white backdrop-blur-sm">
                {isAdmin && adminPanel && courseId && chapters ? (
                   <>
                    {(adminPanel.kind === 'chapter-create' || adminPanel.kind === 'chapter-edit') && (
                      <div className="p-6 max-w-2xl mx-auto">
                        <h2 className="text-lg font-semibold mb-4">
                          {adminPanel.kind === 'chapter-create' ? 'Thêm chuyên đề' : 'Sửa chuyên đề'}
                        </h2>
                        <ChapterInlineForm
                          courseId={courseId}
                          chapter={adminPanel.kind === 'chapter-edit' ? adminPanel.chapter : null}
                          nextOrderIndex={chapters.length}
                          onSuccess={() => { invalidateCourseContent(); setAdminPanel(null) }}
                          onCancel={() => setAdminPanel(null)}
                        />
                      </div>
                    )}
                    {(adminPanel.kind === 'lesson-create') && (
                      <LessonInlineForm
                        chapterId={adminPanel.chapterId}
                        lesson={null}
                        nextOrderIndex={(lessonsByChapter?.get(adminPanel.chapterId) ?? []).length}
                        onSuccess={() => { invalidateCourseContent(); setAdminPanel(null) }}
                        onCancel={() => setAdminPanel(null)}
                      />
                    )}
                    {(adminPanel.kind === 'lesson-edit') && (
                      <>
                        <LessonInlineForm
                          chapterId={adminPanel.chapterId}
                          lesson={adminPanel.lesson}
                          nextOrderIndex={(lessonsByChapter?.get(adminPanel.chapterId) ?? []).length}
                          onSuccess={() => { invalidateCourseContent(); setAdminPanel(null) }}
                          onCancel={() => setAdminPanel(null)}
                        />
                        <div className="px-6 pb-6">
                          <StudyMaterialsList
                            lessonId={adminPanel.lesson.id}
                            isAdmin
                            defaultGrade={toMaterialGrade(course?.target_grade)}
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : profile && (() => {
                  const chapterId = isAdmin && activeLessonId
                    ? chapters?.find(c => (lessonsByChapter?.get(c.id) ?? []).some(l => l.id === activeLessonId))?.id ?? ''
                    : ''
                  return (
                    <LessonContent
                      lesson={activeLesson}
                      isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                      submission={activeSubmission}
                      userId={profile.id}
                      courseId={courseId!}
                      isAdmin={isAdmin}
                      courseGrade={course?.target_grade}
                      onEdit={isAdmin && activeLesson ? () => setAdminPanel({ kind: 'lesson-edit', chapterId, lesson: activeLesson }) : undefined}
                      onDelete={isAdmin && activeLesson ? () => setDeletingLesson({ chapterId, lesson: activeLesson }) : undefined}
                    />
                  )
                })()}
              </div>
            </div>

            <div className="block lg:hidden h-[calc(100vh-80px)] flex flex-col border-t border-border overflow-hidden">
              <div className="px-4 pt-3 pb-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setDrawerOpen(true)}
                  className="min-h-[48px] gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                  aria-label="Mở danh sách bài học"
                >
                  <Menu className="h-4 w-4" />
                  Danh sách bài học
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto bg-white/80">
                {profile && (
                  <LessonContent
                    lesson={activeLesson}
                    isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                    submission={activeSubmission}
                    userId={profile.id}
                    courseId={courseId!}
                    isAdmin={isAdmin}
                    courseGrade={course?.target_grade}
                  />
                )}
              </div>

              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 flex flex-col">
                  <SheetHeader className="px-4 pt-4 pb-2 border-b border-border shrink-0">
                    <SheetTitle className="text-base font-bold text-[#0F172A]">
                      Danh sách bài học
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <LessonSidebar
                      {...sidebarShared}
                      onSelectLesson={(lesson) => {
                        setActiveLessonId(lesson.id)
                        setDrawerOpen(false)
                      }}
                      scrollable={false}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <>
            <div className="hidden lg:flex h-[calc(100vh-80px)] border-t border-border">
              <div className="w-[340px] shrink-0 bg-card/50 border-r border-indigo-200/60">
                <LessonSidebar
                  chapters={chapters}
                  lessonsByChapter={lessonsByChapter}
                  completedLessonIds={new Set()}
                  activeLessonId={null}
                  onSelectLesson={() => {}}
                  progress={0}
                />
              </div>
              <div className="flex-1 overflow-y-auto bg-transparent flex flex-col">
                <div className="flex-1 flex items-start justify-center px-8 pt-12 pb-8">
                  <Card className="bm-glass-card border-0 shadow-none w-full max-w-sm p-0">
                    <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-400 flex items-center justify-center">
                        <Lock className="h-7 w-7 text-indigo-500" aria-hidden="true" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold leading-snug text-[#0F172A]">{course?.title}</h2>
                        {course && (
                          <Badge className={GRADE_BADGE[course.target_grade].className}>
                            {GRADE_BADGE[course.target_grade].label}
                          </Badge>
                        )}
                      </div>
                      <Separator />
                      {isAuthenticated ? (
                        <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
                          <p className="font-medium text-foreground">Bạn chưa được đăng ký khóa học này.</p>
                          <p>Vui lòng liên hệ giảng viên để được đăng ký khóa học này.</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed">Đăng nhập để học và theo dõi tiến độ của bạn.</p>
                      )}
                      {!isAuthenticated && (
                        <Link to="/dang-nhap" className="w-full">
                          <Button className="bm-btn-cta w-full gap-1.5 min-h-[48px] cursor-pointer">
                            <LogIn className="h-4 w-4" />
                            Đăng nhập để học
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="block lg:hidden border-t border-border">
              <Tabs defaultValue="outline">
                <TabsList className="w-full h-12 rounded-none border-b bg-transparent p-0 gap-0">
                  <TabsTrigger
                    value="content"
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-bold cursor-pointer"
                  >
                    Nội dung
                  </TabsTrigger>
                  <TabsTrigger
                    value="outline"
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-bold cursor-pointer"
                  >
                    Mục lục
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="mt-0 bg-transparent">
                  <div className="flex flex-col items-center text-center px-6 pt-12 pb-8 gap-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-indigo-400 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-indigo-500" aria-hidden="true" />
                    </div>
                    {isAuthenticated ? (
                      <div className="text-sm text-muted-foreground leading-relaxed max-w-xs space-y-1">
                        <p className="font-medium text-foreground">Bạn chưa được đăng ký khóa học này.</p>
                        <p>Vui lòng liên hệ giảng viên để được đăng ký khóa học này.</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">Đăng nhập để học và theo dõi tiến độ của bạn.</p>
                    )}
                    {!isAuthenticated && (
                      <Link to="/dang-nhap">
                        <Button className="bm-btn-cta gap-1.5 min-h-[48px] cursor-pointer">
                          <LogIn className="h-4 w-4" />
                          Đăng nhập để học
                        </Button>
                      </Link>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="outline" className="mt-0">
                  <LessonSidebar
                    chapters={chapters}
                    lessonsByChapter={lessonsByChapter}
                    completedLessonIds={new Set()}
                    activeLessonId={null}
                    onSelectLesson={() => {}}
                    progress={0}
                    scrollable={false}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )
      )}

      {isAdmin && (
        <>
          <AlertDialog open={!!deletingChapter} onOpenChange={(open) => !open && setDeletingChapter(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa chuyên đề?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn xóa chuyên đề &quot;{deletingChapter?.title}&quot;? Toàn bộ bài học trong
                  chuyên đề sẽ bị xóa theo. Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  onClick={() => deletingChapter && deleteChapterMutation.mutate(deletingChapter.id)}
                  disabled={deleteChapterMutation.isPending}
                >
                  {deleteChapterMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={!!deletingLesson} onOpenChange={(open) => !open && setDeletingLesson(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa bài học</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn xóa bài học &quot;{deletingLesson?.lesson.title}&quot;? Hành động này không thể hoàn
                  tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  onClick={() => deletingLesson && deleteLessonMutation.mutate(deletingLesson)}
                  disabled={deleteLessonMutation.isPending}
                >
                  {deleteLessonMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  )

  if (isAuthenticated && isAdmin) {
    return (
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEndDnd}>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {pageContent}
        <CourseFormDialog
          open={courseFormOpen}
          course={course ?? null}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['course', courseSlug] })
            setCourseFormOpen(false)
          }}
          onClose={() => setCourseFormOpen(false)}
        />
        <AlertDialog open={courseDeleteConfirm} onOpenChange={(open) => !open && setCourseDeleteConfirm(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa khóa học?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa khóa học &quot;{course?.title}&quot;? Toàn bộ chuyên đề và bài học sẽ bị xóa theo. Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                onClick={() => deleteCourseMutation.mutate()}
                disabled={deleteCourseMutation.isPending}
              >
                {deleteCourseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      </DndContext>
    )
  }

  if (isAuthenticated && !isAdmin) {
    return <StudentLayout>{pageContent}</StudentLayout>
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen app-student bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <Header />
      <main>{pageContent}</main>
    </div>
  )
}
