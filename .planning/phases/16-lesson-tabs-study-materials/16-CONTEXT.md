# Phase 16: Lesson Tabs + Study Materials Library - Context

**Gathered:** 2026-05-04 | **Updated:** 2026-05-07 (v2 — tab structure corrected)
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 16 delivers:

1. **Lesson page tabs (no full reload)** — Trang xem bài học có 3 tab: **"Bài giảng"**, **"Bài kiểm tra"**, **"Thảo luận"**; chuyển tab không reload trang (LESSON-01).
2. **Study materials trong Tab 1** — Study materials (PDF/ảnh từ bảng `study_materials` mới, gắn `lesson_id`) hiển thị trong Tab 1 "Bài giảng"; admin upload inline trong cùng tab (MAT-01).
3. **Preserve submission UX trong Tab 2** — Tab "Bài kiểm tra" chứa file `assignment_path` (đề thi/bài tập) + toàn bộ `SubmissionArea` + grading status (LESSON-02) — refactor layout, không cắt tính năng.
4. **Tab 3 "Thảo luận" là placeholder** — Phase 16 chỉ tạo tab shell; Chat thật implement ở Phase 17 (LESSON-03 phần chat). Mock exam thuộc Phase 18.

**Explicitly NOT in Phase 16**

- Trang tài liệu / thư viện trên **landing** hoặc audience "toàn bộ học sinh approved" (MAT-02 kiểu global) — tách khỏi tài liệu gắn bài; xử lý ở phase sau (vd. Phase 19) khi có yêu cầu rõ.
- UI mock exam, countdown, nộp bài thi (Phase 18).

**Roadmap constraints (unchanged)**

- Bucket Storage **`study-materials`** riêng (không dùng bucket `assignments`).
- Signed URL **1 giờ**, regenerate mỗi lần load trang.

</domain>

<decisions>
## Implementation Decisions

### Tabs & URL
- **D-01:** **Không** đồng bộ tab lên query URL — trạng thái tab chỉ dùng React state (local); URL giữ hành vi chọn bài như hiện tại.
- **D-02:** Khi học sinh chọn **bài học khác** trong sidebar, **reset về tab 1** ("Bài giảng").

### Tab 3 — Thảo luận (placeholder)
- **D-03:** Tab 3 "Thảo luận" trong Phase 16 là **placeholder shell** — hiển thị tab nhưng nội dung chỉ là empty state "Tính năng sắp có" hoặc tương tự. Chat thật implement ở Phase 17 (slot vào đây). Không xây UI mock exam trong Phase 16.

### Scope: bài học vs landing
- **D-04:** Phase 16 **chỉ** ngữ cảnh **trang bài học** (`CourseDetailPage` / tab). **Không** gồm trang tài liệu landing hoặc thư viện global trong phase này.
- **D-05:** Product có **hai dạng** tài liệu trong tầm nhìn: (a) tài liệu **gắn bài học** — Phase 16; (b) tài liệu **landing / toàn học sinh** — phase khác. Implementer không gộp hai luồng RLS/UI trong một phase.

### Data model — materials
- **D-06:** Metadata upload gồm **category** (giữa kỳ, cuối kỳ, vào 10, HSG, chuyên toán) và **grade** (7/8/9) theo MAT-01; **row gắn `lesson_id`** (đã chọn trong thảo luận).
- **D-07:** Trong tab bài học, danh sách tài liệu là **của đúng `lesson_id` đang active**. Ưu tiên **filter/lọc theo category** trong UI nếu nhiều file; **không bắt buộc** filter grade riêng trong tab (grade đã ngầm định qua khóa học/bài) — có thể lưu `grade` trên row phục vụ admin/report.

### Tab content split (v2 — corrected 2026-05-07)
- **D-11:** `assignment_path` (đề thi/bài tập) → **Tab 2 "Bài kiểm tra"** cùng `SubmissionArea`. Đây là file đề bài học sinh cần tải + nộp bài.
- **D-11b:** Study materials (bảng `study_materials` mới, PDF/ảnh) → **Tab 1 "Bài giảng"**, hiển thị bên dưới video + mô tả.
- **D-12:** Bài học không có `assignment_path` → **ẩn Tab 2 "Bài kiểm tra" hoàn toàn** (chỉ hiển thị Tab 1 + Tab 3).
- **D-14:** `LessonProgressButton` đặt ở **cuối Tab 1** "Bài giảng".

**Layout 3 tab (v2):**
| Tab | Nội dung |
|-----|----------|
| Tab 1 — Bài giảng | Video + Mô tả + Study materials (PDF/ảnh, admin upload) + LessonProgressButton |
| Tab 2 — Bài kiểm tra | File `assignment_path` (đề thi) + SubmissionArea _(ẩn nếu assignment_path = null)_ |
| Tab 3 — Thảo luận | Placeholder (Phase 16); Chat thật Phase 17 |

