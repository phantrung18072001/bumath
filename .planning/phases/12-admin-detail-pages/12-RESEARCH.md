# Phase 12: Admin Detail Pages — Research

**Researched:** 2026-05-02
**Domain:** React admin UI — dnd-kit drag-and-drop, Supabase server-side pagination, mobile UX
**Confidence:** HIGH (based on direct code inspection + verified library versions)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** UsersPage, CoursesPage, and SubmissionsPage all migrate to fully server-side: filter AND pagination use Supabase query params (`.range()` for pagination, `.ilike()` for search, `.eq()` for role/grade/status). Only fetch current page's rows — no loading all data into memory.
- **D-02:** Page size: UsersPage = 25/page (preserves Phase 11 size), CoursesPage = 20/page (preserves Phase 11 size), SubmissionsPage = 20/page (per roadmap success criteria).
- **D-03:** Filter state remains in local `useState` (no URL query params in Phase 12). Filter change resets `currentPage` to 1.
- **D-04:** Add status filter (graded/ungraded/all) as a server-side Supabase query param. The existing `getUngraded` function is replaced or overloaded by a new `getAllSubmissions(filters)` function that accepts `{ status?: 'graded' | 'ungraded', grade?, course?, lesson?, studentName?, page, pageSize }`.
- **D-05:** When viewing graded submissions, show same table columns (student, course, lesson, date submitted) plus a score badge column. No `graded_at` date column needed.
- **D-06:** Install `@dnd-kit/core` + `@dnd-kit/sortable` to replace up/down arrow buttons in ChaptersPage and LessonsPage. Rows become draggable via a drag handle icon. On drop, call the existing `reorderChapters`/`reorderLessons` mutation.
- **D-07:** Drag handle uses a `GripVertical` icon (Lucide) as the visual affordance. Existing edit/delete buttons remain unchanged.
- **D-08:** On mobile (below `lg` breakpoint), add a sticky bottom bar that pins the score input + "Lưu điểm" button to the bottom of the viewport. Scrollable image area above. Desktop layout (side-by-side sticky sidebar) unchanged.
- **D-09:** The double-confirm ("Bạn chắc chắn...") UI remains — it appears inside the sticky bar on mobile, or in the sidebar on desktop.
- **D-10:** Replace Loader2 spinner with 5× `<Skeleton className="h-10 w-full rounded-md" />` rows wrapped in `<div className="space-y-2">` with `<div aria-busy="true" aria-label="Đang tải...">` wrapper — consistent with Phase 11 pattern — in SubmissionsPage, ChaptersPage, and LessonsPage.
- **D-11:** Admin pages use clean admin theme only — no Claymorphism borders, no float symbols, no `--bm-*` variables.
- **D-12:** Radix Select sentinel value `'all'` (not empty string) for default "show all" options.
- **D-13:** `min-h-[48px]` on all row action buttons.

### the agent's Discretion

- Exact dnd-kit configuration (SortableContext strategy, collision detection algorithm) — use array strategy with closestCenter
- Optimistic vs pessimistic reorder updates — can optimistically update UI before Supabase confirms
- Supabase count query approach for total pages — use `{ count: 'exact', head: false }` option alongside data fetch

### Deferred Ideas (OUT OF SCOPE)

- URL query params for filter/search state — local state is sufficient; URL persistence can be added in a later polish phase
- Bulk grading actions — too large for Phase 12 scope
- Advanced sorting (by date, score) on grading queue — not requested
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-UI-03 | Trang chi tiết khóa học / chương bài — layout rõ ràng, UX quản lý thứ tự bài học dễ dùng | dnd-kit drag-and-drop replaces up/down arrows in ChaptersPage + LessonsPage |
| ADMIN-UI-04 | Hàng đợi chấm bài — phân trang (20/trang), filter hiện tại giữ nguyên, thêm filter trạng thái (chưa chấm/đã chấm) | New `getAllSubmissions()` API, server-side pagination pattern from UsersPage, status filter UI |
| ADMIN-UI-05 | Trang chấm bài chi tiết — layout 2 cột (ảnh + form), UX tốt hơn trên mobile | Mobile sticky bottom bar `fixed bottom-0 lg:hidden` |
| DS-01 | Hệ thống màu, spacing, typography đồng nhất trên tất cả trang (không phải landing) | Admin clean theme only — no BM variables, no Claymorphism |
| DS-02 | Loading skeleton thay thế spinner trên các trang fetch data | Phase 11 `Skeleton` pattern — 5× rows with `aria-busy` wrapper |
</phase_requirements>

