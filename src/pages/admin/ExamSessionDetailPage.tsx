import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, EyeOff, GripVertical, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  deleteExamQuestion,
  fetchExamQuestions,
  fetchMyExamAttempt,
  saveExamQuestionsBatch,
  updateExamQuestionOrder,
  uploadExamQuestionImage,
  type ExamChoice,
  type ExamQuestion,
} from '@/lib/api/exams'

type QuestionDraft = {
  prompt: string
  image_url: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_choice: ExamChoice
}

const EMPTY_DRAFT: QuestionDraft = {
  prompt: '',
  image_url: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_choice: 'A',
}
const LATEX_EXAMPLE = '\\frac{1}{2}x^2 + 3x'

function toDraft(question: ExamQuestion): QuestionDraft {
  return {
    prompt: question.prompt,
    image_url: question.image_url ?? '',
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    correct_choice: question.correct_choice ?? 'A',
  }
}

function isTempId(id: string) {
  return id.startsWith('tmp-')
}

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const verticalTransform = transform ? { ...transform, x: 0 } : null

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(verticalTransform), transition }} className={isDragging ? 'opacity-75' : ''}>
      {children({ attributes, listeners } as never)}
    </div>
  )
}

export default function ExamSessionDetailPage() {
  const { sessionId = '' } = useParams()
  const queryClient = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const [drafts, setDrafts] = useState<Record<string, QuestionDraft>>({})
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({})
  const [previewMode, setPreviewMode] = useState(false)
  const [orderedIds, setOrderedIds] = useState<string[]>([])
  const [isSavingAll, setIsSavingAll] = useState(false)

  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['admin', 'exam-questions', sessionId],
    queryFn: () => fetchExamQuestions(sessionId),
    enabled: !!sessionId,
  })

  const { data: existingAttempt } = useQuery({
    queryKey: ['admin', 'exam-attempt-lock', sessionId],
    queryFn: () => fetchMyExamAttempt(sessionId),
    enabled: !!sessionId,
  })

  const byId = useMemo(() => {
    const map = new Map<string, ExamQuestion>()
    questions.forEach((q) => map.set(q.id, q))
    return map
  }, [questions])

  useEffect(() => {
    const sorted = [...questions].sort((a, b) => a.order_index - b.order_index)
    const persistedIds = sorted.map((q) => q.id)
    setOrderedIds((prev) => {
      const tempIds = prev.filter((id) => isTempId(id))
      return [...persistedIds, ...tempIds]
    })
    setDrafts((prev) => {
      const next = { ...prev }
      for (const q of sorted) {
        if (!next[q.id]) next[q.id] = toDraft(q)
      }
      return next
    })
  }, [questions])

  const saveBatchMutation = useMutation({
    mutationFn: ({ questions }: {
      questions: Array<{
        id?: string
        prompt: string
        prompt_latex: null
        image_url: string | null
        option_a: string
        option_b: string
        option_c: string
        option_d: string
        order_index: number
        correct_choice: ExamChoice
      }>
    }) => saveExamQuestionsBatch(sessionId, questions),
  })
  const uploadMutation = useMutation({ mutationFn: ({ file }: { file: File }) => uploadExamQuestionImage(sessionId, file) })
  const deleteMutation = useMutation({ mutationFn: deleteExamQuestion })
  const isLocked = !!existingAttempt

  function currentDraft(id: string): QuestionDraft {
    if (drafts[id]) return drafts[id]
    const q = byId.get(id)
    return q ? toDraft(q) : EMPTY_DRAFT
  }

  async function persistOrder(ids: string[]) {
    const persisted = ids.filter((id) => !isTempId(id))
    await Promise.all(persisted.map((id, index) => updateExamQuestionOrder(id, index + 1)))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(String(active.id))
      const newIndex = prev.indexOf(String(over.id))
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function insertEmptyCard(afterIndex: number) {
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setDrafts((prev) => ({ ...prev, [tempId]: { ...EMPTY_DRAFT } }))
    setOrderedIds((prev) => {
      const next = [...prev]
      next.splice(afterIndex + 1, 0, tempId)
      return next
    })
  }

  async function handleUploadImage(id: string, file?: File) {
    if (!file) return
    const url = await uploadMutation.mutateAsync({ file })
    const draft = currentDraft(id)
    setDrafts((prev) => ({ ...prev, [id]: { ...draft, image_url: url } }))
  }

  async function handleDeleteQuestion(id: string) {
    if (isTempId(id)) {
      setOrderedIds((prev) => prev.filter((item) => item !== id))
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      return
    }

    await deleteMutation.mutateAsync(id)
    const nextIds = orderedIds.filter((item) => item !== id)
    setOrderedIds(nextIds)
    await persistOrder(nextIds)
    queryClient.invalidateQueries({ queryKey: ['admin', 'exam-questions', sessionId] })
  }

  async function handleSaveAll() {
    setIsSavingAll(true)
    try {
      setErrors({})
      // TODO(exam-ux): autosave draft changes (debounced + optimistic UI + rollback on RPC failure).
      const batchPayload = orderedIds.map((id, index) => {
        const draft = currentDraft(id)
        return {
          id: isTempId(id) ? undefined : id,
          prompt: draft.prompt,
          prompt_latex: null,
          image_url: draft.image_url.trim() || null,
          option_a: draft.option_a,
          option_b: draft.option_b,
          option_c: draft.option_c,
          option_d: draft.option_d,
          order_index: index + 1,
          correct_choice: draft.correct_choice,
        }
      })

      await saveBatchMutation.mutateAsync({ questions: batchPayload })
      queryClient.invalidateQueries({ queryKey: ['admin', 'exam-questions', sessionId] })
    } finally {
      setIsSavingAll(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-34px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Soạn câu hỏi đề thi</h1>
            <p className="mt-1 text-sm text-slate-600">Kéo-thả theo chiều dọc để đổi thứ tự. Chỉnh sửa inline và lưu một lần cho toàn bộ đề.</p>
          </div>
          <div className="flex gap-2">
            <Button variant={previewMode ? 'default' : 'outline'} className="rounded-xl border-slate-300" onClick={() => setPreviewMode((prev) => !prev)}>
              {previewMode ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {previewMode ? 'Tắt preview' : 'Preview dạng học sinh'}
            </Button>
            {!previewMode ? (
              <Button onClick={handleSaveAll} disabled={isLocked || isSavingAll}>
                <Save className="mr-2 h-4 w-4" /> {isSavingAll ? 'Đang lưu...' : 'Lưu toàn bộ đề'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {isLocked ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Đề đã có học sinh bắt đầu làm. Hệ thống khóa chỉnh sửa nội dung câu hỏi.
        </div>
      ) : null}

      {isQuestionsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isQuestionsLoading && previewMode ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.25)]">
          <p className="mb-3 text-base font-semibold text-slate-900">Preview bài thi học sinh</p>
          <div className="space-y-4">
            {orderedIds.map((id, idx) => {
              const draft = currentDraft(id)
              return (
                <div key={`preview-inline-${id}`} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 whitespace-pre-wrap text-slate-800">
                    <div className="font-medium text-slate-900 mb-2">Câu {idx + 1}. </div>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-800">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {draft.prompt}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {draft.image_url ? <img src={draft.image_url} alt="preview" className="mx-auto mb-3 max-h-72 rounded-lg" /> : null}
                  <div className="space-y-2 text-sm">
                    {([
                      ['A', draft.option_a],
                      ['B', draft.option_b],
                      ['C', draft.option_c],
                      ['D', draft.option_d],
                    ] as const).map(([label, text]) => (
                      <label key={`${id}-${label}`} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                        <input type="radio" disabled />
                        <span className="font-semibold">{label}.</span>
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : !isQuestionsLoading ? (
        <div className="space-y-4">
          {!isLocked && orderedIds.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
              <p className="mb-3 text-sm text-slate-600">Chưa có câu hỏi nào. Bấm để tạo card câu hỏi đầu tiên.</p>
              <Button type="button" onClick={() => insertEmptyCard(-1)}>
                <Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi đầu tiên
              </Button>
            </div>
          ) : null}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
              {orderedIds.map((id, index) => {
                const draft = currentDraft(id)
                const fieldErrors = errors[id] ?? {}
                return (
                  <SortableCard key={id} id={id}>
                    {({ attributes, listeners }: { attributes: Record<string, unknown>; listeners: Record<string, unknown> }) => (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.25)]">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-700">Câu hỏi {index + 1}</p>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
                            {...attributes}
                            {...listeners}
                            aria-label="Kéo để đổi thứ tự"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="mb-2">
                            <Label>Nội dung câu hỏi</Label>
                            </div>
                            <Textarea value={draft.prompt} disabled={isLocked} onChange={(e) => setDrafts((prev) => ({ ...prev, [id]: { ...draft, prompt: e.target.value } }))} />
                            {fieldErrors.prompt ? <p className="mt-1 text-xs text-destructive">{fieldErrors.prompt}</p> : null}
                          </div>

                          <p className="text-xs text-muted-foreground">Hỗ trợ Markdown + Math. Công thức inline bọc bằng <code>$...$</code> (ví dụ: <code>${LATEX_EXAMPLE}$</code>), công thức block bọc bằng <code>$$...$$</code>.</p>

                          <div>
                            <Label>Ảnh minh họa câu hỏi (upload)</Label>
                            <div className="mt-1 flex items-center gap-2">
                              <Input type="file" accept="image/*" disabled={isLocked || uploadMutation.isPending} onChange={(e) => handleUploadImage(id, e.target.files?.[0])} />
                              <Button type="button" variant="outline" size="icon" disabled>
                                <Upload className="h-4 w-4" />
                              </Button>
                              {draft.image_url ? (
                                <Button type="button" variant="outline" size="icon" disabled={isLocked} onClick={() => setDrafts((prev) => ({ ...prev, [id]: { ...draft, image_url: '' } }))}>
                                  <X className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
                            {draft.image_url ? <img src={draft.image_url} alt="question" className="mt-2 max-h-40 rounded-md border" /> : null}
                          </div>

                          <div>
                            <Label>Đáp án A</Label>
                            <Input placeholder="Nhập đáp án A" value={draft.option_a} disabled={isLocked} onChange={(e) => setDrafts((prev) => ({ ...prev, [id]: { ...draft, option_a: e.target.value } }))} />
                            {fieldErrors.option_a ? <p className="text-xs text-destructive">{fieldErrors.option_a}</p> : null}
                          </div>
                          <div>
                            <Label>Đáp án B</Label>
                            <Input placeholder="Nhập đáp án B" value={draft.option_b} disabled={isLocked} onChange={(e) => setDrafts((prev) => ({ ...prev, [id]: { ...draft, option_b: e.target.value } }))} />
                            {fieldErrors.option_b ? <p className="text-xs text-destructive">{fieldErrors.option_b}</p> : null}
                          </div>
                          <div>
                            <Label>Đáp án C</Label>
                            <Input placeholder="Nhập đáp án C" value={draft.option_c} disabled={isLocked} onChange={(e) => setDrafts((prev) => ({ ...prev, [id]: { ...draft, option_c: e.target.value } }))} />
                            {fieldErrors.option_c ? <p className="text-xs text-destructive">{fieldErrors.option_c}</p> : null}
                          </div>
                          <div>
                            <Label>Đáp án D</Label>
                            <Input placeholder="Nhập đáp án D" value={draft.option_d} disabled={isLocked} onChange={(e) => setDrafts((prev) => ({ ...prev, [id]: { ...draft, option_d: e.target.value } }))} />
                            {fieldErrors.option_d ? <p className="text-xs text-destructive">{fieldErrors.option_d}</p> : null}
                          </div>

                          <Select
                            value={draft.correct_choice}
                            onValueChange={(value) => setDrafts((prev) => ({ ...prev, [id]: { ...draft, correct_choice: value as ExamChoice } }))}
                            disabled={isLocked}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn đáp án đúng" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Đáp án đúng: A</SelectItem>
                              <SelectItem value="B">Đáp án đúng: B</SelectItem>
                              <SelectItem value="C">Đáp án đúng: C</SelectItem>
                              <SelectItem value="D">Đáp án đúng: D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button type="button" variant="outline" onClick={() => insertEmptyCard(index)} disabled={isLocked}>
                            <Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi
                          </Button>
                          <Button type="button" variant="destructive" onClick={() => handleDeleteQuestion(id)} disabled={isLocked || deleteMutation.isPending}>
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa câu hỏi
                          </Button>
                        </div>
                      </div>
                    )}
                  </SortableCard>
                )
              })}
            </SortableContext>
          </DndContext>
        </div>
      ) : null}
    </div>
  )
}
