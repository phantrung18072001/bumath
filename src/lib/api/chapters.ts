import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

export interface Chapter {
  id: string
  course_id: string
  title: string
  slug: string
  order_index: number
  created_at: string
  updated_at: string
}

export type ChapterInsert = Pick<Chapter, 'course_id' | 'title' | 'order_index'>
export type ChapterUpdate = Partial<Pick<Chapter, 'title'>>

/** Returns a slug unique within the given course. */
async function generateUniqueChapterSlug(
  courseId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const { data } = await supabase
    .from('chapters')
    .select('id, slug')
    .eq('course_id', courseId)
    .like('slug', `${base}%`)
  const existing = new Set(
    (data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug),
  )
  if (!existing.has(base)) return base
  let i = 2
  while (existing.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

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
  const slug = await generateUniqueChapterSlug(
    payload.course_id,
    slugify(payload.title),
  )
  const { data, error } = await supabase
    .from('chapters')
    .insert({ ...payload, slug })
    .select()
    .single()
  if (error) throw error
  return data as Chapter
}

export async function updateChapter(id: string, payload: ChapterUpdate): Promise<Chapter> {
  const updatePayload: ChapterUpdate & { slug?: string } = { ...payload }
  if (payload.title) {
    // Fetch current chapter to scope uniqueness to correct course
    const { data: current } = await supabase
      .from('chapters')
      .select('course_id')
      .eq('id', id)
      .single()
    if (current) {
      const base = slugify(payload.title)
      updatePayload.slug = await generateUniqueChapterSlug(current.course_id, base, id)
    }
  }
  const { data, error } = await supabase
    .from('chapters')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Chapter
}

export async function removeChapter(id: string): Promise<void> {
  const { error } = await supabase.from('chapters').delete().eq('id', id)
  if (error) throw error
}

/**
 * Swaps the order_index of two chapters.
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
