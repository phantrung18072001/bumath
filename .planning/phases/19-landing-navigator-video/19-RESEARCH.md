# Phase 19: Landing Page + School Navigator + Video Abstraction — Research

**Researched:** 2026-05-18
**Domain:** React landing page, catalog filter, video abstraction, Supabase schema
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** `IntensiveSection` mở rộng — thêm text Tứ trụ (PTNK/CNN/CSP/KHTN) bên dưới nội dung hiện tại. Không tách 4 card riêng.
- **D-02:** ClassGrid (3 card Toán 7/8/9) giữ nguyên, không thêm sub-category.
- **D-03:** Thêm `PricingSection` mới trên landing page (sau IntensiveSection) với 6 shadcn Card.
- **D-04:** 6 gói: Lớp 7 (1.5M), Lớp 8 (1.5M), Cấp tốc (2M), Ôn chuyên (3M), Tứ trụ (2.5M), Toàn bộ (4M VND).
- **D-05:** Gói "Toàn bộ" — badge "Phổ biến" + `border-primary border-2`.
- **D-06:** CTA "Đăng ký tư vấn" trên mỗi pricing card → anchor scroll to `#tu-van`.
- **D-07:** Tứ trụ filter nằm trong `/danh-muc`, không phải landing page riêng.
- **D-08:** Filter chỉ hiện khi `activeGrade === 'advanced'`.
- **D-09:** Static constants — không cần DB mapping per-school.
- **D-10:** Filter options: "Tất cả" (default) và "Tứ trụ".
- **D-11:** `VideoPlayer` auto-detect từ URL: youtube.com/youtu.be/youtube-nocookie.com → iframe; else → `<video>`.
- **D-12:** Wrap YouTube chỉ, không xóa YouTube. Self-hosted future-ready.
- **D-13:** VideoPlayer thay inline iframe trong LessonContent.

### Agent's Discretion
- Props interface VideoPlayer: agent quyết chi tiết (`url` + optional `title`, `className`).
- Placement VideoPlayer: `src/components/student/` vs `src/components/shared/`.
- Aspect ratio / responsive wrapper.
- Fallback/error state khi URL không hợp lệ.
- Column layout pricing cards (2-col mobile → 3-col desktop).
- Animation stagger PricingSection.

### Deferred Ideas (OUT OF SCOPE)
- Per-school detail mapping (PTNK/CNN/CSP/KHTN → khóa học riêng).
- LAND-01/LAND-02 (section Toán 7 cơ bản/nâng cao, Toán 8) — user confirmed không cần làm.
- 4 card Tứ trụ có CTA riêng.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PRICE-04 | Landing page hiển thị bảng giá 6 gói (Lớp 7: 1.5M, Lớp 8: 1.5M, Cấp tốc: 2M, Ôn chuyên: 3M, Tứ trụ: 2.5M, Toàn bộ: 4M) | PricingSection component, shadcn Card available |
| NAV-01 | Landing page có section Tứ trụ với PTNK/CNN/CSP/KHTN | D-01 text block in IntensiveSection |
| NAV-02 | Học sinh chọn trường mục tiêu → điều hướng đến khóa học phù hợp | Tứ trụ filter in CataloguePage, needs `is_tu_tru` DB field |
| LAND-03 | Landing page giới thiệu ôn chuyên 9→10: A→Z chuyên đề, cấp tốc, Tứ trụ | D-01 covers this via IntensiveSection Tứ trụ text |
| VIDEO-02 | VideoPlayer abstract hoá provider — YouTube + self-hosted | Reuse existing `src/lib/youtube.ts`; `LessonContent.tsx` inline iframe to replace |
| LAND-01 | (Bỏ qua theo user — không cần làm) | — |
| LAND-02 | (Bỏ qua theo user — không cần làm) | — |
</phase_requirements>

---

## Summary

Phase 19 delivers four surgical changes across the codebase: (1) a new `PricingSection` landing component, (2) a Tứ trụ text block appended to `IntensiveSection`, (3) a conditional "Tứ trụ" sub-filter in `CataloguePage`, and (4) a `VideoPlayer` component that replaces the inline iframe in `LessonContent`. The scope is narrow and well-defined by the CONTEXT.md decisions.

The only DB change required is adding `is_tu_tru boolean DEFAULT false` to the `courses` table. All other work is pure TypeScript/React. No new shadcn components need to be installed — Card, Button, Badge, and AspectRatio are already in `src/components/ui/`. Framer Motion stagger animations already pattern-established in ClassGrid and IntensiveSection.

