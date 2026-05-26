import { useRef, useState } from 'react'
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
  fetchStandaloneStudyMaterialsPaginated,
  getStudyMaterialSignedUrl,
  StudyMaterial,
  StudyMaterialGrade,
  uploadStandaloneStudyMaterial,
} from '@/lib/api/study-materials'
import { GRADE_BADGE } from '@/lib/constants/grades'
import AdminPageHeader, { ADMIN_PAGE_HEADER_ACTION_BUTTON_CLASS } from '@/components/admin/AdminPageHeader'
import { ADMIN_MODAL_FOOTER_BUTTON_CLASS } from '@/components/admin/adminModalStyles'
import {
  AdminListCard,
  AdminListFilterRow,
  AdminListPaginationFooter,
} from '@/components/admin/AdminListCard'

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
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState<StudyMaterialGrade | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const [filterGrade, setFilterGrade] = useState<StudyMaterialGrade | 'all'>('all')
  const [search, setSearch] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    filterGrade: 'all' as StudyMaterialGrade | 'all',
    search: '',
  })
  const [openingId, setOpeningId] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['standalone-materials', { page: currentPage, pageSize, ...appliedFilters }],
    queryFn: () => fetchStandaloneStudyMaterialsPaginated({
      page: currentPage,
      pageSize,
      grade: appliedFilters.filterGrade,
      search: appliedFilters.search,
    }),
  })
  const materials = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

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
      queryClient.invalidateQueries({ queryKey: ['standalone-materials'] })
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
      queryClient.invalidateQueries({ queryKey: ['standalone-materials'] })
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

  function applyFilters() {
    setAppliedFilters({ filterGrade, search })
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý tài liệu"
        description="Tải lên và quản lý tài liệu PDF theo khối lớp."
        action={(
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className={`${ADMIN_PAGE_HEADER_ACTION_BUTTON_CLASS} gap-2`}>
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
                <Button type="submit" className={`${ADMIN_MODAL_FOOTER_BUTTON_CLASS} gap-2`} disabled={!title || !grade || !file || isPending}>
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
        )}
      />

      <div>
        <AdminListCard
            filters={(
              <AdminListFilterRow>
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    className="h-10 rounded-lg pl-9"
                    placeholder="Tìm theo tiêu đề…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={filterGrade} onValueChange={(v) => setFilterGrade(v as StudyMaterialGrade | 'all')}>
                  <SelectTrigger className="h-10 w-[180px] shrink-0 rounded-lg">
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
                <Button className="h-10 shrink-0 rounded-lg" onClick={applyFilters}>
                  Tìm kiếm
                </Button>
              </AdminListFilterRow>
            )}
            totalLabel={`${totalCount} tài liệu`}
            footer={(
              <AdminListPaginationFooter
                pageSize={pageSize}
                onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1) }}
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                onGoPage={setCurrentPage}
              />
            )}
          >
            <div className="overflow-x-auto">
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
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : materials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                        {totalCount === 0 && appliedFilters.search === '' && appliedFilters.filterGrade === 'all'
                          ? 'Chưa có tài liệu nào. Tải lên tài liệu đầu tiên để bắt đầu.'
                          : 'Không có kết quả phù hợp với bộ lọc hiện tại.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    materials.map((material) => {
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
                    })
                  )}
                </TableBody>
              </Table>
            </div>
        </AdminListCard>
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
            <AlertDialogCancel className={ADMIN_MODAL_FOOTER_BUTTON_CLASS}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className={`${ADMIN_MODAL_FOOTER_BUTTON_CLASS} bg-destructive hover:bg-destructive/90`}
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
