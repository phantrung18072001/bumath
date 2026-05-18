---
phase: 19-landing-navigator-video
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/20260518_27_courses_is_tu_tru.sql
  - src/lib/api/courses.ts
  - src/components/student/VideoPlayer.tsx
  - src/components/student/LessonContent.tsx
  - src/components/student/VideoPlayer.test.tsx
  - src/components/landing/IntensiveSection.tsx
  - src/components/landing/ConsultationForm.tsx
  - src/components/landing/PricingSection.tsx
  - src/pages/Index.tsx
  - src/pages/student/CataloguePage.tsx
  - src/pages/student/CataloguePage.test.tsx
autonomous: true
requirements:
  - NAV-01
  - NAV-02
  - LAND-03
  - VIDEO-02
  - PRICE-04

must_haves:
  truths:
    - "Landing page hiển thị Tứ trụ block (PTNK/CNN/CSP/KHTN) trong IntensiveSection"
    - "Landing page có PricingSection với 6 gói học phí đúng định dạng VND"
    - "CTA mỗi pricing card scroll đến ConsultationForm (#tu-van)"
    - "VideoPlayer render iframe (youtube-nocookie.com) cho YouTube URL và <video> cho self-hosted"
    - "VideoPlayer có error state khi YouTube URL không parse được ID"
    - "LessonContent dùng <VideoPlayer> thay inline iframe"
    - "CataloguePage có filter pill 'Tứ trụ' chỉ hiện khi activeGrade === 'advanced'"
    - "Chọn filter 'Tứ trụ' → chỉ hiện course có is_tu_tru = true"
    - "Chuyển sang grade khác → filter Tứ trụ tự reset về 'Tất cả'"
  artifacts:
    - path: "supabase/migrations/20260518_27_courses_is_tu_tru.sql"
      provides: "ALTER TABLE courses ADD COLUMN is_tu_tru boolean NOT NULL DEFAULT false"
      contains: "ADD COLUMN IF NOT EXISTS is_tu_tru"
    - path: "src/lib/api/courses.ts"
      provides: "Course interface with is_tu_tru?: boolean"
      contains: "is_tu_tru"
    - path: "src/components/student/VideoPlayer.tsx"
      provides: "Provider-agnostic video component"
      exports: ["VideoPlayer (default)"]
    - path: "src/components/student/VideoPlayer.test.tsx"
      provides: "Test coverage for provider detection + error state"
    - path: "src/components/landing/PricingSection.tsx"
      provides: "6-card pricing grid with stagger animation"
      exports: ["PricingSection (default)"]
    - path: "src/components/landing/IntensiveSection.tsx"
      provides: "Tứ trụ text block (PTNK/CNN/CSP/KHTN) appended below grid"
    - path: "src/components/landing/ConsultationForm.tsx"
      provides: "section with id='tu-van'"
      contains: "id=\"tu-van\""
    - path: "src/pages/Index.tsx"
      provides: "<PricingSection /> after <IntensiveSection />"
      contains: "PricingSection"
    - path: "src/pages/student/CataloguePage.tsx"
      provides: "tuTruOnly state + conditional filter row + filteredCourses predicate"
      contains: "tuTruOnly"
    - path: "src/pages/student/CataloguePage.test.tsx"
      provides: "Tests for Tứ trụ sub-filter behavior"
  key_links:
    - from: "src/components/landing/PricingSection.tsx"
      to: "src/components/landing/ConsultationForm.tsx"
      via: "document.getElementById('tu-van')?.scrollIntoView({ behavior: 'smooth' })"
      pattern: "id=\"tu-van\""
    - from: "src/components/student/VideoPlayer.tsx"
      to: "src/lib/youtube.ts"
      via: "import { extractYouTubeID } from '@/lib/youtube'"
      pattern: "extractYouTubeID"
    - from: "src/components/student/LessonContent.tsx"
      to: "src/components/student/VideoPlayer.tsx"
      via: "<VideoPlayer url={lesson.video_url} title={...} />"
      pattern: "VideoPlayer"
    - from: "src/pages/student/CataloguePage.tsx"
      to: "src/lib/api/courses.ts"
      via: "Course.is_tu_tru boolean field"
      pattern: "is_tu_tru"
---

# Phase 19 — Landing Page + School Navigator + Video Abstraction

## Goal

Landing page có đủ nội dung Tứ trụ, bảng giá 6 gói, VideoPlayer provider-agnostic, và catalog filter Tứ trụ cho học sinh tìm đúng khóa học ôn chuyên.

**Requirements satisfied:** NAV-01, NAV-02, LAND-03, VIDEO-02, PRICE-04
**Out of scope (user confirmed):** LAND-01, LAND-02 (section cơ bản/nâng cao)

---

<objective>
Phase 19 delivers four surgical changes:
1. **DB + Course type** — Add `is_tu_tru` boolean column to `courses` table; extend Course interface.
2. **VideoPlayer abstraction** — New component replacing inline iframe in LessonContent; auto-detects YouTube vs self-hosted from URL.
3. **Landing page enhancements** — New PricingSection (6 cards), Tứ trụ text block in IntensiveSection, ConsultationForm anchor, Index.tsx integration.
4. **CataloguePage Tứ trụ filter** — Conditional sub-filter row (visible only when grade=advanced), client-side `tuTruOnly` predicate, reset on grade change.

