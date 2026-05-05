import { supabase } from '@/lib/supabase'

export interface Lesson {
  id: string
  chapter_id: string
  title: string
  description: string | null
  video_url: string | null
  /** Only present when fetched via lessons_view (student pages). True = teacher set a video; false = no video set. */
  has_video?: boolean
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

export async function moveLessonToChapter(
  lessonId: string,
  toChapterId: string,
  orderIndex: number,
): Promise<void> {
  const { error } = await supabase
    .from('lessons')
    .update({ chapter_id: toChapterId, order_index: orderIndex })
    .eq('id', lessonId)
  if (error) throw error
}

export async function removeLesson(id: string): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw error
}

// ─────────────────────────────────────────────────────────────────
// Reorder
// ─────────────────────────────────────────────────────────────────

/**
 * Batch-update order_index for all lessons after drag-and-drop reorder.
 * Only updates items whose order_index actually changed.
 * @param updates Array of {id, order_index} representing new positions
 */
export async function batchReorderLessons(
  updates: { id: string; order_index: number }[]
): Promise<void> {
  for (const { id, order_index } of updates) {
    const { error } = await supabase
      .from('lessons')
      .update({ order_index })
      .eq('id', id)
    if (error) throw error
  }
}

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
 * Parses assignment_path which may be a JSON array (multi-file) or a plain
 * string (legacy single-file). Always returns a string[].
 */
export function parseAssignmentPaths(path: string | null | undefined): string[] {
  if (!path) return []
  try {
    const parsed = JSON.parse(path)
    if (Array.isArray(parsed)) return parsed.filter(Boolean)
  } catch {
    // legacy single path
  }
  return [path]
}

/**
 * Uploads a single file to the assignments bucket.
 * Uses a timestamp+random suffix to avoid name collisions.
 */
export async function uploadAssignment(
  file: File,
  pathPrefix: string,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const baseName = file.name.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9._-]/g, '_')
  const suffix = Math.random().toString(36).slice(2, 6)
  const safeName = `${baseName}-${suffix}.${ext}`
  const path = `${pathPrefix}/${safeName}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  return path
}

/**
 * Deletes one or more files from the assignments bucket.
 * Accepts either a single path string or a JSON-encoded array of paths.
 * Silently succeeds if path is null/empty.
 */
export async function deleteAssignment(path: string | null): Promise<void> {
  const paths = parseAssignmentPaths(path)
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw error
}

/**
 * Returns the public URL for an assignment file path.
 */
export function getAssignmentPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Returns public URLs for all files in assignment_path (multi or legacy single).
 */
export function getAssignmentPublicUrls(path: string | null): string[] {
  return parseAssignmentPaths(path).map(getAssignmentPublicUrl)
}

// ─────────────────────────────────────────────────────────────────
// Student view (access-controlled)
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch lessons for student view — reads from `lessons_view` (security view).
 * video_url is masked to NULL by RLS when the student has no matching package.
 * has_video reflects the true DB state (not masked) — use it to distinguish
 * "no video set" (has_video=false) from "access denied" (has_video=true, video_url=null).
 * Use this in student-facing pages instead of fetchLessons (PRICE-03).
 */
export async function fetchLessonsForStudent(chapterId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons_view')
    .select('id, chapter_id, title, description, video_url, has_video, assignment_path, order_index, created_at, updated_at')
    .eq('chapter_id', chapterId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data as Lesson[]
}
