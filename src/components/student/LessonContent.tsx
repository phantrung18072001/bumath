import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { getAssignmentPublicUrl, type Lesson } from '@/lib/api/lessons'
import type { Submission } from '@/lib/api/submissions'
import LessonProgressButton from './LessonProgressButton'

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
      {lesson.assignment_path !== null && (
        <>
          <Separator className="my-6" />
          <div>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[48px]"
              onClick={() => window.open(getAssignmentPublicUrl(lesson.assignment_path!), '_blank', 'noopener')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Đề bài: Xem file
            </Button>
          </div>

          {/* 4. Submission status area */}
          <div id="submission-area" className="mt-4">
            {submission === null && (
              <Badge className="bg-slate-100 text-slate-600">Chưa nộp</Badge>
            )}
            {submission?.status === 'submitted' && (
              <Badge className="bg-blue-100 text-blue-700">Đã nộp (đang chờ chấm)</Badge>
            )}
            {submission?.status === 'graded' && (
              <Badge className="bg-green-100 text-green-700">Đã chấm</Badge>
            )}
            {/* SubmissionArea will be integrated here in Plan 04 */}
          </div>
        </>
      )}

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
