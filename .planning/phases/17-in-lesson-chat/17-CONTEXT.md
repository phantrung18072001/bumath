# Phase 17: In-Lesson Chat - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 17 delivers realtime student↔teacher messaging scoped per lesson. Tab 3 "Thảo luận" placeholder already exists in `LessonContent.tsx` — this phase replaces the placeholder with a live chat feature.

**Requirements covered:** CHAT-01, CHAT-02, CHAT-03

**Explicitly NOT in Phase 17:**
- Dedicated admin chat queue page (teachers access chat via the lesson tab only)
- Image attachments in chat (students use SubmissionArea in Tab 2 for images)
- Mark-as-answered / resolved status per thread
- URL sync for the chat tab (already decided in Phase 16 D-01)

</domain>

<decisions>
## Implementation Decisions

### Teacher/Admin Chat Access
- **D-01:** Teachers and admins access chat the same way as students — navigate to the lesson, open Tab 3 "Thảo luận". No dedicated admin chat queue page in this phase.
- **D-02:** Teacher/admin UI is mostly identical to student UI, with one extra control: a **delete button** on any message. No "mark as answered", no "pin reply" — delete only.

### Message Model
- **D-03:** **Text-only messages.** No image attachments in chat. Students wanting to show their work use SubmissionArea (Tab 2) instead.
- **D-04:** **Reply threading with inline indent.** Replies are slightly indented under the parent message (left border/indent style). Works on mobile 375px. Data model: messages table with a nullable `parent_id` FK to self.
- **D-05:** Flat root-level messages are shown chronologically. Replies are shown indented under their parent.

### Realtime
- **D-06:** Chat tab opens a Supabase Realtime channel **lazily** — only when Tab 3 is active. Channel is cleaned up with `removeChannel` on unmount or when lesson changes (per ROADMAP constraint).
- **D-07:** Messages are deduplicated by UUID (message `id`) to handle React StrictMode double-mount.
- **D-08:** When the student switches to a different lesson, the active channel is removed and a new channel is opened for the new lesson's chat.

### Teacher Unread Badge (CHAT-03)
- **D-09:** The teacher's unread badge is an **enhancement to the existing `BellNotification.tsx`** — add unanswered chat messages to what the bell dropdown shows.
- **D-10:** Badge count uses **60s polling** (same pattern as existing `BellNotification` — `refetchInterval: 60_000`). No additional Realtime channel for the badge itself.
- **D-11:** "Unread" for a teacher = chat messages sent by students in lessons where the teacher hasn't opened Tab 3 since the last student message. Marking as read: opening Tab 3 for a lesson marks all messages in that lesson as read (server-side, via a `last_read_at` or similar).

### Read Tracking
- **D-12:** When a teacher/admin **opens Tab 3 for a lesson**, all messages in that lesson's thread are marked as read. No scroll tracking, no explicit button. Implementation: upsert a `chat_reads` row (user_id, lesson_id, read_at) when tab becomes active.
- **D-13:** Students don't need an unread badge — they initiate the conversation and wait for teacher reply. No read tracking required for student side.

### Access / RLS
- **D-14:** Students can only see/send messages in lessons they have access to (package/grade access, same as Phase 14 pattern using `has_grade_access()`). Teachers and admins can see/send in any lesson.
- **D-15:** Delete message: teacher/admin can delete any message; students cannot delete their own messages (simplest — avoid "deleted message" tombstone UI).

### Claude's Discretion
- Exact DB schema column names (e.g., `lesson_chat_messages`, `parent_id`, `sender_id`, `content`, `deleted_at` vs hard delete)
- RLS policy implementation details (extend existing `is_approved_user()` / `get_my_role()` helpers)
- Whether to use soft-delete (set `deleted_at`) or hard delete for messages — implementer may choose based on what's simpler
- Scroll behavior in chat (auto-scroll to bottom on new message, preserve scroll on load)
- Chat input UX details (Enter to send vs button, textarea vs input)
- How many levels of indent (recommend capping at 1 level — replies to replies still show at the same indent as direct replies)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — CHAT-01, CHAT-02, CHAT-03
- `.planning/ROADMAP.md` — §Phase 17: In-Lesson Chat (goal, success criteria, Realtime constraints)
- `.planning/PROJECT.md` — §Constraints (Supabase stack, no server); §Context milestone v3.0

