import { render, screen, waitFor } from '@testing-library/react'
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
      expect(buttons).toHaveLength(2)
    })
  })

  it('shows empty state message when no users exist', async () => {
    resetMocksWithData([])
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Chưa có tài khoản nào được tạo.')).toBeInTheDocument()
    })
  })
})

