import type { ExamQuestion } from '@/lib/api/exams'
import { BlockMath } from 'react-katex'

export default function ExamQuestionCard({
  question,
  value,
  onChange,
  disabled,
}: {
  question: ExamQuestion
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <p className="font-medium">Câu {question.order_index}: {question.prompt}</p>
      {question.prompt_latex ? <BlockMath math={question.prompt_latex} /> : null}
      {question.image_url ? <img src={question.image_url} alt="question" className="max-h-56 rounded-md" /> : null}
      {(['A', 'B', 'C', 'D'] as const).map((choice) => (
        <label key={choice} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={question.id}
            value={choice}
            checked={value === choice}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
          <span>{choice}. {question[`option_${choice.toLowerCase()}` as 'option_a' | 'option_b' | 'option_c' | 'option_d']}</span>
        </label>
      ))}
    </div>
  )
}
