import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Eye, FileText, Loader2, Search, SearchX, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { GRADE_BADGE } from '@/lib/constants/grades'
import {
  fetchStandaloneStudyMaterials,
  getStudyMaterialSignedUrl,
  type StudyMaterial,
  type StudyMaterialGrade,
} from '@/lib/api/study-materials'
import { cn } from '@/lib/utils'

const GRADE_FILTERS: { value: StudyMaterialGrade | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn chuyên' },
]

function materialThumbnail(material: StudyMaterial, thumbnailUrl?: string): string {
  if (thumbnailUrl) return thumbnailUrl
  return `https://picsum.photos/seed/${material.id}/800/500`
}

export default function TaiLieuPage() {
  const [selectedGrade, setSelectedGrade] = useState<StudyMaterialGrade | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const {
    data: materials = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['standalone-study-materials'],
    queryFn: () => fetchStandaloneStudyMaterials(),
  })

  const { data: thumbnailUrls = {} } = useQuery({
    queryKey: ['standalone-study-material-thumbnails', materials.map((m) => m.id).join('|')],
    enabled: materials.length > 0,
    queryFn: async () => {
      const entries = await Promise.all(
        materials
          .filter((m) => !!m.thumbnail_path)
          .map(async (m) => {
            const url = await getStudyMaterialSignedUrl(m.thumbnail_path!)
            return [m.id, url] as const
          }),
      )
      return Object.fromEntries(entries) as Record<string, string>
    },
  })

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const gradeMatch = selectedGrade === 'all' || m.grade === selectedGrade
      const searchMatch = m.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
      return gradeMatch && searchMatch
    })
  }, [materials, searchQuery, selectedGrade])

  async function handlePreview(material: StudyMaterial) {
    try {
      setPreviewingId(material.id)
      const url = await getStudyMaterialSignedUrl(material.file_path)
      window.open(url, '_blank', 'noopener')
    } catch {
      toast.error('Không thể xem trước tài liệu. Vui lòng thử lại.')
    } finally {
      setPreviewingId(null)
    }
  }

  async function handleDownload(material: StudyMaterial) {
    try {
      setDownloadingId(material.id)
      const url = await getStudyMaterialSignedUrl(material.file_path)
      const response = await fetch(url)
      if (!response.ok) throw new Error('download_failed')
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const ext = material.file_path.split('.').pop() ?? 'pdf'
      const safeName = material.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const filename = `${safeName || 'tai-lieu'}.${ext}`
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch {
      toast.error('Không thể tải xuống tài liệu. Vui lòng thử lại.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="app-student min-h-[100dvh] bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="relative mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 md:py-8">
          <section className="border-b border-slate-200 pb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Tài liệu học tập</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Kho tài liệu BuMath</h1>
            <p className="mt-2 text-sm text-slate-600">Tổng hợp tài liệu PDF theo khối lớp và chương trình học.</p>
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-4 backdrop-blur-sm md:p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  <Search className="h-3.5 w-3.5" />
                  Tìm kiếm
                </span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm tài liệu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white pl-9 text-slate-900 focus-visible:border-sky-500 focus-visible:ring-sky-500"
                    aria-label="Tìm kiếm tài liệu"
                  />
                </div>
              </label>

              <div className="space-y-2">
                <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Bộ lọc theo lớp
                </span>
                <div className="flex flex-wrap gap-2">
                  {GRADE_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setSelectedGrade(f.value)}
                      className={cn(
                        'min-h-[38px] rounded-full border px-4 text-sm font-medium transition-colors',
                        selectedGrade === f.value
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {isError && (
            <p className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-center text-rose-700">
              Không thể tải dữ liệu. Vui lòng thử lại.
            </p>
          )}

          {isLoading && (
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && !isError && materials.length === 0 && (
            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
              <FileText className="h-10 w-10 text-slate-400" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">Chưa có tài liệu nào</h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">Tài liệu đang được cập nhật. Vui lòng quay lại sau.</p>
            </div>
          )}

          {!isLoading && !isError && materials.length > 0 && filteredMaterials.length === 0 && (
            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
              <SearchX className="h-10 w-10 text-slate-400" aria-hidden="true" />
              <p className="mt-4 text-lg font-medium text-slate-900">Không tìm thấy kết quả</p>
              <p className="mt-2 max-w-md text-sm text-slate-600">Thử thay đổi từ khóa hoặc chọn lớp khác.</p>
            </div>
          )}

          {!isLoading && !isError && filteredMaterials.length > 0 && (
            <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => {
                const badge = GRADE_BADGE[material.grade] ?? GRADE_BADGE.grade_7
                const isPreviewing = previewingId === material.id
                const isDownloading = downloadingId === material.id

                return (
                  <article key={material.id} className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="relative h-40 w-full overflow-hidden border-b border-slate-100 bg-slate-100">
                      <img
                        src={materialThumbnail(material, thumbnailUrls[material.id])}
                        alt={material.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <Badge className={badge.className}>{badge.label}</Badge>
                      </div>

                      <h3 className="text-base font-semibold tracking-tight text-slate-950 line-clamp-2 min-h-[3rem]">
                        {material.title}
                      </h3>

                      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="min-h-[42px] rounded-lg"
                          onClick={() => handlePreview(material)}
                          disabled={isPreviewing || isDownloading}
                        >
                          {isPreviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                          <span className="ml-1">Xem trước</span>
                        </Button>
                        <Button
                          type="button"
                          className="min-h-[42px] rounded-lg bg-slate-900 hover:bg-slate-800"
                          onClick={() => handleDownload(material)}
                          disabled={isPreviewing || isDownloading}
                        >
                          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          <span className="ml-1">Tải xuống</span>
                        </Button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
