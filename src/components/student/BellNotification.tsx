import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getUnviewedGradeCount } from '@/lib/api/submissions'

export default function BellNotification() {
  const { data: count = 0 } = useQuery({
    queryKey: ['student', 'unviewed-grades'],
    queryFn: getUnviewedGradeCount,
    refetchInterval: 60_000,
  })

  return (
    <button
      className="relative min-h-[48px] min-w-[48px] flex items-center justify-center"
      aria-label="Thông báo chấm bài"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span
          className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center leading-none"
          aria-live="polite"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
