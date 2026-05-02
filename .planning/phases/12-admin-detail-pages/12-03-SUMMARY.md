---
plan: 12-03
phase: 12-admin-detail-pages
status: complete
completed: 2026-05-02
---

## Summary

Added mobile sticky bottom bar to GradingPage for better mobile UX. Desktop layout (sticky sidebar) is unchanged; mobile users get a fixed bottom bar with score input and save/confirm buttons.

## What Was Built

- **Mobile sticky bar** — `fixed bottom-0 left-0 right-0 z-30 bg-background border-t p-4 lg:hidden`; contains score Input + "Lưu điểm" button; double-confirm flow with "Xác nhận/Hủy" buttons; mirrors desktop form behavior
- **Desktop sidebar hidden on mobile** — Changed `w-full lg:w-80` to `hidden lg:block w-80` so it only renders on large screens
- **Bottom spacer** — `h-32 lg:hidden` prevents scrollable content from being obscured by fixed bar on mobile

## Key Files

- `src/pages/admin/GradingPage.tsx`

## Commit

d3bc691 — Plan 12-03: GradingPage mobile sticky bottom bar
