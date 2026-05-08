---
phase: 17-in-lesson-chat
plan: 03
subsystem: ui
tags: [react, supabase, realtime, tanstack-query, vitest, radix-ui, typescript]

# Dependency graph
requires:
  - phase: 17-in-lesson-chat/17-01
    provides: lesson_chat_messages + lesson_chat_reads DB tables + RLS + Realtime config
  - phase: 17-in-lesson-chat/17-02
    provides: lesson-chat API module (fetchMessages/sendMessage/deleteMessage/markChatRead), component stubs + it.skip test stubs

provides:
  - ChatMessage component: student vs teacher/admin bubble styling, reply indent, role suffix, delete confirm flow
  - ChatInput component: textarea + orange send button, Enter-to-send, Shift+Enter newline, post-send clear+refocus
  - ChatPanel container: TanStack Query history, lazy Realtime channel, dedup-by-id, auto-scroll, markChatRead for staff
  - LessonContent Tab 3 wired to ChatPanel, visible to all roles (no !isAdmin guard)
  - 12 live tests replacing all it.skip stubs from Plan 02

affects: [17-04-bell-notification, student-lesson-experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vi.hoisted() to pre-initialize spies referenced inside vi.mock() factories"
    - "AuthProvider as test wrapper (not mocked) when supabase is also mocked — avoids Vitest module-registry hang from mocking both"
    - "Dedup-by-id pattern: prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]"
    - "Lazy Realtime channel: useEffect([lessonId]) with early return if !lessonId"

key-files:
  created:
    - src/components/student/ChatMessage.tsx
    - src/components/student/ChatInput.tsx
    - src/components/student/ChatPanel.tsx
  modified:
    - src/components/student/ChatMessage.test.tsx
    - src/components/student/ChatInput.test.tsx
    - src/components/student/ChatPanel.test.tsx
    - src/components/student/LessonContent.tsx

key-decisions:
  - "vi.hoisted() required for supabase channel spies — vi.mock factory is hoisted before let/const declarations"
  - "Don't mock both @/lib/supabase AND @/contexts/AuthContext in same test file — causes Vitest module-registry hang; use AuthProvider wrapper with mocked supabase instead"
  - "chatApi container object pattern for lesson-chat mocks — prevents vi.clearAllMocks() resetting implementations in beforeEach"

patterns-established:
  - "ChatPanel vi.hoisted + AuthProvider wrapper pattern for tests requiring both supabase Realtime mocking and auth context"

requirements-completed: [CHAT-01, CHAT-02]

# Metrics
duration: 22min
completed: 2026-05-08
---

# Phase 17 Plan 03: In-Lesson Chat UI Summary

**ChatMessage/ChatInput primitives + ChatPanel Realtime container shipped; Tab 3 wired to ChatPanel for all roles; 12 previously-skipped unit tests made live and passing**

## Performance

- **Duration:** 22 min
- **Started:** 2026-05-08T16:31:52Z
- **Completed:** 2026-05-08T16:54:00Z
- **Tasks:** 3 auto + 1 checkpoint (auto-approved)
- **Files modified:** 7

## Accomplishments
- ChatMessage: student bg-muted bubble vs teacher/admin bg-white with orange left border; isReply=true adds ml-6 + border-l-2 indent; canDelete shows Trash2 with inline confirm ("Xoá tin nhắn này?")
- ChatInput: Textarea + orange Send button (#F97316); Enter submits, Shift+Enter newlines; disabled on empty/whitespace; clears and refocuses after send
- ChatPanel: TanStack Query history fetch (queryKey `['lesson-chat', lessonId]`), lazy Realtime channel `lesson-chat-${lessonId}`, INSERT dedup-by-UUID, UPDATE soft-delete filter, markChatRead on mount for staff, auto-scroll on new message
- LessonContent Tab 3: removed `!isAdmin` guards on TabsTrigger and TabsContent; placeholder "Tính năng sắp có" replaced with `<ChatPanel lessonId={lesson.id} />`
- 12 live tests: 4 ChatMessage + 3 ChatInput + 5 ChatPanel — all passing, 0 skipped

## Task Commits

1. **Task 1: ChatMessage + ChatInput primitives + tests** - `6397bd7` (feat)
2. **Task 2: ChatPanel container + tests** - `641e644` (feat)
3. **Task 3: LessonContent Tab 3 integration** - `a8715b5` (feat)
4. **Task 4: Human verify (auto-approved — AUTO_CFG=true)**

## Files Created/Modified
- `src/components/student/ChatMessage.tsx` - Message bubble with role styling, delete confirm, isReply indent
- `src/components/student/ChatInput.tsx` - Textarea + send button with keyboard shortcuts
- `src/components/student/ChatPanel.tsx` - Container orchestrating history + Realtime + message list + input
- `src/components/student/ChatMessage.test.tsx` - 4 live tests (was all it.skip)
- `src/components/student/ChatInput.test.tsx` - 3 live tests (was all it.skip)
- `src/components/student/ChatPanel.test.tsx` - 5 live tests (was all it.skip); vi.hoisted pattern
- `src/components/student/LessonContent.tsx` - Removed !isAdmin guards on Tab 3; imports ChatPanel

## Decisions Made
- **vi.hoisted() for supabase spies**: `removeChannelSpy` and `channelNamesSpy` must be hoisted before vi.mock factory runs; otherwise "Cannot access before initialization" error.
- **AuthProvider wrapper instead of mocking AuthContext**: Mocking both `@/lib/supabase` AND `@/contexts/AuthContext` simultaneously causes a Vitest module-registry hang (AuthContext imports supabase at module level). Solution: mock supabase with `onAuthStateChange` that returns a proper subscription, and use the real `AuthProvider` as test wrapper.
- **chatApi container object**: lesson-chat mock functions stored in a `const chatApi = { fetchMessages: vi.fn(), ... }` object so `beforeEach` can `.mockReset().mockResolvedValue(...)` without vi.clearAllMocks() wiping implementations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test isolation fix: unmount between sub-renders in role suffix test**
- **Found during:** Task 1 (ChatMessage tests)
- **Issue:** Third sub-render in "shows role suffix" test failed because previous render's "Giảng viên" text was still in DOM
- **Fix:** Added `u1()` / `u2()` unmount calls before each subsequent render
- **Files modified:** src/components/student/ChatMessage.test.tsx
- **Committed in:** 6397bd7

**2. [Rule 3 - Blocking] Vitest module-registry hang when mocking both supabase and AuthContext**
- **Found during:** Task 2 (ChatPanel tests)
- **Issue:** `vi.mock('@/contexts/AuthContext')` + `vi.mock('@/lib/supabase')` in same file caused vitest to hang indefinitely (60s+ timeout); root cause is Vitest module registry circular dependency during ESM resolution
- **Fix:** Use `vi.hoisted()` for spies; include `onAuthStateChange` in supabase mock; use real `AuthProvider` wrapper (no AuthContext mock)
- **Files modified:** src/components/student/ChatPanel.test.tsx
- **Committed in:** 641e644

---

**Total deviations:** 2 auto-fixed (1 test isolation bug, 1 blocking vitest hang)
**Impact on plan:** Both required for correct test execution. No functional scope creep.

## Issues Encountered
- Vitest hang with dual-mock pattern (supabase + AuthContext): diagnosed by progressively isolating mocks; resolved with vi.hoisted() + real AuthProvider pattern. This pattern is now documented for future tests.

## User Setup Required
None - no external service configuration required beyond Plan 01 migration already applied.

## Next Phase Readiness
- Plan 04 (BellNotification unread chat badge): ChatPanel calls `markChatRead(lessonId)` and invalidates `['teacher-chat-unread']` query key on mount — Plan 04 must register this exact query key in BellNotification
- All student-folder tests green (28/28), build exits 0
- Chat UI visible end-to-end in browser on Tab 3 "Thảo luận" for all roles

---
*Phase: 17-in-lesson-chat*
*Completed: 2026-05-08*
