import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from './ChatInput'

describe('ChatInput', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('disables Send button when textarea is empty or whitespace-only', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(<ChatInput onSend={onSend} />)

    const btn = screen.getByLabelText('Gửi câu hỏi') as HTMLButtonElement
    // Initially empty — disabled
    expect(btn.disabled).toBe(true)

    // Type whitespace — still disabled
    const textarea = screen.getByLabelText('Nội dung câu hỏi') as HTMLTextAreaElement
    const user = userEvent.setup()
    await user.type(textarea, '  ')
    expect(btn.disabled).toBe(true)

    // Type actual content — enabled
    await user.clear(textarea)
    await user.type(textarea, 'hi')
    expect(btn.disabled).toBe(false)
  })

  it('Enter key submits; Shift+Enter inserts newline', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(<ChatInput onSend={onSend} />)

    const textarea = screen.getByLabelText('Nội dung câu hỏi') as HTMLTextAreaElement
    await user.click(textarea)
    await user.type(textarea, 'hi')

    // Press Enter → onSend called once
    await user.keyboard('{Enter}')
    expect(onSend).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith('hi')

    // Type again, Shift+Enter → newline inserted, onSend not called again
    await user.type(textarea, 'line1')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(onSend).toHaveBeenCalledTimes(1)
    expect(textarea.value).toContain('\n')
  })

  it('clears input and refocuses textarea after successful send', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(<ChatInput onSend={onSend} />)

    const textarea = screen.getByLabelText('Nội dung câu hỏi') as HTMLTextAreaElement
    await user.type(textarea, 'test message')
    await user.keyboard('{Enter}')

    // Wait for async onSend + state update
    await vi.waitFor(() => {
      expect(textarea.value).toBe('')
    })
    expect(document.activeElement).toBe(textarea)
  })
})
