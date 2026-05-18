---
phase: 19
slug: landing-navigator-video
status: approved
shadcn_initialized: true
preset: "default style, cssVariables: true, baseColor: slate"
created: 2026-05-18
reviewed_at: 2026-05-18
---

# Phase 19 — UI Design Contract
## Landing Page + School Navigator + Video Abstraction

> Contract trực quan và tương tác cho Phase 19. Được tạo bởi gsd-ui-researcher,
> xác thực bởi gsd-ui-checker.
> **Nguồn dữ liệu:** 19-CONTEXT.md (locked decisions), codebase scan (existing patterns), REQUIREMENTS.md.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (`components.json` confirmed) |
| Preset | default style — `cssVariables: true`, `baseColor: slate` |
| Component library | Radix UI (via shadcn) |
| Icon library | Lucide React — **không dùng emoji icon** |
| Font | "Be Vietnam Pro" — weights **400** (normal) / **700** (bold) |
| Animation | Framer Motion — `whileInView` + `viewport={{ once: true }}` pattern |

**shadcn components dùng trong Phase 19:** `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Button`, `Badge`, `AspectRatio` — tất cả đã có sẵn, không cần install thêm.

---

## Spacing Scale

Tất cả giá trị là bội số của 4:

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | `gap-1` / `p-1` | Icon gaps, badge padding |
| sm | 8px | `gap-2` / `p-2` | Compact inline spacing |
| md | 16px | `p-4` / `gap-4` | Default element spacing, card inner padding |
| lg | 24px | `p-6` / `gap-6` | Card padding, section sub-headers |
| xl | 32px | `gap-8` / `mt-8` | Block separation within section |
| 2xl | 48px | `py-12` | —  |
| 3xl | 64px | `py-16 md:py-20` | Section vertical padding (landing page standard) |

**Exceptions:**
- Touch targets: `min-h-[44px]` minimum cho tất cả interactive elements (filter pills, CTA buttons)
- Pricing cards: `p-5` (20px) cho `CardContent` — nhất quán với ClassGrid card pattern
- 40px (`mt-10` / `mb-10`): dùng cho spacing giữa section header và card grid (PricingSection, IntensiveSection Tứ trụ block)
- 80px (`md:py-20`): responsive variant của baseline 64px (`py-16`) — dùng cho section vertical padding trên tablet/desktop

---

## Typography

| Role | Size | Weight | Line Height | Tailwind class |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | `text-base text-muted-foreground` |
| Label | 14px | **700** | 1.4 | `text-sm font-bold` |
| Heading | 30–36px | **700** | 1.25 | `text-3xl font-bold tracking-tight md:text-4xl` |
| Display | 36–48px | **700** | 1.1 | `text-4xl font-bold md:text-6xl` |

> ⚠️ **Exactly 2 weights used:** `font-normal` (400) for body/muted/error body; `font-bold` (700) for labels, headings, CTAs, badges, pills, price display.

**Font cụ thể:**
- Section title (PricingSection heading): `text-3xl font-bold tracking-tight md:text-4xl` — nhất quán với ClassGrid và IntensiveSection
- Price display: `text-3xl font-bold text-primary` (số tiền)
- Badge "Phổ biến": `text-sm font-bold` (14px — Label role; tối thiểu để đảm bảo contrast 3.2:1 trên `bg-primary/10`)
- Filter pill label: `text-sm font-bold` (nhất quán với GRADE_FILTERS hiện tại trong CataloguePage)
- VideoPlayer error text: `text-sm font-normal text-muted-foreground`

---

## Color

| Role | Value | Tailwind | Usage |
|------|-------|----------|-------|
| Dominant (60%) | `#FFFFFF` | `bg-background` / `bg-card` | Page background, card backgrounds |
| Secondary (30%) | `hsl(30 20% 94%)` | `bg-muted` / gradient overlays | Section gradient bg, muted areas |
| Accent (10%) | `#F97316` | `text-primary` / `bg-primary` | Xem danh sách bên dưới |
| Destructive | `hsl(0 84% 60%)` | `text-destructive` | Error state VideoPlayer (khi URL không hợp lệ) |

