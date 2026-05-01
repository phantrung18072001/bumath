import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockApprovedStudentProfile = {
  id: 'user-123',
  full_name: 'Nguyen Van A',
  phone: '+84912345678',
  year_of_birth: 2010,
  address: 'Ha Noi',
  role: 'student' as const,
  created_at: '2026-01-01T00:00:00Z',
}

const mockAdminProfile = {
  ...mockApprovedStudentProfile,
  role: 'admin' as const,
}

function renderProtected(
  props: Partial<{ requiredRole: 'student' | 'teacher' | 'admin' }> = {}
) {
  return render(
    <MemoryRouter>
      <ProtectedRoute {...props}>
        <div data-testid="protected-content">Protected</div>
      </ProtectedRoute>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('shows spinner with aria-label when loading is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      profile: null,
      loading: true,
      signOut: vi.fn(),
    })
    renderProtected()
    const spinner = screen.getByLabelText('Dang tai...')
    expect(spinner).toBeInTheDocument()
  })

  it('spinner wrapper has aria-label "Dang tai..." for accessibility', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      profile: null,
      loading: true,
      signOut: vi.fn(),
    })
    renderProtected()
    expect(screen.getByLabelText('Dang tai...')).toBeInTheDocument()
  })

  it('redirects to /login when user is null and loading is false', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      profile: null,
      loading: false,
      signOut: vi.fn(),
    })
    const { container } = renderProtected()
    // Navigate replaces content — protected-content should NOT be present
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    // MemoryRouter renders nothing visible for Navigate, but we verify content is not shown
    expect(container.textContent).toBe('')
  })

  it('redirects to / when requiredRole is admin but profile.role is student', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123' } as never,
      session: {} as never,
      profile: mockApprovedStudentProfile,
      loading: false,
      signOut: vi.fn(),
    })
    renderProtected({ requiredRole: 'admin' })
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated, approved, and has correct role', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123' } as never,
      session: {} as never,
      profile: mockAdminProfile,
      loading: false,
      signOut: vi.fn(),
    })
    renderProtected({ requiredRole: 'admin' })
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByText('Protected')).toBeInTheDocument()
  })

  it('renders children when no requiredRole specified and user is approved', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123' } as never,
      session: {} as never,
      profile: mockApprovedStudentProfile,
      loading: false,
      signOut: vi.fn(),
    })
    renderProtected()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByText('Protected')).toBeInTheDocument()
  })
})
