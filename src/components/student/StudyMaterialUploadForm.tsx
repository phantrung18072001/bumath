import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  uploadStudyMaterial,
  CATEGORY_LABELS,
  GRADE_LABELS,
  type StudyMaterialCategory,
  type StudyMaterialGrade,
} from '@/lib/api/study-materials'

interface StudyMaterialUploadFormProps {
  lessonId: string
  defaultGrade: StudyMaterialGrade
}

export default function StudyMaterialUploadForm({
  lessonId,
  defaultGrade,
}: StudyMaterialUploadFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<StudyMaterialCategory | ''>('')
  const [grade, setGrade] = useState<StudyMaterialGrade>(defaultGrade)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const reset = () => {
    setTitle('')
    setCategory('')
    setGrade(defaultGrade)
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const close = () => {
    reset()
    setOpen(false)
  }

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file || !category) throw new Error('Missing fields')
      return uploadStudyMaterial(lessonId, file, {
        title: title || file.name,
        category: category as StudyMaterialCategory,
        grade,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-materials', lessonId] })
      toast.success('Đã thêm tài liệu thành công!')
      close()
    },
    onError: () => {
      toast.error('Tải tài liệu lên thất bại. Vui lòng thử lại.')
    },
  })

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 px-3 text-sm cursor-pointer border-border/60 bg-white/60 hover:bg-white"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Thêm tài liệu
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Thêm tài liệu mới</p>
        <button
          type="button"
          onClick={close}
          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Đóng form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            setFile(f)
            if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ''))
          }}
        />
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="w-full min-h-[44px] justify-start text-left"
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <span className="truncate text-foreground/80">{file.name}</span>
          ) : (
            <span className="text-muted-foreground">Chọn file (PDF hoặc ảnh)...</span>
          )}
        </Button>
      </div>

      <Input
        placeholder="Tên tài liệu"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="min-h-[44px]"
      />

      <div className="flex gap-2">
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as StudyMaterialCategory)}
        >
          <SelectTrigger className="min-h-[44px] flex-1">
            <SelectValue placeholder="Chọn loại" />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(CATEGORY_LABELS) as [StudyMaterialCategory, string][]).map(
              ([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <Select
          value={grade}
          onValueChange={(v) => setGrade(v as StudyMaterialGrade)}
        >
          <SelectTrigger className="min-h-[44px] w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(GRADE_LABELS) as [StudyMaterialGrade, string][]).map(
              ([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          className="min-h-[44px] flex-1"
          disabled={!file || !category || uploadMutation.isPending}
          onClick={() => uploadMutation.mutate()}
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tải...
            </>
          ) : (
            'Tải lên'
          )}
        </Button>
        <Button
          variant="ghost"
          className="min-h-[44px]"
          onClick={close}
          disabled={uploadMutation.isPending}
        >
          Hủy
        </Button>
      </div>
    </div>
  )
}
