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
  onNewMessage?: () => void
}

export default function ChatPanel({ lessonId, onNewMessage }: ChatPanelProps) {
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
  const [replyTo, setReplyTo] = useState<ChatMessageType | null>(null)
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
            onNewMessage?.()
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
      const parentId = replyTo?.parent_id || replyTo?.id || undefined
      const inserted = await sendMessage({ lessonId, content, parentId })
      // Optimistic append (Realtime will dedup by id)
      setMessages(prev => prev.some(m => m.id === inserted.id) ? prev : [...prev, inserted])
      setReplyTo(null)
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
    <div className="flex flex-col flex-1 min-h-0 h-full bg-slate-50/50">
      {/* Panel header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold text-slate-800">Thảo luận bài học</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[11px] text-slate-400">Trực tuyến</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div role="log" aria-live="polite" className="px-4 md:px-5 py-5 space-y-4">
          {isLoading ? (
            <div className="space-y-4" aria-label="Đang tải tin nhắn…">
              {[0.75, 0.6, 0.7].map((w, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className={`h-10 rounded-2xl`} style={{ width: `${w * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-red-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">Không tải được tin nhắn</p>
              <p className="text-xs text-slate-400">Kiểm tra kết nối và thử lại</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center select-none">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border-2 border-orange-100 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-orange-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">?</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Chưa có câu hỏi nào</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  {isStaff
                    ? 'Học sinh chưa đặt câu hỏi nào cho bài học này.'
                    : 'Hãy đặt câu hỏi đầu tiên cho giảng viên về bài học này.'}
                </p>
              </div>
            </div>
          ) : (
            roots.map(root => (
              <div key={root.id} className="space-y-3">
                <ChatMessage message={root} viewerRole={role} lessonId={lessonId} onReply={() => setReplyTo(root)} />
                {(repliesByParent[root.id] ?? []).map(reply => (
                  <ChatMessage key={reply.id} message={reply} viewerRole={role} isReply lessonId={lessonId} onReply={() => setReplyTo(reply)} />
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
        replyToName={replyTo ? (replyTo.profiles?.full_name || 'Người dùng') : undefined}
        onCancelReply={replyTo ? () => setReplyTo(null) : undefined}
      />
    </div>
  )
}
