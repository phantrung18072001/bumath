import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

vi.mock('@/contexts/AuthContext', () => ({ useAuth: vi.fn() }))

const mockAdminProfile = {
  id: 'u-1', full_name: 'Admin', phone: '0900000000',
  year_of_birth: 1990, address: '', role: 'admin' as const,
  created_at: '2024-01-01T00:00:00Z',
}

function setRole(role: 'admin' | 'teacher' | 'student') {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'u-1' } as never,
    session: {} as never,
    profile: { ...mockAdminProfile, role },
    loading: false,
    signOut: vi.fn(),
  })
}

describe('AdminLayout', () => {
  async function renderAdminLayout(children: React.ReactNode = <div>Child content</div>) {
    const { default: AdminLayout } = await import('./AdminLayout')
    return render(
      <BrowserRouter>
        <AdminLayout>{children}</AdminLayout>
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setRole('admin')
  })

  it('renders all sidebar nav items', async () => {
    await renderAdminLayout()
    expect(screen.getByRole('link', { name: /quản lý tài khoản/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /quản lý khóa học/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /chấm bài/i })).toBeInTheDocument()
  })

  it('renders children inside main content area', async () => {
    await renderAdminLayout(<div>Test page content</div>)
    expect(screen.getByText('Test page content')).toBeInTheDocument()
  })

  it('nav links point to correct /admin/* paths', async () => {
    await renderAdminLayout()
    expect(screen.getByRole('link', { name: /quản lý tài khoản/i })).toHaveAttribute('href', '/admin/users')
    expect(screen.getByRole('link', { name: /quản lý khóa học/i })).toHaveAttribute('href', '/admin/courses')
    expect(screen.getByRole('link', { name: /chấm bài/i })).toHaveAttribute('href', '/admin/submissions')
  })

  it('hides admin-only nav items when role is teacher', async () => {
    setRole('teacher')
    await renderAdminLayout()
    expect(screen.queryByRole('link', { name: /quản lý tài khoản/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /quản lý khóa học/i })).toBeNull()
    expect(screen.getByRole('link', { name: /chấm bài/i })).toBeInTheDocument()
  })

  it('teacher sees only Chấm bài link pointing to /admin/submissions', async () => {
    setRole('teacher')
    await renderAdminLayout()
    const link = screen.getByRole('link', { name: /chấm bài/i })
    expect(link).toHaveAttribute('href', '/admin/submissions')
  })
})

