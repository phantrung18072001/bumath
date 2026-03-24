import { supabase } from '@/lib/supabase'

export interface Chapter {
  id: string
  course_id: string
  title: string
  order_index: number
  created_at: string
  updated_at: string
}

export type ChapterInsert = Pick<Chapter, 'course_id' | 'title' | 'order_index'>
export type ChapterUpdate = Partial<Pick<Chapter, 'title'>>

export async function fetchChapters(courseId: string): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data as Chapter[]
}

export async function insertChapter(payload: ChapterInsert): Promise<Chapter> {
  const { data, error } = await supabase
    .from('chapters')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Chapter
}

export async function updateChapter(id: string, payload: ChapterUpdate): Promise<Chapter> {
  const { data, error } = await supabase
    .from('chapters')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Chapter
}

export async function removeChapter(id: string): Promise<void> {
  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', id)
  if (error) throw error
}

/**
 * Swaps the order_index of two chapters. Both updates are issued sequentially
 * (Supabase JS client does not support transactions, so we use two updates).
 */
export async function reorderChapters(
  chapterA: Pick<Chapter, 'id' | 'order_index'>,
  chapterB: Pick<Chapter, 'id' | 'order_index'>,
): Promise<void> {
  const { error: errA } = await supabase
    .from('chapters')
    .update({ order_index: chapterB.order_index })
    .eq('id', chapterA.id)
  if (errA) throw errA

  const { error: errB } = await supabase
    .from('chapters')
    .update({ order_index: chapterA.order_index })
    .eq('id', chapterB.id)
  if (errB) throw errB
}
