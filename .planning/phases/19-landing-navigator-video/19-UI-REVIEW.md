# Phase 19 — UI Review

**Audited:** 2026-05-25
**Baseline:** UI-SPEC.md (`19-UI-SPEC.md`)
**Screenshots:** not captured (no dev server on 3000/5173; localhost:8080 did not map to audited app route set)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Copy phần lớn đúng intent, nhưng Tứ trụ block lệch nội dung chuẩn trong UI-SPEC. |
| 2. Visuals | 2/4 | `PricingSection` không xuất hiện trên landing do chưa được mount ở `Index.tsx`. |
| 3. Color | 3/4 | Palette nhất quán, có một hardcoded accent còn tồn tại trong lesson badge. |
| 4. Typography | 2/4 | Vượt contract 2-weight: còn `font-medium` và `font-semibold` ở màn liên quan. |
| 5. Spacing | 3/4 | Spacing scale ổn, touch target đạt chuẩn ở pills/CTA phase 19. |
| 6. Experience Design | 3/4 | State handling tốt (loading/error/empty), nhưng thiếu deliverable hiển thị pricing ở trang đích làm giảm UX flow. |

**Overall: 16/24**

---

## Top 3 Priority Fixes

1. **Mount lại `PricingSection` trong landing page** — Người dùng không thấy bảng học phí/CTA tư vấn — thêm import + render sau `IntensiveSection` trong `Index.tsx`.
2. **Sửa nội dung Tứ trụ block theo contract** — Thông điệp trường chuyên đang lệch chuẩn copy đã duyệt — cập nhật label + đoạn mô tả để khớp `19-UI-SPEC.md`.
3. **Chuẩn hóa typography về 2 weight** — Hiện còn `font-medium`/`font-semibold` gây thiếu nhất quán — thay bằng `font-normal`/`font-bold` tại các vị trí liên quan.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)
- Contract yêu cầu label `Tứ trụ trường chuyên TPHCM`; hiện tại là `Tứ trụ trường chuyên` tại [IntensiveSection.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/landing/IntensiveSection.tsx:71).
- Contract yêu cầu nhắc PTNK/CNN/CSP/KHTN; hiện copy dùng tên dài và câu kết `4 trường chuyên Toán hàng đầu Việt Nam` tại [IntensiveSection.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/landing/IntensiveSection.tsx:75).
- Copy trạng thái lỗi video và filter empty-state rõ ràng, dễ hiểu tại [VideoPlayer.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/student/VideoPlayer.tsx:26) và [CataloguePage.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/pages/student/CataloguePage.tsx:189).

### Pillar 2: Visuals (2/4)
- Lỗi chính: `PricingSection` chưa được render ở trang landing; `Index.tsx` không import và không mount component này tại [Index.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/pages/Index.tsx:16).
- `PricingSection` bản thân có hierarchy tốt (heading, card highlight, icon, CTA) tại [PricingSection.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/landing/PricingSection.tsx:33) nhưng hiện không tới được người dùng.
- Motion staging hợp lý ở các card pricing/intensive: [PricingSection.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/landing/PricingSection.tsx:46), [IntensiveSection.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/landing/IntensiveSection.tsx:62).

### Pillar 3: Color (3/4)
- Accent `primary` được dùng đúng cho CTA/highlight ở pricing và Tứ trụ pills: [PricingSection.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/landing/PricingSection.tsx:56), [CataloguePage.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/pages/student/CataloguePage.tsx:158).
- Grade pills indigo tách biệt với Tứ trụ accent là hợp lý về phân tầng filter tại [CataloguePage.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/pages/student/CataloguePage.tsx:136).
- Còn hardcoded `bg-[#F97316]` tại [LessonContent.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/student/LessonContent.tsx:163); nên đổi về token để giữ đồng nhất theme.

### Pillar 4: Typography (2/4)
- UI-SPEC phase 19 yêu cầu 2 weight (`font-normal`/`font-bold`), nhưng còn `font-semibold` tại [IntensiveSection.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/landing/IntensiveSection.tsx:24).
- Còn nhiều `font-medium` trong lesson tabs tại [LessonContent.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/student/LessonContent.tsx:144).
- Scale size tổng thể hợp lý cho landing/catalog (`text-sm`, `text-base`, `text-3xl`, `text-4xl`) nhưng cần chuẩn hóa weight để đạt contract.

### Pillar 5: Spacing (3/4)
- Spacing theo bội số 4 và layout grid ổn: `gap-4`, `p-5`, `py-16 md:py-20` ở pricing/intensive.
- Touch target đạt chuẩn (`min-h-[44px]`) ở CTA pricing và Tứ trụ sub-filter: [PricingSection.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/landing/PricingSection.tsx:81), [CataloguePage.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/pages/student/CataloguePage.tsx:156).
- Có dùng `w-1/2` cố định cho ô search ở catalog tại [CataloguePage.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/pages/student/CataloguePage.tsx:115); trên màn nhỏ có thể bó hẹp không cần thiết.

### Pillar 6: Experience Design (3/4)
- State coverage tốt: loading skeleton, error, empty-state chuyên biệt Tứ trụ tại [CataloguePage.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/pages/student/CataloguePage.tsx:176).
- Video error-state rõ ràng, có fallback cho URL invalid tại [VideoPlayer.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/student/VideoPlayer.tsx:45).
- Regression UX ở luồng landing: thiếu PricingSection làm đứt hành trình “xem học phí → đăng ký tư vấn” vì section không hiển thị tại [Index.tsx](/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/pages/Index.tsx:17).

---

## Registry Safety

Registry audit: 0 third-party blocks checked, no flags (project uses shadcn official only per `19-UI-SPEC.md`).

---

## Files Audited

- `.planning/phases/19-landing-navigator-video/19-PLAN.md`
- `.planning/phases/19-landing-navigator-video/19-PLAN-SUMMARY.md`
- `.planning/phases/19-landing-navigator-video/19-UI-SPEC.md`
- `.planning/phases/19-landing-navigator-video/19-CONTEXT.md`
- `src/pages/Index.tsx`
- `src/components/landing/IntensiveSection.tsx`
- `src/components/landing/PricingSection.tsx`
- `src/components/landing/ConsultationForm.tsx`
- `src/pages/student/CataloguePage.tsx`
- `src/components/student/VideoPlayer.tsx`
- `src/components/student/LessonContent.tsx`
