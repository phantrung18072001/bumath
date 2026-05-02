import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
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
import { Button } from '@/components/ui/button'

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
        <h1 className="text-2xl font-bold mb-6 text-[#134E4A]">Khóa học của tôi</h1>

        {/* Error state */}
        {enrollmentsError && (
          <p className="text-destructive text-center py-8">
            Không thể tải dữ liệu. Vui lòng thử lại.
          </p>
        )}

        {/* Loading state — 4 skeleton cards */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-3xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !enrollmentsError && enrollments?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <BookOpen className="h-16 w-16 text-[#0D9488]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#134E4A]">Bạn chưa có khóa học nào</h2>
            <p className="text-base text-muted-foreground max-w-sm">
              Liên hệ giảng viên để được thêm vào khóa học, hoặc khám phá danh mục.
            </p>
            <Link to="/danh-muc">
              <Button className="bm-btn-cta min-h-[48px] px-6">
                Khám phá khóa học
              </Button>
            </Link>
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
                  to={`/khoa-hoc/${course.slug}`}
                  className="block"
                >
                  <Card className="bm-clay-card-student border-0 shadow-none p-0 overflow-hidden h-full">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl font-bold leading-snug text-[#134E4A]">
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
                        className="h-3 mt-2 bg-[#CCFBF1] bm-progress-teal"
                        aria-label={`Tiến độ hoàn thành: ${progress}%`}
                      />
                      <span className="text-sm text-muted-foreground mt-2 block">
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
