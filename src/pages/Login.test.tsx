import { render, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: vi.fn() }
})

const mockProfile = {
  id: 'user-1',
  full_name: 'Test User',
  phone: '0912345678',
  year_of_birth: 2000,
  address: 'Test Address',
  role: 'student' as const,
  created_at: '2024-01-01T00:00:00Z',
}

describe('Login', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  async function renderLogin() {
    const { default: Login } = await import('./Login')
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
  }

  it('redirects to /courses when role is student', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1' } as never,
      session: {} as never,
      profile: { ...mockProfile, role: 'student' },
      loading: false,
      signOut: vi.fn(),
    })

    await renderLogin()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/courses')
    })
  })

  it('redirects to /admin/users when role is admin', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1' } as never,
      session: {} as never,
      profile: { ...mockProfile, role: 'admin' },
      loading: false,
      signOut: vi.fn(),
    })

    await renderLogin()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users')
    })
  })

  it('redirects to / when role is teacher', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1' } as never,
      session: {} as never,
      profile: { ...mockProfile, role: 'teacher' },
      loading: false,
      signOut: vi.fn(),
    })

    await renderLogin()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('does NOT redirect when loading is true', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1' } as never,
      session: {} as never,
      profile: mockProfile,
      loading: true,
      signOut: vi.fn(),
    })

    await renderLogin()

    await new Promise(resolve => setTimeout(resolve, 50))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does NOT redirect when profile is null', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      profile: null,
      loading: false,
      signOut: vi.fn(),
    })

    await renderLogin()

    await new Promise(resolve => setTimeout(resolve, 50))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
