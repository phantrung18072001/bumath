import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import StudentLayout from '@/components/student/StudentLayout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ExamCountdown from '@/components/student/ExamCountdown'
import ExamQuestionCard from '@/components/student/ExamQuestionCard'
import ExamSubmitPanel from '@/components/student/ExamSubmitPanel'
import {
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

  const { data: questions = [] } = useQuery({
    queryKey: ['student', 'exam-questions', sessionId],
    queryFn: () => fetchExamQuestions(sessionId),
    enabled: !!sessionId,
  })

  const { data: existingAttempt } = useQuery({
    queryKey: ['student', 'exam-attempt', sessionId],
    queryFn: () => fetchMyExamAttempt(sessionId),
    enabled: !!sessionId,
  })

  const startMutation = useMutation({ mutationFn: startExamAttempt })
  const saveMutation = useMutation({
    mutationFn: ({ attemptId, payload }: { attemptId: string; payload: Record<string, string> }) =>
      saveExamAttemptAnswers(attemptId, payload),
  })
  const submitMutation = useMutation({ mutationFn: submitExamAttempt })

  const attemptId = existingAttempt?.id ?? startMutation.data?.id
  const endsAt = useMemo(() => new Date(Date.now() + 30 * 60 * 1000).toISOString(), [])

  useEffect(() => {
    if (!sessionId || existingAttempt) return
    startMutation.mutate(sessionId, {
      onError: (error) => setErrorMessage((error as Error).message),
    })
  }, [sessionId, existingAttempt, startMutation])

  useEffect(() => {
    if (existingAttempt?.answers_payload) {
      setAnswers(existingAttempt.answers_payload)
    }
  }, [existingAttempt])

  useEffect(() => {
    if (!attemptId) return
    const timer = window.setTimeout(() => {
      saveMutation.mutate({ attemptId, payload: answers })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [attemptId, answers, saveMutation])

  async function handleSubmit() {
    if (!attemptId) return
    try {
      const submitResult = await submitMutation.mutateAsync(attemptId)
      setResult(submitResult)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  return (
    <StudentLayout>
      <div className="p-8 space-y-4">
        <h1 className="text-xl font-bold">Làm đề thi</h1>
        <ExamCountdown endsAt={endsAt} onExpired={handleSubmit} />

        {errorMessage ? (
          <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>
        ) : null}

        <div className="space-y-3">
          {questions.map((question) => (
            <ExamQuestionCard
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
              disabled={!!result}
            />
          ))}
        </div>

        {result ? (
          <div className="rounded-lg border p-4 space-y-1">
            <p className="font-semibold">Điểm thô: {result.raw_score}</p>
            <p className="font-semibold">Điểm hệ 10: {result.score_10}</p>
          </div>
        ) : (
          <ExamSubmitPanel onSubmit={handleSubmit} isSubmitting={submitMutation.isPending} disabled={!attemptId} />
        )}
      </div>
    </StudentLayout>
  )
}
