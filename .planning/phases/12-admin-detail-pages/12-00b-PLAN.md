---
phase: 12-admin-detail-pages
plan: 00b
type: execute
wave: 0
depends_on: []
files_modified:
  - src/pages/admin/ChaptersPage.test.tsx
  - src/pages/admin/LessonsPage.test.tsx
  - src/pages/admin/SubmissionsPage.test.tsx
autonomous: true
requirements:
  - DS-02
user_setup: []

must_haves:
  truths:
    - "Test scaffolds exist for ChaptersPage and LessonsPage"
    - "SubmissionsPage test mocks getAllSubmissions (not getUngraded)"
  artifacts:
    - path: "src/pages/admin/ChaptersPage.test.tsx"
      provides: "Test scaffold for drag-and-drop"
      min_lines: 30
    - path: "src/pages/admin/LessonsPage.test.tsx"
      provides: "Test scaffold for drag-and-drop"
      min_lines: 30
    - path: "src/pages/admin/SubmissionsPage.test.tsx"
      provides: "Updated mocks for getAllSubmissions"
      contains: "getAllSubmissions"
  key_links:
    - from: "src/pages/admin/ChaptersPage.test.tsx"
      to: "src/lib/api/chapters"
      via: "vi.mock"
      pattern: "batchReorderChapters"
---

<objective>
Wave 0b foundation: Create test scaffolds for drag-and-drop pages and update SubmissionsPage tests.

Purpose: Test-first approach — these RED tests validate implementation tasks in Plans 12-01 and 12-02.
Output: ChaptersPage.test.tsx, LessonsPage.test.tsx scaffolds; SubmissionsPage.test.tsx updated for getAllSubmissions
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
<!-- Reference test file patterns from Phase 11 -->
From src/pages/admin/UsersPage.test.tsx (structure):
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// vi.mock() before component import
// queryClient with retry: false
// renderWithProviders helper
// beforeEach to clear mocks and reset queryClient
// describe blocks with it() tests
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create ChaptersPage.test.tsx and LessonsPage.test.tsx scaffolds</name>
  <files>src/pages/admin/ChaptersPage.test.tsx, src/pages/admin/LessonsPage.test.tsx</files>
  <read_first>
    - src/pages/admin/UsersPage.test.tsx (reference for test patterns and mocking)
    - src/pages/admin/ChaptersPage.tsx (component imports and structure)
    - src/pages/admin/LessonsPage.tsx (component imports and structure)
  </read_first>
  <action>
Per VALIDATION.md Wave 0 requirements: Create test scaffolds that will verify drag handles and skeleton loading after implementation.

**Create src/pages/admin/ChaptersPage.test.tsx:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// Mock API modules before importing component
vi.mock('@/lib/api/courses', () => ({
  fetchCourses: vi.fn(() => Promise.resolve([
    { id: 'course-1', slug: 'toan-7', title: 'Toán 7', target_grade: 'grade_7' }
  ])),
}))

