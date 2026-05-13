import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/lib/api/exams', () => ({
  fetchExamSessionsForAdmin: vi.fn().mockResolvedValue([
    {
      id: 's1',
      title: 'Đề tháng 5',
      session_type: 'monthly',
      status: 'draft',
      starts_at: '2026-05-01T00:00:00Z',
      ends_at: '2026-05-01T02:00:00Z',
      created_by: 'admin',
      created_at: '2026-05-01T00:00:00Z',
      updated_at: '2026-05-01T00:00:00Z',
    },
  ]),
  createExamSession: vi.fn(),
  updateExamSession: vi.fn(),
  publishExamSession: vi.fn(),
  deleteExamSession: vi.fn(),
}))

vi.mock('@/components/admin/ExamSessionFormDialog', () => ({
  default: () => null,
}))

describe('ExamSessionsPage', () => {
  it('renders admin exam list', async () => {
    const { default: ExamSessionsPage } = await import('./ExamSessionsPage')
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <ExamSessionsPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Quản lý đề thi thử')).toBeInTheDocument()
      expect(screen.getByText('Đề tháng 5')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Soạn câu hỏi' })).toBeInTheDocument()
    })
  })
})
