import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getUserEnrollments } from '@/lib/api/enrollments'
import { fetchChapters } from '@/lib/api/chapters'
import { fetchLessons } from '@/lib/api/lessons'
import { getLessonProgress, getCourseProgress } from '@/lib/api/lesson-progress'
import { GRADE_BADGE } from '@/lib/constants/grades'
import StudentLayout from '@/components/student/StudentLayout'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CoursesPage() {
  const { profile } = useAuth()

  // Fetch enrolled courses — enabled guard prevents flash before profile loads (Pitfall 6)
  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
  } = useQuery({
    queryKey: ['enrollments', profile?.id],
    queryFn: () => getUserEnrollments(profile!.id),
    enabled: !!profile?.id,
  })

  // Compute progress map for all enrolled courses
  const {
    data: progressMap,
    isLoading: progressLoading,
  } = useQuery({
    queryKey: ['course-progress', profile?.id, enrollments?.map(e => e.course_id)],
    queryFn: async () => {
      const map = new Map<string, { progress: number; totalLessons: number }>()
      if (!enrollments || !profile) return map

      for (const enrollment of enrollments) {
        const courseId = enrollment.course_id
        // Fetch all chapters for this course
        const chapters = await fetchChapters(courseId)

        // Fetch all lessons per chapter
        const lessonArrays = await Promise.all(
          chapters.map(ch => fetchLessons(ch.id))
        )
        const allLessons = lessonArrays.flat()
        const allLessonIds = allLessons.map(l => l.id)

        // Get completed lesson IDs for this student
        const completedRecords = await getLessonProgress(profile.id, allLessonIds)
        const completedSet = new Set(completedRecords.map(r => r.lesson_id))

        const progress = getCourseProgress(allLessonIds, completedSet)
        map.set(courseId, { progress, totalLessons: allLessons.length })
      }

      return map
    },
    enabled: !!enrollments && enrollments.length > 0,
  })

  const isLoading = enrollmentsLoading || progressLoading

  return (
    <StudentLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-semibold mb-6">Khóa học của tôi</h1>

        {/* Error state */}
        {enrollmentsError && (
          <Alert variant="destructive">
            <AlertDescription>
              Không thể tải khóa học. Vui lòng làm mới trang.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state — 4 skeleton cards */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !enrollmentsError && enrollments?.length === 0 && (
          <div className="flex justify-center">
            <Card className="max-w-md w-full p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Chưa có khóa học nào</h2>
              <p className="text-muted-foreground">
                Bạn chưa được gán vào khóa học nào. Vui lòng liên hệ giảng viên để được thêm vào khóa học.
              </p>
            </Card>
          </div>
        )}

        {/* Course grid */}
        {!isLoading && !enrollmentsError && enrollments && enrollments.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {enrollments.map((enrollment) => {
              const course = enrollment.course
              const courseId = enrollment.course_id
              const progressData = progressMap?.get(courseId)
              const progress = progressData?.progress ?? 0
              const gradeBadge = GRADE_BADGE[course.target_grade]

              return (
                <Link
                  key={enrollment.id}
                  to={`/courses/${course.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl font-semibold leading-snug">
                          {course.title}
                        </CardTitle>
                        <Badge className={gradeBadge.className}>
                          {gradeBadge.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <Progress
                        value={progress}
                        className="h-2 mt-2"
                        aria-label={`Tiến độ hoàn thành: ${progress}%`}
                      />
                      <span className="text-sm text-muted-foreground mt-1 block">
                        {progress}% hoàn thành
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
