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

vi.mock('@/lib/supabase', () => {
  const order = vi.fn()
  const select = vi.fn().mockReturnValue({ order })
  const from = vi.fn().mockReturnValue({ select })

  return {
    supabase: { from },
    __order: order,
    __from: from,
  }
})

vi.mock('@/components/admin/UserEnrollmentDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="enrollment-dialog" /> : null,
}))

// --- Helpers ---

let __order: ReturnType<typeof vi.fn>
let __from: ReturnType<typeof vi.fn>

beforeAll(async () => {
  const mod = await import('@/lib/supabase')
  const m = mod as unknown as {
    __order: ReturnType<typeof vi.fn>
    __from: ReturnType<typeof vi.fn>
  }
  __order = m.__order
  __from = m.__from
})

function resetMocksWithData(profiles = defaultProfiles) {
  __order.mockResolvedValue({ data: profiles, error: null })
  __from.mockReturnValue({ select: vi.fn().mockReturnValue({ order: __order }) })
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

beforeEach(() => {
  vi.clearAllMocks()
  resetMocksWithData()
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
    resetMocksWithData([])
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Chưa có tài khoản nào')).toBeInTheDocument()
      expect(screen.getByText('Hệ thống chưa có người dùng nào đăng ký.')).toBeInTheDocument()
    })
  })

  it('shows skeleton loading during fetch', async () => {
    // Override mock to never resolve
    __order.mockImplementation(() => new Promise(() => {}))
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

  it('shows count as "X / Y người dùng" when filtered', async () => {
    const user = userEvent.setup()
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('3 người dùng')).toBeInTheDocument()
    })

    const filterTrigger = screen.getByLabelText('Lọc theo vai trò')
    await user.click(filterTrigger)
    const studentOption = screen.getByRole('option', { name: 'Học sinh' })
    await user.click(studentOption)

    expect(screen.getByText('1 / 3 người dùng')).toBeInTheDocument()
  })
})

describe('UsersPage - Pagination', () => {
  it('shows pagination when more than 25 users', async () => {
    const manyUsers = Array.from({ length: 30 }, (_, i) => ({
      id: `user-${i}`,
      full_name: `User ${i}`,
      phone: `+8491234${String(i).padStart(4, '0')}`,
      year_of_birth: 2010,
      address: 'Ha Noi',
      role: 'student' as const,
      created_at: '2026-01-01T00:00:00Z',
    }))
    resetMocksWithData(manyUsers)

    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('User 0')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument()
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument()

    expect(screen.getByText('User 24')).toBeInTheDocument()
    expect(screen.queryByText('User 25')).not.toBeInTheDocument()
  })

  it('hides pagination when 25 or fewer users', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    expect(screen.queryByLabelText('Go to previous page')).not.toBeInTheDocument()
  })
})

describe('UsersPage - Skeleton Loading', () => {
  it('shows skeleton with aria-label during loading', async () => {
    __order.mockImplementation(() => new Promise(() => {}))
    renderUsersPage()

    const skeleton = screen.getByLabelText('Đang tải...')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
  })
})