**Primary recommendation:** Execute in 4 focused plans: (P1) DB migration + Course type extension, (P2) PricingSection + IntensiveSection update + Index.tsx integration + ConsultationForm anchor, (P3) VideoPlayer component + LessonContent swap, (P4) CataloguePage Tứ trụ filter + tests.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| PricingSection display | Browser/Client | — | Static data, no server state needed |
| Tứ trụ text in IntensiveSection | Browser/Client | — | Static copywriting |
| Tứ trụ filter (CataloguePage) | Browser/Client | Database/Storage | Client-side filter on already-loaded data; DB needs `is_tu_tru` field |
| `is_tu_tru` schema | Database/Storage | — | New boolean column on `courses` table |
| VideoPlayer provider detection | Browser/Client | — | Pure URL parsing, no server calls |
| ConsultationForm anchor | Browser/Client | — | `id` attribute + `scrollIntoView` |

---

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| shadcn/ui | current | Card, Button, Badge, AspectRatio | All needed components already installed [VERIFIED: src/components/ui/] |
| Framer Motion | current | stagger animation PricingSection | Pattern established in ClassGrid, IntensiveSection [VERIFIED: codebase] |
| React Router DOM v6 | current | routing in landing page CTAs | No change needed [VERIFIED: codebase] |
| Lucide React | current | Icons for pricing cards (BookOpen, Zap, Target, Trophy, Star) | All icons available [VERIFIED: codebase] |
| TanStack React Query | current | CataloguePage data fetching | No change to query logic [VERIFIED: CataloguePage.tsx] |
| Supabase JS | current | DB migration for `is_tu_tru` | ALTER TABLE via migration file [VERIFIED: migrations/] |

**Installation:** No new packages needed. [VERIFIED: all required shadcn components present in src/components/ui/]

---

## Architecture Patterns

### Recommended Project Structure (new/changed files)

```
src/
├── components/
│   ├── landing/
│   │   ├── PricingSection.tsx        # NEW — 6 pricing cards
│   │   └── IntensiveSection.tsx      # UPDATED — Tứ trụ text block appended
│   └── student/
│       └── VideoPlayer.tsx           # NEW — provider-agnostic video
├── pages/
│   ├── Index.tsx                     # UPDATED — import + insert PricingSection
│   └── student/
│       └── CataloguePage.tsx         # UPDATED — Tứ trụ sub-filter
├── lib/
│   ├── api/
│   │   └── courses.ts                # UPDATED — add is_tu_tru?: boolean to Course interface
│   └── youtube.ts                    # UNCHANGED — VideoPlayer reuses extractYouTubeID
supabase/
└── migrations/
    └── 20260518_27_courses_is_tu_tru.sql   # NEW — ALTER TABLE courses ADD COLUMN
```

### Pattern 1: Landing Section Structure
**What:** All landing sections follow the same wrapper pattern.
**When to use:** PricingSection, and any new landing section.
**Example:**
```tsx
// Source: verified from ClassGrid.tsx + IntensiveSection.tsx
<section className="py-16 md:py-20">
  <div className="container">
    <div className="mb-10 text-center">
      <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">...</h2>
      <p className="mx-auto max-w-md text-muted-foreground">...</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* stagger-animated items */}
    </div>
  </div>
</section>
```

### Pattern 2: Framer Motion Stagger (Landing Page)
**What:** `whileInView` with `once: true` and `delay: i * 0.08`.
**When to use:** Any card grid on landing page.
**Example:**
```tsx
// Source: verified from ClassGrid.tsx
<motion.div
  key={item.name}
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, delay: i * 0.08 }}
>
  {/* card content */}
</motion.div>
```

### Pattern 3: CataloguePage Client-side Filter
**What:** All filtering is client-side on `allCourses` (already loaded via infinite scroll).
**When to use:** Adding Tứ trụ filter — extend `filteredCourses` predicate.
**Example:**
```tsx
// Source: verified from CataloguePage.tsx — extend existing filter
const filteredCourses = allCourses.filter(c => {
  const matchesGrade  = activeGrade === 'all' || c.target_grade === activeGrade;
  const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  const matchesTuTru  = !tuTruOnly || c.is_tu_tru === true;  // NEW condition
  return matchesGrade && matchesSearch && matchesTuTru;
});
```

