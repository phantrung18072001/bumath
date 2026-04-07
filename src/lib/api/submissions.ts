import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'

export interface Submission {
  id: string
  user_id: string
  lesson_id: string
  file_path: string
  submitted_at: string
  status: 'submitted' | 'graded'
  score: number | null
  comment: string | null
}

const BUCKET = 'submissions'

/**
 * Compress an image file to <500KB JPEG. Handles HEIC conversion transparently (D-17).
 * Throws 'IMAGE_TOO_LARGE' if still >500KB after compression.
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
  }
  try {
    const compressed = await imageCompression(file, options)
    if (compressed.size > 512_000) {
      throw new Error('IMAGE_TOO_LARGE')
    }
    return compressed as File
  } catch (err) {
    // Fallback for HEIC on older iOS: try heic2any first, then compress
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
      const heic2any = (await import('heic2any')).default
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 }) as Blob
      const jpegFile = new File([converted], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' })
      const compressed = await imageCompression(jpegFile, options)
      if (compressed.size > 512_000) {
        throw new Error('IMAGE_TOO_LARGE')
      }
      return compressed as File
    }
    throw err
  }
}

/**
 * Upload a compressed image to Supabase Storage and insert a submission record.
 * Storage path: submissions/{userId}/{lessonId}/{timestamp}.jpg
 */
export async function uploadSubmission(
  userId: string,
  lessonId: string,
  compressedFile: File,
): Promise<Submission> {
  const path = `${userId}/${lessonId}/${Date.now()}.jpg`

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressedFile, {
      contentType: 'image/jpeg',
      upsert: false,
    })
  if (storageError) throw storageError

  const { data, error } = await supabase
    .from('submissions')
    .insert({ user_id: userId, lesson_id: lessonId, file_path: path })
    .select()
    .single()
  if (error) throw error
  return data as Submission
}

/**
 * Get the submission for a specific user + lesson pair. Returns null if not submitted.
 */
export async function getSubmission(userId: string, lessonId: string): Promise<Submission | null> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()
  if (error) throw error
  return data as Submission | null
}

/**
 * Get all submissions for a user across multiple lessons (batch query for course view).
 */
export async function getSubmissions(userId: string, lessonIds: string[]): Promise<Submission[]> {
  if (lessonIds.length === 0) return []
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds)
  if (error) throw error
  return (data ?? []) as Submission[]
}

/**
 * Create a signed URL to view a submitted image (private bucket).
 * TTL: 1 hour.
 */
export async function getSubmissionSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}
