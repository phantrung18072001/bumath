import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Lock, LogIn, Menu, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import StudentLayout from '@/components/student/StudentLayout'
import Header from '@/components/landing/Header'
import LessonSidebar from '@/components/student/LessonSidebar'
import LessonContent from '@/components/student/LessonContent'
import ChapterInlineForm from '@/components/admin/ChapterInlineForm'
import LessonInlineForm from '@/components/admin/LessonInlineForm'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
import { fetchCourseBySlug } from '@/lib/api/courses'
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
  deleteAssignment,
  type Lesson,
} from '@/lib/api/lessons'
import { getLessonProgress, getCourseProgress } from '@/lib/api/lesson-progress'
import { getSubmissions } from '@/lib/api/submissions'
import { getUserEnrollments } from '@/lib/api/enrollments'
import { GRADE_BADGE } from '@/lib/constants/grades'
import { toast } from 'sonner'

type AdminPanelState =
  | null
  | { kind: 'chapter-create' }
  | { kind: 'chapter-edit'; chapter: Chapter }
  | { kind: 'lesson-create'; chapterId: string }
  | { kind: 'lesson-edit'; chapterId: string; lesson: Lesson }

export default function CourseDetailPage({ isAdmin = false }: { isAdmin?: boolean }) {
  const { courseSlug } = useParams<{ courseSlug: string }>()
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

  const isLoading = authLoading || courseLoading || chaptersLoading || lessonsLoading ||
    (isAuthenticated && !isAdmin && enrollmentsLoading)

  const hasError = courseError || chaptersError || lessonsError

  function invalidateCourseContent() {
    if (!courseId) return
    queryClient.invalidateQueries({ queryKey: ['chapters', courseId] })
    queryClient.invalidateQueries({ queryKey: ['lessons', courseId, 'admin'] })
    queryClient.invalidateQueries({ queryKey: ['lessons', courseId, 'student'] })
  }

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

  const backLink = (
    <Link
      to={isAdmin ? '/quan-tri/khoa-hoc' : isAuthenticated ? '/khoa-hoc' : '/danh-muc'}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {isAdmin ? 'Quản lý khóa học' : isAuthenticated ? 'Khóa học của tôi' : 'Danh mục khóa học'}
    </Link>
  )

  function renderAdminInlineForm() {
    if (!isAdmin || !courseId || !chapters) return null
    if (adminPanel?.kind === 'chapter-create') {
      return (
        <div className="px-3 pb-3 shrink-0 border-b border-[#F97316]/15">
          <ChapterInlineForm
            courseId={courseId}
            chapter={null}
            nextOrderIndex={chapters.length}
            onSuccess={() => {
              invalidateCourseContent()
              setAdminPanel(null)
            }}
            onCancel={() => setAdminPanel(null)}
          />
        </div>
      )
    }
    if (adminPanel?.kind === 'chapter-edit') {
      return (
        <div className="px-3 pb-3 shrink-0 border-b border-[#F97316]/15">
          <ChapterInlineForm
            courseId={courseId}
            chapter={adminPanel.chapter}
            nextOrderIndex={chapters.length}
            onSuccess={() => {
              invalidateCourseContent()
              setAdminPanel(null)
            }}
            onCancel={() => setAdminPanel(null)}
          />
        </div>
      )
    }
    if (adminPanel?.kind === 'lesson-create') {
      const list = lessonsByChapter?.get(adminPanel.chapterId) ?? []
      return (
        <div className="px-3 pb-3 shrink-0 border-b border-[#F97316]/15 max-h-[60vh] overflow-y-auto">
          <LessonInlineForm
            chapterId={adminPanel.chapterId}
            lesson={null}
            nextOrderIndex={list.length}
            onSuccess={() => {
              invalidateCourseContent()
              setAdminPanel(null)
            }}
            onCancel={() => setAdminPanel(null)}
          />
        </div>
      )
    }
    if (adminPanel?.kind === 'lesson-edit') {
      const list = lessonsByChapter?.get(adminPanel.chapterId) ?? []
      return (
        <div className="px-3 pb-3 shrink-0 border-b border-[#F97316]/15 max-h-[60vh] overflow-y-auto">
          <LessonInlineForm
            chapterId={adminPanel.chapterId}
            lesson={adminPanel.lesson}
            nextOrderIndex={list.length}
            onSuccess={() => {
              invalidateCourseContent()
              setAdminPanel(null)
            }}
            onCancel={() => setAdminPanel(null)}
          />
        </div>
      )
    }
    return null
  }

  const sidebarShared = isAdmin && chapters && lessonsByChapter
    ? {
        chapters,
        lessonsByChapter,
        completedLessonIds,
        activeLessonId,
        onSelectLesson: (lesson: Lesson) => setActiveLessonId(lesson.id),
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
          {adminPanel?.kind === 'chapter-create' ? (
            <ChapterInlineForm
              courseId={courseId}
              chapter={null}
              nextOrderIndex={0}
              onSuccess={() => {
                invalidateCourseContent()
                setAdminPanel(null)
              }}
              onCancel={() => setAdminPanel(null)}
            />
          ) : (
            <Button type="button" className="cursor-pointer min-h-[48px]" onClick={() => setAdminPanel({ kind: 'chapter-create' })}>
              Thêm chuyên đề
            </Button>
          )}
        </div>
      )}

      {!isLoading && !hasError && chapters && chapters.length > 0 && lessonsByChapter && (
        isEnrolled ? (
          <>
            <div className="hidden lg:flex h-[calc(100vh-80px)]">
              <div className="w-[340px] shrink-0 bg-white border-r border-[#F97316]/20 flex flex-col">
                {renderAdminInlineForm()}
                <div className="flex-1 min-h-0 flex flex-col">
                  <LessonSidebar
                    {...sidebarShared}
                    scrollable
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white">
                {profile && (
                  <LessonContent
                    lesson={activeLesson}
                    isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                    submission={activeSubmission}
                    userId={profile.id}
                    courseId={courseId!}
                  />
                )}
              </div>
            </div>

            <div className="block lg:hidden">
              <div className="px-4 pt-3 pb-2">
                <Button
                  variant="outline"
                  onClick={() => setDrawerOpen(true)}
                  className="min-h-[48px] gap-2 border-[#F97316] text-[#F97316] hover:bg-[#F3F0ED] cursor-pointer"
                  aria-label="Mở danh sách bài học"
                >
                  <Menu className="h-4 w-4" />
                  Danh sách bài học
                </Button>
              </div>

              <div className="overflow-y-auto bg-white">
                {profile && (
                  <LessonContent
                    lesson={activeLesson}
                    isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                    submission={activeSubmission}
                    userId={profile.id}
                    courseId={courseId!}
                  />
                )}
              </div>

              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 flex flex-col">
                  <SheetHeader className="px-4 pt-4 pb-2 border-b border-border shrink-0">
                    <SheetTitle className="text-base font-bold text-[#92400E]">
                      Danh sách bài học
                    </SheetTitle>
                  </SheetHeader>
                  {isAdmin && <div className="shrink-0 overflow-y-auto max-h-[45vh]">{renderAdminInlineForm()}</div>}
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
            <div className="hidden lg:flex h-[calc(100vh-80px)]">
              <div className="w-[340px] shrink-0 bg-white border-r border-[#F97316]/20">
                <LessonSidebar
                  chapters={chapters}
                  lessonsByChapter={lessonsByChapter}
                  completedLessonIds={new Set()}
                  activeLessonId={null}
                  onSelectLesson={() => {}}
                  progress={0}
                />
              </div>
              <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                <div className="flex-1 flex items-start justify-center px-8 pt-12 pb-8">
                  <Card className="bm-clay-card-student border-0 shadow-none w-full max-w-sm p-0">
                    <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#FFEDD5] border-2 border-[#F97316] flex items-center justify-center">
                        <Lock className="h-7 w-7 text-[#F97316]" aria-hidden="true" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold leading-snug text-[#92400E]">{course?.title}</h2>
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

            <div className="block lg:hidden">
              <Tabs defaultValue="outline">
                <TabsList className="w-full h-12 rounded-none border-b bg-transparent p-0 gap-0">
                  <TabsTrigger
                    value="content"
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#F97316] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-bold cursor-pointer"
                  >
                    Nội dung
                  </TabsTrigger>
                  <TabsTrigger
                    value="outline"
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#F97316] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-bold cursor-pointer"
                  >
                    Mục lục
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="mt-0 bg-white">
                  <div className="flex flex-col items-center text-center px-6 pt-12 pb-8 gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#FFEDD5] border-2 border-[#F97316] flex items-center justify-center">
                      <Lock className="h-6 w-6 text-[#F97316]" aria-hidden="true" />
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
      <div className="w-[calc(100%+3rem)] max-w-none -mx-6 -my-8 min-h-[calc(100vh-80px)] flex flex-col">
        <div className="px-4 pt-3 pb-2 border-b border-border shrink-0 bg-background/80">
          {backLink}
        </div>
        <div className="flex-1 min-h-0">{pageContent}</div>
      </div>
    )
  }

  if (isAuthenticated && !isAdmin) {
    return <StudentLayout>{pageContent}</StudentLayout>
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{pageContent}</main>
    </div>
  )
}
