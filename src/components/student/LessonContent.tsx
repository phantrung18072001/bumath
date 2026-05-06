import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ExternalLink, Lock, Pencil, Trash2, BookOpen, FileText } from 'lucide-react'
import { getFileIcon } from '@/lib/file-icon'
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
  onEdit?: () => void
  onDelete?: () => void
}

export default function LessonContent({
  lesson,
  isCompleted,
  submission,
  userId,
  courseId,
  onEdit,
  onDelete,
}: LessonContentProps) {
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-primary/40" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground/60">Chọn một bài học để bắt đầu</p>
          <p className="text-sm text-muted-foreground mt-1">Các bài học hiển thị ở thanh bên trái</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">

      {/* 1. Title + admin actions */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-bold leading-snug">{lesson.title}</h2>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 shrink-0 mt-0.5">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary cursor-pointer"
                aria-label="Sửa bài học"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive cursor-pointer"
                aria-label="Xóa bài học"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Video: 3 states */}
      {lesson.video_url ? (
        <div className="max-w-4xl">
          <AspectRatio ratio={16 / 9} className="rounded-2xl overflow-hidden bg-black shadow-sm">
            <iframe
              src={lesson.video_url}
              title={`Video bài học: ${lesson.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </AspectRatio>
        </div>
      ) : lesson.has_video ? (
        <div className="max-w-4xl">
          <AspectRatio ratio={16 / 9} className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
                <Lock className="h-8 w-8 text-slate-400" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-600">Bài học bị khoá</p>
                <p className="text-sm text-slate-400 mt-1">Bạn chưa có gói học phù hợp</p>
              </div>
            </div>
          </AspectRatio>
        </div>
      ) : null}

      {/* 3. Description */}
      {lesson.description && (
        <div className="rounded-2xl bg-muted/40 border border-border/40 p-5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Mô tả bài học</p>
          <p className="text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">{lesson.description}</p>
        </div>
      )}

      {/* 4. Assignment files + submission */}
      {lesson.assignment_path !== null && (() => {
        const urls = getAssignmentPublicUrls(lesson.assignment_path)
        const paths = parseAssignmentPaths(lesson.assignment_path)
        return (
          <>
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Tài liệu bài học
              </p>
              <div className="flex flex-wrap gap-2">
                {urls.map((url, i) => {
                  const name = paths[i]?.split('/').pop() ?? `Tài liệu ${i + 1}`
                  const { Icon, colorClass } = getFileIcon(name)
                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => window.open(url, '_blank', 'noopener')}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-white hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer text-sm min-h-[44px]"
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${colorClass}`} />
                      <span className="truncate max-w-[180px] text-foreground/80">{name}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
            <SubmissionArea
              lessonId={lesson.id}
              userId={userId}
              courseId={courseId}
              submission={submission}
            />
          </>
        )
      })()}

      {/* 5. Mark complete */}
      <div>
        <LessonProgressButton
          lessonId={lesson.id}
          userId={userId}
          isCompleted={isCompleted}
          courseId={courseId}
        />
      </div>

    </div>
  )
}
