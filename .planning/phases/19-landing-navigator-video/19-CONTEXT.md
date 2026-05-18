# Phase 19: Landing Page + School Navigator + Video Abstraction - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 19 delivers:
1. **Landing page enhancements** — Thêm text Tứ trụ (PTNK/CNN/CSP/KHTN) vào IntensiveSection; thêm PricingSection với 6 gói học phí.
2. **School Navigator** — Filter "Tứ trụ" trong `/danh-muc` (catalog page), chỉ hiện khi grade = advanced; cho phép học sinh lọc khóa ôn chuyên theo nhãn Tứ trụ.
3. **VideoPlayer abstraction** — Component `VideoPlayer` wrap YouTube iframe và self-hosted `<video>`, auto-detect provider từ URL.

Ngoài phạm vi phase này:
- Tách ClassGrid thành cơ bản / nâng cao (LAND-01/LAND-02 bỏ qua — user confirmed không cần).
- Per-school detail mapping (PTNK/CNN/CSP/KHTN → khóa học riêng) — không cần, chỉ dùng tag Tứ trụ tổng quát.
- 4 card Tứ trụ riêng trong IntensiveSection — chỉ thêm text mô tả.
- Mock exam hoặc chat tính năng (Phase 17–18).

</domain>

<decisions>
## Implementation Decisions

### Landing page — Tứ trụ content
- **D-01:** `IntensiveSection` được mở rộng — thêm text mô tả Tứ trụ (PTNK/CNN/CSP/KHTN) bên dưới nội dung hiện tại. Không tách 4 card riêng.
- **D-02:** ClassGrid (3 card Toán 7/8/9) giữ nguyên, không thêm sub-category cơ bản/nâng cao.

### Pricing section
- **D-03:** Thêm `PricingSection` mới trên landing page (sau IntensiveSection) với 6 shadcn Card.
- **D-04:** 6 gói và giá: Lớp 7 (1.5M VND), Lớp 8 (1.5M VND), Cấp tốc (2M VND), Ôn chuyên (3M VND), Tứ trụ (2.5M VND), Toàn bộ (4M VND).
- **D-05:** Gói "Toàn bộ" (4M) có badge "Phổ biến" và được highlight (border primary).
- **D-06:** CTA "Đăng ký tư vấn" trên mỗi card scroll xuống `ConsultationForm` hiện có (anchor scroll — không route mới).

### School Navigator / Catalog filter
- **D-07:** Filter "Tứ trụ trường chuyên" nằm trong `/danh-muc` (catalog page), không phải landing page section riêng.
- **D-08:** Filter chỉ hiển thị khi grade filter đang là `advanced` (ôn chuyên). Khi grade khác → filter Tứ trụ ẩn.
- **D-09:** Static constants — không cần DB. Map đơn giản: tag `is_outstanding` (boolean hoặc field trên course) hoặc slug-based filter. Không cần per-school detail.
- **D-10:** Options filter: "Tất cả" (default) và "Tứ trụ". Khi chọn "Tứ trụ" → chỉ hiện course ôn chuyên có nhãn Tứ trụ.

### VideoPlayer abstraction
- **D-11:** Component `VideoPlayer` nhận `url` prop duy nhất; auto-detect provider từ URL pattern: `youtube.com` / `youtu.be` / `youtube-nocookie.com` → YouTube iframe, còn lại → self-hosted `<video>` tag.
- **D-12:** Phase này chỉ *wrap* YouTube embed, không xóa YouTube. Self-hosted path là future-ready, chưa cần data thật.
- **D-13:** Component thay thế inline YouTube iframe trong `LessonContent` — không break parent.

