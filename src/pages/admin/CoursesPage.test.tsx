import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CoursesPage from './CoursesPage'
import { fetchCoursesPaginated, deleteCourse, publishCourse } from '@/lib/api/courses'

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
  fetchCoursesPaginated: vi.fn(),
  deleteCourse: vi.fn(),
  publishCourse: vi.fn(),
  insertCourse: vi.fn(),
  updateCourse: vi.fn(),
}))

vi.mock('@/components/admin/CourseFormDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="course-dialog" /> : null,
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

// --- Helpers ---

function setupMock(courses = defaultCourses) {
  vi.mocked(fetchCoursesPaginated).mockImplementation(({ grade, search, page, pageSize }) => {
    let filtered = courses
    if (grade !== 'all') filtered = filtered.filter(c => c.target_grade === grade)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(c => c.title.toLowerCase().includes(q))
    }
    const total = filtered.length
    const start = (page - 1) * pageSize
    return Promise.resolve({ data: filtered.slice(start, start + pageSize), total })
  })
}

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
  setupMock()
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
    setupMock([])
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Chưa có khóa học nào')).toBeInTheDocument()
      expect(screen.getByText(/Nhấn "Tạo khóa học" để bắt đầu/)).toBeInTheDocument()
    })
  })

  it('shows skeleton loading during fetch', async () => {
    vi.mocked(fetchCoursesPaginated).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    renderCoursesPage()
    expect(screen.getByLabelText('Đang tải...')).toBeInTheDocument()
  })

  // Stub tests replaced by describe groups below
})

describe('CoursesPage - Search', () => {
  it('filters courses by title search (case-insensitive)', async () => {
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Toán lớp 7 nâng cao')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Tìm theo tên khóa học…')
    fireEvent.change(searchInput, { target: { value: 'chuyên' } })

    await waitFor(() => {
      expect(screen.queryByText('Toán lớp 7 nâng cao')).not.toBeInTheDocument()
      expect(screen.getByText('Ôn thi chuyên toán')).toBeInTheDocument()
    })
  })

  it('shows filtered empty state when search matches nothing', async () => {
    const user = userEvent.setup()
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Toán lớp 7 nâng cao')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Tìm theo tên khóa học…')
    await user.type(searchInput, 'xyz123nonexistent')

    expect(screen.getByText('Không tìm thấy kết quả')).toBeInTheDocument()
    expect(screen.getByText('Thử thay đổi từ khóa hoặc bộ lọc.')).toBeInTheDocument()
  })
})

describe('CoursesPage - Grade Filter', () => {
  it('filters courses by grade_7', async () => {
    const user = userEvent.setup()
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Toán lớp 7 nâng cao')).toBeInTheDocument()
    })

    const filterTrigger = screen.getByLabelText('Lọc theo lớp')
    await user.click(filterTrigger)
    const grade7Option = screen.getByRole('option', { name: 'Lớp 7' })
    await user.click(grade7Option)

    expect(screen.getByText('Toán lớp 7 nâng cao')).toBeInTheDocument()
    expect(screen.queryByText('Ôn thi chuyên toán')).not.toBeInTheDocument()
  })

  it('shows count as "X khóa học" (server total)', async () => {
    const user = userEvent.setup()
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('2 khóa học')).toBeInTheDocument()
    })

    const filterTrigger = screen.getByLabelText('Lọc theo lớp')
    await user.click(filterTrigger)
    const grade7Option = screen.getByRole('option', { name: 'Lớp 7' })
    await user.click(grade7Option)

    await waitFor(() => {
      expect(screen.getByText('1 khóa học')).toBeInTheDocument()
    })
  })
})

describe('CoursesPage - Pagination', () => {
  it('shows pagination when more than 20 courses (PAGE_SIZE)', async () => {
    const manyCourses = Array.from({ length: 25 }, (_, i) => ({
      id: `course-${i + 1}`,
      title: `Khóa học ${i + 1}`,
      slug: `khoa-hoc-${i + 1}`,
      description: null,
      target_grade: 'grade_7' as const,
      is_published: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }))
    setupMock(manyCourses)

    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Khóa học 1')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Trang trước')).toBeInTheDocument()
    expect(screen.getByLabelText('Trang sau')).toBeInTheDocument()

    expect(screen.getByText('Khóa học 20')).toBeInTheDocument()
    expect(screen.queryByText('Khóa học 21')).not.toBeInTheDocument()
  })

  it('shows disabled pagination when 20 or fewer courses', async () => {
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Toán lớp 7 nâng cao')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Trang trước')).toBeInTheDocument()
    expect(screen.getByLabelText('Trang trước')).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('CoursesPage - Empty States', () => {
  it('shows no-data empty state with CTA button', async () => {
    setupMock([])
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Chưa có khóa học nào')).toBeInTheDocument()
    })

    expect(screen.getByText(/Nhấn "Tạo khóa học" để bắt đầu/)).toBeInTheDocument()
    const ctaButtons = screen.getAllByRole('button', { name: /Tạo khóa học/i })
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows filtered empty state without CTA', async () => {
    renderCoursesPage()
    await waitFor(() => {
      expect(screen.getByText('Toán lớp 7 nâng cao')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Tìm theo tên khóa học…')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy kết quả')).toBeInTheDocument()
    })
    // Only header "Tạo khóa học" button, not CTA in empty state
    const buttons = screen.getAllByRole('button', { name: /Tạo khóa học/i })
    expect(buttons).toHaveLength(1)
  })
})

describe('CoursesPage - Skeleton Loading', () => {
  it('shows skeleton with aria-label during loading', async () => {
    vi.mocked(fetchCoursesPaginated).mockImplementation(
      () => new Promise(() => {})
    )
    renderCoursesPage()

    const skeleton = screen.getByLabelText('Đang tải...')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
  })
})