---

## Summary

Phase 12 refactors 5 existing admin pages with 4 distinct workstreams: (1) dnd-kit drag-and-drop replacing up/down arrows in ChaptersPage and LessonsPage, (2) server-side pagination + status filter for SubmissionsPage, (3) server-side pagination migration for UsersPage and CoursesPage, and (4) GradingPage mobile sticky bar. All changes are modifications to existing code — no new pages or DB schema changes.

**Critical blocker discovered:** `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` are **NOT installed** — must be added in Wave 0 before any dnd-kit code is written. Confirmed by `ls node_modules/@dnd-kit` returning NOT INSTALLED.

**Critical architecture gap:** The existing `reorderChapters` and `reorderLessons` API functions **only swap two items' `order_index`**. With dnd-kit, dragging an item multiple positions requires updating ALL intermediate items. New `batchReorderChapters` / `batchReorderLessons` API functions are required that accept a full ordered array of `{id, order_index}` updates.

**UsersPage and CoursesPage are still client-side** — Phase 11 shipped with client-side filter/pagination (confirmed by reading the source). D-01 migration is a real workload in Phase 12.

**Primary recommendation:** Plan 5 waves: (1) install + API layer, (2) dnd-kit pages, (3) SubmissionsPage server-side, (4) UsersPage + CoursesPage server-side, (5) GradingPage mobile + skeleton + tests.

---

## Standard Stack

### Core (verified installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/react-query` | ^5.83.0 | Server state fetching, caching, pagination | Project-wide pattern — all data fetching uses `useQuery` + `useMutation` |
| `@supabase/supabase-js` | 2.78.0 | Backend queries, `.range()`, `.eq()`, `.ilike()` count | Pinned (Node 18 compat — DO NOT upgrade) |
| `shadcn/ui` | (installed) | Table, Skeleton, Pagination, Badge, Select, Button | Project UI standard |
| `lucide-react` | (installed) | `GripVertical`, `Loader2`, icons | Project icon standard |
| `sonner` | (installed) | Toast notifications | Project toast standard |

### To Install (NOT YET PRESENT)

| Library | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| `@dnd-kit/core` | 6.3.1 | Drag-and-drop context, sensors, collision detection | `yarn add @dnd-kit/core` |
| `@dnd-kit/sortable` | 10.0.0 | SortableContext, useSortable hook, arrayMove | `yarn add @dnd-kit/sortable` |
| `@dnd-kit/utilities` | 3.2.2 | CSS.Transform utility for transform style string | `yarn add @dnd-kit/utilities` |

**Installation:**
```bash
yarn add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Version verification:** Verified against npm registry on 2026-05-02.

---

## Architecture Patterns

### Established Skeleton Loading Pattern (Phase 11 — UsersPage)

```tsx
// UsersPage.tsx lines 200-209 — COPY THIS EXACT PATTERN
{isLoading ? (
  <div aria-busy="true" aria-label="Đang tải...">
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  </div>
) : ...}
```

Use in: SubmissionsPage, ChaptersPage, LessonsPage (replace `Loader2` spinner).

### Established Pagination Pattern (Phase 11 — UsersPage)

```tsx
// buildPageNumbers helper — copy from UsersPage.tsx lines 50-53
function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1)
  return [1, 2, 'ellipsis', total - 1, total]
}

// Pagination UI with PaginationPrevious / PaginationLink / PaginationNext
// Pattern already exists in UsersPage.tsx lines 232-281 — reuse for SubmissionsPage
```

### Pattern 1: dnd-kit Sortable Table Rows

**What:** Wrap `TableBody` in `DndContext` + `SortableContext`. Each row is a component using `useSortable`. On drag end, call `batchReorderChapters`.

**When to use:** ChaptersPage + LessonsPage sortable rows.

```tsx
// Source: @dnd-kit/sortable docs
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 1. Sensors (pointer + keyboard for a11y)
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
)

