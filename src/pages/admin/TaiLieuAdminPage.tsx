import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, Trash2, Loader2, Plus, Search } from 'lucide-react'
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  deleteStandaloneStudyMaterial,
  fetchStandaloneStudyMaterials,
  getStudyMaterialSignedUrl,
  StudyMaterial,
  StudyMaterialGrade,
  uploadStandaloneStudyMaterial,
} from '@/lib/api/study-materials'
import { GRADE_BADGE } from '@/lib/constants/grades'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1)
  return [1, 2, 'ellipsis', total - 1, total]
}

export default function TaiLieuAdminPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState<StudyMaterialGrade | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const [filterGrade, setFilterGrade] = useState<StudyMaterialGrade | 'all'>('all')
  const [search, setSearch] = useState('')
  const [openingId, setOpeningId] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null)

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['standalone-materials', 'all'],
    queryFn: () => fetchStandaloneStudyMaterials(),
  })

  const uploadMutation = useMutation({
    mutationFn: () =>
      uploadStandaloneStudyMaterial(
        file!,
        { title, grade: grade as StudyMaterialGrade },
        thumbnailFile,
      ),
    onSuccess: () => {
      toast.success('Tải lên thành công!')
      setTitle('')
      setGrade('')
      setFile(null)
      setThumbnailFile(null)
      setUploadOpen(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['standalone-materials', 'all'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Tải lên thất bại')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, filePath, thumbnailPath }: { id: string; filePath: string; thumbnailPath?: string | null }) =>
      deleteStandaloneStudyMaterial(id, filePath, thumbnailPath),
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
    deleteMutation.mutate({
      id: deletingMaterial.id,
      filePath: deletingMaterial.file_path,
      thumbnailPath: deletingMaterial.thumbnail_path,
    })
  }

  async function handleOpenMaterial(material: StudyMaterial) {
    try {
      setOpeningId(material.id)
      const signedUrl = await getStudyMaterialSignedUrl(material.file_path)
      window.open(signedUrl, '_blank', 'noopener')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể mở tài liệu'
      toast.error(message)
    } finally {
      setOpeningId(null)
    }
  }

  const isPending = uploadMutation.isPending

  const filteredMaterials = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return materials.filter((material) => {
      const matchGrade = filterGrade === 'all' || material.grade === filterGrade
      const matchTitle = keyword.length === 0 || material.title.toLowerCase().includes(keyword)
      return matchGrade && matchTitle
    })
  }, [materials, filterGrade, search])

  const totalCount = filteredMaterials.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const pagedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMaterials.slice(start, start + pageSize)
  }, [filteredMaterials, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterGrade, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl font-bold leading-[1.3] text-slate-950">
            Quản lý tài liệu
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Tải lên và quản lý tài liệu PDF theo khối lớp</p>
        </div>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white border-0 gap-2">
              <Plus className="h-4 w-4" />
              Tải lên tài liệu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tải lên tài liệu mới</DialogTitle>
              <DialogDescription>Nhập thông tin, chọn file PDF và thumbnail (nếu có).</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="tai-lieu-title" className="font-bold text-sm mb-1.5 block">Tiêu đề</Label>
                  <Input
                    id="tai-lieu-title"
                    placeholder="Nhập tiêu đề tài liệu..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tai-lieu-grade" className="font-bold text-sm mb-1.5 block">Khối lớp</Label>
                  <Select value={grade} onValueChange={(v) => setGrade(v as StudyMaterialGrade)}>
                    <SelectTrigger id="tai-lieu-grade">
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

                <div>
                  <Label htmlFor="tai-lieu-file" className="font-bold text-sm mb-1.5 block">File PDF</Label>
                  <Input
                    id="tai-lieu-file"
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Chỉ chấp nhận file .pdf</p>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="tai-lieu-thumbnail" className="font-bold text-sm mb-1.5 block">Thumbnail (tùy chọn)</Label>
                  <Input
                    id="tai-lieu-thumbnail"
                    type="file"
                    accept="image/*"
                    ref={thumbnailInputRef}
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Ảnh này dùng làm thumbnail hiển thị ở trang tài liệu public.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="gap-2" disabled={!title || !grade || !file || isPending}>
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
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-foreground">Danh sách tài liệu</h2>
        </div>

        {!isLoading && (
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                className="pl-9"
                placeholder="Tìm theo tiêu đề…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <Select value={filterGrade} onValueChange={(v) => setFilterGrade(v as StudyMaterialGrade | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo khối lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khối</SelectItem>
                  <SelectItem value="grade_7">Lớp 7</SelectItem>
                  <SelectItem value="grade_8">Lớp 8</SelectItem>
                  <SelectItem value="grade_9">Lớp 9</SelectItem>
                  <SelectItem value="advanced">Ôn thi chuyên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground self-center whitespace-nowrap">
              {totalCount}/{materials.length} tài liệu
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-none overflow-hidden">
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
          <div className="bm-glass-card p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground mt-3">Chưa có tài liệu nào</p>
            <p className="text-sm text-muted-foreground mt-1">Tải lên tài liệu đầu tiên để bắt đầu.</p>
          </div>
        ) : totalCount === 0 ? (
          <div className="bm-glass-card p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground mt-3">Không có kết quả phù hợp</p>
            <p className="text-sm text-muted-foreground mt-1">Thử đổi từ khóa hoặc bộ lọc khối lớp.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-none overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Tiêu đề</TableHead>
                  <TableHead className="font-bold">Khối lớp</TableHead>
                  <TableHead className="font-bold">Ngày tải</TableHead>
                  <TableHead className="font-bold">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedMaterials.map((material) => {
                  const badge = GRADE_BADGE[material.grade] ?? GRADE_BADGE.grade_7
                  return (
                    <TableRow key={material.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary/60 shrink-0" />
                          <button
                            type="button"
                            className="font-bold text-sm text-left text-indigo-700 hover:text-indigo-800 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() => handleOpenMaterial(material)}
                            disabled={openingId === material.id}
                          >
                            {openingId === material.id ? 'Đang mở...' : material.title}
                          </button>
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

        {!isLoading && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-[92px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">/ trang</span>
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage((p) => p - 1)
                      }}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {buildPageNumbers(currentPage, totalPages).map((item, idx) => (
                    <PaginationItem key={`${item}-${idx}`}>
                      {item === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={item === currentPage}
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(item)
                          }}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage((p) => p + 1)
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

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
