import { useEffect, useMemo, useState } from 'react'

export default function ExamCountdown({ endsAt, onExpired }: { endsAt: string; onExpired?: () => void }) {
  const endsAtMs = useMemo(() => new Date(endsAt).getTime(), [endsAt])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (now >= endsAtMs) onExpired?.()
  }, [now, endsAtMs, onExpired])

  const remain = Math.max(0, Math.floor((endsAtMs - now) / 1000))
  const mins = Math.floor(remain / 60)
  const secs = remain % 60

  return <div className="text-sm font-semibold">Thời gian còn lại: {mins}:{secs.toString().padStart(2, '0')}</div>
}
