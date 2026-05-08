import { describe, it, expect, vi, beforeEach } from 'vitest'

// Self-contained mock — vi.mock hoists; no top-level vars allowed in factory closure.
vi.mock('@/lib/supabase', () => {
  const channelMock = { on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() }
  const removeChannel = vi.fn()
  const channelFactory = vi.fn(() => channelMock)
  return {
    supabase: {
      channel: channelFactory,
      removeChannel,
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ profile: { id: 'user-1', role: 'teacher', full_name: 'T' } }),
}))

describe('ChatPanel', () => {
  beforeEach(() => { vi.clearAllMocks() })

  // Wave 0 stubs: switched from it.skip to it when Plan 03 implements ChatPanel.tsx.
  it.skip('sends message and appends to list', async () => {
    const { default: ChatPanel } = await import('./ChatPanel')
    expect(ChatPanel).toBeDefined()
    // TODO Plan 03: render, type "hello", click send, assert message visible.
  })

  it.skip('removes the Realtime channel on unmount (removeChannel called)', async () => {
    const { default: ChatPanel } = await import('./ChatPanel')
    expect(ChatPanel).toBeDefined()
    // TODO Plan 03: render, unmount, assert removeChannel called once with the channel.
  })

  it.skip('deduplicates messages by UUID when Realtime echoes a sent message', async () => {
    const { default: ChatPanel } = await import('./ChatPanel')
    expect(ChatPanel).toBeDefined()
    // TODO Plan 03: simulate two INSERT events with same id; assert list length === 1.
  })

  it.skip('marks chat as read on mount when caller is teacher/admin', async () => {
    const { default: ChatPanel } = await import('./ChatPanel')
    expect(ChatPanel).toBeDefined()
    // TODO Plan 03: assert supabase.from('lesson_chat_reads').upsert was called once.
  })

  it.skip('opens channel lazily — only when lessonId is set', async () => {
    const { default: ChatPanel } = await import('./ChatPanel')
    expect(ChatPanel).toBeDefined()
    // TODO Plan 03: render with lessonId='', assert channel not opened.
  })
})
