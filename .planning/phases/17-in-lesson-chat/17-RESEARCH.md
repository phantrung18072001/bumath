# Phase 17: In-Lesson Chat - Research

**Researched:** 2026-05-08
**Domain:** Supabase Realtime chat, React state lifecycle, RLS policy design
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Teachers/admins access chat the same way as students — navigate to the lesson, open Tab 3 "Thảo luận". No dedicated admin chat queue page.
- **D-02:** Teacher/admin UI is mostly identical to student UI, with one extra control: a delete button on any message. No "mark as answered", no "pin reply" — delete only.
- **D-03:** Text-only messages. No image attachments. Students use SubmissionArea (Tab 2) for images.
- **D-04:** Reply threading with inline indent. Replies are indented under the parent message (left border/indent). Works on mobile 375px. Data model: messages table with nullable `parent_id` FK to self.
- **D-05:** Flat root-level messages shown chronologically. Replies shown indented under their parent.
- **D-06:** Chat tab opens a Supabase Realtime channel lazily — only when Tab 3 is active. Channel cleaned up with `removeChannel` on unmount or when lesson changes.
- **D-07:** Messages deduplicated by UUID (`id`) to handle React StrictMode double-mount.
- **D-08:** When student switches to a different lesson, active channel is removed and a new channel opens for the new lesson's chat.
- **D-09:** Teacher's unread badge is an enhancement to existing `BellNotification.tsx` — add unanswered chat messages to the bell dropdown.
- **D-10:** Badge count uses 60s polling (`refetchInterval: 60_000`). No additional Realtime channel for the badge itself.
- **D-11:** "Unread" for a teacher = chat messages sent by students in lessons where the teacher hasn't opened Tab 3 since the last student message.
- **D-12:** When a teacher/admin opens Tab 3 for a lesson, all messages in that lesson are marked as read by upserting a `chat_reads(user_id, lesson_id, read_at)` row. No scroll tracking, no explicit button.
- **D-13:** Students don't need an unread badge — no read tracking required on student side.
- **D-14:** Students can only see/send messages in lessons they have access to (using `has_grade_access()` pattern from Phase 14). Teachers and admins can see/send in any lesson.
- **D-15:** Delete message: teacher/admin can delete any message; students cannot delete.

### Claude's Discretion

- Exact DB schema column names (e.g., `lesson_chat_messages`, `parent_id`, `sender_id`, `content`, `deleted_at` vs hard delete)
- RLS policy implementation details (extend existing `is_approved_user()` / `get_my_role()` helpers)
- Whether to use soft-delete (`deleted_at`) or hard delete — implementer may choose based on what's simpler
- Scroll behavior in chat (auto-scroll to bottom on new message, preserve scroll on load)
- Chat input UX details (Enter to send vs button, textarea vs input)
- How many levels of indent (recommend capping at 1 level)

### Deferred Ideas (OUT OF SCOPE)

- Admin chat queue page at `/admin/chat`
- Mark as answered / resolved thread status
- Student unread badge for teacher replies
- Image attachments in chat
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-01 | Học sinh có thể gửi câu hỏi cho giảng viên trong ngữ cảnh từng bài học cụ thể | DB table `lesson_chat_messages` with `lesson_id` FK; RLS using `has_grade_access()`; Supabase Realtime for immediate visibility |
| CHAT-02 | Giảng viên và admin có thể reply và xem toàn bộ tin nhắn theo bài học | Same table, teacher RLS allows all lessons; reply via `parent_id` FK; identical ChatPanel component with delete control for teacher/admin role |
| CHAT-03 | Giảng viên thấy badge thông báo khi có câu hỏi mới chưa trả lời | `lesson_chat_reads` table tracks last-read-at per teacher+lesson; count query on `lesson_chat_messages` where sent_at > read_at; polled at 60s in BellNotification extension |
</phase_requirements>

---

## Summary

Phase 17 adds realtime per-lesson messaging between students and teachers. The core implementation has three independent subsystems: (1) the database layer (two new tables, RLS policies, one RPC), (2) the ChatPanel React component that plugs into the existing Tab 3 placeholder in `LessonContent.tsx`, and (3) the teacher unread badge extension on `BellNotification.tsx`.

The highest-risk area is Supabase Realtime channel lifecycle. Supabase Realtime channels must be explicitly removed with `supabase.removeChannel(channel)` or they persist and leak. React StrictMode in development mounts components twice, causing duplicate subscriptions unless messages are deduplicated by UUID. Both issues are well-documented in Supabase JS v2 and the project CONTEXT.md mandates the correct mitigations.

