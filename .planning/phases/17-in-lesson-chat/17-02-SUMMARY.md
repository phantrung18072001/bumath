---
phase: 17-in-lesson-chat
plan: 02
subsystem: api
tags: [supabase, realtime, chat, vitest, typescript]

# Dependency graph
requires:
  - phase: 17-in-lesson-chat (Plan 01)
    provides: lesson_chat_messages, lesson_chat_reads tables + delete_chat_message + get_teacher_unread_chat_count RPCs
provides:
  - src/lib/api/lesson-chat.ts with ChatMessage type and 5 typed async functions
  - Wave 0 test scaffolds for ChatPanel, ChatMessage, ChatInput (11 skipped stubs)
  - BellNotification.test.tsx extended with 2 chat unread skipped stubs
  - Placeholder component stubs (ChatPanel, ChatMessage, ChatInput) for Vite transform resolution
affects:
  - 17-in-lesson-chat/17-03 (imports fetchMessages, sendMessage, deleteMessage, markChatRead from lesson-chat)
  - 17-in-lesson-chat/17-04 (imports getTeacherUnreadChatCount; extends BellNotification)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Wave 0 test scaffold pattern with it.skip and dynamic import (Phase 05 precedent)
    - Supabase RPC call via supabase.rpc('rpc_name', { param }) with error throw
    - Profiles join via foreign key alias: profiles:sender_id(full_name, role)
    - upsert with onConflict for idempotent read-tracking

key-files:
  created:
    - src/lib/api/lesson-chat.ts
    - src/components/student/ChatPanel.test.tsx
    - src/components/student/ChatMessage.test.tsx
    - src/components/student/ChatInput.test.tsx
    - src/components/student/ChatPanel.tsx (placeholder stub)
    - src/components/student/ChatMessage.tsx (placeholder stub)
    - src/components/student/ChatInput.tsx (placeholder stub)
  modified:
    - src/components/student/BellNotification.test.tsx

key-decisions:
  - "Placeholder component stubs (ChatPanel/ChatMessage/ChatInput.tsx) required — Vite resolves dynamic imports at transform time even inside it.skip; stubs prevent ReferenceError (Phase 05 precedent: CataloguePage.tsx stub)"
  - "it.skip used (not it.todo) for Wave 0 stubs — allows dynamic import() pattern with concrete expect(Component).toBeDefined() assertions; Plan 03 switches to it + fills render"

patterns-established:
  - "Wave 0 stub pattern: vi.mock factory + it.skip + await import('./Component') + expect(Component).toBeDefined() + TODO comment"
  - "Self-contained vi.mock factory for supabase: all mock functions defined inside factory closure (no top-level vars) to comply with hoisting rules"

requirements-completed: [CHAT-01, CHAT-02, CHAT-03]

# Metrics
duration: 3min
completed: 2026-05-08
---

# Phase 17 Plan 02: In-Lesson Chat API Module + Wave 0 Test Scaffolds Summary

**lesson-chat.ts API module with 5 typed functions against lesson_chat_messages/reads schema; 4 test files with 13 skipped Wave 0 stubs as verify targets for Plans 03 and 04**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-08T16:26:58Z
- **Completed:** 2026-05-08T16:29:23Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Locked the API contract: Plans 03/04 import fetchMessages, sendMessage, deleteMessage, markChatRead, getTeacherUnreadChatCount with zero ambiguity
- Created 11 skipped ChatPanel/ChatMessage/ChatInput test stubs as verify targets for Plan 03
- Extended BellNotification.test.tsx with 2 "chat unread" skipped stubs for Plan 04
- Applied Phase 05 placeholder stub pattern for Vite transform compatibility

## Task Commits

1. **Task 1: lesson-chat API module** - `c1ded0b` (feat)
2. **Task 2: Wave 0 test scaffolds + component stubs** - `dcd8a5b` (test)
3. **Task 3: BellNotification.test.tsx chat unread extension** - `5f2492e` (test)

## API Module: src/lib/api/lesson-chat.ts

**ChatMessage interface:**
```typescript
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
```

