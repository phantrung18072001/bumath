import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarDays, FileText } from 'lucide-react'
import StudentLayout from '@/components/student/StudentLayout'
import { Button } from '@/components/ui/button'
import { fetchOpenExamSessionsForStudent } from '@/lib/api/exams'

export default function MockExamsPage() {
  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ['student', 'open-exam-sessions'],
    queryFn: fetchOpenExamSessionsForStudent,
  })

  return (
    <StudentLayout>
      <div className="p-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Đề thi thử
          </span>
        </h1>

        {isLoading ? (
          <div className="bm-glass-card p-5 text-sm text-muted-foreground animate-pulse">Đang tải...</div>
        ) : null}

        {isError ? (
          <div className="bm-glass-card p-5 text-sm text-destructive">Không thể tải danh sách đề thi.</div>
        ) : null}

        {!isLoading && !isError && sessions.length === 0 ? (
          <div className="bm-glass-card flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <FileText className="h-7 w-7 text-indigo-500" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-slate-700">Chưa có đề thi mở</p>
            <p className="text-sm text-muted-foreground">Hãy quay lại sau khi giảng viên phát hành đề thi mới.</p>
          </div>
        ) : null}

        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bm-glass-card flex items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-semibold text-slate-800">{session.title}</p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {new Date(session.starts_at).toLocaleString('vi-VN')}
                  {' '}&mdash;{' '}
                  {new Date(session.ends_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link to={`/de-thi/${session.id}`}>Vào thi</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}
