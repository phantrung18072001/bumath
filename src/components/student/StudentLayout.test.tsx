import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    profile: { id: 'user-1', full_name: 'Test User', role: 'student' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

// Mock BellNotification to avoid query dependencies
vi.mock('@/components/student/BellNotification', () => ({
  default: () => <div data-testid="bell-mock" />,
}))

describe('StudentLayout', () => {
  async function renderStudentLayout(children: React.ReactNode = <div>Child</div>) {
    const { default: StudentLayout } = await import('./StudentLayout')
    return render(
      <BrowserRouter>
        <StudentLayout>{children}</StudentLayout>
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders logo as a Link with aria-label "Trang chủ BuMath"', async () => {
    await renderStudentLayout()
    const logoLink = screen.getByRole('link', { name: 'Trang chủ BuMath' })
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('renders logo image with correct src and alt', async () => {
    await renderStudentLayout()
    const logoImg = screen.getByAltText('BuMath-X')
    expect(logoImg).toBeInTheDocument()
    expect(logoImg).toHaveAttribute('src', expect.stringContaining('bumathx.png'))
  })

  it('renders nav link "Khóa học của tôi" pointing to /courses', async () => {
    await renderStudentLayout()
    const myCoursesLink = screen.getByRole('link', { name: 'Khóa học của tôi' })
    expect(myCoursesLink).toBeInTheDocument()
    expect(myCoursesLink).toHaveAttribute('href', '/khoa-hoc')
  })

  it('renders nav link "Khám phá khóa học" pointing to /catalogue', async () => {
    await renderStudentLayout()
    const catalogueLink = screen.getByRole('link', { name: 'Khám phá khóa học' })
    expect(catalogueLink).toBeInTheDocument()
    expect(catalogueLink).toHaveAttribute('href', '/danh-muc')
  })

  it('renders Quản trị link to /admin/users when role is admin', async () => {
    const { useAuth } = await import('@/contexts/AuthContext')
    vi.mocked(useAuth).mockReturnValueOnce({
      profile: { id: 'admin-1', full_name: 'Admin User', role: 'admin' },
      loading: false,
      signOut: vi.fn(),
    } as never)
    await renderStudentLayout()
    const adminLink = screen.getByRole('link', { name: /quản trị/i })
    expect(adminLink).toBeInTheDocument()
    expect(adminLink).toHaveAttribute('href', '/quan-tri/nguoi-dung')
  })

  it('does NOT render Quản trị link when role is student', async () => {
    // Default mock returns role: 'student' — no override needed
    await renderStudentLayout()
    expect(screen.queryByRole('link', { name: /quản trị/i })).not.toBeInTheDocument()
  })
})
