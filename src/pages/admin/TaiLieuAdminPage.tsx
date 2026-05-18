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
      <h1 className="text-2xl font-bold mb-6">Quản lý tài liệu</h1>

      {/* Upload Form Section */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5" />
          Tải lên tài liệu mới
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Tiêu đề */}
            <div>
              <Label htmlFor="tai-lieu-title">Tiêu đề</Label>
              <Input
                id="tai-lieu-title"
                placeholder="Nhập tiêu đề tài liệu..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Khối lớp */}
            <div>
              <Label htmlFor="tai-lieu-grade">Khối lớp</Label>
              <Select value={grade} onValueChange={(v) => setGrade(v as StudyMaterialGrade)}>
                <SelectTrigger id="tai-lieu-grade" className="mt-1">
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
              <Label htmlFor="tai-lieu-file">File PDF</Label>
              <Input
                id="tai-lieu-file"
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">Chỉ chấp nhận file .pdf</p>
            </div>
          </div>

          <Button
            type="submit"
            className="bm-btn-cta gap-2 mt-4"
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
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Danh sách tài liệu
          </h2>
          <Badge variant="secondary">{materials.length}</Badge>
        </div>

        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Khối lớp</TableHead>
                <TableHead>Ngày tải</TableHead>
                <TableHead>Hành động</TableHead>
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
        ) : materials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Chưa có tài liệu nào. Tải lên tài liệu đầu tiên ở trên.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Khối lớp</TableHead>
                <TableHead>Ngày tải</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => {
                const badge = GRADE_BADGE[material.grade] ?? GRADE_BADGE.grade_7
                return (
                  <TableRow key={material.id}>
                    <TableCell className="font-normal">{material.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={badge.className}>
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-normal">{formatDate(material.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1"
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
