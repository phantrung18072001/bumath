import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

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
})