// 2. DragEnd handler — compute new order, call batch mutation
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return
  const oldIndex = chapters.findIndex((c) => c.id === active.id)
  const newIndex = chapters.findIndex((c) => c.id === over.id)
  const reordered = arrayMove(chapters, oldIndex, newIndex)
  // Optimistic update via queryClient.setQueryData
  queryClient.setQueryData(['admin', 'chapters', course?.id], reordered)
  // Persist: batch update all changed order_indexes
  reorderMutation.mutate(
    reordered.map((c, i) => ({ id: c.id, order_index: i }))
  )
}

// 3. Wrap table
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
    <TableBody>
      {chapters.map((chapter, index) => (
        <SortableChapterRow key={chapter.id} chapter={chapter} index={index} ... />
      ))}
    </TableBody>
  </SortableContext>
</DndContext>

// 4. SortableRow component
function SortableChapterRow({ chapter, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button
          className="cursor-grab active:cursor-grabbing touch-none"
          aria-label="Kéo để sắp xếp"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      {/* ... rest of cells ... */}
    </TableRow>
  )
}
```

### Pattern 2: New batchReorder API Functions

**What:** Replace the 2-item swap with a full array update. Required because dnd-kit can move items by more than 1 position.

**When to use:** ChaptersPage and LessonsPage mutations after drag-end.

```typescript
// src/lib/api/chapters.ts — ADD this function
/**
 * Batch-update order_index for all chapters in a course after drag-and-drop reorder.
 * Each item in updates = { id, order_index (new) }.
 */
export async function batchReorderChapters(
  updates: { id: string; order_index: number }[]
): Promise<void> {
  for (const { id, order_index } of updates) {
    const { error } = await supabase
      .from('chapters')
      .update({ order_index })
      .eq('id', id)
    if (error) throw error
  }
}

// Same pattern for src/lib/api/lessons.ts → batchReorderLessons
```

> **Note:** Only update items whose `order_index` actually changed (compare pre/post arrayMove) to minimize Supabase calls.

### Pattern 3: Supabase Server-Side Pagination with Count

**What:** Use `.range(from, to)` + `{ count: 'exact' }` on select to get both page data and total count.

**When to use:** All 3 list pages migrating to server-side (UsersPage, CoursesPage, SubmissionsPage).

```typescript
// Count query pattern — already used in submissions.ts (getUnviewedGradeCount)
const from = (page - 1) * pageSize
const to = from + pageSize - 1

const { data, error, count } = await supabase
  .from('submissions')
  .select('id, ...joined_fields...', { count: 'exact' })
  .eq('status', mappedStatus)           // server-side status filter
  .range(from, to)                      // pagination

if (error) throw error
return { data: data ?? [], total: count ?? 0 }
```

### Pattern 4: SubmissionsPage getAllSubmissions with Nested Filters

**What:** New API function replacing `getUngraded`. Accepts full filter params and uses Supabase PostgREST embedded resource filtering.

```typescript
export interface SubmissionsFilter {
  status: 'all' | 'graded' | 'ungraded'
  grade: string          // 'all' | 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
  course: string         // 'all' | course title string
  lesson: string         // 'all' | lesson title string
  studentName: string    // '' = no filter
  page: number
  pageSize: number
}

export async function getAllSubmissions(
  filters: SubmissionsFilter
): Promise<{ data: UngradedSubmission[], total: number }> {
  const { status, grade, course, lesson, studentName, page, pageSize } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('submissions')
    .select(`
      id, user_id, lesson_id, file_path, submitted_at, score, status,
      profiles!inner ( full_name ),
      lessons!inner (
        title,
        chapters!inner ( course_id, courses!inner ( title, target_grade ) )
      )
    `, { count: 'exact' })
    .order('submitted_at', { ascending: true })

  // Status filter
  if (status === 'ungraded') query = query.eq('status', 'submitted')
  else if (status === 'graded') query = query.eq('status', 'graded')
  // status === 'all' — no filter

  // Nested column filters (PostgREST embedded resource filter)
  if (grade !== 'all') query = query.eq('lessons.chapters.courses.target_grade', grade)
  if (course !== 'all') query = query.eq('lessons.chapters.courses.title', course)
  if (lesson !== 'all') query = query.eq('lessons.title', lesson)
  if (studentName) query = query.filter('profiles.full_name', 'ilike', `%${studentName}%`)

  // Pagination
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as UngradedSubmission[], total: count ?? 0 }
}
```

> **Pitfall:** Supabase PostgREST embedded table filtering with `.eq('lessons.chapters.courses.target_grade', grade)` requires using `!inner` joins in the select string. Without `!inner`, the filter may not apply correctly. Always pair `!inner` in SELECT with the corresponding filter.

### Pattern 5: GradingPage Mobile Sticky Bottom Bar

**What:** Add a second rendering of the grading form controls (score + save button) that is `fixed bottom-0` and `lg:hidden`. The desktop sidebar remains as `hidden lg:block`.

```tsx
{/* Desktop: sticky sidebar (existing, add hidden lg:block) */}
<div className="hidden lg:block w-80 shrink-0 lg:sticky lg:top-8 space-y-5">
  {/* full form */}
