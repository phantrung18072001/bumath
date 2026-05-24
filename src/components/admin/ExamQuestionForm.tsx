import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ExamChoice, ExamQuestion } from '@/lib/api/exams'

interface Props {
  sessionId: string
  initialData?: ExamQuestion | null
  disabled?: boolean
  uploadingImage?: boolean
  onUploadImage: (file: File) => Promise<string>
  onSave: (payload: Partial<ExamQuestion> & { exam_session_id: string }) => Promise<void>
}

export default function ExamQuestionForm({ sessionId, initialData, disabled, uploadingImage, onUploadImage, onSave }: Props) {
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

  useEffect(() => {
    setPrompt(initialData?.prompt ?? '')
    setLatex(initialData?.prompt_latex ?? '')
    setImageUrl(initialData?.image_url ?? '')
    setOptions({
      A: initialData?.option_a ?? '',
      B: initialData?.option_b ?? '',
      C: initialData?.option_c ?? '',
      D: initialData?.option_d ?? '',
    })
    setCorrectChoice(initialData?.correct_choice ?? 'A')
  }, [initialData])

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
      order_index: initialData?.order_index,
      correct_choice: correctChoice,
    })
    setPrompt('')
    setLatex('')
    setImageUrl('')
    setOptions({ A: '', B: '', C: '', D: '' })
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) return
    const url = await onUploadImage(file)
    setImageUrl(url)
  }

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <p className="text-sm font-semibold">{initialData ? `Sửa câu ${initialData.order_index}` : 'Thêm câu hỏi mới'}</p>
      <Input placeholder="Nội dung câu hỏi" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={disabled} />
      <Input placeholder="LaTeX (tùy chọn), ví dụ: \\frac{1}{2}x^2 + 3x" value={latex} onChange={(e) => setLatex(e.target.value)} disabled={disabled} />
      <p className="text-xs text-muted-foreground">LaTeX dùng để hiển thị công thức toán. Nếu không dùng, có thể bỏ trống.</p>
      <Input type="file" accept="image/*" disabled={disabled || uploadingImage} onChange={(e) => handleImageUpload(e.target.files?.[0])} />
      {uploadingImage ? <p className="text-xs text-muted-foreground">Đang upload ảnh...</p> : null}
      {imageUrl ? <img src={imageUrl} alt="question" className="max-h-40 rounded-md border" /> : null}
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
      <Button onClick={submit} disabled={disabled}>{initialData ? 'Lưu chỉnh sửa' : 'Thêm câu hỏi'}</Button>
    </div>
  )
}
