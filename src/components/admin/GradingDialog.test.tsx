import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// --- Mock data ---

const mockSubmission = {
  id: 'sub-1',
  user_id: 'student-1',
  lesson_id: 'lesson-1',
  file_path: 'submissions/student-1/lesson-1/photo.jpg',
  submitted_at: '2026-04-07T10:00:00Z',
  profiles: { full_name: 'Nguyen Van A' },
  lessons: { title: 'Bai 1', chapters: { course_id: 'course-1', courses: { title: 'Toan 7' } } },
}

// --- Mocks ---

vi.mock('@/lib/api/submissions', () => ({
  gradeSubmission: vi.fn().mockResolvedValue(undefined),
  getSubmissionSignedUrl: vi.fn().mockResolvedValue('https://example.com/photo.jpg'),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// --- Helpers ---

async function renderGradingDialog(props = {}) {
  const { default: GradingDialog } = await import('./GradingDialog')
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const defaultProps = {
    submission: mockSubmission,
    open: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...props,
  }
  return render(
    <QueryClientProvider client={queryClient}>
      <GradingDialog {...defaultProps} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

// --- Tests (GRADE-02) ---

describe('GradingDialog', () => {
  it('renders dialog with student name in title when open', async () => {
    await renderGradingDialog()
    await waitFor(() => {
      expect(screen.getByText(/Nguyen Van A/)).toBeInTheDocument()
    })
  })

  it('shows score input with min 0 max 10 step 0.5', async () => {
    await renderGradingDialog()
    await waitFor(() => {
      const scoreInput = screen.getByLabelText(/[Dd]i[eể]m/)
      expect(scoreInput).toBeInTheDocument()
      expect(scoreInput).toHaveAttribute('type', 'number')
      expect(scoreInput).toHaveAttribute('min', '0')
      expect(scoreInput).toHaveAttribute('max', '10')
      expect(scoreInput).toHaveAttribute('step', '0.5')
    })
  })

  // GRADE-03
  it('save button is disabled when score is empty', async () => {
    await renderGradingDialog()
    await waitFor(() => {
      const saveBtn = screen.getByRole('button', { name: /[Ll][uư]u [đĐDd]i[eể]m/ })
      expect(saveBtn).toBeDisabled()
    })
  })
})
