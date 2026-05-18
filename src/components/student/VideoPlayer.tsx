import { extractYouTubeID } from '@/lib/youtube'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
}

const isYouTubeUrl = (u: string) =>
  /youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(u)

function ErrorState({ className }: { className?: string }) {
  return (
    <AspectRatio
      ratio={16 / 9}
      className={cn('rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200', className)}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-slate-600">Không thể tải video</p>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Đường dẫn video không hợp lệ hoặc không được hỗ trợ.
          </p>
        </div>
      </div>
    </AspectRatio>
  )
}

export default function VideoPlayer({ url, title, className }: VideoPlayerProps) {
  if (!url) return <ErrorState className={className} />

  const isYT = isYouTubeUrl(url)
  const videoId = isYT ? extractYouTubeID(url) : null
  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : null

  if (isYT && !embedSrc) {
    return <ErrorState className={className} />
  }

  if (embedSrc) {
    return (
      <AspectRatio
        ratio={16 / 9}
        className={cn('rounded-2xl overflow-hidden bg-black shadow-sm', className)}
      >
        <iframe
          src={embedSrc}
          title={title ?? 'Video bài học'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </AspectRatio>
    )
  }

  // Self-hosted
  return (
    <AspectRatio
      ratio={16 / 9}
      className={cn('rounded-2xl overflow-hidden bg-black shadow-sm', className)}
    >
      <video
        src={url}
        controls
        className="h-full w-full"
        aria-label={title ?? 'Video bài học'}
      />
    </AspectRatio>
  )
}
