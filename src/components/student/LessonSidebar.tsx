import { cn } from '@/lib/utils'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight, Circle, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Chapter } from '@/lib/api/chapters'
import type { Lesson } from '@/lib/api/lessons'

export interface LessonSidebarProps {
  chapters: Chapter[]
  lessonsByChapter: Map<string, Lesson[]>
  completedLessonIds: Set<string>
  activeLessonId: string | null
  onSelectLesson: (lesson: Lesson) => void
  progress: number
  scrollable?: boolean
  isAdmin?: boolean
  onReorderChapters?: (reordered: Chapter[]) => void
  onReorderLessons?: (chapterId: string, reordered: Lesson[]) => void
  onAddChapter?: () => void
  onEditChapter?: (chapter: Chapter) => void
  onDeleteChapter?: (chapter: Chapter) => void
  onAddLesson?: (chapterId: string) => void
  onEditLesson?: (chapterId: string, lesson: Lesson) => void
  onDeleteLesson?: (chapterId: string, lesson: Lesson) => void
  onMoveLesson?: (lessonId: string, fromChapterId: string, toChapterId: string, newIndex: number) => void
}

function AdminSortableChapterItem({
  chapter,
  lessons,
  lessonIds,
  completedLessonIds,
  activeLessonId,
  onSelectLesson,
  onAddLesson,
  onEditChapter,
  onDeleteChapter,
  onEditLesson,
  onDeleteLesson,
}: {
  chapter: Chapter
  lessons: Lesson[]
  lessonIds: string[]
  completedLessonIds: Set<string>
  activeLessonId: string | null
  onSelectLesson: (lesson: Lesson) => void
  onAddLesson?: (chapterId: string) => void
  onEditChapter?: (chapter: Chapter) => void
  onDeleteChapter?: (chapter: Chapter) => void
  onEditLesson?: (chapterId: string, lesson: Lesson) => void
  onDeleteLesson?: (chapterId: string, lesson: Lesson) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: `chapter:${chapter.id}`,
  })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 999 : undefined,
  }

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={chapter.id}
      className={cn('w-full border-0 border-b border-[#F97316]/15 last:border-b-0', isDragging ? 'transition-none' : 'transition-transform duration-200')}
      {...attributes}
    >
      <div className="group flex w-full items-center min-h-[48px]">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none shrink-0 px-2 flex items-center self-stretch text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Kéo để sắp xếp chuyên đề"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 self-stretch flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <AccordionTrigger className="text-base font-bold px-1 py-2 w-full hover:no-underline min-w-0 gap-2 [&>svg]:shrink-0">
                <span className="truncate text-left min-w-0 flex-1">{chapter.title}</span>
              </AccordionTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[220px]">{chapter.title}</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 pr-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 cursor-pointer shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Sửa chuyên đề"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditChapter?.(chapter)
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Sửa chuyên đề</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 cursor-pointer shrink-0 text-destructive hover:text-destructive"
                aria-label="Xóa chuyên đề"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteChapter?.(chapter)
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Xóa chuyên đề</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <AccordionContent className="pb-0 pt-0">
        <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
          {lessons.map((lesson) => (
            <SortableLessonShell key={lesson.id} lesson={lesson} isAdmin>
              <div className="flex w-full items-center min-h-[48px] pr-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onSelectLesson(lesson)}
                      className={cn(
                        'flex items-center gap-2 flex-1 min-w-0 px-2 py-2 text-left text-sm hover:bg-sidebar-accent transition-colors rounded-md cursor-pointer',
                        activeLessonId === lesson.id && 'bg-sidebar-accent border-l-2 border-primary',
                      )}
                      aria-current={activeLessonId === lesson.id ? 'true' : undefined}
                    >
                      {completedLessonIds.has(lesson.id) ? (
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                      ) : activeLessonId === lesson.id ? (
                        <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px]">{lesson.title}</TooltipContent>
                </Tooltip>
              </div>
            </SortableLessonShell>
          ))}
        </SortableContext>
        <ChapterEndSentinel chapterId={chapter.id} />
        {onAddLesson && (
          <div className="px-3 pb-3 pt-1">
            <button
              type="button"
              onClick={() => onAddLesson(chapter.id)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-dashed border-[#F97316]/40 text-xs font-medium text-[#92400E]/50 hover:text-[#92400E] hover:border-[#F97316]/70 hover:bg-[#FFF7ED] transition-all duration-200 cursor-pointer group/add"
            >
              <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover/add:scale-110" />
              Thêm bài giảng
            </button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

function ChapterEndSentinel({ chapterId }: { chapterId: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `end:${chapterId}` })
  return (
    <div
      ref={setNodeRef}
      className={cn('h-3 w-full transition-all duration-150', isOver && 'h-6 bg-primary/10 rounded')}
    />
  )
}

function SortableLessonShell({
  lesson,
  isAdmin,
  children,
}: {
  lesson: Lesson
  isAdmin: boolean
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: `lesson:${lesson.id}`,
    disabled: !isAdmin,
  })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 999 : undefined,
  }
  return (
    <div ref={setNodeRef} style={style} className={cn('flex items-stretch border-b border-border/40 last:border-b-0', isDragging ? 'transition-none' : 'transition-transform duration-200')} {...attributes}>
      {isAdmin && (
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none shrink-0 px-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Kéo để sắp xếp bài học"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <div className="flex-1 min-w-0 flex items-center">{children}</div>
    </div>
  )
}

export default function LessonSidebar({
  chapters,
  lessonsByChapter,
  completedLessonIds,
  activeLessonId,
  onSelectLesson,
  progress,
  scrollable = true,
  isAdmin = false,
  onReorderChapters,
  onReorderLessons,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
}: LessonSidebarProps) {
  const chapterIds = chapters.map((c) => `chapter:${c.id}`)

  const accordion = (
    <Accordion type="multiple" defaultValue={chapters.map((c) => c.id)}>
      {isAdmin ? (
        <SortableContext items={chapterIds} strategy={verticalListSortingStrategy}>
          {chapters.map((chapter) => {
            const lessons = lessonsByChapter.get(chapter.id) ?? []
            const lessonIds = lessons.map((l) => `lesson:${l.id}`)
            return (
              <AdminSortableChapterItem
                key={chapter.id}
                chapter={chapter}
                lessons={lessons}
                lessonIds={lessonIds}
                completedLessonIds={completedLessonIds}
                activeLessonId={activeLessonId}
                onSelectLesson={onSelectLesson}
                onAddLesson={onAddLesson}
                onEditChapter={onEditChapter}
                onDeleteChapter={onDeleteChapter}
                onEditLesson={onEditLesson}
                onDeleteLesson={onDeleteLesson}
              />
            )
          })}
        </SortableContext>
      ) : (
        chapters.map((chapter) => (
          <Tooltip key={chapter.id}>
            <AccordionItem value={chapter.id}>
              <TooltipTrigger asChild>
                <AccordionTrigger className="text-base font-bold px-4 hover:no-underline min-w-0 gap-2 [&>svg]:shrink-0">
                  <span className="truncate text-left min-w-0 flex-1">{chapter.title}</span>
                </AccordionTrigger>
              </TooltipTrigger>
              <AccordionContent className="pb-0">
                {(lessonsByChapter.get(chapter.id) ?? []).map((lesson) => (
                  <Tooltip key={lesson.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onSelectLesson(lesson)}
                        className={cn(
                          'flex items-center gap-2 w-full px-4 py-3 min-h-[48px] text-left text-sm hover:bg-sidebar-accent transition-colors cursor-pointer',
                          activeLessonId === lesson.id && 'bg-sidebar-accent border-l-2 border-primary',
                        )}
                        aria-current={activeLessonId === lesson.id ? 'true' : undefined}
                      >
                        {completedLessonIds.has(lesson.id) ? (
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                        ) : activeLessonId === lesson.id ? (
                          <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[220px]">
                      {lesson.title}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </AccordionContent>
            </AccordionItem>
            <TooltipContent side="right" className="max-w-[220px]">
              {chapter.title}
            </TooltipContent>
          </Tooltip>
        ))
      )}
    </Accordion>
  )

  const body = (
    <>
      {!isAdmin && (
        <div className="px-4 py-4 border-b border-[#F97316]/20 shrink-0">
          <Progress
            value={progress}
            className="h-2 bg-[#FFEDD5] bm-progress-teal"
            aria-label={`Tiến độ hoàn thành: ${progress}%`}
          />
          <span className="text-sm text-muted-foreground mt-1 block">{progress}% hoàn thành</span>
        </div>
      )}
      <div
        className={
          scrollable
            ? 'flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : ''
        }
      >
        {accordion}
        {isAdmin && onAddChapter && (
          <div className="px-3 py-3 border-t border-[#F97316]/20">
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px] gap-1.5 border-[#F97316]/40 text-[#92400E] hover:bg-[#FFEDD5]/50 cursor-pointer"
              onClick={onAddChapter}
            >
              <Plus className="h-4 w-4" />
              Thêm chuyên đề
            </Button>
          </div>
        )}
      </div>
    </>
  )

  const rootClass = scrollable ? 'flex flex-col h-full' : 'flex flex-col'

  return <div className={rootClass}>{body}</div>
}
