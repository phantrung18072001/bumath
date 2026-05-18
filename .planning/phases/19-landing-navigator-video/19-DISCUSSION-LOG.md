# Phase 19: Landing Page + School Navigator + Video Abstraction - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 19-landing-navigator-video
**Areas discussed:** Course content sections, School Navigator, Pricing section, VideoPlayer abstraction

---

## Course Content Sections

| Option | Description | Selected |
|--------|-------------|----------|
| Expand ClassGrid inline | Mỗi card lớp mở rộng ra 2 sub-card (Cơ bản / Nâng cao) | |
| New section riêng | Giữ ClassGrid cũ, thêm section mới bên dưới mô tả từng chương trình | |
| Replace ClassGrid | Viết lại ClassGrid thành 6 card (7-Cơ bản, 7-Nâng cao, ...) | |
| Không chia cơ bản/nâng cao | Chỉ thêm text Tứ trụ vào IntensiveSection | ✓ |

**User's choice:** Không chia ClassGrid. Tứ trụ (PTNK/CNN/CSP/KHTN) chỉ thêm text vào IntensiveSection, không tách 4 card riêng. LAND-01/LAND-02 không cần làm.

| Option Tứ trụ | Description | Selected |
|---------------|-------------|----------|
| Tab trong IntensiveSection | Thêm tabs A→Z / Cấp tốc / Tứ trụ | |
| Expand IntensiveSection | Giữ phần cũ + thêm sub-section Tứ trụ (4 card) | |
| New section riêng | Section "Tứ trụ trường chuyên" hoàn toàn mới | |
| Chỉ thêm text | Không card, chỉ text mô tả | ✓ |

**Notes:** User xác nhận scope đơn giản hơn requirements ban đầu — LAND-01/02 bỏ qua hoàn toàn.

---

## School Navigator

| Option | Description | Selected |
|--------|-------------|----------|
| Section trong landing page | Nằm trong IntensiveSection (dropdown chọn trường + nút Tìm kiếm) | |
| Section riêng | SchoolNavigatorSection riêng giữa landing page | |
| Modal / overlay | Click nút "Tìm trường" mở modal chọn trường | |
| Filter trong /danh-muc | Thêm filter dropdown "Tứ trụ trường chuyên" bên cạnh filter grade | ✓ |

**User's choice:** Không phải section/navigator trên landing page. Chỉ thêm filter "Tứ trụ / All" trong `/danh-muc` khi grade=advanced.

| Option visibility | Description | Selected |
|-------------------|-------------|----------|
| Chỉ khi grade=advanced | Filter chỉ hiện khi đang lọc theo "Ôn chuyên" | ✓ |
| Luôn hiển thị | Dropdown trường chuyên luôn có trong /danh-muc | |

**Notes:** Per-school detail mapping (PTNK → khóa học riêng) không cần. Chỉ cần tag Tứ trụ tổng quát.

---

## Pricing Section

| Option | Description | Selected |
|--------|-------------|----------|
| Pricing cards (shadcn Card) | 6 cards với tên gói, giá VND, CTA "Đăng ký tư vấn" | ✓ |
| Bảng so sánh (Table) | Bảng 6 cột | |
| Simple list | List văn bản 6 dòng | |

| CTA option | Description | Selected |
|------------|-------------|----------|
| Scroll đến ConsultationForm | Click CTA cưỡng bức scroll xuống form tư vấn hiện có | ✓ |
| Link /dang-ky | CTA link đến trang đăng ký | |
| Open WhatsApp/Zalo link | Click mở chat trực tiếp | |

| Highlight option | Description | Selected |
|-----------------|-------------|----------|
| Có highlight 1 gói | Border primary, badge "Phổ biến" | ✓ |
| Tất cả đồng đều | 6 card giống nhau | |

| Gói highlight | Selected |
|---------------|----------|
| Gói "Toàn bộ" (4M) | ✓ |
| Gói "Ôn chuyên" (3M) | |

**Notes:** 6 gói giá: Lớp 7 (1.5M), Lớp 8 (1.5M), Cấp tốc (2M), Ôn chuyên (3M), Tứ trụ (2.5M), Toàn bộ (4M). Badge text "Phổ biến".

---

## VideoPlayer Abstraction

| Option | Description | Selected |
|--------|-------------|----------|
| provider + url props | `<VideoPlayer provider="youtube" url="..." />` | |
| Chỉ url (auto-detect) | `<VideoPlayer url="..." />` auto-detect từ URL pattern | You decide ✓ |

| Scope option | Description | Selected |
|-------------|-------------|----------|
| Thế chỗ inline iframe | Chỉ dùng trong LessonContent (1 nơi) | |
| Shared component | Có thể dùng nhiều nơi | You decide ✓ |

**Notes:** Agent quyết props interface và scope. Constraint: wrap YouTube không xóa YouTube; dùng `youtube-nocookie.com` embed theo convention Phase 14.

---

## Agent's Discretion

- Props interface VideoPlayer: `url` only vs `url` + optional `provider` override
- VideoPlayer: className, title (a11y), aspect ratio wrapper, responsive behavior
- VideoPlayer: fallback/error state khi URL không hợp lệ
- VideoPlayer placement: `src/components/shared/` vs `src/components/ui/`
- Pricing cards: column layout mobile (2-col) vs desktop (3-col hay 6-col)
- Pricing VND format: "1.500.000 đ" hay "1,5M đ"
- Animation stagger cho PricingSection

## Deferred Ideas

- Per-school khóa học detail (PTNK/CNN/CSP/KHTN page riêng) — future phase
- LAND-01/LAND-02 (section riêng Toán 7/8 cơ bản + nâng cao) — user confirmed không cần
- 4 card Tứ trụ có CTA riêng — đơn giản hóa thành text-only
