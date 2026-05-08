---
phase: 17-in-lesson-chat
plan: "04"
subsystem: ui
tags: [react, tanstack-query, bell-notification, chat, supabase]

# Dependency graph
requires:
  - phase: 17-02
    provides: BellNotification.test.tsx stubs (it.skip) and lesson-chat API (getTeacherUnreadChatCount)
  - phase: 17-01
    provides: lesson_chat_reads table and get_teacher_unread_chat_count RPC
provides:
  - BellNotification.tsx polls teacher chat unread count every 60s and merges with graded-unviewed badge
  - queryKey 'teacher-chat-unread' contract — ChatPanel (Plan 03) invalidates this key on Tab 3 open
  - Live tests for merged badge, role-gated query, and 9+ cap
affects:
  - 17-03 ChatPanel (must use queryKey 'teacher-chat-unread' to invalidate bell)
  - future admin chat queue page (Phase 17 deferred)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useQuery with enabled flag for role-gated polling (teacher/admin only)
    - Merged badge total: items.length + chatUnread, capped at 9+
    - vi.mock with module-scope let binding for per-test role overrides

key-files:
  created: []
  modified:
    - src/components/student/BellNotification.tsx
    - src/components/student/BellNotification.test.tsx

key-decisions:
  - "queryKey 'teacher-chat-unread' (exact string, no namespace) — must match ChatPanel's invalidateQueries call in Plan 03"
  - "enabled: isTeacherOrAdmin gates the chat unread poll — students never call get_teacher_unread_chat_count RPC"
  - "totalCount = items.length + chatUnread merges both badge types; 9+ cap applies to merged total"
  - "Auto mode: checkpoint:human-verify auto-approved — full manual verification deferred to user"

patterns-established:
  - "Role-gated query: useQuery({ enabled: isTeacherOrAdmin }) — pattern for teacher-only polling"
  - "Mock reset pattern: explicit .mockResolvedValue(0) per test when clearAllMocks does not reset implementations"

requirements-completed: [CHAT-03]

# Metrics
duration: 2min
completed: "2026-05-08"
---

# Phase 17 Plan 04: Bell Notification Chat Unread Summary

**BellNotification merged teacher chat unread (polled every 60s, role-gated) into existing graded-unviewed badge via TanStack Query with queryKey 'teacher-chat-unread'**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-08T16:31:57Z
- **Completed:** 2026-05-08T16:33:35Z
- **Tasks:** 1 auto + 1 checkpoint (auto-approved)
- **Files modified:** 2

## Accomplishments

- Extended `BellNotification.tsx` with a second `useQuery` polling `getTeacherUnreadChatCount` every 60 seconds, gated to `teacher` and `admin` roles via `useAuth()`
- Merged `chatUnread` into `totalCount = items.length + chatUnread` for a single badge display; 9+ cap applies to the merged total
- Added "Câu hỏi chưa trả lời" section in the dropdown for teacher/admin when `chatUnread > 0`
- Converted 2 `it.skip` stubs from Plan 02 to live tests; added 2 new tests (cap at 9+, badge count with grades-only); all 6 tests green
- Task 2 (human-verify) auto-approved per auto mode config

## Task Commits

Each task was committed atomically:

1. **Task 1: Add chat unread query + merged badge to BellNotification.tsx** - `bc4ab99` (feat)

**Plan metadata:** committed with docs commit below

## Files Created/Modified

- `src/components/student/BellNotification.tsx` - Added `getTeacherUnreadChatCount` import, `useAuth` import, chat unread query, merged `totalCount`, `data-testid="bell-badge"`, and "Câu hỏi chưa trả lời" dropdown section
- `src/components/student/BellNotification.test.tsx` - Converted `it.skip` stubs to live tests; added role-gated and cap tests; added `useAuth` mock with `let mockProfile` pattern

## Decisions Made

- `queryKey: ['teacher-chat-unread']` (exact string, no namespace prefix) — required to match `queryClient.invalidateQueries({ queryKey: ['teacher-chat-unread'] })` in ChatPanel (Plan 03)
- `enabled: isTeacherOrAdmin` gates the chat query — students never trigger the RPC
- Mock reset pattern: added explicit `(getTeacherUnreadChatCount as ReturnType<typeof vi.fn>).mockResolvedValue(0)` in the last test because `vi.clearAllMocks()` clears call counts but not implementations set with `mockResolvedValue`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Mock implementation leak in last test**
- **Found during:** Task 1 (GREEN phase) — "shows badge with count when unviewed grades exist" failed with '9+' instead of '3'
- **Issue:** Previous test (cap test) set `getTeacherUnreadChatCount` mock to resolve 10; `vi.clearAllMocks()` clears counts but not implementations; last test inherited the 10 value, giving totalCount 3+10=13 → '9+'
- **Fix:** Added explicit `.mockResolvedValue(0)` for `getTeacherUnreadChatCount` in the last test
- **Files modified:** src/components/student/BellNotification.test.tsx
- **Verification:** All 6 tests pass
- **Committed in:** bc4ab99 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary fix for test correctness. No scope creep.

## Issues Encountered

None — implementation matched plan exactly after the mock leak fix.

## Human Verification (Task 2)

Task 2 was a `checkpoint:human-verify`. Auto mode is active (`workflow.auto_advance=true`) — auto-approved. Manual steps (student sends message → teacher sees badge → opens Tab 3 → badge clears) should be performed by user before production deployment.

## Next Phase Readiness

- CHAT-03 implemented: teacher bell badge shows merged count; polls at 60s; gated to teacher/admin
- Phase 17 closes all 3 chat requirements (CHAT-01, CHAT-02, CHAT-03) — recommend running `/gsd:verify-work 17` next
- No blockers for remaining phases

---
*Phase: 17-in-lesson-chat*
*Completed: 2026-05-08*
