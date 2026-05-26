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
  AdminListCard,
  AdminListFilterRow,
  AdminListPaginationFooter,
} from '@/components/admin/AdminListCard'
import UserPackageDialog from '@/components/admin/UserPackageDialog'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

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

function UsersTable({
  users,
  isLoading,
  currentPage,
  pageSize,
  onManageEnrollments,
  emptyMessage,
}: {
  users: Profile[]
  isLoading: boolean
  currentPage: number
  pageSize: number
  onManageEnrollments: (user: Profile) => void
  emptyMessage: string
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
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="ml-auto h-10 w-40" /></TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
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
            ))
          )}
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
  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    roleFilter: 'student' as 'all' | Profile['role'],
    packageFilter: '',
    packageStatus: '' as '' | 'has_package' | 'no_package',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data: packagesData } = useQuery({
    queryKey: ['admin', 'packages'],
    queryFn: fetchPackages,
  })
  const allPackages = packagesData ?? []

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'profiles', { page: currentPage, pageSize, ...appliedFilters }],
    queryFn: () => fetchProfilesPaginated({
      page: currentPage,
      pageSize,
      role: appliedFilters.roleFilter,
      search: appliedFilters.searchQuery,
      packageId: appliedFilters.packageFilter || undefined,
      packageStatus: appliedFilters.packageStatus || undefined
    }),
  })

  const users = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  function handleSearch(value: string) { setSearchQuery(value) }

  function handleRoleFilter(value: string) {
    setRoleFilter(value as 'all' | Profile['role'])
  }

  function handlePackageFilter(value: string) {
    setPackageFilter(value === 'all' ? '' : value)
    setPackageStatus('')
  }

  function handlePackageStatus(value: string) {
    setPackageStatus(value === 'all' ? '' : value as 'has_package' | 'no_package')
    setPackageFilter('')
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  function applyFilters() {
    setAppliedFilters({ searchQuery, roleFilter, packageFilter, packageStatus })
    setCurrentPage(1)
  }

  const countCopy = isLoading ? '' : `${totalCount} người dùng`

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý tài khoản"
        description="Danh sách tài khoản học sinh, giảng viên, admin với bộ lọc vai trò và gói học."
      />

      <AdminListCard
            filters={(
              <AdminListFilterRow>
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    className="h-10 rounded-lg pl-9"
                    placeholder="Tìm theo tên hoặc số điện thoại…"
                    aria-label="Tìm kiếm người dùng"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={handleRoleFilter}>
                  <SelectTrigger className="h-10 w-[170px] shrink-0 rounded-lg" aria-label="Lọc theo vai trò">
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
                    <SelectTrigger className="h-10 w-[210px] shrink-0 rounded-lg" aria-label="Lọc theo gói học">
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
                  <SelectTrigger className="h-10 w-[190px] shrink-0 rounded-lg" aria-label="Lọc theo trạng thái gói">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="has_package">Đã có gói học</SelectItem>
                    <SelectItem value="no_package">Chưa có gói học</SelectItem>
                  </SelectContent>
                </Select>
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
          <UsersTable
            users={users}
            isLoading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            onManageEnrollments={(user) => setEnrollmentUser(user)}
            emptyMessage={!appliedFilters.searchQuery && appliedFilters.roleFilter === 'student' && !appliedFilters.packageFilter && !appliedFilters.packageStatus
              ? 'Chưa có tài khoản nào.'
              : 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.'}
          />
      </AdminListCard>

      <UserPackageDialog
        open={!!enrollmentUser}
        user={enrollmentUser}
        onClose={() => setEnrollmentUser(null)}
      />
    </div>
  )
}
