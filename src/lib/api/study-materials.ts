import { supabase } from '@/lib/supabase'

export interface StudyMaterial {
  id: string
  lesson_id: string | null
  title: string
  file_path: string
  thumbnail_path: string | null
  file_type: 'pdf' | 'image'
  category: 'giua_ky' | 'cuoi_ky' | 'vao_10' | 'hsg' | 'chuyen_toan' | null
  grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
  created_by: string | null
  created_at: string
}

export type StudyMaterialCategory = StudyMaterial['category']
export type StudyMaterialGrade = StudyMaterial['grade']

export const CATEGORY_LABELS: Record<StudyMaterialCategory, string> = {
  giua_ky: 'Giữa kỳ',
  cuoi_ky: 'Cuối kỳ',
  vao_10: 'Vào 10',
  hsg: 'HSG',
  chuyen_toan: 'Chuyên toán',
}

export const GRADE_LABELS: Record<StudyMaterialGrade, string> = {
  grade_7: 'Lớp 7',
  grade_8: 'Lớp 8',
  grade_9: 'Lớp 9',
  advanced: 'Ôn thi chuyên',
}

const BUCKET = 'study-materials'

/**
 * Fetch all study materials for a lesson.
 * RLS automatically filters rows by has_grade_access(grade) for students.
 * Admin sees all rows for the lesson.
 */
export async function fetchStudyMaterials(lessonId: string): Promise<StudyMaterial[]> {
  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as StudyMaterial[]
}

/**
 * Detect file_type from MIME type.
 */
function detectFileType(file: File): StudyMaterial['file_type'] {
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type.startsWith('image/')) return 'image'
  return 'pdf'
}

/**
 * Upload a file to the study-materials bucket and insert a row.
 * Admin only (enforced by RLS + Storage policy).
 * Path: {lessonId}/{timestamp}-{random}.{ext}
 */
export async function uploadStudyMaterial(
  lessonId: string,
  file: File,
  meta: {
    title: string
    category: StudyMaterialCategory
    grade: StudyMaterialGrade
  },
): Promise<StudyMaterial> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 6)
  const path = `${lessonId}/${timestamp}-${random}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('study_materials')
    .insert({
      lesson_id: lessonId,
      title: meta.title,
      file_path: path,
      file_type: detectFileType(file),
      category: meta.category,
      grade: meta.grade,
    })
    .select()
    .single()
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {})
    throw error
  }
  return data as StudyMaterial
}

/**
 * Delete a study material row and its storage file.
 * Admin only (enforced by RLS + Storage policy).
 */
export async function deleteStudyMaterial(id: string, filePath: string): Promise<void> {
  const { error } = await supabase.from('study_materials').delete().eq('id', id)
  if (error) throw error
  await supabase.storage.from(BUCKET).remove([filePath]).catch(() => {})
}

/**
 * Delete a study material row and its storage file + optional thumbnail.
 */
export async function deleteStandaloneStudyMaterial(
  id: string,
  filePath: string,
  thumbnailPath?: string | null,
): Promise<void> {
  const { error } = await supabase.from('study_materials').delete().eq('id', id)
  if (error) throw error
  const paths = [filePath]
  if (thumbnailPath) paths.push(thumbnailPath)
  await supabase.storage.from(BUCKET).remove(paths).catch(() => {})
}

/**
 * Generate a signed URL for a study material file. TTL: 1 hour.
 */
export async function getStudyMaterialSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600)
  if (error) throw error
  return data.signedUrl
}

/**
 * Generate signed URLs for multiple study materials in parallel.
 */
export async function getStudyMaterialSignedUrls(
  materials: StudyMaterial[],
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    materials.map(async (m) => {
      const url = await getStudyMaterialSignedUrl(m.file_path)
      return [m.id, url] as [string, string]
    }),
  )
  return Object.fromEntries(entries)
}

/**
 * Fetch all standalone study materials (lesson_id IS NULL).
 * Public — anon SELECT policy added in migration 28.
 * Optionally filter by grade.
 */
export async function fetchStandaloneStudyMaterials(
  grade?: StudyMaterialGrade,
): Promise<StudyMaterial[]> {
  let query = supabase
    .from('study_materials')
    .select('*')
    .is('lesson_id', null)
    .order('created_at', { ascending: false })

  if (grade) {
    query = query.eq('grade', grade)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as StudyMaterial[]
}

/**
 * Upload a standalone study material (no lesson).
 * Path: standalone/{timestamp}-{random}.{ext}
 * Admin + teacher only (enforced by RLS + Storage policies in migration 28).
 */
export async function uploadStandaloneStudyMaterial(
  file: File,
  meta: { title: string; grade: StudyMaterialGrade },
  thumbnailFile?: File | null,
): Promise<StudyMaterial> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 6)
  const path = `standalone/${timestamp}-${random}.${ext}`
  let thumbnailPath: string | null = null

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError

  if (thumbnailFile) {
    const thumbExt = thumbnailFile.name.split('.').pop() ?? 'jpg'
    thumbnailPath = `standalone/thumbnails/${timestamp}-${random}.${thumbExt}`
    const { error: uploadThumbError } = await supabase.storage
      .from(BUCKET)
      .upload(thumbnailPath, thumbnailFile, { contentType: thumbnailFile.type, upsert: false })
    if (uploadThumbError) {
      await supabase.storage.from(BUCKET).remove([path]).catch(() => {})
      throw uploadThumbError
    }
  }

  const { data, error } = await supabase
    .from('study_materials')
    .insert({
      lesson_id: null,
      title: meta.title,
      file_path: path,
      thumbnail_path: thumbnailPath,
      file_type: detectFileType(file),
      category: null,
      grade: meta.grade,
    })
    .select()
    .single()
  if (error) {
    const cleanupPaths = [path]
    if (thumbnailPath) cleanupPaths.push(thumbnailPath)
    await supabase.storage.from(BUCKET).remove(cleanupPaths).catch(() => {})
    throw error
  }
  return data as StudyMaterial
}
