import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { createExamSession, deleteExamSession, fetchExamSessionsForAdmin, publishExamSession, updateExamSession, type ExamSession } from '@/lib/api/exams'
import ExamSessionFormDialog from '@/components/admin/ExamSessionFormDialog'
import { toast } from 'sonner'

export default function ExamSessionsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ExamSession | null>(null)
  const queryClient = useQueryClient()

  const { data: sessions = [] } = useQuery({
    queryKey: ['admin', 'exam-sessions'],
    queryFn: fetchExamSessionsForAdmin,
  })

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý đề thi thử</h1>
        <Button onClick={() => { setEditing(null); setOpen(true) }}>Tạo đề thi</Button>
      </div>

      <div className="grid gap-3">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{session.title}</span>
                <Badge variant={session.status === 'published' ? 'default' : 'outline'}>{session.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to={`/quan-tri/de-thi/${session.id}`}>Soạn câu hỏi</Link>
              </Button>
              <Button variant="outline" onClick={() => { setEditing(session); setOpen(true) }}>Sửa</Button>
              <Button onClick={() => publishMutation.mutate(session.id)} disabled={session.status !== 'draft'}>Phát hành</Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(session.id)}>Xóa</Button>
            </CardContent>
          </Card>
        ))}
      </div>

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
