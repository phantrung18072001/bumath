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
  course: Pick<Course, 'id' | 'title' | 'target_grade'>
}

export async function getUserEnrollments(userId: string): Promise<EnrollmentWithCourse[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, enrolled_at, course:courses(id, title, target_grade)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as EnrollmentWithCourse[]
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
