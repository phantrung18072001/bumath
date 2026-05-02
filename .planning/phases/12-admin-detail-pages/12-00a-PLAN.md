---
phase: 12-admin-detail-pages
plan: 00a
type: execute
wave: 0
depends_on: []
files_modified:
  - package.json
  - yarn.lock
  - src/lib/api/chapters.ts
  - src/lib/api/lessons.ts
  - src/lib/api/submissions.ts
autonomous: true
requirements:
  - ADMIN-UI-03
  - ADMIN-UI-04
user_setup: []

must_haves:
  truths:
    - "@dnd-kit packages are installed and importable"
    - "Batch reorder API functions exist for chapters and lessons"
    - "getAllSubmissions API function exists with filter params"
  artifacts:
    - path: "package.json"
      provides: "dnd-kit dependencies"
      contains: "@dnd-kit/core"
    - path: "src/lib/api/chapters.ts"
      provides: "batchReorderChapters function"
      exports: ["batchReorderChapters"]
    - path: "src/lib/api/lessons.ts"
      provides: "batchReorderLessons function"
      exports: ["batchReorderLessons"]
    - path: "src/lib/api/submissions.ts"
      provides: "getAllSubmissions function with filters"
      exports: ["getAllSubmissions", "SubmissionsFilter"]
  key_links:
    - from: "package.json"
      to: "node_modules/@dnd-kit"
      via: "yarn install"
      pattern: "@dnd-kit/core"
---

<objective>
Wave 0a foundation: Install dnd-kit packages and create API layer functions that block subsequent Phase 12 plans.

Purpose: Plans 12-01 (dnd-kit UI) and 12-02 (server-side pagination) require these dependencies and API functions to compile.
Output: dnd-kit installed, batchReorderChapters/batchReorderLessons/getAllSubmissions API functions
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/12-admin-detail-pages/12-CONTEXT.md
@.planning/phases/12-admin-detail-pages/12-RESEARCH.md

<interfaces>
<!-- Existing chapter/lesson API functions to extend -->
From src/lib/api/chapters.ts:
```typescript
export interface Chapter {
  id: string
  course_id: string
  title: string
  slug: string
  order_index: number
  created_at: string
  updated_at: string
}
export async function reorderChapters(
  chapterA: Pick<Chapter, 'id' | 'order_index'>,
  chapterB: Pick<Chapter, 'id' | 'order_index'>,
): Promise<void>
```

From src/lib/api/lessons.ts:
```typescript
export interface Lesson {
  id: string
  chapter_id: string
  title: string
  order_index: number
  // ... other fields
}
export async function reorderLessons(
  lessonA: Pick<Lesson, 'id' | 'order_index'>,
  lessonB: Pick<Lesson, 'id' | 'order_index'>,
): Promise<void>
```

From src/lib/api/submissions.ts:
```typescript
export interface UngradedSubmission {
  id: string
  user_id: string
  lesson_id: string
  file_path: string
  submitted_at: string
  profiles: { full_name: string }
  lessons: {
    title: string
    chapters: {
      course_id: string
      courses: { title: string; target_grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced' }
    }
  }
}
export async function getUngraded(): Promise<UngradedSubmission[]>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install @dnd-kit packages</name>
  <files>package.json, yarn.lock</files>
  <read_first>
    - package.json (verify dnd-kit not already present)
  </read_first>
  <action>
Run:
```bash
yarn add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

This installs:
- @dnd-kit/core (DndContext, sensors, collision detection)
- @dnd-kit/sortable (SortableContext, useSortable, arrayMove)
- @dnd-kit/utilities (CSS.Transform.toString helper)

After install, verify by checking import resolves:
```bash
node -e "require.resolve('@dnd-kit/core')"
```
  </action>
  <verify>
    <automated>grep -q '"@dnd-kit/core"' package.json && grep -q '"@dnd-kit/sortable"' package.json && echo "PASS"</automated>
  </verify>
  <done>dnd-kit packages installed and resolvable</done>
</task>

<task type="auto">
  <name>Task 2: Add batchReorderChapters and batchReorderLessons API functions</name>
  <files>src/lib/api/chapters.ts, src/lib/api/lessons.ts</files>
  <read_first>
    - src/lib/api/chapters.ts (see existing reorderChapters that swaps 2 items)
    - src/lib/api/lessons.ts (see existing reorderLessons that swaps 2 items)
  </read_first>
  <action>
Per D-06 and RESEARCH.md Pitfall 1: The existing `reorderChapters`/`reorderLessons` only swap 2 items. dnd-kit drag can move items multiple positions, requiring batch update.

