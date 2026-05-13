import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ExamChoice, ExamQuestion } from '@/lib/api/exams'

interface Props {
  sessionId: string
  initialData?: ExamQuestion | null
  disabled?: boolean
  onSave: (payload: Partial<ExamQuestion> & { exam_session_id: string }) => Promise<void>
}

export default function ExamQuestionForm({ sessionId, initialData, disabled, onSave }: Props) {
  const [prompt, setPrompt] = useState(initialData?.prompt ?? '')
  const [latex, setLatex] = useState(initialData?.prompt_latex ?? '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? '')
  const [options, setOptions] = useState({
    A: initialData?.option_a ?? '',
    B: initialData?.option_b ?? '',
    C: initialData?.option_c ?? '',
    D: initialData?.option_d ?? '',
  })
  const [correctChoice, setCorrectChoice] = useState<ExamChoice>('A')

  async function submit() {
    if (!prompt.trim() || Object.values(options).some((v) => !v.trim())) return
    await onSave({
      id: initialData?.id,
      exam_session_id: sessionId,
      prompt: prompt.trim(),
      prompt_latex: latex.trim() || null,
      image_url: imageUrl.trim() || null,
      option_a: options.A,
      option_b: options.B,
      option_c: options.C,
      option_d: options.D,
      order_index: initialData?.order_index ?? 1,
      correct_choice: correctChoice,
    })
    setPrompt('')
    setLatex('')
    setImageUrl('')
    setOptions({ A: '', B: '', C: '', D: '' })
  }

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <Input placeholder="Nội dung câu hỏi" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={disabled} />
      <Input placeholder="LaTeX (tùy chọn)" value={latex} onChange={(e) => setLatex(e.target.value)} disabled={disabled} />
      <Input placeholder="Image URL (tùy chọn)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={disabled} />
      {(['A', 'B', 'C', 'D'] as ExamChoice[]).map((choice) => (
        <Input
          key={choice}
          placeholder={`Đáp án ${choice}`}
          value={options[choice]}
          onChange={(e) => setOptions((prev) => ({ ...prev, [choice]: e.target.value }))}
          disabled={disabled}
        />
      ))}
      <select className="w-full rounded-md border px-3 py-2 text-sm" value={correctChoice} onChange={(e) => setCorrectChoice(e.target.value as ExamChoice)} disabled={disabled}>
        <option value="A">Đáp án đúng: A</option>
        <option value="B">Đáp án đúng: B</option>
        <option value="C">Đáp án đúng: C</option>
        <option value="D">Đáp án đúng: D</option>
      </select>
      <Button onClick={submit} disabled={disabled}>Lưu câu hỏi</Button>
    </div>
  )
}
