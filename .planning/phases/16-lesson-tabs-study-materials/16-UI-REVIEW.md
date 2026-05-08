# Phase 16 — UI Review

**Audited:** 2026-05-08
**Baseline:** 16-UI-SPEC.md (approved design contract)
**Screenshots:** Not captured (Playwright CLI failed against localhost:8080 — code-only audit)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Tab labels and toasts match spec; upload success toast is shorter than contracted copy |
| 2. Visuals | 3/4 | Clear hierarchy; Tab 3 trigger hidden from admin but TabsContent still renders unconditionally |
| 3. Color | 3/4 | Accent used correctly; `text-red-400` hardcoded on PDF icon breaks design token discipline |
| 4. Typography | 4/4 | Exactly 4 sizes (xs, sm, base, 2xl) + 2 arbitrary spec-allowed sizes (10px, 11px); 4 weights but all documented in spec |
| 5. Spacing | 3/4 | Scale is clean; `w-[200px] h-[200px]` fixed thumbnail size used in three places — not mobile-adaptive |
| 6. Experience Design | 3/4 | Loading/error/delete-confirm states present; `isAdmin={false}` hardcoded prevents admin from managing materials inside LessonContent |

**Overall: 19/24**

---

## Top 3 Priority Fixes

1. **`isAdmin={false}` hardcoded in LessonContent line 163** — Admin cannot manage study materials from the standard lesson view; the upload/delete controls are silently suppressed even when `isAdmin` prop is `true`. Fix: change `isAdmin={false}` to `isAdmin={isAdmin}` in `LessonContent.tsx:163`.

2. **Fixed 200px thumbnail width is not mobile-responsive** — On 375px viewports, `w-[200px]` thumbnails overflow the padding boundary or clip; scroll becomes horizontal. Fix: replace `w-[200px] h-[200px]` with `w-40 h-40 sm:w-[200px] sm:h-[200px]` (or a CSS grid with `auto-fill minmax(140px, 1fr)`) in `StudyMaterialsList.tsx:31` and `LessonContent.tsx:199`.

3. **`text-red-400` hardcoded color on PDF icon breaks token discipline** — `StudyMaterialsList.tsx:94` uses `text-red-400` directly instead of a design token. This will not adapt to dark mode or theme changes. Fix: replace with `text-destructive/60` or `text-muted-foreground` to stay in the design system.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Matches spec:**
- Tab labels: "Bài giảng" (LessonContent.tsx:135), "Bài kiểm tra" (142), "Thảo luận" (150) — exact match.
- Tab 3 placeholder: "Tính năng sắp có" (235), "Phần thảo luận đang được phát triển." (236) — matches spec with minor acceptable truncation.
- Delete dialog: "Xóa tài liệu" title (146), "Bạn có chắc muốn xóa tài liệu này? Thao tác không thể hoàn tác." (148) — exact match.
- Upload CTA: "Thêm tài liệu" (70), "Đang tải..." (70) — match.
- Delete success: "Đã xóa tài liệu." (58) — match.
- Delete error: "Xóa tài liệu thất bại. Vui lòng thử lại." (63) — match.

**Minor deviations from spec:**
- Upload success toast: `'Đã thêm tài liệu!'` (StudyMaterialUploadForm.tsx:39) vs spec `'Đã thêm tài liệu thành công!'`. The exclamation is there but "thành công" is missing — less complete than the contract.
- Upload error toast: `'Tải lên thất bại. Vui lòng thử lại.'` (41) vs spec `'Tải tài liệu lên thất bại. Vui lòng thử lại.'` — word order slightly differs (minor).
- Empty state (student): Section returns `null` when empty (StudyMaterialsList.tsx:77) — correct per UAT I-02 resolution. No empty-state message is shown, which diverges from the spec's "Chưa có tài liệu / Tài liệu học tập sẽ sớm được cập nhật." copy, but this was an intentional UAT decision.
- Empty state (admin): When admin has no materials, the section label and upload button render but no explicit "Chưa có tài liệu nào" message appears — spec expected a hint text for admin.

**No generic English labels found** in phase 16 files (the `Cancel` grep hit is an import identifier, not rendered text).

