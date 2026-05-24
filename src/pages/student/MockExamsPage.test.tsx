import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/lib/api/exams', () => ({
  fetchOpenExamSessionsForStudent: vi.fn().mockResolvedValue([
    {
      id: 's1',
      title: 'Đề quý 2',
      grade: 'grade_9',
      session_type: 'quarterly',
      status: 'open',
      duration_minutes: 60,
      starts_at: '2026-05-01T00:00:00Z',
      ends_at: '2026-05-01T02:00:00Z',
      score_10: null,
    },
  ]),
}))

vi.mock('@/components/student/StudentLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('MockExamsPage', () => {
  it('renders open exam sessions in table format', async () => {
    const { default: MockExamsPage } = await import('./MockExamsPage')
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <MockExamsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Đề thi')).toBeInTheDocument()
      expect(screen.getByText('Đề quý 2')).toBeInTheDocument()
      expect(screen.getByText('Lớp 9')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Vào thi' })).toBeInTheDocument()
    })
  })
})
