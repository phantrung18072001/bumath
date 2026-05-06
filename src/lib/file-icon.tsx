import { ImageIcon, FileText, File } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'avif', 'gif'])
const PDF_EXTS = new Set(['pdf'])

export function getFileIcon(name: string): { Icon: LucideIcon; colorClass: string; label: string } {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (IMAGE_EXTS.has(ext)) return { Icon: ImageIcon, colorClass: 'text-blue-400', label: ext.toUpperCase() }
  if (PDF_EXTS.has(ext)) return { Icon: FileText, colorClass: 'text-red-400', label: 'PDF' }
  return { Icon: File, colorClass: 'text-muted-foreground', label: ext.toUpperCase() || 'FILE' }
}
