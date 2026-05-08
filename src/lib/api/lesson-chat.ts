import { supabase } from '@/lib/supabase'

export interface ChatMessage {
  id: string
  lesson_id: string
  sender_id: string
  content: string
  parent_id: string | null
  created_at: string
  deleted_at: string | null
  profiles?: { full_name: string | null; role: 'student' | 'teacher' | 'admin' } | null
}

/**
 * Fetch all non-deleted messages for a lesson, oldest first.
 * Joins profiles for sender display name + role.
 */
export async function fetchMessages(lessonId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('lesson_chat_messages')
    .select('id, lesson_id, sender_id, content, parent_id, created_at, deleted_at, profiles:sender_id(full_name, role)')
    .eq('lesson_id', lessonId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as ChatMessage[]
}

/**
 * Insert a new chat message. sender_id is set from auth.uid() server-side via RLS WITH CHECK.
 * Returns the inserted row (so caller can optimistically append before the Realtime echo arrives).
 */
export async function sendMessage(args: {
  lessonId: string
  content: string
  parentId?: string | null
}): Promise<ChatMessage> {
  const trimmed = args.content.trim()
  if (!trimmed) throw new Error('Message content cannot be empty')
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) throw userErr ?? new Error('Not authenticated')
  const { data, error } = await supabase
    .from('lesson_chat_messages')
    .insert({
      lesson_id: args.lessonId,
      sender_id: userData.user.id,
      content: trimmed,
      parent_id: args.parentId ?? null,
    })
    .select('id, lesson_id, sender_id, content, parent_id, created_at, deleted_at, profiles:sender_id(full_name, role)')
    .single()
  if (error) throw error
  return data as unknown as ChatMessage
}

/**
 * Soft-delete a message via SECURITY DEFINER RPC. RPC enforces caller is admin/teacher.
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_chat_message', { p_message_id: messageId })
  if (error) throw error
}

/**
 * Upsert a (user_id, lesson_id) row in lesson_chat_reads with read_at=now.
 * Idempotent — safe to call on every Tab 3 activation.
 */
export async function markChatRead(lessonId: string): Promise<void> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) throw userErr ?? new Error('Not authenticated')
  const { error } = await supabase
    .from('lesson_chat_reads')
    .upsert(
      { user_id: userData.user.id, lesson_id: lessonId, read_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id' },
    )
  if (error) throw error
}

/**
 * Returns count of student messages newer than the calling teacher's last_read per lesson.
 * Returns 0 for non-staff callers (RPC is open to authenticated but the query yields 0 for them).
 */
export async function getTeacherUnreadChatCount(): Promise<number> {
  const { data, error } = await supabase.rpc('get_teacher_unread_chat_count')
  if (error) throw error
  return (typeof data === 'number' ? data : 0)
}
