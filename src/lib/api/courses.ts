import { supabase } from '@/lib/supabase'

export interface Course {
  id: string
  title: string
  description: string | null
  target_grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
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

export async function insertCourse(payload: CourseInsert): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Course
}

export async function updateCourse(id: string, payload: CourseUpdate): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Course
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
  if (error) throw error
}
