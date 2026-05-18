---
phase: 21-tai-lieu-page
plan: P02
type: execute
wave: 2
depends_on: [21-P01]
files_modified:
  - src/pages/TaiLieuPage.tsx
autonomous: true
requirements:
  - MAT-02
  - MAT-03

must_haves:
  truths:
    - "Public users (no login) can browse standalone study materials at /tai-lieu"
    - "Grade filter pills show Tất cả / Lớp 7 / Lớp 8 / Lớp 9 / Ôn thi chuyên"
    - "Filtering is client-side — no re-fetch on grade change"
    - "Each card shows: title (2-line clamp), grade badge, FileText icon, orange Tải xuống button"
    - "Download generates signed URL → window.open(_blank, noopener)"
    - "Download button shows Loader2 spinner per-card while loading"
    - "6 skeleton cards shown while data loads"
    - "Empty state shown when no materials match selected grade"
    - "Error state shown when fetch fails"
  artifacts:
    - path: "src/pages/TaiLieuPage.tsx"
      provides: "Public /tai-lieu page with grade filter + card grid + download"
      exports: ["default TaiLieuPage"]
      min_lines: 120
  key_links:
    - from: "src/pages/TaiLieuPage.tsx"
      to: "fetchStandaloneStudyMaterials"
      via: "useQuery(['standalone-study-materials'])"
      pattern: "standalone-study-materials"
    - from: "TaiLieuPage download handler"
      to: "getStudyMaterialSignedUrl"
      via: "handleDownload async function"
      pattern: "getStudyMaterialSignedUrl"
    - from: "TaiLieuPage"
      to: "window.open"
      via: "window.open(url, '_blank', 'noopener')"
      pattern: "_blank.*noopener"
---

<objective>
Build `src/pages/TaiLieuPage.tsx` — the public `/tai-lieu` page where anyone can browse and download study materials filtered by grade.

Purpose: Delivers MAT-02 (public access) and MAT-03 (grade filter). No login required per D-01.
Output: `TaiLieuPage.tsx` — standalone React page with Header/Footer shell, grade filter pills, 3-col card grid, per-card download handler.
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/21-tai-lieu-page/21-CONTEXT.md
@.planning/phases/21-tai-lieu-page/21-UI-SPEC.md
@.planning/phases/21-tai-lieu-page/21-PATTERNS.md
@.planning/phases/21-tai-lieu-page/21-P01-SUMMARY.md

<interfaces>
<!-- Patterns extracted from analog files — executor does NOT need to re-read these -->

From src/pages/GioiThieu.tsx — public page outer shell:
```tsx
const GioiThieu = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* sections */}
      </main>
      <Footer />
    </div>
  );
};
export default GioiThieu;
```

From src/pages/student/CataloguePage.tsx — grade filter pills (verified pattern):
```tsx
const GRADE_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn thi chuyên' },
]
// Render:
<div className="flex flex-wrap gap-2 mt-3 mb-6">
  {GRADE_FILTERS.map(f => (
    <button
      key={f.value}
      onClick={() => setSelectedGrade(f.value)}
      className={[
        'rounded-full px-4 py-2 text-sm font-bold transition-colors duration-150 cursor-pointer min-h-[44px] border',
        selectedGrade === f.value
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground',
      ].join(' ')}
    >{f.label}</button>
  ))}
</div>
```

From src/pages/admin/CoursesPage.tsx — GradeBadge helper:
```tsx
function GradeBadge({ grade }) {
  const { label, className } = GRADE_BADGE[grade] ?? GRADE_BADGE.grade_7
  return <Badge variant="secondary" className={className}>{label}</Badge>
}
```

From src/lib/api/study-materials.ts (post-P01):
```typescript
export async function fetchStandaloneStudyMaterials(grade?: StudyMaterialGrade): Promise<StudyMaterial[]>
export async function getStudyMaterialSignedUrl(filePath: string): Promise<string>
export interface StudyMaterial { id, lesson_id, title, file_path, file_type, category, grade, created_by, created_at }
export type StudyMaterialGrade = 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
```

From src/lib/constants/grades.ts:
```typescript
export const GRADE_BADGE: Record<Course['target_grade'], { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create TaiLieuPage.tsx — public grade-filtered material browser</name>
  <files>src/pages/TaiLieuPage.tsx</files>
  <read_first>
    - src/pages/GioiThieu.tsx (outer shell: Header + Footer wrapping, export default pattern)
    - src/pages/student/CataloguePage.tsx (grade filter pills + Skeleton loading pattern)
    - src/index.css (verify .bm-clay-card-student and .bm-btn-cta class names exist)
  </read_first>
  <action>
Create `src/pages/TaiLieuPage.tsx` implementing the full public page. Build it as a single-file component (no sub-components needed):

**Imports:**
```tsx
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
```

**Grade filter constant (top-level, outside component):**
```tsx
const GRADE_FILTERS: { value: StudyMaterialGrade | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn thi chuyên' },
]
```

**GradeBadge helper (top-level, outside component):**
```tsx
function GradeBadge({ grade }: { grade: StudyMaterialGrade }) {
  const { label, className } = GRADE_BADGE[grade] ?? GRADE_BADGE.grade_7
  return <Badge variant="secondary" className={className}>{label}</Badge>
}
```

**Component state:**
```tsx
const [selectedGrade, setSelectedGrade] = useState<StudyMaterialGrade | 'all'>('all')
const [downloadingId, setDownloadingId] = useState<string | null>(null)
```

**Data fetching (fetch all, filter client-side per UI-SPEC.md):**
```tsx
const { data: materials = [], isLoading, isError } = useQuery({
  queryKey: ['standalone-study-materials'],
  queryFn: () => fetchStandaloneStudyMaterials(),
})

