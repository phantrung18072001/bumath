import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react'
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
  PackageWithGrades,
  GradeValue,
  fetchPackagesPaginated,
  deletePackage,
} from '@/lib/api/packages'
import PackageFormDialog from '@/components/admin/PackageFormDialog'

const GRADE_BADGE: Record<GradeValue, { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1)
  return [1, 2, 'ellipsis', total - 1, total]
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

const PAGE_SIZE = 20

export default function PackagesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageWithGrades | null>(null)
  const [deletingPackage, setDeletingPackage] = useState<PackageWithGrades | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'packages', { page: currentPage, pageSize: PAGE_SIZE, search: searchQuery }],
    queryFn: () => fetchPackagesPaginated({ page: currentPage, pageSize: PAGE_SIZE, search: searchQuery }),
  })

  const packages = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] })
      toast.success('Đã xóa gói học.')
      setDeletingPackage(null)
    },
    onError: () => {
      toast.error('Xóa không thành công. Vui lòng thử lại.')
    },
  })

  function handleOpenCreate() {
    setEditingPackage(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(pkg: PackageWithGrades) {
    setEditingPackage(pkg)
    setDialogOpen(true)
  }

  function handleDialogSuccess() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] })
    setDialogOpen(false)
    setEditingPackage(null)
  }

  function handleSearch(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const countCopy = isLoading ? '' : `${totalCount} gói học`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold leading-[1.3] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quản lý gói học</h1>
        <Button className="min-h-[48px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Tạo gói học
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            className="pl-9"
            placeholder="Tìm theo tên gói học…"
            aria-label="Tìm kiếm gói học"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {!isLoading && (
          <span className="text-sm text-muted-foreground self-center whitespace-nowrap">
            {countCopy}
          </span>
        )}
      </div>

      {/* Content: Loading / Empty / Table + Pagination */}
      {isLoading ? (
        <div aria-busy="true" aria-label="Đang tải...">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16">
          {!searchQuery ? (
            <>
              <p className="text-sm font-semibold text-foreground mb-1">Chưa có gói học nào</p>
              <p className="text-sm text-muted-foreground mb-4">Nhấn 'Tạo gói học' để bắt đầu.</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-1" />
                Tạo gói học
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground mb-1">Không tìm thấy kết quả</p>
              <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="bm-glass-card p-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Tên gói học</TableHead>
                  <TableHead>Giá (VND)</TableHead>
                  <TableHead>Lớp phủ</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg, index) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="w-12 text-muted-foreground">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </TableCell>
                    <TableCell className="font-normal">{pkg.name}</TableCell>
                    <TableCell className="text-sm">
                      {formatVND(pkg.price_vnd)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pkg.package_grades.map(pg => (
                          <Badge
                            key={pg.grade}
                            variant="secondary"
                            className={GRADE_BADGE[pg.grade as GradeValue]?.className}
                          >
                            {GRADE_BADGE[pg.grade as GradeValue]?.label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[48px]"
                          aria-label={`Chỉnh sửa gói ${pkg.name}`}
                          onClick={() => handleOpenEdit(pkg)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[48px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          aria-label={`Xóa gói ${pkg.name}`}
                          onClick={() => setDeletingPackage(pkg)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-end gap-3">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {buildPageNumbers(currentPage, totalPages).map((page, idx) =>
                    page === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      <PackageFormDialog
        open={dialogOpen}
        package={editingPackage}
        onSuccess={handleDialogSuccess}
        onClose={() => {
          setDialogOpen(false)
          setEditingPackage(null)
        }}
      />

      <AlertDialog open={!!deletingPackage} onOpenChange={(open) => !open && setDeletingPackage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa gói học</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả học sinh sở hữu gói học &ldquo;{deletingPackage?.name}&rdquo; sẽ mất quyền truy cập vào tất cả bài học liên quan và bị hủy đăng ký các khóa học tương ứng. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingPackage && deleteMutation.mutate(deletingPackage.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Xóa gói học
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