### Prior phase decisions (carry-forward)
- `.planning/phases/16-lesson-tabs-study-materials/16-CONTEXT.md` — Tab 3 "Thảo luận" placeholder (D-03); no URL sync (D-01); tab value `"thao-luan"` in `LessonContent.tsx`
- `.planning/phases/14-pricing-access-control/14-CONTEXT.md` — `has_grade_access()`, lesson access RLS pattern; students blocked from lessons outside their package
- `.planning/phases/13-student-pages/13-CONTEXT.md` — Student UI: teal claymorphism, `bm-clay-card-student`, `#F0FDFA` bg

### Code integration (implement touchpoints)
- `src/components/student/LessonContent.tsx` — Tab 3 placeholder at line ~218; replace with ChatPanel component
- `src/components/student/BellNotification.tsx` — extend for teacher's unanswered chat badge (polling 60s)
- `src/pages/student/CourseDetailPage.tsx` — `activeLessonId` state; channel must reset when lesson changes

### Design system
- `design-system/bumath/MASTER.md` — if exists; student-facing consistency (Phase 13)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Tab 3 shell in `LessonContent.tsx`** (line ~218): placeholder `TabsContent value="thao-luan"` ready to receive the ChatPanel component
- **`BellNotification.tsx`**: polling pattern with `refetchInterval: 60_000` — extend for teacher unanswered chat count
- **`get_my_role()` / `is_approved_user()` DB helpers** — reuse for RLS policies on `lesson_chat_messages` table
- **`SubmissionArea.tsx`** — reference for how student-facing upload/interaction components are structured

### Established Patterns
- **TanStack Query** — fetch initial message history; `invalidateQueries` on send
- **Supabase Realtime** — `supabase.channel(channelName).on('postgres_changes', ...).subscribe()` with `removeChannel` cleanup (mandated by ROADMAP)
- **React StrictMode** — double-mount safe: deduplicate messages by UUID
- **RLS**: SECURITY DEFINER RPCs for privileged writes (pattern from Phase 05 `mark_submission_viewed`)

### Integration Points
- `LessonContent.tsx` Tab 3 content → swap placeholder for `<ChatPanel lessonId={lessonId} />`
- `BellNotification.tsx` query → merge teacher unanswered chat count into existing unread badge
- `App.tsx` — no new routes needed (teacher accesses chat via existing lesson page)
- Supabase DB — new table `lesson_chat_messages`, new table `lesson_chat_reads`

</code_context>

<specifics>
## Specific Ideas

- Teacher/admin distinction in chat: show sender's display name with role label (e.g., "Nguyễn Văn A • Giảng viên") to make teacher replies visually prominent
- Cap threading at 1 level of indent — replies to replies still show at the same indent depth as direct replies (avoids deep nesting on mobile)
- Channel naming: use `lesson-chat-{lessonId}` as channel name for clarity and isolation

</specifics>

<deferred>
## Deferred Ideas

### Admin chat queue page
- A dedicated `/admin/chat` page listing all lessons with unanswered student questions — useful for scale but out of scope for Phase 17 (teacher navigates to lesson directly).

### Mark as answered / resolved
- Thread-level "Answered" status — would help teachers manage high volume but adds data model + UI complexity. Deferred.

### Student unread badge
- Notifying students when teacher replies (similar to BellNotification but for chat replies). Currently out of scope — students will see replies when they next open the lesson tab. Can be added later.

### Image attachments in chat
- Students pasting/uploading photos of handwritten math into chat — significant storage + compression scope. Deferred. Students use SubmissionArea for now.

</deferred>

---

*Phase: 17-in-lesson-chat*
*Context gathered: 2026-05-08*
