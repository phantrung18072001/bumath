import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// --- Mock data ---

const mockUngraded = [
  {
    id: 'sub-1',
    user_id: 'student-1',
    lesson_id: 'lesson-1',
    file_path: 'submissions/student-1/lesson-1/photo.jpg',
    submitted_at: '2026-04-07T10:00:00Z',
    profiles: { full_name: 'Nguyen Van A' },
    lessons: {
      title: 'Bai 1',
      chapters: { course_id: 'course-1', courses: { title: 'Toan 7', target_grade: 'grade_7' } }
    },
  },
  {
    id: 'sub-2',
    user_id: 'student-2',
    lesson_id: 'lesson-2',
    file_path: 'submissions/student-2/lesson-2/photo.jpg',
    submitted_at: '2026-04-07T11:00:00Z',
    profiles: { full_name: 'Tran Thi B' },
    lessons: {
      title: 'Bai 2',
      chapters: { course_id: 'course-2', courses: { title: 'Toan 8', target_grade: 'grade_8' } }
    },
  },
]

// --- Mocks ---

vi.mock('@/lib/api/submissions', () => ({
  getUngraded: vi.fn().mockResolvedValue([]),
  getAllSubmissions: vi.fn(() => Promise.resolve({
    data: [],
    total: 0
  })),
  gradeSubmission: vi.fn().mockResolvedValue(undefined),
  getSubmissionSignedUrl: vi.fn().mockResolvedValue('https://example.com/photo.jpg'),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'admin-1' },
    profile: { id: 'admin-1', role: 'admin', approval_status: 'approved' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// --- Helpers ---

async function renderSubmissionsPage() {
  // Dynamic import to ensure mocks are applied
  const { default: SubmissionsPage } = await import('./SubmissionsPage')
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SubmissionsPage />
      </QueryClientProvider>
    </BrowserRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

// --- Tests (GRADE-01) ---

describe('SubmissionsPage', () => {
  it('renders the page heading', async () => {
    await renderSubmissionsPage()
    await waitFor(() => {
      expect(screen.getByText(/[Cc]h[aấ]m b[aà]i/)).toBeInTheDocument()
    })
  })

  it('shows empty state when no ungraded submissions', async () => {
    await renderSubmissionsPage()
    await waitFor(() => {
      expect(screen.getByText(/[Kk]h[oô]ng c[oó] b[aà]i n[aà]o/)).toBeInTheDocument()
    })
  })

  it('renders submission rows with student name and course title', async () => {
    const { getUngraded } = await import('@/lib/api/submissions')
    ;(getUngraded as ReturnType<typeof vi.fn>).mockResolvedValue(mockUngraded)

    await renderSubmissionsPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
      expect(screen.getByText('Toan 7')).toBeInTheDocument()
    })
  })

  it('shows filter bar when submissions exist', async () => {
    const { getUngraded } = await import('@/lib/api/submissions')
    ;(getUngraded as ReturnType<typeof vi.fn>).mockResolvedValue(mockUngraded)

    await renderSubmissionsPage()
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /lọc theo lớp/i })).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /lọc theo khóa học/i })).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /lọc theo bài học/i })).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Tìm học sinh...')).toBeInTheDocument()
    })
  })

  it('shows result count', async () => {
    const { getUngraded } = await import('@/lib/api/submissions')
    ;(getUngraded as ReturnType<typeof vi.fn>).mockResolvedValue(mockUngraded)

    await renderSubmissionsPage()
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 2 \/ 2 bài nộp/)).toBeInTheDocument()
    })
  })

  it('filters by student name', async () => {
    const { getUngraded } = await import('@/lib/api/submissions')
    const userEvent = (await import('@testing-library/user-event')).default
    ;(getUngraded as ReturnType<typeof vi.fn>).mockResolvedValue(mockUngraded)

    await renderSubmissionsPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
      expect(screen.getByText('Tran Thi B')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Tìm học sinh...')
    await userEvent.type(input, 'Nguyen')

    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
      expect(screen.queryByText('Tran Thi B')).not.toBeInTheDocument()
      expect(screen.getByText(/Hiển thị 1 \/ 2 bài nộp/)).toBeInTheDocument()
    })
  })

  it('shows filter empty message when no results match', async () => {
    const { getUngraded } = await import('@/lib/api/submissions')
    const userEvent = (await import('@testing-library/user-event')).default
    ;(getUngraded as ReturnType<typeof vi.fn>).mockResolvedValue(mockUngraded)

    await renderSubmissionsPage()
    const input = await screen.findByPlaceholderText('Tìm học sinh...')
    await userEvent.type(input, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy bài nộp nào phù hợp với bộ lọc.')).toBeInTheDocument()
    })
  })
})

describe('SubmissionsPage status filter', () => {
  it('renders status filter Select with "Tất cả trạng thái" default', async () => {
    const { getAllSubmissions } = await import('@/lib/api/submissions')
    vi.mocked(getAllSubmissions).mockResolvedValue({
      data: [
        {
          id: 'sub-1',
          user_id: 'user-1',
          lesson_id: 'les-1',
          file_path: 'path/to/file.jpg',
          submitted_at: '2026-05-01T10:00:00Z',
          score: null,
          status: 'submitted',
          profiles: { full_name: 'Nguyễn Văn A' },
          lessons: {
            title: 'Bài 1',
            chapters: {
              course_id: 'course-1',
              courses: { title: 'Toán 7', target_grade: 'grade_7' }
            }
          }
        }
      ],
      total: 1
    })

    await renderSubmissionsPage()

    await screen.findByText('Nguyễn Văn A')

    expect(screen.getByText('Tất cả trạng thái')).toBeInTheDocument()
  })

  it('calls getAllSubmissions with status filter on selection', async () => {
    const { getAllSubmissions } = await import('@/lib/api/submissions')
    vi.mocked(getAllSubmissions).mockResolvedValue({ data: [], total: 0 })
    await renderSubmissionsPage()

    await waitFor(() => {
      expect(getAllSubmissions).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'all' })
      )
    })
  })
})

describe('SubmissionsPage loading', () => {
  it('shows skeleton loading state', async () => {
    const { getAllSubmissions } = await import('@/lib/api/submissions')
    vi.mocked(getAllSubmissions).mockImplementation(() => new Promise(() => {}))

    await renderSubmissionsPage()

    expect(screen.getByLabelText('Đang tải...')).toBeInTheDocument()
  })
})
