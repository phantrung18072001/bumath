import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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

export interface ChapterInlineFormProps {
  courseId: string
  chapter: Chapter | null
  nextOrderIndex: number
  onSuccess: () => void
  onCancel: () => void
}

export default function ChapterInlineForm({
  courseId,
  chapter,
  nextOrderIndex,
  onSuccess,
  onCancel,
}: ChapterInlineFormProps) {
  const isEditing = !!chapter

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: { title: '' },
  })

  useEffect(() => {
    if (chapter) form.reset({ title: chapter.title })
    else form.reset({ title: '' })
  }, [chapter, form])

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
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
        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer min-h-[44px]">
            Hủy
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="cursor-pointer min-h-[44px]">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {isEditing ? 'Lưu chuyên đề' : 'Thêm chuyên đề'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
