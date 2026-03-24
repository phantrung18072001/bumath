import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Youtube } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Lesson,
  LessonInsert,
  insertLesson,
  updateLesson,
  uploadAssignment,
  deleteAssignment,
} from '@/lib/api/lessons'
import { extractYouTubeID } from '@/lib/youtube'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const lessonSchema = z.object({
  title: z.string().min(1, 'Tên bài học không được để trống.'),
  youtube_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || !!extractYouTubeID(val),
      'Đường dẫn YouTube không hợp lệ.',
    ),
  description: z.string().optional(),
})

type LessonFormValues = z.infer<typeof lessonSchema>

interface LessonFormDialogProps {
  open: boolean
  chapterId: string
  lesson: Lesson | null
  /** order_index to use when creating a new lesson (usually lessons.length) */
  nextOrderIndex: number
  onSuccess: () => void
  onClose: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function LessonFormDialog({
  open,
  chapterId,
  lesson,
  nextOrderIndex,
  onSuccess,
  onClose,
}: LessonFormDialogProps) {
  const isEditing = !!lesson
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track the selected new file (pending upload)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  // Track whether the existing attachment should be removed
  const [removeExisting, setRemoveExisting] = useState(false)

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: '',
      youtube_url: '',
      description: '',
    },
  })

  // Reset form when dialog opens or editing target changes
  useEffect(() => {
    if (open) {
      if (lesson) {
        form.reset({
          title: lesson.title,
          youtube_url: lesson.video_url ?? '',
          description: lesson.description ?? '',
        })
      } else {
        form.reset({ title: '', youtube_url: '', description: '' })
      }
      setSelectedFile(null)
      setFileError(null)
      setRemoveExisting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open, lesson, form])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setFileError(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File vượt quá 10MB. Vui lòng chọn file nhỏ hơn.')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
    // Selecting a new file implicitly replaces the existing one
    setRemoveExisting(false)
  }

  const mutation = useMutation({
    mutationFn: async (values: LessonFormValues) => {
      const videoId = values.youtube_url ? extractYouTubeID(values.youtube_url) : null
      const videoUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null

      // Resolve assignment_path
      let assignmentPath: string | null | undefined = undefined

      if (isEditing) {
        if (selectedFile) {
          // Upload new file; delete old file if present
          if (lesson.assignment_path) {
            await deleteAssignment(lesson.assignment_path)
          }
          assignmentPath = await uploadAssignment(selectedFile, lesson.id)
        } else if (removeExisting && lesson.assignment_path) {
          await deleteAssignment(lesson.assignment_path)
          assignmentPath = null
        }
        // else: keep existing (undefined = do not update the column)

        const payload: Record<string, unknown> = {
          title: values.title,
          video_url: videoUrl,
          description: values.description ?? null,
        }
        if (assignmentPath !== undefined) {
          payload.assignment_path = assignmentPath
        }
        return updateLesson(lesson.id, payload as Parameters<typeof updateLesson>[1])
      } else {
        // Create flow
        if (selectedFile) {
          // We need the lesson ID for the path prefix; use a temp prefix then update
          const tempPath = await uploadAssignment(selectedFile, `tmp/${chapterId}`)
          assignmentPath = tempPath
        }

        const insertPayload: LessonInsert = {
          chapter_id: chapterId,
          title: values.title,
          order_index: nextOrderIndex,
          video_url: videoUrl,
          description: values.description ?? null,
          assignment_path: assignmentPath ?? null,
        }
        return insertLesson(insertPayload)
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Đã cập nhật bài học.' : 'Đã thêm bài học thành công.')
      onSuccess()
    },
    onError: () => {
      toast.error('Lưu không thành công. Vui lòng kiểm tra lại thông tin.')
    },
  })

  function onSubmit(values: LessonFormValues) {
    if (fileError) return
    mutation.mutate(values)
  }

  const existingFileName = lesson?.assignment_path
    ? lesson.assignment_path.split('/').pop()
    : null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa bài học' : 'Thêm bài học'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-1">
          <Form {...form}>
            <form
              id="lesson-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-1 pb-2"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên bài học</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Bài 1 — Phương trình bậc nhất" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* YouTube URL */}
              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Youtube className="h-4 w-4" />
                      Đường dẫn video YouTube
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả bài học</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả ngắn về nội dung bài học (không bắt buộc)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Tệp bài tập (PDF hoặc hình ảnh)
                </label>

                {/* Show existing file info */}
                {isEditing && existingFileName && !removeExisting && !selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{existingFileName}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground h-7 px-2"
                      onClick={() => setRemoveExisting(true)}
                    >
                      Xóa file
                    </Button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={handleFileChange}
                />

                {/* Show newly selected file info */}
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    {selectedFile.name} — {formatFileSize(selectedFile.size)}
                  </p>
                )}

                {/* File error */}
                {fileError && (
                  <p className="text-sm text-destructive">{fileError}</p>
                )}
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            type="submit"
            form="lesson-form"
            disabled={mutation.isPending || !!fileError}
            className="min-h-[48px]"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            {isEditing ? 'Lưu bài học' : 'Thêm bài học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
