import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

function StatusBadge({ status }: { status: Profile['approval_status'] }) {
  if (status === 'pending') {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        Chờ duyệt
      </Badge>
    )
  }
  if (status === 'approved') {
    return (
      <Badge className="bg-green-600 hover:bg-green-600">
        Đã duyệt
      </Badge>
    )
  }
  return <Badge variant="destructive">Từ chối</Badge>
}

function UsersTable({
  users,
  confirmingRejectId,
  onApprove,
  onRejectStep1,
  onRejectConfirm,
  approvePendingId,
  rejectPendingId,
  emptyMessage,
}: {
  users: Profile[]
  confirmingRejectId: string | null
  onApprove: (id: string) => void
  onRejectStep1: (id: string) => void
  onRejectConfirm: (id: string) => void
  approvePendingId: string | null
  rejectPendingId: string | null
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
            <TableHead>Tên học sinh</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Năm sinh</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Trạng thái</TableHead>
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
                <StatusBadge status={user.approval_status} />
              </TableCell>
              <TableCell>
                {user.approval_status === 'pending' && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      className="min-h-[48px]"
                      onClick={() => onApprove(user.id)}
                      disabled={approvePendingId === user.id}
                    >
                      {approvePendingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Duyệt tài khoản
                    </Button>

                    {confirmingRejectId === user.id ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="min-h-[48px]"
                        onClick={() => onRejectConfirm(user.id)}
                        disabled={rejectPendingId === user.id}
                      >
                        {rejectPendingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : null}
                        Xác nhận từ chối?
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[48px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => onRejectStep1(user.id)}
                      >
                        Từ chối
                      </Button>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [confirmingRejectId, setConfirmingRejectId] = useState<string | null>(null)

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

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      toast.success('Đã duyệt tài khoản thành công.')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'rejected' })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      setConfirmingRejectId(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      toast.success('Đã từ chối tài khoản.')
    },
  })

  function handleRejectStep1(userId: string) {
    setConfirmingRejectId(userId)
    setTimeout(() => setConfirmingRejectId(null), 3000)
  }

  function handleRejectConfirm(userId: string) {
    rejectMutation.mutate(userId)
  }

  const approvePendingId = approveMutation.isPending
    ? (approveMutation.variables as string)
    : null
  const rejectPendingId = rejectMutation.isPending
    ? (rejectMutation.variables as string)
    : null

  const pendingUsers = users.filter((u) => u.approval_status === 'pending')
  const approvedUsers = users.filter((u) => u.approval_status === 'approved')
  const rejectedUsers = users.filter((u) => u.approval_status === 'rejected')

  const tableProps = {
    confirmingRejectId,
    onApprove: (id: string) => approveMutation.mutate(id),
    onRejectStep1: handleRejectStep1,
    onRejectConfirm: handleRejectConfirm,
    approvePendingId,
    rejectPendingId,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold leading-[1.3] mb-6">Quản lý tài khoản</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Đang tải..." />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
            <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
            <TabsTrigger value="rejected">Từ chối</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <UsersTable
              users={users}
              emptyMessage="Chưa có tài khoản nào được tạo."
              {...tableProps}
            />
          </TabsContent>

          <TabsContent value="pending">
            <UsersTable
              users={pendingUsers}
              emptyMessage="Không có tài khoản nào đang chờ duyệt."
              {...tableProps}
            />
          </TabsContent>

          <TabsContent value="approved">
            <UsersTable
              users={approvedUsers}
              emptyMessage="Chưa có tài khoản nào được duyệt."
              {...tableProps}
            />
          </TabsContent>

          <TabsContent value="rejected">
            <UsersTable
              users={rejectedUsers}
              emptyMessage="Chưa có tài khoản nào bị từ chối."
              {...tableProps}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
