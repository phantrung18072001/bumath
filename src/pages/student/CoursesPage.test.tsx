import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CoursesPage from './CoursesPage'

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    profile: { id: 'test-user-id', full_name: 'Test User', role: 'student' },
    user: { id: 'test-user-id' },
    loading: false,
    signOut: vi.fn(),
  })),
}))

// Mock TanStack Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: [],
      isLoading: false,
      isError: false,
    })),
  }
})

function renderCoursesPage() {
  return render(
    <BrowserRouter>
      <CoursesPage />
    </BrowserRouter>
  )
}

describe('CoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('STUDENT-UI-01: Card layout with progress bars', () => {
    it('renders page heading "Khóa học của tôi"', () => {
      renderCoursesPage()
      expect(screen.getByRole('heading', { name: /khóa học của tôi/i })).toBeInTheDocument()
    })

    it.todo('renders course cards with bm-clay-card-student class')
    it.todo('renders progress bar with h-3 height and teal fill')
    it.todo('renders progress label with format "{N}% hoàn thành"')
    it.todo('links to /khoa-hoc/{slug} not /courses/{slug}')
  })

  describe('STUDENT-UI-04: Empty state', () => {
    it.todo('renders empty state with BookOpen icon when no courses')
    it.todo('renders "Bạn chưa có khóa học nào" heading in empty state')
    it.todo('renders CTA button linking to /danh-muc')
  })

  describe('DS-02: Loading skeleton', () => {
    it.todo('renders 4 skeleton cards with rounded-3xl during loading')
  })

  describe('Error state', () => {
    it.todo('renders error message as plain <p> not <Alert>')
  })
})
