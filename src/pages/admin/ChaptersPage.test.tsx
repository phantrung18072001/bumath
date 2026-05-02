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
