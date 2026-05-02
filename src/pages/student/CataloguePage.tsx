import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { fetchCoursesPaginated, Course } from '@/lib/api/courses'
import { getUserEnrollments } from '@/lib/api/enrollments'
import { GRADE_BADGE } from '@/lib/constants/grades'
import StudentLayout from '@/components/student/StudentLayout'
import Header from '@/components/landing/Header'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogIn, Search, BookOpen } from 'lucide-react'

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
  const activeGrade = searchParams.get('lop') ?? 'all'
  const setGrade = (g: string) => setSearchParams(g === 'all' ? {} : { lop: g })

  const [searchQuery, setSearchQuery] = useState('')
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Infinite scroll pagination for all published courses
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: coursesLoading,
    isError: coursesError,
  } = useInfiniteQuery({
    queryKey: ['catalogue-courses'],
    queryFn: ({ pageParam = 1 }) =>
      fetchCoursesPaginated({ page: pageParam as number, pageSize: 12, grade: 'all', search: '' }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.length === 12 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: !authLoading,
  })

  // Flatten all loaded pages
  const allCourses = data?.pages.flatMap(p => p.data) ?? []

  // IntersectionObserver triggers fetchNextPage at scroll bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Fetch enrollments only when authenticated
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', profile?.id],
    queryFn: () => getUserEnrollments(profile!.id),
    enabled: isAuthenticated && !!profile?.id,
  })

  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id))

  // Client-side filter: grade AND search query
  const filteredCourses = allCourses.filter(c => {
    const matchesGrade = activeGrade === 'all' || c.target_grade === activeGrade
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    return matchesGrade && matchesSearch
  })

  const content = (
    <div className="p-8 md:p-10">
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#92400E]">Khám phá khóa học</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tất cả các khóa học đang có tại BuMath
          </p>
        </div>
        {!isAuthenticated && !authLoading && (
          <Link to="/dang-nhap">
            <Button className="bm-btn-cta gap-1.5 shrink-0 min-h-[48px]">
              <LogIn className="h-4 w-4" />
              Đăng nhập để học
            </Button>
          </Link>
        )}
      </div>

      {/* Search bar — half width */}
      <div className="relative mt-4 mb-3 w-1/2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm khóa học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 min-h-[48px] rounded-xl border-[#F97316] focus-visible:ring-[#F97316]"
          aria-label="Tìm kiếm khóa học"
        />
      </div>

      {/* Grade filter pills */}
      <div className="flex flex-wrap gap-2 mt-3 mb-6">
        {GRADE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setGrade(f.value)}
            className={[
              'rounded-full px-4 py-2 text-sm font-bold transition-colors duration-150 cursor-pointer min-h-[44px] border',
              activeGrade === f.value
                ? 'bg-[#F97316] text-white border-[#F97316]'
                : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {coursesError && (
        <p className="text-destructive text-center py-8">
          Không thể tải dữ liệu. Vui lòng thử lại.
        </p>
      )}

      {/* Loading state — 4-col on lg */}
      {coursesLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty state — filtered zero results (D-18) */}
      {!coursesLoading && !coursesError && allCourses.length > 0 && filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Search className="h-16 w-16 text-[#F97316]" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[#92400E]">Không tìm thấy kết quả</h2>
          <p className="text-base text-muted-foreground max-w-sm">
            Thử thay đổi từ khóa hoặc chọn lớp khác.
          </p>
        </div>
      )}

      {/* Empty state — no courses at all */}
      {!coursesLoading && !coursesError && allCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <BookOpen className="h-16 w-16 text-[#F97316]" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[#92400E]">Chưa có khóa học nào</h2>
          <p className="text-base text-muted-foreground max-w-sm">
            Hiện tại chưa có khóa học nào. Vui lòng quay lại sau.
          </p>
        </div>
      )}

      {/* Course grid — 3 columns on lg */}
      {!coursesLoading && !coursesError && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredCourses.map((course) => {
            const isEnrolled = isAuthenticated && enrolledCourseIds.has(course.id)
            const gradeBadge = GRADE_BADGE[course.target_grade]

            return (
              <Link
                key={course.id}
                to={`/khoa-hoc/${course.slug}`}
                className="block"
              >
                <Card className="bm-clay-card-student border-0 shadow-none p-0 h-full min-h-[200px] overflow-hidden flex flex-col">
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-base font-bold leading-snug text-[#92400E] mb-2">
                      {course.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1">
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
                  </CardHeader>
                  <CardContent className="p-5 pt-0 flex-1">
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mt-2">
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

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-px" />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <Skeleton key={i} className="h-2 w-2 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (isAuthenticated) {
    return <StudentLayout>{content}</StudentLayout>
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{content}</main>
    </div>
  )
}
