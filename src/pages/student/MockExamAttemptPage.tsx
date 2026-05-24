import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import StudentLayout from '@/components/student/StudentLayout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ExamCountdown from '@/components/student/ExamCountdown'
import { Button } from '@/components/ui/button'
import {
  fetchExamSessionById,
  fetchExamQuestions,
  fetchMyExamAttempt,
  saveExamAttemptAnswers,
  startExamAttempt,
  submitExamAttempt,
  type ExamSubmitResult,
} from '@/lib/api/exams'

export default function MockExamAttemptPage() {
  const { sessionId = '' } = useParams()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ExamSubmitResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const startRequestedRef = useRef(false)
  const saveMutateRef = useRef<(args: { attemptId: string; payload: Record<string, string> }) => void>(() => {})

  const { data: existingAttempt, isLoading: isAttemptLoading } = useQuery({
    queryKey: ['student', 'exam-attempt', sessionId],
    queryFn: () => fetchMyExamAttempt(sessionId),
    enabled: !!sessionId,
  })

  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['student', 'exam-questions', sessionId],
    queryFn: () => fetchExamQuestions(sessionId),
    enabled: !!sessionId && !isAttemptLoading,
  })
  const { data: session } = useQuery({
    queryKey: ['student', 'exam-session', sessionId],
    queryFn: () => fetchExamSessionById(sessionId),
    enabled: !!sessionId && !isAttemptLoading,
  })

  const startMutation = useMutation({ mutationFn: startExamAttempt })
  const saveMutation = useMutation({
    mutationFn: ({ attemptId, payload }: { attemptId: string; payload: Record<string, string> }) =>
      saveExamAttemptAnswers(attemptId, payload),
  })
  const submitMutation = useMutation({ mutationFn: submitExamAttempt })

  // Keep ref in sync so the debounced save effect never has stale closure
  useEffect(() => { saveMutateRef.current = saveMutation.mutate })

  const attemptId = existingAttempt?.id ?? startMutation.data?.id
  const endsAt = useMemo(() => {
    if (!session) return new Date(Date.now() + 30 * 60 * 1000).toISOString()
    const startedAtIso = existingAttempt?.started_at ?? startMutation.data?.started_at
    if (!startedAtIso) return session.ends_at
    const startedAtMs = new Date(startedAtIso).getTime()
    const durationMs = session.duration_minutes * 60 * 1000
    const timeByDuration = startedAtMs + durationMs
    const windowEndsAtMs = new Date(session.ends_at).getTime()
    return new Date(Math.min(timeByDuration, windowEndsAtMs)).toISOString()
  }, [session, existingAttempt?.started_at, startMutation.data?.started_at])

  // Grace period: 5 minutes after session ends_at
  const graceDeadline = useMemo(() => {
    if (!session) return null
    return new Date(new Date(session.ends_at).getTime() + 5 * 60 * 1000).toISOString()
  }, [session])

  const [graceNow, setGraceNow] = useState(Date.now())
  useEffect(() => {
    if (!isExpired || result) return
    const t = window.setInterval(() => setGraceNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [isExpired, result])
  const graceExpired = graceDeadline ? graceNow >= new Date(graceDeadline).getTime() : false
  const graceRemainSecs = graceDeadline
    ? Math.max(0, Math.floor((new Date(graceDeadline).getTime() - graceNow) / 1000))
    : 0
  const resultMap = useMemo(() => {
    const map = new Map<string, { is_correct: boolean; correct_choice?: string; selected_choice?: string }>()
    for (const item of result?.per_question ?? []) {
      map.set(item.question_id, {
        is_correct: item.is_correct,
        correct_choice: item.correct_choice,
        selected_choice: item.selected_choice,
      })
    }
    return map
  }, [result])

  useEffect(() => {
    if (!sessionId || isAttemptLoading || !session || existingAttempt || startRequestedRef.current) return
    if (existingAttempt?.submitted_at) return
    if (session.status !== 'published') return

    startRequestedRef.current = true
    startMutation.mutate(sessionId, {
      onError: (error) => {
        const message = (error as Error).message
        if (message.includes('Bạn đã bắt đầu đề thi này rồi.')) return
        setErrorMessage(message)
      },
    })
  }, [sessionId, isAttemptLoading, session, existingAttempt, startMutation])

  useEffect(() => {
    if (existingAttempt?.answers_payload) {
      const payload = existingAttempt.answers_payload as Record<string, unknown>
      const nextAnswers: Record<string, string> = {}
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'per_question') continue
        if (typeof value === 'string') nextAnswers[key] = value
      }
      setAnswers(nextAnswers)

      if (existingAttempt.submitted_at) {
        const perQuestion = Array.isArray(payload.per_question)
          ? payload.per_question as Array<{ question_id: string; is_correct: boolean; correct_choice?: string; selected_choice?: string }>
          : []

        setResult({
          raw_score: existingAttempt.raw_score ?? 0,
          score_10: existingAttempt.score_10 ?? 0,
          per_question: perQuestion,
        })
      }
    }
  }, [existingAttempt])

  useEffect(() => {
    if (!attemptId || result || existingAttempt?.submitted_at || isExpired) return
    const timer = window.setTimeout(() => {
      saveMutateRef.current({ attemptId, payload: answers })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [attemptId, answers, result, existingAttempt?.submitted_at, isExpired])

  async function handleSubmit(fromExpiry = false) {
    if (!attemptId || submitMutation.isPending) return
    if (fromExpiry) setIsExpired(true)
    try {
      // Skip pre-save when auto-submitting on expiry — deadline already passed on DB side
      if (!fromExpiry) {
        await saveExamAttemptAnswers(attemptId, answers)
      }
      const submitResult = await submitMutation.mutateAsync(attemptId)
      setResult(submitResult)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  function scrollToQuestion(questionId: string) {
    const target = questionRefs.current[questionId]
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 md:p-8">

        {errorMessage ? (
          <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>
        ) : null}

        {isQuestionsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 h-6 w-28 animate-pulse rounded bg-slate-100" />
                <div className="mb-3 h-16 w-full animate-pulse rounded bg-slate-100" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((__, answerIndex) => (
                    <div key={answerIndex} className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isQuestionsLoading ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.25)] md:p-5">
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const questionResult = resultMap.get(question.id)
                  const selectedChoice = answers[question.id] ?? questionResult?.selected_choice
                  return (
                    <div
                      key={question.id}
                      ref={(node) => { questionRefs.current[question.id] = node }}
                      className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                    <div className="mb-2 font-medium text-slate-900">Câu {index + 1}.</div>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-800 leading-7">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {question.prompt}
                      </ReactMarkdown>
                    </div>
                    {question.image_url ? <img src={question.image_url} alt="question" className="mx-auto my-4 max-h-[24rem] rounded-xl border border-slate-200" /> : null}
                    <div className="mt-4 space-y-2 text-sm">
                      {([
                        ['A', question.option_a],
                        ['B', question.option_b],
                        ['C', question.option_c],
                        ['D', question.option_d],
                      ] as const).map(([label, text]) => (
                        <label
                          key={`${question.id}-${label}`}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                            result
                              ? questionResult?.correct_choice === label
                                ? 'border-emerald-300 bg-emerald-50'
                                : selectedChoice === label
                                  ? 'border-rose-300 bg-rose-50'
                                  : 'border-slate-200 bg-white'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={label}
                            checked={selectedChoice === label}
                            onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                            disabled={!!result}
                          />
                          <span className="font-semibold">{label}.</span>
                          <span>{text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )})}
              </div>
            </div>

            <div className="xl:sticky xl:top-4 xl:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.25)]">
                <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {session ? `Đề: ${session.title}` : 'Đề thi'}
                </h1>
                {session ? <p className="mb-3 text-sm text-slate-700"><span className="font-semibold">Thời gian làm bài:</span> {session.duration_minutes} phút</p> : null}

                <p className="mb-2 text-sm font-semibold text-slate-900">Điều hướng câu hỏi</p>
                <p className="mb-3 text-sm text-slate-600">Tổng số câu: {questions.length}</p>

                <div className="mb-4 grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const isAnswered = Boolean(answers[question.id])
                    const qResult = resultMap.get(question.id)
                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => scrollToQuestion(question.id)}
                        className={`h-9 rounded-md border text-sm font-semibold transition-colors ${
                          result
                            ? qResult?.is_correct
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700'
                            : isAnswered
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>

                {!result ? (
                  <>
                    <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                      <ExamCountdown endsAt={endsAt} onExpired={() => handleSubmit(true)} />
                    </div>
                    {isExpired && !graceExpired ? (
                      <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center">
                        <p className="text-xs font-semibold text-amber-800">Hết giờ — đang nộp bài tự động...</p>
                        <p className="text-xs text-amber-700">
                          Thời gian gia hạn còn: {Math.floor(graceRemainSecs / 60)}:{String(graceRemainSecs % 60).padStart(2, '0')}
                        </p>
                      </div>
                    ) : null}
                    {isExpired && graceExpired ? (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-700">
                        Đề thi đã đóng. Không thể nộp bài.
                      </div>
                    ) : null}
                    {!isExpired && !errorMessage ? (
                      <Button onClick={() => handleSubmit()} disabled={!attemptId || submitMutation.isPending} className="w-full">
                        {submitMutation.isPending ? 'Đang nộp...' : 'Nộp bài'}
                      </Button>
                    ) : null}
                  </>
                ) : (
                  <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-900">Kết quả của bạn</p>
                    <p className="text-sm text-emerald-800">Số câu đúng: <span className="font-bold">{result.raw_score} / {questions.length}</span></p>
                    <p className="text-sm text-emerald-800">Điểm hệ 10: <span className="font-bold">{result.score_10}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </StudentLayout>
  )
}
