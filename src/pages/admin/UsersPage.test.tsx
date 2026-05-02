import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UsersPage from './UsersPage'

// --- Mock data ---

const defaultProfiles = [
  {
    id: 'user-1',
    full_name: 'Nguyen Van A',
    phone: '+84912345678',
    year_of_birth: 2010,
    address: 'Ha Noi',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    full_name: 'Tran Thi B',
    phone: '+84987654321',
    year_of_birth: 2011,
    address: 'Ho Chi Minh',
    role: 'admin',
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 'user-3',
    full_name: 'Le Van C',
    phone: '+84999888777',
    year_of_birth: 2012,
    address: 'Da Nang',
    role: 'teacher',
    created_at: '2026-01-03T00:00:00Z',
  },
]

// --- Mocks ---

vi.mock('@/lib/api/profiles', () => ({
  fetchProfilesPaginated: vi.fn(),
}))

vi.mock('@/components/admin/UserEnrollmentDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="enrollment-dialog" /> : null,
}))

// --- Helpers ---

async function setupMock(profiles = defaultProfiles) {
  const { fetchProfilesPaginated } = await import('@/lib/api/profiles')
  vi.mocked(fetchProfilesPaginated).mockImplementation(({ role, search, page, pageSize }) => {
    let filtered = profiles
    if (role !== 'all') filtered = filtered.filter(u => u.role === role)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(search))
      )
    }
    const total = filtered.length
    const start = (page - 1) * pageSize
    return Promise.resolve({ data: filtered.slice(start, start + pageSize), total })
  })
}

function renderUsersPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setupMock()
})

// --- Tests ---

describe('UsersPage', () => {
  it('renders the page heading "Quản lý tài khoản"', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Quản lý tài khoản')).toBeInTheDocument()
    })
  })

  it('renders user rows from mocked profiles data', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
      expect(screen.getByText('Tran Thi B')).toBeInTheDocument()
    })
  })

  it('renders RoleBadge for student role', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Học sinh')).toBeInTheDocument()
    })
  })

  it('renders RoleBadge for admin role', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })
  })

  it('renders "Quản lý khóa học" button for each user', async () => {
    renderUsersPage()
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /quản lý khóa học/i })
      expect(buttons).toHaveLength(3)
    })
  })

  it('shows empty state message when no users exist', async () => {
    await setupMock([])
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Chưa có tài khoản nào')).toBeInTheDocument()
      expect(screen.getByText('Hệ thống chưa có người dùng nào đăng ký.')).toBeInTheDocument()
    })
  })

  it('shows skeleton loading during fetch', async () => {
    const { fetchProfilesPaginated } = await import('@/lib/api/profiles')
    vi.mocked(fetchProfilesPaginated).mockImplementation(() => new Promise(() => {}))
    renderUsersPage()
    expect(screen.getByLabelText('Đang tải...')).toBeInTheDocument()
  })
})

describe('UsersPage - Search', () => {
  it('filters users by full_name search (case-insensitive)', async () => {
    const user = userEvent.setup()
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Tìm theo tên hoặc số điện thoại…')
    await user.type(searchInput, 'nguyen')

    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    expect(screen.queryByText('Tran Thi B')).not.toBeInTheDocument()
    expect(screen.queryByText('Le Van C')).not.toBeInTheDocument()
  })

  it('filters users by phone search', async () => {
    const user = userEvent.setup()
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Tìm theo tên hoặc số điện thoại…')
    await user.type(searchInput, '987654')

    expect(screen.queryByText('Nguyen Van A')).not.toBeInTheDocument()
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument()
  })

  it('shows filtered empty state when search matches nothing', async () => {
    const user = userEvent.setup()
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Tìm theo tên hoặc số điện thoại…')
    await user.type(searchInput, 'xyz123nonexistent')

    expect(screen.getByText('Không tìm thấy kết quả')).toBeInTheDocument()
    expect(screen.getByText('Thử thay đổi từ khóa hoặc bộ lọc.')).toBeInTheDocument()
  })
})

describe('UsersPage - Role Filter', () => {
  it('filters users by student role', async () => {
    const user = userEvent.setup()
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    const filterTrigger = screen.getByLabelText('Lọc theo vai trò')
    await user.click(filterTrigger)
    const studentOption = screen.getByRole('option', { name: 'Học sinh' })
    await user.click(studentOption)

    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    expect(screen.queryByText('Tran Thi B')).not.toBeInTheDocument()
    expect(screen.queryByText('Le Van C')).not.toBeInTheDocument()
  })

  it('shows count as "X người dùng" (total from server)', async () => {
    const user = userEvent.setup()
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('3 người dùng')).toBeInTheDocument()
    })

    const filterTrigger = screen.getByLabelText('Lọc theo vai trò')
    await user.click(filterTrigger)
    const studentOption = screen.getByRole('option', { name: 'Học sinh' })
    await user.click(studentOption)

    await waitFor(() => {
      expect(screen.getByText('1 người dùng')).toBeInTheDocument()
    })
  })
})

describe('UsersPage - Pagination', () => {
  it('shows pagination when more than 25 users (PAGE_SIZE)', async () => {
    const manyUsers = Array.from({ length: 30 }, (_, i) => ({
      id: String(i + 1),
      full_name: `User ${i + 1}`,
      phone: null,
      year_of_birth: 2010,
      address: 'Ha Noi',
      role: 'student' as const,
      created_at: '2026-01-01T00:00:00Z',
    }))
    await setupMock(manyUsers)

    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Trang trước')).toBeInTheDocument()
    expect(screen.getByLabelText('Trang sau')).toBeInTheDocument()

    expect(screen.getByText('User 20')).toBeInTheDocument()
    expect(screen.queryByText('User 21')).not.toBeInTheDocument()
  })

  it('hides pagination when 25 or fewer users', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    expect(screen.queryByLabelText('Trang trước')).not.toBeInTheDocument()
  })
})

describe('UsersPage - Skeleton Loading', () => {
  it('shows skeleton with aria-label during loading', async () => {
    const { fetchProfilesPaginated } = await import('@/lib/api/profiles')
    vi.mocked(fetchProfilesPaginated).mockImplementation(() => new Promise(() => {}))
    renderUsersPage()

    const skeleton = screen.getByLabelText('Đang tải...')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
  })
})

