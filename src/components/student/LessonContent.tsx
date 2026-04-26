import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { getAssignmentPublicUrls, type Lesson } from '@/lib/api/lessons'
import type { Submission } from '@/lib/api/submissions'
import LessonProgressButton from './LessonProgressButton'
import SubmissionArea from './SubmissionArea'

interface LessonContentProps {
  lesson: Lesson | null
  isCompleted: boolean
  submission: Submission | null
  userId: string
  courseId: string
}

export default function LessonContent({
  lesson,
  isCompleted,
  submission,
  userId,
  courseId,
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
      {/* 1. YouTube embed */}
      {lesson.video_url && (
        <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted">
          <iframe
            src={lesson.video_url}
            title={`Video bài học: ${lesson.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </AspectRatio>
      )}

      {/* 2. Lesson title and description */}
      <Separator className="my-6" />
      <h2 className="text-xl font-semibold">{lesson.title}</h2>
      {lesson.description && (
        <p className="text-base text-muted-foreground whitespace-pre-wrap mt-2">
          {lesson.description}
        </p>
      )}

      {/* 3. Assignment file link + submission area (only if lesson has assignment) */}
      {lesson.assignment_path !== null && (() => {
        const urls = getAssignmentPublicUrls(lesson.assignment_path)
        return (
          <>
            <Separator className="my-6" />
            <div className="flex flex-wrap gap-2">
              {urls.map((url, i) => (
                <Button
                  key={url}
                  variant="outline"
                  size="sm"
                  className="min-h-[48px]"
                  onClick={() => window.open(url, '_blank', 'noopener')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {urls.length === 1 ? 'Đề bài: Xem file' : `Tài liệu ${i + 1}`}
                </Button>
              ))}
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
