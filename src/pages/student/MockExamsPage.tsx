import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import StudentLayout from '@/components/student/StudentLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchOpenExamSessionsForStudent } from '@/lib/api/exams'

export default function MockExamsPage() {
  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ['student', 'open-exam-sessions'],
    queryFn: fetchOpenExamSessionsForStudent,
  })

  return (
    <StudentLayout>
      <div className="p-8 space-y-4">
        <h1 className="text-xl font-bold">Đề thi thử</h1>

        {isLoading ? <p>Đang tải...</p> : null}
        {isError ? <p>Không thể tải danh sách đề thi.</p> : null}

        {!isLoading && !isError && sessions.length === 0 ? (
          <p>Hiện chưa có đề thi mở.</p>
        ) : null}

        <div className="grid gap-3">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle className="text-base">{session.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{new Date(session.starts_at).toLocaleString()} - {new Date(session.ends_at).toLocaleString()}</p>
                <Button asChild><Link to={`/de-thi/${session.id}`}>Vào thi</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}
