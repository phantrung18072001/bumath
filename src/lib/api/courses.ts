import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  target_grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
  is_published: boolean
  created_at: string
  updated_at: string
}

export type CourseInsert = Pick<Course, 'title' | 'description' | 'target_grade'>
export type CourseUpdate = Partial<CourseInsert>

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Course[]
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data as Course | null
}

/** Returns a slug that is guaranteed unique among all courses.
 *  Excludes `excludeId` from the conflict check (pass when updating an existing course). */
async function generateUniqueCourseSlug(base: string, excludeId?: string): Promise<string> {
  const { data } = await supabase
    .from('courses')
    .select('id, slug')
    .like('slug', `${base}%`)
  const existing = new Set(
    (data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug),
  )
  if (!existing.has(base)) return base
  let i = 2
  while (existing.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

export async function insertCourse(payload: CourseInsert): Promise<Course> {
  const slug = await generateUniqueCourseSlug(slugify(payload.title))
  const { data, error } = await supabase
    .from('courses')
    .insert({ ...payload, slug })
    .select()
    .single()
  if (error) throw error
  return data as Course
}

export async function updateCourse(id: string, payload: CourseUpdate): Promise<Course> {
  const updatePayload: CourseUpdate & { slug?: string } = { ...payload }
  if (payload.title) {
    const base = slugify(payload.title)
    updatePayload.slug = await generateUniqueCourseSlug(base, id)
  }
  const { data, error } = await supabase
    .from('courses')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Course
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}

/**
 * Fetch all courses for the student catalogue view.
 * Requires RLS migration 20260428_13_catalogue_rls.sql to be applied.
 * Orders by target_grade for consistent grouping in UI.
 * RLS enforces is_published = true for non-admin users.
 */
export async function fetchAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('target_grade', { ascending: true })
  if (error) throw error
  return data as Course[]
}

/** Toggle published state of a course. Admin only (enforced by RLS). */
export async function publishCourse(id: string, isPublished: boolean): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .update({ is_published: isPublished })
    .eq('id', id)
  if (error) throw error
}