### Admin upload
- **D-13 (v2):** Admin upload study materials **trong Tab 1 "Bài giảng"** — nút "Thêm tài liệu" + form upload inline hiển thị **chỉ khi `isAdmin`**. Học sinh thấy cùng danh sách tài liệu nhưng không có nút upload. Không thay đổi `LessonInlineForm`.

### Access / RLS (tài liệu gắn bài)
- **D-09:** Tài liệu **gắn bài học**: chỉ học sinh **có quyền truy cập bài học đó** (cùng philosophy với package-grade / lesson access như Phase 14) — **không** áp dụng kiểu "mọi approved user" cho loại này.
- **D-10:** Tài liệu **landing / toàn học sinh** (nếu MAT-02 được hiểu theo hướng global) — **không** implement trong Phase 16; ghi nhận trong `<deferred>`.

### Claude's Discretion

- Cách map tab label URL nội bộ (nếu sau này bật URL) — hiện không dùng.
- Chi tiết schema bảng `study_materials` (tên cột, index), policy RLS cụ thể, số file tối đa mỗi lesson.
- UI filter category (Select vs chips) miễn đạt MAT-01 và dễ dùng trên mobile.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — LESSON-01, LESSON-02, LESSON-03, MAT-01, MAT-02, MAT-03 (traceability Phase 16)
- `.planning/ROADMAP.md` — §Phase 16: Lesson Tabs + Study Materials Library (goal, success criteria, storage constraint `study-materials`, signed URL 1h)
- `.planning/PROJECT.md` — §Constraints stack; §Context milestone v3.0

### Prior phase decisions (carry-forward)
- `.planning/phases/14-pricing-access-control/14-CONTEXT.md` — package-grade access, `has_grade_access`, lesson `video_url` RLS pattern
- `.planning/phases/13-student-pages/13-CONTEXT.md` — student UI clay/teal, `CourseDetailPage` Sheet drawer, `min-h-[48px]`

### Code integration (implement touchpoints)
- `src/pages/student/CourseDetailPage.tsx` — layout chứa `LessonContent`; đã import `Tabs`; nơi gắn tab cấp trang + state `activeLessonId`
- `src/components/student/LessonContent.tsx` — video, assignment links, `SubmissionArea`, `LessonProgressButton` — tách nội dung theo tab
- `src/components/student/SubmissionArea.tsx` — giữ nguyên hành vi, chuyển vào Tab 2 "Bài kiểm tra"
- `src/components/ui/tabs.tsx` — shadcn Tabs (không sửa tay primitive; compose từ app)

### Design
- `design-system/bumath/MASTER.md` — nếu tồn tại; student-facing consistency (Phase 13)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **shadcn `Tabs`** — đã dùng trong `CourseDetailPage.tsx`; reuse cho 3 tab bài học.
- **`LessonContent`** — refactor thành 3 vùng: (1) video + mô tả + study materials (Tab 1 "Bài giảng"); (2) assignment_path + SubmissionArea (Tab 2 "Bài kiểm tra"); (3) placeholder (Tab 3 "Thảo luận").
- **`getAssignmentPublicUrls` / Storage patterns** — tham chiếu cho signed URL flow; bucket mới `study-materials` theo roadmap.
- **Phase 14 lesson fetch** — `fetchLessonsForStudent` / `lessons_view`; tài liệu cần policy nhất quán với quyền xem bài.

### Established Patterns
- **TanStack Query** — fetch materials theo `lessonId`; invalidate khi upload.
- **RLS + `get_my_role()` / `is_approved_user()`** — pattern migrations hiện có; thêm policy cho bảng/storage study materials.

### Integration Points
- **`App.tsx` / admin routes** — chỉ khi thêm trang admin mới (optional); primary: form trên flow lesson admin hiện có.
- **Supabase Storage** — bucket `study-materials`, policies đọc theo user có quyền lesson.

</code_context>

<specifics>
## Specific Ideas

- Người dùng phân biệt rõ **tài liệu theo bài** (gói/package) vs **tài liệu landing** (toàn học sinh) — implementer tách phase và RLS.
- Tab không cần đồng bộ URL trong vòng này; Phase 17 có thể đề xuất lại nếu cần deep link Chat.

</specifics>

<deferred>
## Deferred Ideas

### Landing / global study materials
- Thư viện PDF **không gắn lesson**, hiển thị cho **mọi học sinh approved** (diễn giải MAT-02 theo hướng marketing) — **Phase 19 hoặc phase riêng** khi có UI landing/navigator.

### Mock exam (LESSON-03)
- Link và UI **đợt thi thử** — **Phase 18**.

### Optional later
- Đồng bộ `?tab=` lên URL nếu product muốn deep link sau khi Chat sống.

**None — discussion stayed within phase scope** (ngoài các mục deferred có chủ đích).

</deferred>

---

*Phase: 16-Lesson Tabs + Study Materials Library*
*Context gathered: 2026-05-04*
