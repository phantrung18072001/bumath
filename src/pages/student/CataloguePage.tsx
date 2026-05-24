import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { fetchCoursesPaginated, Course } from '@/lib/api/courses'
import { getUserEnrollments } from '@/lib/api/enrollments'
import { GRADE_BADGE } from '@/lib/constants/grades'
import StudentLayout from '@/components/student/StudentLayout'
import Header from '@/components/landing/Header'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogIn, Search, BookOpen, Loader2, SlidersHorizontal, Sparkles, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const GRADE_FILTERS: { value: Course['target_grade'] | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn chuyên' },
]

function getCourseThumbnail(course: Course): string | null {
  const dynamic = course as Course & { image_url?: string | null; banner_url?: string | null }
  return course.thumbnail_url ?? dynamic.image_url ?? dynamic.banner_url ?? `https://picsum.photos/seed/${course.slug}/800/500`
}

export default function CataloguePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const isAuthenticated = !authLoading && !!user

  const [searchParams, setSearchParams] = useSearchParams()
  const activeGrade = searchParams.get('lop') ?? 'all'
  const setGrade = (g: string) => setSearchParams(g === 'all' ? {} : { lop: g })

  const [searchQuery, setSearchQuery] = useState('')
  const [tuTruOnly, setTuTruOnly] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeGrade !== 'advanced') setTuTruOnly(false)
  }, [activeGrade])

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

  const allCourses = data?.pages.flatMap(p => p.data) ?? []

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

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', profile?.id],
    queryFn: () => getUserEnrollments(profile!.id),
    enabled: isAuthenticated && !!profile?.id,
  })

  const enrolledCourseIds = useMemo(() => new Set(enrollments.map(e => e.course_id)), [enrollments])

  const filteredCourses = allCourses.filter(c => {
    const matchesGrade = activeGrade === 'all' || c.target_grade === activeGrade
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    const matchesTuTru = !tuTruOnly || c.is_outstanding === true
    return matchesGrade && matchesSearch && matchesTuTru
  })

  const content = (
    <div className="relative mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 md:py-8">
      <section className="border-b border-slate-200 pb-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Danh mục khóa học</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Khám phá khóa học</h1>
        <p className="mt-2 text-sm text-slate-600">Tất cả các khóa học đang có tại BuMath</p>
        {!isAuthenticated && !authLoading && (
          <div className="mt-5">
            <Link to="/dang-nhap">
              <Button className="h-10 rounded-xl bg-slate-900 px-4 text-sm text-white hover:bg-slate-800">
                <LogIn className="mr-2 h-4 w-4" />
                Đăng nhập để học
              </Button>
            </Link>
          </div>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-4 backdrop-blur-sm md:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              <Search className="h-3.5 w-3.5" />
              Tìm kiếm
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white pl-9 text-slate-900 focus-visible:border-sky-500 focus-visible:ring-sky-500"
                aria-label="Tìm kiếm khóa học"
              />
            </div>
          </label>

          <div className="space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Bộ lọc theo lớp
            </span>
            <div className="flex flex-wrap gap-2">
              {GRADE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setGrade(f.value)}
                  className={cn(
                    'min-h-[38px] rounded-full border px-4 text-sm font-medium transition-colors',
                    activeGrade === f.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeGrade === 'advanced' && (
          <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/80 p-3" aria-label="Lọc khóa học Tứ trụ trường chuyên">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm text-sky-900">
                <Sparkles className="h-4 w-4" />
                Bộ lọc nâng cao
              </span>
              {[{ value: false, label: 'Tất cả' }, { value: true, label: 'Tứ trụ' }].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setTuTruOnly(opt.value)}
                  className={cn(
                    'min-h-[36px] rounded-full px-4 text-sm font-medium transition-colors',
                    tuTruOnly === opt.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 hover:bg-slate-100'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {coursesError && <p className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-center text-rose-700">Không thể tải dữ liệu. Vui lòng thử lại.</p>}

      {coursesLoading && (
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      )}

      {!coursesLoading && !coursesError && allCourses.length > 0 && filteredCourses.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <Search className="h-10 w-10 text-slate-400" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-slate-900">{tuTruOnly ? 'Chưa có khóa học Tứ trụ' : 'Không tìm thấy kết quả'}</p>
          <p className="mt-2 max-w-md text-sm text-slate-600">{tuTruOnly ? 'Hãy liên hệ BuMath để được tư vấn lộ trình phù hợp.' : 'Thử thay đổi từ khóa hoặc chọn lớp khác.'}</p>
        </div>
      )}

      {!coursesLoading && !coursesError && allCourses.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <BookOpen className="h-10 w-10 text-slate-400" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">Chưa có khóa học nào</h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">Hiện tại chưa có khóa học nào. Vui lòng quay lại sau.</p>
        </div>
      )}

      {!coursesLoading && !coursesError && filteredCourses.length > 0 && (
        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = isAuthenticated && enrolledCourseIds.has(course.id)
            const gradeBadge = GRADE_BADGE[course.target_grade]
            const thumbnail = getCourseThumbnail(course)

            return (
              <Link key={course.id} to={`/khoa-hoc/${course.slug}`} className="group block">
                <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-slate-300">
                  <div className="relative h-40 w-full overflow-hidden border-b border-slate-100 bg-slate-100">
                    {thumbnail ? (
                      <img src={thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f8fafc,#e2e8f0)] text-slate-500">
                        <BookOpen className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <Badge className={gradeBadge.className}>{gradeBadge.label}</Badge>
                      {isAuthenticated && (isEnrolled ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Đã đăng ký</Badge> : <Badge variant="outline" className="border-slate-300 text-slate-600">Chưa đăng ký</Badge>)}
                    </div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-950">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{course.description ?? 'Khóa học đang được cập nhật mô tả chi tiết.'}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-950">
                      Xem chi tiết
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </article>
              </Link>
            )
          })}
        </section>
      )}

      <div ref={sentinelRef} className="h-px" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải thêm khóa học
          </div>
        </div>
      )}
    </div>
  )

  if (isAuthenticated) return <StudentLayout plainBackground>{content}</StudentLayout>

  if (authLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-slate-800" />
      </div>
    )
  }

  return (
    <div className="app-student min-h-[100dvh] bg-white">
      <Header />
      <main>{content}</main>
    </div>
  )
}
