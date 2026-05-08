import { useRef, useState, KeyboardEvent } from 'react'
import { SendHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  onSend: (content: string) => Promise<void> | void
  placeholder?: string
  ariaLabel?: string
  sendAriaLabel?: string
}

export default function ChatInput({
  onSend,
  placeholder = 'Đặt câu hỏi về bài học này…',
  ariaLabel = 'Nội dung câu hỏi',
  sendAriaLabel = 'Gửi câu hỏi',
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const trimmed = value.trim()
  const disabled = sending || trimmed.length === 0

  const submit = async () => {
    if (disabled) return
    setSending(true)
    try {
      await onSend(trimmed)
      setValue('')
      ref.current?.focus()
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void submit()
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-background shrink-0">
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        rows={1}
        className="min-h-[44px] max-h-[120px] resize-none"
        disabled={sending}
      />
      <Button
        type="button"
        aria-label={sendAriaLabel}
        disabled={disabled}
        onClick={() => void submit()}
        className="bg-[#F97316] hover:bg-[#ea6c0c] text-white min-h-[44px] min-w-[44px] disabled:opacity-60"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
      </Button>
    </div>
  )
}
