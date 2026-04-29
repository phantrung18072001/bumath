import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// Mock AuthContext
const mockSignOut = vi.fn().mockResolvedValue(undefined)
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    profile: { id: 'admin-1', full_name: 'Admin User', role: 'admin' },
    loading: false,
    signOut: mockSignOut,
  }),
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: vi.fn() }
})

describe('AdminLayout', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue(undefined)
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  async function renderAdminLayout(children: React.ReactNode = <div>Child</div>) {
    const { default: AdminLayout } = await import('./AdminLayout')
    return render(
      <BrowserRouter>
        <AdminLayout>{children}</AdminLayout>
      </BrowserRouter>
    )
  }

  it('renders logout button with text "Đăng xuất"', async () => {
    await renderAdminLayout()
    const logoutButton = screen.getByRole('button', { name: /đăng xuất/i })
    expect(logoutButton).toBeInTheDocument()
  })

  it('renders "Về trang chủ" link pointing to /', async () => {
    await renderAdminLayout()
    const homeLink = screen.getByRole('link', { name: /về trang chủ/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders all nav items', async () => {
    await renderAdminLayout()
    expect(screen.getByRole('link', { name: /quản lý tài khoản/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /quản lý khóa học/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /chấm bài/i })).toBeInTheDocument()
  })

  it('clicking logout calls signOut()', async () => {
    const user = userEvent.setup()
    await renderAdminLayout()

    const logoutButton = screen.getByRole('button', { name: /đăng xuất/i })
    await user.click(logoutButton)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('after signOut resolves, navigates to /login', async () => {
    const user = userEvent.setup()
    await renderAdminLayout()

    const logoutButton = screen.getByRole('button', { name: /đăng xuất/i })
    await user.click(logoutButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })
})