</div>

{/* Mobile: sticky bottom bar (new) */}
<div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t p-4 lg:hidden space-y-3">
  <div className="flex items-center gap-2">
    <Input type="number" min={0} max={10} step={0.5} className="w-24" value={score} onChange={...} placeholder="0–10" />
    <span className="text-sm text-muted-foreground">/10</span>
  </div>
  {!pendingConfirm ? (
    <Button className="w-full min-h-[48px]" onClick={handleSave} disabled={score === ''}>
      Lưu điểm
    </Button>
  ) : (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Bạn chắc chắn muốn lưu điểm {score}/10?</p>
      <div className="flex gap-2">
        <Button className="flex-1 min-h-[48px]" onClick={handleConfirm} disabled={saving}>Xác nhận</Button>
        <Button variant="outline" className="flex-1 min-h-[48px]" onClick={handleCancel}>Hủy</Button>
      </div>
    </div>
  )}
</div>

{/* Spacer to prevent content being hidden behind fixed bar on mobile */}
<div className="h-32 lg:hidden" />
```

> **Note:** The main scrollable image area should remain above (not inside) any fixed container. The `flex-col lg:flex-row` layout on the outer `div` stays unchanged. Just add `pb-32 lg:pb-0` to the scrollable content area on mobile to compensate for the fixed bar height.

### Pattern 6: UsersPage / CoursesPage Server-Side Migration

**What:** Replace the current "fetch all + client-side filter/paginate" with Supabase `.range()` + `.ilike()` + `.eq()`.

**Current state (confirmed):** Both pages load ALL data via `fetchCourses()` / inline supabase query, then `filtered.slice()` for pagination. Page size is stored in local state but defaults to 10.

**Target:** Add server-side query functions to API layer, update queryKey to include filter params, preserve Skeleton + Pagination UI components.

```typescript
// New: src/lib/api/courses.ts
export async function fetchCoursesPaginated(params: {
  page: number
  pageSize: number
  grade: string        // 'all' | 'grade_7' etc.
  search: string       // '' | search term
}): Promise<{ data: Course[]; total: number }> {
  const { page, pageSize, grade, search } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('courses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (grade !== 'all') query = query.eq('target_grade', grade)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as Course[], total: count ?? 0 }
}
```

**QueryKey must include filter params** to trigger refetch on filter/page change:
```typescript
queryKey: ['admin', 'courses', { page: currentPage, pageSize, grade: gradeFilter, search: searchQuery }]
```

### Anti-Patterns to Avoid

- **Client-side slice after loading all data:** Already present in UsersPage + CoursesPage — remove this pattern; replace with `.range()`.
- **Forgetting `!inner` in joined select:** Without `!inner`, PostgREST returns NULL rows for unmatched joins. Always use `!inner` when you will filter on the joined table.
- **Using `reorderChapters` (2-item swap) with dnd-kit:** The existing 2-item swap only works for adjacent moves. Drag-to-arbitrary-position requires a batch update — use `batchReorderChapters`.
- **Not adding `touch-none` to drag handle:** Without `touch-none` Tailwind class on the drag handle button, mobile touch events conflict with scroll. Always add `touch-none` to the `{...listeners}` element.
- **Fixed bottom bar without spacer:** Without a bottom spacer (`h-32 lg:hidden`), the last content item scrolls behind the fixed bar and becomes untappable on mobile.
- **Using empty string instead of `'all'` for Select sentinel:** D-12 requires `value='all'` not `value=''`. Radix Select doesn't allow empty string values.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop sortable rows | Custom mouse/touch event handlers | `@dnd-kit/sortable` | Handles pointer, keyboard, screen readers, touch coalescing, auto-scroll |
| Pagination page number generation | Custom ellipsis logic | Copy `buildPageNumbers` from UsersPage | Already tested and matches design |
| Image zoom on submission photos | Custom lightbox | `react-medium-image-zoom` (already installed) | Already in use in GradingPage |
| Supabase count queries | `.select()` then `.length` | `{ count: 'exact' }` in select options | Single round-trip, server-accurate count |
| CSS transform strings for dnd-kit | Manual `translate3d(...)` | `CSS.Transform.toString(transform)` from `@dnd-kit/utilities` | Handles all edge cases (null, scale, rotation) |

---

## Common Pitfalls

### Pitfall 1: reorderChapters Only Swaps 2 Items — Must Replace with Batch
**What goes wrong:** Developer calls existing `reorderChapters(dragged, landed)` — this only swaps those 2 rows. All intermediate rows keep their old `order_index`. After refetch, order is visually wrong.
**Why it happens:** `reorderChapters` was written for up/down button (adjacent-only moves). dnd-kit allows arbitrary position changes.
**How to avoid:** Add `batchReorderChapters(updates: {id, order_index}[])` to `src/lib/api/chapters.ts`. After `arrayMove`, iterate the result and send `{id, order_index: newIndex}` for all changed positions.
**Warning signs:** After dragging a chapter >1 position and refetching, chapters appear in wrong order.

### Pitfall 2: Supabase Filter on Embedded Tables Requires `!inner` Join
**What goes wrong:** `.select('*, lessons(title, chapters(courses(target_grade)))')` + `.eq('lessons.chapters.courses.target_grade', 'grade_7')` returns all rows (filter silently ignored) because the default join is LEFT JOIN, not INNER JOIN.
**Why it happens:** PostgREST only applies embedded filters on `!inner` joins.
**How to avoid:** Use `lessons!inner(title, chapters!inner(courses!inner(target_grade)))` in the SELECT string whenever you intend to filter on the joined table.
**Warning signs:** Grade/course/lesson filters have no effect on returned row count.

### Pitfall 3: Mobile GradingPage — Fixed Bar Hides Bottom Content
**What goes wrong:** Score input and save button visible at bottom, but last scroll content (comment textarea, teacher image upload) is permanently hidden under the fixed bar.
**Why it happens:** `fixed bottom-0` removes the bar from layout flow — content behind it is unreachable.
**How to avoid:** Add `<div className="h-32 lg:hidden" />` as the last element inside the scrollable area, OR add `pb-32 lg:pb-0` to the form container on mobile.
**Warning signs:** Can't tap the teacher image upload button on mobile.

### Pitfall 4: dnd-kit Touch Drag Conflicts with Page Scroll
**What goes wrong:** On mobile, touching the drag handle immediately starts page scroll instead of drag.
**Why it happens:** Touch events are shared between scroll and drag without constraints.
**How to avoid:** Add `touch-none` Tailwind class to the drag handle button element (the one with `{...listeners}`). Do NOT add to the whole row — only the handle.
**Warning signs:** Dragging on mobile scrolls the page instead of moving the row.

### Pitfall 5: QueryKey Stale Cache on Filter Change
**What goes wrong:** Changing grade filter on CoursesPage doesn't refetch — shows stale data from previous grade.
**Why it happens:** QueryKey is static `['admin', 'courses']` — React Query sees it as the same query.
**How to avoid:** Include all filter params in the queryKey: `['admin', 'courses', { page, pageSize, grade, search }]`. Any change in params triggers a new fetch.
**Warning signs:** Filter changes don't update the table; pagination shows wrong total.

### Pitfall 6: SubmissionsPage Cascading Filter Options With Server-Side Pagination
**What goes wrong:** When server-side pagination is active, the grade/course/lesson dropdown options should show only values present in the FULL dataset — but if we only load the current page, the dropdowns only reflect the 20 visible rows.
**Why it happens:** Client-side cascading was built on the full dataset. Server-side only returns a page.
**How to avoid:** Add a separate lightweight "metadata" query that fetches all unique grade+course+lesson combinations (just IDs + titles, no pagination) to populate the cascading dropdowns. Alternatively, use a separate `getSubmissionFilterOptions()` API function.
**Warning signs:** Grade dropdown shows only 1–2 grades even though more exist; course dropdown resets oddly when changing pages.

---

## Code Examples

### dnd-kit SortableContext + useSortable (minimal working pattern)
```tsx
// Source: @dnd-kit/sortable README + direct inspection of v10.0.0
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

// -- In parent component --
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
)

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return
  const oldIdx = items.findIndex(i => i.id === active.id)
  const newIdx = items.findIndex(i => i.id === over.id)
  const newOrder = arrayMove(items, oldIdx, newIdx)
  // Optimistic update
  queryClient.setQueryData(queryKey, newOrder)
  // Persist only changed items
  const updates = newOrder
    .map((item, idx) => ({ id: item.id, order_index: idx }))
    .filter((u, idx) => u.order_index !== items[idx]?.order_index)
  batchMutation.mutate(updates)
}

