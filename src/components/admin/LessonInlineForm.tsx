import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Youtube, Paperclip, X, Plus, Video, BookOpen } from 'lucide-react'
import { getFileIcon } from '@/lib/file-icon'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
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

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'])
const ALLOWED_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,application/pdf'

const lessonSchema = z.object({
  title: z.string().min(1, 'Tên bài học không được để trống.'),
  youtube_url: z
    .string()
    .optional()
    .refine((val) => !val || !!extractYouTubeID(val), 'Đường dẫn YouTube không hợp lệ.'),
  description: z.string().optional(),
})

type LessonFormValues = z.infer<typeof lessonSchema>

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface LessonInlineFormProps {
  chapterId: string
  lesson: Lesson | null
  nextOrderIndex: number
  onSuccess: () => void
  onCancel: () => void
}

export default function LessonInlineForm({
  chapterId,
  lesson,
  nextOrderIndex,
  onSuccess,
  onCancel,
}: LessonInlineFormProps) {
  const isEditing = !!lesson
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [keptPaths, setKeptPaths] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    const urls = selectedFiles.map((f) =>
      f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
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
  }, [lesson, form])

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

      const finalPaths: string[] = [...keptPaths]

      if (isEditing && lesson) {
        const originalPaths = parseAssignmentPaths(lesson.assignment_path)
        const removedPaths = originalPaths.filter((p) => !keptPaths.includes(p))
        for (const p of removedPaths) await deleteAssignment(p)

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
      }

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
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Đã cập nhật bài học.' : 'Đã thêm bài học thành công.')
      onSuccess()
    },
    onError: (err) => {
      console.error('[LessonInlineForm] save error:', err)
      toast.error('Lưu không thành công. Vui lòng kiểm tra lại thông tin.')
    },
  })

  function onSubmit(values: LessonFormValues) {
    if (fileError) return
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form id="lesson-inline-form" onSubmit={form.handleSubmit(onSubmit)} className="p-4 md:p-8 space-y-8">

        {/* Action bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{isEditing ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}</p>
              <p className="text-xs text-muted-foreground">Điền thông tin rồi nhấn Lưu</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} className="cursor-pointer h-9">
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={mutation.isPending || !!fileError}
              className="cursor-pointer h-9 bg-[#F97316] hover:bg-[#ea6c0c] text-white border-0 shadow-[0_3px_0_0_#c2540a] active:shadow-none active:translate-y-px transition-all duration-150"
            >
              {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              {isEditing ? 'Lưu bài học' : 'Thêm bài học'}
            </Button>
          </div>
        </div>

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
                Tên bài học <span className="text-destructive">*</span>
              </label>
              <FormControl>
                <input
                  autoFocus
                  placeholder="VD: Bài 1 — Phương trình bậc nhất"
                  className="text-2xl font-bold bg-transparent outline-none border-b-2 border-muted-foreground/20 focus:border-primary w-full transition-colors duration-200 placeholder:text-muted-foreground/25 pb-2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video */}
        <FormField
          control={form.control}
          name="youtube_url"
          render={({ field }) => (
            <FormItem>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Youtube className="h-3.5 w-3.5 text-red-500" />
                Video YouTube
                <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(không bắt buộc)</span>
              </label>
              <div className="max-w-4xl mb-3">
              <AspectRatio
                ratio={16 / 9}
                className={cn(
                  'rounded-2xl overflow-hidden transition-colors duration-200',
                  youtubePreviewId ? 'bg-black' : 'bg-muted/50 border-2 border-dashed border-border'
                )}
              >
                {youtubePreviewId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubePreviewId}`}
                    title="YouTube preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <div className="h-14 w-14 rounded-2xl bg-background/70 flex items-center justify-center shadow-sm">
                      <Video className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground/50">Chưa có video — dán URL bên dưới</p>
                  </div>
                )}
              </AspectRatio>
              </div>
              <FormControl>
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 focus-within:border-primary/50 focus-within:bg-white/60 transition-all duration-150">
                  <Youtube className="h-4 w-4 text-red-500 shrink-0" />
                  <input
                    placeholder="Dán URL YouTube vào đây..."
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/40"
                    {...field}
                  />
                  {field.value && (
                    <button
                      type="button"
                      onClick={() => field.onChange('')}
                      className="text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Xóa URL"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
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
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
                Mô tả bài học
                <span className="font-normal normal-case tracking-normal ml-1 text-muted-foreground/70">(không bắt buộc)</span>
              </label>
              <FormControl>
                <Textarea
                  placeholder="Mô tả ngắn về nội dung, mục tiêu học tập của bài học..."
                  rows={8}
                  className="resize-y bg-muted/30 border border-border/50 rounded-xl text-base placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/40 min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File attachments */}
        <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-3">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5" />
            Bài kiểm tra
            <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(JPG, PNG, PDF — tối đa 10MB)</span>
          </label>
            <div className="space-y-3 w-full overflow-hidden">
              {(keptPaths.length > 0 || selectedFiles.length > 0) && (
                <div className="flex flex-wrap gap-3">
                  {keptPaths.map((p) => {
                    const name = p.split('/').pop() ?? p
                    const isImage = /\.(jpg|jpeg|png|gif|webp|heic|avif)$/i.test(name)
                    const publicUrl = getAssignmentPublicUrl(p)
                    const { Icon: FileIcon, colorClass, label } = getFileIcon(name)
                    return (
                      <div key={p} className="relative w-24 flex flex-col gap-1">
                        <div className="relative w-[200px] h-[200px] rounded-md border bg-muted/40 overflow-hidden">
                          {isImage ? (
                            <img src={publicUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                              <FileIcon className={`h-8 w-8 ${colorClass}`} />
                              <span className="text-[10px] uppercase font-medium">{label}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeKeptPath(p)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate text-center w-[200px]" title={name}>{name}</p>
                      </div>
                    )
                  })}

                  {selectedFiles.map((file, i) => {
                    const previewUrl = newFilePreviews[i]
                    const { Icon: FileIcon, colorClass, label } = getFileIcon(file.name)
                    return (
                      <div key={i} className="relative w-24 flex flex-col gap-1">
                        <div className="relative w-[200px] h-[200px] rounded-md border border-dashed bg-muted/20 overflow-hidden">
                          {previewUrl ? (
                            <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                              <FileIcon className={`h-8 w-8 ${colorClass}`} />
                              <span className="text-[10px] uppercase font-medium">{label}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(i)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate text-center w-[200px]" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-muted-foreground text-center">{formatFileSize(file.size)}</p>
                      </div>
                    )
                  })}
                </div>
              )}

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
                className="h-9 px-3 text-sm cursor-pointer border-border/60 bg-white/60 hover:bg-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm file
              </Button>

              {fileError && <p className="text-sm text-destructive">{fileError}</p>}
            </div>
        </div>

      </form>
    </Form>
  )

}
