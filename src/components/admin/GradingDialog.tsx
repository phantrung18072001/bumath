import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { gradeSubmission, getSubmissionSignedUrl, UngradedSubmission } from '@/lib/api/submissions'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

interface GradingDialogProps {
  submission: UngradedSubmission | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function GradingDialog({ submission, open, onClose, onSuccess }: GradingDialogProps) {
  const [score, setScore] = useState<string>('')
  const [comment, setComment] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Reset state and load signed URL when dialog opens with a new submission
  useEffect(() => {
    let cancelled = false

    if (open && submission) {
      setScore('')
      setComment('')
      setImageUrl(null)
      setImageError(false)
      setImageLoading(true)
      getSubmissionSignedUrl(submission.file_path)
        .then((url) => {
          if (!cancelled) {
            setImageUrl(url)
            setImageLoading(false)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setImageError(true)
            setImageLoading(false)
          }
        })
    }
    if (!open) {
      setScore('')
      setComment('')
      setImageUrl(null)
      setImageError(false)
      setImageLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [open, submission])

  const mutation = useMutation({
    mutationFn: () => gradeSubmission(submission!.id, parseFloat(score), comment),
    onSuccess: () => {
      onSuccess()
    },
    onError: () => {
      toast.error('Lưu điểm thất bại. Vui lòng thử lại.')
    },
  })

  function handleSave() {
    if (!submission || score === '') return
    mutation.mutate()
  }

  if (!submission) return null

  const dialogTitle = `Chấm bài: ${submission.profiles.full_name} — ${submission.lessons.chapters.courses.title} — ${submission.lessons.title}`

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Submission photo */}
          <div>
            {imageLoading && (
              <Skeleton className="w-full h-48 rounded-md" />
            )}
            {imageError && !imageLoading && (
              <p className="text-sm text-destructive">Không thể tải ảnh bài làm.</p>
            )}
            {imageUrl && !imageLoading && !imageError && (
              <div className="max-h-[60vh] overflow-y-auto">
                <img
                  src={imageUrl}
                  alt="Bài làm đã nộp"
                  className="w-full object-contain rounded-md"
                />
              </div>
            )}
          </div>

          {/* Score input */}
          <div className="flex items-center gap-2">
            <label htmlFor="grading-score" className="sr-only">diem so</label>
            <Input
              id="grading-score"
              type="number"
              min={0}
              max={10}
              step={0.5}
              className="w-24"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            <span className="text-sm text-muted-foreground">/10</span>
          </div>

          {/* Comment textarea */}
          <Textarea
            placeholder="Ví dụ: Làm đúng bước 1, cần kiểm tra lại dấu..."
            rows={3}
            aria-label="Nhận xét"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="min-h-[48px]">
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending || score === ''}
            className="min-h-[48px]"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Lưu điểm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
