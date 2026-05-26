import { Link } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { BookOpen, ArrowUpRight, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserEnrollmentsPaginated } from '@/lib/api/enrollments'
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
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

export default function CoursesPage() {
  const { profile } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 450)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const pageSize = 9

  const {
    data: enrollmentPages,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['enrollments', profile?.id, debouncedSearch],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getUserEnrollmentsPaginated({
      userId: profile!.id,
      page: pageParam,
      pageSize,
      search: debouncedSearch,
    }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0)
      if (loaded >= lastPage.total) return undefined
      return allPages.length + 1
    },
    enabled: !!profile?.id,
  })

  const enrollments = useMemo(
    () => (enrollmentPages?.pages.flatMap((page) => page.data) ?? []).filter((enrollment) => enrollment.course != null),
    [enrollmentPages],
  )
  const totalCount = enrollmentPages?.pages[0]?.total ?? 0

  const {
    data: progressMap,
    isLoading: progressLoading,
  } = useQuery({
    queryKey: ['course-progress', profile?.id, enrollments.map(e => e.course_id).join('|')],
    queryFn: async () => {
      const map = new Map<string, { progress: number; totalLessons: number }>()
      if (!profile || enrollments.length === 0) return map

      for (const enrollment of enrollments) {
        const courseId = enrollment.course_id
        const chapters = await fetchChapters(courseId)
        const lessonArrays = await Promise.all(chapters.map(ch => fetchLessonsForStudent(ch.id)))
        const allLessons = lessonArrays.flat()
        const allLessonIds = allLessons.map(l => l.id)
        const completedRecords = await getLessonProgress(profile.id, allLessonIds)
        const completedSet = new Set(completedRecords.map(r => r.lesson_id))
        const progress = getCourseProgress(allLessonIds, completedSet)
        map.set(courseId, { progress, totalLessons: allLessons.length })
      }

      return map
    },
    enabled: !!profile?.id && enrollments.length > 0,
  })

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage()
      },
      { rootMargin: '180px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, enrollments.length])

  const isLoading = enrollmentsLoading || progressLoading
  const getThumbnail = (slug: string) => `https://picsum.photos/seed/${slug}/800/500`

  return (
    <StudentLayout>
      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 md:py-8">
        <section className="border-b border-slate-200 pb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Khóa học của tôi</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Lộ trình đang học</h1>
          <p className="mt-2 text-sm text-slate-600">Danh sách các khóa học bạn đã đăng ký tại BuMath.</p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-4 backdrop-blur-sm md:p-5">
          <div className="max-w-xl">
            <label className="sr-only" htmlFor="my-course-search">Tìm kiếm khóa học</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="my-course-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc mô tả khóa học"
                className="h-11 rounded-xl border-slate-300 pl-9 focus-visible:border-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </section>

        {enrollmentsError && (
          <p className="text-destructive text-center py-8">
            Không thể tải dữ liệu. Vui lòng thử lại.
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 py-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[280px] rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && !enrollmentsError && totalCount === 0 && !debouncedSearch.trim() && (
          <div className="mt-8 flex flex-col items-center justify-center py-16 gap-4 text-center">
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

        {!isLoading && !enrollmentsError && totalCount === 0 && debouncedSearch.trim() && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-muted-foreground">
            Không tìm thấy kết quả phù hợp với từ khóa hiện tại.
          </div>
        )}

        {!isLoading && !enrollmentsError && enrollments.length > 0 && (
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        {!isLoading && !enrollmentsError && hasNextPage && (
          <div ref={loadMoreRef} className="h-8 w-full" aria-hidden="true" />
        )}

        {!isLoading && !enrollmentsError && isFetchingNextPage && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`load-more-skeleton-${i}`} className="h-[280px] rounded-xl" />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
