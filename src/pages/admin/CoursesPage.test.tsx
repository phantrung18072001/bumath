import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest'
import CoursesPage from './CoursesPage'
import { fetchCourses, deleteCourse, publishCourse } from '@/lib/api/courses'

// --- Mock data ---

const defaultCourses = [
  {
    id: 'course-1',
    title: 'Toán lớp 7 nâng cao',
    slug: 'toan-lop-7-nang-cao',
    description: 'Khóa học toán cho học sinh lớp 7',
    target_grade: 'grade_7' as const,
    is_published: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'course-2',
    title: 'Ôn thi chuyên toán',
    slug: 'on-thi-chuyen-toan',
    description: 'Luyện đề thi vào chuyên',
    target_grade: 'advanced' as const,
    is_published: false,
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
]

// --- Mocks ---

vi.mock('@/lib/api/courses', () => ({
  fetchCourses: vi.fn(),
  deleteCourse: vi.fn(),
  publishCourse: vi.fn(),
}))

vi.mock('@/components/admin/CourseFormDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="course-dialog" /> : null,
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

// --- Helpers ---

function renderCoursesPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CoursesPage />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetchCourses).mockResolvedValue(defaultCourses)
  vi.mocked(deleteCourse).mockResolvedValue(undefined)
  vi.mocked(publishCourse).mockResolvedValue(undefined)
})

// --- Tests ---

describe('CoursesPage', () => {
  it('renders the page heading "Quản lý khóa học"', async () => {
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Quản lý khóa học')).toBeInTheDocument()
    })
  })

  it('renders course rows from mocked data', async () => {
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Toán lớp 7 nâng cao')).toBeInTheDocument()
      expect(screen.getByText('Ôn thi chuyên toán')).toBeInTheDocument()
    })
  })

  it('renders GradeBadge for grade_7', async () => {
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Lớp 7')).toBeInTheDocument()
    })
  })

  it('shows empty state with CTA when no courses exist', async () => {
    vi.mocked(fetchCourses).mockResolvedValue([])
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Chưa có khóa học nào')).toBeInTheDocument()
      expect(screen.getByText(/Nhấn "Tạo khóa học" để bắt đầu/)).toBeInTheDocument()
    })
  })

  it('shows skeleton loading during fetch', async () => {
    vi.mocked(fetchCourses).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    renderCoursesPage()
    expect(screen.getByLabelText('Đang tải...')).toBeInTheDocument()
  })

  // Stub tests for Phase 11 features (will fail until implemented)
  it.skip('filters courses by grade when filter changes', async () => {
    // TODO: Implement after Plan 02
  })

  it.skip('filters courses by title search', async () => {
    // TODO: Implement after Plan 02
  })

  it.skip('shows only 20 courses per page', async () => {
    // TODO: Implement after Plan 02
  })

  it.skip('shows filtered empty state when search returns zero', async () => {
    // TODO: Implement after Plan 02
  })
})