**In src/lib/api/chapters.ts**, add after the existing `reorderChapters` function:

```typescript
/**
 * Batch-update order_index for all chapters after drag-and-drop reorder.
 * Only updates items whose order_index actually changed.
 * @param updates Array of {id, order_index} representing new positions
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
```

**In src/lib/api/lessons.ts**, add after the existing `reorderLessons` function:

```typescript
/**
 * Batch-update order_index for all lessons after drag-and-drop reorder.
 * Only updates items whose order_index actually changed.
 * @param updates Array of {id, order_index} representing new positions
 */
export async function batchReorderLessons(
  updates: { id: string; order_index: number }[]
): Promise<void> {
  for (const { id, order_index } of updates) {
    const { error } = await supabase
      .from('lessons')
      .update({ order_index })
      .eq('id', id)
    if (error) throw error
  }
}
```
  </action>
  <verify>
    <automated>grep -q "export async function batchReorderChapters" src/lib/api/chapters.ts && grep -q "export async function batchReorderLessons" src/lib/api/lessons.ts && echo "PASS"</automated>
  </verify>
  <done>batchReorderChapters and batchReorderLessons exported and callable</done>
</task>

<task type="auto">
  <name>Task 3: Add getAllSubmissions API function with filter params</name>
  <files>src/lib/api/submissions.ts</files>
  <read_first>
    - src/lib/api/submissions.ts (see existing getUngraded function)
    - .planning/phases/12-admin-detail-pages/12-RESEARCH.md lines 271-317 (exact pattern)
  </read_first>
  <action>
Per D-04 and RESEARCH.md Pattern 4: Replace `getUngraded` with `getAllSubmissions` that accepts full filter params including status, grade, course, lesson, studentName, page, pageSize.

**Add interface and function to src/lib/api/submissions.ts:**

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

export interface PaginatedSubmissions {
  data: (UngradedSubmission & { score: number | null; status: string })[]
  total: number
}

/**
 * Fetch submissions with server-side filtering and pagination.
 * Uses Supabase .range() for pagination and .eq()/.ilike() for filters.
 * Per D-04: replaces getUngraded with full filter support.
 */
export async function getAllSubmissions(
  filters: SubmissionsFilter
): Promise<PaginatedSubmissions> {
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

  // Status filter (D-04)
  if (status === 'ungraded') query = query.eq('status', 'submitted')
  else if (status === 'graded') query = query.eq('status', 'graded')
  // status === 'all' — no filter

  // Nested column filters (PostgREST embedded resource filter)
  // RESEARCH.md Pitfall 2: !inner joins required for these filters to work
  if (grade !== 'all') query = query.eq('lessons.chapters.courses.target_grade', grade)
  if (course !== 'all') query = query.eq('lessons.chapters.courses.title', course)
  if (lesson !== 'all') query = query.eq('lessons.title', lesson)
  if (studentName) query = query.ilike('profiles.full_name', `%${studentName}%`)

  // Pagination
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { 
    data: (data ?? []) as PaginatedSubmissions['data'], 
    total: count ?? 0 
  }
}
```

Keep the existing `getUngraded` function for backward compatibility — do NOT delete it.
  </action>
  <verify>
    <automated>grep -q "export async function getAllSubmissions" src/lib/api/submissions.ts && grep -q "export interface SubmissionsFilter" src/lib/api/submissions.ts && echo "PASS"</automated>
  </verify>
  <done>getAllSubmissions exported with full filter + pagination support</done>
</task>

</tasks>

<verification>
```bash
# Verify dnd-kit installed
grep -q '"@dnd-kit/core"' package.json && echo "dnd-kit: OK"

# Verify batch reorder functions
grep -q "batchReorderChapters" src/lib/api/chapters.ts && echo "batchReorderChapters: OK"
grep -q "batchReorderLessons" src/lib/api/lessons.ts && echo "batchReorderLessons: OK"

# Verify getAllSubmissions
grep -q "getAllSubmissions" src/lib/api/submissions.ts && echo "getAllSubmissions: OK"
grep -q "SubmissionsFilter" src/lib/api/submissions.ts && echo "SubmissionsFilter: OK"
```
</verification>

<success_criteria>
- dnd-kit packages installed (check package.json)
- batchReorderChapters exported from chapters.ts
- batchReorderLessons exported from lessons.ts
- getAllSubmissions and SubmissionsFilter exported from submissions.ts
- TypeScript compiles without errors
</success_criteria>

<output>
After completion, create `.planning/phases/12-admin-detail-pages/12-00a-SUMMARY.md`
</output>
