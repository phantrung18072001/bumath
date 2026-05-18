import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileText, Loader2, Search, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { GRADE_BADGE } from '@/lib/constants/grades'
import {
  fetchStandaloneStudyMaterials,
  getStudyMaterialSignedUrl,
  type StudyMaterial,
  type StudyMaterialGrade,
} from '@/lib/api/study-materials'

const GRADE_FILTERS: { value: StudyMaterialGrade | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn thi chuyên' },
]

function GradeBadge({ grade }: { grade: StudyMaterialGrade }) {
  const { label, className } = GRADE_BADGE[grade] ?? GRADE_BADGE.grade_7
  return <Badge variant="secondary" className={className}>{label}</Badge>
}

function MaterialCard({ material, isDownloading, onDownload }: {
  material: StudyMaterial
  isDownloading: boolean
  onDownload: (m: StudyMaterial) => void
}) {
  return (
    <div className="bm-clay-card-student flex flex-col overflow-hidden">
      {/* Card top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/60" />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Icon + PDF chip row */}
        <div className="flex items-start justify-between gap-2">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-primary/70 bg-primary/8 border border-primary/20 rounded-md px-2 py-0.5 mt-0.5">
            PDF
          </span>
        </div>

        {/* Title */}
        <p className="text-sm font-bold leading-snug line-clamp-3 text-foreground flex-1">
          {material.title}
        </p>

        {/* Grade badge */}
        <GradeBadge grade={material.grade} />

        {/* Download button */}
        <Button
          className="bm-btn-cta w-full gap-2 mt-auto"
          disabled={isDownloading}
          onClick={() => onDownload(material)}
        >
          {isDownloading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Download className="h-4 w-4" />
          }
          {isDownloading ? 'Đang tải...' : 'Tải xuống'}
        </Button>
      </div>
    </div>
  )
}

export default function TaiLieuPage() {
  const [selectedGrade, setSelectedGrade] = useState<StudyMaterialGrade | 'all'>('all')
  const [search, setSearch] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { data: materials = [], isLoading, isError } = useQuery({
    queryKey: ['standalone-study-materials'],
    queryFn: () => fetchStandaloneStudyMaterials(),
  })

  const filtered = materials.filter(m => {
    const gradeMatch = selectedGrade === 'all' || m.grade === selectedGrade
    const searchMatch = !search.trim() || m.title.toLowerCase().includes(search.trim().toLowerCase())
    return gradeMatch && searchMatch
  })

  const handleDownload = async (material: StudyMaterial) => {
    setDownloadingId(material.id)
    try {
      const url = await getStudyMaterialSignedUrl(material.file_path)
      window.open(url, '_blank', 'noopener')
    } catch {
      toast.error('Không thể tải tài liệu. Vui lòng thử lại.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero — compact */}
        <section className="border-b border-border bg-muted/30 px-4 py-4">
          <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-xl font-bold leading-tight">Tài liệu học tập</h1>
            {!isLoading && !isError && materials.length > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary shrink-0">
                <FileText className="h-3.5 w-3.5" />
                {materials.length} tài liệu
              </div>
            )}
          </div>
        </section>

        {/* Filter + Grid */}
        <section className="container mx-auto max-w-5xl px-4 py-8">
          {/* Controls row: grade pills + search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Grade filter pills */}
            <div className="flex flex-wrap gap-2 flex-1">
              {GRADE_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setSelectedGrade(f.value)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-bold transition-all duration-150 cursor-pointer min-h-[40px] border',
                    selectedGrade === f.value
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                      : 'bg-white text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-primary/30',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Search input */}
            <div className="relative sm:w-56 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Tìm tài liệu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          {/* Skeleton loading */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <FileText className="h-7 w-7 text-destructive/70" />
              </div>
              <p className="text-base font-bold text-foreground">Không thể tải tài liệu</p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Đã xảy ra lỗi khi tải danh sách. Vui lòng thử lại sau.
              </p>
            </div>
          )}

          {/* Empty state — filtered zero results */}
          {!isLoading && !isError && filtered.length === 0 && (selectedGrade !== 'all' || search) && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <SearchX className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-foreground">Không tìm thấy tài liệu</p>
              <p className="text-sm text-muted-foreground">Thử từ khóa khác hoặc chọn khối lớp khác</p>
              <button
                onClick={() => { setSelectedGrade('all'); setSearch('') }}
                className="mt-1 text-sm font-bold text-primary hover:underline cursor-pointer"
              >
                Xem tất cả →
              </button>
            </div>
          )}

          {/* Empty state — no materials at all (no search/grade filter active) */}
          {!isLoading && !isError && filtered.length === 0 && selectedGrade === 'all' && !search && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center">
                <FileText className="h-7 w-7 text-primary/60" />
              </div>
              <p className="text-base font-bold text-foreground">Chưa có tài liệu nào</p>
              <p className="text-sm text-muted-foreground">Tài liệu đang được cập nhật. Vui lòng quay lại sau.</p>
            </div>
          )}

          {/* Card grid */}
          {!isLoading && !isError && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isDownloading={downloadingId === material.id}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
