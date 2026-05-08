import { useState, useEffect } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ExternalLink, Lock, Pencil, Trash2, BookOpen, FileText, MessageCircle } from 'lucide-react'
import { getFileIcon } from '@/lib/file-icon'
import { getAssignmentPublicUrls, parseAssignmentPaths, type Lesson } from '@/lib/api/lessons'
import type { Submission } from '@/lib/api/submissions'
import type { StudyMaterialGrade } from '@/lib/api/study-materials'
import LessonProgressButton from './LessonProgressButton'
import SubmissionArea from './SubmissionArea'
import StudyMaterialsList from './StudyMaterialsList'

interface LessonContentProps {
  lesson: Lesson | null
  isCompleted: boolean
  submission: Submission | null
  userId: string
  courseId: string
  isAdmin?: boolean
  courseGrade?: string
  onEdit?: () => void
  onDelete?: () => void
}

function toMaterialGrade(grade?: string): StudyMaterialGrade {
  if (grade === 'grade_7' || grade === 'grade_8' || grade === 'grade_9') return grade
  return 'grade_9'
}

export default function LessonContent({
  lesson,
  isCompleted,
  submission,
  userId,
  courseId,
  isAdmin,
  courseGrade,
  onEdit,
  onDelete,
}: LessonContentProps) {
  const [activeTab, setActiveTab] = useState('bai-giang')

  useEffect(() => {
    setActiveTab('bai-giang')
  }, [lesson?.id])

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

  const hasAssignment = lesson.assignment_path !== null

  return (
    <div className="flex flex-col">

      {/* Title + admin actions — always visible above tab bar */}
      <div className="px-4 md:px-8 pt-4 md:pt-6 pb-0 flex items-start justify-between gap-3">
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

      {/* Video + description — always visible above tabs */}
      <div className="px-4 md:px-8 py-6 space-y-6">
        {/* Video: 3 states */}
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

      </div>

      {/* 3-tab content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b border-border rounded-none bg-transparent px-4 md:px-8 h-auto pb-0 justify-start gap-1 sticky top-0 bg-white z-10">
          <TabsTrigger
            value="bai-giang"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none pb-3 font-medium text-sm text-muted-foreground"
          >
            Bài giảng
          </TabsTrigger>
          {hasAssignment && (
            <TabsTrigger
              value="bai-kiem-tra"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none pb-3 font-medium text-sm text-muted-foreground"
            >
              Bài kiểm tra
            </TabsTrigger>
          )}
          <TabsTrigger
            value="thao-luan"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none pb-3 font-medium text-sm text-muted-foreground"
          >
            Thảo luận
          </TabsTrigger>
        </TabsList>

        {/* Tab 1 — Bài giảng: description + study materials + progress button */}
        <TabsContent value="bai-giang" className="px-4 md:px-8 py-6 space-y-8 mt-0">
          {lesson.description && (
            <p className="text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">{lesson.description}</p>
          )}

          <StudyMaterialsList
            lessonId={lesson.id}
            isAdmin={isAdmin}
            defaultGrade={toMaterialGrade(courseGrade)}
          />

          <div>
            <LessonProgressButton
              lessonId={lesson.id}
              userId={userId}
              isCompleted={isCompleted}
              courseId={courseId}
            />
          </div>
        </TabsContent>

        {/* Tab 2 — Bài kiểm tra (only rendered when hasAssignment) */}
        {hasAssignment && (
          <TabsContent value="bai-kiem-tra" className="px-4 md:px-8 py-6 space-y-8 mt-0">
            {(() => {
              const urls = getAssignmentPublicUrls(lesson.assignment_path)
              const paths = parseAssignmentPaths(lesson.assignment_path)
              return (
                <>
                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-3">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Đề bài
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
          </TabsContent>
        )}

        {/* Tab 3 — Thảo luận (placeholder) */}
        <TabsContent value="thao-luan" className="px-4 md:px-8 py-6 mt-0">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">Tính năng sắp có</p>
            <p className="text-xs text-muted-foreground/60">Phần thảo luận đang được phát triển.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
