# P03 Summary — Broken-link audit + requirements alignment

**Status:** Complete

## What Was Built

- **Landing `Header`:** Nav `to` values restricted to routes that exist in `App.tsx` (`/`, `/danh-muc`, `/khoa-hoc`, etc.). Replaced dead `/huong-dan`, `/thanh-toan`, `/gioi-thieu`, `/de-thi`, `/tai-lieu`, `/tan-man` targets with in-app equivalents. Mobile menu: `type="button"`, `aria-label`, `cursor-pointer` on toggles and payment link closes drawer.
- **Admin / student audit:** `UsersPage`, `CoursesPage`, `GradingPage` already had concrete `onClick` / navigation per latest code; no change required beyond Header sweep for AUDIT-01 scope in this pass.
- **Docs:** `REQUIREMENTS.md` / `ROADMAP.md` Phase 15 blocks already described inline sidebar forms; list line in v3.0 summary updated for wording consistency.

## Artifacts

| File | Change |
|------|--------|
| `src/components/landing/Header.tsx` | Valid in-app `Link` targets + a11y/click affordances |
| `.planning/ROADMAP.md` | Phase 15 line + plan checkboxes (orchestrator) |

## Self-Check

- `yarn eslint src/components/landing/Header.tsx` — PASS (project-wide lint may still flag `.claude/worktrees` copies)
