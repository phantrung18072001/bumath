import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import StudentLayout from '@/components/student/StudentLayout'
import LessonSidebar from '@/components/student/LessonSidebar'
import LessonContent from '@/components/student/LessonContent'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchCourseBySlug } from '@/lib/api/courses'
import { fetchChapters } from '@/lib/api/chapters'
import { fetchLessons, type Lesson } from '@/lib/api/lessons'
import { getLessonProgress, getCourseProgress } from '@/lib/api/lesson-progress'
import { getSubmissions } from '@/lib/api/submissions'

export default function CourseDetailPage() {
  const { courseSlug } = useParams<{ courseSlug: string }>()
  const { profile } = useAuth()
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  const { data: course, isLoading: courseLoading, isError: courseError } = useQuery({
    queryKey: ['course', courseSlug],
    queryFn: () => fetchCourseBySlug(courseSlug!),
    enabled: !!courseSlug,
  })
  const courseId = course?.id

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

  // 4. Fetch lesson progress
  const { data: progressData } = useQuery({
    queryKey: ['lesson-progress', courseId],
    queryFn: () => getLessonProgress(profile!.id, allLessonIds),
    enabled: !!profile?.id && allLessonIds.length > 0,
  })

  const completedLessonIds = new Set(progressData?.map(p => p.lesson_id) ?? [])

  // 5. Fetch submissions
  const { data: submissionsData } = useQuery({
    queryKey: ['submissions', courseId],
    queryFn: () => getSubmissions(profile!.id, allLessonIds),
    enabled: !!profile?.id && allLessonIds.length > 0,
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

  // 8. Derive active lesson and submission
  const activeLesson = allLessons.find(l => l.id === activeLessonId) ?? null
  const activeSubmission = activeLessonId ? submissionMap.get(activeLessonId) ?? null : null

  // Loading state
  const isLoading = courseLoading || chaptersLoading || lessonsLoading

  // Error state
  const hasError = courseError || chaptersError || lessonsError

  const backLink = (
    <Link
      to="/courses"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      Khóa học của tôi
    </Link>
  )

  return (
    <StudentLayout>
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
        <>
          {/* Desktop layout — viewport-filling, back link inside right panel */}
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

          {/* Mobile layout — page scrolls naturally */}
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
      )}
    </StudentLayout>
  )
}
