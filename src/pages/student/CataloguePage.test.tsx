import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock data
const mockCourses = [
  { id: 'c1', title: 'Toán 7', slug: 'toan-7', target_grade: 'grade_7', description: 'Khóa Toán 7' },
  { id: 'c2', title: 'Toán 8', slug: 'toan-8', target_grade: 'grade_8', description: null },
]
const mockEnrollments = [
  { id: 'e1', user_id: 'user-1', course_id: 'c1', enrolled_at: '2026-01-01' },
]

// Mock IntersectionObserver (not available in jsdom)
const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'user-1' },
    profile: { id: 'user-1', role: 'student' },
    loading: false,
  }),
}))

vi.mock('@/lib/api/courses', () => ({
  fetchCoursesPaginated: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}))

vi.mock('@/lib/api/enrollments', () => ({
  getUserEnrollments: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/components/student/StudentLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}))

describe('CataloguePage', () => {
  async function renderCataloguePage() {
    const { default: CataloguePage } = await import('./CataloguePage')
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CataloguePage />
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page heading "Khám phá khóa học"', async () => {
    await renderCataloguePage()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Khám phá khóa học' })).toBeInTheDocument()
    })
  })

  it('renders subheading "Tất cả các khóa học đang có tại BuMath"', async () => {
    await renderCataloguePage()
    await waitFor(() => {
      expect(screen.getByText('Tất cả các khóa học đang có tại BuMath')).toBeInTheDocument()
    })
  })

  it('shows course cards with titles when courses exist', async () => {
    const { fetchCoursesPaginated } = await import('@/lib/api/courses')
    ;(fetchCoursesPaginated as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCourses, total: 2 })

    await renderCataloguePage()
    await waitFor(() => {
      expect(screen.getByText('Toán 7')).toBeInTheDocument()
      expect(screen.getByText('Toán 8')).toBeInTheDocument()
    })
  })

  it('shows "Đã đăng ký" badge for enrolled courses', async () => {
    const { fetchCoursesPaginated } = await import('@/lib/api/courses')
    const { getUserEnrollments } = await import('@/lib/api/enrollments')
    ;(fetchCoursesPaginated as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCourses, total: 2 })
    ;(getUserEnrollments as ReturnType<typeof vi.fn>).mockResolvedValue(mockEnrollments)

    await renderCataloguePage()
    await waitFor(() => {
      expect(screen.getByText('Đã đăng ký')).toBeInTheDocument()
    })
  })

  it('shows "Chưa đăng ký" badge for non-enrolled courses', async () => {
    const { fetchCoursesPaginated } = await import('@/lib/api/courses')
    const { getUserEnrollments } = await import('@/lib/api/enrollments')
    ;(fetchCoursesPaginated as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCourses, total: 2 })
    ;(getUserEnrollments as ReturnType<typeof vi.fn>).mockResolvedValue(mockEnrollments)

    await renderCataloguePage()
    await waitFor(() => {
      expect(screen.getByText('Chưa đăng ký')).toBeInTheDocument()
    })
  })

  it('shows empty state when no courses exist', async () => {
    const { fetchCoursesPaginated } = await import('@/lib/api/courses')
    ;(fetchCoursesPaginated as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], total: 0 })

    await renderCataloguePage()
    await waitFor(() => {
      expect(screen.getByText('Chưa có khóa học nào')).toBeInTheDocument()
    })
  })

  // Phase 13: Search filtering (STUDENT-UI-03)
  it.todo('filters courses by search query (case-insensitive)')
  it.todo('shows all courses when search is cleared')

  // Phase 13: Claymorphism card styling (DS-01)
  it.todo('course cards have bm-clay-card-student class')

  // Phase 13: Empty state when filtered (STUDENT-UI-04)
  it.todo('shows "Không tìm thấy kết quả" when search returns no results')
  it.todo('shows Search icon in filtered empty state')

  // Phase 13: Skeleton loading (DS-02)
  it.todo('renders Skeleton components during loading')
})
