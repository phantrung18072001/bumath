import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  AdminListCard,
  AdminListFilterRow,
  AdminListPaginationFooter,
} from '@/components/admin/AdminListCard'
import { closeExamSession, createExamSession, deleteExamSession, fetchExamSessionsForAdminPaginated, publishExamSession, updateExamSession, type ExamSession } from '@/lib/api/exams'
import ExamSessionFormDialog from '@/components/admin/ExamSessionFormDialog'
import AdminPageHeader, { ADMIN_PAGE_HEADER_ACTION_BUTTON_CLASS } from '@/components/admin/AdminPageHeader'

function statusLabel(status: ExamSession['status']) {
  if (status === 'published') return 'Đang mở'
  if (status === 'closed') return 'Đã đóng'
  return 'Bản nháp'
}

function statusClass(status: ExamSession['status']) {
  if (status === 'published') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (status === 'closed') return 'bg-slate-100 text-slate-700 border-slate-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

function typeLabel(type: ExamSession['session_type']) {
  return type === 'monthly' ? 'Đề tháng' : 'Đề quý'
}

function gradeLabel(grade: ExamSession['grade']) {
  if (grade === 'grade_7') return 'Lớp 7'
  if (grade === 'grade_8') return 'Lớp 8'
  if (grade === 'grade_9') return 'Lớp 9'
  return 'Nâng cao'
}

function formatDateParts(dateString: string) {
  const date = new Date(dateString)
  return {
    day: date.toLocaleDateString('vi-VN'),
    time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function ExamSessionsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ExamSession | null>(null)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ExamSession['status']>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | ExamSession['session_type']>('all')
  const [gradeFilter, setGradeFilter] = useState<'all' | ExamSession['grade']>('all')
  const [appliedFilters, setAppliedFilters] = useState({
    keyword: '',
    statusFilter: 'all' as 'all' | ExamSession['status'],
    typeFilter: 'all' as 'all' | ExamSession['session_type'],
    gradeFilter: 'all' as 'all' | ExamSession['grade'],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'exam-sessions', { page: currentPage, pageSize, ...appliedFilters }],
    queryFn: () => fetchExamSessionsForAdminPaginated({
      page: currentPage,
      pageSize,
      keyword: appliedFilters.keyword,
      status: appliedFilters.statusFilter,
      sessionType: appliedFilters.typeFilter,
      grade: appliedFilters.gradeFilter,
    }),
  })
  const sessions = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  // Auto-refetch when any published session's ends_at passes
  useEffect(() => {
    const publishedSessions = sessions.filter((s) => s.status === 'published')
    if (publishedSessions.length === 0) return
    const now = Date.now()
    const nextExpiry = Math.min(...publishedSessions.map((s) => new Date(s.ends_at).getTime()))
    const msUntilExpiry = nextExpiry - now
    if (msUntilExpiry <= 0) {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exam-sessions'] })
      return
    }
    const timer = window.setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exam-sessions'] })
    }, msUntilExpiry + 500) // +500ms buffer to ensure DB has processed
    return () => window.clearTimeout(timer)
  }, [sessions, queryClient])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'exam-sessions'] })
  const applyFilters = () => {
    setAppliedFilters({ keyword, statusFilter, typeFilter, gradeFilter })
    setCurrentPage(1)
  }

  const createMutation = useMutation({
    mutationFn: createExamSession,
    onSuccess: () => {
      toast.success('Đã tạo đề thi.')
      refresh()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateExamSession>[1] }) => updateExamSession(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật đề thi.')
      refresh()
    },
  })

  const publishMutation = useMutation({
    mutationFn: publishExamSession,
    onSuccess: () => {
      toast.success('Đã phát hành đề thi.')
      refresh()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteExamSession,
    onSuccess: () => {
      toast.success('Đã xóa đề thi.')
      refresh()
    },
  })

  const closeMutation = useMutation({
    mutationFn: closeExamSession,
    onSuccess: () => {
      toast.success('Đã đóng đề thi.')
      refresh()
    },
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý đề thi"
        description="Lọc theo tên, trạng thái, loại đề và thao tác trực tiếp trên từng dòng."
        action={(
          <Button
            className={ADMIN_PAGE_HEADER_ACTION_BUTTON_CLASS}
            onClick={() => { setEditing(null); setOpen(true) }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo đề thi
          </Button>
        )}
      />

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không thể tải danh sách đề thi. Vui lòng tải lại trang.
        </div>
      ) : null}

      {!isError ? (
        <AdminListCard
          filters={(
            <AdminListFilterRow>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên đề thi"
              className="h-10 min-w-[280px] rounded-lg"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="h-10 w-[180px] shrink-0 rounded-lg">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="published">Đang mở</SelectItem>
                <SelectItem value="closed">Đã đóng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
              <SelectTrigger className="h-10 w-[170px] shrink-0 rounded-lg">
                <SelectValue placeholder="Loại đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại đề</SelectItem>
                <SelectItem value="monthly">Đề tháng</SelectItem>
                <SelectItem value="quarterly">Đề quý</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value as typeof gradeFilter)}>
              <SelectTrigger className="h-10 w-[170px] shrink-0 rounded-lg">
                <SelectValue placeholder="Khối" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khối</SelectItem>
                <SelectItem value="grade_7">Lớp 7</SelectItem>
                <SelectItem value="grade_8">Lớp 8</SelectItem>
                <SelectItem value="grade_9">Lớp 9</SelectItem>
                <SelectItem value="advanced">Nâng cao</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-10 shrink-0 rounded-lg" onClick={applyFilters}>
              Tìm kiếm
            </Button>
            </AdminListFilterRow>
          )}
          totalLabel={`${totalCount} đề thi`}
          footer={(
            <AdminListPaginationFooter
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
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
                  <TableHead className="min-w-[220px]">Tên đề</TableHead>
                  <TableHead className="min-w-[96px] whitespace-nowrap">Loại đề</TableHead>
                  <TableHead className="min-w-[88px] whitespace-nowrap">Khối</TableHead>
                  <TableHead className="min-w-[96px] whitespace-nowrap">Thời gian</TableHead>
                  <TableHead>Bắt đầu</TableHead>
                  <TableHead>Kết thúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="min-w-[200px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-48" /></TableCell>
                    </TableRow>
                  ))
                ) : sessions.length === 0 ? (
                  <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                      {totalCount === 0 && appliedFilters.keyword === '' && appliedFilters.statusFilter === 'all' && appliedFilters.typeFilter === 'all' && appliedFilters.gradeFilter === 'all'
                        ? 'Chưa có đề thi nào. Hãy tạo đề thi đầu tiên để bắt đầu.'
                        : 'Không có kết quả phù hợp với bộ lọc hiện tại.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => {
                    const startsAt = formatDateParts(session.starts_at)
                    const endsAt = formatDateParts(session.ends_at)
                    return (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium text-slate-900">{session.title}</TableCell>
                        <TableCell className="whitespace-nowrap">{typeLabel(session.session_type)}</TableCell>
                        <TableCell className="whitespace-nowrap">{gradeLabel(session.grade)}</TableCell>
                        <TableCell className="whitespace-nowrap">{session.duration_minutes} phút</TableCell>
                        <TableCell>
                          <div className="leading-tight">
                            <div>{startsAt.day}</div>
                            <div className="text-xs text-muted-foreground">{startsAt.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="leading-tight">
                            <div>{endsAt.day}</div>
                            <div className="text-xs text-muted-foreground">{endsAt.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('whitespace-nowrap rounded-md border px-2.5 py-0.5 text-xs font-semibold', statusClass(session.status))}>
                            {statusLabel(session.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="outline" size="sm" className="h-8 rounded-md px-3" asChild>
                              <Link to={`/quan-tri/de-thi/${session.id}`}>Soạn</Link>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-md px-3" onClick={() => { setEditing(session); setOpen(true) }}>
                              Sửa
                            </Button>
                            {session.status === 'draft' ? (
                              <Button size="sm" className="h-8 rounded-md bg-primary px-3 text-primary-foreground hover:bg-primary/90" onClick={() => publishMutation.mutate(session.id)}>
                                Phát hành
                              </Button>
                            ) : null}
                            {session.status === 'published' ? (
                              <Button size="sm" variant="secondary" className="h-8 rounded-md px-3" onClick={() => closeMutation.mutate(session.id)}>
                                Đóng
                              </Button>
                            ) : null}
                            <Button variant="destructive" size="sm" className="h-8 rounded-md px-3" onClick={() => deleteMutation.mutate(session.id)}>
                              Xóa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </AdminListCard>
      ) : null}

      <ExamSessionFormDialog
        open={open}
        onOpenChange={setOpen}
        initialData={editing}
        onSubmit={async (payload) => {
          if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, payload })
            return
          }
          await createMutation.mutateAsync(payload)
        }}
      />
    </div>
  )
}
