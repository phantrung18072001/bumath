import { describe, expect, it, vi, beforeEach } from 'vitest'
import { startExamAttempt, submitExamAttempt, ExamApiError } from '@/lib/api/exams'

const rpcMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpcMock(...args),
    auth: { getUser: vi.fn() },
  },
}))

describe('exam API', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('maps duplicate-attempt RPC failure to EXAM_ATTEMPT_ALREADY_EXISTS', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'You already started this exam session.' } })

    await expect(startExamAttempt('session-1')).rejects.toMatchObject<Partial<ExamApiError>>({
      code: 'EXAM_ATTEMPT_ALREADY_EXISTS',
    })
  })

  it('maps late-submit RPC failure to EXAM_DEADLINE_PASSED', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'Exam submission deadline has passed.' } })

    await expect(submitExamAttempt('attempt-1')).rejects.toMatchObject<Partial<ExamApiError>>({
      code: 'EXAM_DEADLINE_PASSED',
    })
  })
})
