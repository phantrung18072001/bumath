import { useState, useEffect, useCallback } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Lock, Pencil, Trash2, BookOpen, FileText } from 'lucide-react'
import { getFileIcon } from '@/lib/file-icon'
import { getAssignmentPublicUrls, parseAssignmentPaths, type Lesson } from '@/lib/api/lessons'
import type { Submission } from '@/lib/api/submissions'
import type { StudyMaterialGrade } from '@/lib/api/study-materials'
import LessonProgressButton from './LessonProgressButton'
import SubmissionArea from './SubmissionArea'
import StudyMaterialsList from './StudyMaterialsList'
import ChatPanel from './ChatPanel'

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
  const [chatUnreadCount, setChatUnreadCount] = useState(0)

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    if (value === 'thao-luan') setChatUnreadCount(0)
  }, [])

  const handleNewChatMessage = useCallback(() => {
    if (activeTab !== 'thao-luan') setChatUnreadCount(c => c + 1)
  }, [activeTab])

  useEffect(() => {
    setActiveTab('bai-giang')
    setChatUnreadCount(0)
  }, [lesson?.id])

  if (!lesson) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center h-full p-8 gap-4">
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
    <div className="flex flex-col flex-1 h-full">

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
        {/* Video: 3 states */}
        {lesson.video_url ? (
        <div className="px-4 md:px-8 py-6 space-y-6">
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
        </div>
        ) : lesson.has_video ? (
        <div className="px-4 md:px-8 py-6 space-y-6">
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
        </div>
        ) : null}


      {/* 3-tab content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className='mt-4 bg-white/80 backdrop-blur-sm w-full flex-1 flex-col'>
        <TabsList className="w-full border-b border-border rounded-none bg-white/80 backdrop-blur-sm px-4 md:px-8 h-auto pb-0 justify-start gap-1 sticky top-0 z-10">
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
            aria-label={chatUnreadCount > 0 ? `Thảo luận, ${chatUnreadCount} tin nhắn chưa đọc` : 'Thảo luận'}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none pb-3 font-medium text-sm text-muted-foreground"
          >
            Thảo luận
            {chatUnreadCount > 0 && (
              <Badge className="ml-1.5 bg-[#F97316] text-white text-[10px] px-1.5 min-w-[18px] h-[18px] rounded-full border-0">
                {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1 — Bài giảng: description + study materials + progress button */}
        <TabsContent value="bai-giang" className="px-4 md:px-8 py-6 space-y-8 mt-0">
          {lesson.description && (
            <p className="text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">{lesson.description}</p>
          )}

          <StudyMaterialsList
            lessonId={lesson.id}
            isAdmin={false}
            defaultGrade={toMaterialGrade(courseGrade)}
          />

          {!isAdmin && (
            <div>
              <LessonProgressButton
                lessonId={lesson.id}
                userId={userId}
                isCompleted={isCompleted}
                courseId={courseId}
              />
            </div>
          )}
        </TabsContent>

        {/* Tab 2 — Bài kiểm tra (only rendered when hasAssignment) */}
        {hasAssignment && (
          <TabsContent value="bai-kiem-tra" className="px-4 md:px-8 py-6 space-y-8 mt-0">
            {(() => {
              const urls = getAssignmentPublicUrls(lesson.assignment_path)
              const paths = parseAssignmentPaths(lesson.assignment_path)
              return (
                <>
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Đề bài
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {urls.map((url, i) => {
                        const name = paths[i]?.split('/').pop() ?? `Tài liệu ${i + 1}`
                        const isImage = /\.(jpg|jpeg|png|gif|webp|heic|avif)$/i.test(name)
                        const { Icon, colorClass } = getFileIcon(name)
                        return (
                          <div key={url} className="flex flex-col gap-1 shrink-0">
                            <div
                              className="w-40 h-40 sm:w-[200px] sm:h-[200px] rounded-md border bg-muted/40 overflow-hidden cursor-pointer"
                              onClick={() => window.open(url, '_blank', 'noopener')}
                            >
                              {isImage ? (
                                <img src={url} alt={name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                                  <Icon className={`h-8 w-8 ${colorClass}`} />
                                  <span className="text-[10px] uppercase font-medium">{name.split('.').pop()}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate text-center w-40 sm:w-[200px]" title={name}>{name}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {!isAdmin && (
                    <SubmissionArea
                      lessonId={lesson.id}
                      userId={userId}
                      courseId={courseId}
                      submission={submission}
                    />
                  )}
                </>
              )
            })()}
          </TabsContent>
        )}

        {/* Tab 3 — Thảo luận (all roles) */}
        <TabsContent value="thao-luan" className="flex flex-col flex-1 min-h-0 mt-0 p-0">
          <ChatPanel lessonId={lesson.id} onNewMessage={handleNewChatMessage} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
