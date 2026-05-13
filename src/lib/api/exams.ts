import { supabase } from '@/lib/supabase'

export type ExamSessionStatus = 'draft' | 'published' | 'closed'
export type ExamSessionType = 'monthly' | 'quarterly'
export type ExamChoice = 'A' | 'B' | 'C' | 'D'

export class ExamApiError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

export interface ExamSession {
  id: string
  title: string
  session_type: ExamSessionType
  status: ExamSessionStatus
  starts_at: string
  ends_at: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ExamQuestion {
  id: string
  exam_session_id: string
  prompt: string
  prompt_latex: string | null
  image_url: string | null
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  order_index: number
  correct_choice?: ExamChoice
}

export interface ExamAttempt {
  id: string
  exam_session_id: string
  user_id: string
  started_at: string
  submitted_at: string | null
  answers_payload: Record<string, string>
  raw_score: number | null
  score_10: number | null
}

export interface ExamSubmitResult {
  raw_score: number
  score_10: number
  per_question: Array<{ question_id: string; is_correct: boolean }>
}

function mapExamError(error: unknown): never {
  const message = (error as { message?: string } | null)?.message ?? 'Unknown exam error'

  if (message.includes('already started this exam session')) {
    throw new ExamApiError('EXAM_ATTEMPT_ALREADY_EXISTS', 'Bạn đã bắt đầu đề thi này rồi.')
  }

  if (message.includes('deadline has passed')) {
    throw new ExamApiError('EXAM_DEADLINE_PASSED', 'Đã quá thời gian nộp bài cho đề thi này.')
  }

  throw new ExamApiError('EXAM_UNKNOWN', message)
}

export async function fetchExamSessionsForAdmin(): Promise<ExamSession[]> {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) mapExamError(error)
  return (data ?? []) as ExamSession[]
}

export async function createExamSession(payload: Pick<ExamSession, 'title' | 'session_type' | 'starts_at' | 'ends_at'>): Promise<ExamSession> {
  const { data, error } = await supabase
    .from('exam_sessions')
    .insert(payload)
    .select('*')
    .single()

  if (error) mapExamError(error)
  return data as ExamSession
}

export async function updateExamSession(id: string, payload: Partial<Pick<ExamSession, 'title' | 'session_type' | 'starts_at' | 'ends_at'>>): Promise<ExamSession> {
  const { data, error } = await supabase
    .from('exam_sessions')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) mapExamError(error)
  return data as ExamSession
}

export async function publishExamSession(sessionId: string): Promise<ExamSession> {
  const { data, error } = await supabase.rpc('publish_exam_session', { p_session_id: sessionId })
  if (error) mapExamError(error)
  return data as ExamSession
}

export async function deleteExamSession(sessionId: string): Promise<void> {
  const { error } = await supabase.from('exam_sessions').delete().eq('id', sessionId)
  if (error) mapExamError(error)
}

export async function fetchExamQuestions(sessionId: string): Promise<ExamQuestion[]> {
  const { data, error } = await supabase
    .from('exam_questions')
    .select('*')
    .eq('exam_session_id', sessionId)
    .order('order_index', { ascending: true })

  if (error) mapExamError(error)
  return (data ?? []) as ExamQuestion[]
}

export async function upsertExamQuestion(question: Partial<ExamQuestion> & { exam_session_id: string }): Promise<ExamQuestion> {
  const payload = {
    id: question.id,
    exam_session_id: question.exam_session_id,
    prompt: question.prompt,
    prompt_latex: question.prompt_latex,
    image_url: question.image_url,
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    order_index: question.order_index,
  }

  const { data, error } = await supabase
    .from('exam_questions')
    .upsert(payload)
    .select('*')
    .single()

  if (error) mapExamError(error)

  if (question.correct_choice) {
    const { error: answerError } = await supabase
      .from('exam_question_answers')
      .upsert({ question_id: (data as ExamQuestion).id, correct_choice: question.correct_choice })
    if (answerError) mapExamError(answerError)
  }

  return data as ExamQuestion
}

export async function fetchOpenExamSessionsForStudent(): Promise<ExamSession[]> {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('status', 'published')
    .order('starts_at', { ascending: true })

  if (error) mapExamError(error)
  return (data ?? []) as ExamSession[]
}

export async function startExamAttempt(sessionId: string): Promise<ExamAttempt> {
  const { data, error } = await supabase.rpc('start_exam_attempt', { p_session_id: sessionId })
  if (error) mapExamError(error)
  return data as ExamAttempt
}

export async function saveExamAttemptAnswers(attemptId: string, answers: Record<string, string>): Promise<ExamAttempt> {
  const { data, error } = await supabase.rpc('save_exam_attempt_answers', {
    p_attempt_id: attemptId,
    p_answers: answers,
  })

  if (error) mapExamError(error)
  return data as ExamAttempt
}

export async function submitExamAttempt(attemptId: string): Promise<ExamSubmitResult> {
  const { data, error } = await supabase.rpc('submit_exam_attempt', { p_attempt_id: attemptId })
  if (error) mapExamError(error)
  return data as ExamSubmitResult
}

export async function fetchMyExamAttempt(sessionId: string): Promise<ExamAttempt | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data, error } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('exam_session_id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) mapExamError(error)
  return (data as ExamAttempt | null) ?? null
}