<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
    <TableBody>
      {items.map((item, index) => (
        <SortableRow key={item.id} item={item} index={index} />
      ))}
    </TableBody>
  </SortableContext>
</DndContext>

// -- SortableRow --
function SortableRow({ item, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
    >
      <TableCell>
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1"
          aria-label="Kéo để sắp xếp"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      {/* ... */}
    </TableRow>
  )
}
```

### Supabase Server-Side Count + Pagination (verified pattern from submissions.ts)
```typescript
// Source: existing submissions.ts getUnviewedGradeCount + Supabase docs
const { count, error } = await supabase
  .from('submissions')
  .select('*', { count: 'exact', head: true })  // head: true = no data, just count
  .eq('status', 'graded')
  .is('student_viewed_at', null)

// For paginated data + count in one query:
const { data, error, count } = await supabase
  .from('courses')
  .select('*', { count: 'exact' })   // head: false (default) = data + count
  .order('created_at', { ascending: false })
  .range(from, to)
```

### Score Badge for Graded Submissions (ADMIN-UI-04)
```tsx
// D-05: score badge column when viewing graded submissions
// Use existing Badge component with green/teal variant
{row.score !== null && (
  <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 font-mono">
    {row.score}/10
  </Badge>
)}
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@dnd-kit/core` | ChaptersPage, LessonsPage drag-and-drop | ✗ | — | None — must install |
| `@dnd-kit/sortable` | ChaptersPage, LessonsPage sortable rows | ✗ | — | None — must install |
| `@dnd-kit/utilities` | CSS transform helper | ✗ | — | None — must install |
| `yarn` | Package installation | ✓ | 4.11.0 | — |
| Supabase backend | All API queries | ✓ | 2.78.0 pinned | — |
| `Skeleton` (shadcn) | DS-02 loading states | ✓ | installed | — |
| `Pagination` (shadcn) | Pagination UI | ✓ | installed | — |
| `GripVertical` (Lucide) | Drag handle icon | ✓ | installed | — |

**Missing dependencies with no fallback:**
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — must install before ChaptersPage/LessonsPage work can begin. Wave 0 task.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + React Testing Library 16.0.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test src/pages/admin/SubmissionsPage.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-UI-03 | ChaptersPage renders drag handles (GripVertical) | unit | `yarn test src/pages/admin/ChaptersPage.test.tsx` | ❌ Wave 0 |
| ADMIN-UI-03 | LessonsPage renders drag handles | unit | `yarn test src/pages/admin/LessonsPage.test.tsx` | ❌ Wave 0 |
| ADMIN-UI-04 | SubmissionsPage renders status filter Select | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ✅ (needs update) |
| ADMIN-UI-04 | SubmissionsPage calls getAllSubmissions (not getUngraded) | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ✅ (needs update) |
| ADMIN-UI-04 | SubmissionsPage shows pagination when total > 20 | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ✅ (needs update) |
| ADMIN-UI-05 | GradingPage renders sticky bottom bar element on mobile | unit (manual) | manual-only — jsdom has no real breakpoint | N/A |
| DS-02 | SubmissionsPage shows Skeleton on load (not Loader2) | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ✅ (needs update) |
| DS-02 | ChaptersPage shows Skeleton on load | unit | `yarn test src/pages/admin/ChaptersPage.test.tsx` | ❌ Wave 0 |

> **Note on GradingPage mobile test:** `lg:hidden` / CSS breakpoints are not testable in jsdom. Validate GradingPage mobile sticky bar by: (1) confirming the `fixed bottom-0 left-0 right-0 lg:hidden` element exists in the DOM, and (2) manually checking in browser devtools mobile emulation.

### Sampling Rate
- **Per task commit:** `yarn test src/pages/admin/<PageUnderChange>.test.tsx`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/pages/admin/ChaptersPage.test.tsx` — covers ADMIN-UI-03 (drag handles rendered, Skeleton on load)
- [ ] `src/pages/admin/LessonsPage.test.tsx` — covers ADMIN-UI-03 (drag handles rendered, Skeleton on load)
- [ ] Install: `yarn add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` — blocks all dnd-kit code
- [ ] Update `src/pages/admin/SubmissionsPage.test.tsx` — mock `getAllSubmissions` (not `getUngraded`), add status filter + pagination tests

