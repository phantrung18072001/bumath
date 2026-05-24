import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { FileText, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { closeExamSession, createExamSession, deleteExamSession, fetchExamSessionsForAdmin, publishExamSession, updateExamSession, type ExamSession } from '@/lib/api/exams'
import ExamSessionFormDialog from '@/components/admin/ExamSessionFormDialog'

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

export default function ExamSessionsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ExamSession | null>(null)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ExamSession['status']>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | ExamSession['session_type']>('all')
  const [gradeFilter, setGradeFilter] = useState<'all' | ExamSession['grade']>('all')
  const queryClient = useQueryClient()

  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'exam-sessions'],
    queryFn: fetchExamSessionsForAdmin,
  })

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

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchKeyword = session.title.toLowerCase().includes(keyword.trim().toLowerCase())
      const matchStatus = statusFilter === 'all' ? true : session.status === statusFilter
      const matchType = typeFilter === 'all' ? true : session.session_type === typeFilter
      const matchGrade = gradeFilter === 'all' ? true : session.grade === gradeFilter
      return matchKeyword && matchStatus && matchType && matchGrade
    })
  }, [sessions, keyword, statusFilter, typeFilter, gradeFilter])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'exam-sessions'] })

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
      <div className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-none">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Quản lý đề thi</h1>
            <p className="text-sm text-slate-600">Lọc theo tên, trạng thái, loại đề và thao tác trực tiếp trên từng dòng.</p>
          </div>
          <Button
            className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
            onClick={() => { setEditing(null); setOpen(true) }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo đề thi
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Skeleton className="mb-4 h-10 w-full" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="mb-2 h-12 w-full" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không thể tải danh sách đề thi. Vui lòng tải lại trang.
        </div>
      ) : null}

      {!isLoading && !isError && sessions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <FileText className="h-6 w-6 text-slate-500" />
          </div>
          <p className="text-base font-semibold text-slate-800">Chưa có đề thi nào</p>
          <p className="mt-1 text-sm text-slate-600">Hãy tạo đề thi đầu tiên để bắt đầu cấu hình phiên thi.</p>
        </div>
      ) : null}

      {!isLoading && !isError && sessions.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-none md:p-5">
          <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-5">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên đề thi"
              className="h-10 rounded-lg md:col-span-2"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="h-10 rounded-lg">
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
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Loại đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại đề</SelectItem>
                <SelectItem value="monthly">Đề tháng</SelectItem>
                <SelectItem value="quarterly">Đề quý</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value as typeof gradeFilter)}>
              <SelectTrigger className="h-10 rounded-lg">
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
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Tên đề</TableHead>
                  <TableHead>Loại đề</TableHead>
                  <TableHead>Khối</TableHead>
                  <TableHead>Thời gian làm bài</TableHead>
                  <TableHead>Bắt đầu</TableHead>
                  <TableHead>Kết thúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="min-w-[200px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                      Không có kết quả phù hợp với bộ lọc hiện tại.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium text-slate-900">{session.title}</TableCell>
                      <TableCell>{typeLabel(session.session_type)}</TableCell>
                      <TableCell>{gradeLabel(session.grade)}</TableCell>
                      <TableCell>{session.duration_minutes} phút</TableCell>
                      <TableCell>{new Date(session.starts_at).toLocaleString('vi-VN')}</TableCell>
                      <TableCell>{new Date(session.ends_at).toLocaleString('vi-VN')}</TableCell>
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
                            <Button size="sm" className="h-8 rounded-md bg-slate-900 px-3 hover:bg-slate-800" onClick={() => publishMutation.mutate(session.id)}>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
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
