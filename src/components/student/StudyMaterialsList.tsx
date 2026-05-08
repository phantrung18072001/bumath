import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  fetchStudyMaterials,
  getStudyMaterialSignedUrls,
  deleteStudyMaterial,
} from '@/lib/api/study-materials'
import StudyMaterialUploadForm from './StudyMaterialUploadForm'
import type { StudyMaterialGrade } from '@/lib/api/study-materials'

interface StudyMaterialsListProps {
  lessonId: string
  isAdmin?: boolean
  defaultGrade: StudyMaterialGrade
}

const LABEL_CLASS = 'text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5'
const THUMB_CLASS = 'w-[200px] h-[200px] rounded-md border bg-muted/40 overflow-hidden cursor-pointer shrink-0'

export default function StudyMaterialsList({
  lessonId,
  isAdmin,
  defaultGrade,
}: StudyMaterialsListProps) {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)

  const { data: materials, isLoading } = useQuery({
    queryKey: ['study-materials', lessonId],
    queryFn: () => fetchStudyMaterials(lessonId),
    enabled: !!lessonId,
  })

  const { data: signedUrls } = useQuery({
    queryKey: ['study-material-urls', lessonId, materials?.map((m) => m.id).join(',')],
    queryFn: () => getStudyMaterialSignedUrls(materials!),
    enabled: !!materials && materials.length > 0,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudyMaterial(deletingId!, deletingPath!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-materials', lessonId] })
      toast.success('Đã xóa tài liệu.')
      setDeletingId(null)
      setDeletingPath(null)
    },
    onError: () => {
      toast.error('Xóa tài liệu thất bại. Vui lòng thử lại.')
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3">
        <Skeleton className="w-[200px] h-[200px] rounded-md shrink-0" />
        <Skeleton className="w-[200px] h-[200px] rounded-md shrink-0" />
      </div>
    )
  }

  const list = materials ?? []
  if (list.length === 0 && !isAdmin) return null

  const thumbnails = list.length > 0 && (
    <div className="flex flex-wrap gap-3">
      {list.map((material) => {
        const signedUrl = signedUrls?.[material.id]
        const isImage = material.file_type === 'image'
        return (
          <div key={material.id} className="flex flex-col gap-1 shrink-0">
            <div
              className={THUMB_CLASS}
              onClick={() => signedUrl && window.open(signedUrl, '_blank', 'noopener')}
            >
              {isImage && signedUrl ? (
                <img src={signedUrl} alt={material.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  <FileText className="h-8 w-8 text-red-400" />
                  <span className="text-[10px] uppercase font-medium">PDF</span>
                </div>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeletingId(material.id)
                    setDeletingPath(material.file_path)
                  }}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate text-center w-[200px]" title={material.title}>
              {material.title}
            </p>
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      <div className={isAdmin
        ? 'rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-3'
        : 'space-y-3'
      }>
        <label className={LABEL_CLASS}>
          <FileText className="h-3.5 w-3.5" />
          Tài liệu học tập
          {isAdmin && <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(PDF, ảnh)</span>}
        </label>
        {thumbnails}
        {isAdmin && (
          <StudyMaterialUploadForm lessonId={lessonId} defaultGrade={defaultGrade} />
        )}
      </div>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) { setDeletingId(null); setDeletingPath(null) }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài liệu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa tài liệu này? Thao tác không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
