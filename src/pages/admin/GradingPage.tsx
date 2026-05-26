import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, X, Images, MessageSquareText, Star } from 'lucide-react'
import { toast } from 'sonner'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import {
  getSubmissionById,
  getSubmissionSignedUrls,
  gradeSubmission,
  compressImage,
} from '@/lib/api/submissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function GradingPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()

  const [carouselIndex, setCarouselIndex] = useState(0)
  const [score, setScore] = useState<string>('')
  const [comment, setComment] = useState('')
  const [teacherImageFiles, setTeacherImageFiles] = useState<File[]>([])
  const [teacherImagePreviews, setTeacherImagePreviews] = useState<string[]>([])
  const [teacherImagePaths, setTeacherImagePaths] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const teacherFileInputRef = useRef<HTMLInputElement>(null)
  const [pendingConfirm, setPendingConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: submission, isLoading: submissionLoading, isError: submissionError } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => getSubmissionById(submissionId!),
    enabled: !!submissionId,
  })

  const { data: signedUrls = [], isLoading: urlsLoading } = useQuery({
    queryKey: ['submission-urls', submission?.file_path],
    queryFn: () => getSubmissionSignedUrls(submission!.file_path),
    enabled: !!submission?.file_path,
  })

  const totalImages = signedUrls.length

  const prevImage = () => setCarouselIndex((i) => (i - 1 + totalImages) % totalImages)
  const nextImage = () => setCarouselIndex((i) => (i + 1) % totalImages)

  const handleTeacherFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setTeacherImageFiles(prev => [...prev, ...files])
    setTeacherImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeTeacherImage = (index: number) => {
    setTeacherImageFiles(prev => prev.filter((_, i) => i !== index))
    setTeacherImagePreviews(prev => prev.filter((_, i) => i !== index))
    setTeacherImagePaths(prev => prev.filter((_, i) => i !== index))
  }

  const uploadTeacherImages = async (): Promise<string[]> => {
    if (teacherImageFiles.length === 0) return teacherImagePaths
    setUploadingImages(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const paths: string[] = []
      for (let i = 0; i < teacherImageFiles.length; i++) {
        const file = teacherImageFiles[i]
        const compressed = await compressImage(file)
        const path = `teacher/${submissionId}/${Date.now()}-${i}.jpg`
        const { error } = await supabase.storage
          .from('submissions')
          .upload(path, compressed, { contentType: 'image/jpeg', upsert: false })
        if (error) throw error
        paths.push(path)
      }
      return paths
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSave = () => {
    if (score === '') return
    setPendingConfirm(true)
  }

  const handleConfirm = async () => {
    if (!submissionId || score === '') return
    setSaving(true)
    try {
      const paths = await uploadTeacherImages()
      await gradeSubmission(submissionId, parseFloat(score), comment, paths)
      toast.success('Đã lưu điểm thành công!')
      navigate('/quan-tri/bai-nop')
    } catch (err) {
      console.error('[GradingPage] handleConfirm error:', err)
      toast.error('Lưu điểm thất bại. Vui lòng thử lại.')
      setPendingConfirm(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => setPendingConfirm(false)

  if (submissionLoading || urlsLoading) {
    return (
      <div className="mx-auto flex min-h-64 max-w-6xl items-center justify-center py-8" aria-label="Đang tải...">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (submissionError || !submission) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/quan-tri/bai-nop"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
        <p className="leading-relaxed text-destructive">Không thể tải bài nộp. Vui lòng thử lại.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <Link
        to="/quan-tri/bai-nop"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách chấm bài
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="p-5 md:p-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Chấm bài</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Đánh giá bài nộp học sinh</h1>
            <p className="mt-2 text-sm text-slate-600">
              Xem ảnh bài làm, nhập điểm và ghi nhận xét chi tiết trước khi lưu.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                <Images className="h-3.5 w-3.5" /> {totalImages} ảnh bài làm
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                <MessageSquareText className="h-3.5 w-3.5" /> Nhận xét chi tiết
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                <Star className="h-3.5 w-3.5" /> Chấm theo thang 10
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          {totalImages === 0 ? (
            <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-muted-foreground">
              Không có ảnh bài làm.
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <Zoom zoomMargin={24}>
                  <img
                    src={signedUrls[carouselIndex]}
                    alt={`Bài làm ${carouselIndex + 1}`}
                    className="max-h-[72dvh] w-full cursor-zoom-in object-contain"
                  />
                </Zoom>
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-1.5 text-white transition-colors hover:bg-slate-900"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-1.5 text-white transition-colors hover:bg-slate-900"
                      aria-label="Ảnh tiếp"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              {totalImages > 1 && (
                <div className="mt-3 text-center text-sm text-muted-foreground">Ảnh {carouselIndex + 1} / {totalImages}</div>
              )}
            </>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 lg:sticky lg:top-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="grade-score">
                Điểm số
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="grade-score"
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  className="w-28"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="0-10"
                />
                <span className="text-sm text-muted-foreground">/10</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="grade-comment">
                Nhận xét
              </label>
              <Textarea
                id="grade-comment"
                placeholder="Nêu rõ điểm mạnh, lỗi sai và hướng cải thiện"
                rows={6}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <p className="mb-1.5 text-sm font-semibold">Ảnh phản hồi (tùy chọn)</p>
              <input
                ref={teacherFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleTeacherFileSelect}
                className="hidden"
                aria-label="Ảnh phản hồi của giáo viên"
              />
              {teacherImagePreviews.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {teacherImagePreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <img
                        src={src}
                        alt={`Phản hồi ${i + 1}`}
                        className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                      />
                      <button
                        onClick={() => removeTeacherImage(i)}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                        aria-label={`Xóa ảnh phản hồi ${i + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => teacherFileInputRef.current?.click()}
                className="min-h-[44px]"
              >
                Thêm ảnh phản hồi
              </Button>
            </div>

            {!pendingConfirm ? (
              <Button
                className="w-full min-h-[48px]"
                onClick={handleSave}
                disabled={score === '' || uploadingImages}
              >
                Lưu điểm
              </Button>
            ) : (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold">Bạn chắc chắn muốn lưu điểm {score}/10?</p>
                <div className="flex gap-2">
                  <Button className="flex-1 min-h-[44px]" onClick={handleConfirm} disabled={saving}>
                    {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                    Xác nhận
                  </Button>
                  <Button variant="outline" className="flex-1 min-h-[44px]" onClick={handleCancel} disabled={saving}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