vi.mock('@/lib/api/chapters', () => ({
  fetchChapters: vi.fn(() => Promise.resolve([
    { id: 'ch-1', course_id: 'course-1', title: 'Chương 1', slug: 'chuong-1', order_index: 0 },
    { id: 'ch-2', course_id: 'course-1', title: 'Chương 2', slug: 'chuong-2', order_index: 1 },
  ])),
  removeChapter: vi.fn(),
  batchReorderChapters: vi.fn(() => Promise.resolve()),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function renderWithProviders() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/quan-tri/khoa-hoc/toan-7']}>
        <Routes>
          <Route path="/quan-tri/khoa-hoc/:courseSlug" element={<ChaptersPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

// Lazy import to allow mocks to be set up first
let ChaptersPage: typeof import('@/pages/admin/ChaptersPage').default

beforeEach(async () => {
  vi.clearAllMocks()
  queryClient.clear()
  const mod = await import('@/pages/admin/ChaptersPage')
  ChaptersPage = mod.default
})

describe('ChaptersPage', () => {
  it('renders skeleton loading state', async () => {
    // Make fetchChapters hang to show loading
    const { fetchChapters } = await import('@/lib/api/chapters')
    vi.mocked(fetchChapters).mockImplementation(() => new Promise(() => {}))
    
    renderWithProviders()
    
    expect(screen.getByLabelText('Đang tải...')).toBeInTheDocument()
  })

  it('renders drag handle icons for each chapter row', async () => {
    renderWithProviders()
    
    // Wait for chapters to load
    await screen.findByText('Chương 1')
    
    // Check for GripVertical drag handles (aria-label per UI-SPEC)
    const dragHandles = screen.getAllByLabelText('Kéo để sắp xếp')
    expect(dragHandles).toHaveLength(2)
  })
})
```

**Create src/pages/admin/LessonsPage.test.tsx:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// Mock API modules before importing component
vi.mock('@/lib/api/courses', () => ({
  fetchCourses: vi.fn(() => Promise.resolve([
    { id: 'course-1', slug: 'toan-7', title: 'Toán 7', target_grade: 'grade_7' }
  ])),
}))

vi.mock('@/lib/api/chapters', () => ({
  fetchChapters: vi.fn(() => Promise.resolve([
    { id: 'ch-1', course_id: 'course-1', title: 'Chương 1', slug: 'chuong-1', order_index: 0 }
  ])),
}))

vi.mock('@/lib/api/lessons', () => ({
  fetchLessons: vi.fn(() => Promise.resolve([
    { id: 'les-1', chapter_id: 'ch-1', title: 'Bài 1', order_index: 0 },
    { id: 'les-2', chapter_id: 'ch-1', title: 'Bài 2', order_index: 1 },
  ])),
  removeLesson: vi.fn(),
  batchReorderLessons: vi.fn(() => Promise.resolve()),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function renderWithProviders() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/quan-tri/khoa-hoc/toan-7/chuong/chuong-1']}>
        <Routes>
          <Route path="/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug" element={<LessonsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

// Lazy import to allow mocks to be set up first
let LessonsPage: typeof import('@/pages/admin/LessonsPage').default

beforeEach(async () => {
  vi.clearAllMocks()
  queryClient.clear()
  const mod = await import('@/pages/admin/LessonsPage')
  LessonsPage = mod.default
})

describe('LessonsPage', () => {
  it('renders skeleton loading state', async () => {
    // Make fetchLessons hang to show loading
    const { fetchLessons } = await import('@/lib/api/lessons')
    vi.mocked(fetchLessons).mockImplementation(() => new Promise(() => {}))
    
    renderWithProviders()
    
    expect(screen.getByLabelText('Đang tải...')).toBeInTheDocument()
  })

  it('renders drag handle icons for each lesson row', async () => {
    renderWithProviders()
    
    // Wait for lessons to load
    await screen.findByText('Bài 1')
    
    // Check for GripVertical drag handles (aria-label per UI-SPEC)
    const dragHandles = screen.getAllByLabelText('Kéo để sắp xếp')
    expect(dragHandles).toHaveLength(2)
  })
})
```

These tests will FAIL initially (Wave 0 RED state) until Plan 12-01 adds drag handles and skeleton loading.
  </action>
  <verify>
    <automated>test -f src/pages/admin/ChaptersPage.test.tsx && test -f src/pages/admin/LessonsPage.test.tsx && grep -q "Kéo để sắp xếp" src/pages/admin/ChaptersPage.test.tsx && echo "PASS"</automated>
  </verify>
  <done>Test scaffolds exist and will verify drag handles + skeleton loading</done>
</task>

<task type="auto">
  <name>Task 2: Update SubmissionsPage.test.tsx to mock getAllSubmissions</name>
  <files>src/pages/admin/SubmissionsPage.test.tsx</files>
  <read_first>
    - src/pages/admin/SubmissionsPage.test.tsx (existing tests using getUngraded mock)
    - src/lib/api/submissions.ts (new getAllSubmissions interface from Plan 00a)
  </read_first>
  <action>
Per VALIDATION.md Wave 0: Update the existing SubmissionsPage tests to mock `getAllSubmissions` (not `getUngraded`), add tests for status filter and pagination.

**Update the mock in src/pages/admin/SubmissionsPage.test.tsx:**

Find the existing `vi.mock('@/lib/api/submissions'` block and update it:

```typescript
vi.mock('@/lib/api/submissions', () => ({
  getUngraded: vi.fn(), // Keep for backward compat
  getAllSubmissions: vi.fn(() => Promise.resolve({
    data: [
      {
        id: 'sub-1',
        user_id: 'user-1',
        lesson_id: 'les-1',
        file_path: 'path/to/file.jpg',
        submitted_at: '2026-05-01T10:00:00Z',
        score: null,
        status: 'submitted',
        profiles: { full_name: 'Nguyễn Văn A' },
        lessons: {
          title: 'Bài 1',
          chapters: {
            course_id: 'course-1',
            courses: { title: 'Toán 7', target_grade: 'grade_7' }
          }
        }
      }
    ],
    total: 1
  })),
}))
```

**Add test cases:**

```typescript
describe('SubmissionsPage status filter', () => {
  it('renders status filter Select with "Tất cả trạng thái" default', async () => {
    renderWithProviders()
    
    await screen.findByText('Nguyễn Văn A')
    
    // Per UI-SPEC: status filter is first in filter bar
    expect(screen.getByText('Tất cả trạng thái')).toBeInTheDocument()
  })

  it('calls getAllSubmissions with status filter on selection', async () => {
    const { getAllSubmissions } = await import('@/lib/api/submissions')
    renderWithProviders()
    
    await screen.findByText('Nguyễn Văn A')
    
    expect(getAllSubmissions).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'all' })
    )
  })
})

describe('SubmissionsPage pagination', () => {
  it('shows pagination when total > pageSize', async () => {
    const { getAllSubmissions } = await import('@/lib/api/submissions')
    vi.mocked(getAllSubmissions).mockResolvedValue({
      data: Array.from({ length: 20 }, (_, i) => ({
        id: `sub-${i}`,
        user_id: `user-${i}`,
        lesson_id: 'les-1',
        file_path: 'path/file.jpg',
        submitted_at: '2026-05-01T10:00:00Z',
        score: null,
        status: 'submitted',
        profiles: { full_name: `Student ${i}` },
        lessons: {
          title: 'Bài 1',
          chapters: { course_id: 'c1', courses: { title: 'Toán 7', target_grade: 'grade_7' } }
        }
      })),
      total: 45 // More than 20/page
    })
    
    renderWithProviders()
    
    await screen.findByText('Student 0')
    
    // Per UI-SPEC: pagination shows page controls when total > pageSize
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
  })
})

describe('SubmissionsPage loading', () => {
  it('shows skeleton loading state', async () => {
    const { getAllSubmissions } = await import('@/lib/api/submissions')
    vi.mocked(getAllSubmissions).mockImplementation(() => new Promise(() => {}))
    
    renderWithProviders()
    
    expect(screen.getByLabelText('Đang tải...')).toBeInTheDocument()
  })
})
```

These tests will FAIL initially (Wave 0 RED state) until Plan 12-02 refactors the page.
  </action>
  <verify>
    <automated>grep -q "getAllSubmissions" src/pages/admin/SubmissionsPage.test.tsx && grep -q "Tất cả trạng thái" src/pages/admin/SubmissionsPage.test.tsx && echo "PASS"</automated>
  </verify>
  <done>SubmissionsPage.test.tsx mocks getAllSubmissions and tests status filter + pagination</done>
</task>

</tasks>

<verification>
```bash
# Verify test files exist
test -f src/pages/admin/ChaptersPage.test.tsx && echo "ChaptersPage.test.tsx: OK"
test -f src/pages/admin/LessonsPage.test.tsx && echo "LessonsPage.test.tsx: OK"

# Verify drag handle tests
grep -q "Kéo để sắp xếp" src/pages/admin/ChaptersPage.test.tsx && echo "ChaptersPage drag test: OK"
grep -q "Kéo để sắp xếp" src/pages/admin/LessonsPage.test.tsx && echo "LessonsPage drag test: OK"

# Verify getAllSubmissions mock
grep -q "getAllSubmissions" src/pages/admin/SubmissionsPage.test.tsx && echo "SubmissionsPage getAllSubmissions: OK"
```
</verification>

<success_criteria>
- ChaptersPage.test.tsx exists with skeleton and drag handle tests
- LessonsPage.test.tsx exists with skeleton and drag handle tests
- SubmissionsPage.test.tsx updated to mock getAllSubmissions
- Tests reference correct aria-labels (`Đang tải...`, `Kéo để sắp xếp`)
</success_criteria>

<output>
After completion, create `.planning/phases/12-admin-detail-pages/12-00b-SUMMARY.md`
</output>