> **Contrast note:** `#F97316` (primary) on white `#FFFFFF` = 3.2:1 — satisfies WCAG AA for **large text only**.
> `/* Contrast: 3.2:1 — large text only; badge must be ≥14px bold (text-sm font-bold) */`
> Badge "Phổ biến" uses `bg-primary/10 text-primary` — badge text must remain `text-sm font-bold` (≥14px bold) to meet contrast threshold.

**Accent `#F97316` dành riêng cho:**
1. Primary CTA button fill (`bg-primary text-white` — button "Đăng ký tư vấn")
2. Highlighted pricing card border (`border-primary border-2` — gói "Toàn bộ")
3. Badge "Phổ biến" (`bg-primary/10 text-primary`)
4. Section accent label (`bg-primary/10 text-primary rounded-full`) — pattern IntensiveSection
5. Price display text (`text-primary font-bold`)
6. Active filter pill ("Tứ trụ" khi selected)
7. Icon accent trong pricing cards (Lucide icon, `text-primary`)

**Gradient section backgrounds (landing page):**
- IntensiveSection: `bg-gradient-to-br from-primary/5 via-background to-accent/5` *(giữ nguyên)*
- PricingSection: `bg-gradient-to-br from-primary/5 via-background to-secondary/20` *(nhất quán với Index.tsx wrapper)*
- ConsultationForm: `bg-gradient-to-br from-primary/10 via-primary/5 to-background` *(giữ nguyên)*

**Landing page KHÔNG dùng** `bm-glass-card` (dành cho Phase 20 student/admin).
Pricing cards dùng shadcn `Card` với class `shadow-md` + hover `hover:shadow-xl hover:-translate-y-1` — nhất quán với ClassGrid.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| PricingSection heading | `Học phí <span class="text-primary">minh bạch</span>` |
| PricingSection subheading | `Chọn gói phù hợp — học phí rõ ràng, không phí ẩn` |
| Primary CTA (mỗi pricing card) | `Đăng ký tư vấn` |
| Badge highlight | `Phổ biến` (text only — không dùng emoji) |
| VND format | `1,5M đ` — compact format cho mobile; ví dụ đầy đủ: `1,5M đ`, `2M đ`, `3M đ`, `4M đ` |
| Tứ trụ section label (IntensiveSection) | `Tứ trụ trường chuyên TPHCM` |
| Tứ trụ description text | `Lộ trình chuyên biệt cho học sinh nhắm đến PTNK, CNN, CSP và KHTN — 4 trường chuyên Toán hàng đầu Thành phố Hồ Chí Minh.` |
| Filter pill "Tất cả" (Tứ trụ toggle) | `Tất cả` |
| Filter pill "Tứ trụ" | `Tứ trụ` |
| Filter pill ARIA label | `Lọc khóa học Tứ trụ trường chuyên` |
| VideoPlayer error heading | `Không thể tải video` |
| VideoPlayer error body | `Đường dẫn video không hợp lệ hoặc không được hỗ trợ.` |
| VideoPlayer locked heading | `Bài học bị khoá` *(giữ nguyên từ LessonContent)* |
| VideoPlayer locked body | `Bạn chưa có gói học phù hợp` *(giữ nguyên từ LessonContent)* |
| Empty state (filter Tứ trụ — 0 kết quả) | heading: `Chưa có khóa học Tứ trụ` / body: `Hãy liên hệ BuMath để được tư vấn lộ trình phù hợp.` |

**Destructive actions trong Phase 19:** Không có. Phase 19 không thực hiện delete/destroy operations.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | `Card`, `Button`, `Badge`, `AspectRatio` | not required — official registry |

**Third-party registries:** Không có. Không cần vetting gate.

---

## Deliverable 1 — PricingSection

