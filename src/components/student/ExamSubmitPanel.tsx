import { Button } from '@/components/ui/button'

export default function ExamSubmitPanel({
  disabled,
  isSubmitting,
  onSubmit,
}: {
  disabled?: boolean
  isSubmitting?: boolean
  onSubmit: () => void
}) {
  return (
    <div className="sticky bottom-4 rounded-lg border bg-background/90 p-3">
      <Button onClick={onSubmit} disabled={disabled || isSubmitting} className="w-full">
        {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
      </Button>
    </div>
  )
}
