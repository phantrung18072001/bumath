import { useRef, useState, type KeyboardEvent } from 'react'
import { SendHorizontal, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

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
  const canSend = !sending && trimmed.length > 0

  const submit = async () => {
    if (!canSend) return
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
    <div className="shrink-0 border-t border-slate-100 bg-white/80 backdrop-blur-sm px-4 py-3">
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border px-3 py-2 transition-all duration-200',
          'bg-white shadow-sm',
          value.length > 0
            ? 'border-orange-300 shadow-orange-100 shadow-md ring-1 ring-orange-200/50'
            : 'border-slate-200 hover:border-slate-300',
        )}
      >
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          rows={1}
          disabled={sending}
          className={cn(
            'flex-1 min-h-[28px] max-h-[120px] resize-none border-0 bg-transparent p-0',
            'text-sm text-slate-800 placeholder:text-slate-400',
            'focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none',
          )}
        />

        {/* Hint */}
        {value.length === 0 && (
          <span className="text-[10px] text-slate-300 shrink-0 mb-0.5 hidden sm:block">
            Enter gửi · Shift↵ xuống dòng
          </span>
        )}

        {/* Send button */}
        <button
          type="button"
          aria-label={sendAriaLabel}
          disabled={!canSend}
          onClick={() => void submit()}
          className={cn(
            'shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer',
            canSend
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-orange-200 hover:shadow-md active:scale-95'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed',
          )}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-1.5 px-1 sm:hidden">
        Enter gửi · Shift+Enter xuống dòng
      </p>
    </div>
  )
}
