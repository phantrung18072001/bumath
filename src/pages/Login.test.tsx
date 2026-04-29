import { vi } from 'vitest'

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: vi.fn() }
})

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Test cases will be added in Plan 07-02
  it.todo('redirects to /pending when approval_status is pending')
  it.todo('redirects to /courses when role is student and approved')
  it.todo('redirects to /admin/users when role is admin and approved')
})
