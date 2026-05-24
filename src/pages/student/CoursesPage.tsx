import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserEnrollments } from '@/lib/api/enrollments'
import { fetchChapters } from '@/lib/api/chapters'
import { fetchLessonsForStudent } from '@/lib/api/lessons'
import { getLessonProgress, getCourseProgress } from '@/lib/api/lesson-progress'
import { GRADE_BADGE } from '@/lib/constants/grades'
import StudentLayout from '@/components/student/StudentLayout'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
          chapters.map(ch => fetchLessonsForStudent(ch.id))
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
  const getThumbnail = (slug: string) => `https://picsum.photos/seed/${slug}/800/500`

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-[1240px] p-4 md:p-8">
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-slate-950">Khóa học của tôi</h1>

        {/* Error state */}
        {enrollmentsError && (
          <p className="text-destructive text-center py-8">
            Không thể tải dữ liệu. Vui lòng thử lại.
          </p>
        )}

        {/* Loading state — skeleton cards */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[280px] rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !enrollmentsError && enrollments?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <BookOpen className="h-16 w-16 text-indigo-400" aria-hidden="true" />
            <h2 className="text-xl font-bold text-slate-800">Bạn chưa có khóa học nào</h2>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => {
              const course = enrollment.course
              const courseId = enrollment.course_id
              const progressData = progressMap?.get(courseId)
              const progress = progressData?.progress ?? 0
              const gradeBadge = GRADE_BADGE[course.target_grade]
              const thumbnail = getThumbnail(course.slug)

              return (
                <Link
                  key={enrollment.id}
                  to={`/khoa-hoc/${course.slug}`}
                  className="group block"
                >
                  <Card className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-slate-300">
                    <div className="h-36 w-full overflow-hidden border-b border-slate-100 bg-slate-100">
                      <img src={thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-bold leading-snug text-slate-800 mb-2">
                        {course.title}
                      </CardTitle>
                      <Badge className={`${gradeBadge.className} shrink-0 w-fit`}>
                        {gradeBadge.label}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between gap-3 p-4 pt-0">
                      {course.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mt-2">
                          {course.description}
                        </p>
                      ) : (
                        <div />
                      )}
                      <div className="mt-auto">
                        <Progress
                          value={progress}
                          className={cn('h-1.5 bg-slate-100')}
                          aria-label={`Tiến độ hoàn thành: ${progress}%`}
                        />
                        <span className="text-xs text-muted-foreground mt-1.5 block">
                          {progress}% hoàn thành
                        </span>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-950">
                          Vào học
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
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
