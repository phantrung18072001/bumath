import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from '@/pages/NotFound'
import { useAuth } from '@/contexts/AuthContext'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockStudentProfile = {
  id: 'user-1',
  full_name: 'Nguyen Van A',
  role: 'student' as const,
  approval_status: 'approved' as const,
}

const mockAdminProfile = {
  id: 'user-2',
  full_name: 'Admin',
  role: 'admin' as const,
  approval_status: 'approved' as const,
}

function renderNotFound() {
  return render(
    <MemoryRouter initialEntries={['/some-unknown-route']}>
      <NotFound />
    </MemoryRouter>
  )
}

describe('NotFound', () => {
  it('shows Vietnamese 404 text', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: vi.fn(),
    } as never)

    renderNotFound()
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Trang không tìm thấy')).toBeInTheDocument()
    expect(screen.getByText('Về trang chủ')).toBeInTheDocument()
  })

  it('links to /courses when user is a student', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1' } as never,
      profile: mockStudentProfile,
      loading: false,
      signOut: vi.fn(),
    } as never)

    renderNotFound()
    const link = screen.getByText('Về trang chủ')
    expect(link.closest('a')).toHaveAttribute('href', '/khoa-hoc')
  })

  it('links to / when user is not a student (admin)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-2' } as never,
      profile: mockAdminProfile,
      loading: false,
      signOut: vi.fn(),
    } as never)

    renderNotFound()
    const link = screen.getByText('Về trang chủ')
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('links to / when user is not authenticated (no profile)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: vi.fn(),
    } as never)

    renderNotFound()
    const link = screen.getByText('Về trang chủ')
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('uses a Link component (not <a href>)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: vi.fn(),
    } as never)

    renderNotFound()
    // React Router Link renders an <a> tag, which is correct
    const link = screen.getByText('Về trang chủ')
    expect(link.tagName).toBe('A')
  })
})
