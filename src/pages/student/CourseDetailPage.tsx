import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Lock, LogIn, Menu } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import StudentLayout from '@/components/student/StudentLayout'
import Header from '@/components/landing/Header'
import LessonSidebar from '@/components/student/LessonSidebar'
import LessonContent from '@/components/student/LessonContent'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { fetchCourseBySlug } from '@/lib/api/courses'
import { fetchChapters } from '@/lib/api/chapters'
import { fetchLessons, type Lesson } from '@/lib/api/lessons'
import { getLessonProgress, getCourseProgress } from '@/lib/api/lesson-progress'
import { getSubmissions } from '@/lib/api/submissions'
import { getUserEnrollments } from '@/lib/api/enrollments'
import { GRADE_BADGE } from '@/lib/constants/grades'

export default function CourseDetailPage() {
  const { courseSlug } = useParams<{ courseSlug: string }>()
  const { user, profile, loading: authLoading } = useAuth()
  const isAuthenticated = !authLoading && !!user
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const lessonIdFromQuery = searchParams.get('lesson')

  const { data: course, isLoading: courseLoading, isError: courseError } = useQuery({
    queryKey: ['course', courseSlug],
    queryFn: () => fetchCourseBySlug(courseSlug!),
    enabled: !!courseSlug,
  })
  const courseId = course?.id

  // Query user's enrollments — only when authenticated
  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
  } = useQuery({
    queryKey: ['enrollments', profile?.id],
    queryFn: () => getUserEnrollments(profile!.id),
    enabled: isAuthenticated && !!profile?.id,
  })

  // Check if user is enrolled in this specific course
  const isEnrolled = isAuthenticated && !!enrollments?.some(e => e.course_id === courseId)

  // 1. Fetch chapters
  const {
    data: chapters,
    isLoading: chaptersLoading,
    isError: chaptersError,
  } = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => fetchChapters(courseId!),
    enabled: !!courseId,
  })

  // 2. Fetch lessons per chapter — returns Map<chapterId, Lesson[]>
  const {
    data: lessonsByChapter,
    isLoading: lessonsLoading,
    isError: lessonsError,
  } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const allLessons = await Promise.all(chapters!.map(c => fetchLessons(c.id)))
      return new Map<string, Lesson[]>(chapters!.map((c, i) => [c.id, allLessons[i]]))
    },
    enabled: !!chapters && chapters.length > 0,
  })

  // 3. Derive flat list of all lesson IDs
  const allLessons: Lesson[] = lessonsByChapter
    ? Array.from(lessonsByChapter.values()).flat()
    : []
  const allLessonIds = allLessons.map(l => l.id)

  // 4. Fetch lesson progress — only when authenticated
  const { data: progressData } = useQuery({
    queryKey: ['lesson-progress', courseId],
    queryFn: () => getLessonProgress(profile!.id, allLessonIds),
    enabled: isAuthenticated && !!profile?.id && allLessonIds.length > 0,
  })

  const completedLessonIds = new Set(progressData?.map(p => p.lesson_id) ?? [])

  // 5. Fetch submissions — only when authenticated
  const { data: submissionsData } = useQuery({
    queryKey: ['submissions', courseId],
    queryFn: () => getSubmissions(profile!.id, allLessonIds),
    enabled: isAuthenticated && !!profile?.id && allLessonIds.length > 0,
  })

  const submissionMap = new Map(submissionsData?.map(s => [s.lesson_id, s]) ?? [])

  // 6. Compute course progress
  const progress = getCourseProgress(allLessonIds, completedLessonIds)

  // 7. Auto-select first lesson
  useEffect(() => {
    if (!activeLessonId && chapters && lessonsByChapter) {
      const firstChapter = chapters[0]
      const firstLesson = lessonsByChapter.get(firstChapter?.id)?.[0]
      if (firstLesson) setActiveLessonId(firstLesson.id)
    }
  }, [chapters, lessonsByChapter, activeLessonId])

  // 7b. Auto-select lesson from ?lesson= query param (deep-link from bell notification)
  useEffect(() => {
    if (!lessonIdFromQuery || !allLessons.length) return
    const found = allLessons.find((l: Lesson) => l.id === lessonIdFromQuery)
    if (found) {
      setActiveLessonId(found.id)
      requestAnimationFrame(() => {
        document.getElementById(`lesson-${found.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }, [lessonIdFromQuery, allLessons.length])

  // 8. Derive active lesson and submission
  const activeLesson = allLessons.find(l => l.id === activeLessonId) ?? null
  const activeSubmission = activeLessonId ? submissionMap.get(activeLessonId) ?? null : null

  // Wait for BOTH enrollment and content queries before deciding mode
  const isLoading = authLoading || courseLoading || chaptersLoading || lessonsLoading ||
    (isAuthenticated && enrollmentsLoading)

  // Error state
  const hasError = courseError || chaptersError || lessonsError

  const backLink = (
    <Link
      to={isAuthenticated ? '/khoa-hoc' : '/danh-muc'}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {isAuthenticated ? 'Khóa học của tôi' : 'Danh mục khóa học'}
    </Link>
  )

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

      {!isLoading && !hasError && chapters && chapters.length === 0 && (
        <div className="px-4 lg:px-8 pt-4 pb-16 text-center">
          <div className="text-left mb-8">{backLink}</div>
          <h2 className="text-xl font-semibold mb-2">Khóa học chưa có bài giảng</h2>
          <p className="text-base text-muted-foreground">
            Giảng viên đang cập nhật nội dung. Vui lòng quay lại sau.
          </p>
        </div>
      )}

      {!isLoading && !hasError && chapters && chapters.length > 0 && lessonsByChapter && (
        isEnrolled ? (
          <>
            {/* Desktop layout — visible at lg and above */}
            <div className="hidden lg:flex h-[calc(100vh-80px)]">
              <div className="w-[340px] shrink-0 bg-white border-r border-[#F97316]/20">
                <LessonSidebar
                  chapters={chapters}
                  lessonsByChapter={lessonsByChapter}
                  completedLessonIds={completedLessonIds}
                  activeLessonId={activeLessonId}
                  onSelectLesson={(lesson) => setActiveLessonId(lesson.id)}
                  progress={progress}
                />
              </div>
              <div className="flex-1 overflow-y-auto bg-white">
                <LessonContent
                  lesson={activeLesson}
                  isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                  submission={activeSubmission}
                  userId={profile!.id}
                  courseId={courseId!}
                />
              </div>
            </div>

            {/* Mobile layout — visible below lg */}
            <div className="block lg:hidden">
              {/* Drawer trigger button */}
              <div className="px-4 pt-3 pb-2">
                <Button
                  variant="outline"
                  onClick={() => setDrawerOpen(true)}
                  className="min-h-[48px] gap-2 border-[#F97316] text-[#F97316] hover:bg-[#F3F0ED]"
                  aria-label="Mở danh sách bài học"
                >
                  <Menu className="h-4 w-4" />
                  Danh sách bài học
                </Button>
              </div>

              {/* Main content area */}
              <div className="overflow-y-auto bg-white">
                <LessonContent
                  lesson={activeLesson}
                  isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                  submission={activeSubmission}
                  userId={profile!.id}
                  courseId={courseId!}
                />
              </div>

              {/* Sheet drawer */}
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0">
                  <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
                    <SheetTitle className="text-base font-bold text-[#92400E]">
                      Danh sách bài học
                    </SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto h-[calc(100%-56px)]">
                    <LessonSidebar
                      chapters={chapters}
                      lessonsByChapter={lessonsByChapter}
                      completedLessonIds={completedLessonIds}
                      activeLessonId={activeLessonId}
                      onSelectLesson={(lesson) => {
                        setActiveLessonId(lesson.id)
                        setDrawerOpen(false)
                      }}
                      progress={progress}
                      scrollable={false}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          /* Preview mode — same layout, locked main content */
          <>
            {/* Desktop preview — visible at lg and above */}
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
                      {/* Lock icon in teal circle */}
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
                        <div className="text-sm text-muted-foreground leading-relaxed">
                          <p>Bạn chưa đăng ký khóa học này.</p>
                          <p>Vui lòng liên hệ giảng viên để được đăng ký khóa học này.</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed">Đăng nhập để học và theo dõi tiến độ của bạn.</p>
                      )}
                      {!isAuthenticated && (
                        <Link to="/dang-nhap" className="w-full">
                          <Button className="bm-btn-cta w-full gap-1.5 min-h-[48px]">
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

            {/* Mobile preview — visible below lg */}
            <div className="block lg:hidden">
              <Tabs defaultValue="outline">
                <TabsList className="w-full h-12 rounded-none border-b bg-transparent p-0 gap-0">
                  <TabsTrigger
                    value="content"
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#F97316] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-bold"
                  >
                    Nội dung
                  </TabsTrigger>
                  <TabsTrigger
                    value="outline"
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#F97316] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-bold"
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
                      <div className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                        <p>Bạn chưa đăng ký khóa học này.</p>
                        <p>Vui lòng liên hệ giảng viên để được đăng ký khóa học này.</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">Đăng nhập để học và theo dõi tiến độ của bạn.</p>
                    )}
                    {!isAuthenticated && (
                      <Link to="/dang-nhap">
                        <Button className="bm-btn-cta gap-1.5 min-h-[48px]">
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
    </>
  )

  if (isAuthenticated) {
    return <StudentLayout>{pageContent}</StudentLayout>
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{pageContent}</main>
    </div>
  )
}
