import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react'
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

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)

  // Form state
  const [score, setScore] = useState<string>('')
  const [comment, setComment] = useState('')

  // Teacher image upload state
  const [teacherImageFiles, setTeacherImageFiles] = useState<File[]>([])
  const [teacherImagePreviews, setTeacherImagePreviews] = useState<string[]>([])
  const [teacherImagePaths, setTeacherImagePaths] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const teacherFileInputRef = useRef<HTMLInputElement>(null)

  // Double-confirm state
  const [pendingConfirm, setPendingConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch submission
  const { data: submission, isLoading: submissionLoading, isError: submissionError } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => getSubmissionById(submissionId!),
    enabled: !!submissionId,
  })

  // Fetch signed URLs for student images
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
      <div className="container mx-auto py-8 max-w-5xl flex justify-center items-center min-h-64" aria-label="Đang tải...">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (submissionError || !submission) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <Link
          to="/quan-tri/bai-nop"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
        <p className="text-destructive leading-relaxed">Không thể tải bài nộp. Vui lòng thử lại.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      {/* Back link */}
      <Link
        to="/quan-tri/bai-nop"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 leading-relaxed"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>

      <h1 className="text-xl font-semibold mb-6 leading-relaxed">Chấm bài nộp</h1>

      {/* Two-column layout: image left, form right */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Left: Image carousel */}
        <div className="flex-1 min-w-0 overflow-y-auto pb-24 lg:pb-0">
          {totalImages === 0 ? (
            <div className="rounded-lg border bg-muted flex items-center justify-center h-80">
              <p className="text-sm text-muted-foreground leading-relaxed">Không có ảnh bài làm.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative rounded-lg border overflow-hidden bg-muted">
                <Zoom zoomMargin={24}>
                  <img
                    src={signedUrls[carouselIndex]}
                    alt={`Bài làm ${carouselIndex + 1}`}
                    className="w-full object-contain cursor-zoom-in"
                  />
                </Zoom>
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
                      aria-label="Ảnh tiếp"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              {totalImages > 1 && (
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  {carouselIndex + 1} / {totalImages}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Grading form — sticky sidebar (desktop only) */}
        <div className="hidden lg:block w-80 shrink-0 lg:sticky lg:top-8 space-y-5">
          {/* Score */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 leading-relaxed" htmlFor="grade-score">
              Điểm số
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="grade-score"
                type="number"
                min={0}
                max={10}
                step={0.5}
                className="w-24"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="0–10"
              />
              <span className="text-sm text-muted-foreground leading-relaxed">/10</span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 leading-relaxed" htmlFor="grade-comment">
              Nhận xét
            </label>
            <Textarea
              id="grade-comment"
              placeholder="Ví dụ: Làm đúng bước 1, cần kiểm tra lại dấu..."
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="leading-relaxed w-full"
            />
          </div>

          {/* Teacher image upload */}
          <div>
            <p className="text-sm font-semibold mb-1.5 leading-relaxed">Ảnh phản hồi (tùy chọn)</p>
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
              <div className="flex flex-wrap gap-2 mb-2">
                {teacherImagePreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <img
                      src={src}
                      alt={`Phản hồi ${i + 1}`}
                      className="h-16 w-16 rounded-md object-cover border"
                    />
                    <button
                      onClick={() => removeTeacherImage(i)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
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
              className="min-h-[48px]"
            >
              Thêm ảnh phản hồi
            </Button>
          </div>

          {/* Save / confirm */}
          {!pendingConfirm ? (
            <Button
              className="w-full min-h-[48px] leading-relaxed"
              onClick={handleSave}
              disabled={score === '' || uploadingImages}
            >
              Lưu điểm
            </Button>
          ) : (
            <div className="rounded-lg border p-4 space-y-3 bg-muted">
              <p className="text-sm font-semibold leading-relaxed">
                Bạn chắc chắn muốn lưu điểm {score}/10?
              </p>
              <div className="flex gap-2">
                <Button
                  className="flex-1 min-h-[48px]"
                  onClick={handleConfirm}
                  disabled={saving}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Xác nhận
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 min-h-[48px]"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t p-4 lg:hidden space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={10}
            step={0.5}
            className="w-24"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="0–10"
            aria-label="Điểm số (mobile)"
          />
          <span className="text-sm text-muted-foreground">/10</span>
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
          <div className="space-y-2">
            <p className="text-sm font-semibold leading-relaxed">
              Bạn chắc chắn muốn lưu điểm {score}/10?
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1 min-h-[48px]"
                onClick={handleConfirm}
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Xác nhận
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-h-[48px]"
                onClick={handleCancel}
                disabled={saving}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Spacer to prevent content from being hidden behind mobile sticky bar */}
      <div className="h-32 lg:hidden" />
    </div>
  )
}
