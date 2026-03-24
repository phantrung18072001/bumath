import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Chapter, insertChapter, updateChapter } from '@/lib/api/chapters'

const chapterSchema = z.object({
  title: z.string().min(1, 'Tên chuyên đề không được để trống.'),
})

type ChapterFormValues = z.infer<typeof chapterSchema>

interface ChapterFormDialogProps {
  open: boolean
  courseId: string
  chapter: Chapter | null
  /** order_index to use when creating a new chapter (usually chapters.length) */
  nextOrderIndex: number
  onSuccess: () => void
  onClose: () => void
}

export default function ChapterFormDialog({
  open,
  courseId,
  chapter,
  nextOrderIndex,
  onSuccess,
  onClose,
}: ChapterFormDialogProps) {
  const isEditing = !!chapter

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: '',
    },
  })

  // Reset form when dialog opens or editing target changes
  useEffect(() => {
    if (open) {
      if (chapter) {
        form.reset({ title: chapter.title })
      } else {
        form.reset({ title: '' })
      }
    }
  }, [open, chapter, form])

  const mutation = useMutation({
    mutationFn: async (values: ChapterFormValues) => {
      if (isEditing) {
        return updateChapter(chapter.id, { title: values.title })
      }
      return insertChapter({
        course_id: courseId,
        title: values.title,
        order_index: nextOrderIndex,
      })
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Đã cập nhật chuyên đề.' : 'Đã thêm chuyên đề thành công.')
      onSuccess()
    },
    onError: () => {
      toast.error('Lưu không thành công. Vui lòng kiểm tra lại thông tin.')
    },
  })

  function onSubmit(values: ChapterFormValues) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa chuyên đề' : 'Thêm chuyên đề'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chuyên đề</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Chương 1 — Số nguyên" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="min-h-[48px]">
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                {isEditing ? 'Lưu chuyên đề' : 'Thêm chuyên đề'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
