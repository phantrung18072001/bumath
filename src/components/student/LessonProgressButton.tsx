import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markLessonComplete, LessonProgress } from '@/lib/api/lesson-progress'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LessonProgressButtonProps {
  lessonId: string
  userId: string
  isCompleted: boolean
  courseId: string  // for query invalidation
}

export default function LessonProgressButton({
  lessonId,
  userId,
  isCompleted,
  courseId,
}: LessonProgressButtonProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => markLessonComplete(userId, lessonId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['lesson-progress', courseId] })
      const previous = queryClient.getQueryData(['lesson-progress', courseId])
      queryClient.setQueryData(['lesson-progress', courseId], (old: LessonProgress[] | undefined) => [
        ...(old ?? []),
        { id: 'optimistic', user_id: userId, lesson_id: lessonId, completed_at: new Date().toISOString() }
      ])
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['lesson-progress', courseId], context?.previous)
      toast.error('Không thể lưu trạng thái. Vui lòng thử lại.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', courseId] })
    },
  })

  if (isCompleted) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold min-h-[44px]">
        <Check className="h-4 w-4 shrink-0" />
        Đã hoàn thành bài học
      </div>
    )
  }

  return (
    <Button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="min-h-[48px] w-full md:w-auto bg-[#F97316] hover:bg-[#ea6c0c] text-white border-0 shadow-[0_4px_0_0_#c2540a] active:shadow-none active:translate-y-px transition-all duration-150 cursor-pointer font-semibold"
    >
      {mutation.isPending
        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        : <Check className="h-4 w-4 mr-2" />}
      Đánh dấu đã xem
    </Button>
  )
}
