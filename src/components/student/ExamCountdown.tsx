import { useEffect, useMemo, useRef, useState } from 'react'

export default function ExamCountdown({ endsAt, onExpired }: { endsAt: string; onExpired?: () => void }) {
  const endsAtMs = useMemo(() => new Date(endsAt).getTime(), [endsAt])
  const [now, setNow] = useState(Date.now())
  const expiredCalledRef = useRef(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    expiredCalledRef.current = false
  }, [endsAtMs])

  useEffect(() => {
    if (expiredCalledRef.current) return
    if (now >= endsAtMs) {
      expiredCalledRef.current = true
      onExpired?.()
    }
  }, [now, endsAtMs, onExpired])

  const remain = Math.max(0, Math.floor((endsAtMs - now) / 1000))
  const mins = Math.floor(remain / 60)
  const secs = remain % 60

  return <div className="text-sm font-semibold">Thời gian còn lại: {mins}:{secs.toString().padStart(2, '0')}</div>
}