**5 exported async functions:**
```typescript
export async function fetchMessages(lessonId: string): Promise<ChatMessage[]>
export async function sendMessage(args: { lessonId: string; content: string; parentId?: string | null }): Promise<ChatMessage>
export async function deleteMessage(messageId: string): Promise<void>
export async function markChatRead(lessonId: string): Promise<void>
export async function getTeacherUnreadChatCount(): Promise<number>
```

## Test File Skipped Test Counts

| File | Skipped Tests |
|------|--------------|
| ChatPanel.test.tsx | 5 |
| ChatMessage.test.tsx | 3 |
| ChatInput.test.tsx | 3 |
| BellNotification.test.tsx | 2 (new) |
| **Total** | **13** |

## Notes for Plan 03/04 Implementers

**Converting it.skip to it:**
1. Delete the `it.skip(` keyword change to `it(`
2. Replace `expect(Component).toBeDefined()` with actual render + assertions
3. Use the supabase mock already set up in the `vi.mock` factory

**Supabase mock structure (self-contained factory):**
```typescript
vi.mock('@/lib/supabase', () => {
  const channelMock = { on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() }
  return {
    supabase: {
      channel: vi.fn(() => channelMock),
      removeChannel: vi.fn(),
      from: vi.fn(() => ({ select: ..., eq: ..., is: ..., order: ..., insert: ..., single: ..., upsert: ... })),
      rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
    },
  }
})
```

**Key rule:** All mock variables MUST be defined inside the factory closure (no top-level `const mockFn = vi.fn()`) due to vi.mock hoisting.

## Files Created/Modified
- `src/lib/api/lesson-chat.ts` — Complete API module, 88 lines, 5 functions + ChatMessage type
- `src/components/student/ChatPanel.test.tsx` — 5 skipped Wave 0 stubs
- `src/components/student/ChatMessage.test.tsx` — 3 skipped Wave 0 stubs
- `src/components/student/ChatInput.test.tsx` — 3 skipped Wave 0 stubs
- `src/components/student/ChatPanel.tsx` — Placeholder stub (null render)
- `src/components/student/ChatMessage.tsx` — Placeholder stub (null render)
- `src/components/student/ChatInput.tsx` — Placeholder stub (null render)
- `src/components/student/BellNotification.test.tsx` — Extended with 2 chat unread stubs

## Decisions Made
- Placeholder stubs (ChatPanel/ChatMessage/ChatInput.tsx) created — Vite resolves dynamic imports at transform time even inside it.skip blocks; stubs are required for test files to load without errors (same as Phase 05 CataloguePage.tsx precedent)
- it.skip used (not it.todo) — preserves the dynamic import pattern and concrete assertion shape that Plan 03/04 will fill in

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Create placeholder component stubs for Vite transform resolution**
- **Found during:** Task 2 (Wave 0 test scaffolds)
- **Issue:** Vite resolves `await import('./ChatPanel')` at transform time regardless of `it.skip`; tests failed with module-not-found error
- **Fix:** Created minimal placeholder stubs (ChatPanel.tsx, ChatMessage.tsx, ChatInput.tsx) returning null — same pattern as Phase 05 CataloguePage.tsx
- **Files modified:** src/components/student/ChatPanel.tsx, ChatMessage.tsx, ChatInput.tsx
- **Verification:** yarn test --run exits 0, 11 tests skipped
- **Committed in:** dcd8a5b (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for test files to load. Component stubs are pure scaffolding; Plan 03 replaces them with full implementations.

## Issues Encountered
None beyond the Vite transform issue documented above (known Phase 05 pattern).

## Next Phase Readiness
- Plan 03 (ChatPanel + LessonContent integration): import from `@/lib/api/lesson-chat`, switch `it.skip` to `it` in ChatPanel/ChatMessage/ChatInput test files
- Plan 04 (BellNotification badge): import getTeacherUnreadChatCount from `@/lib/api/lesson-chat`, switch 2 bell notification stubs from `it.skip` to `it`
- No blockers — API contract locked, build clean

---
*Phase: 17-in-lesson-chat*
*Completed: 2026-05-08*
