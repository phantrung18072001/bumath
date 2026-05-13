import { useRef, useState, useEffect, type KeyboardEvent } from 'react'
import { SendHorizontal, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (content: string) => Promise<void> | void
  placeholder?: string
  ariaLabel?: string
  sendAriaLabel?: string
  replyToName?: string | null
  onCancelReply?: () => void
}

const MAX_HEIGHT = 160 // px — ~6 lines

export default function ChatInput({
  onSend,
  placeholder = 'Đặt câu hỏi về bài học này…',
  ariaLabel = 'Nội dung câu hỏi',
  sendAriaLabel = 'Gửi câu hỏi',
  replyToName,
  onCancelReply,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const trimmed = value.trim()
  const canSend = !sending && trimmed.length > 0

  // Auto-resize: reset to 'auto' first so shrinking works, then grow to scrollHeight
  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }

  useEffect(() => {
    resize()
  }, [value])

  const submit = async () => {
    if (!canSend) return
    setSending(true)
    try {
      await onSend(trimmed)
      setValue('')
      // Reset height after clearing
      if (ref.current) ref.current.style.height = 'auto'
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
    <div className="shrink-0 border-t border-slate-100 bg-white/80 backdrop-blur-sm px-3 py-2 flex flex-col gap-1.5">
      {replyToName && (
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 w-fit rounded-md border border-slate-200">
          <span className="truncate max-w-[200px]">Đang trả lời: {replyToName}</span>
          <button
            onClick={onCancelReply}
            className="hover:text-slate-800 focus:outline-none focus:text-slate-800"
            aria-label="Hủy trả lời"
          >
            ✕
          </button>
        </div>
      )}
      <div
        className={cn(
          'flex items-end gap-2 rounded-xl border px-2.5 py-1.5 transition-all duration-200',
          'bg-white shadow-sm',
          value.length > 0
            ? 'border-orange-300 shadow-orange-100 shadow-md ring-1 ring-orange-200/50'
            : 'border-slate-200 hover:border-slate-300',
        )}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          rows={1}
          disabled={sending}
          style={{ height: 'auto', maxHeight: `${MAX_HEIGHT}px` }}
          className={cn(
            'flex-1 resize-none overflow-y-auto bg-transparent p-0 py-1',
            'text-sm text-slate-800 placeholder:text-slate-400 leading-[1.5]',
            'border-0 outline-none ring-0 focus:outline-none focus:ring-0 shadow-none',
          )}
        />

        {/* Hint — only when empty */}
        {value.length === 0 && (
          <span className="text-[10px] text-slate-300 shrink-0 mb-1 hidden sm:block whitespace-nowrap">
            Enter gửi · Shift↵ dòng mới
          </span>
        )}

        {/* Send button — 28px visual, 44px touch target via ::after pseudo-element (no layout impact) */}
        <button
          type="button"
          aria-label={sendAriaLabel}
          disabled={!canSend}
          onClick={() => void submit()}
          className={cn(
            "relative shrink-0 flex items-center justify-center w-7 h-7 rounded-lg mb-0.5 transition-all duration-150 cursor-pointer",
            "after:absolute after:content-[''] after:-inset-2",
            canSend
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-orange-200 hover:shadow active:scale-95'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed',
          )}
        >
          {sending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <SendHorizontal className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-1 px-0.5 sm:hidden">
        Enter gửi · Shift+Enter xuống dòng
      </p>
    </div>
  )
}