All required shadcn components (`ScrollArea`, `Textarea`, `Button`, `Badge`, `Skeleton`, `Tabs`) already exist in `src/components/ui/`. No new packages are needed. The RLS pattern (`has_grade_access()`, `is_approved_user()`, `get_my_role()`) is established from Phases 03 and 14.

**Primary recommendation:** Implement in wave order — (1) DB migration + RLS, (2) ChatPanel with TanStack Query history load + Realtime subscription, (3) BellNotification extension for teacher badge. Keep soft-delete (`deleted_at`) so Realtime DELETE events can be matched by id in client state.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.78.0 (pinned) | DB queries, Realtime channels, RLS | Project-pinned; v2.79+ drops Node 18 |
| @tanstack/react-query | ^5.83.0 | Initial message history fetch, invalidation on send | Established project pattern |
| React | ^18 (StrictMode active) | Component lifecycle | Project standard |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui ScrollArea | existing | Message list scroll container | Chat message list |
| shadcn/ui Textarea | existing | Chat input | ChatInput component |
| shadcn/ui Button | existing | Send, delete actions | ChatInput, ChatDeleteButton |
| shadcn/ui Badge | existing | Unread count on Tab 3 trigger | Tab trigger with count |
| shadcn/ui Skeleton | existing | Loading state for history fetch | While query is pending |
| Lucide React | existing | SendHorizontal, Trash2, MessageCircle, Loader2 icons | ChatInput, ChatDeleteButton, empty state, send spinner |
| sonner (Toaster) | existing | Error toasts on send failure | Already wired in App.tsx |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Realtime postgres_changes | WebSocket custom server | Supabase handles auth token, no server needed; custom server is out-of-scope |
| 60s polling for teacher badge | Realtime channel for badge | Polling matches existing BellNotification pattern; simpler and free-tier safe |
| Hard delete | Soft delete (`deleted_at`) | Soft delete enables Realtime UPDATE events to propagate delete to other clients; hard delete requires separate broadcast channel |

