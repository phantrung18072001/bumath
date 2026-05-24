import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatMessage from './ChatMessage'
import { TooltipProvider } from '@/components/ui/tooltip'

vi.mock('@/lib/supabase', () => ({
  supabase: { rpc: vi.fn().mockResolvedValue({ data: null, error: null }) },
}))

vi.mock('@/lib/api/lesson-chat', () => ({
  deleteMessage: vi.fn().mockResolvedValue(undefined),
  fetchMessages: vi.fn().mockResolvedValue([]),
  sendMessage: vi.fn().mockResolvedValue({}),
  markChatRead: vi.fn().mockResolvedValue(undefined),
}))

const fakeMessage = {
  id: 'm1',
  lesson_id: 'L1',
  sender_id: 's1',
  content: 'hello',
  parent_id: null,
  created_at: new Date().toISOString(),
  deleted_at: null,
  profiles: { full_name: 'Nguyễn A', role: 'teacher' as const },
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}

describe('ChatMessage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows delete button only for admin/teacher viewers', async () => {
    const Wrapper = makeWrapper()
    // Student — no delete button
    const { unmount } = render(
      <ChatMessage message={fakeMessage} viewerRole="student" lessonId="L1" />,
      { wrapper: Wrapper }
    )
    expect(screen.queryByLabelText('Xoá tin nhắn')).toBeNull()
    unmount()

    // Teacher — delete button present
    const Wrapper2 = makeWrapper()
    render(
      <ChatMessage message={fakeMessage} viewerRole="teacher" lessonId="L1" />,
      { wrapper: Wrapper2 }
    )
    expect(screen.getByLabelText('Xoá tin nhắn')).toBeDefined()
  })

  it('renders reply with ml-6 indent and orange left border when isReply is true', async () => {
    const Wrapper = makeWrapper()
    const { container } = render(
      <ChatMessage message={fakeMessage} viewerRole="student" isReply={true} lessonId="L1" />,
      { wrapper: Wrapper }
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toMatch(/ml-6/)
    expect(wrapper?.className).toMatch(/border-l-2/)
  })

  it('shows "• Giảng viên" suffix when sender role is teacher', async () => {
    const Wrapper = makeWrapper()
    const { unmount: u1 } = render(
      <ChatMessage message={fakeMessage} viewerRole="student" lessonId="L1" />,
      { wrapper: Wrapper }
    )
    expect(screen.getByText(/Giảng viên/)).toBeDefined()
    u1()

    // Admin suffix
    const adminMessage = {
      ...fakeMessage,
      id: 'm2',
      profiles: { full_name: 'Admin B', role: 'admin' as const },
    }
    const Wrapper2 = makeWrapper()
    const { unmount: u2 } = render(
      <ChatMessage message={adminMessage} viewerRole="student" lessonId="L1" />,
      { wrapper: Wrapper2 }
    )
    expect(screen.getByText(/Quản trị/)).toBeDefined()
    u2()

    // Student — no suffix
    const studentMessage = {
      ...fakeMessage,
      id: 'm3',
      profiles: { full_name: 'Học sinh C', role: 'student' as const },
    }
    const Wrapper3 = makeWrapper()
    const { unmount: u3 } = render(
      <ChatMessage message={studentMessage} viewerRole="teacher" lessonId="L1" />,
      { wrapper: Wrapper3 }
    )
    expect(screen.queryByText(/Giảng viên/)).toBeNull()
    expect(screen.queryByText(/Quản trị/)).toBeNull()
    u3()
  })

  it('shows inline confirm on Trash2 click; Giữ lại cancels; Xoá calls deleteMessage', async () => {
    const { deleteMessage } = await import('@/lib/api/lesson-chat')
    const user = userEvent.setup()
    const Wrapper = makeWrapper()
    render(
      <ChatMessage message={fakeMessage} viewerRole="teacher" lessonId="L1" />,
      { wrapper: Wrapper }
    )

    // Click the trash button to trigger confirm
    const trashBtn = screen.getByLabelText('Xoá tin nhắn')
    await user.click(trashBtn)

    // Confirm UI appears
    expect(screen.getByText('Xoá tin nhắn này?')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Giữ lại' })).toBeDefined()

    // Click "Giữ lại" — cancels
    await user.click(screen.getByRole('button', { name: 'Giữ lại' }))
    expect(screen.queryByText('Xoá tin nhắn này?')).toBeNull()

    // Click trash again to re-confirm, then click Xoá
    await user.click(screen.getByLabelText('Xoá tin nhắn'))
    await user.click(screen.getByRole('button', { name: 'Xoá' }))

    await waitFor(() => {
      expect(deleteMessage).toHaveBeenCalledWith('m1')
    })
  })
})
