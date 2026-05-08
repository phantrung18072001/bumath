import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: { rpc: vi.fn().mockResolvedValue({ data: null, error: null }) },
}))

describe('ChatMessage', () => {
  it.skip('shows delete button only for admin/teacher viewers', async () => {
    const { default: ChatMessage } = await import('./ChatMessage')
    expect(ChatMessage).toBeDefined()
    // TODO Plan 03: render with viewerRole='student' → no Trash2; viewerRole='teacher' → Trash2 visible.
  })

  it.skip('renders reply with ml-6 indent and orange left border when isReply is true', async () => {
    const { default: ChatMessage } = await import('./ChatMessage')
    expect(ChatMessage).toBeDefined()
    // TODO Plan 03: assert wrapper has className matching /ml-6/ and /border-l-2/.
  })

  it.skip('shows "• Giảng viên" suffix when sender role is teacher', async () => {
    const { default: ChatMessage } = await import('./ChatMessage')
    expect(ChatMessage).toBeDefined()
    // TODO Plan 03: assert "Giảng viên" text appears in the rendered output.
  })
})
