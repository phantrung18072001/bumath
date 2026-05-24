import { supabase } from '@/lib/supabase'

export type ExamSessionStatus = 'draft' | 'published' | 'closed'
export type ExamSessionType = 'monthly' | 'quarterly'
export type ExamChoice = 'A' | 'B' | 'C' | 'D'
export type ExamGrade = 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'

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
  grade: ExamGrade
  session_type: ExamSessionType
  status: ExamSessionStatus
  duration_minutes: number
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
  answers_payload: Record<string, unknown>
  raw_score: number | null
  score_10: number | null
}

export interface ExamSubmitResult {
  raw_score: number
  score_10: number
  per_question: Array<{
    question_id: string
    is_correct: boolean
    correct_choice?: ExamChoice
    selected_choice?: string
  }>
}

export interface StudentExamSession {
  id: string
  title: string
  grade: ExamGrade
  session_type: ExamSessionType
  status: 'open' | 'done'
  duration_minutes: number
  starts_at: string
  ends_at: string
  score_10: number | null
}

export interface SaveExamQuestionBatchItem {
  id?: string
  prompt: string
  prompt_latex?: string | null
  image_url?: string | null
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  order_index: number
  correct_choice: ExamChoice
}

const EXAM_IMAGE_BUCKET = 'assignments'

function mapExamError(error: unknown): never {
  const message = (error as { message?: string } | null)?.message ?? 'Unknown exam error'

  if (message.includes('already started this exam session') || message.includes('You already started')) {
    throw new ExamApiError('EXAM_ATTEMPT_ALREADY_EXISTS', 'Bạn đã bắt đầu đề thi này rồi.')
  }

  if (message.includes('deadline has passed') || message.includes('Exam submission deadline')) {
    throw new ExamApiError('EXAM_DEADLINE_PASSED', 'Đã quá thời gian nộp bài cho đề thi này.')
  }

  if (message.includes('Exam session is unavailable')) {
    throw new ExamApiError('EXAM_SESSION_UNAVAILABLE', 'Đề thi chưa mở hoặc đã đóng.')
  }

  if (message.includes('outside active window')) {
    throw new ExamApiError('EXAM_OUTSIDE_WINDOW', 'Đề thi chưa đến giờ hoặc đã kết thúc.')
  }

  if (message.includes('Exam session not found')) {
    throw new ExamApiError('EXAM_SESSION_NOT_FOUND', 'Không tìm thấy đề thi.')
  }

  if (message.includes('Attempt not found or already submitted') || message.includes('Attempt not found')) {
    throw new ExamApiError('EXAM_ATTEMPT_NOT_FOUND', 'Không tìm thấy bài thi hoặc bài đã được nộp.')
  }

  if (message.includes('Authentication required')) {
    throw new ExamApiError('EXAM_UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện thao tác này.')
  }

  if (message.includes('no gradable questions')) {
    throw new ExamApiError('EXAM_NO_QUESTIONS', 'Đề thi chưa có câu hỏi nào để chấm điểm.')
  }

  throw new ExamApiError('EXAM_UNKNOWN', 'Đã xảy ra lỗi. Vui lòng thử lại.')
}

export async function fetchExamSessionsForAdmin(): Promise<ExamSession[]> {
  // Lazily close any expired sessions before fetching
  await supabase.rpc('close_expired_exam_sessions')

  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) mapExamError(error)
  return (data ?? []) as ExamSession[]
}

export async function createExamSession(payload: Pick<ExamSession, 'title' | 'grade' | 'session_type' | 'duration_minutes' | 'starts_at' | 'ends_at'>): Promise<ExamSession> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new ExamApiError('EXAM_UNAUTHORIZED', 'Bạn cần đăng nhập để tạo đề thi.')
  }

  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({ ...payload, created_by: user.id })
    .select('*')
    .single()

  if (error) mapExamError(error)
  return data as ExamSession
}

export async function updateExamSession(id: string, payload: Partial<Pick<ExamSession, 'title' | 'grade' | 'session_type' | 'duration_minutes' | 'starts_at' | 'ends_at'>>): Promise<ExamSession> {
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

export async function closeExamSession(sessionId: string): Promise<ExamSession> {
  const { data, error } = await supabase
    .from('exam_sessions')
    .update({ status: 'closed' })
    .eq('id', sessionId)
    .select('*')
    .single()

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

export async function updateExamQuestionOrder(questionId: string, orderIndex: number): Promise<void> {
  const { error } = await supabase
    .from('exam_questions')
    .update({ order_index: orderIndex })
    .eq('id', questionId)
  if (error) mapExamError(error)
}

export async function deleteExamQuestion(questionId: string): Promise<void> {
  const { error } = await supabase.from('exam_questions').delete().eq('id', questionId)
  if (error) mapExamError(error)
}

export async function uploadExamQuestionImage(sessionId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const random = Math.random().toString(36).slice(2, 8)
  const path = `exam-questions/${sessionId}/${Date.now()}-${random}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from(EXAM_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) mapExamError(uploadError)
  const { data } = supabase.storage.from(EXAM_IMAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function saveExamQuestionsBatch(sessionId: string, questions: SaveExamQuestionBatchItem[]): Promise<void> {
  const { error } = await supabase.rpc('save_exam_questions_batch', {
    p_session_id: sessionId,
    p_questions: questions,
  })
  if (error) mapExamError(error)
}

export async function fetchOpenExamSessionsForStudent(): Promise<StudentExamSession[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new ExamApiError('EXAM_UNAUTHORIZED', 'Bạn cần đăng nhập để xem đề thi.')
  }

  const { data, error } = await supabase.rpc('fetch_student_exam_sessions', {
    p_user_id: user.id,
  })

  if (error) mapExamError(error)
  return (data ?? []) as StudentExamSession[]
}

export async function fetchExamSessionById(sessionId: string): Promise<ExamSession> {
  const { data, error } = await supabase.from('exam_sessions').select('*').eq('id', sessionId).single()
  if (error) mapExamError(error)
  return data as ExamSession
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
