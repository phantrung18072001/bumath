import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Image, File, Download, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  fetchStudyMaterials,
  getStudyMaterialSignedUrls,
  deleteStudyMaterial,
  CATEGORY_LABELS,
  type StudyMaterial,
  type StudyMaterialCategory,
} from '@/lib/api/study-materials'
import StudyMaterialUploadForm from './StudyMaterialUploadForm'
import type { StudyMaterialGrade } from '@/lib/api/study-materials'

interface StudyMaterialsListProps {
  lessonId: string
  isAdmin?: boolean
  defaultGrade: StudyMaterialGrade
}

function materialFileIcon(fileType: StudyMaterial['file_type']) {
  if (fileType === 'pdf') return FileText
  if (fileType === 'image') return Image
  return File
}

export default function StudyMaterialsList({
  lessonId,
  isAdmin,
  defaultGrade,
}: StudyMaterialsListProps) {
  const queryClient = useQueryClient()
  const [categoryFilter, setCategoryFilter] = useState<StudyMaterialCategory | 'all'>('all')
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
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    )
  }

  const filtered =
    categoryFilter === 'all'
      ? (materials ?? [])
      : (materials ?? []).filter((m) => m.category === categoryFilter)

  const isEmpty = (materials ?? []).length === 0

  if (isEmpty && !isAdmin) return null

  return (
    <>
      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Tài liệu học tập
            <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(PDF, ảnh)</span>
          </label>

          {!isEmpty && (
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v as StudyMaterialCategory | 'all')}
            >
              <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {(Object.entries(CATEGORY_LABELS) as [StudyMaterialCategory, string][]).map(
                  ([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {isAdmin && (
          <StudyMaterialUploadForm lessonId={lessonId} defaultGrade={defaultGrade} />
        )}

        {filtered.length === 0 && !isEmpty ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Không có tài liệu nào cho loại này.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((material) => {
              const Icon = materialFileIcon(material.file_type)
              const signedUrl = signedUrls?.[material.id]
              return (
                <div
                  key={material.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-white hover:bg-primary/5 transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground/80 flex-1 truncate">
                    {material.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                    {CATEGORY_LABELS[material.category]}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label={`Tải ${material.title}`}
                    disabled={!signedUrl}
                    onClick={() => signedUrl && window.open(signedUrl, '_blank', 'noopener')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground/60 hover:text-destructive"
                      aria-label={`Xóa ${material.title}`}
                      onClick={() => {
                        setDeletingId(material.id)
                        setDeletingPath(material.file_path)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingId(null)
            setDeletingPath(null)
          }
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
