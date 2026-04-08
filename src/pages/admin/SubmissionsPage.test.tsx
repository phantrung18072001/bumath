import { render, screen, waitFor } from '@testing-library/react'
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
    lessons: { title: 'Bai 1', chapters: { course_id: 'course-1', courses: { title: 'Toan 7' } } },
  },
]

// --- Mocks ---

vi.mock('@/lib/api/submissions', () => ({
  getUngraded: vi.fn().mockResolvedValue([]),
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
    <QueryClientProvider client={queryClient}>
      <SubmissionsPage />
    </QueryClientProvider>
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
})
