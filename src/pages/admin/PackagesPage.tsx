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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AdminListCard,
  AdminListFilterRow,
  AdminListPaginationFooter,
} from '@/components/admin/AdminListCard'
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
import AdminPageHeader, { ADMIN_PAGE_HEADER_ACTION_BUTTON_CLASS } from '@/components/admin/AdminPageHeader'
import { ADMIN_MODAL_FOOTER_BUTTON_CLASS } from '@/components/admin/adminModalStyles'

const GRADE_BADGE: Record<GradeValue, { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

export default function PackagesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageWithGrades | null>(null)
  const [deletingPackage, setDeletingPackage] = useState<PackageWithGrades | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'packages', { page: currentPage, pageSize, search: appliedSearchQuery }],
    queryFn: () => fetchPackagesPaginated({ page: currentPage, pageSize, search: appliedSearchQuery }),
  })

  const packages = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

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
  }
  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  function applyFilters() {
    setAppliedSearchQuery(searchQuery)
    setCurrentPage(1)
  }

  const countCopy = isLoading ? '' : `${totalCount} gói học`

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý gói học"
        description="Danh sách gói học, tìm kiếm theo tên và quản lý lớp phủ của từng gói."
        action={(
          <Button className={ADMIN_PAGE_HEADER_ACTION_BUTTON_CLASS} onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Tạo gói học
          </Button>
        )}
      />

      <AdminListCard
            filters={(
              <AdminListFilterRow>
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    className="pl-9 h-10 rounded-lg"
                    placeholder="Tìm theo tên gói học…"
                    aria-label="Tìm kiếm gói học"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <Button className="h-10 shrink-0 rounded-lg" onClick={applyFilters}>
                  Tìm kiếm
                </Button>
              </AdminListFilterRow>
            )}
            totalLabel={countCopy}
            footer={(
              <AdminListPaginationFooter
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
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
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Tên gói học</TableHead>
                  <TableHead>Giá (VND)</TableHead>
                  <TableHead>Lớp phủ</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-10 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      {!appliedSearchQuery
                        ? 'Chưa có gói học nào. Nhấn "Tạo gói học" để bắt đầu.'
                        : 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.'}
                    </TableCell>
                  </TableRow>
                ) : packages.map((pkg, index) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="w-12 text-muted-foreground">
                      {(currentPage - 1) * pageSize + index + 1}
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
          </AdminListCard>

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
            <AlertDialogCancel className={ADMIN_MODAL_FOOTER_BUTTON_CLASS}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className={`${ADMIN_MODAL_FOOTER_BUTTON_CLASS} bg-destructive text-destructive-foreground hover:bg-destructive/90`}
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
