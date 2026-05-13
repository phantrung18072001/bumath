import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ExamSession, ExamSessionType } from '@/lib/api/exams'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ExamSession | null
  onSubmit: (payload: { title: string; session_type: ExamSessionType; starts_at: string; ends_at: string }) => Promise<void>
}

export default function ExamSessionFormDialog({ open, onOpenChange, initialData, onSubmit }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [sessionType, setSessionType] = useState<ExamSessionType>(initialData?.session_type ?? 'monthly')
  const [startsAt, setStartsAt] = useState(initialData?.starts_at?.slice(0, 16) ?? '')
  const [endsAt, setEndsAt] = useState(initialData?.ends_at?.slice(0, 16) ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!title.trim() || !startsAt || !endsAt) return
    if (new Date(endsAt) <= new Date(startsAt)) return
    setSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        session_type: sessionType,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Cập nhật đề thi' : 'Tạo đề thi thử'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Tên đề thi" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="w-full rounded-md border px-3 py-2 text-sm" value={sessionType} onChange={(e) => setSessionType(e.target.value as ExamSessionType)}>
            <option value="monthly">Tháng</option>
            <option value="quarterly">Quý</option>
          </select>
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
