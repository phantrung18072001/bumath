import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  fetchStandaloneStudyMaterials,
  uploadStandaloneStudyMaterial,
  deleteStudyMaterial,
  StudyMaterial,
  StudyMaterialGrade,
} from '@/lib/api/study-materials'
import { GRADE_BADGE } from '@/lib/constants/grades'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export default function TaiLieuAdminPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload form state
  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState<StudyMaterialGrade | ''>('')
  const [file, setFile] = useState<File | null>(null)

  // Delete dialog state
  const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null)

  // Fetch all standalone materials
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['standalone-materials', 'all'],
    queryFn: () => fetchStandaloneStudyMaterials(),
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: () =>
      uploadStandaloneStudyMaterial(file!, { title, grade: grade as StudyMaterialGrade }),
    onSuccess: () => {
      toast.success('Tải lên thành công!')
      setTitle('')
      setGrade('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['standalone-materials', 'all'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Tải lên thất bại')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string }) =>
      deleteStudyMaterial(id, filePath),
    onSuccess: () => {
      toast.success('Đã xóa tài liệu.')
      setDeletingMaterial(null)
      queryClient.invalidateQueries({ queryKey: ['standalone-materials', 'all'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Xóa tài liệu thất bại')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !grade || !file) return
    uploadMutation.mutate()
  }

  function handleConfirmDelete() {
    if (!deletingMaterial) return
    deleteMutation.mutate({ id: deletingMaterial.id, filePath: deletingMaterial.file_path })
  }

  const isPending = uploadMutation.isPending

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tài liệu</h1>
          <p className="text-sm text-muted-foreground mt-1">Tải lên và quản lý tài liệu PDF theo khối lớp</p>
        </div>
        {!isLoading && materials.length > 0 && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {materials.length} tài liệu
          </Badge>
        )}
      </div>

      {/* Upload Form Section */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/3 to-orange-50/40 p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold">Tải lên tài liệu mới</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Tiêu đề */}
            <div className="sm:col-span-2">
              <Label htmlFor="tai-lieu-title" className="font-bold text-sm mb-1.5 block">Tiêu đề</Label>
              <Input
                id="tai-lieu-title"
                placeholder="Nhập tiêu đề tài liệu..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Khối lớp */}
            <div>
              <Label htmlFor="tai-lieu-grade" className="font-bold text-sm mb-1.5 block">Khối lớp</Label>
              <Select value={grade} onValueChange={(v) => setGrade(v as StudyMaterialGrade)}>
                <SelectTrigger id="tai-lieu-grade" className="bg-white">
                  <SelectValue placeholder="Chọn khối lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade_7">Lớp 7</SelectItem>
                  <SelectItem value="grade_8">Lớp 8</SelectItem>
                  <SelectItem value="grade_9">Lớp 9</SelectItem>
                  <SelectItem value="advanced">Ôn thi chuyên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File PDF */}
            <div>
              <Label htmlFor="tai-lieu-file" className="font-bold text-sm mb-1.5 block">File PDF</Label>
              <Input
                id="tai-lieu-file"
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="bg-white"
              />
              <p className="text-xs text-muted-foreground mt-1">Chỉ chấp nhận file .pdf</p>
            </div>
          </div>

          <Button
            type="submit"
            className="bm-btn-cta gap-2"
            disabled={!title || !grade || !file || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Tải lên
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Materials List Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold">Danh sách tài liệu</h2>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Tiêu đề</TableHead>
                  <TableHead className="font-bold">Khối lớp</TableHead>
                  <TableHead className="font-bold">Ngày tải</TableHead>
                  <TableHead className="font-bold">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : materials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">Chưa có tài liệu nào</p>
            <p className="text-xs text-muted-foreground">Tải lên tài liệu đầu tiên ở trên.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Tiêu đề</TableHead>
                  <TableHead className="font-bold">Khối lớp</TableHead>
                  <TableHead className="font-bold">Ngày tải</TableHead>
                  <TableHead className="font-bold">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => {
                  const badge = GRADE_BADGE[material.grade] ?? GRADE_BADGE.grade_7
                  return (
                    <TableRow key={material.id} className="hover:bg-muted/30 transition-colors duration-150">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary/60 shrink-0" />
                          <span className="font-bold text-sm">{material.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={badge.className}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(material.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1.5 cursor-pointer"
                          onClick={() => setDeletingMaterial(material)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deletingMaterial} onOpenChange={(open) => { if (!open) setDeletingMaterial(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài liệu?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tài liệu &quot;{deletingMaterial?.title}&quot; sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
