import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { fetchExamQuestions, fetchMyExamAttempt, upsertExamQuestion } from '@/lib/api/exams'
import ExamQuestionForm from '@/components/admin/ExamQuestionForm'

export default function ExamSessionDetailPage() {
  const { sessionId = '' } = useParams()
  const queryClient = useQueryClient()

  const { data: questions = [] } = useQuery({
    queryKey: ['admin', 'exam-questions', sessionId],
    queryFn: () => fetchExamQuestions(sessionId),
    enabled: !!sessionId,
  })

  const { data: existingAttempt } = useQuery({
    queryKey: ['admin', 'exam-attempt-lock', sessionId],
    queryFn: () => fetchMyExamAttempt(sessionId),
    enabled: !!sessionId,
  })

  const saveMutation = useMutation({
    mutationFn: upsertExamQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'exam-questions', sessionId] }),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Soạn câu hỏi đề thi
        </span>
      </h1>
      <ExamQuestionForm
        sessionId={sessionId}
        disabled={!!existingAttempt}
        onSave={(payload) => saveMutation.mutateAsync(payload)}
      />
      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="bm-glass-card p-5">
            <p className="font-medium">Câu {q.order_index}: {q.prompt}</p>
            {q.prompt_latex ? <BlockMath math={q.prompt_latex} /> : null}
            {q.image_url ? <img src={q.image_url} alt="exam question" className="mt-2 max-h-48 rounded-md" /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