**File:** `src/components/landing/PricingSection.tsx`
**Requirement:** PRICE-04
**Decision source:** CONTEXT.md D-03, D-04, D-05, D-06

### Visual Spec

```
Section wrapper:
  <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
    <div className="container">
      {/* Section header */}
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          Học phí <span className="text-primary">minh bạch</span>
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          Chọn gói phù hợp — học phí rõ ràng, không phí ẩn
        </p>
      </div>

      {/* Card grid: 1-col mobile → 2-col sm → 3-col lg */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 6 pricing cards với stagger animation */}
      </div>
    </div>
  </section>
```

**Focal point:** Gói "Toàn bộ" highlighted card (`border-primary border-2` + Badge "Phổ biến") là điểm nhìn chính — draws the eye first before other cards.

**Pricing data (6 cards):**

| Tên gói | Giá | Highlight | Icon (Lucide) |
|---------|-----|-----------|---------------|
| Lớp 7 | 1,5M đ | Không | `BookOpen` |
| Lớp 8 | 1,5M đ | Không | `BookOpen` |
| Cấp tốc | 2M đ | Không | `Zap` |
| Ôn chuyên | 3M đ | Không | `Target` |
| Tứ trụ | 2,5M đ | Không | `Trophy` |
| Toàn bộ | 4M đ | **Có** — border + badge | `Star` |

**Card anatomy (mỗi card):**

```tsx
<Card className={cn(
  "group cursor-pointer overflow-hidden border shadow-md transition-all hover:-translate-y-1 hover:shadow-xl",
  isHighlighted && "border-primary border-2"
)}>
  <CardHeader className="pb-3 pt-5 px-5">
    {/* Badge "Phổ biến" — chỉ gói Toàn bộ */}
    {isHighlighted && (
      <span className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
        Phổ biến
      </span>
    )}
    {/* Icon */}
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <PackageIcon className="h-5 w-5" />
    </div>
    {/* Title */}
    <h3 className="text-base font-bold">{name}</h3>
    {/* Price */}
    <div className="mt-1 text-3xl font-bold text-primary">{price}</div>
  </CardHeader>
  <CardFooter className="px-5 pb-5 pt-0">
    <Button
      className="w-full gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => document.getElementById('tu-van')?.scrollIntoView({ behavior: 'smooth' })}
    >
      Đăng ký tư vấn
    </Button>
  </CardFooter>
</Card>
```

### Interaction Spec

| State | Visual |
|-------|--------|
| Default | `shadow-md`, white background, 1px border |
| Default (highlighted) | `shadow-md`, `border-primary border-2` |
| Hover | `hover:-translate-y-1 hover:shadow-xl` — transition 200ms ease |
| CTA button default | `bg-primary text-white` + `shadow-lg shadow-primary/25` |
| CTA button hover | `opacity-90 translateY(-1px)` — via `.bm-btn-cta:hover` |
| CTA button focus | `focus-visible:ring-2 focus-visible:ring-ring` (shadcn default) |

### Animation (Framer Motion)

```tsx
<motion.div
  key={pkg.name}
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, delay: i * 0.08 }}
>
  <PricingCard ... />
</motion.div>
```

### Responsive Breakpoints

| Breakpoint | Grid columns |
|------------|-------------|
| 375px (mobile) | 1 column |
| 640px (sm) | 2 columns |
| 1024px (lg) | 3 columns |
| 1440px (2xl) | 3 columns (max-width: 1400px container) |

### Scroll Anchor

`ConsultationForm` section cần thêm `id="tu-van"` trên element `<section>`:

```tsx
// src/components/landing/ConsultationForm.tsx
<section id="tu-van" className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
```

### Accessibility

- Mỗi `Card` là một `<article>` hoặc wrapped trong `<li>` nếu dùng `<ul>` grid
- Price `<div>`: đi kèm `aria-label` nếu dùng compact format: `aria-label="Giá: 1,5 triệu đồng"`
- CTA Button: `aria-label="Đăng ký tư vấn gói {tên gói}"` để phân biệt các nút
- Badge "Phổ biến": `<span aria-label="Gói phổ biến nhất">Phổ biến</span>`

