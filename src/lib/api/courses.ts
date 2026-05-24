import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url?: string | null
  target_grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
  is_published: boolean
  is_outstanding?: boolean   // Phase 19: Tứ trụ specialist course flag (NAV-02, D-09)
  created_at: string
  updated_at: string
}

export type CourseInsert = Pick<Course, 'title' | 'description' | 'target_grade' | 'thumbnail_url'>
export type CourseUpdate = Partial<CourseInsert>

const COURSE_THUMBNAIL_BUCKET = 'assignments'

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

export async function uploadCourseThumbnail(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const random = Math.random().toString(36).slice(2, 8)
  const path = `course-thumbnails/${Date.now()}-${random}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from(COURSE_THUMBNAIL_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from(COURSE_THUMBNAIL_BUCKET).getPublicUrl(path)
  return data.publicUrl
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

export interface CoursesFilter {
  page: number
  pageSize: number
  grade: 'all' | Course['target_grade']
  search: string
}

export interface PaginatedCourses {
  data: Course[]
  total: number
}

/**
 * Fetch courses with server-side filtering and pagination.
 * Uses Supabase .range() for pagination and .eq()/.ilike() for filters.
 * Per D-01: replaces client-side filter/slice pattern in CoursesPage.
 */
export async function fetchCoursesPaginated(
  params: CoursesFilter
): Promise<PaginatedCourses> {
  const { page, pageSize, grade, search } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('courses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (grade !== 'all') {
    query = query.eq('target_grade', grade)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return {
    data: (data ?? []) as Course[],
    total: count ?? 0,
  }
}
