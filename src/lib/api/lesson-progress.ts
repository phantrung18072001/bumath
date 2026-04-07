import { supabase } from '@/lib/supabase'

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
}

/**
 * Insert a completion record for a lesson. UNIQUE constraint prevents duplicates.
 */
export async function markLessonComplete(userId: string, lessonId: string): Promise<LessonProgress> {
  const { data, error } = await supabase
    .from('lesson_progress')
    .insert({ user_id: userId, lesson_id: lessonId })
    .select()
    .single()
  if (error) throw error
  return data as LessonProgress
}

/**
 * Get all completed lesson IDs for a user within a set of lesson IDs (one course).
 */
export async function getLessonProgress(userId: string, lessonIds: string[]): Promise<LessonProgress[]> {
  if (lessonIds.length === 0) return []
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('id, user_id, lesson_id, completed_at')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds)
  if (error) throw error
  return (data ?? []) as LessonProgress[]
}

/**
 * Compute course progress percentage from completed lessons vs total lessons.
 * Never stored in DB — always computed at render time.
 */
export function getCourseProgress(totalLessonIds: string[], completedLessonIds: Set<string>): number {
  if (totalLessonIds.length === 0) return 0
  const completed = totalLessonIds.filter(id => completedLessonIds.has(id)).length
  return Math.round((completed / totalLessonIds.length) * 100)
}
