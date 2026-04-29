import { vi } from 'vitest'

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    profile: { id: 'admin-1', full_name: 'Admin User', role: 'admin' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Test cases will be added in Plan 07-02
  it.todo('renders logout button with text "Đăng xuất"')
  it.todo('clicking logout calls signOut()')
  it.todo('renders all nav items')
})
