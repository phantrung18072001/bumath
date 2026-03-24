---
phase: 02-auth-access-control
plan: 03
subsystem: admin
tags: [admin, user-management, tanstack-query, supabase, vitest]
dependency_graph:
  requires: ["02-01"]
  provides: ["admin-users-page", "approve-reject-mutations"]
  affects: ["App.tsx routing (plan 04)"]
tech_stack:
  added: []
  patterns: ["useQuery + useMutation via TanStack Query", "two-step inline confirmation", "supabase.from().update().eq()"]
key_files:
  created:
    - src/pages/admin/UsersPage.tsx
    - src/pages/admin/UsersPage.test.tsx
  modified: []
decisions:
  - "Used userEvent.setup() from @testing-library/user-event for Radix Tabs interaction in jsdom (fireEvent.click does not trigger Radix pointer events)"
  - "Extracted UsersTable as internal component to share table rendering logic across all four tab panels"
  - "Exposed mock internals via __mocks named exports to enable per-test data override without top-level variable hoisting issues"
metrics:
  duration: "4 minutes"
  completed: "2026-03-24"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 02 Plan 03: Admin User Management Page Summary

Admin user management page with filterable table, status badges, and two-step approve/reject actions using TanStack Query mutations against Supabase profiles table.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Admin UsersPage with table, tabs, and approve/reject actions | 974cfe7 | src/pages/admin/UsersPage.tsx |
| 2 | Create UsersPage unit tests for approve/reject mutations | 43278a1 | src/pages/admin/UsersPage.test.tsx |

## What Was Built

### UsersPage (`src/pages/admin/UsersPage.tsx`)

Full-width admin page at `/admin/users` implementing:

- **Data fetching**: `useQuery(['admin', 'profiles'])` fetches all profiles ordered by `created_at desc`
- **Tabs**: Tất cả | Chờ duyệt | Đã duyệt | Từ chối — each filters the full dataset client-side
- **Table columns**: Tên học sinh, Số điện thoại, Năm sinh, Địa chỉ, Trạng thái, Hành động
- **Status badges**: color-coded per UI-SPEC (blue for pending, green for approved, red/destructive for rejected)
- **Approve mutation**: `useMutation` calling `supabase.from('profiles').update({ approval_status: 'approved' }).eq('id', userId)` with success toast
- **Reject mutation**: two-step inline confirmation — first click shows "Xác nhận từ chối?" button, second click executes; auto-resets after 3 seconds via `setTimeout`
- **Empty states**: per-tab messages in Vietnamese ("Không có tài khoản nào đang chờ duyệt.", "Chưa có tài khoản nào được tạo.")
- **Loading state**: centered `Loader2` spinner while query is pending
- **Mobile**: `overflow-x-auto` wrapper on table

### UsersPage Tests (`src/pages/admin/UsersPage.test.tsx`)

9 unit tests covering:
1. Page heading renders "Quản lý tài khoản"
2. All four tab labels render
3. User rows render from mocked profiles
4. "Duyệt tài khoản" button calls `supabase.update` with `approval_status: 'approved'`
5. "Từ chối" button shows "Xác nhận từ chối?" confirmation on first click
6. Confirmation button executes reject mutation on second click
7. Pending tab shows empty state when no pending users
8. All tab shows empty state when no users exist
9. Success toast fires after approval

All 38 tests in the full suite pass (no regressions).

## Decisions Made

**userEvent over fireEvent for Radix Tabs** — `fireEvent.click` does not trigger the pointer event chain that Radix UI Tabs requires in jsdom. Using `userEvent.setup()` and `await user.click(tab)` correctly activates tab switching. This is only needed for the tab interaction test; other tests use `fireEvent.click` for buttons.

**Internal UsersTable component** — Extracted as a non-exported internal component in the same file to share table rendering (columns, action buttons, empty states) across all four TabsContent panels without prop drilling.

**Mock hoisting strategy** — `vi.mock` factories cannot reference outer variables (they are hoisted to top of file). Used named exports from the mock module (`__order`, `__updateEq`, etc.) accessed via `beforeAll` import, enabling per-test data override via `mockResolvedValue` calls in `resetMocksWithData`.

## Deviations from Plan

**[Rule 1 - Bug] Fixed Radix Tabs tab-switch test with userEvent**
- **Found during:** Task 2 (TDD green phase)
- **Issue:** `fireEvent.click` on Radix Tab trigger does not switch the active panel in jsdom — pointer events are required
- **Fix:** Added `import userEvent from '@testing-library/user-event'` and used `userEvent.setup()` + `await user.click(pendingTab)` for the tab-switching test case only
- **Files modified:** `src/pages/admin/UsersPage.test.tsx`
- **Commit:** 43278a1

**[Rule 3 - Blocking] Restructured supabase mock to avoid vi.mock hoisting error**
- **Found during:** Task 2 first run
- **Issue:** `vi.mock` factory was referencing top-level `const mockFrom = vi.fn()` variables, causing `ReferenceError: Cannot access before initialization`
- **Fix:** Moved all mock function creation inside the factory, exported via named exports (`__order`, `__updateEq`, etc.), accessed via `beforeAll(() => import('@/lib/supabase'))`
- **Files modified:** `src/pages/admin/UsersPage.test.tsx`
- **Commit:** 43278a1

## Known Stubs

None. The page fetches real data from Supabase profiles table. The Supabase client itself is mocked in tests but wired to real env vars in production.

## Self-Check: PASSED