### Agent's Discretion
- Props interface VideoPlayer: agent quyết chi tiết (`url` only hay `url` + optional `provider` override, `className`, `title` a11y).
- Reusability scope VideoPlayer: agent quyết đặt ở `src/components/shared/` hay `src/components/ui/` cho phù hợp với codebase pattern.
- Aspect ratio / responsive wrapper của VideoPlayer.
- Fallback/error state khi URL không hợp lệ.
- Column layout cho 6 pricing cards trên mobile (2-col) vs desktop (3-col hoặc 6-col).
- Animation stagger cho PricingSection (Framer Motion đã có sẵn).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — NAV-01, NAV-02, LAND-01 (bỏ qua theo user), LAND-02 (bỏ qua), LAND-03, VIDEO-02, PRICE-04
- `.planning/ROADMAP.md` §Phase 19 — Success criteria đầy đủ (xem ghi chú: LAND-01/02 không cần làm)

### Existing landing page components
- `src/pages/Index.tsx` — Landing page shell, import order, provider wrapping
- `src/components/landing/ClassGrid.tsx` — Pattern cho grid section với Framer Motion
- `src/components/landing/IntensiveSection.tsx` — Section cần mở rộng với Tứ trụ text
- `src/components/landing/ConsultationForm.tsx` — Anchor scroll target cho CTA pricing

### Catalog page (navigator filter)
- `src/pages/` — Tìm catalog/danh-muc page để thêm filter Tứ trụ

### Video (current implementation)
- `src/components/student/LessonContent.tsx` — Nơi hiện đang embed YouTube iframe trực tiếp → replace với VideoPlayer

### Prior decisions
- `.planning/phases/14-pricing-access-control/14-CONTEXT.md` — Package model và pricing data đã có trong DB (PRICE-04 là display-only trên landing)
- `.planning/STATE.md` — Phase 20 scope: UI overhaul student/admin — **không** include landing page (landing page style là Phase 19 tự quyết)

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shadcn Card` (`src/components/ui/card.tsx`) — Pricing cards dùng component này; đã có sẵn
- `Framer Motion` — Đã dùng trong ClassGrid và IntensiveSection; dùng lại cho PricingSection stagger animation
- `ConsultationForm` — Có `id` hoặc cần thêm `id` để anchor scroll từ pricing CTA
- `src/lib/constants/grades.ts` — Pattern constants file; Tứ trụ filter constants đặt cùng chỗ hoặc tạo `school-programs.ts` mới

### Established Patterns
- Section structure: `<section className="py-16 md:py-20"><div className="container">...</div></section>` — dùng nhất quán cho PricingSection mới
- Motion.div với `whileInView` + `viewport={{ once: true }}` — animation pattern cho landing sections
- Filter trong catalog: xem pattern filter grade hiện tại để thêm filter Tứ trụ nhất quán

### Integration Points
- `src/pages/Index.tsx` — Import và đặt `<PricingSection />` sau `<IntensiveSection />`
- `src/components/landing/IntensiveSection.tsx` — Thêm block Tứ trụ text bên dưới features grid
- Catalog page (`/danh-muc`) — Thêm filter chip/dropdown Tứ trụ, chỉ render khi `grade === 'advanced'`
- `src/components/student/LessonContent.tsx` — Swap inline iframe với `<VideoPlayer url={lesson.video_url} />`

</code_context>

<specifics>
## Specific Ideas

- **Tứ trụ text trong IntensiveSection**: Đề cập đích danh PTNK, CNN, CSP, KHTN — các trường chuyên Toán hàng đầu HCM.
- **Pricing badge**: Text "Phổ biến" (không dùng emoji icon theo design guideline).
- **Pricing VND format**: "1.500.000 đ" hoặc "1,5M đ" — agent quyết format nhất quán.
- **VideoPlayer**: Khi detect YouTube URL, dùng `youtube-nocookie.com` embed domain (đã là convention của codebase theo Phase 14 D-11).

</specifics>

<deferred>
## Deferred Ideas

- **Per-school khóa học detail** (PTNK page riêng, CNN page riêng) — không làm Phase 19; có thể là Phase sau nếu cần.
- **LAND-01/LAND-02** (section riêng cho Toán 7 cơ bản/nâng cao, Toán 8 cơ bản/nâng cao) — user confirmed không cần làm.
- **4 card Tứ trụ có CTA riêng** — đơn giản hóa thành text-only trong Phase 19.

</deferred>

---

*Phase: 19-Landing-Navigator-Video*
*Context gathered: 2026-05-18*