### Pattern 4: VideoPlayer Provider Detection
**What:** URL-based provider detection; reuse existing `extractYouTubeID` from `src/lib/youtube.ts`.
**When to use:** VideoPlayer component renders different markup based on URL.
**Example:**
```tsx
// Source: verified — src/lib/youtube.ts already exists
import { extractYouTubeID } from '@/lib/youtube'

const isYouTube = /youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(url)
const videoId = isYouTube ? extractYouTubeID(url) : null
const embedSrc = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
// embedSrc null → error state (YouTube detected but ID not parseable)
// !isYouTube → <video src={url} controls />
```

### Anti-Patterns to Avoid
- **Duplicating YouTube ID extraction logic:** `src/lib/youtube.ts` already exists. VideoPlayer MUST import `extractYouTubeID` from there — do not copy the regex patterns.
- **Storing `youtube.com/embed/` URLs from VideoPlayer:** Admin form already stores `youtube.com/embed/{id}` format. VideoPlayer must handle this format as input (the regex in `youtube.ts` handles `embed/{id}` pattern — verified).
- **Adding Tứ trụ filter to URL params:** D-09 says static constants + client-side. `tuTruOnly` is local state, NOT in `useSearchParams`.
- **Using `bm-glass-card` on landing page:** Per UI-SPEC: landing page does NOT use `bm-glass-card` (that's Phase 20 student/admin style). Use shadcn `Card` with `shadow-md`.
- **Using emoji icons:** CLAUDE.md design rule — no emoji icons. Use Lucide icons only.
- **Not resetting Tứ trụ filter when grade changes:** `useEffect` that calls `setTuTruOnly(false)` when `activeGrade !== 'advanced'` is required.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YouTube ID extraction | Custom regex in VideoPlayer | `extractYouTubeID` from `src/lib/youtube.ts` | Already handles 5 URL formats including embed/ and shorts/ |
| 16:9 aspect ratio wrapper | Custom CSS padding-trick | `AspectRatio` from shadcn (`src/components/ui/aspect-ratio.tsx`) | Already used in LessonContent; Radix primitive, resize-safe |
| Smooth scroll to anchor | `window.scrollTo()` | `document.getElementById('tu-van')?.scrollIntoView({ behavior: 'smooth' })` | Single line, works with React SPA; no library needed |
| Pricing card grid | Flexbox layout | Tailwind grid (`grid-cols-2 lg:grid-cols-3`) | Consistent with existing ClassGrid pattern |

---

## Critical Findings (Answers to Architectural Questions)

### Q1: Does `courses` table have `is_tu_tru`?
**No.** [VERIFIED: `src/lib/api/courses.ts` Course interface — field absent. All migration files checked — no `is_tu_tru` column.]

**Required action:** Create migration `20260518_27_courses_is_tu_tru.sql`:
```sql
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS is_tu_tru boolean NOT NULL DEFAULT false;
```
No data migration needed — `DEFAULT false` is safe for all existing rows.
Also add `is_tu_tru?: boolean` to the `Course` interface in `courses.ts` (optional for backward compat with any code that doesn't select `*`).

### Q2: Does `fetchCoursesPaginated` support `is_tu_tru` filter?
**No server-side filter needed.** [VERIFIED: CataloguePage.tsx L47 — `grade: 'all'` is hardcoded; all courses are fetched, filtering is purely client-side on `filteredCourses`.] The Tứ trụ filter will be an additional client-side predicate on `allCourses`.

### Q3: Does ConsultationForm have `id="tu-van"`?
**No.** [VERIFIED: `src/components/landing/ConsultationForm.tsx` L58 — `<section className="bg-gradient-to-br...">` has no `id` attribute.]

**Required action:** Add `id="tu-van"` to the outer `<section>` in ConsultationForm.tsx.

### Q4: What format does `video_url` store in DB?
**`https://www.youtube.com/embed/{videoId}`** — NOT `youtube-nocookie.com`. [VERIFIED: `src/components/admin/LessonInlineForm.tsx` L~102: `const videoUrl = videoId ? \`https://www.youtube.com/embed/${videoId}\` : null`]

**Impact for VideoPlayer:** The URL detection regex correctly matches `youtube.com` → YouTube path. The `extractYouTubeID` in `src/lib/youtube.ts` handles `youtube.com/embed/{id}` format (pattern 2 in the file). Then VideoPlayer converts to `youtube-nocookie.com/embed/{id}` for the actual iframe src. ✓

### Q5: Will adding Tứ trụ filter break existing CataloguePage tests?
**No.** [VERIFIED: `CataloguePage.test.tsx` — tests mock `fetchCoursesPaginated` returning `{ data: [], total: 0 }` or mock courses without `is_tu_tru`. Adding optional `is_tu_tru?: boolean` to Course interface is backward compatible. The filter logic addition does not break any asserted text content.]

**Required action:** Add new test cases for the Tứ trụ sub-filter behavior.

### Q6: Is `src/lib/youtube.ts` already there?
**Yes.** [VERIFIED: `src/lib/youtube.ts` — exports `extractYouTubeID()` handling all formats including `youtube.com/embed/{id}`.] VideoPlayer MUST import from this file, not duplicate logic.

---

## Common Pitfalls

### Pitfall 1: PricingSection index position in Index.tsx
**What goes wrong:** PricingSection placed after TestimonialsSection or before ClassGrid — wrong visual flow.
**Why it happens:** Not reading current Index.tsx section order.
**How to avoid:** Per UI-SPEC confirmed order: `ClassGrid → IntensiveSection → PricingSection → TestimonialsSection → ConsultationForm`. [VERIFIED: Index.tsx]
**Warning signs:** Section appears below testimonials in browser.

### Pitfall 2: Video URL passes through as youtube-nocookie.com to VideoPlayer
**What goes wrong:** `lesson.video_url` is already `youtube.com/embed/{id}` — if VideoPlayer just passes it through to iframe, it uses regular YouTube domain (no privacy benefits).
**Why it happens:** Not normalising to nocookie domain.
**How to avoid:** VideoPlayer extracts the ID with `extractYouTubeID`, then builds `youtube-nocookie.com/embed/{id}` embed URL.

### Pitfall 3: `is_tu_tru` filter applied when not in 'advanced' grade
**What goes wrong:** `tuTruOnly === true` persists when user switches from 'advanced' to 'grade_7' — results appear to be filtered with no UI indication.
**Why it happens:** Not resetting local state on grade change.
**How to avoid:** `useEffect(() => { if (activeGrade !== 'advanced') setTuTruOnly(false) }, [activeGrade])` — required per UI-SPEC.

### Pitfall 4: `cn()` not used on VideoPlayer className composition
**What goes wrong:** `className` prop override conflicts with base classes.
**Why it happens:** String concatenation instead of `cn()`.
**How to avoid:** Use `cn("rounded-2xl overflow-hidden bg-black shadow-sm", className)` from `@/lib/utils`.

### Pitfall 5: Anchor scroll missing `id="tu-van"` on section wrapper
**What goes wrong:** CTA buttons call `scrollIntoView` on null element (no-op).
**Why it happens:** ConsultationForm currently has no `id` attribute on `<section>`.
**How to avoid:** Add `id="tu-van"` to `<section>` element in ConsultationForm.tsx — this is a required code change.

### Pitfall 6: NO-SCROLL BUG (from CLAUDE.md — occurred 6× before)
**What goes wrong:** Adding `border`, `padding`, or `margin` on a viewport-height wrapper causes 1px overflow → body scrollbar.
**Why it happens:** Mixing border/padding on `min-h-[calc(100vh-Xpx)]`.
**How to avoid:** Landing page additions (PricingSection) are normal-flow sections, not viewport-height wrappers — this pitfall only applies to StudentLayout wrappers. No action needed for Phase 19 landing components.

---

## Code Examples

### PricingSection — Compact Package Data Definition
```tsx
// Source: verified from CONTEXT.md D-04 + UI-SPEC
import { BookOpen, Zap, Target, Trophy, Star } from 'lucide-react'

const PRICING_PACKAGES = [
  { name: 'Lớp 7',     price: '1,5M đ', icon: BookOpen, highlight: false },
  { name: 'Lớp 8',     price: '1,5M đ', icon: BookOpen, highlight: false },
  { name: 'Cấp tốc',   price: '2M đ',   icon: Zap,      highlight: false },
  { name: 'Ôn chuyên', price: '3M đ',   icon: Target,   highlight: false },
  { name: 'Tứ trụ',    price: '2,5M đ', icon: Trophy,   highlight: false },
  { name: 'Toàn bộ',   price: '4M đ',   icon: Star,     highlight: true  },
] as const
```

### ConsultationForm — Add Anchor ID
```tsx
// Source: verified from ConsultationForm.tsx L58
// Before:
<section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
// After:
<section id="tu-van" className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
```

### VideoPlayer — Core Structure
```tsx
// Source: verified from UI-SPEC + src/lib/youtube.ts
import { extractYouTubeID } from '@/lib/youtube'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
}

const isYouTubeUrl = (u: string) =>
  /youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(u)

export default function VideoPlayer({ url, title, className }: VideoPlayerProps) {
  const isYT = isYouTubeUrl(url)
  const videoId = isYT ? extractYouTubeID(url) : null
  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : null

  if (isYT && !embedSrc) {
    // YouTube detected but ID unresolvable — error state
    return <ErrorState className={className} />
  }

  if (embedSrc) {
    return (
      <AspectRatio ratio={16/9} className={cn("rounded-2xl overflow-hidden bg-black shadow-sm", className)}>
        <iframe
          src={embedSrc}
          title={title ?? "Video bài học"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </AspectRatio>
    )
  }

  // Self-hosted
  return (
    <AspectRatio ratio={16/9} className={cn("rounded-2xl overflow-hidden bg-black shadow-sm", className)}>
      <video src={url} controls className="w-full h-full" aria-label={title ?? "Video bài học"} />
    </AspectRatio>
  )
}
```

### CataloguePage — Tứ trụ State + Reset
```tsx
// Source: verified from CataloguePage.tsx + UI-SPEC decision
const [tuTruOnly, setTuTruOnly] = useState(false)

useEffect(() => {
  if (activeGrade !== 'advanced') setTuTruOnly(false)
}, [activeGrade])
```

### Course Interface Extension
```ts
// Source: verified from src/lib/api/courses.ts
export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  target_grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
  is_published: boolean
  is_tu_tru?: boolean   // NEW — optional for backward compat
  created_at: string
  updated_at: string
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Inline `<iframe>` directly in LessonContent | `<VideoPlayer url={...} />` component | Provider-swappable; self-hosted future-ready |
| No Tứ trụ filter in catalogue | `tuTruOnly` state + sub-filter pills | Students can find Tứ trụ courses; NAV-02 fulfilled |
| No pricing on landing page | PricingSection with 6 cards | PRICE-04 fulfilled; CTA flows to existing ConsultationForm |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | — | — | — |

**All claims verified from codebase.** No ASSUMED claims in this research.

---

## Open Questions

1. **Should admin `LessonInlineForm` be updated to store `youtube-nocookie.com` instead of `youtube.com/embed/`?**
   - What we know: Currently stores `youtube.com/embed/{id}`. VideoPlayer normalises on read.
   - What's unclear: Whether normalising on read is sufficient vs. fixing at write time.
   - Recommendation: Out of scope for Phase 19 — VideoPlayer normalises correctly on read. Leave LessonInlineForm unchanged.

2. **Should `is_tu_tru` be admin-settable in UI (admin course edit form)?**
   - What we know: D-09 says static constants, no DB needed for school mapping. But the filter uses `c.is_tu_tru` from DB.
   - What's unclear: How admin will tag courses as Tứ trụ — Phase 19 only adds the DB field.
   - Recommendation: Phase 19 only adds the DB column and filter UI. Admin can set the field directly via Supabase dashboard or via a future admin form. Include a note in the plan.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 19 is purely frontend React + one ALTER TABLE Supabase migration. No external tools or services beyond the project's existing Supabase + Vite stack are required.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test src/pages/student/CataloguePage.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PRICE-04 | PricingSection renders 6 cards with correct prices | unit | `yarn test src/components/landing/PricingSection.test.tsx` | ❌ Wave 0 |
| PRICE-04 | Highlighted card has "Phổ biến" badge | unit | same | ❌ Wave 0 |
| PRICE-04 | CTA button calls scrollIntoView on #tu-van | unit | same | ❌ Wave 0 |
| NAV-01 | IntensiveSection renders PTNK/CNN/CSP/KHTN text | unit | `yarn test src/components/landing/IntensiveSection.test.tsx` | ❌ Wave 0 |
| NAV-02 | Tứ trụ sub-filter hidden when grade ≠ advanced | unit | `yarn test src/pages/student/CataloguePage.test.tsx` | ✅ (add test cases) |
| NAV-02 | Tứ trụ sub-filter visible when grade = advanced | unit | same | ✅ (add test cases) |
| NAV-02 | tuTruOnly filter excludes non-Tứ trụ courses | unit | same | ✅ (add test cases) |
| NAV-02 | tuTruOnly resets when grade leaves 'advanced' | unit | same | ✅ (add test cases) |
| VIDEO-02 | VideoPlayer renders iframe for youtube.com URL | unit | `yarn test src/components/student/VideoPlayer.test.tsx` | ❌ Wave 0 |
| VIDEO-02 | VideoPlayer renders iframe for youtube-nocookie.com URL | unit | same | ❌ Wave 0 |
| VIDEO-02 | VideoPlayer renders `<video>` for non-YouTube URL | unit | same | ❌ Wave 0 |
| VIDEO-02 | VideoPlayer shows error state for invalid YouTube URL | unit | same | ❌ Wave 0 |
| VIDEO-02 | iframe src uses youtube-nocookie.com domain | unit | same | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn test src/...` (specific test file for changed component)
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/components/landing/PricingSection.test.tsx` — covers PRICE-04
- [ ] `src/components/landing/IntensiveSection.test.tsx` — covers NAV-01 (Tứ trụ block)
- [ ] `src/components/student/VideoPlayer.test.tsx` — covers VIDEO-02 (5 test cases)
- [ ] New test cases appended to existing `src/pages/student/CataloguePage.test.tsx` — covers NAV-02

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (low risk) | URL prop is display-only; no user-submitted data |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| iframe src injection (XSS) | Tampering | VideoPlayer constructs src from known-good template (`youtube-nocookie.com/embed/${videoId}`); videoId extracted by regex (alphanumeric only) |
| Open redirect from pricing CTA | Spoofing | CTA only calls `scrollIntoView` — no redirect, no user-controlled URL |

**Note:** `is_tu_tru` is a read-only field from Supabase RLS-protected table — no write path exposed in Phase 19.

---

## Project Constraints (from copilot-instructions.md / CLAUDE.md)

1. **Package manager:** Use `yarn`, not `npm` — `yarn dlx shadcn@latest add <name>` for any new shadcn components.
2. **UI Component Rule:** Always use shadcn/ui or Radix primitives first. Check `src/components/ui/` before building custom.
3. **UI Design Rule:** Always invoke `ui-ux-pro-max` skill before designing/changing UI — ALREADY DONE (UI-SPEC.md exists and is approved).
4. **No emoji icons:** Use Lucide React only. "Phổ biến" badge is text only.
5. **Viewport-filling layout (NO-SCROLL BUG):** Don't add border/padding to viewport-height wrappers. Landing page sections are normal-flow — not affected.
6. **Tailwind + CSS variables:** Use HSL CSS variables for theming; `cn()` for class composition.
7. **Strict mode off:** No `noImplicitAny` required; ESLint unused-vars off.
8. **Testing:** Vitest + React Testing Library; jsdom; globals enabled.
9. **Path alias:** `@/` maps to `src/`.
10. **Product focus:** Vietnamese math education (grades 7–9 + ôn chuyên); UI copy in Vietnamese.

---

## Sources

### Primary (HIGH confidence — verified from codebase)
- `src/lib/api/courses.ts` — Course interface (no `is_tu_tru`); `fetchCoursesPaginated` (client-side filter only)
- `src/pages/student/CataloguePage.tsx` — Grade filter pattern; client-side filteredCourses; no `tuTruOnly` state
- `src/components/landing/ConsultationForm.tsx` — No `id="tu-van"` on section
- `src/components/landing/IntensiveSection.tsx` — Current structure for Tứ trụ block insertion point
- `src/components/landing/ClassGrid.tsx` — Grid + Framer Motion stagger pattern
- `src/pages/Index.tsx` — Section order: ClassGrid → IntensiveSection → TestimonialsSection → ConsultationForm
- `src/components/student/LessonContent.tsx` — Inline iframe at lines 113–122 (AspectRatio wrapper preserved)
- `src/components/admin/LessonInlineForm.tsx` — video_url stored as `youtube.com/embed/{id}` format
- `src/lib/youtube.ts` — `extractYouTubeID` handles 5 formats including embed/
- `src/pages/student/CataloguePage.test.tsx` — Existing test structure; won't break from Phase 19 changes
- `supabase/migrations/` (all files) — No `is_tu_tru` column found
- `.planning/phases/19-landing-navigator-video/19-UI-SPEC.md` — Approved UI contract
- `.planning/phases/19-landing-navigator-video/19-CONTEXT.md` — Locked decisions
- `CLAUDE.md` — Project conventions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in codebase
- Architecture: HIGH — all integration points verified by reading source files
- Pitfalls: HIGH — sourced from CLAUDE.md documented bugs + direct code inspection
- DB schema: HIGH — migration files enumerated; Course interface read directly

**Research date:** 2026-05-18
**Valid until:** 2026-06-18 (stable project, changes unlikely)
