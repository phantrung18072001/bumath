import { describe, it, expect } from 'vitest'

describe('ChatInput', () => {
  it.skip('disables Send button when textarea is empty or whitespace-only', async () => {
    const { default: ChatInput } = await import('./ChatInput')
    expect(ChatInput).toBeDefined()
    // TODO Plan 03: render, assert button [aria-label="Gửi câu hỏi"] is disabled; type "  ", still disabled; type "hi", enabled.
  })

  it.skip('Enter key submits; Shift+Enter inserts newline', async () => {
    const { default: ChatInput } = await import('./ChatInput')
    expect(ChatInput).toBeDefined()
    // TODO Plan 03: use userEvent.setup(); press Enter → onSend called; press Shift+Enter → textarea value contains "\n".
  })

  it.skip('clears input and refocuses textarea after successful send', async () => {
    const { default: ChatInput } = await import('./ChatInput')
    expect(ChatInput).toBeDefined()
    // TODO Plan 03: assert textarea.value === '' after send; assert document.activeElement === textarea.
  })
})
