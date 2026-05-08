import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchMessages,
  sendMessage,
  markChatRead,
  type ChatMessage as ChatMessageType,
} from '@/lib/api/lesson-chat'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

interface ChatPanelProps {
  lessonId: string
}

export default function ChatPanel({ lessonId }: ChatPanelProps) {
  const { profile } = useAuth()
  const role: 'student' | 'teacher' | 'admin' = (profile?.role as any) ?? 'student'
  const isStaff = role === 'teacher' || role === 'admin'
  const queryClient = useQueryClient()
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLenRef = useRef(0)

  const { data: history = [], isLoading, isError } = useQuery({
    queryKey: ['lesson-chat', lessonId],
    queryFn: () => fetchMessages(lessonId),
    enabled: !!lessonId,
  })

  const [messages, setMessages] = useState<ChatMessageType[]>([])
  useEffect(() => { setMessages(history) }, [history])

  // Auto-scroll only when message count grows
  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevLenRef.current = messages.length
  }, [messages.length])

  // Mark read for staff on mount / lesson change
  useEffect(() => {
    if (!lessonId || !isStaff) return
    markChatRead(lessonId).then(() => {
      queryClient.invalidateQueries({ queryKey: ['teacher-chat-unread'] })
    }).catch(() => { /* swallow — not critical */ })
  }, [lessonId, isStaff, queryClient])

  // Lazy Realtime channel — opens only when lessonId is set
  useEffect(() => {
    if (!lessonId) return
    const channel = supabase
      .channel(`lesson-chat-${lessonId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_chat_messages', filter: `lesson_id=eq.${lessonId}` },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const incoming = payload.new as ChatMessageType
            setMessages(prev => prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming])
          }
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as ChatMessageType
            if (updated.deleted_at) {
              setMessages(prev => prev.filter(m => m.id !== updated.id))
            } else {
              setMessages(prev => prev.map(m => m.id === updated.id ? updated : m))
            }
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [lessonId])

  const handleSend = async (content: string) => {
    try {
      const inserted = await sendMessage({ lessonId, content })
      // Optimistic append (Realtime will dedup by id)
      setMessages(prev => prev.some(m => m.id === inserted.id) ? prev : [...prev, inserted])
    } catch (err) {
      toast.error('Không gửi được tin nhắn. Kiểm tra kết nối và thử lại.')
    }
  }

  // Group: roots first, then nested replies indented
  const roots = messages.filter(m => !m.parent_id)
  const repliesByParent = messages.reduce<Record<string, ChatMessageType[]>>((acc, m) => {
    if (m.parent_id) {
      (acc[m.parent_id] ||= []).push(m)
    }
    return acc
  }, {})

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <ScrollArea className="flex-1 min-h-0">
        <div role="log" aria-live="polite" className="px-4 md:px-6 py-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3" aria-label="Đang tải tin nhắn…">
              <Skeleton className="h-12 w-3/4 rounded-lg" />
              <Skeleton className="h-12 w-2/3 rounded-lg" />
              <Skeleton className="h-12 w-3/5 rounded-lg" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive text-center py-8">
              Không tải được tin nhắn. Thử lại sau.
            </p>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">Chưa có câu hỏi nào</p>
              <p className="text-xs text-muted-foreground/60">Hãy đặt câu hỏi cho giảng viên về bài học này.</p>
            </div>
          ) : (
            roots.map(root => (
              <div key={root.id} className="space-y-2">
                <ChatMessage message={root} viewerRole={role} lessonId={lessonId} />
                {(repliesByParent[root.id] ?? []).map(reply => (
                  <ChatMessage key={reply.id} message={reply} viewerRole={role} isReply lessonId={lessonId} />
                ))}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <ChatInput
        onSend={handleSend}
        placeholder={isStaff ? 'Trả lời câu hỏi của học sinh…' : 'Đặt câu hỏi về bài học này…'}
        ariaLabel={isStaff ? 'Nội dung trả lời' : 'Nội dung câu hỏi'}
        sendAriaLabel={isStaff ? 'Gửi trả lời' : 'Gửi câu hỏi'}
      />
    </div>
  )
}
