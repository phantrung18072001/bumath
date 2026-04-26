import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import StudentLayout from '@/components/student/StudentLayout'
import LessonSidebar from '@/components/student/LessonSidebar'
import LessonContent from '@/components/student/LessonContent'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchChapters } from '@/lib/api/chapters'
import { fetchLessons, type Lesson } from '@/lib/api/lessons'
import { getLessonProgress, getCourseProgress } from '@/lib/api/lesson-progress'
import { getSubmissions } from '@/lib/api/submissions'

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { profile } = useAuth()
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

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
  const isLoading = chaptersLoading || lessonsLoading

  // Error state
  const hasError = chaptersError || lessonsError

  return (
    <StudentLayout>
      {hasError && (
        <div className="px-4 md:px-8 py-4">
          <Alert variant="destructive">
            <AlertDescription>
              Không thể tải khóa học. Vui lòng làm mới trang.
            </AlertDescription>
          </Alert>
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
        <div className="px-4 md:px-8 py-16 text-center">
          <h2 className="text-xl font-semibold mb-2">Khóa học chưa có bài giảng</h2>
          <p className="text-base text-muted-foreground">
            Giảng viên đang cập nhật nội dung. Vui lòng quay lại sau.
          </p>
        </div>
      )}

      {!isLoading && !hasError && chapters && chapters.length > 0 && lessonsByChapter && (
        <>
          {/* Desktop layout — fixed height = remaining viewport, no outer scroll */}
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
              <Link
                to="/courses"
                className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground px-8 pt-4 pb-2"
              >
                ← Khóa học của tôi
              </Link>
              <LessonContent
                lesson={activeLesson}
                isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                submission={activeSubmission}
                userId={profile!.id}
                courseId={courseId!}
              />
            </div>
          </div>

          {/* Mobile layout */}
          <div className="block md:hidden">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground px-4 pt-4 pb-2"
            >
              ← Khóa học của tôi
            </Link>
            <Tabs defaultValue="content">
              <TabsList className="w-full h-12">
                <TabsTrigger value="content" className="flex-1 min-h-[48px]">Nội dung</TabsTrigger>
                <TabsTrigger value="outline" className="flex-1 min-h-[48px]">Mục lục</TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <LessonContent
                  lesson={activeLesson}
                  isCompleted={completedLessonIds.has(activeLessonId ?? '')}
                  submission={activeSubmission}
                  userId={profile!.id}
                  courseId={courseId!}
                />
              </TabsContent>
              <TabsContent value="outline">
                <LessonSidebar
                  chapters={chapters}
                  lessonsByChapter={lessonsByChapter}
                  completedLessonIds={completedLessonIds}
                  activeLessonId={activeLessonId}
                  onSelectLesson={(lesson) => setActiveLessonId(lesson.id)}
                  progress={progress}
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </StudentLayout>
  )
}
