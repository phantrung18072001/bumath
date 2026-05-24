import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import StudentLayout from '@/components/student/StudentLayout'
import { fetchOpenExamSessionsForStudent } from '@/lib/api/exams'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

function gradeLabel(grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced') {
  if (grade === 'grade_7') return 'Lớp 7'
  if (grade === 'grade_8') return 'Lớp 8'
  if (grade === 'grade_9') return 'Lớp 9'
  return 'Nâng cao'
}

function statusLabel(status: 'open' | 'done' | 'closed') {
  if (status === 'done') return 'Đã làm'
  if (status === 'closed') return 'Đã đóng'
  return 'Đang mở'
}

function statusClass(status: 'open' | 'done' | 'closed') {
  if (status === 'done') return 'bg-slate-100 text-slate-700 border-slate-200'
  if (status === 'closed') return 'bg-rose-100 text-rose-700 border-rose-200'
  return 'bg-emerald-100 text-emerald-700 border-emerald-200'
}

function typeLabel(type: 'monthly' | 'quarterly') {
  return type === 'monthly' ? 'Đề tháng' : 'Đề quý'
}

export default function MockExamsPage() {
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'done'>('open')
  const [typeFilter, setTypeFilter] = useState<'all' | 'monthly' | 'quarterly'>('all')
  const [gradeFilter, setGradeFilter] = useState<'all' | 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'>('all')
  const queryClient = useQueryClient()
  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ['student', 'open-exam-sessions'],
    queryFn: fetchOpenExamSessionsForStudent,
  })

  // Auto-refetch when any open session's ends_at passes
  useEffect(() => {
    const openSessions = sessions.filter((s) => s.status === 'open')
    if (openSessions.length === 0) return
    const now = Date.now()
    const nextExpiry = Math.min(...openSessions.map((s) => new Date(s.ends_at).getTime()))
    const msUntilExpiry = nextExpiry - now
    if (msUntilExpiry <= 0) {
      queryClient.invalidateQueries({ queryKey: ['student', 'open-exam-sessions'] })
      return
    }
    const timer = window.setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['student', 'open-exam-sessions'] })
    }, msUntilExpiry + 500)
    return () => window.clearTimeout(timer)
  }, [sessions, queryClient])

  const filteredSessions = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return sessions.filter((session) => {
      const matchKeyword = q.length === 0 || session.title.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || session.status === statusFilter
      const matchType = typeFilter === 'all' || session.session_type === typeFilter
      const matchGrade = gradeFilter === 'all' || session.grade === gradeFilter
      return matchKeyword && matchStatus && matchType && matchGrade
    })
  }, [sessions, keyword, statusFilter, typeFilter, gradeFilter])

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-[1240px] p-4 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-slate-950">Đề thi</span>
        </h1>

        {isError ? (
          <div className="bm-glass-card p-5 text-sm text-destructive">Không thể tải danh sách đề thi.</div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-none md:p-5">
          <div className="mb-4 flex flex-nowrap gap-2 overflow-x-auto pb-1">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên đề thi"
              className="h-10 min-w-[280px] rounded-lg border-slate-300 focus-visible:border-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="h-10 w-[170px] shrink-0 rounded-lg border-slate-300 focus:ring-0 focus:ring-offset-0 focus:border-slate-300">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="open">Đang mở</SelectItem>
                <SelectItem value="done">Đã làm</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
              <SelectTrigger className="h-10 w-[170px] shrink-0 rounded-lg border-slate-300 focus:ring-0 focus:ring-offset-0 focus:border-slate-300">
                <SelectValue placeholder="Loại đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại đề</SelectItem>
                <SelectItem value="monthly">Đề tháng</SelectItem>
                <SelectItem value="quarterly">Đề quý</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value as typeof gradeFilter)}>
              <SelectTrigger className="h-10 w-[170px] shrink-0 rounded-lg border-slate-300 focus:ring-0 focus:ring-offset-0 focus:border-slate-300">
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
                  <TableHead className="min-w-[240px]">Tên đề</TableHead>
                  <TableHead>Khối</TableHead>
                  <TableHead>Loại đề</TableHead>
                  <TableHead>Bắt đầu mở đề</TableHead>
                  <TableHead>Kết thúc mở đề</TableHead>
                  <TableHead>Thời gian làm bài</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Điểm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={`skeleton-row-${index}`}>
                      <TableCell><Skeleton className="h-5 w-[220px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[70px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[90px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[90px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[70px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-[70px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-[80px]" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                      Không có kết quả phù hợp với bộ lọc hiện tại.
                    </TableCell>
                  </TableRow>
                ) : filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium text-slate-900">
                      {session.title}
                    </TableCell>
                    <TableCell>{gradeLabel(session.grade)}</TableCell>
                    <TableCell>{typeLabel(session.session_type)}</TableCell>
                    <TableCell>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {new Date(session.starts_at).toLocaleString('vi-VN')}
                      </p>
                    </TableCell>
                    <TableCell>{new Date(session.ends_at).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>{session.duration_minutes} phút</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('rounded-md border px-2.5 py-0.5 text-xs font-semibold', statusClass(session.status))}>
                        {statusLabel(session.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-700">
                      {session.score_10 == null ? '-' : `${session.score_10.toFixed(2)}/10`}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.status === 'closed' ? (
                        <span className="text-sm text-slate-400">Đã đóng</span>
                      ) : (
                        <Button asChild size="sm" className="h-8 rounded-md">
                          <Link to={`/de-thi/${session.id}`}>{session.status === 'done' ? 'Xem lại' : 'Vào thi'}</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
