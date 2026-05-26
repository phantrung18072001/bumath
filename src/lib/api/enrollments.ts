import { supabase } from '@/lib/supabase'
import { Course } from '@/lib/api/courses'

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
}

// Enrollment enriched with course metadata for display
export interface EnrollmentWithCourse extends Enrollment {
  course: Pick<Course, 'id' | 'title' | 'slug' | 'target_grade' | 'description'> | null
}

export async function getUserEnrollments(userId: string): Promise<EnrollmentWithCourse[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, enrolled_at, course:courses(id, title, slug, target_grade, description)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as EnrollmentWithCourse[]
}

export async function getUserEnrollmentsPaginated(params: {
  userId: string
  page: number
  pageSize: number
  search?: string
}): Promise<{ data: EnrollmentWithCourse[]; total: number }> {
  const { userId, page, pageSize, search = '' } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('enrollments')
    .select('id, user_id, course_id, enrolled_at, course:courses!inner(id, title, slug, target_grade, description)', { count: 'exact' })
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })
    .range(from, to)

  if (search.trim()) {
    const q = search.trim()
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%`,
      { foreignTable: 'courses' }
    )
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as unknown as EnrollmentWithCourse[], total: count ?? 0 }
}

export async function addEnrollment(userId: string, courseId: string): Promise<Enrollment> {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })
    .select()
    .single()
  if (error) throw error
  return data as Enrollment
}

export async function removeEnrollment(enrollmentId: string): Promise<void> {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId)
  if (error) throw error
}