---

### Pillar 2: Visuals (3/4)

**Positive:**
- Clear visual hierarchy: title above tab bar, tabs divide content cleanly.
- Video at 16:9 aspect ratio with `rounded-2xl` and shadow — good presentation.
- Admin edit/delete icon buttons have `aria-label` attributes (LessonContent.tsx:76, 86).
- Locked video state has descriptive in-panel message with icon — handles 3 video states correctly.
- Delete X button on thumbnail uses `backdrop-blur-sm` for legibility over image content.

**Issues:**
- **Tab 3 TabsContent renders unconditionally for admin** (LessonContent.tsx:232): The `<TabsTrigger value="thao-luan">` is gated by `{!isAdmin}` (line 145), but the `<TabsContent value="thao-luan">` has no matching conditional. For admin users, the placeholder div is rendered in the DOM even though the tab trigger is invisible — orphaned invisible content. This is a minor UX correctness issue, not a visual regression since the content is never displayed without a trigger.
- **X delete button on thumbnail has a 20px hit area** (h-5 w-5, StudyMaterialsList.tsx:106): This is 20×20px, well below the 44px minimum touch target specified in the UX-02 rule and the spacing scale ("Touch targets: `min-h-[44px]`"). The button is nested inside the 200×200px thumbnail so it is technically reachable, but the interactive zone is too small for mobile use.
- **No visual affordance that thumbnails are clickable** beyond cursor-pointer: no hover overlay or play/open indicator communicates the click action to students.

---

### Pillar 3: Color (3/4)

**Accent usage audit (`text-primary`, `bg-primary`, `border-primary`):**
- LessonContent.tsx: Active tab underline/text (3 triggers × 2 classes) — correct per spec.
- StudyMaterialsList.tsx: `bg-primary/10 text-primary` constants not present (spec specified category badge in `bg-primary/10 text-primary text-[10px]`, but implementation uses thumbnail layout without badges).
- No hardcoded hex colors found in phase 16 component files.

**Single violation:**
- `StudyMaterialsList.tsx:94`: `text-red-400` on the PDF `FileText` icon — raw Tailwind color, not a design token. The spec's color table has no `red-400`; the closest intent is `text-destructive` (for delete actions only). Using a raw red on a display icon is out of spec.

**Token discipline otherwise good:** All other color references use CSS variable tokens (`text-muted-foreground`, `bg-muted/40`, `text-foreground/80`, `border-border/50`, `bg-destructive`).

**60/30/10 split:** Tab content areas are white (`bg-white`), muted sections use `bg-muted/20` in admin container — ratio is approximately correct.

---

### Pillar 4: Typography (4/4)

**Font sizes in use across phase 16 files:**
| Class | Source | Role |
|-------|--------|------|
| `text-2xl` | LessonContent:68 | Lesson title (spec: 24px/bold) |
| `text-base` | LessonContent:158 | Body description (spec: 16px/400) |
| `text-sm` | Multiple | UI labels 14px (spec: 14px/500) |
| `text-xs` | LessonContent:236 | Sub-label (spec: 12px) |
| `text-[11px]` | StudyMaterialsList:30 | Section label uppercase (spec-allowed) |
| `text-[10px]` | StudyMaterialsList:95 | File extension tag (spec-allowed) |

Total distinct sizes: 6 (4 scale + 2 spec-explicit arbitrary). All 6 are declared in the UI-SPEC typography section. No unapproved sizes found.

**Font weights:** `font-bold`, `font-semibold`, `font-medium`, `font-normal` — 4 weights. Spec declares bold (lesson title) + semibold (label) + medium (UI label) + normal (body), so all 4 are in contract.

**No violations.** Pillar 4 is fully compliant.

---

### Pillar 5: Spacing (3/4)

**Spacing class frequency (phase 16 components):**
- `gap-1`, `gap-3`, `gap-4` — icon gaps, item gaps (scale compliant)
- `px-4`, `px-8`, `py-6`, `p-4`, `p-8` — match 8pt scale (md=16px, lg=24px, xl=32px)
- `space-y-3`, `space-y-6`, `space-y-8` — section spacing (compliant)
- `pb-3` on tab triggers — tab underline spacing (spec-specified)

