import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ExternalLink, Lock } from 'lucide-react'
import { getAssignmentPublicUrls, parseAssignmentPaths, type Lesson } from '@/lib/api/lessons'
import type { Submission } from '@/lib/api/submissions'
import LessonProgressButton from './LessonProgressButton'
import SubmissionArea from './SubmissionArea'

interface LessonContentProps {
  lesson: Lesson | null
  isCompleted: boolean
  submission: Submission | null
  userId: string
  courseId: string
  hideTitle?: boolean
}

export default function LessonContent({
  lesson,
  isCompleted,
  submission,
  userId,
  courseId,
  hideTitle = false,
}: LessonContentProps) {
  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground text-base text-center">
          Chọn một bài học để bắt đầu
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* 1. Lesson title — hidden when shown in content header */}
      {!hideTitle && <h2 className="text-xl font-semibold mb-4">{lesson.title}</h2>}

      {/* 2. Video section: 3 states */}
      {lesson.video_url ? (
        <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted">
          <iframe
            src={lesson.video_url}
            title={`Video bài học: ${lesson.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </AspectRatio>
      ) : lesson.has_video ? (
        /* has_video=true but video_url=null → RLS masked: student has no matching package */
        <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted">
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Lock className="h-10 w-10" aria-hidden="true" />
            <p className="text-base font-semibold">Bài học bị khoá</p>
            <p className="text-sm">Bạn chưa có gói học phù hợp</p>
          </div>
        </AspectRatio>
      ) : null /* has_video=false or undefined → teacher hasn't added a video yet */}

      {/* 3. Description */}
      {lesson.description && (
        <>
          <Separator className="my-6" />
          <p className="text-base text-muted-foreground whitespace-pre-wrap">
            {lesson.description}
          </p>
        </>
      )}

      {/* 3. Assignment file link + submission area (only if lesson has assignment) */}
      {lesson.assignment_path !== null && (() => {
        const urls = getAssignmentPublicUrls(lesson.assignment_path)
        const paths = parseAssignmentPaths(lesson.assignment_path)
        return (
          <>
            <Separator className="my-6" />
            <div className="flex flex-wrap gap-2">
              {urls.map((url, i) => {
                const name = paths[i]?.split('/').pop() ?? `Tài liệu ${i + 1}`
                return (
                  <Button
                    key={url}
                    variant="outline"
                    size="sm"
                    className="min-h-[48px]"
                    onClick={() => window.open(url, '_blank', 'noopener')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate max-w-[180px]">{name}</span>
                  </Button>
                )
              })}
            </div>

            <Separator className="my-6" />
            <SubmissionArea
              lessonId={lesson.id}
              userId={userId}
              courseId={courseId}
              submission={submission}
            />
          </>
        )
      })()}

      {/* 5. Mark complete button */}
      <Separator className="my-6" />
      <LessonProgressButton
        lessonId={lesson.id}
        userId={userId}
        isCompleted={isCompleted}
        courseId={courseId}
      />
    </div>
  )
}
