import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { ExamGrade, ExamSession, ExamSessionType } from '@/lib/api/exams'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ExamSession | null
  onSubmit: (payload: { title: string; grade: ExamGrade; session_type: ExamSessionType; duration_minutes: number; starts_at: string; ends_at: string }) => Promise<void>
}

export default function ExamSessionFormDialog({ open, onOpenChange, initialData, onSubmit }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [grade, setGrade] = useState<ExamGrade>(initialData?.grade ?? 'grade_7')
  const [sessionType, setSessionType] = useState<ExamSessionType>(initialData?.session_type ?? 'monthly')
  const [durationMinutes, setDurationMinutes] = useState<number>(initialData?.duration_minutes ?? 45)
  const [startsDate, setStartsDate] = useState<Date | undefined>(initialData?.starts_at ? new Date(initialData.starts_at) : undefined)
  const [startsHour, setStartsHour] = useState(initialData?.starts_at ? format(new Date(initialData.starts_at), 'HH') : '')
  const [startsMinute, setStartsMinute] = useState(initialData?.starts_at ? format(new Date(initialData.starts_at), 'mm') : '')
  const [endsDate, setEndsDate] = useState<Date | undefined>(initialData?.ends_at ? new Date(initialData.ends_at) : undefined)
  const [endsHour, setEndsHour] = useState(initialData?.ends_at ? format(new Date(initialData.ends_at), 'HH') : '')
  const [endsMinute, setEndsMinute] = useState(initialData?.ends_at ? format(new Date(initialData.ends_at), 'mm') : '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), [])
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), [])

  useEffect(() => {
    if (!open) return
    setTitle(initialData?.title ?? '')
    setGrade(initialData?.grade ?? 'grade_7')
    setSessionType(initialData?.session_type ?? 'monthly')
    setDurationMinutes(initialData?.duration_minutes ?? 45)
    setStartsDate(initialData?.starts_at ? new Date(initialData.starts_at) : undefined)
    setStartsHour(initialData?.starts_at ? format(new Date(initialData.starts_at), 'HH') : '')
    setStartsMinute(initialData?.starts_at ? format(new Date(initialData.starts_at), 'mm') : '')
    setEndsDate(initialData?.ends_at ? new Date(initialData.ends_at) : undefined)
    setEndsHour(initialData?.ends_at ? format(new Date(initialData.ends_at), 'HH') : '')
    setEndsMinute(initialData?.ends_at ? format(new Date(initialData.ends_at), 'mm') : '')
    setErrors({})
    setFormError(null)
  }, [open, initialData])

  function composeDateTime(date: Date, hour: string, minute: string): Date {
    const next = new Date(date)
    next.setHours(Number(hour), Number(minute), 0, 0)
    return next
  }

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {}
    setFormError(null)
    if (!title.trim()) {
      nextErrors.title = 'Vui lòng nhập tên đề thi.'
    }
    if (!startsDate) {
      nextErrors.startsDate = 'Vui lòng chọn ngày bắt đầu.'
    }
    if (!startsHour || !startsMinute) {
      nextErrors.startsTime = 'Vui lòng chọn giờ bắt đầu (24h).'
    }
    if (!endsDate) {
      nextErrors.endsDate = 'Vui lòng chọn ngày kết thúc.'
    }
    if (!endsHour || !endsMinute) {
      nextErrors.endsTime = 'Vui lòng chọn giờ kết thúc (24h).'
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
      nextErrors.duration_minutes = 'Thời gian làm bài phải lớn hơn hoặc bằng 1 phút.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const startsAt = composeDateTime(startsDate!, startsHour, startsMinute)
    const endsAt = composeDateTime(endsDate!, endsHour, endsMinute)
    if (endsAt <= startsAt) {
      const message = 'Thời điểm kết thúc phải sau thời điểm bắt đầu.'
      setErrors({ endsDate: message })
      return
    }

    setErrors({})
    setSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        grade,
        session_type: sessionType,
        duration_minutes: durationMinutes,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      onOpenChange(false)
    } catch (error) {
      const message = (error as { message?: string } | null)?.message ?? 'Có lỗi khi lưu đề thi. Vui lòng thử lại.'
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Cập nhật đề thi' : 'Tạo đề thi'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Tên đề thi</Label>
            <p className="text-xs text-muted-foreground">Ví dụ: Đề thi tháng 5 - Khối 10.</p>
            <Input id="exam-title" placeholder="Nhập tên đề thi" value={title} onChange={(e) => setTitle(e.target.value)} />
            {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Khối lớp</Label>
            <p className="text-xs text-muted-foreground">Chọn khối lớp áp dụng cho đề thi.</p>
            <Select value={grade} onValueChange={(value) => setGrade(value as ExamGrade)}>
              <SelectTrigger className="h-11 rounded-xl border-slate-300">
                <SelectValue placeholder="Chọn khối lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grade_7">Lớp 7</SelectItem>
                <SelectItem value="grade_8">Lớp 8</SelectItem>
                <SelectItem value="grade_9">Lớp 9</SelectItem>
                <SelectItem value="advanced">Nâng cao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Loại đề</Label>
            <p className="text-xs text-muted-foreground">Chọn loại đề theo kỳ tổ chức.</p>
            <Select value={sessionType} onValueChange={(value) => setSessionType(value as ExamSessionType)}>
              <SelectTrigger className="h-11 rounded-xl border-slate-300">
                <SelectValue placeholder="Chọn loại đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Đề tháng</SelectItem>
                <SelectItem value="quarterly">Đề quý</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration-minutes">Thời gian làm bài (phút)</Label>
            <p className="text-xs text-muted-foreground">Khác với thời gian mở đề. Ví dụ: 45, 60, 90.</p>
            <Input
              id="duration-minutes"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
            {errors.duration_minutes ? <p className="text-xs text-destructive">{errors.duration_minutes}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Ngày bắt đầu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('h-11 w-full justify-start rounded-xl border-slate-300 text-left font-normal', !startsDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startsDate ? format(startsDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày bắt đầu'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startsDate} onSelect={setStartsDate} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.startsDate ? <p className="text-xs text-destructive">{errors.startsDate}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Giờ bắt đầu (24h)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={startsHour} onValueChange={setStartsHour}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-300">
                    <SelectValue placeholder="Giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={startsMinute} onValueChange={setStartsMinute}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-300">
                    <SelectValue placeholder="Phút" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => <SelectItem key={minute} value={minute}>{minute}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {errors.startsTime ? <p className="text-xs text-destructive">{errors.startsTime}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Ngày kết thúc</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('h-11 w-full justify-start rounded-xl border-slate-300 text-left font-normal', !endsDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endsDate ? format(endsDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày kết thúc'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endsDate} onSelect={setEndsDate} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.endsDate ? <p className="text-xs text-destructive">{errors.endsDate}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Giờ kết thúc (24h)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={endsHour} onValueChange={setEndsHour}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-300">
                    <SelectValue placeholder="Giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={endsMinute} onValueChange={setEndsMinute}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-300">
                    <SelectValue placeholder="Phút" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => <SelectItem key={minute} value={minute}>{minute}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {errors.endsTime ? <p className="text-xs text-destructive">{errors.endsTime}</p> : null}
            </div>
          </div>

          {formError ? <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