### Index.tsx Integration

```tsx
// Thêm import
import PricingSection from "@/components/landing/PricingSection";

// Thêm vào JSX sau IntensiveSection
<IntensiveSection />
<PricingSection />       {/* ← thêm đây */}
<TestimonialsSection />
```

---

## Deliverable 2 — IntensiveSection Tứ trụ Block

**File:** `src/components/landing/IntensiveSection.tsx` *(update)*
**Requirement:** LAND-03, NAV-01
**Decision source:** CONTEXT.md D-01

### Visual Spec

Thêm một `motion.div` **bên dưới** `<div className="grid items-center gap-10 lg:grid-cols-2">` (sau grid layout của section), bên trong cùng `<div className="container">`:

```tsx
{/* Tứ trụ text block — full width below the 2-col grid */}
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
  <p className="text-sm text-muted-foreground leading-relaxed">
    Lộ trình chuyên biệt cho học sinh nhắm đến{" "}
    <span className="font-bold text-foreground">PTNK</span>,{" "}
    <span className="font-bold text-foreground">CNN</span>,{" "}
    <span className="font-bold text-foreground">CSP</span> và{" "}
    <span className="font-bold text-foreground">KHTN</span>{" "}
    — 4 trường chuyên Toán hàng đầu Thành phố Hồ Chí Minh.
  </p>
</motion.div>
```

### Visual Details

- Background: `bg-card` (trắng) với `border` mỏng (1px) — không dùng `bm-clay-card` (quá nặng cho text block phụ)
- Padding: `p-5` (20px) — nhất quán với feature cards trong section
- Border radius: `rounded-2xl`
- Shadow: `shadow-sm` — nhẹ hơn feature cards
- Label badge: `bg-primary/10 text-primary rounded-full` — tái sử dụng pattern từ IntensiveSection heading badge
- School names (PTNK, CNN, CSP, KHTN): `font-bold text-foreground` — nhấn mạnh trong dòng text muted
- Full width (span across cả hai cột của parent grid)

### Interaction Spec

- Không có interactive element trong block này (text-only theo D-01)
- Không hover state
- Animation: `whileInView` với `once: true`

---

## Deliverable 3 — VideoPlayer Component

**File:** `src/components/student/VideoPlayer.tsx` *(new)*
**Requirement:** VIDEO-02
**Decision source:** CONTEXT.md D-11, D-12, D-13

### Props Interface

```typescript
interface VideoPlayerProps {
  url: string;
  title?: string;          // Dùng cho iframe title attribute (a11y)
  className?: string;      // Override wrapper class nếu cần
}
```

**Lý do chọn placement `src/components/student/`:** Component hiện tại chỉ được dùng trong `LessonContent.tsx` (student context). Khi cần dùng ở chỗ khác, có thể move sang `src/components/shared/` — không break interface.

### Provider Detection Logic

```typescript
// URL detection regex
const isYouTube = (url: string) =>
  /youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(url);

// Extract YouTube video ID
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,          // youtube.com/watch?v=ID
    /youtu\.be\/([^?]+)/,                       // youtu.be/ID
    /youtube-nocookie\.com\/embed\/([^?]+)/,    // already embed
    /youtube\.com\/embed\/([^?]+)/,             // youtube.com/embed/ID
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

// YouTube embed URL convention (Phase 14 D-11)
const toNoCookieEmbed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}`;
```

### Render States

**State 1 — YouTube URL (valid ID):**

```tsx
<AspectRatio ratio={16 / 9} className={cn("rounded-2xl overflow-hidden bg-black shadow-sm", className)}>
  <iframe
    src={toNoCookieEmbed(videoId)}
    title={title ?? "Video bài học"}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="w-full h-full border-0"
  />
