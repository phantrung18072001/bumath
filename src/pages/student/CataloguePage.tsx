import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { fetchAllCourses, Course } from '@/lib/api/courses'
import { getUserEnrollments } from '@/lib/api/enrollments'
import { GRADE_BADGE } from '@/lib/constants/grades'
import StudentLayout from '@/components/student/StudentLayout'
import Header from '@/components/landing/Header'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'

const GRADE_FILTERS: { value: Course['target_grade'] | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn chuyên' },
]

export default function CataloguePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const isAuthenticated = !authLoading && !!user
  const [searchParams, setSearchParams] = useSearchParams()
  const activeGrade = (searchParams.get('grade') ?? 'all') as Course['target_grade'] | 'all'

  // Always fetch all courses — works for both anon and authenticated users
  const {
    data: allCourses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: fetchAllCourses,
    enabled: !authLoading,
  })

  // Fetch enrollments only when authenticated
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', profile?.id],
    queryFn: () => getUserEnrollments(profile!.id),
    enabled: isAuthenticated && !!profile?.id,
  })

  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id))
  const isLoading = authLoading || coursesLoading || (isAuthenticated && enrollmentsLoading)

  const filteredCourses = activeGrade === 'all'
    ? allCourses
    : allCourses.filter(c => c.target_grade === activeGrade)

  function setGrade(grade: Course['target_grade'] | 'all') {
    if (grade === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ grade })
    }
  }

  const content = (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Khám phá khóa học</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tất cả các khóa học đang có tại BuMath
          </p>
        </div>
        {!isAuthenticated && !authLoading && (
          <Link to="/login">
            <Button size="sm" className="gap-1.5 shrink-0">
              <LogIn className="h-4 w-4" />
              Đăng nhập để học
            </Button>
          </Link>
        )}
      </div>

      {/* Grade filter tabs */}
      <div className="flex flex-wrap gap-2 mt-5 mb-6">
        {GRADE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setGrade(f.value)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors border',
              activeGrade === f.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

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
      {!isLoading && !coursesError && filteredCourses.length === 0 && (
        <div className="flex justify-center">
          <Card className="max-w-md w-full p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Chưa có khóa học nào</h2>
            <p className="text-muted-foreground text-sm">
              {activeGrade === 'all'
                ? 'Hiện tại chưa có khóa học nào. Vui lòng quay lại sau.'
                : `Chưa có khóa học nào cho ${GRADE_FILTERS.find(f => f.value === activeGrade)?.label}.`}
            </p>
          </Card>
        </div>
      )}

      {/* Course grid */}
      {!isLoading && !coursesError && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredCourses.map((course) => {
            const isEnrolled = isAuthenticated && enrolledCourseIds.has(course.id)
            const gradeBadge = GRADE_BADGE[course.target_grade]
            const courseLink = isAuthenticated ? `/courses/${course.slug}` : '/login'

            return (
              <Link
                key={course.id}
                to={courseLink}
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
                        {isAuthenticated && (
                          isEnrolled ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Đã đăng ký
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Chưa đăng ký
                            </Badge>
                          )
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
  )

  if (isAuthenticated) {
    return <StudentLayout>{content}</StudentLayout>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{content}</main>
    </div>
  )
}
