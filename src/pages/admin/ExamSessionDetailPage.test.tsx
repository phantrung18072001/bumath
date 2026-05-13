import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('@/lib/api/exams', () => ({
  fetchExamQuestions: vi.fn().mockResolvedValue([
    {
      id: 'q1',
      exam_session_id: 's1',
      prompt: '2 + 2 = ?',
      prompt_latex: null,
      image_url: null,
      option_a: '3',
      option_b: '4',
      option_c: '5',
      option_d: '6',
      order_index: 1,
    },
  ]),
  fetchMyExamAttempt: vi.fn().mockResolvedValue(null),
  upsertExamQuestion: vi.fn(),
}))

vi.mock('react-katex', () => ({
  BlockMath: ({ math }: { math: string }) => <div>{math}</div>,
}))

describe('ExamSessionDetailPage', () => {
  it('renders existing questions', async () => {
    const { default: ExamSessionDetailPage } = await import('./ExamSessionDetailPage')
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/quan-tri/de-thi/s1']}>
          <Routes>
            <Route path="/quan-tri/de-thi/:sessionId" element={<ExamSessionDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Soạn câu hỏi đề thi')).toBeInTheDocument()
      expect(screen.getByText('Câu 1: 2 + 2 = ?')).toBeInTheDocument()
    })
  })
})
