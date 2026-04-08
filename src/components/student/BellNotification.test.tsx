import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// --- Mocks ---

vi.mock('@/lib/api/submissions', () => ({
  getUnviewedGradeCount: vi.fn().mockResolvedValue(0),
}))

// --- Helpers ---

function renderBellNotification() {
  const BellNotification = require('./BellNotification').default
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <BellNotification />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

// --- Tests (GRADE-04) ---

describe('BellNotification', () => {
  it('renders bell icon', async () => {
    renderBellNotification()
    await waitFor(() => {
      expect(screen.getByLabelText(/[Tt]h[oô]ng b[aá]o/)).toBeInTheDocument()
    })
  })

  it('hides badge when count is 0', async () => {
    renderBellNotification()
    await waitFor(() => {
      expect(screen.getByLabelText(/[Tt]h[oô]ng b[aá]o/)).toBeInTheDocument()
    })
    // Badge span should not exist
    expect(screen.queryByText(/[0-9]/)).not.toBeInTheDocument()
  })

  it('shows badge with count when unviewed grades exist', async () => {
    const { getUnviewedGradeCount } = await import('@/lib/api/submissions')
    ;(getUnviewedGradeCount as ReturnType<typeof vi.fn>).mockResolvedValue(3)

    renderBellNotification()
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })
})
