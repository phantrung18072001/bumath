import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { compressImage, uploadSubmission, getSubmissionSignedUrl, markGradeViewed } from '@/lib/api/submissions'
import type { Submission } from '@/lib/api/submissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Camera, Loader2 } from 'lucide-react'
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submittedImageUrl, setSubmittedImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Load signed URL for already-submitted image
  useEffect(() => {
    if (submission?.file_path) {
      getSubmissionSignedUrl(submission.file_path).then(setSubmittedImageUrl).catch(() => {})
    }
  }, [submission?.file_path])

  // Fire-and-forget: mark graded submission as viewed (D-15)
  useEffect(() => {
    if (submission?.status === 'graded' && !submission.student_viewed_at) {
      markGradeViewed(submission.id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['student', 'unviewed-grades'] })
        })
        .catch(() => {})
    }
  }, [submission?.id, submission?.status, submission?.student_viewed_at])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const compressed = await compressImage(selectedFile!)
      return uploadSubmission(userId, lessonId, compressed)
    },
    onSuccess: () => {
      setSelectedFile(null)
      setPreview(null)
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

  // Already submitted — no resubmit UI (D-15)
  if (submission) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Nộp bài làm</span>
          {submission.status === 'submitted' && (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Đã nộp (đang chờ chấm)</Badge>
          )}
          {submission.status === 'graded' && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đã chấm</Badge>
          )}
        </div>
        {submittedImageUrl && (
          <img
            src={submittedImageUrl}
            alt="Bài làm đã nộp"
            className="max-h-[200px] rounded-lg cursor-zoom-in object-contain"
            onClick={() => window.open(submittedImageUrl, '_blank', 'noopener')}
          />
        )}
        <p className="text-sm text-muted-foreground">
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
    )
  }

  // Not yet submitted
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Nộp bài làm</span>
        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">Chưa nộp</Badge>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/heic"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Ảnh bài làm"
      />

      {!selectedFile && (
        <Button
          variant="outline"
          className="min-h-[48px]"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-4 w-4 mr-2" />
          Chọn ảnh bài làm
        </Button>
      )}

      {preview && selectedFile && (
        <div className="space-y-2">
          <img src={preview} alt="Xem trước ảnh" className="max-h-[120px] rounded-lg object-contain" />
          <p className="text-sm text-muted-foreground">
            {selectedFile.name} — {(selectedFile.size / 1024).toFixed(0)} KB
          </p>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="min-h-[48px]"
              onClick={() => uploadMutation.mutate()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang xử lý...</>
                : 'Nộp bài'}
            </Button>
            <Button
              variant="ghost"
              className="min-h-[48px]"
              onClick={() => { setSelectedFile(null); setPreview(null) }}
              disabled={uploadMutation.isPending}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