Purpose: Students can find Tứ trụ specialist courses from the catalog; landing page communicates pricing and school targets clearly.
Output: 11 files created/modified, zero new npm packages needed.
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/19-landing-navigator-video/19-CONTEXT.md
@.planning/phases/19-landing-navigator-video/19-RESEARCH.md
@.planning/phases/19-landing-navigator-video/19-UI-SPEC.md

<interfaces>
<!-- Key contracts extracted from codebase — use directly, no exploration needed. -->

From src/lib/api/courses.ts (current — before this phase):
```typescript
export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  target_grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
  is_published: boolean
  created_at: string
  updated_at: string
}
// fetchCoursesPaginated uses .select('*') — will auto-include is_tu_tru after migration
```

From src/lib/youtube.ts (existing, MUST import — do NOT duplicate):
```typescript
export function extractYouTubeID(url: string): string | null
// Handles: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID,
//          youtube-nocookie.com/embed/ID, youtube.com/shorts/ID
```

From src/pages/student/CataloguePage.tsx (current filter state):
```typescript
const GRADE_FILTERS = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'grade_7',  label: 'Lớp 7' },
  { value: 'grade_8',  label: 'Lớp 8' },
  { value: 'grade_9',  label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn chuyên 9→10' },
]
const activeGrade = searchParams.get('lop') ?? 'all'
const [searchQuery, setSearchQuery] = useState('')

// Current filter predicate (lines 81–84):
const filteredCourses = allCourses.filter(c => {
  const matchesGrade  = activeGrade === 'all' || c.target_grade === activeGrade
  const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  return matchesGrade && matchesSearch
})
```

From src/components/student/LessonContent.tsx (current video block, lines 110–138):
```tsx
{lesson.video_url ? (
  <div className="...">
    <AspectRatio ratio={16 / 9} className="rounded-2xl overflow-hidden bg-black shadow-sm">
      <iframe
        src={lesson.video_url}              // ← REPLACE this whole block with <VideoPlayer>
        title={`Video bài học: ${lesson.title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </AspectRatio>
  </div>
) : (
  <AspectRatio ratio={16 / 9} className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
    {/* locked state — keep as-is, only replace the video_url branch above */}
  </AspectRatio>
)}
```

From src/pages/Index.tsx (current section order):
```tsx
<ClassGrid />
<IntensiveSection />
<TestimonialsSection />    // PricingSection goes BETWEEN IntensiveSection and TestimonialsSection
<ConsultationForm />
```

From src/components/landing/ConsultationForm.tsx (line 58, needs id):
```tsx
// BEFORE:
<section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
// AFTER:
<section id="tu-van" className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
```
</interfaces>
</context>

---

## Wave Structure

| Wave | Plans (Tasks) | Parallel? |
|------|---------------|-----------|
| 1 | T-01 + T-02 (DB + Course type) | Yes — independent files |
| 1 | T-03 + T-04 (VideoPlayer) | Yes — independent files |
| 1 | T-05 + T-06 (Landing page) | Yes — independent files |
| 2 | T-07 + T-08 (CataloguePage filter + tests) | Sequential (T-07 first, T-08 second) |

Wave 1 tasks (T-01 through T-06) may all execute in parallel — zero file overlap.
Wave 2 tasks (T-07, T-08) depend on T-01's Course interface change (`is_tu_tru`).

---

<tasks>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- WAVE 1-A: DB + Data Layer                                   -->
<!-- ═══════════════════════════════════════════════════════════ -->

<task type="auto" id="T-01">
  <name>T-01: DB migration — add is_tu_tru to courses</name>
  <files>supabase/migrations/20260518_27_courses_is_tu_tru.sql</files>
  <action>
Create new migration file with exactly this content (no other changes):

```sql
-- Phase 19: Add is_tu_tru boolean to courses table
-- Required for Tứ trụ filter in CataloguePage (NAV-02)
-- DEFAULT false is safe — all existing courses are non-Tứ trụ

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS is_tu_tru boolean NOT NULL DEFAULT false;
```

File name MUST be exactly `20260518_27_courses_is_tu_tru.sql` to follow migration naming convention.
Do NOT modify any existing migration files.
Do NOT add an UPDATE backfill — DEFAULT false handles all existing rows.
</action>
  <verify>
    <automated>grep -c "ADD COLUMN IF NOT EXISTS is_tu_tru" supabase/migrations/20260518_27_courses_is_tu_tru.sql</automated>
  </verify>
  <done>Migration file exists with correct ALTER TABLE statement; no syntax errors; safe for supabase db push.</done>
</task>

<task type="auto" id="T-02" tdd="true">
  <name>T-02: Course interface — add is_tu_tru field</name>
  <files>src/lib/api/courses.ts</files>
  <behavior>
    - Course interface has `is_tu_tru?: boolean` (optional — backward compat with code that doesn't select all fields)
    - All existing Course properties remain unchanged
    - `fetchCoursesPaginated` uses `.select('*')` so no explicit column list change needed
  </behavior>
  <action>
In `src/lib/api/courses.ts`, add `is_tu_tru?: boolean` to the `Course` interface AFTER `is_published: boolean` (line ~10):

```typescript
export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  target_grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
  is_published: boolean
  is_tu_tru?: boolean   // Phase 19: Tứ trụ specialist course flag (NAV-02, D-09)
  created_at: string
  updated_at: string
}
```

No other changes to courses.ts — `fetchCoursesPaginated` already uses `.select('*')` which will auto-include the new column after migration.
</action>
  <verify>
    <automated>grep -c "is_tu_tru" src/lib/api/courses.ts</automated>
  </verify>
  <done>Course interface has `is_tu_tru?: boolean`; TypeScript compilation passes; no other courses.ts lines changed.</done>
</task>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- WAVE 1-B: VideoPlayer Abstraction                           -->
<!-- ═══════════════════════════════════════════════════════════ -->

<task type="auto" id="T-03" tdd="true">
  <name>T-03: VideoPlayer component — provider-agnostic wrapper</name>
  <files>src/components/student/VideoPlayer.tsx, src/components/student/VideoPlayer.test.tsx</files>
  <behavior>
    - YouTube URL (youtube.com/youtu.be/youtube-nocookie.com) → iframe with youtube-nocookie.com embed src (per D-11, Phase 14 D-11)
    - Non-YouTube URL → `<video src controls>` (self-hosted path, D-12)
    - YouTube URL with unresolvable ID (e.g., malformed embed path) → error state with AlertCircle icon
    - `url` prop with empty string → error state (treat as invalid)
    - `title` prop passed through to iframe/video for accessibility
    - `className` prop overrides wrapper class via `cn()`
    - Import `extractYouTubeID` from `@/lib/youtube` — do NOT duplicate regex logic
    - Use `AspectRatio ratio={16/9}` from `@/components/ui/aspect-ratio` — do NOT custom-roll
  </behavior>
  <action>
**Step 1 — Write tests first (VideoPlayer.test.tsx):**

```typescript
import { render, screen } from '@testing-library/react'
import VideoPlayer from './VideoPlayer'

