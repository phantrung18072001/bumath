import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
        <section className="bg-white py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold mb-2">Tài liệu học tập</h1>
            <p className="text-sm text-muted-foreground">
              Tải miễn phí tài liệu PDF theo từng khối lớp
            </p>
          </div>
        </section>

        {/* Filter + Grid */}
        <section className="container mx-auto max-w-5xl px-4 py-8">
          {/* Grade filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {GRADE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setSelectedGrade(f.value)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-bold transition-colors duration-150 cursor-pointer min-h-[40px] border',
                  selectedGrade === f.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground',
                ].join(' ')}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Skeleton loading */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-16">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-base font-bold text-foreground mb-1">Không thể tải tài liệu</p>
              <p className="text-sm text-muted-foreground">
                Không thể tải danh sách tài liệu. Vui lòng thử lại sau.
              </p>
            </div>
          )}

          {/* Empty state — grade filter zero results */}
          {!isLoading && !isError && filtered.length === 0 && selectedGrade !== 'all' && (
            <div className="text-center py-16">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-base font-bold text-foreground mb-1">
                Không có tài liệu cho khối này
              </p>
              <p className="text-sm text-muted-foreground">
                Thử chọn khối lớp khác hoặc xem Tất cả
              </p>
            </div>
          )}

          {/* Empty state — no materials at all */}
          {!isLoading && !isError && filtered.length === 0 && selectedGrade === 'all' && (
            <div className="text-center py-16">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-base font-bold text-foreground mb-1">Chưa có tài liệu nào</p>
              <p className="text-sm text-muted-foreground">
                Tài liệu đang được cập nhật. Vui lòng quay lại sau.
              </p>
            </div>
          )}

          {/* Card grid */}
          {!isLoading && !isError && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(material => {
                const isDownloading = downloadingId === material.id
                return (
                  <Card key={material.id} className="bm-clay-card-student">
                    <CardContent className="p-6 flex flex-col gap-3">
                      {/* PDF icon */}
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      {/* Title */}
                      <p className="text-base line-clamp-2">{material.title}</p>
                      {/* Grade badge */}
                      <GradeBadge grade={material.grade} />
                      {/* Download button */}
                      <Button
                        className="bm-btn-cta w-full gap-2 mt-auto"
                        disabled={isDownloading}
                        onClick={() => handleDownload(material)}
                      >
                        {isDownloading
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Download className="h-4 w-4" />
                        }
                        Tải xuống
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
