import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/lib/api/exams', () => ({
  fetchOpenExamSessionsForStudent: vi.fn().mockResolvedValue([
    {
      id: 's1',
      title: 'Đề quý 2',
      session_type: 'quarterly',
      status: 'published',
      starts_at: '2026-05-01T00:00:00Z',
      ends_at: '2026-05-01T02:00:00Z',
      created_by: 'admin',
      created_at: '2026-05-01T00:00:00Z',
      updated_at: '2026-05-01T00:00:00Z',
    },
  ]),
}))

vi.mock('@/components/student/StudentLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('MockExamsPage', () => {
  it('renders open exam sessions with start CTA', async () => {
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
      expect(screen.getByText('Đề thi thử')).toBeInTheDocument()
      expect(screen.getByText('Đề quý 2')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Vào thi' })).toBeInTheDocument()
    })
  })
})