describe('VideoPlayer', () => {
  it('renders nocookie iframe for youtube.com/embed URL', () => {
    render(<VideoPlayer url="https://www.youtube.com/embed/dQw4w9WgXcQ" />)
    const iframe = screen.getByTitle('Video bài học')
    expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('renders nocookie iframe for youtu.be short URL', () => {
    render(<VideoPlayer url="https://youtu.be/dQw4w9WgXcQ" />)
    const iframe = screen.getByTitle('Video bài học')
    expect(iframe.getAttribute('src')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('renders <video> for self-hosted URL', () => {
    render(<VideoPlayer url="https://cdn.example.com/lesson.mp4" />)
    const video = screen.getByLabelText('Video bài học')
    expect(video.tagName).toBe('VIDEO')
    expect(video).toHaveAttribute('src', 'https://cdn.example.com/lesson.mp4')
  })

  it('renders error state for YouTube URL with unparseable ID', () => {
    render(<VideoPlayer url="https://www.youtube.com/malformed" />)
    expect(screen.getByText('Không thể tải video')).toBeInTheDocument()
  })

  it('uses custom title in iframe', () => {
    render(<VideoPlayer url="https://www.youtube.com/embed/abc123" title="Bài 1: Phương trình" />)
    expect(screen.getByTitle('Bài 1: Phương trình')).toBeInTheDocument()
  })
})
```

**Step 2 — Implement VideoPlayer.tsx (after tests are RED):**

```tsx
import { extractYouTubeID } from '@/lib/youtube'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
}

const isYouTubeUrl = (u: string) =>
  /youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(u)

function ErrorState({ className }: { className?: string }) {
  return (
    <AspectRatio
      ratio={16 / 9}
      className={cn('rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200', className)}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-slate-600">Không thể tải video</p>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Đường dẫn video không hợp lệ hoặc không được hỗ trợ.
          </p>
        </div>
      </div>
    </AspectRatio>
  )
}

export default function VideoPlayer({ url, title, className }: VideoPlayerProps) {
  if (!url) return <ErrorState className={className} />

  const isYT = isYouTubeUrl(url)
  const videoId = isYT ? extractYouTubeID(url) : null
  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : null

  if (isYT && !embedSrc) {
    // YouTube detected but ID unresolvable
    return <ErrorState className={className} />
  }

  if (embedSrc) {
    return (
      <AspectRatio
        ratio={16 / 9}
        className={cn('rounded-2xl overflow-hidden bg-black shadow-sm', className)}
      >
        <iframe
          src={embedSrc}
          title={title ?? 'Video bài học'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </AspectRatio>
    )
  }

  // Self-hosted
  return (
    <AspectRatio
      ratio={16 / 9}
      className={cn('rounded-2xl overflow-hidden bg-black shadow-sm', className)}
    >
      <video
        src={url}
        controls
        className="h-full w-full"
        aria-label={title ?? 'Video bài học'}
      />
    </AspectRatio>
  )
}
```
</action>
  <verify>
    <automated>npx vitest run src/components/student/VideoPlayer.test.tsx --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>All 5 VideoPlayer tests pass (GREEN); component exported as default from VideoPlayer.tsx; no TypeScript errors.</done>
</task>

<task type="auto" id="T-04">
  <name>T-04: LessonContent — swap inline iframe with VideoPlayer</name>
  <files>src/components/student/LessonContent.tsx</files>
  <action>
In `src/components/student/LessonContent.tsx`:

**1. Add import** (at top, after existing imports):
```tsx
import VideoPlayer from '@/components/student/VideoPlayer'
```

**2. Replace the inline `<AspectRatio><iframe>` block** in the `lesson.video_url` truthy branch.

BEFORE (lines ~113–122):
```tsx
<AspectRatio ratio={16 / 9} className="rounded-2xl overflow-hidden bg-black shadow-sm">
  <iframe
    src={lesson.video_url}
    title={`Video bài học: ${lesson.title}`}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="h-full w-full border-0"
  />
</AspectRatio>
```

AFTER:
```tsx
<VideoPlayer
  url={lesson.video_url}
  title={`Video bài học: ${lesson.title}`}
/>
```

**3. Remove the now-unused `AspectRatio` import** only if no other usage remains in LessonContent.tsx. If AspectRatio is still used for the locked-state branch, keep the import.

**Keep all other code unchanged** — wrapper `<div className="px-4 md:px-8 py-6 space-y-6">`, `<div className="max-w-4xl">`, locked state `<AspectRatio>` branch, submission section, etc.
</action>
  <verify>
    <automated>grep -c "VideoPlayer" src/components/student/LessonContent.tsx</automated>
  </verify>
  <done>LessonContent imports VideoPlayer and uses it in the video_url truthy branch; inline iframe removed; locked state branch unchanged; TypeScript compiles without errors.</done>
</task>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- WAVE 1-C: Landing Page Enhancements                         -->
<!-- ═══════════════════════════════════════════════════════════ -->

<task type="auto" id="T-05">
  <name>T-05: IntensiveSection Tứ trụ block + ConsultationForm anchor</name>
  <files>
    src/components/landing/IntensiveSection.tsx,
    src/components/landing/ConsultationForm.tsx
  </files>
  <action>
**File 1 — IntensiveSection.tsx:**

Add a `motion.div` Tứ trụ text block **inside the same `<div className="container">` wrapper**, positioned AFTER the existing `<div className="grid items-center gap-10 lg:grid-cols-2">` closing tag and BEFORE `</section>`.

Add `Trophy` to the existing Lucide icon imports (it may already be present — check before adding).

```tsx
{/* Tứ trụ text block — D-01, LAND-03, NAV-01 */}
<motion.div
  initial={{ opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, delay: 0.3 }}
  className="mt-10 rounded-2xl border bg-card p-5 shadow-sm"
>
  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
    <Trophy className="h-3.5 w-3.5" />
    Tứ trụ trường chuyên TPHCM
  </div>
  <p className="text-sm font-normal leading-relaxed text-muted-foreground">
    Lộ trình chuyên biệt cho học sinh nhắm đến{' '}
    <span className="font-bold text-foreground">PTNK</span>,{' '}
    <span className="font-bold text-foreground">CNN</span>,{' '}
    <span className="font-bold text-foreground">CSP</span> và{' '}
    <span className="font-bold text-foreground">KHTN</span>{' '}
    — 4 trường chuyên Toán hàng đầu Thành phố Hồ Chí Minh.
  </p>
</motion.div>
```

Constraints:
- Background: `bg-card` + `border` — do NOT use `bm-glass-card` (Phase 20 only)
- School names use `font-bold text-foreground` (not `text-primary`) — distinguishable within muted text
- Block is full-width (spans both columns of parent grid naturally)

**File 2 — ConsultationForm.tsx:**

Add `id="tu-van"` to the outermost `<section>` element (line ~58):

```tsx
// BEFORE:
<section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
// AFTER:
<section id="tu-van" className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
```

No other changes to ConsultationForm.tsx — the anchor is the only modification (D-06).
</action>
  <verify>
    <automated>grep -c "PTNK" src/components/landing/IntensiveSection.tsx && grep -c "id=\"tu-van\"" src/components/landing/ConsultationForm.tsx</automated>
  </verify>
  <done>IntensiveSection has Tứ trụ motion.div with PTNK/CNN/CSP/KHTN text; ConsultationForm `<section>` has `id="tu-van"`; both files compile without errors.</done>
</task>

<task type="auto" id="T-06">
  <name>T-06: PricingSection component + Index.tsx integration</name>
  <files>
    src/components/landing/PricingSection.tsx,
    src/pages/Index.tsx
  </files>
  <action>
**File 1 — PricingSection.tsx (new file):**

```tsx
import { motion } from 'framer-motion'
import { BookOpen, Zap, Target, Trophy, Star } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PricingPackage {
  name: string
  price: string
  ariaPrice: string  // screen reader full price
  icon: LucideIcon
  highlight: boolean
}

const PRICING_PACKAGES: PricingPackage[] = [
  { name: 'Lớp 7',     price: '1,5M đ', ariaPrice: '1,5 triệu đồng', icon: BookOpen, highlight: false },
  { name: 'Lớp 8',     price: '1,5M đ', ariaPrice: '1,5 triệu đồng', icon: BookOpen, highlight: false },
  { name: 'Cấp tốc',   price: '2M đ',   ariaPrice: '2 triệu đồng',   icon: Zap,      highlight: false },
  { name: 'Ôn chuyên', price: '3M đ',   ariaPrice: '3 triệu đồng',   icon: Target,   highlight: false },
  { name: 'Tứ trụ',    price: '2,5M đ', ariaPrice: '2,5 triệu đồng', icon: Trophy,   highlight: false },
  { name: 'Toàn bộ',   price: '4M đ',   ariaPrice: '4 triệu đồng',   icon: Star,     highlight: true  },
] as const

function scrollToConsultation() {
  document.getElementById('tu-van')?.scrollIntoView({ behavior: 'smooth' })
}

export default function PricingSection() {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-16 md:py-20">
      <div className="container">
        {/* Section header */}
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Học phí <span className="text-primary">minh bạch</span>
          </h2>
          <p className="mx-auto max-w-md font-normal text-muted-foreground">
            Chọn gói phù hợp — học phí rõ ràng, không phí ẩn
          </p>
        </div>

        {/* Card grid — 1-col → 2-col sm → 3-col lg (per UI-SPEC) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING_PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon
            return (
              <motion.article
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card
                  className={cn(
                    'group flex h-full cursor-pointer flex-col overflow-hidden border shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                    pkg.highlight && 'border-primary border-2'
                  )}
                >
                  <CardHeader className="flex-1 px-5 pb-3 pt-5">
                    {/* Badge — Toàn bộ only */}
                    {pkg.highlight && (
                      <span
                        aria-label="Gói phổ biến nhất"
                        className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary"
                      >
                        Phổ biến
                      </span>
                    )}
                    {/* Icon */}
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {/* Title */}
                    <h3 className="text-base font-bold">{pkg.name}</h3>
                    {/* Price */}
                    <div
                      className="mt-1 text-3xl font-bold text-primary"
                      aria-label={`Giá: ${pkg.ariaPrice}`}
                    >
                      {pkg.price}
                    </div>
                  </CardHeader>
                  <CardFooter className="px-5 pb-5 pt-0">
                    <Button
                      className="min-h-[44px] w-full shadow-lg shadow-primary/25"
                      aria-label={`Đăng ký tư vấn gói ${pkg.name}`}
                      onClick={scrollToConsultation}
                    >
                      Đăng ký tư vấn
                    </Button>
                  </CardFooter>
                </Card>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

Constraints:
- Do NOT use `bm-glass-card` — landing page uses plain shadcn `Card` (per UI-SPEC)
- `min-h-[44px]` on Button for touch target compliance
- `<motion.article>` semantic role for each pricing card (accessibility)
- Grid: `grid-cols-1` (mobile default) → `sm:grid-cols-2` → `lg:grid-cols-3`
- Animation: stagger `delay: i * 0.08`, `duration: 0.4` (per UI-SPEC Framer Motion pattern)
- Scroll: `document.getElementById('tu-van')?.scrollIntoView` — requires T-05 to add `id="tu-van"` to ConsultationForm

**File 2 — Index.tsx:**

Add PricingSection import and render it after `<IntensiveSection />` and before `<TestimonialsSection />`:

```tsx
// Add import (after existing imports):
import PricingSection from "@/components/landing/PricingSection";

// In JSX (per confirmed section order):
<ClassGrid />
<IntensiveSection />
<PricingSection />        {/* ← insert here */}
<TestimonialsSection />
<ConsultationForm />
```
</action>
  <verify>
    <automated>grep -c "PricingSection" src/pages/Index.tsx && grep -c "PRICING_PACKAGES" src/components/landing/PricingSection.tsx</automated>
  </verify>
  <done>PricingSection.tsx exports default component with 6 pricing cards; Index.tsx imports and renders it between IntensiveSection and TestimonialsSection; TypeScript compiles; "Toàn bộ" card has `border-primary border-2`.</done>
</task>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- WAVE 2: CataloguePage Tứ trụ Filter                        -->
<!-- (depends on T-02 — Course interface with is_tu_tru)         -->
<!-- ═══════════════════════════════════════════════════════════ -->

<task type="auto" id="T-07" tdd="true">
  <name>T-07: CataloguePage — Tứ trụ sub-filter implementation</name>
  <files>src/pages/student/CataloguePage.tsx</files>
  <behavior>
    - `tuTruOnly` state initialized `false`, local (NOT in URL params per D-09)
    - Sub-filter row with 2 pills ("Tất cả" / "Tứ trụ") visible ONLY when `activeGrade === 'advanced'`
    - When `activeGrade` changes away from 'advanced' → `tuTruOnly` resets to `false` (useEffect)
    - `filteredCourses` predicate: existing `matchesGrade && matchesSearch` PLUS `!tuTruOnly || c.is_tu_tru === true`
    - Empty state when Tứ trụ filter returns 0 courses: heading "Chưa có khóa học Tứ trụ", body "Hãy liên hệ BuMath để được tư vấn lộ trình phù hợp."
    - Active "Tứ trụ" pill: `bg-primary text-white` (orange, distinct from indigo GRADE_FILTERS pills)
    - Inactive pill: `bg-secondary text-secondary-foreground`
    - Both pills: `min-h-[44px]` touch target
  </behavior>
  <action>
**In src/pages/student/CataloguePage.tsx:**

**1. Add import** — add `useEffect` to existing React import if not already present:
```tsx
import { useState, useRef, useEffect } from 'react'
```

**2. Add `tuTruOnly` state** after existing `searchQuery` state:
```tsx
const [tuTruOnly, setTuTruOnly] = useState(false)
```

**3. Add reset effect** after tuTruOnly state declaration:
```tsx
// Reset Tứ trụ filter when grade changes away from 'advanced' — Pitfall 3 guard
useEffect(() => {
  if (activeGrade !== 'advanced') setTuTruOnly(false)
}, [activeGrade])
```

**4. Update `filteredCourses` predicate** (extend existing filter at lines ~81–84):
```tsx
const filteredCourses = allCourses.filter(c => {
  const matchesGrade  = activeGrade === 'all' || c.target_grade === activeGrade
  const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  const matchesTuTru  = !tuTruOnly || c.is_tu_tru === true  // D-10
  return matchesGrade && matchesSearch && matchesTuTru
})
```

**5. Add Tứ trụ sub-filter row** — render it conditionally after the existing GRADE_FILTERS pills row, inside the same container. Place it between the grade pill row and the search input (or after the search input — follow the existing DOM order):

```tsx
{/* Tứ trụ sub-filter — D-07, D-08: visible only when grade === advanced */}
{activeGrade === 'advanced' && (
  <div className="flex items-center gap-2 flex-wrap" aria-label="Lọc khóa học Tứ trụ trường chuyên">
    {[
      { value: false, label: 'Tất cả' },
      { value: true,  label: 'Tứ trụ' },
    ].map(opt => (
      <button
        key={String(opt.value)}
        onClick={() => setTuTruOnly(opt.value)}
        className={cn(
          'min-h-[44px] rounded-full px-4 text-sm font-bold transition-colors duration-150',
          tuTruOnly === opt.value
            ? 'bg-primary text-white'        // orange (distinct from indigo grade pills)
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
)}
```

**6. Update empty state** — add a specific empty state for Tứ trụ filter (0 results when tuTruOnly is true):

In the `filteredCourses.length === 0` block, detect if it's a Tứ trụ empty result:
```tsx
{!coursesLoading && !coursesError && allCourses.length > 0 && filteredCourses.length === 0 && (
  <div className="py-16 text-center">
    <p className="text-base font-bold">
      {tuTruOnly ? 'Chưa có khóa học Tứ trụ' : 'Không tìm thấy khóa học phù hợp'}
    </p>
    <p className="mt-2 text-sm font-normal text-muted-foreground">
      {tuTruOnly
        ? 'Hãy liên hệ BuMath để được tư vấn lộ trình phù hợp.'
        : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'}
    </p>
  </div>
)}
```

Ensure `cn` is already imported (it should be). If not, add import from `@/lib/utils`.
</action>
  <verify>
    <automated>grep -c "tuTruOnly" src/pages/student/CataloguePage.tsx</automated>
  </verify>
  <done>CataloguePage has tuTruOnly state, useEffect reset, updated filteredCourses predicate, conditional sub-filter row, and Tứ trụ-specific empty state; TypeScript compiles without errors.</done>
</task>

<task type="auto" id="T-08">
  <name>T-08: CataloguePage tests — Tứ trụ filter coverage</name>
  <files>src/pages/student/CataloguePage.test.tsx</files>
  <action>
Add new test cases to the existing `describe('CataloguePage')` block in `CataloguePage.test.tsx`. Do NOT modify existing tests.

**Extend mock courses** to include is_tu_tru variants (add at top of file, alongside existing mockCourses):

```typescript
const mockAdvancedCourses = [
  { id: 'c3', title: 'Ôn chuyên Tứ trụ', slug: 'on-chuyen-tu-tru', target_grade: 'advanced', description: null, is_tu_tru: true },
  { id: 'c4', title: 'Ôn chuyên A-Z',    slug: 'on-chuyen-az',    target_grade: 'advanced', description: null, is_tu_tru: false },
]
```

**Add the following tests inside the existing `describe('CataloguePage')` block:**

```typescript
describe('Tứ trụ sub-filter', () => {
  it('does not show Tứ trụ filter pills when grade is not advanced', async () => {
    const { fetchCoursesPaginated } = await import('@/lib/api/courses')
    vi.mocked(fetchCoursesPaginated).mockResolvedValue({ data: mockAdvancedCourses, total: 2 })
    await renderCataloguePage()
    // Default grade is 'all' — sub-filter hidden
    expect(screen.queryByText('Tứ trụ')).not.toBeInTheDocument()
  })

  it('shows Tứ trụ filter pills when grade is advanced', async () => {
    const { fetchCoursesPaginated } = await import('@/lib/api/courses')
    vi.mocked(fetchCoursesPaginated).mockResolvedValue({ data: mockAdvancedCourses, total: 2 })

    // Render with ?lop=advanced in URL
    const { default: CataloguePage } = await import('./CataloguePage')
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/?lop=advanced']}>
          <Routes>
            <Route path="/" element={<CataloguePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Tứ trụ')).toBeInTheDocument()
      expect(screen.getByText('Tất cả')).toBeInTheDocument()
    })
  })

  it('shows Tứ trụ-specific empty state when filter has no results', async () => {
    const { fetchCoursesPaginated } = await import('@/lib/api/courses')
    // Only non-Tứ trụ advanced course
    vi.mocked(fetchCoursesPaginated).mockResolvedValue({
      data: [{ id: 'c4', title: 'Ôn chuyên A-Z', slug: 'on-chuyen-az', target_grade: 'advanced', description: null, is_tu_tru: false }],
      total: 1
    })

    const { default: CataloguePage } = await import('./CataloguePage')
    const { userEvent } = await import('@testing-library/user-event')
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/?lop=advanced']}>
          <Routes>
            <Route path="/" element={<CataloguePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
    await waitFor(() => expect(screen.getByText('Tứ trụ')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Tứ trụ'))
    await waitFor(() => {
      expect(screen.getByText('Chưa có khóa học Tứ trụ')).toBeInTheDocument()
    })
  })
})
```

Add necessary imports at top of test file if not already present:
```typescript
import { MemoryRouter, Routes, Route } from 'react-router-dom'
// (replace BrowserRouter with MemoryRouter for URL-param tests)
```

Note: If existing tests use `BrowserRouter`, the new tests use `MemoryRouter` to control URL params — they coexist fine.
</action>
  <verify>
    <automated>npx vitest run src/pages/student/CataloguePage.test.tsx --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>All existing CataloguePage tests still pass; new Tứ trụ sub-filter tests pass (GREEN); no regressions.</done>
</task>

</tasks>

---

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser → YouTube iframe | VideoPlayer renders cross-origin iframe; content from youtube-nocookie.com |
| User → CataloguePage filter | Filter state is client-side local state — no auth boundary involved |
| User → PricingSection CTA | Scroll to anchor — no data submission, no network call |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-19-01 | Information Disclosure | `VideoPlayer` iframe — `video_url` visible in HTML source | accept | `video_url` already behind RLS (Phase 14 P06). YouTube-nocookie.com + unlisted videos reduce direct discoverability. No additional action needed. |
| T-19-02 | Tampering | `tuTruOnly` client-side state in CataloguePage | accept | Filter is UX-only; no access control. Course data is already filtered by RLS (`is_published = true`). Manipulating filter via DevTools only changes visible subset — no security boundary crossed. |
| T-19-03 | Spoofing | PricingSection CTA anchor scroll | accept | `scrollIntoView` on static element. No auth, no form submission at CTA level. ConsultationForm handles its own data handling unchanged. |
| T-19-04 | Elevation of Privilege | `is_tu_tru` column in courses table | accept | Column is read-only to students (RLS: `SELECT` only). Only admins can set `is_tu_tru = true` (via Supabase dashboard or future admin UI). Phase 19 adds no write path for students. |

**No new attack surfaces introduced.** Phase 19 adds read-only UI and a boolean DB column with restrictive default.
</threat_model>

---

<verification>

## Phase-Level Checks

Run after ALL tasks complete:

```bash
# 1. TypeScript — no errors
npx tsc --noEmit

# 2. VideoPlayer tests
npx vitest run src/components/student/VideoPlayer.test.tsx

# 3. CataloguePage tests (including new Tứ trụ tests)
npx vitest run src/pages/student/CataloguePage.test.tsx

# 4. Migration file exists
ls supabase/migrations/20260518_27_courses_is_tu_tru.sql

# 5. Anchor wiring — ConsultationForm has id, PricingSection targets it
grep -c "id=\"tu-van\"" src/components/landing/ConsultationForm.tsx

# 6. VideoPlayer in LessonContent
grep -c "VideoPlayer" src/components/student/LessonContent.tsx

# 7. PricingSection in Index.tsx
grep -c "PricingSection" src/pages/Index.tsx

# 8. Tứ trụ content in IntensiveSection
grep -c "PTNK" src/components/landing/IntensiveSection.tsx
```

## Visual Verification (manual)

After `yarn dev`:

1. **Landing page** — Visit `/` → scroll to IntensiveSection → confirm Tứ trụ badge + PTNK/CNN/CSP/KHTN text visible
2. **PricingSection** — 6 pricing cards visible in `grid-cols-1 → 2 → 3`; "Toàn bộ" card has orange border + "Phổ biến" badge
3. **CTA scroll** — Click "Đăng ký tư vấn" on any pricing card → page scrolls to ConsultationForm
4. **CataloguePage** — Visit `/danh-muc` → select "Ôn chuyên 9→10" grade → Tứ trụ filter pills appear; select other grade → pills disappear
5. **VideoPlayer** — Visit any lesson with video → iframe renders (youtube-nocookie.com domain in DevTools Network tab)
</verification>

---

<success_criteria>

Phase 19 is complete when ALL of the following are TRUE:

1. **NAV-01 ✓** — IntensiveSection has Tứ trụ text block mentioning PTNK, CNN, CSP, KHTN
2. **LAND-03 ✓** — IntensiveSection contains ôn chuyên 9→10 Tứ trụ lộ trình description (same block as NAV-01)
3. **PRICE-04 ✓** — PricingSection renders 6 cards with correct prices (1,5M / 1,5M / 2M / 3M / 2,5M / 4M đ); "Toàn bộ" has orange border + "Phổ biến" badge; CTA scrolls to #tu-van
4. **VIDEO-02 ✓** — VideoPlayer accepts url prop; YouTube URL → youtube-nocookie.com iframe; non-YouTube URL → `<video>`; LessonContent uses VideoPlayer; tests pass
5. **NAV-02 ✓** — CataloguePage shows Tứ trụ filter pills only when grade=advanced; filter applies is_tu_tru predicate; resets on grade change; tests pass
6. **No regressions** — `npx tsc --noEmit` passes; all existing tests pass
7. **Migration ready** — `supabase/migrations/20260518_27_courses_is_tu_tru.sql` exists and contains correct ALTER TABLE statement

</success_criteria>

---

<output>
After completion, create `.planning/phases/19-landing-navigator-video/19-PLAN-SUMMARY.md` with:
- Tasks completed (T-01 through T-08)
- Files created/modified
- Any deviations from plan
- Test results (pass counts)
- Migration applied status
</output>

---

## Source Audit

| Source | Item | Plan Coverage |
|--------|------|---------------|
| GOAL | Tứ trụ text block + PricingSection + VideoPlayer + catalog filter | COVERED — T-01 through T-08 |
| REQ NAV-01 | Tứ trụ schools (PTNK/CNN/CSP/KHTN) in landing | COVERED — T-05 (IntensiveSection) |
| REQ NAV-02 | Catalog filter to Tứ trụ courses | COVERED — T-07, T-08 |
| REQ LAND-03 | Ôn chuyên 9→10 section with Tứ trụ | COVERED — T-05 (same block as NAV-01) |
| REQ VIDEO-02 | VideoPlayer provider abstraction | COVERED — T-03, T-04 |
| REQ PRICE-04 | Pricing display on landing page | COVERED — T-06 |
| REQ LAND-01 | (User confirmed out of scope — DEFERRED) | EXCLUDED — per user decision |
| REQ LAND-02 | (User confirmed out of scope — DEFERRED) | EXCLUDED — per user decision |
| D-01 | IntensiveSection Tứ trụ text (not 4 cards) | COVERED — T-05 |
| D-02 | ClassGrid unchanged | COVERED — no task touches ClassGrid |
| D-03 | PricingSection with 6 shadcn Cards | COVERED — T-06 |
| D-04 | 6 package prices | COVERED — T-06 (PRICING_PACKAGES const) |
| D-05 | "Toàn bộ" badge "Phổ biến" + border-primary | COVERED — T-06 |
| D-06 | CTA scrolls to #tu-van anchor | COVERED — T-05 (id) + T-06 (scrollIntoView) |
| D-07 | Tứ trụ filter in /danh-muc not landing | COVERED — T-07 |
| D-08 | Filter visible only when grade=advanced | COVERED — T-07 |
| D-09 | Static constants, no DB per-school mapping | COVERED — T-07 (tuTruOnly local state) |
| D-10 | Filter options: "Tất cả" + "Tứ trụ" | COVERED — T-07 |
| D-11 | VideoPlayer auto-detect from URL | COVERED — T-03 |
| D-12 | Wrap YouTube only; self-hosted future-ready | COVERED — T-03 |
| D-13 | VideoPlayer replaces inline iframe in LessonContent | COVERED — T-04 |

---

**Total tasks: 8**

| ID | Description | Wave | Files |
|----|-------------|------|-------|
| T-01 | DB migration — is_tu_tru column | 1 | supabase/migrations/... |
| T-02 | Course interface — is_tu_tru field | 1 | src/lib/api/courses.ts |
| T-03 | VideoPlayer component + tests | 1 | VideoPlayer.tsx, VideoPlayer.test.tsx |
| T-04 | LessonContent — swap iframe with VideoPlayer | 1 | LessonContent.tsx |
| T-05 | IntensiveSection Tứ trụ block + ConsultationForm anchor | 1 | IntensiveSection.tsx, ConsultationForm.tsx |
| T-06 | PricingSection component + Index.tsx integration | 1 | PricingSection.tsx, Index.tsx |
| T-07 | CataloguePage Tứ trụ filter | 2 (depends on T-02) | CataloguePage.tsx |
| T-08 | CataloguePage test updates | 2 (after T-07) | CataloguePage.test.tsx |