---

## Open Questions

1. **Cascading filter options source for paginated SubmissionsPage**
   - What we know: Grade/course/lesson dropdowns in SubmissionsPage need all available values to be useful. Server-side pagination means the current page has at most 20 rows — not enough to build cascading options.
   - What's unclear: Should cascading filter options come from (a) a separate metadata query fetching all unique grade+course+lesson combos, or (b) only the current-page data?
   - Recommendation: Add `getSubmissionFilterOptions()` API function that fetches distinct grade+course+lesson values without pagination. This function is called once on mount and provides the dropdown options. It's fast (no joins, just `distinct` on lightweight fields). This preserves the cascading UX while keeping the main table paginated.

2. **Optimistic update reliability for batch reorder**
   - What we know: We can call `queryClient.setQueryData()` before the Supabase mutation to show instant UI response. If the mutation fails, we need to rollback.
   - What's unclear: The `useMutation` `onError` callback needs to call `queryClient.invalidateQueries()` to revert. Is this sufficient?
   - Recommendation: In `reorderMutation.onError`, call `queryClient.invalidateQueries({ queryKey: ['admin', 'chapters', course?.id] })` — this refetches the true DB order and corrects any optimistic mismatch.

3. **UsersPage and CoursesPage: profile/course data used in other queries**
   - What we know: `queryKey: ['admin', 'courses']` and `queryKey: ['admin', 'profiles']` are referenced by other components (ChaptersPage uses `['admin', 'courses']` to find course by slug).
   - What's unclear: When paginated, `['admin', 'courses', {page, ...}]` won't satisfy ChaptersPage's `['admin', 'courses']` lookup.
   - Recommendation: Keep a **separate non-paginated query** `fetchCourses()` for slug lookup (ChaptersPage/LessonsPage breadcrumb). The paginated query is a NEW distinct query for the CoursesPage list. Do not replace the existing `fetchCourses` function — ADD `fetchCoursesPaginated` alongside it.

