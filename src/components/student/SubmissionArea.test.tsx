import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SubmissionArea from './SubmissionArea'

// --- Mock data ---

const mockGradedSubmission = {
  id: 'sub-1',
  user_id: 'student-1',
  lesson_id: 'lesson-1',
  file_path: 'submissions/student-1/lesson-1/photo.jpg',
  submitted_at: '2026-04-07T10:00:00Z',
  status: 'graded' as const,
  score: 8.5,
  comment: 'Lam tot',
  student_viewed_at: null,
}

const mockSubmittedSubmission = {
  ...mockGradedSubmission,
  status: 'submitted' as const,
  score: null,
  comment: null,
  student_viewed_at: null,
}

// --- Mocks ---

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/photo.jpg' }, error: null }),
      }),
    },
  },
}))

vi.mock('@/lib/api/submissions', () => ({
  getSubmissionSignedUrl: vi.fn().mockResolvedValue('https://example.com/photo.jpg'),
  getSubmissionSignedUrls: vi.fn().mockResolvedValue(['https://example.com/photo.jpg']),
  markGradeViewed: vi.fn().mockResolvedValue(undefined),
  compressImage: vi.fn().mockImplementation((f: File) => Promise.resolve(f)),
  uploadSubmission: vi.fn().mockResolvedValue({
    id: 'sub-1',
    user_id: 'student-1',
    lesson_id: 'lesson-1',
    file_path: 'submissions/student-1/lesson-1/photo.jpg',
    submitted_at: '2026-04-07T10:00:00Z',
    status: 'graded',
    score: 8.5,
    comment: 'Lam tot',
    student_viewed_at: null,
  }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'student-1' },
    profile: { id: 'student-1', role: 'student' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// --- Helpers ---

function renderSubmissionArea(props = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const defaultProps = {
    lessonId: 'lesson-1',
    userId: 'student-1',
    courseId: 'course-1',
    submission: null,
    ...props,
  }
  return render(
    <QueryClientProvider client={queryClient}>
      <SubmissionArea {...defaultProps} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

// --- Tests (GRADE-05) ---

describe('SubmissionArea', () => {
  it('shows score with /10 when submission is graded', async () => {
    renderSubmissionArea({ submission: mockGradedSubmission })
    await waitFor(() => {
      expect(screen.getByText(/8\.5\/10/)).toBeInTheDocument()
    })
  })

  it('shows teacher comment when submission is graded with comment', async () => {
    renderSubmissionArea({ submission: mockGradedSubmission })
    await waitFor(() => {
      expect(screen.getByText('Lam tot')).toBeInTheDocument()
    })
  })

  it('calls markGradeViewed when graded and student_viewed_at is null', async () => {
    renderSubmissionArea({ submission: mockGradedSubmission })
    const { markGradeViewed } = await import('@/lib/api/submissions')
    await waitFor(() => {
      expect(markGradeViewed).toHaveBeenCalledWith('sub-1')
    })
  })

  it('does not call markGradeViewed when submission is still submitted', async () => {
    renderSubmissionArea({ submission: mockSubmittedSubmission })
    const { markGradeViewed } = await import('@/lib/api/submissions')
    // Give time for any potential calls
    await new Promise(r => setTimeout(r, 100))
    expect(markGradeViewed).not.toHaveBeenCalled()
  })
})