</AspectRatio>
```

**State 2 — Self-hosted (non-YouTube URL):**

```tsx
<AspectRatio ratio={16 / 9} className={cn("rounded-2xl overflow-hidden bg-black shadow-sm", className)}>
  <video
    src={url}
    controls
    className="w-full h-full"
    aria-label={title ?? "Video bài học"}
  />
</AspectRatio>
```

**State 3 — Invalid / unresolvable URL (YouTube detected but ID = null):**

```tsx
<AspectRatio ratio={16 / 9} className={cn("rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200", className)}>
  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
    <div className="h-16 w-16 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
      <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
    </div>
    <div className="text-center">
      <p className="text-base font-bold text-slate-600">Không thể tải video</p>
      <p className="text-sm text-slate-400 mt-1">Đường dẫn video không hợp lệ hoặc không được hỗ trợ.</p>
    </div>
  </div>
</AspectRatio>
```

### LessonContent Integration

Thay thế inline `<iframe>` tại `LessonContent.tsx` (lines 113–122):

```tsx
// Before:
<AspectRatio ratio={16 / 9} className="rounded-2xl overflow-hidden bg-black shadow-sm">
  <iframe
    src={lesson.video_url}
    title={`Video bài học: ${lesson.title}`}
    ...
  />
</AspectRatio>

// After:
<VideoPlayer
  url={lesson.video_url}
  title={`Video bài học: ${lesson.title}`}
/>
```

Giữ nguyên wrapper `<div className="px-4 md:px-8 py-6 space-y-6"><div className="max-w-4xl">`.

### Responsive

- Aspect ratio 16:9 forced qua `AspectRatio` (Radix) — responsive tự động theo container width
- `max-w-4xl` wrapper được giữ nguyên từ LessonContent — không thay đổi

### Accessibility

- `<iframe>`: `title` prop bắt buộc (được cung cấp từ `title` prop hoặc fallback `"Video bài học"`)
- `<video>`: `aria-label` + native `controls` (keyboard accessible)
- Error state: `aria-hidden="true"` trên decorative icon; text content là accessible
- `allowFullScreen` trên iframe cho trải nghiệm fullscreen

---

## Deliverable 4 — Tứ trụ Filter (CataloguePage)

**File:** `src/pages/student/CataloguePage.tsx` *(update)*
**Requirement:** NAV-02
**Decision source:** CONTEXT.md D-07, D-08, D-09, D-10

### Filter Architecture

Thêm **secondary sub-filter row** chỉ visible khi `activeGrade === 'advanced'`. Dùng state độc lập `tuTruOnly: boolean` (không merge vào URL params — filter client-side).

```typescript
const [tuTruOnly, setTuTruOnly] = useState(false);

