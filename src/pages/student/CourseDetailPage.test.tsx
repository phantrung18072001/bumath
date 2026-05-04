import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock data
const mockCourse = { id: 'c1', title: 'Toán 7', slug: 'toan-7', target_grade: 'grade_7', description: 'Desc' }
const mockChapters = [{ id: 'ch1', title: 'Chương 1', course_id: 'c1', order_index: 0 }]
const mockLessons = [{ id: 'l1', title: 'Bài 1', chapter_id: 'ch1', order_index: 0, video_url: null, description: null, assignment_path: null }]

// Mocks
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'user-1' },
    profile: { id: 'user-1', role: 'student' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

vi.mock('@/lib/api/courses', () => ({
  fetchCourseBySlug: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/api/chapters', () => ({
  fetchChapters: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/lib/api/lessons', () => ({
  fetchLessons: vi.fn().mockResolvedValue([]),
  fetchLessonsForStudent: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/lib/api/lesson-progress', () => ({
  getLessonProgress: vi.fn().mockResolvedValue([]),
  getCourseProgress: vi.fn().mockReturnValue(0),
}))

vi.mock('@/lib/api/submissions', () => ({
  getSubmissions: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/lib/api/enrollments', () => ({
  getUserEnrollments: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/components/student/StudentLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}))

vi.mock('@/components/student/LessonSidebar', () => ({
  default: () => <div data-testid="sidebar-mock" />,
}))

vi.mock('@/components/student/LessonContent', () => ({
  default: () => <div data-testid="content-mock" />,
}))

describe('CourseDetailPage — Preview Mode', () => {
  async function renderCourseDetailPage(slug = 'toan-7') {
    const { default: CourseDetailPage } = await import('./CourseDetailPage')
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/khoa-hoc/:courseSlug" element={<CourseDetailPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>,
      { wrapper: ({ children }) => {
        window.history.pushState({}, '', `/khoa-hoc/${slug}`)
        return children
      }}
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows lock notice when not enrolled', async () => {
    const { fetchCourseBySlug } = await import('@/lib/api/courses')
    const { fetchChapters } = await import('@/lib/api/chapters')
    const { fetchLessonsForStudent } = await import('@/lib/api/lessons')
    const { getUserEnrollments } = await import('@/lib/api/enrollments')
    
    ;(fetchCourseBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(mockCourse)
    ;(fetchChapters as ReturnType<typeof vi.fn>).mockResolvedValue(mockChapters)
    ;(fetchLessonsForStudent as ReturnType<typeof vi.fn>).mockResolvedValue(mockLessons)
    ;(getUserEnrollments as ReturnType<typeof vi.fn>).mockResolvedValue([]) // Not enrolled

    await renderCourseDetailPage()
    await waitFor(() => {
      expect(screen.getByText('Bạn chưa được đăng ký khóa học này.')).toBeInTheDocument()
    })
  })

  it('shows contact CTA in preview mode', async () => {
    const { fetchCourseBySlug } = await import('@/lib/api/courses')
    const { fetchChapters } = await import('@/lib/api/chapters')
    const { fetchLessonsForStudent } = await import('@/lib/api/lessons')
    const { getUserEnrollments } = await import('@/lib/api/enrollments')
    
    ;(fetchCourseBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(mockCourse)
    ;(fetchChapters as ReturnType<typeof vi.fn>).mockResolvedValue(mockChapters)
    ;(fetchLessonsForStudent as ReturnType<typeof vi.fn>).mockResolvedValue(mockLessons)
    ;(getUserEnrollments as ReturnType<typeof vi.fn>).mockResolvedValue([])

    await renderCourseDetailPage()
    await waitFor(() => {
      expect(screen.getByText('Vui lòng liên hệ giảng viên để được đăng ký khóa học này.')).toBeInTheDocument()
    })
  })

  it('shows Lock icon next to lesson titles in preview mode', async () => {
    const { fetchCourseBySlug } = await import('@/lib/api/courses')
    const { fetchChapters } = await import('@/lib/api/chapters')
    const { fetchLessonsForStudent } = await import('@/lib/api/lessons')
    const { getUserEnrollments } = await import('@/lib/api/enrollments')
    
    ;(fetchCourseBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(mockCourse)
    ;(fetchChapters as ReturnType<typeof vi.fn>).mockResolvedValue(mockChapters)
    ;(fetchLessonsForStudent as ReturnType<typeof vi.fn>).mockResolvedValue(mockLessons)
    ;(getUserEnrollments as ReturnType<typeof vi.fn>).mockResolvedValue([])

    await renderCourseDetailPage()
    await waitFor(() => {
      // Lock icons should have aria-hidden="true" per UI-SPEC
      const lockIcons = document.querySelectorAll('[aria-hidden="true"]')
      expect(lockIcons.length).toBeGreaterThan(0)
    })
  })

  it('does NOT show preview mode when user is enrolled', async () => {
    const { fetchCourseBySlug } = await import('@/lib/api/courses')
    const { fetchChapters } = await import('@/lib/api/chapters')
    const { fetchLessonsForStudent } = await import('@/lib/api/lessons')
    const { getUserEnrollments } = await import('@/lib/api/enrollments')
    
    ;(fetchCourseBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(mockCourse)
    ;(fetchChapters as ReturnType<typeof vi.fn>).mockResolvedValue(mockChapters)
    ;(fetchLessonsForStudent as ReturnType<typeof vi.fn>).mockResolvedValue(mockLessons)
    ;(getUserEnrollments as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'e1', user_id: 'user-1', course_id: 'c1', enrolled_at: '2026-01-01' }
    ])

    await renderCourseDetailPage()
    await waitFor(() => {
      expect(screen.queryByText('Bạn chưa được đăng ký khóa học này.')).not.toBeInTheDocument()
    })
  })

  // Phase 13: Sheet drawer mobile (STUDENT-UI-02)
  it.todo('renders Sheet when mobile trigger button is clicked')
  it.todo('trigger button shows text "Danh sách bài học"')
  it.todo('Sheet opens from left side')

  // Phase 13: Claymorphism styling (DS-01)
  it.todo('preview mode card has bm-clay-card-student class')

  // Phase 13: Breakpoint changes
  it.todo('uses lg: breakpoint for desktop/mobile split (not md:)')
})