---

## Project Constraints (from copilot-instructions.md / CLAUDE.md)

- **Package manager:** `yarn` only — never `npm install`
- **UI components:** Always use shadcn/ui or Radix primitives before custom components. Install via `yarn dlx shadcn@latest add <name>` if missing.
- **TypeScript:** Strict mode disabled; `noImplicitAny` is off — no need for exhaustive type annotations
- **Testing:** Vitest + React Testing Library; jsdom; globals enabled (no imports needed for `describe`/`it`/`expect`)
- **Supabase pinned to 2.78.0** — DO NOT upgrade (Node 18 compat)
- **Path alias:** `@/` maps to `src/` — use everywhere
- **Admin design:** Clean admin theme only — no `--bm-*` CSS variables, no Claymorphism

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `src/pages/admin/SubmissionsPage.tsx`, `GradingPage.tsx`, `ChaptersPage.tsx`, `LessonsPage.tsx`, `UsersPage.tsx`, `CoursesPage.tsx`
- Direct file inspection: `src/lib/api/submissions.ts`, `chapters.ts`, `lessons.ts`, `courses.ts`
- `package.json` — verified installed packages
- `node_modules/@dnd-kit` — confirmed NOT installed
- `vitest.config.ts` — test configuration
- `.planning/phases/12-admin-detail-pages/12-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0, @dnd-kit/utilities 3.2.2 — verified via `npm view` command
- Supabase PostgREST embedded resource filter syntax — based on Supabase documentation patterns (`.eq('table.column', value)` with `!inner` join)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via direct inspection + npm view
- Architecture: HIGH — patterns derived from actual existing code (UsersPage, submissions.ts)
- dnd-kit patterns: MEDIUM — based on library documentation + training data; verify `!inner` join filter behavior in Supabase
- Pitfalls: HIGH — all derived from actual code gaps found in inspection

**Research date:** 2026-05-02
**Valid until:** 2026-06-02 (stable libraries; Supabase API is stable)
