import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Download, FileText, Loader2, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { data: materials = [], isLoading, isError } = useQuery({
    queryKey: ['standalone-study-materials'],
    queryFn: () => fetchStandaloneStudyMaterials(),
  })

  const filtered = materials.filter(m =>
    selectedGrade === 'all' || m.grade === selectedGrade
  )

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
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-orange-50/60 py-14 md:py-20 px-4">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-16 h-56 w-56 rounded-full bg-orange-200/30 blur-3xl" />

          <div className="container relative mx-auto max-w-5xl text-center">
            {/* Icon chip */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-bold text-primary shadow-sm mb-5">
              <BookOpen className="h-4 w-4" />
              Tài liệu miễn phí
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
              Tài liệu{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                học tập
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto">
              Tải miễn phí tài liệu PDF được biên soạn theo từng khối lớp — lớp 7, 8, 9 và ôn thi chuyên Toán.
            </p>

            {/* Material count chip */}
            {!isLoading && !isError && materials.length > 0 && (
              <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                <FileText className="h-3.5 w-3.5" />
                {materials.length} tài liệu
              </div>
            )}
          </div>
        </section>

        {/* Filter + Grid */}
        <section className="container mx-auto max-w-5xl px-4 py-10">
          {/* Grade filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
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

          {/* Empty state — grade filter */}
          {!isLoading && !isError && filtered.length === 0 && selectedGrade !== 'all' && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <SearchX className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-foreground">Không có tài liệu cho khối này</p>
              <p className="text-sm text-muted-foreground">Thử chọn khối lớp khác hoặc xem Tất cả</p>
              <button
                onClick={() => setSelectedGrade('all')}
                className="mt-1 text-sm font-bold text-primary hover:underline cursor-pointer"
              >
                Xem tất cả →
              </button>
            </div>
          )}

          {/* Empty state — no materials */}
          {!isLoading && !isError && filtered.length === 0 && selectedGrade === 'all' && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-primary/60" />
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