const filtered = materials.filter(m =>
  selectedGrade === 'all' || m.grade === selectedGrade
)
```

**Download handler (per D-08 and UI-SPEC.md Interaction Contracts):**
```tsx
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
```

**JSX structure:**
```tsx
export default function TaiLieuPage() {
  // ... state + query + handler above ...
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
              <p className="text-sm text-muted-foreground">
                Không thể tải danh sách tài liệu. Vui lòng thử lại sau.
              </p>
            </div>
          )}

          {/* Empty state — grade filter zero results */}
          {!isLoading && !isError && filtered.length === 0 && selectedGrade !== 'all' && (
            <div className="text-center py-16">
              <p className="text-sm font-semibold text-foreground mb-1">
                Không có tài liệu nào cho lớp này
              </p>
              <p className="text-sm text-muted-foreground">
                Thử chọn khối lớp khác hoặc xem tất cả tài liệu.
              </p>
            </div>
          )}

          {/* Empty state — no materials at all */}
          {!isLoading && !isError && filtered.length === 0 && selectedGrade === 'all' && (
            <div className="text-center py-16">
              <p className="text-sm font-semibold text-foreground mb-1">Chưa có tài liệu nào</p>
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
```

All copywriting from UI-SPEC.md Copywriting Contract must be used verbatim (Vietnamese strings).
  </action>
  <verify>
    <automated>yarn build 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `src/pages/TaiLieuPage.tsx` exists
    - `grep "export default function TaiLieuPage" src/pages/TaiLieuPage.tsx` returns 1 match
    - `grep "standalone-study-materials" src/pages/TaiLieuPage.tsx` returns 1 match (queryKey)
    - `grep "getStudyMaterialSignedUrl" src/pages/TaiLieuPage.tsx` returns 1 match
    - `grep "'_blank', 'noopener'" src/pages/TaiLieuPage.tsx` returns 1 match (download opens new tab)
    - `grep "downloadingId === material.id" src/pages/TaiLieuPage.tsx` returns 1 match (per-card loading state)
    - `grep "Ôn thi chuyên" src/pages/TaiLieuPage.tsx` returns 1 match (grade filter label)
    - `grep "bm-clay-card-student" src/pages/TaiLieuPage.tsx` returns 1 match (card class from UI-SPEC)
    - `grep "line-clamp-2" src/pages/TaiLieuPage.tsx` returns 1 match (title truncation)
    - `grep "selectedGrade === 'all' || m.grade === selectedGrade" src/pages/TaiLieuPage.tsx` returns 1 match (client-side filter)
    - `grep "<Header" src/pages/TaiLieuPage.tsx` returns 1 match
    - `grep "<Footer" src/pages/TaiLieuPage.tsx` returns 1 match
    - `yarn build` exits 0
  </acceptance_criteria>
  <done>TaiLieuPage.tsx created: public page with Header/Footer shell, grade filter pills, 3-col card grid, skeleton loading, empty/error states, per-card download with Loader2 spinner. All copywriting matches UI-SPEC.md verbatim.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| public browser → fetchStandaloneStudyMaterials | Unauthenticated fetch — RLS (from P01) restricts to lesson_id IS NULL rows |
| public browser → getStudyMaterialSignedUrl | anon createSignedUrl — allowed by anon storage policy from P01 |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-21-05 | Information Disclosure | TaiLieuPage signed URL | accept | TTL 1h, URL not logged, opens via window.open (no referer leakage from noopener) |
| T-21-06 | Denial of Service | handleDownload (per-click signed URL) | accept | No rate limiting at this phase — low-value public PDF files; signed URLs are cheap to generate |
</threat_model>

<verification>
After task completes:

```bash
# Page file exists and exports correctly
grep "export default function TaiLieuPage" src/pages/TaiLieuPage.tsx

# Key behaviors present
grep "standalone-study-materials" src/pages/TaiLieuPage.tsx
grep "getStudyMaterialSignedUrl" src/pages/TaiLieuPage.tsx
grep "_blank.*noopener" src/pages/TaiLieuPage.tsx

# Build passes
yarn build
```
</verification>

<success_criteria>
- `src/pages/TaiLieuPage.tsx` exists and exports `TaiLieuPage` as default
- Grade filter client-side (5 options, useState, no re-fetch)
- Card grid 3-col max with `.bm-clay-card-student`
- Download flow: signed URL → window.open(_blank, noopener), per-card Loader2 spinner
- Skeleton (6 cards), empty state (two variants), error state all present
- `yarn build` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/21-tai-lieu-page/21-P02-SUMMARY.md`
</output>
