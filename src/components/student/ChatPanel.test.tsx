import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { TooltipProvider } from '@/components/ui/tooltip'

// ---- Hoisted vars (before vi.mock hoisting) -----------------------------------
const { removeChannelSpy, channelNamesSpy, capturedCallbacksRef, mockProfileRef } = vi.hoisted(() => {
  const capturedCallbacksRef = { current: [] as Array<(payload: any) => void> }
  const mockProfileRef = { current: { id: 'user-1', role: 'teacher' as 'student' | 'teacher' | 'admin', full_name: 'T' } }
  return {
    removeChannelSpy: vi.fn(),
    channelNamesSpy: vi.fn(),
    capturedCallbacksRef,
    mockProfileRef,
  }
})

// ---- Supabase mock -----------------------------------------------------------
vi.mock('@/lib/supabase', () => {
  const channelMock = {
    on: (_event: any, _filter: any, cb: any) => {
      capturedCallbacksRef.current.push(cb)
      return channelMock
    },
    subscribe: () => channelMock,
  }
  return {
    supabase: {
      channel: (name: string) => {
        channelNamesSpy(name)
        return channelMock
      },
      removeChannel: removeChannelSpy,
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() =>
              Promise.resolve({
                data: { ...mockProfileRef.current },
                error: null,
              })
            ),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          insert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }),
      rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
        signOut: vi.fn().mockResolvedValue({}),
        onAuthStateChange: vi.fn((cb: any) => {
          setTimeout(() => cb('SIGNED_IN', { user: { id: 'user-1' } }), 0)
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        }),
      },
    },
  }
})

// ---- lesson-chat mock --------------------------------------------------------
const chatApi = {
  fetchMessages: vi.fn().mockResolvedValue([]),
  sendMessage: vi.fn(),
  markChatRead: vi.fn().mockResolvedValue(undefined),
  deleteMessage: vi.fn().mockResolvedValue(undefined),
}

vi.mock('@/lib/api/lesson-chat', () => ({
  fetchMessages: (...args: any[]) => chatApi.fetchMessages(...args),
  sendMessage: (...args: any[]) => chatApi.sendMessage(...args),
  markChatRead: (...args: any[]) => chatApi.markChatRead(...args),
  deleteMessage: (...args: any[]) => chatApi.deleteMessage(...args),
}))

// ---- Helper ------------------------------------------------------------------
const DEFAULT_SENT_MSG = {
  id: 'new-msg-1', lesson_id: 'L1', sender_id: 'user-1',
  content: 'hello', parent_id: null,
  created_at: new Date().toISOString(), deleted_at: null, profiles: null,
}

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <QueryClientProvider client={qc}>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

// ---- Tests -------------------------------------------------------------------
describe('ChatPanel', () => {
  beforeEach(() => {
    capturedCallbacksRef.current = []
    mockProfileRef.current = { id: 'user-1', role: 'teacher', full_name: 'T' }
    removeChannelSpy.mockReset()
    channelNamesSpy.mockReset()
    chatApi.fetchMessages.mockReset().mockResolvedValue([])
    chatApi.sendMessage.mockReset().mockResolvedValue({ ...DEFAULT_SENT_MSG })
    chatApi.markChatRead.mockReset().mockResolvedValue(undefined)
    chatApi.deleteMessage.mockReset().mockResolvedValue(undefined)
  })

  it('sends message and appends to list', async () => {
    const user = userEvent.setup()
    const { default: ChatPanel } = await import('./ChatPanel')
    const Wrapper = makeWrapper()
    render(<ChatPanel lessonId="L1" />, { wrapper: Wrapper })

    await waitFor(() => expect(screen.getByText('Chưa có câu hỏi nào')).toBeDefined(), { timeout: 5000 })
    expect(chatApi.fetchMessages).toHaveBeenCalledWith('L1')

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    await user.type(textarea, 'hello')
    await user.click(screen.getByRole('button', { name: /Gửi/ }))

    await waitFor(() => expect(chatApi.sendMessage).toHaveBeenCalledWith({ lessonId: 'L1', content: 'hello' }))
    await waitFor(() => expect(screen.getByText('hello')).toBeDefined())
  })

  it('removes the Realtime channel on unmount (removeChannel called)', async () => {
    const { default: ChatPanel } = await import('./ChatPanel')
    const Wrapper = makeWrapper()
    const { unmount } = render(<ChatPanel lessonId="L1" />, { wrapper: Wrapper })

    await waitFor(() => expect(channelNamesSpy).toHaveBeenCalledWith('lesson-chat-L1'), { timeout: 5000 })

    unmount()
    expect(removeChannelSpy).toHaveBeenCalledTimes(1)
  })

  it('deduplicates messages by UUID when Realtime echoes a sent message', async () => {
    const { default: ChatPanel } = await import('./ChatPanel')
    const Wrapper = makeWrapper()
    render(<ChatPanel lessonId="L1" />, { wrapper: Wrapper })

    await waitFor(() => expect(capturedCallbacksRef.current.length).toBeGreaterThan(0), { timeout: 5000 })

    const payload = {
      eventType: 'INSERT',
      new: {
        id: 'msg-unique-1', lesson_id: 'L1', sender_id: 'u1',
        content: 'deduplicated message', parent_id: null,
        created_at: new Date().toISOString(), deleted_at: null, profiles: null,
      },
    }

    await act(async () => { capturedCallbacksRef.current[0](payload) })
    await act(async () => { capturedCallbacksRef.current[0](payload) })

    expect(screen.getAllByText('deduplicated message')).toHaveLength(1)
  })

  it('marks chat as read on mount when caller is teacher/admin', async () => {
    mockProfileRef.current = { id: 'user-1', role: 'teacher', full_name: 'T' }
    const { default: ChatPanel } = await import('./ChatPanel')
    const Wrapper = makeWrapper()
    render(<ChatPanel lessonId="L1" />, { wrapper: Wrapper })

    await waitFor(() => expect(chatApi.markChatRead).toHaveBeenCalledWith('L1'), { timeout: 5000 })
    expect(chatApi.markChatRead).toHaveBeenCalledTimes(1)
  })

  it('opens channel lazily — only when lessonId is set', async () => {
    const { default: ChatPanel } = await import('./ChatPanel')
    const Wrapper = makeWrapper()
    render(<ChatPanel lessonId="" />, { wrapper: Wrapper })

    await new Promise(r => setTimeout(r, 80))
    expect(channelNamesSpy).not.toHaveBeenCalled()
  })
})
