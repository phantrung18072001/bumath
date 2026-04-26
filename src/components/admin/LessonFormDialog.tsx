import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Youtube, Paperclip, FileText, X, Plus } from 'lucide-react'
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
  parseAssignmentPaths,
  getAssignmentPublicUrl,
} from '@/lib/api/lessons'
import { extractYouTubeID } from '@/lib/youtube'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'])
const ALLOWED_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,application/pdf'

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

  const [keptPaths, setKeptPaths] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  // Generate object URLs for image previews of newly selected files
  useEffect(() => {
    const urls = selectedFiles.map((f) =>
      f.type.startsWith('image/') ? URL.createObjectURL(f) : ''
    )
    setNewFilePreviews(urls)
    return () => urls.forEach((u) => u && URL.revokeObjectURL(u))
  }, [selectedFiles])

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { title: '', youtube_url: '', description: '' },
  })

  const youtubeUrl = form.watch('youtube_url') ?? ''
  const youtubePreviewId = youtubeUrl ? extractYouTubeID(youtubeUrl) : null

  useEffect(() => {
    if (open) {
      if (lesson) {
        form.reset({
          title: lesson.title,
          youtube_url: lesson.video_url ?? '',
          description: lesson.description ?? '',
        })
        setKeptPaths(parseAssignmentPaths(lesson.assignment_path))
      } else {
        form.reset({ title: '', youtube_url: '', description: '' })
        setKeptPaths([])
      }
      setSelectedFiles([])
      setFileError(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open, lesson, form])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null)
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const wrongType = files.find((f) => !ALLOWED_MIME.has(f.type))
    if (wrongType) {
      setFileError(`"${wrongType.name}" không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, WebP, HEIC, PDF.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const oversized = files.find((f) => f.size > MAX_FILE_SIZE)
    if (oversized) {
      setFileError(`"${oversized.name}" vượt quá 10MB.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFiles((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeKeptPath(path: string) {
    setKeptPaths((prev) => prev.filter((p) => p !== path))
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const mutation = useMutation({
    mutationFn: async (values: LessonFormValues) => {
      const videoId = values.youtube_url ? extractYouTubeID(values.youtube_url) : null
      const videoUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null

      let finalPaths: string[] = [...keptPaths]

      if (isEditing) {
        // Delete paths that were removed by user
        const originalPaths = parseAssignmentPaths(lesson.assignment_path)
        const removedPaths = originalPaths.filter((p) => !keptPaths.includes(p))
        for (const p of removedPaths) await deleteAssignment(p)

        // Upload new files
        for (const file of selectedFiles) {
          const path = await uploadAssignment(file, lesson.id)
          finalPaths.push(path)
        }

        const assignmentPath = finalPaths.length > 0 ? JSON.stringify(finalPaths) : null
        return updateLesson(lesson.id, {
          title: values.title,
          video_url: videoUrl,
          description: values.description ?? null,
          assignment_path: assignmentPath,
        })
      } else {
        // Create: upload all selected files to tmp prefix
        for (const file of selectedFiles) {
          const path = await uploadAssignment(file, `tmp/${chapterId}`)
          finalPaths.push(path)
        }

        const insertPayload: LessonInsert = {
          chapter_id: chapterId,
          title: values.title,
          order_index: nextOrderIndex,
          video_url: videoUrl,
          description: values.description ?? null,
          assignment_path: finalPaths.length > 0 ? JSON.stringify(finalPaths) : null,
        }
        return insertLesson(insertPayload)
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Đã cập nhật bài học.' : 'Đã thêm bài học thành công.')
      onSuccess()
    },
    onError: (err) => {
      console.error('[LessonFormDialog] save error:', err)
      toast.error('Lưu không thành công. Vui lòng kiểm tra lại thông tin.')
    },
  })

  function onSubmit(values: LessonFormValues) {
    if (fileError) return
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa bài học' : 'Thêm bài học'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
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

              {/* YouTube URL — optional */}
              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Youtube className="h-4 w-4" />
                      Đường dẫn video YouTube
                      <span className="text-xs font-normal text-muted-foreground ml-1">(không bắt buộc)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {youtubePreviewId && (
                      <div className="aspect-video w-full rounded-md overflow-hidden border">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubePreviewId}`}
                          title="YouTube preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                    )}
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

              {/* Multi-file attachment */}
              <div className="space-y-3 w-full overflow-hidden">
                <label className="text-sm font-medium leading-none flex items-center gap-1">
                  <Paperclip className="h-4 w-4" />
                  Tài liệu đính kèm cho học sinh
                  <span className="text-xs font-normal text-muted-foreground ml-1">(không bắt buộc, nhiều file)</span>
                </label>

                {/* Portrait card grid — existing + new files */}
                {(keptPaths.length > 0 || selectedFiles.length > 0) && (
                  <div className="flex flex-wrap gap-3">
                    {/* Existing files from DB */}
                    {keptPaths.map((p) => {
                      const name = p.split('/').pop() ?? p
                      const isImage = /\.(jpg|jpeg|png|gif|webp|heic|avif)$/i.test(name)
                      const publicUrl = getAssignmentPublicUrl(p)
                      return (
                        <div key={p} className="relative w-24 flex flex-col gap-1">
                          {/* Portrait thumbnail */}
                          <div className="relative w-24 h-32 rounded-md border bg-muted/40 overflow-hidden">
                            {isImage ? (
                              <img src={publicUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                                <FileText className="h-8 w-8" />
                                <span className="text-[10px] uppercase font-medium">PDF</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeKeptPath(p)}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate text-center w-24" title={name}>{name}</p>
                        </div>
                      )
                    })}

                    {/* Newly selected files */}
                    {selectedFiles.map((file, i) => {
                      const previewUrl = newFilePreviews[i]
                      const isPdf = file.type === 'application/pdf'
                      return (
                        <div key={i} className="relative w-24 flex flex-col gap-1">
                          <div className="relative w-24 h-32 rounded-md border border-dashed bg-muted/20 overflow-hidden">
                            {previewUrl ? (
                              <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                                <FileText className="h-8 w-8" />
                                <span className="text-[10px] uppercase font-medium">{isPdf ? 'PDF' : file.name.split('.').pop()?.toUpperCase()}</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(i)}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate text-center w-24" title={file.name}>{file.name}</p>
                          <p className="text-[10px] text-muted-foreground text-center">{formatFileSize(file.size)}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add file button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_ACCEPT}
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm file (JPG, PNG, WebP, HEIC, PDF — tối đa 10MB)
                </Button>

                {fileError && <p className="text-sm text-destructive">{fileError}</p>}
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
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {isEditing ? 'Lưu bài học' : 'Thêm bài học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
