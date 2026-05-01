import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/auth'
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
import UserEnrollmentDialog from '@/components/admin/UserEnrollmentDialog'

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
  onManageEnrollments,
  emptyMessage,
}: {
  users: Profile[]
  onManageEnrollments: (user: Profile) => void
  emptyMessage: string
}) {
  if (users.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Năm sinh</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.year_of_birth}</TableCell>
              <TableCell>{user.address}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[48px]"
                  onClick={() => onManageEnrollments(user)}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Quản lý khóa học
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

  const { data: users = [], isLoading } = useQuery<Profile[]>({
    queryKey: ['admin', 'profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Profile[]
    },
  })

  return (
    <div>
      <h1 className="text-xl font-semibold leading-[1.3] mb-6">Quản lý tài khoản</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Đang tải..." />
        </div>
      ) : (
        <UsersTable
          users={users}
          onManageEnrollments={(user) => setEnrollmentUser(user)}
          emptyMessage="Chưa có tài khoản nào được tạo."
        />
      )}

      <UserEnrollmentDialog
        open={!!enrollmentUser}
        user={enrollmentUser}
        onClose={() => setEnrollmentUser(null)}
      />
    </div>
  )
}