**Arbitrary spacing values found:**
- `w-[200px] h-[200px]` — used in 3 locations:
  - `StudyMaterialsList.tsx:31` (THUMB_CLASS constant — applied to every material thumbnail)
  - `StudyMaterialsList.tsx:70–71` (skeleton placeholders)
  - `LessonContent.tsx:199` (assignment path thumbnails in Tab 2)
  - `SubmissionArea.tsx:185, 260` (pre-existing, out of phase 16 scope)

The 200px fixed size is a deliberate thumbnail grid choice (matching the assignment file pattern), but it has no responsive breakpoint. On 375px mobile with `px-4` (32px total padding), 3 thumbnails would overflow. Even 2 thumbnails at 200px + 12px gap = 412px > 375px − 32px = 343px viewport. This is a real mobile overflow risk.

- `gap-1.5` (non-scale value, used in section label) — minor, from existing pattern in codebase.
- `h-5 w-5` on delete button — 20px, below 8pt scale multiples for interactive elements.

---

### Pillar 6: Experience Design (3/4)

**State coverage present:**
- Loading: Skeleton components during `isLoading` (StudyMaterialsList.tsx:67–73) — 2 skeleton thumbnails shown.
- Upload loading: `Loader2` spin + "Đang tải..." + button `disabled` (StudyMaterialUploadForm.tsx:62–70).
- Error states: `toast.error()` on upload failure and delete failure.
- Delete confirmation: `AlertDialog` with cancel/confirm + disabled states during pending (StudyMaterialsList.tsx:152–155).
- Empty state (student): returns `null` — correct per UAT I-02 resolution.
- Tab reset on lesson change: `useEffect(() => setActiveTab('bai-giang'), [lesson?.id])` — correct.
- Scrollbar safety: No `border-t` or conflicting overflow on layout wrappers — no-scroll pattern respected.

**Gaps:**

1. **`isAdmin={false}` hardcoded in LessonContent.tsx:163** — `StudyMaterialsList` is always rendered without admin privileges inside `LessonContent`, even when the page is in admin mode. The admin upload/delete controls are never visible from the student lesson view flow. The workaround in `CourseDetailPage.tsx:552–557` renders a separate `StudyMaterialsList isAdmin` block only in the lesson-edit admin panel — but this means admin cannot manage materials while viewing the lesson normally, only while editing. This is a functional gap that was flagged as UAT I-05 and fixed in `CourseDetailPage` but the `isAdmin` prop is still not threaded through `LessonContent` correctly.

2. **No fetch error state in StudyMaterialsList** — `useQuery` destructures only `data` and `isLoading`, not `isError`. If the Supabase query fails (network error, RLS rejection), the component silently returns `null` for students and renders an empty admin panel with no feedback. A `isError` branch with a retry hint would close this gap.

3. **Admin empty state missing** — When `isAdmin=true` and `list.length === 0`, the component renders the section header and upload button but no "Chưa có tài liệu nào" guidance copy that the spec declared for admin empty state (16-UI-SPEC.md line 168).

---

## Registry Audit

Registry audit: 0 third-party blocks. All components are from shadcn/ui official registry (Tabs, Button, AlertDialog, Skeleton, Badge, Select, Input) and lucide-react. No flags.

---

## Files Audited

- `/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/student/LessonContent.tsx`
- `/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/student/StudyMaterialsList.tsx`
- `/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/student/StudyMaterialUploadForm.tsx`
- `/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/pages/student/CourseDetailPage.tsx` (partial — admin panel integration)
- `/home/trungpd-teko-pro/Desktop/BumathX/bumath/src/components/student/SubmissionArea.tsx` (line references for pre-existing image size pattern)
- `.planning/phases/16-lesson-tabs-study-materials/16-UI-SPEC.md` (audit baseline)
- `.planning/phases/16-lesson-tabs-study-materials/16-UAT.md` (execution evidence)
- `.planning/phases/16-lesson-tabs-study-materials/16-PLAN.md` (intent reference)
