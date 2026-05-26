import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { compressImage, uploadSubmission, resubmitSubmission, getSubmissionSignedUrls, markGradeViewed } from '@/lib/api/submissions'
import { openExternalUrl } from '@/lib/open-external-url'
import type { Submission } from '@/lib/api/submissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Camera, Loader2, X, ImageIcon, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface SubmissionAreaProps {
  lessonId: string
  userId: string
  courseId: string
  submission: Submission | null
}

export default function SubmissionArea({
  lessonId,
  userId,
  courseId,
  submission,
}: SubmissionAreaProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submittedImageUrls, setSubmittedImageUrls] = useState<string[]>([])
  const [resubmitMode, setResubmitMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (submission?.file_path) {
      getSubmissionSignedUrls(submission.file_path).then(setSubmittedImageUrls).catch(() => {})
    }
  }, [submission?.file_path])

  useEffect(() => {
    if (submission?.status === 'graded' && !submission.student_viewed_at) {
      markGradeViewed(submission.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ['graded-unviewed'] }))
        .catch(() => {})
    }
  }, [submission?.id, submission?.status, submission?.student_viewed_at])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setSelectedFiles(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const cancelResubmit = () => {
    setResubmitMode(false)
    setSelectedFiles([])
    setPreviews([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const compressed = await Promise.all(selectedFiles.map(f => compressImage(f)))
      return uploadSubmission(userId, lessonId, compressed)
    },
    onSuccess: () => {
      setSelectedFiles([])
      setPreviews([])
      queryClient.invalidateQueries({ queryKey: ['submissions', courseId] })
      toast.success('Nộp bài thành công!')
    },
    onError: (err: Error) => {
      if (err.message === 'IMAGE_TOO_LARGE') {
        toast.error('Ảnh vẫn quá lớn sau khi nén. Vui lòng chọn ảnh khác.')
      } else {
        toast.error('Tải ảnh lên thất bại. Vui lòng kiểm tra kết nối và thử lại.')
      }
    },
  })

  const resubmitMutation = useMutation({
    mutationFn: async () => {
      const compressed = await Promise.all(selectedFiles.map(f => compressImage(f)))
      return resubmitSubmission(submission!.id, userId, lessonId, compressed)
    },
    onSuccess: () => {
      cancelResubmit()
      queryClient.invalidateQueries({ queryKey: ['submissions', courseId] })
      toast.success('Nộp lại thành công!')
    },
    onError: (err: Error) => {
      if (err.message === 'IMAGE_TOO_LARGE') {
        toast.error('Ảnh vẫn quá lớn sau khi nén. Vui lòng chọn ảnh khác.')
      } else {
        toast.error('Tải ảnh lên thất bại. Vui lòng kiểm tra kết nối và thử lại.')
      }
    },
  })

  const FilePickerSection = ({ onSubmit, isPending }: { onSubmit: () => void, isPending: boolean }) => (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/heic"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Ảnh bài làm"
      />
      {selectedFiles.length === 0 && (
        <Button variant="outline" className="min-h-[48px]" onClick={() => fileInputRef.current?.click()}>
          <Camera className="h-4 w-4 mr-2" />
          Chọn ảnh bài làm
        </Button>
      )}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt={`Ảnh ${i + 1}`} className="h-[80px] w-[80px] rounded-lg object-cover" />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label={`Xóa ảnh ${i + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-[80px] w-[80px] rounded-lg border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              aria-label="Thêm ảnh"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{selectedFiles.length} ảnh đã chọn</p>
          <div className="flex gap-2">
            <Button variant="default" className="min-h-[48px]" onClick={onSubmit} disabled={isPending}>
              {isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang xử lý...</>
                : resubmitMode ? 'Xác nhận nộp lại' : 'Nộp bài'}
            </Button>
            <Button variant="ghost" className="min-h-[48px]" onClick={cancelResubmit} disabled={isPending}>
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  const LABEL = 'text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5'

  if (submission) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className={LABEL}>
              <Camera className="h-3.5 w-3.5" />
              Nộp bài làm
            </p>
            {submission.status === 'submitted' && (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Đã nộp (đang chờ chấm)</Badge>
            )}
            {submission.status === 'graded' && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đã chấm</Badge>
            )}
          </div>

          {submittedImageUrls.length > 0 && !resubmitMode && (
            <div className="flex flex-wrap gap-3">
              {submittedImageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Bài làm ${i + 1}`}
                  className="w-[200px] h-[200px] rounded-md border object-cover cursor-pointer shrink-0"
                  onClick={() => openExternalUrl(url)}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Đã nộp lúc {new Date(submission.submitted_at).toLocaleString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>

          {submission.status === 'graded' && submission.score !== null && (
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-sm font-semibold">Điểm: {submission.score}/10</p>
              {submission.comment && (
                <p className="text-sm text-muted-foreground">{submission.comment}</p>
              )}
            </div>
          )}
        </div>

        {submission.status === 'graded' && (submission.teacher_images ?? []).filter(Boolean).length > 0 && (
          <div className="space-y-3">
            <p className={LABEL}>
              <MessageSquare className="h-3.5 w-3.5" />
              Hình ảnh phản hồi từ giáo viên
            </p>
            <TeacherImages paths={submission.teacher_images} />
          </div>
        )}

        {submission.status === 'submitted' && !resubmitMode && (
          <Button variant="outline" size="sm" className="min-h-[48px]" onClick={() => setResubmitMode(true)}>
            Nộp lại
          </Button>
        )}

        {resubmitMode && (
          <FilePickerSection onSubmit={() => resubmitMutation.mutate()} isPending={resubmitMutation.isPending} />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5" />
          Nộp bài làm
        </p>
        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">Chưa nộp</Badge>
      </div>
      <FilePickerSection onSubmit={() => uploadMutation.mutate()} isPending={uploadMutation.isPending} />
    </div>
  )
}

function TeacherImages({ paths }: { paths: string[] }) {
  const { data: urls } = useQuery({
    queryKey: ['teacher-images', paths],
    queryFn: () => getSubmissionSignedUrls(paths),
    enabled: paths.length > 0,
  })
  if (!urls) return null
  return (
    <div className="flex flex-wrap gap-3">
      {urls.map((u, i) => (
        <img
          key={i}
          src={u}
          alt={`Phản hồi ${i + 1}`}
          className="w-[200px] h-[200px] rounded-md border object-cover cursor-pointer shrink-0"
          onClick={() => openExternalUrl(u)}
        />
      ))}
    </div>
  )
}
