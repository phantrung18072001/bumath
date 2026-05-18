import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Quản lý đề thi thử
          </span>
        </h1>
        <Button
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
          onClick={() => { setEditing(null); setOpen(true) }}
        >
          Tạo đề thi
        </Button>
      </div>

      <div className="grid gap-3">
        {sessions.map((session) => (
          <div key={session.id} className="bm-glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-800">{session.title}</span>
              <Badge variant={session.status === 'published' ? 'default' : 'outline'}>{session.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to={`/quan-tri/de-thi/${session.id}`}>Soạn câu hỏi</Link>
              </Button>
              <Button variant="outline" onClick={() => { setEditing(session); setOpen(true) }}>Sửa</Button>
              <Button onClick={() => publishMutation.mutate(session.id)} disabled={session.status !== 'draft'}>Phát hành</Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(session.id)}>Xóa</Button>
            </div>
          </div>
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
