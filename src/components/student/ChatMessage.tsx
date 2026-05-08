import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deleteMessage, type ChatMessage as ChatMessageType } from '@/lib/api/lesson-chat'
import { useQueryClient } from '@tanstack/react-query'

interface ChatMessageProps {
  message: ChatMessageType
  viewerRole: 'student' | 'teacher' | 'admin'
  isReply?: boolean
  lessonId: string
}

function formatRoleSuffix(role?: string | null): string {
  if (role === 'teacher') return ' • Giảng viên'
  if (role === 'admin') return ' • Quản trị'
  return ''
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
  } catch { return '' }
}

export default function ChatMessage({ message, viewerRole, isReply = false, lessonId }: ChatMessageProps) {
  const canDelete = viewerRole === 'admin' || viewerRole === 'teacher'
  const senderRole = message.profiles?.role ?? 'student'
  const isStaffSender = senderRole === 'teacher' || senderRole === 'admin'
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
        'group relative rounded-lg p-3 transition-opacity duration-150',
        isStaffSender ? 'bg-white border border-[#F97316]/20 border-l-2 border-l-[#F97316]' : 'bg-muted',
        isReply && 'ml-6 border-l-2 border-l-[#F97316]/30',
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xs font-semibold leading-tight">
          {message.profiles?.full_name ?? 'Người dùng'}
          <span className="font-normal text-muted-foreground">{formatRoleSuffix(senderRole)}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
      </div>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>

      {canDelete && !confirming && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Xoá tin nhắn"
          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-destructive hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      {canDelete && confirming && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Xoá tin nhắn này?</span>
          <Button size="sm" variant="destructive" onClick={onDelete} disabled={deleting}>
            Xoá
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={deleting}>
            Giữ lại
          </Button>
        </div>
      )}
    </div>
  )
}
