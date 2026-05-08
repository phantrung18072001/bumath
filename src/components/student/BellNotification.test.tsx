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

let mockProfile: { id: string; role: 'student' | 'teacher' | 'admin'; full_name: string } = {
  id: 'u1',
  role: 'teacher',
  full_name: 'T',
}
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ profile: mockProfile }) }))

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
  mockProfile = { id: 'u1', role: 'teacher', full_name: 'T' }
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

  it('shows merged badge count = items.length + chatUnread when role is teacher (chat unread)', async () => {
    const { getGradedUnviewed } = await import('@/lib/api/submissions')
    const { getTeacherUnreadChatCount } = await import('@/lib/api/lesson-chat')
    ;(getGradedUnviewed as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', score: 8, lesson: { id: 'l1', title: 'Bài 1', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
    ])
    ;(getTeacherUnreadChatCount as ReturnType<typeof vi.fn>).mockResolvedValue(3)

    renderBellNotification()
    await waitFor(() => {
      const badge = screen.getByTestId('bell-badge')
      expect(badge.textContent).toBe('4')
    })
  })

  it('does NOT call getTeacherUnreadChatCount when role is student (chat unread)', async () => {
    mockProfile = { id: 'u2', role: 'student', full_name: 'S' }
    const { getTeacherUnreadChatCount } = await import('@/lib/api/lesson-chat')

    renderBellNotification()
    await new Promise(r => setTimeout(r, 0))
    expect(getTeacherUnreadChatCount as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(0)
  })

  it('caps merged badge at "9+" when items + chatUnread > 9 (chat unread)', async () => {
    const { getGradedUnviewed } = await import('@/lib/api/submissions')
    const { getTeacherUnreadChatCount } = await import('@/lib/api/lesson-chat')
    ;(getGradedUnviewed as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', score: 8, lesson: { id: 'l1', title: 'Bài 1', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
      { id: '2', score: 9, lesson: { id: 'l2', title: 'Bài 2', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
      { id: '3', score: 7, lesson: { id: 'l3', title: 'Bài 3', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
      { id: '4', score: 6, lesson: { id: 'l4', title: 'Bài 4', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
      { id: '5', score: 5, lesson: { id: 'l5', title: 'Bài 5', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
    ])
    ;(getTeacherUnreadChatCount as ReturnType<typeof vi.fn>).mockResolvedValue(10)

    renderBellNotification()
    await waitFor(() => {
      const badge = screen.getByTestId('bell-badge')
      expect(badge.textContent).toBe('9+')
    })
  })

  it('shows badge with count when unviewed grades exist', async () => {
    const { getGradedUnviewed } = await import('@/lib/api/submissions')
    const { getTeacherUnreadChatCount } = await import('@/lib/api/lesson-chat')
    ;(getGradedUnviewed as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', score: 8, lesson: { id: 'l1', title: 'Bài 1', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
      { id: '2', score: 9, lesson: { id: 'l2', title: 'Bài 2', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
      { id: '3', score: 7, lesson: { id: 'l3', title: 'Bài 3', chapter: { course_id: 'c1', course: { title: 'Toán 7', slug: 'toan-7' } } } },
    ])
    ;(getTeacherUnreadChatCount as ReturnType<typeof vi.fn>).mockResolvedValue(0)

    renderBellNotification()
    await waitFor(() => {
      expect(screen.getByTestId('bell-badge')).toBeInTheDocument()
      expect(screen.getByTestId('bell-badge').textContent).toBe('3')
    })
  })
})
