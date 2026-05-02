import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getGradedUnviewed } from '@/lib/api/submissions'

export default function BellNotification() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: items = [] } = useQuery({
    queryKey: ['graded-unviewed'],
    queryFn: getGradedUnviewed,
    refetchInterval: 60_000,
  })

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        className="relative min-h-[48px] min-w-[48px] flex items-center justify-center"
        aria-label="Thông báo chấm bài"
        onClick={() => setOpen(prev => !prev)}
      >
        <Bell className="h-5 w-5" />
        {items.length > 0 && (
          <span
            className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center leading-none"
            aria-live="polite"
          >
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b">
            <p className="text-sm font-semibold">Bài đã chấm chưa xem</p>
          </div>
          {items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground text-center leading-relaxed">
              Không có thông báo mới.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y">
              {items.map(item => (
                <li key={item.id}>
                  <Link
                    to={`/khoa-hoc/${item.lesson.chapter.course.slug}?lesson=${item.lesson.id}`}
                    className="block px-3 py-3 hover:bg-muted transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <p className="text-sm font-medium leading-relaxed truncate">
                      {item.lesson.chapter.course.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed truncate">
                      {item.lesson.title} — Điểm: {item.score}/10
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
