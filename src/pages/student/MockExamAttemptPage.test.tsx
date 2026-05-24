import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const submitMock = vi.fn()

vi.mock('@/lib/api/exams', () => ({
  fetchExamSessionById: vi.fn().mockResolvedValue({
    id: 's1',
    title: 'Đề quý 2',
    grade: 'grade_9',
    session_type: 'quarterly',
    status: 'published',
    duration_minutes: 60,
    starts_at: '2026-12-01T00:00:00Z',
    ends_at: '2026-12-01T02:00:00Z',
    created_by: 'admin',
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  }),
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
  fetchMyExamAttempt: vi.fn().mockResolvedValue({
    id: 'a1',
    exam_session_id: 's1',
    user_id: 'u1',
    started_at: '2026-12-01T00:00:00Z',
    submitted_at: null,
    answers_payload: {},
    raw_score: null,
    score_10: null,
  }),
  startExamAttempt: vi.fn(),
  saveExamAttemptAnswers: vi.fn(),
  submitExamAttempt: (...args: unknown[]) => submitMock(...args),
}))

vi.mock('@/components/student/StudentLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('MockExamAttemptPage', () => {
  it('shows immediate score after submit succeeds', async () => {
    submitMock.mockResolvedValue({ raw_score: 1, score_10: 10, per_question: [{ question_id: 'q1', is_correct: true }] })
    const { default: MockExamAttemptPage } = await import('./MockExamAttemptPage')
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/de-thi/s1']}>
          <Routes>
            <Route path="/de-thi/:sessionId" element={<MockExamAttemptPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await screen.findByText('Đề: Đề quý 2')
    screen.getByRole('button', { name: 'Nộp bài' }).click()

    await waitFor(() => {
      expect(screen.getByText(/Số câu đúng:/)).toBeInTheDocument()
      expect(screen.getByText(/Điểm hệ 10:/)).toBeInTheDocument()
    })
  })
})
