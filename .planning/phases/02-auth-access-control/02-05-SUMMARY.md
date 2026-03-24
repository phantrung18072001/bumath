---
phase: 02-auth-access-control
plan: 05
status: completed
completed_at: "2026-03-24"
files_modified:
  - src/components/landing/Header.tsx
tasks_completed: 1
---

# Plan 02-05 Summary: Auth-aware Header with Logout

## What Was Built

Modified `src/components/landing/Header.tsx` to conditionally render auth state:
- **Authenticated users**: See their display name (`profile.full_name` or fallback "Tài khoản") and a "Đăng xuất" button with LogOut icon
- **Unauthenticated visitors**: See the original Đăng nhập / Đăng ký buttons unchanged
- Both **desktop** and **mobile** menu sections updated
- Mobile logout button uses `min-h-[48px]` for 48px touch target (UX-02)
- Closing mobile menu on logout (`setMobileOpen(false)`)

## Key Decisions

- `isAuthenticated = !loading && !!user` guards against flash during auth state load
- `variant="ghost"` for logout matches Pending.tsx pattern per UI-SPEC
- Profile name shown as `profile?.full_name || 'Tài khoản'` — graceful fallback if profile hasn't loaded yet

## Verification

- Build: ✓ (3.23s)
- Tests: ✓ 38/38 passed
- `useAuth`, `signOut`, `Đăng xuất`, `LogOut`, `isAuthenticated` all present in Header.tsx
- Unauthenticated state (Đăng nhập / Đăng ký) preserved

## Requirements Satisfied

- AUTH-03: Any logged-in user can log out from any page and is redirected to the login screen
