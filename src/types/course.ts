// TypeScript interfaces for the course management domain

export interface Course {
  id: string
  title: string
  description: string | null
  grade: number | null          // 7, 8, 9, or null for ôn thi chuyên
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  chapter_id: string
  title: string
  description: string | null
  video_url: string | null      // YouTube embed URL
  order_index: number
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
}

// Enriched types for UI consumption

export interface CourseWithChapters extends Course {
  chapters: ChapterWithLessons[]
}

export interface ChapterWithLessons extends Chapter {
  lessons: Lesson[]
}

// Input types for create / update operations

export type CourseInsert = Pick<Course, 'title'> &
  Partial<Pick<Course, 'description' | 'grade' | 'thumbnail_url'>>

export type CourseUpdate = Partial<CourseInsert>

export type ChapterInsert = Pick<Chapter, 'course_id' | 'title' | 'order_index'> &
  Partial<Pick<Chapter, 'description'>>

export type ChapterUpdate = Partial<Omit<ChapterInsert, 'course_id'>>

export type LessonInsert = Pick<Lesson, 'chapter_id' | 'title' | 'order_index'> &
  Partial<Pick<Lesson, 'description' | 'video_url'>>

export type LessonUpdate = Partial<Omit<LessonInsert, 'chapter_id'>>

export type EnrollmentInsert = Pick<Enrollment, 'user_id' | 'course_id'>
