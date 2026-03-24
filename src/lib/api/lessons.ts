import { supabase } from '@/lib/supabase'

export interface Lesson {
  id: string
  chapter_id: string
  title: string
  description: string | null
  video_url: string | null
  assignment_path: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export type LessonInsert = {
  chapter_id: string
  title: string
  order_index: number
  description?: string | null
  video_url?: string | null
  assignment_path?: string | null
}

export type LessonUpdate = Partial<
  Pick<Lesson, 'title' | 'description' | 'video_url' | 'assignment_path'>
>

const BUCKET = 'assignments'

// ─────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────

export async function fetchLessons(chapterId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data as Lesson[]
}

export async function insertLesson(payload: LessonInsert): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Lesson
}

export async function updateLesson(id: string, payload: LessonUpdate): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Lesson
}

export async function removeLesson(id: string): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw error
}

// ─────────────────────────────────────────────────────────────────
// Reorder
// ─────────────────────────────────────────────────────────────────

/**
 * Swaps the order_index of two lessons. Both updates are issued sequentially
 * (Supabase JS client does not support transactions).
 */
export async function reorderLessons(
  lessonA: Pick<Lesson, 'id' | 'order_index'>,
  lessonB: Pick<Lesson, 'id' | 'order_index'>,
): Promise<void> {
  const { error: errA } = await supabase
    .from('lessons')
    .update({ order_index: lessonB.order_index })
    .eq('id', lessonA.id)
  if (errA) throw errA

  const { error: errB } = await supabase
    .from('lessons')
    .update({ order_index: lessonA.order_index })
    .eq('id', lessonB.id)
  if (errB) throw errB
}

// ─────────────────────────────────────────────────────────────────
// Storage helpers (assignments bucket)
// ─────────────────────────────────────────────────────────────────

/**
 * Uploads a file to the assignments bucket.
 * Returns the storage path (suitable for storing in lessons.assignment_path).
 *
 * Path pattern: assignments/{lessonId}/{filename}
 * On create, pass a temporary unique prefix (e.g. Date.now()).
 */
export async function uploadAssignment(
  file: File,
  pathPrefix: string,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const safeName = `${Date.now()}.${ext}`
  const path = `${pathPrefix}/${safeName}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  return path
}

/**
 * Deletes a file from the assignments bucket by its storage path.
 * Silently succeeds if the path is null/empty.
 */
export async function deleteAssignment(path: string | null): Promise<void> {
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

/**
 * Returns the public URL for an assignment file.
 */
export function getAssignmentPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
