# Phase 12: Admin Detail Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 12-admin-detail-pages
**Areas discussed:** Status filter + API scope, Reorder UX, GradingPage mobile, Skeleton loading, Server-side filter expansion

---

## Status Filter + API Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All + filter client-side | Change getUngraded to getAllSubmissions, filter client-side | |
| Two separate queries | Keep getUngraded + add second query for graded, merge on filter | |
| Server-side filter | Pass status as Supabase query param — one query with WHERE clause | ✓ |

**User's choice:** Server-side filter
**Notes:** Cleanest for large datasets; requires API function change to getAllSubmissions with filter params.

---

## Graded View Columns

| Option | Description | Selected |
|--------|-------------|----------|
| Same columns + score badge | Same table layout plus a score badge column | ✓ |
| Add graded_at date too | Score badge AND second date column for when grading happened | |
| You decide | Claude picks the layout | |

**User's choice:** Same columns + score badge

---

## Reorder UX — Drag or Arrows

| Option | Description | Selected |
|--------|-------------|----------|
| Keep arrows, polish UI | Polish existing up/down arrows, no new deps | |
| Add drag-and-drop (dnd-kit) | Install @dnd-kit/core + sortable preset, drag rows | ✓ |
| You decide | Claude picks the approach | |

**User's choice:** Add drag-and-drop (dnd-kit)

---

## GradingPage Mobile

| Option | Description | Selected |
|--------|-------------|----------|
| It's fine, just verify | Existing flex-col lg:flex-row is sufficient | |
| Improve mobile UX | Current layout requires too much scrolling on mobile | ✓ |

**User's choice:** Improve mobile UX

---

## Mobile Improvement Type

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky bottom save bar | Score + save button pinned to bottom; user scrolls images | ✓ |
| Tab-based layout on mobile | Two tabs: Bài làm / Chấm bài | |
| You decide | Claude picks mobile improvement | |

**User's choice:** Sticky bottom save bar

---

## Skeleton Loading

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, all pages | Skeleton on SubmissionsPage, ChaptersPage, LessonsPage | ✓ |
| SubmissionsPage only | Skeleton on grading queue only | |
| No, keep Loader2 | Don't change loading states | |

**User's choice:** Yes, all pages

---

## Scope Expansion — Server-Side Filter for UsersPage + CoursesPage

| Option | Description | Selected |
|--------|-------------|----------|
| Fold into Phase 12 | Apply server-side filter to all 3 admin list pages | ✓ |
| Defer to separate phase | Phase 12 only handles SubmissionsPage | |

**User's choice:** Fold into Phase 12
**Notes:** User explicitly requested extending Phase 12 to include UsersPage and CoursesPage migration from client-side to server-side filter + pagination.

---

## Server-Side Pagination Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Everything server-side | Filter AND pagination via Supabase .range(), .ilike(), .eq() | ✓ |
| Server-side filter only | Filter via Supabase, paginate client-side | |

**User's choice:** Everything server-side

---

## Claude's Discretion

- dnd-kit configuration details (SortableContext strategy, collision detection)
- Optimistic vs pessimistic reorder updates
- Supabase count query approach for total pages

## Deferred Ideas

- URL query params for filter state — deferred to later polish phase
- Bulk grading actions
- Advanced sorting on grading queue
