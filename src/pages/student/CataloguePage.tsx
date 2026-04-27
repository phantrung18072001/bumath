import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { fetchAllCourses } from '@/lib/api/courses'
import { getUserEnrollments } from '@/lib/api/enrollments'
import { GRADE_BADGE } from '@/lib/constants/grades'
import StudentLayout from '@/components/student/StudentLayout'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CataloguePage() {
  const { profile } = useAuth()

  // Fetch all courses
  const {
    data: allCourses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: fetchAllCourses,
    enabled: !!profile?.id,
  })

  // Fetch user's enrollments to determine enrolled status
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', profile?.id],
    queryFn: () => getUserEnrollments(profile!.id),
    enabled: !!profile?.id,
  })

  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id))
  const isLoading = coursesLoading || enrollmentsLoading

  return (
    <StudentLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-semibold mb-2">Khám phá khóa học</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Tất cả các khóa học đang có tại BuMath
        </p>

        {/* Error state */}
        {coursesError && (
          <Alert variant="destructive">
            <AlertDescription>
              Không thể tải danh sách khóa học. Vui lòng làm mới trang.
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
        {!isLoading && !coursesError && allCourses.length === 0 && (
          <div className="flex justify-center">
            <Card className="max-w-md w-full p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Chưa có khóa học nào</h2>
              <p className="text-muted-foreground text-sm">
                Hiện tại chưa có khóa học nào. Vui lòng quay lại sau.
              </p>
            </Card>
          </div>
        )}

        {/* Course grid */}
        {!isLoading && !coursesError && allCourses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {allCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course.id)
              const gradeBadge = GRADE_BADGE[course.target_grade]

              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl font-semibold leading-snug">
                          {course.title}
                        </CardTitle>
                        <div className="flex flex-col gap-1 items-end shrink-0">
                          <Badge className={gradeBadge.className}>
                            {gradeBadge.label}
                          </Badge>
                          {isEnrolled ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Đã đăng ký
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Chưa đăng ký
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      )}
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
