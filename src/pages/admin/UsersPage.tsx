import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Search } from 'lucide-react'
import { Profile } from '@/types/auth'
import { fetchProfilesPaginated } from '@/lib/api/profiles'
import { fetchPackages } from '@/lib/api/packages'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import UserPackageDialog from '@/components/admin/UserPackageDialog'

function normalizePhone(phone: string): string {
  return phone.replace(/^\+84|^84/, '0')
}

function RoleBadge({ role }: { role: Profile['role'] }) {
  if (role === 'admin') {
    return <Badge className="bg-purple-600 hover:bg-purple-600 text-white">Admin</Badge>
  }
  if (role === 'teacher') {
    return <Badge className="bg-blue-600 hover:bg-blue-600 text-white">Giảng viên</Badge>
  }
  return <Badge variant="secondary">Học sinh</Badge>
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1)
  return [1, 2, 'ellipsis', total - 1, total]
}

function UsersTable({
  users,
  currentPage,
  pageSize,
  onManageEnrollments,
}: {
  users: Profile[]
  currentPage: number
  pageSize: number
  onManageEnrollments: (user: Profile) => void
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">STT</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Năm sinh</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell className="w-12 text-muted-foreground">{(currentPage - 1) * pageSize + index + 1}</TableCell>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.year_of_birth}</TableCell>
              <TableCell>{user.address}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[48px]"
                  onClick={() => onManageEnrollments(user)}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Quản lý gói học
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function UsersPage() {
  const [enrollmentUser, setEnrollmentUser] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | Profile['role']>('student')
  const [packageFilter, setPackageFilter] = useState<string>('')
  const [packageStatus, setPackageStatus] = useState<'' | 'has_package' | 'no_package'>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data: packagesData } = useQuery({
    queryKey: ['admin', 'packages'],
    queryFn: fetchPackages,
  })
  const allPackages = packagesData ?? []

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'profiles', { page: currentPage, pageSize, role: roleFilter, search: searchQuery, packageId: packageFilter, packageStatus }],
    queryFn: () => fetchProfilesPaginated({ page: currentPage, pageSize, role: roleFilter, search: searchQuery, packageId: packageFilter || undefined, packageStatus: packageStatus || undefined }),
  })

  const users = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  function handleSearch(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  function handleRoleFilter(value: string) {
    setRoleFilter(value as 'all' | Profile['role'])
    setCurrentPage(1)
  }

  function handlePackageFilter(value: string) {
    setPackageFilter(value === 'all' ? '' : value)
    setPackageStatus('')
    setCurrentPage(1)
  }

  function handlePackageStatus(value: string) {
    setPackageStatus(value === 'all' ? '' : value as 'has_package' | 'no_package')
    setPackageFilter('')
    setCurrentPage(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  const countCopy = isLoading ? '' : `${totalCount} người dùng`

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl font-bold leading-[1.3] mb-6 text-slate-950">Quản lý tài khoản</h1>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            className="pl-9"
            placeholder="Tìm theo tên hoặc số điện thoại…"
            aria-label="Tìm kiếm người dùng"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Lọc theo vai trò">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="student">Học sinh</SelectItem>
            <SelectItem value="teacher">Giảng viên</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {allPackages.length > 0 && (
          <Select value={packageFilter || 'all'} onValueChange={handlePackageFilter}>
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Lọc theo gói học">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả gói học</SelectItem>
              {allPackages.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={packageStatus || 'all'} onValueChange={handlePackageStatus}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Lọc theo trạng thái gói">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="has_package">Đã có gói học</SelectItem>
            <SelectItem value="no_package">Chưa có gói học</SelectItem>
          </SelectContent>
        </Select>
        {!isLoading && (
          <span className="text-sm text-muted-foreground self-center whitespace-nowrap">
            {countCopy}
          </span>
        )}
      </div>

      {/* Content: Loading / Empty / Table */}
      {isLoading ? (
        <div aria-busy="true" aria-label="Đang tải...">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          {!searchQuery && roleFilter === 'student' && !packageFilter && !packageStatus ? (
            <>
              <p className="text-sm font-semibold text-foreground mb-1">Chưa có tài khoản nào</p>
              <p className="text-sm text-muted-foreground">Hệ thống chưa có người dùng nào đăng ký.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground mb-1">Không tìm thấy kết quả</p>
              <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-none">
          <UsersTable
            users={users}
            currentPage={currentPage}
            pageSize={pageSize}
            onManageEnrollments={(user) => setEnrollmentUser(user)}
          />
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Số hàng:</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[80px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          </div>
        </>
      )}

      <UserPackageDialog
        open={!!enrollmentUser}
        user={enrollmentUser}
        onClose={() => setEnrollmentUser(null)}
      />
    </div>
  )
}
