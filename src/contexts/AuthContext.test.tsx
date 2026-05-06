import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

const mockUnsubscribe = vi.fn()
let authStateCallback: ((event: string, session: unknown) => void) | null = null

// vi.mock is hoisted — cannot reference outer variables in factory
// Use a module-level mock with stable references
vi.mock('@/lib/supabase', () => {
  const unsubscribeFn = vi.fn()
  const singleMock = vi.fn().mockResolvedValue({
    data: {
      id: 'user-123',
      full_name: 'Nguyen Van A',
      phone: '+84912345678',
      year_of_birth: 2010,
      address: 'Ha Noi',
      role: 'student',
      created_at: '2026-01-01T00:00:00Z',
    },
    error: null,
  })
  const eqMock = vi.fn().mockReturnValue({ single: singleMock })
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
  const fromMock = vi.fn().mockReturnValue({ select: selectMock })

  return {
    supabase: {
      auth: {
        onAuthStateChange: vi.fn((callback) => {
          // Store callback so tests can simulate events
          ;(globalThis as Record<string, unknown>).__authStateCallback = callback
          return { data: { subscription: { unsubscribe: unsubscribeFn } } }
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        __unsubscribeFn: unsubscribeFn,
      },
      from: fromMock,
    },
  }
})

function TestConsumer() {
  const { user, session, profile, loading } = useAuth()
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? (user as { id: string }).id : 'null'}</div>
      <div data-testid="session">{session ? 'has-session' : 'null'}</div>
      <div data-testid="profile">{profile ? profile.full_name : 'null'}</div>
    </div>
  )
}

function SignOutConsumer() {
  const { signOut } = useAuth()
  return <button onClick={() => signOut()}>Sign Out</button>
}

function getCallback() {
  return (globalThis as Record<string, unknown>).__authStateCallback as (
    event: string,
    session: unknown
  ) => void
}

const mockUser = { id: 'user-123', email: null }
const mockSession = { user: mockUser, access_token: 'token-abc' }

beforeEach(() => {
  ;(globalThis as Record<string, unknown>).__authStateCallback = null
  mockUnsubscribe.mockClear()
})

describe('AuthProvider', () => {
  it('renders children when loading completes', async () => {
    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('starts with loading true, becomes false after INITIAL_SESSION with null session', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    expect(screen.getByTestId('loading').textContent).toBe('true')

    await act(async () => {
      getCallback()('INITIAL_SESSION', null)
    })

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  it('sets user and session on INITIAL_SESSION with valid session', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await act(async () => {
      getCallback()('INITIAL_SESSION', mockSession)
      // allow setTimeout(0) to fire
      await new Promise((r) => setTimeout(r, 20))
    })

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user-123')
      expect(screen.getByTestId('session').textContent).toBe('has-session')
    })
  })

  it('fetches profile from profiles table on INITIAL_SESSION with valid session', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await act(async () => {
      getCallback()('INITIAL_SESSION', mockSession)
      await new Promise((r) => setTimeout(r, 20))
    })

    await waitFor(() => {
      expect(screen.getByTestId('profile').textContent).toBe('Nguyen Van A')
    })
  })

  it('clears user, session, and profile on SIGNED_OUT', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    // First sign in
    await act(async () => {
      getCallback()('INITIAL_SESSION', mockSession)
      await new Promise((r) => setTimeout(r, 20))
    })

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user-123')
    })

    // Then sign out
    await act(async () => {
      getCallback()('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null')
      expect(screen.getByTestId('session').textContent).toBe('null')
      expect(screen.getByTestId('profile').textContent).toBe('null')
    })
  })

  it('signOut calls supabase.auth.signOut()', async () => {
    const { supabase } = await import('@/lib/supabase')

    render(
      <AuthProvider>
        <SignOutConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Sign Out').click()
    })

    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('unsubscribes from onAuthStateChange on unmount', async () => {
    const { supabase } = await import('@/lib/supabase')
    const unsubFn = (supabase.auth as { __unsubscribeFn: ReturnType<typeof vi.fn> }).__unsubscribeFn

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    unmount()

    expect(unsubFn).toHaveBeenCalled()
  })

  it('loading becomes false after profile fetch completes', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading').textContent).toBe('true')

    await act(async () => {
      getCallback()('INITIAL_SESSION', mockSession)
      await new Promise((r) => setTimeout(r, 20))
    })

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })
})

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      render(<TestConsumer />)
    }).toThrow('useAuth must be used within AuthProvider')
    consoleSpy.mockRestore()
  })
})