// Reset Tứ trụ filter khi grade thay đổi khỏi 'advanced'
useEffect(() => {
  if (activeGrade !== 'advanced') setTuTruOnly(false);
}, [activeGrade]);
```

### Sub-filter UI

Đặt **dưới** existing `GRADE_FILTERS` pill row, **trên** course grid:

```tsx
{/* Tứ trụ sub-filter — chỉ hiện khi grade = advanced */}
{activeGrade === 'advanced' && (
  <div className="flex gap-2 mb-4">
    {[
      { value: false, label: 'Tất cả' },
      { value: true,  label: 'Tứ trụ', ariaLabel: 'Lọc khóa học Tứ trụ trường chuyên' },
    ].map(opt => (
      <button
        key={String(opt.value)}
        onClick={() => setTuTruOnly(opt.value)}
        aria-label={opt.ariaLabel}
        aria-pressed={tuTruOnly === opt.value}
        className={[
          'rounded-full px-4 py-2 text-sm font-bold transition-colors duration-150 cursor-pointer min-h-[44px] border',
          tuTruOnly === opt.value
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground',
        ].join(' ')}
      >
        {opt.label}
      </button>
    ))}
  </div>
)}
```

### Filter Logic

```typescript
// Extended client-side filter — thêm tuTruOnly condition
const filteredCourses = allCourses.filter(c => {
  const matchesGrade  = activeGrade === 'all' || c.target_grade === activeGrade;
  const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  const matchesTuTru  = !tuTruOnly || c.is_outstanding === true;  // ← thêm condition
  return matchesGrade && matchesSearch && matchesTuTru;
});
```

**Course type extension:**

```typescript
// Trong src/lib/api/courses.ts — thêm field
export interface Course {
  // ... existing fields
  is_outstanding?: boolean;   // boolean field từ DB; optional cho backward compat
}
```

### Visual Spec — Sub-filter Pill

| State | Style |
|-------|-------|
| Active (selected) | `bg-primary text-primary-foreground border-primary` — orange fill |
| Inactive | `bg-background text-muted-foreground border-border` |
| Hover (inactive) | `hover:bg-muted hover:text-foreground` |
| Min touch target | `min-h-[44px]` |
| Border radius | `rounded-full` |
| Typography | `text-sm font-bold` |
| Transition | `transition-colors duration-150` |

**Color của active Tứ trụ pill:**
- Dùng `bg-primary text-primary-foreground` (orange #F97316 — khác với GRADE_FILTERS hiện tại dùng `bg-indigo-600`)
- Rationale: Tứ trụ sub-filter là accent action (primary brand color), grade filter là navigation state (indigo)

### Empty State (Tứ trụ filter — 0 results)

Thêm vào empty state check hiện tại:

```tsx
{!coursesLoading && !coursesError && allCourses.length > 0 && filteredCourses.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <Search className="h-16 w-16 text-indigo-400" aria-hidden="true" />
    <h2 className="text-base font-bold text-slate-800">
      {tuTruOnly ? 'Chưa có khóa học Tứ trụ' : 'Không tìm thấy kết quả'}
    </h2>
    <p className="text-base text-muted-foreground max-w-sm">
      {tuTruOnly
        ? 'Hãy liên hệ BuMath để được tư vấn lộ trình phù hợp.'
        : 'Thử thay đổi từ khóa hoặc chọn lớp khác.'}
    </p>
  </div>
)}
```

### Accessibility

- `aria-pressed` trên mỗi filter pill (toggle button pattern)
- `aria-label="Lọc khóa học Tứ trụ trường chuyên"` trên "Tứ trụ" pill
- Sub-filter row role: không cần explicit `role="group"` — pills standalone là sufficient

---

## Responsive Breakpoints (toàn Phase)

| Breakpoint | px | Tailwind | Notes |
|------------|-----|----------|-------|
| Mobile | 375 | (base) | 1-col PricingSection, filter pills wrap |
| Tablet | 640 | `sm:` | 2-col PricingSection |
| Laptop | 1024 | `lg:` | 3-col PricingSection, 2-col IntensiveSection |
| Desktop | 1440 | `2xl:` | container max-width 1400px |

---

## Integration Checklist

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Import + render `<PricingSection />` after `<IntensiveSection />` |
| `src/components/landing/ConsultationForm.tsx` | Add `id="tu-van"` to `<section>` |
| `src/components/landing/IntensiveSection.tsx` | Add Tứ trụ text block below 2-col grid |
| `src/components/landing/PricingSection.tsx` | **Create new** |
| `src/components/student/VideoPlayer.tsx` | **Create new** |
| `src/components/student/LessonContent.tsx` | Replace inline `<iframe>` with `<VideoPlayer>` |
| `src/pages/student/CataloguePage.tsx` | Add Tứ trụ sub-filter state + UI + filter logic |
| `src/lib/api/courses.ts` | Add `is_outstanding?: boolean` to `Course` interface |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

*Phase: 19 — Landing Page + School Navigator + Video Abstraction*
*UI-SPEC generated: 2026-05-18*
*Source: 19-CONTEXT.md (locked decisions) + codebase scan*
