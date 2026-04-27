import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Lock, LogIn } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import StudentLayout from '@/components/student/StudentLayout'
import Header from '@/components/landing/Header'
import LessonSidebar from '@/components/student/LessonSidebar'
import LessonContent from '@/components/student/LessonContent'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
      to={isAuthenticated ? '/courses' : '/catalogue'}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {isAuthenticated ? 'Khóa học của tôi' : 'Danh mục khóa học'}
    </Link>
  )

  const pageContent = (
    <>
      {hasError && (
        <div className="px-4 md:px-8 py-4">
          <div className="mb-3">{backLink}</div>
          <Alert variant="destructive">
            <AlertDescription>
              Không thể tải khóa học. Vui lòng làm mới trang.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!isLoading && !hasError && !course && (
        <div className="px-4 md:px-8 pt-4 pb-16 text-center">
          <div className="text-left mb-8">{backLink}</div>
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy khóa học</h2>
          <p className="text-base text-muted-foreground">
            Khóa học này không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="px-4 md:px-8 pb-4 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && !hasError && chapters && chapters.length === 0 && (
        <div className="px-4 md:px-8 pt-4 pb-16 text-center">
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
            {/* Full mode — existing desktop layout */}
            <div className="hidden md:flex h-[calc(100vh-48px)]">
              <div className="w-[280px] shrink-0 bg-sidebar border-r border-sidebar-border">
                <LessonSidebar
                  chapters={chapters}
                  lessonsByChapter={lessonsByChapter}
                  completedLessonIds={completedLessonIds}
                  activeLessonId={activeLessonId}
                  onSelectLesson={(lesson) => setActiveLessonId(lesson.id)}
                  progress={progress}
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="px-8 pt-4 pb-1">{backLink}</div>
                <LessonContent
                  lesson={activeLesson}
                  isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                  submission={activeSubmission}
                  userId={profile!.id}
                  courseId={courseId!}
                />
              </div>
            </div>

            {/* Full mode — existing mobile layout */}
            <div className="block md:hidden">
              <div className="px-4 pt-4 pb-1">{backLink}</div>
              <Tabs defaultValue="content">
                <TabsList className="w-full h-12 rounded-none border-b bg-transparent p-0 gap-0">
                  <TabsTrigger
                    value="content"
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium"
                  >
                    Nội dung
                  </TabsTrigger>
                  <TabsTrigger
                    value="outline"
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium"
                  >
                    Mục lục
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="mt-0">
                  <LessonContent
                    lesson={activeLesson}
                    isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                    submission={activeSubmission}
                    userId={profile!.id}
                    courseId={courseId!}
                  />
                </TabsContent>
                <TabsContent value="outline" className="mt-0">
                  <LessonSidebar
                    chapters={chapters}
                    lessonsByChapter={lessonsByChapter}
                    completedLessonIds={completedLessonIds}
                    activeLessonId={activeLessonId}
                    onSelectLesson={(lesson) => { setActiveLessonId(lesson.id) }}
                    progress={progress}
                    scrollable={false}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          /* Preview mode — non-enrolled or unauthenticated users */
          <div className="px-4 md:px-8 py-4 max-w-3xl">
            <div className="mb-4">{backLink}</div>

            {/* Course header */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-2xl font-semibold">{course?.title}</h1>
                {course && (
                  <Badge className={GRADE_BADGE[course.target_grade].className}>
                    {GRADE_BADGE[course.target_grade].label}
                  </Badge>
                )}
              </div>
              {course?.description && (
                <p className="text-muted-foreground text-sm">{course.description}</p>
              )}
            </div>

            {/* Lock / CTA banner */}
            <div className="bg-muted border border-border rounded-lg p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  {isAuthenticated
                    ? 'Bạn chưa đăng ký khóa học này.'
                    : 'Đăng nhập để học và theo dõi tiến độ của bạn.'}
                </p>
              </div>
              {!isAuthenticated && (
                <Link to="/login">
                  <Button size="sm" className="gap-1.5 shrink-0">
                    <LogIn className="h-4 w-4" />
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>

            {/* Chapter/lesson TOC */}
            {chapters.map(chapter => (
              <div key={chapter.id} className="border rounded-lg p-4 mb-4">
                <h3 className="text-base font-semibold mb-2">{chapter.title}</h3>
                <ul>
                  {(lessonsByChapter.get(chapter.id) ?? []).map(lesson => (
                    <li key={lesson.id} className="flex items-center gap-2 py-2 border-t border-border/50 first:border-t-0">
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">{lesson.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact CTA — only for authenticated non-enrolled */}
            {isAuthenticated && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Vui lòng liên hệ giảng viên để được đăng ký khóa học này.
                </p>
              </div>
            )}
          </div>
        )
      )}
    </>
  )

  if (isAuthenticated) {
    return <StudentLayout>{pageContent}</StudentLayout>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{pageContent}</main>
    </div>
  )
}
