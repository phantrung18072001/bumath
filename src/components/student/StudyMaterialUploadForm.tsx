import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  uploadStudyMaterial,
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      await Promise.all(
        files.map((file) =>
          uploadStudyMaterial(lessonId, file, {
            title: file.name.replace(/\.[^.]+$/, ''),
            category: 'giua_ky',
            grade: defaultGrade,
          }),
        ),
      )
      queryClient.invalidateQueries({ queryKey: ['study-materials', lessonId] })
      toast.success('Đã thêm tài liệu thành công!')
    } catch {
      toast.error('Tải tài liệu lên thất bại. Vui lòng thử lại.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        size="sm"
        className="h-9 px-3 text-sm cursor-pointer border-border/60 bg-white/60 hover:bg-white"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        {uploading ? 'Đang tải...' : 'Thêm tài liệu'}
      </Button>
    </>
  )
}
