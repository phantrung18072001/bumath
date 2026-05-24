import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Upload } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Course, insertCourse, updateCourse, uploadCourseThumbnail } from '@/lib/api/courses'

const courseSchema = z.object({
  title: z.string().min(1, 'Tên khóa học không được để trống.'),
  description: z.string().optional(),
  thumbnail_url: z.string().optional(),
  target_grade: z.enum(['grade_7', 'grade_8', 'grade_9', 'advanced'], {
    required_error: 'Vui lòng chọn lớp mục tiêu.',
  }),
})

type CourseFormValues = z.infer<typeof courseSchema>

const GRADE_OPTIONS: { value: Course['target_grade']; label: string }[] = [
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn chuyên' },
]

interface CourseFormDialogProps {
  open: boolean
  course: Course | null
  onSuccess: () => void
  onClose: () => void
}

export default function CourseFormDialog({
  open,
  course,
  onSuccess,
  onClose,
}: CourseFormDialogProps) {
  const isEditing = !!course

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail_url: '',
      target_grade: 'grade_7',
    },
  })

  // Reset form when dialog opens or editing target changes
  useEffect(() => {
    if (open) {
      if (course) {
        form.reset({
          title: course.title,
          description: course.description ?? '',
          thumbnail_url: course.thumbnail_url ?? '',
          target_grade: course.target_grade,
        })
      } else {
        form.reset({
          title: '',
          description: '',
          thumbnail_url: '',
          target_grade: 'grade_7',
        })
      }
    }
  }, [open, course, form])

  const mutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      const payload = {
        title: values.title,
        description: values.description ?? null,
        thumbnail_url: values.thumbnail_url?.trim() || null,
        target_grade: values.target_grade,
      }
      if (isEditing) {
        return updateCourse(course.id, payload)
      }
      return insertCourse(payload)
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Đã cập nhật khóa học.' : 'Đã tạo khóa học thành công.')
      onSuccess()
    },
    onError: () => {
      toast.error('Lưu không thành công. Vui lòng kiểm tra lại thông tin.')
    },
  })

  function onSubmit(values: CourseFormValues) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên khóa học</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Toán lớp 7 — Đại số cơ bản" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về nội dung khóa học..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail khóa học</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="https://... hoặc upload ảnh"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={mutation.isPending}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          try {
                            const url = await uploadCourseThumbnail(file)
                            form.setValue('thumbnail_url', url, { shouldDirty: true })
                            toast.success('Đã upload thumbnail.')
                          } catch {
                            toast.error('Upload thumbnail thất bại.')
                          } finally {
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                      {field.value ? (
                        <div className="overflow-hidden rounded-lg border">
                          <img src={field.value} alt="thumbnail preview" className="h-32 w-full object-cover" />
                        </div>
                      ) : null}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lớp mục tiêu</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="min-h-[48px]">
                        <SelectValue placeholder="Chọn lớp..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GRADE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                ) : (
                  <Upload className="h-4 w-4 mr-1" />
                )}
                {isEditing ? 'Lưu khóa học' : 'Tạo khóa học'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
