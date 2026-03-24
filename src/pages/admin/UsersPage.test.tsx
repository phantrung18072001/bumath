import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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
    approval_status: 'pending',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    full_name: 'Tran Thi B',
    phone: '+84987654321',
    year_of_birth: 2011,
    address: 'Ho Chi Minh',
    role: 'student',
    approval_status: 'approved',
    created_at: '2026-01-02T00:00:00Z',
  },
]

// --- Mocks (vi.mock factories are hoisted; no top-level variables allowed inside) ---

vi.mock('@/lib/supabase', () => {
  // All mock fns are stable across tests; data is controlled via mockResolvedValue in beforeEach
  const updateEq = vi.fn()
  const update = vi.fn().mockReturnValue({ eq: updateEq })
  const order = vi.fn()
  const select = vi.fn().mockReturnValue({ order })
  const from = vi.fn().mockReturnValue({ select, update })

  return {
    supabase: { from },
    // expose for per-test control
    __order: order,
    __updateEq: updateEq,
    __update: update,
    __from: from,
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'admin-1' },
    profile: { id: 'admin-1', role: 'admin', approval_status: 'approved' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// --- Helpers ---

// Access the exported mock functions after module initialization
let __order: ReturnType<typeof vi.fn>
let __updateEq: ReturnType<typeof vi.fn>
let __update: ReturnType<typeof vi.fn>
let __from: ReturnType<typeof vi.fn>

beforeAll(async () => {
  const mod = await import('@/lib/supabase')
  const m = mod as unknown as {
    __order: ReturnType<typeof vi.fn>
    __updateEq: ReturnType<typeof vi.fn>
    __update: ReturnType<typeof vi.fn>
    __from: ReturnType<typeof vi.fn>
  }
  __order = m.__order
  __updateEq = m.__updateEq
  __update = m.__update
  __from = m.__from
})

function resetMocksWithData(profiles = defaultProfiles) {
  __order.mockResolvedValue({ data: profiles, error: null })
  __updateEq.mockResolvedValue({ error: null })
  __update.mockReturnValue({ eq: __updateEq })
  __from.mockReturnValue({ select: vi.fn().mockReturnValue({ order: __order }), update: __update })
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

  it('renders all four tab labels', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Tất cả' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Chờ duyệt' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Đã duyệt' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Từ chối' })).toBeInTheDocument()
    })
  })

  it('renders user rows from mocked profiles data', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
      expect(screen.getByText('Tran Thi B')).toBeInTheDocument()
    })
  })

  it('"Duyệt tài khoản" button calls supabase update with approval_status approved', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    const approveButton = screen.getByRole('button', { name: /Duyệt tài khoản/i })
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(__update).toHaveBeenCalledWith({ approval_status: 'approved' })
      expect(__updateEq).toHaveBeenCalledWith('id', 'user-1')
    })
  })

  it('"Từ chối" button shows confirmation "Xác nhận từ chối?" on first click', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    const rejectButton = screen.getByRole('button', { name: /^Từ chối$/i })
    fireEvent.click(rejectButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Xác nhận từ chối\?/i })).toBeInTheDocument()
    })
  })

  it('confirmation button executes reject mutation on second click', async () => {
    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    // Step 1: click "Từ chối"
    const rejectButton = screen.getByRole('button', { name: /^Từ chối$/i })
    fireEvent.click(rejectButton)

    // Step 2: click "Xác nhận từ chối?"
    const confirmButton = await screen.findByRole('button', { name: /Xác nhận từ chối\?/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(__update).toHaveBeenCalledWith({ approval_status: 'rejected' })
      expect(__updateEq).toHaveBeenCalledWith('id', 'user-1')
    })
  })

  it('pending tab shows empty state message when no pending users', async () => {
    const user = userEvent.setup()

    // Only approved user
    resetMocksWithData([
      {
        id: 'user-2',
        full_name: 'Tran Thi B',
        phone: '+84987654321',
        year_of_birth: 2011,
        address: 'Ho Chi Minh',
        role: 'student',
        approval_status: 'approved',
        created_at: '2026-01-02T00:00:00Z',
      },
    ])

    renderUsersPage()

    await waitFor(() => {
      expect(screen.getByText('Tran Thi B')).toBeInTheDocument()
    })

    // Click the "Chờ duyệt" tab using userEvent for proper Radix interaction
    const pendingTab = screen.getByRole('tab', { name: 'Chờ duyệt' })
    await user.click(pendingTab)

    await waitFor(() => {
      expect(
        screen.getByText('Không có tài khoản nào đang chờ duyệt.')
      ).toBeInTheDocument()
    })
  })

  it('all tab shows empty state message when no users exist', async () => {
    resetMocksWithData([])

    renderUsersPage()

    await waitFor(() => {
      expect(screen.getByText('Chưa có tài khoản nào được tạo.')).toBeInTheDocument()
    })
  })

  it('shows success toast after approving an account', async () => {
    const { toast } = await import('sonner')

    renderUsersPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    })

    const approveButton = screen.getByRole('button', { name: /Duyệt tài khoản/i })
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Đã duyệt tài khoản thành công.')
    })
  })
})
