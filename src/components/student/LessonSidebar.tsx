import { cn } from '@/lib/utils'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Check, ChevronRight, Circle } from 'lucide-react'
import type { Chapter } from '@/lib/api/chapters'
import type { Lesson } from '@/lib/api/lessons'

interface LessonSidebarProps {
  chapters: Chapter[]
  lessonsByChapter: Map<string, Lesson[]>
  completedLessonIds: Set<string>
  activeLessonId: string | null
  onSelectLesson: (lesson: Lesson) => void
  progress: number  // 0-100
  scrollable?: boolean  // true on desktop, false on mobile (let page scroll)
}

export default function LessonSidebar({
  chapters,
  lessonsByChapter,
  completedLessonIds,
  activeLessonId,
  onSelectLesson,
  progress,
  scrollable = true,
}: LessonSidebarProps) {
  return (
    <div className={scrollable ? 'flex flex-col h-full' : 'flex flex-col'}>
      {/* Progress header */}
      <div className="px-4 py-4 border-b border-sidebar-border shrink-0">
        <Progress
          value={progress}
          className="h-2"
          aria-label={`Tiến độ hoàn thành: ${progress}%`}
        />
        <span className="text-sm text-muted-foreground mt-1 block">{progress}% hoàn thành</span>
      </div>

      {/* Lesson list */}
      <div className={scrollable ? 'flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : ''}>
        <Accordion type="multiple" defaultValue={chapters.map(c => c.id)}>
          {chapters.map(chapter => (
            <AccordionItem key={chapter.id} value={chapter.id}>
              <AccordionTrigger className="text-sm font-semibold px-4">
                {chapter.title}
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                {(lessonsByChapter.get(chapter.id) ?? []).map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    className={cn(
                      'flex items-center gap-2 w-full px-4 py-3 min-h-[48px] text-left text-base hover:bg-sidebar-accent transition-colors',
                      activeLessonId === lesson.id && 'bg-sidebar-accent border-l-2 border-primary',
                    )}
                    aria-current={activeLessonId === lesson.id ? 'true' : undefined}
                  >
                    {completedLessonIds.has(lesson.id)
                      ? <Check className="h-4 w-4 text-green-600 shrink-0" />
                      : activeLessonId === lesson.id
                        ? <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                        : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
