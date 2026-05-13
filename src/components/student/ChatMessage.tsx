import { useState } from 'react'
import { Trash2, Check, X, Reply } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteMessage, type ChatMessage as ChatMessageType } from '@/lib/api/lesson-chat'
import { useQueryClient } from '@tanstack/react-query'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ChatMessageProps {
  message: ChatMessageType
  viewerRole: 'student' | 'teacher' | 'admin'
  isReply?: boolean
  lessonId: string
  onReply?: () => void
}

function formatRoleLabel(role?: string | null): string | null {
  if (role === 'teacher') return 'Giảng viên'
  if (role === 'admin') return 'Quản trị'
  return null
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function ChatMessage({
  message,
  viewerRole,
  isReply = false,
  lessonId,
  onReply,
}: ChatMessageProps) {
  const canDelete = viewerRole === 'admin' || viewerRole === 'teacher'
  const senderRole = message.profiles?.role ?? 'student'
  const isStaffSender = senderRole === 'teacher' || senderRole === 'admin'
  const roleLabel = formatRoleLabel(senderRole)

  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const queryClient = useQueryClient()

  const onDelete = async () => {
    setDeleting(true)
    try {
      await deleteMessage(message.id)
      queryClient.invalidateQueries({ queryKey: ['lesson-chat', lessonId] })
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div
      className={cn(
        'group relative flex gap-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 duration-200',
        isReply && 'ml-6 pl-3 border-l-2 border-orange-200',
      )}
    >
      {/* Bubble */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-semibold text-slate-800 truncate">
            {message.profiles?.full_name ?? 'Người dùng'}
          </span>
          {roleLabel && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 leading-none shrink-0">
              {roleLabel}
            </span>
          )}
          <span className="text-xs text-slate-400 ml-auto shrink-0">
            {formatTime(message.created_at)}
          </span>
          {/* Action triggers — inline, visible on group hover */}
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center">
            {onReply && !confirming && (
              <button
                aria-label="Trả lời"
                onClick={onReply}
                className="p-1 rounded-md text-slate-300 hover:text-orange-500 hover:bg-orange-50 cursor-pointer"
              >
                <Reply className="h-3 w-3" />
              </button>
            )}
            {canDelete && !confirming && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Xoá tin nhắn"
                    onClick={() => setConfirming(true)}
                    className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Xoá tin nhắn</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Message card */}
        <div
          className={cn(
            'relative rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words transition-shadow duration-150',
            isStaffSender
              ? 'bg-white border border-orange-200/20 text-slate-800 shadow-sm'
              : 'bg-muted text-slate-700',
            isStaffSender && 'rounded-tl-sm',
            !isStaffSender && 'rounded-tl-sm',
          )}
        >
          {/* Orange left accent for staff */}
          {isStaffSender && (
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-orange-400 -translate-x-[1px]" />
          )}

          <p>{message.content}</p>

          {/* Delete confirm inline */}
          {canDelete && confirming && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
              <span className="text-xs text-slate-500 flex-1">Xoá tin nhắn này?</span>
              <button
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-normal bg-red-500 text-white hover:bg-red-600 transition-colors duration-150 cursor-pointer disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
                Xoá
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-normal bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-150 cursor-pointer disabled:opacity-50"
              >
                <X className="h-3 w-3" />
                Giữ lại
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
