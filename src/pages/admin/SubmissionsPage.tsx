import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { getUngraded, UngradedSubmission } from '@/lib/api/submissions'
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

export default function SubmissionsPage() {
  const navigate = useNavigate()

  const { data = [], isLoading } = useQuery<UngradedSubmission[]>({
    queryKey: ['admin', 'submissions', 'ungraded'],
    queryFn: getUngraded,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold leading-[1.3]">Chấm bài</h1>
        {data.length > 0 && (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            {data.length} bài chờ chấm
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Không có bài nào chờ chấm.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học sinh</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Bài học</TableHead>
                <TableHead>Ngày nộp</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.profiles.full_name}</TableCell>
                  <TableCell>{row.lessons.chapters.courses.title}</TableCell>
                  <TableCell>{row.lessons.title}</TableCell>
                  <TableCell>
                    {new Date(row.submitted_at).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/admin/submissions/${row.id}`)}
                    >
                      Chấm
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
