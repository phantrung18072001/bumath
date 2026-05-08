import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BellNotification from './BellNotification'

// --- Mocks ---

vi.mock('@/lib/api/submissions', () => ({
  getGradedUnviewed: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/lib/api/lesson-chat', () => ({
  getTeacherUnreadChatCount: vi.fn().mockResolvedValue(0),
}))

// --- Helpers ---

function renderBellNotification() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <BellNotification />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

// --- Tests (GRADE-04) ---

describe('BellNotification', () => {
  it('renders bell icon', async () => {
    renderBellNotification()
    await waitFor(() => {
      expect(screen.getByLabelText(/[Tt]h[oô]ng b[aá]o/)).toBeInTheDocument()
    })
  })

  it('hides badge when count is 0', async () => {
    renderBellNotification()
    await waitFor(() => {
      expect(screen.getByLabelText(/[Tt]h[oô]ng b[aá]o/)).toBeInTheDocument()
    })
    // Badge span should not exist
    expect(screen.queryByText(/[0-9]/)).not.toBeInTheDocument()
  })

  it.skip('shows merged badge count = items.length + chatUnread when role is teacher (chat unread)', async () => {
    const { default: BellNotification } = await import('./BellNotification')
    expect(BellNotification).toBeDefined()
    // TODO Plan 04: mock getGradedUnviewed → [1 item], mock getTeacherUnreadChatCount → 3,
    //               assert badge text is "4" (or "9+" if total > 9).
  })

  it.skip('does NOT call getTeacherUnreadChatCount when role is student (chat unread)', async () => {
    const { default: BellNotification } = await import('./BellNotification')
    expect(BellNotification).toBeDefined()
    // TODO Plan 04: re-mock useAuth to role='student', assert getTeacherUnreadChatCount NOT called.
  })

  it('shows badge with count when unviewed grades exist', async () => {
    const { getGradedUnviewed } = await import('@/lib/api/submissions')
    ;(getGradedUnviewed as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', score: 8, lesson: { id: 'l1', title: 'Bài 1', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
      { id: '2', score: 9, lesson: { id: 'l2', title: 'Bài 2', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
      { id: '3', score: 7, lesson: { id: 'l3', title: 'Bài 3', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
    ])

    renderBellNotification()
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })
})