**Installation:** No new packages. All dependencies exist in the project.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/student/
│   ├── ChatPanel.tsx          # Main container: message list + input + Realtime subscription
│   ├── ChatMessage.tsx        # Single message bubble (student/teacher variants)
│   └── ChatInput.tsx          # Textarea + Send button + keyboard handler
├── lib/api/
│   └── lesson-chat.ts         # All DB functions: fetchMessages, sendMessage, deleteMessage, markChatRead, getTeacherUnreadChatCount
```

`ChatReply` is not a separate component — it is rendered by `ChatMessage` with a prop like `isReply={true}` that adds `ml-6 border-l-2 border-[#F97316]/30`. This keeps the component tree flat.

### Pattern 1: Lazy Realtime Channel (Tab-Gated)

**What:** Open the Supabase Realtime channel only when Tab 3 becomes active; close it on tab switch away, lesson change, or unmount.

**When to use:** Mandatory per D-06 — reduces concurrent channel count on free tier.

**Example:**
```typescript
// Inside ChatPanel.tsx
useEffect(() => {
  if (!lessonId) return

  const channel = supabase
    .channel(`lesson-chat-${lessonId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lesson_chat_messages', filter: `lesson_id=eq.${lessonId}` },
      (payload) => {
        // Deduplicate by id before appending (D-07)
        if (payload.eventType === 'INSERT') {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new as ChatMessage]
          })
        }
        if (payload.eventType === 'UPDATE') {
          // Handle soft-delete: if deleted_at is set, remove from list
          setMessages(prev => prev.filter(m => m.id !== payload.new.id || !payload.new.deleted_at))
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [lessonId]) // Re-runs when lessonId changes (D-08)
```

The `useEffect` dependency is `[lessonId]`. When the user switches lessons, React runs cleanup (removes old channel) then re-runs the effect (opens new channel).

### Pattern 2: TanStack Query for Initial History

**What:** Fetch all existing messages for the lesson on mount; merge with Realtime stream.

**When to use:** Always — Realtime only delivers changes since subscription was opened; history load provides prior messages.

```typescript
// src/lib/api/lesson-chat.ts
export async function fetchMessages(lessonId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('lesson_chat_messages')
    .select('id, lesson_id, sender_id, content, parent_id, created_at, deleted_at, profiles:sender_id(full_name, role)')
    .eq('lesson_id', lessonId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as ChatMessage[]
}

// In ChatPanel.tsx
const { data: history = [], isLoading } = useQuery({
  queryKey: ['lesson-chat', lessonId],
  queryFn: () => fetchMessages(lessonId),
  enabled: !!lessonId,
})

// Local state starts from history; Realtime appends
const [messages, setMessages] = useState<ChatMessage[]>([])
useEffect(() => { setMessages(history) }, [history])
```

### Pattern 3: SECURITY DEFINER RPC for Delete

**What:** Teacher/admin delete uses an RPC rather than a direct `UPDATE` with `deleted_at`, to avoid granting broad UPDATE rights to teachers.

**When to use:** Any write that requires role verification beyond what RLS `auth.uid()` check can express simply.

```sql
CREATE OR REPLACE FUNCTION delete_chat_message(message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF get_my_role() NOT IN ('admin', 'teacher') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE lesson_chat_messages
  SET deleted_at = now()
  WHERE id = message_id;
END;
$$;
```

Matches the `mark_submission_viewed` RPC pattern established in Phase 05.

### Pattern 4: Read Tracking (Teacher Badge)

**What:** When a teacher opens Tab 3, upsert a `lesson_chat_reads` row; the badge query counts messages with `created_at > last read_at`.

```typescript
// Mark as read when tab becomes active
export async function markChatRead(lessonId: string): Promise<void> {
  const { error } = await supabase
    .from('lesson_chat_reads')
    .upsert({ lesson_id: lessonId, read_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' })
  if (error) throw error
}

// Count unread for teacher badge (called every 60s)
export async function getTeacherUnreadChatCount(): Promise<number> {
  const { count, error } = await supabase
    .rpc('count_teacher_unread_chat') // or inline query
  if (error) throw error
  return count ?? 0
}
```

Simpler alternative: a view `teacher_unread_chat_count` that the badge query hits directly with `.select('*', { count: 'exact', head: true })`.

### Anti-Patterns to Avoid

- **Opening channel outside Tab 3 gate:** Wastes Supabase concurrent connection limit. Always gate on `activeTab === 'thao-luan'`.
- **Relying on Realtime alone (no history fetch):** Realtime only delivers changes since subscribe time. Always seed from TanStack Query.
- **Mutating messages array directly in Realtime callback:** Use functional update `setMessages(prev => [...])` to avoid stale closure issues.
- **Not deduplicating on INSERT:** React StrictMode causes the subscription effect to run twice in development, resulting in duplicate messages in local state.
- **Using `.from('lesson_chat_messages').delete()` for teacher delete:** Requires broad RLS DELETE policy. Use soft delete + RPC instead.
- **Not invalidating TanStack Query cache after send:** After `sendMessage` resolves, call `queryClient.invalidateQueries(['lesson-chat', lessonId])` so any tab re-mount gets fresh history.

---

## Database Schema

### Table: `lesson_chat_messages`

```sql
CREATE TABLE lesson_chat_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  sender_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text NOT NULL CHECK (char_length(trim(content)) > 0),
  parent_id  uuid REFERENCES lesson_chat_messages(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX ON lesson_chat_messages(lesson_id, created_at);
```

- `parent_id` nullable FK to self for 1-level threading (D-04).
- `deleted_at` for soft delete — allows Realtime UPDATE event to propagate removal to clients.
- Index on `(lesson_id, created_at)` covers the primary query pattern.

### Table: `lesson_chat_reads`

```sql
CREATE TABLE lesson_chat_reads (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id  uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  read_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
```

Composite PK enables upsert `onConflict: 'user_id,lesson_id'` directly.

### RLS Policies

```sql
-- Enable Realtime replication (required for postgres_changes)
ALTER TABLE lesson_chat_messages REPLICA IDENTITY FULL;

-- Students: can SELECT messages in lessons they have access to
CREATE POLICY "student_select_chat" ON lesson_chat_messages
  FOR SELECT USING (
    is_approved_user() AND (
      has_grade_access((SELECT target_grade FROM lessons l JOIN chapters ch ON ch.id = l.chapter_id JOIN courses c ON c.id = ch.course_id WHERE l.id = lesson_id))
      OR get_my_role() IN ('admin', 'teacher')
    )
  );

-- Students: can INSERT their own messages in accessible lessons
CREATE POLICY "student_insert_chat" ON lesson_chat_messages
  FOR INSERT WITH CHECK (
    is_approved_user()
    AND sender_id = auth.uid()
    AND (
      has_grade_access((...)) OR get_my_role() IN ('admin', 'teacher')
    )
  );

-- No UPDATE/DELETE policies on the table — delete goes through RPC
```

**Important:** `ALTER TABLE lesson_chat_messages REPLICA IDENTITY FULL` is required for Supabase Realtime `postgres_changes` to receive the full old/new row on UPDATE and DELETE events.

### Teacher Unread Count Query

```sql
-- Function or view for badge polling
-- Count student messages in any lesson where sent after teacher's last read
SELECT COUNT(*)
FROM lesson_chat_messages m
WHERE m.deleted_at IS NULL
  AND m.sender_id NOT IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'teacher')
  )
  AND m.created_at > COALESCE(
    (SELECT read_at FROM lesson_chat_reads r WHERE r.lesson_id = m.lesson_id AND r.user_id = auth.uid()),
    '1970-01-01'
  );
```

Wrap in a SECURITY DEFINER function or expose as a computed aggregate for the badge query.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Realtime deduplication | Custom WeakSet/Map tracker | Functional state update with `prev.some(m => m.id === payload.new.id)` check | Simple, no extra state; handles StrictMode double-mount |
| Scroll-to-bottom on new message | Manual scrollTop calculation | `useRef` on ScrollArea viewport + `scrollIntoView` on last message element, or `scrollTop = scrollHeight` | DOM mutation approach is simpler than calculating heights |
| Role detection in chat UI | Custom role context | Existing `useAuth()` → `profile.role` — already available throughout student pages | Pattern established in Phases 02/03 |
| Polling for teacher badge | Custom setInterval | TanStack Query `refetchInterval: 60_000` — already used in `BellNotification.tsx` | Automatic retry, background refetch, consistent with existing code |
| Delete confirmation modal | shadcn Dialog | Inline confirmation row within the message bubble (per UI-SPEC) | Avoids modal z-index/focus issues; matches UI-SPEC decision |

**Key insight:** The hardest part of this phase is Realtime lifecycle correctness, not UI complexity. `removeChannel` cleanup and UUID deduplication are the two non-negotiable correctness requirements.

---

## Common Pitfalls

### Pitfall 1: Forgetting `REPLICA IDENTITY FULL` on the chat table

**What goes wrong:** Supabase Realtime `postgres_changes` for UPDATE events sends only the new row. Without `REPLICA IDENTITY FULL`, the old row values are not available, making it impossible to know which local state entry to update.

**Why it happens:** Default PostgreSQL replica identity is `DEFAULT` (PK only). Supabase Realtime needs the full row to reliably match and update client state.

**How to avoid:** Include `ALTER TABLE lesson_chat_messages REPLICA IDENTITY FULL;` in the migration, immediately after `CREATE TABLE`.

**Warning signs:** Realtime UPDATE events arrive but client state doesn't update; payload.old is empty.

### Pitfall 2: Realtime subscription not cleaned up on lesson switch

**What goes wrong:** Old channel stays open when user selects a new lesson. The old channel keeps sending messages from the previous lesson, which appear in the new lesson's chat (duplicate/wrong messages).

**Why it happens:** If the channel is opened in a `useEffect` without `lessonId` as a dependency, or if cleanup is forgotten.

**How to avoid:** `useEffect(() => { ...; return () => supabase.removeChannel(channel) }, [lessonId])`. The dependency array `[lessonId]` is the critical safety net.

**Warning signs:** Messages from lesson A appear when viewing lesson B; channel count in Supabase dashboard grows without bound.

### Pitfall 3: React StrictMode double-subscribe creates duplicate messages

**What goes wrong:** In development (StrictMode), `useEffect` runs twice (mount, unmount, re-mount). Two subscriptions receive the same INSERT event, adding the message twice to local state.

**Why it happens:** Project uses React 18 with StrictMode enabled (standard Vite React template). The second subscription is created before the first cleanup fires.

**How to avoid:** Deduplicate in the Realtime callback: `setMessages(prev => prev.some(m => m.id === p.new.id) ? prev : [...prev, p.new])`. The UUID `id` is the deduplication key (D-07).

**Warning signs:** Every new message appears twice in the chat list when running `yarn dev`.

### Pitfall 4: `lesson_chat_reads` upsert failing due to missing RLS

**What goes wrong:** Teacher opens Tab 3; `markChatRead` fails silently; badge never clears.

**Why it happens:** RLS on `lesson_chat_reads` may block INSERT/UPDATE for the calling user if not explicitly permissioned.

**How to avoid:** RLS policy: `FOR INSERT WITH CHECK (user_id = auth.uid())` + `FOR UPDATE USING (user_id = auth.uid())`. Or use an RPC with SECURITY DEFINER.

**Warning signs:** Teacher badge count never decreases despite opening the chat tab.

### Pitfall 5: `!isAdmin` guard on Tab 3 trigger not updated

**What goes wrong:** Teachers/admins cannot access Tab 3 because the existing `{!isAdmin && <TabsTrigger value="thao-luan">}` guard excludes them.

**Why it happens:** The current `LessonContent.tsx` hides Tab 3 from admins (line 145, 232). Phase 17 needs to remove or invert this guard.

**How to avoid:** Change the condition to render the "Thảo luận" tab trigger and content for ALL roles. The guard was temporary for the placeholder era.

**Warning signs:** Teachers navigate to a lesson and don't see the "Thảo luận" tab at all.

### Pitfall 6: Infinite re-render from auto-scroll

**What goes wrong:** Scrolling to the bottom of the chat list triggers a DOM mutation observer or resize that re-renders the component, which fires another scroll, etc.

**Why it happens:** `useEffect` with `[messages]` dependency calls `scroll`, which triggers layout recalculation.

**How to avoid:** Use `useRef` on a sentinel `<div>` at the bottom of the message list and call `ref.current?.scrollIntoView({ behavior: 'smooth' })` only when `messages.length` increases (not on every render). Check for actual length change with a prev-length ref.

---

## Code Examples

### ChatPanel skeleton (verified against project patterns)

```typescript
// src/components/student/ChatPanel.tsx
import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchMessages, markChatRead, type ChatMessage } from '@/lib/api/lesson-chat'
import { useAuth } from '@/contexts/AuthContext'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

interface ChatPanelProps {
  lessonId: string
}

export default function ChatPanel({ lessonId }: ChatPanelProps) {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const isTeacherOrAdmin = profile?.role === 'admin' || profile?.role === 'teacher'
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['lesson-chat', lessonId],
    queryFn: () => fetchMessages(lessonId),
    enabled: !!lessonId,
  })

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const prevLengthRef = useRef(0)

  useEffect(() => { setMessages(history) }, [history])

  // Auto-scroll only when message count increases
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevLengthRef.current = messages.length
  }, [messages.length])

  // Mark read for teacher/admin when tab becomes active
  useEffect(() => {
    if (isTeacherOrAdmin && lessonId) {
      markChatRead(lessonId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['teacher-chat-unread'] })
      })
    }
  }, [lessonId, isTeacherOrAdmin, queryClient])

  // Realtime subscription — lazy-open, clean up on lessonId change or unmount
  useEffect(() => {
    if (!lessonId) return
    const channel = supabase
      .channel(`lesson-chat-${lessonId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lesson_chat_messages',
        filter: `lesson_id=eq.${lessonId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev =>
            prev.some(m => m.id === (payload.new as ChatMessage).id)
              ? prev
              : [...prev, payload.new as ChatMessage]
          )
        }
        if (payload.eventType === 'UPDATE') {
          const updated = payload.new as ChatMessage
          if (updated.deleted_at) {
            setMessages(prev => prev.filter(m => m.id !== updated.id))
          }
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [lessonId])

  // ... render
}
```

### LessonContent.tsx change — remove `!isAdmin` guard

```typescript
// Before (line ~145, ~232):
{!isAdmin && (
  <TabsTrigger value="thao-luan">Thảo luận</TabsTrigger>
)}

// After:
<TabsTrigger value="thao-luan">
  Thảo luận
  {unreadCount > 0 && (
    <Badge className="ml-1.5 bg-[#F97316] text-white text-[10px] px-1.5 min-w-[18px] h-[18px]">
      {unreadCount > 9 ? '9+' : unreadCount}
    </Badge>
  )}
</TabsTrigger>

// Tab content — also remove !isAdmin guard:
<TabsContent value="thao-luan" className="flex flex-col flex-1 min-h-0 mt-0">
  <ChatPanel lessonId={lesson.id} />
</TabsContent>
```

### BellNotification extension for teacher unread chat

```typescript
// BellNotification.tsx addition — for teacher/admin only
const { data: chatUnread = 0 } = useQuery({
  queryKey: ['teacher-chat-unread'],
  queryFn: getTeacherUnreadChatCount,
  refetchInterval: 60_000,
  enabled: isTeacherOrAdmin,
})
const totalBadge = items.length + chatUnread
```

The existing badge `items.length` becomes `totalBadge`. The dropdown shows a new section for unread chat items linking to the relevant lesson tab.

---

## Integration Map

| Touch Point | File | Change Required |
|-------------|------|----------------|
| Tab 3 placeholder | `src/components/student/LessonContent.tsx` line 145, 232 | Remove `!isAdmin` guard; add `<ChatPanel lessonId={lesson.id} />` |
| Teacher badge | `src/components/student/BellNotification.tsx` | Add second query for `getTeacherUnreadChatCount`; merge into total badge |
| Lesson switch | `src/pages/student/CourseDetailPage.tsx` | No code change needed — `lessonId` prop flows down; `useEffect([lessonId])` in ChatPanel handles reset |
| New API module | `src/lib/api/lesson-chat.ts` | New file: `fetchMessages`, `sendMessage`, `deleteMessage`, `markChatRead`, `getTeacherUnreadChatCount` |
| New components | `src/components/student/` | `ChatPanel.tsx`, `ChatMessage.tsx`, `ChatInput.tsx` |
| DB migration | Supabase | Two new tables, RLS policies, one SECURITY DEFINER RPC, `REPLICA IDENTITY FULL` |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + React Testing Library 16 |
| Config file | `vite.config.ts` (vitest config embedded) |
| Quick run command | `yarn test src/components/student/ChatPanel.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-01 | Student can send message; message appears in chat list | unit | `yarn test src/components/student/ChatPanel.test.tsx -t "sends message"` | Wave 0 |
| CHAT-01 | Empty/whitespace message cannot be sent (send button disabled) | unit | `yarn test src/components/student/ChatInput.test.tsx -t "disables send"` | Wave 0 |
| CHAT-02 | Teacher/admin sees delete button on messages; student does not | unit | `yarn test src/components/student/ChatMessage.test.tsx -t "delete button"` | Wave 0 |
| CHAT-02 | Reply renders indented under parent message | unit | `yarn test src/components/student/ChatMessage.test.tsx -t "reply indent"` | Wave 0 |
| CHAT-03 | BellNotification shows merged badge count including chat unread | unit | `yarn test src/components/student/BellNotification.test.tsx -t "chat unread"` | Wave 0 |
| CHAT-03 | Opening Tab 3 calls markChatRead and invalidates teacher-chat-unread query | unit | `yarn test src/components/student/ChatPanel.test.tsx -t "marks read"` | Wave 0 |
| All | Realtime channel is removed on unmount | unit | `yarn test src/components/student/ChatPanel.test.tsx -t "removeChannel"` | Wave 0 |
| All | Duplicate messages by UUID are not added to state | unit | `yarn test src/components/student/ChatPanel.test.tsx -t "deduplicates"` | Wave 0 |

### Sampling Rate

- **Per task commit:** `yarn test src/components/student/ChatPanel.test.tsx`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/student/ChatPanel.test.tsx` — covers CHAT-01, CHAT-03, Realtime lifecycle
- [ ] `src/components/student/ChatMessage.test.tsx` — covers CHAT-02 (delete button visibility, reply indent)
- [ ] `src/components/student/ChatInput.test.tsx` — covers CHAT-01 (disabled state, Enter-to-send, Shift+Enter newline)
- [ ] `src/components/student/BellNotification.test.tsx` — extend existing mock pattern for teacher chat unread
- [ ] `src/lib/api/lesson-chat.ts` — new API module needed before tests can import it

**Test mocking notes from project history:**
- Mock `@/lib/supabase` module with `vi.mock('@/lib/supabase', ...)` — export a mock `supabase` object with `.channel().on().subscribe()` chainable mock and a `removeChannel` spy to verify cleanup.
- `vi.mock` hoisting requires mock functions defined inside factory (established Phase 02 pattern).
- Use `userEvent.setup()` for keyboard interactions (Enter key) — `fireEvent.keyDown` does not trigger Radix/React synthetic events reliably.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Supabase Realtime v1 (broadcast only) | Realtime v2 `postgres_changes` | Supabase 2.x | Direct DB change subscription, no custom broadcast needed |
| Channel-level auth | Row-level via RLS + JWT | Current Supabase | Client channel automatically uses user's JWT; RLS enforces access |
| `supabase.removeAllChannels()` | `supabase.removeChannel(channel)` | Current API | Target-specific cleanup; removing all channels would break other subscriptions |

**Deprecated/outdated:**
- `supabase.from('table').on('*', callback).subscribe()` (v1 Realtime API): Replaced by `.channel().on('postgres_changes', ...)`. Project uses supabase-js 2.78.0 which uses the v2 API exclusively.

---

## Open Questions

1. **Teacher role value in profiles table**
   - What we know: `get_my_role()` returns the role string; `profile.role` used throughout the app; Phase 03 established `is_admin()` and `is_approved_user()`.
   - What's unclear: Whether teacher role value is `'teacher'` or another string (e.g., `'instructor'`). The CONTEXT.md uses `'teacher'` throughout.
   - Recommendation: Check `profiles` table enum definition in Supabase dashboard before writing RLS. Assume `'teacher'` based on CONTEXT.md; verify on first migration run.

2. **Tab 3 unread badge count source for students**
   - What we know: D-13 says students don't need an unread badge. But the UI-SPEC shows the badge `{unreadCount > 0 && <Badge>}` on the Tab 3 trigger.
   - What's unclear: For students, is `unreadCount` always 0 (no badge shown), or does the student see a badge when teacher replies?
   - Recommendation: `unreadCount` prop to `LessonContent.tsx` defaults to 0 for students. No student-side read tracking query needed. Badge only shown non-zero for teacher/admin. This aligns with D-13.

3. **`has_grade_access()` function signature**
   - What we know: Pattern established in Phase 14 for lesson access control.
   - What's unclear: Exact function signature — whether it takes `grade` enum or `lesson_id` directly. Need to check existing RLS on `lessons` table.
   - Recommendation: Look at Phase 14 migration files before writing chat RLS. The CONTEXT.md canonical ref points to `14-CONTEXT.md` for this pattern.

---

## Sources

### Primary (HIGH confidence)

- Project CONTEXT.md (`17-CONTEXT.md`) — all decisions D-01 through D-15
- Project UI-SPEC (`17-UI-SPEC.md`) — component inventory, layout, color, states matrix, copywriting
- `src/components/student/LessonContent.tsx` — current Tab 3 placeholder (line 145, 232); tab value `"thao-luan"`
- `src/components/student/BellNotification.tsx` — polling pattern `refetchInterval: 60_000`; badge styling
- `src/lib/supabase.ts` — client singleton; `@supabase/supabase-js` 2.78.0
- `src/lib/api/submissions.ts` — SECURITY DEFINER RPC pattern (`mark_submission_viewed`); TanStack Query usage
- `src/test/setup.ts` + `src/pages/student/CourseDetailPage.test.tsx` — test patterns: `vi.mock`, jsdom polyfills, `userEvent.setup()`
- `.planning/config.json` — `nyquist_validation: true` (validation section required)
- `.planning/STATE.md` — `@supabase/supabase-js` pinned to 2.78.0 for Node 18 compatibility

### Secondary (MEDIUM confidence)

- Supabase JS v2 Realtime docs: `supabase.channel().on('postgres_changes', ...).subscribe()` with `removeChannel` cleanup
- React 18 StrictMode double-mount behavior: established project concern (D-07 in CONTEXT.md)
- `REPLICA IDENTITY FULL` requirement for full row in UPDATE/DELETE Realtime payloads: Supabase documented requirement

### Tertiary (LOW confidence)

- Teacher role value (`'teacher'`) — inferred from CONTEXT.md wording; not confirmed against DB schema
- `has_grade_access()` exact signature — inferred from Phase 14 reference; not inspected in migration files

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified from package.json; all shadcn components verified from component inventory in UI-SPEC
- Architecture: HIGH — patterns derived directly from existing project code (submissions.ts, BellNotification.tsx, LessonContent.tsx)
- DB schema: HIGH — follows established project conventions; REPLICA IDENTITY requirement is Supabase-documented
- Pitfalls: HIGH — Realtime lifecycle pitfalls verified against CONTEXT.md constraints and React StrictMode behavior
- Test patterns: HIGH — derived from existing test files in the project

**Research date:** 2026-05-08
**Valid until:** 2026-06-08 (stable stack; Supabase JS pinned; shadcn components stable)
