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
  deleteAssignment: vi.fn(),
  getAssignmentPublicUrl: vi.fn(() => 'https://example.com/file.pdf'),
  parseAssignmentPaths: vi.fn(() => []),
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
