# Phase 16: Lesson Tabs + Study Materials Library - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 16 delivers:

1. **Lesson page tabs (no full reload)** — Trang xem bài học có 3 tab: "Bài giảng", "Chấm bài", "Tài liệu & Kiểm tra"; chuyển tab không reload trang (LESSON-01).
2. **Preserve submission UX** — Tab "Chấm bài" chứa toàn bộ submission area + grading status như hiện tại trong `LessonContent` (LESSON-02) — refactor layout, không cắt tính năng.
3. **Study materials (lesson-scoped)** — Tài liệu PDF gắn **theo từng bài học (`lesson_id`)**; admin upload trên luồng chỉnh sửa bài giảng; học sinh có quyền truy cập bài học (theo package/grade như video) mới xem/tải (MAT-01, bổ sung quyền theo thảo luận).
4. **Tab "Tài liệu & Kiểm tra"** — Hiển thị tài liệu của **bài học đang chọn**; phần **đợt thi thử / mock exam** không triển khai trong phase này (Phase 18). LESSON-03 phần thi thử được coi là capability khác — không empty state marketing bắt buộc trong Phase 16.

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

### Tab 3 vs mock exam (LESSON-03)
- **D-03:** Phase 16 **không** xây UI/link đợt thi thử; "thi thử" thuộc Phase 18. Tab 3 chỉ **tách UI** — đưa tài liệu (và placeholder tối thiểu nếu cần) vào tab; không bắt buộc section marketing "Sắp có" cho thi thử.

### Scope: bài học vs landing
- **D-04:** Phase 16 **chỉ** ngữ cảnh **trang bài học** (`CourseDetailPage` / tab). **Không** gồm trang tài liệu landing hoặc thư viện global trong phase này.
- **D-05:** Product có **hai dạng** tài liệu trong tầm nhìn: (a) tài liệu **gắn bài học** — Phase 16; (b) tài liệu **landing / toàn học sinh** — phase khác. Implementer không gộp hai luồng RLS/UI trong một phase.

### Data model — materials
- **D-06:** Metadata upload gồm **category** (giữa kỳ, cuối kỳ, vào 10, HSG, chuyên toán) và **grade** (7/8/9) theo MAT-01; **row gắn `lesson_id`** (đã chọn trong thảo luận).
- **D-07:** Trong tab bài học, danh sách tài liệu là **của đúng `lesson_id` đang active**. Ưu tiên **filter/lọc theo category** trong UI nếu nhiều file; **không bắt buộc** filter grade riêng trong tab (grade đã ngầm định qua khóa học/bài) — có thể lưu `grade` trên row phục vụ admin/report.

### Admin upload
- **D-08:** Luồng upload PDF + chọn category + grade: **trên trang/chỉnh sửa bài giảng phía admin** (cùng khu vực quản lý nội dung bài), không bắt buộc trang menu riêng `/quan-tri/tai-lieu` trong Phase 16.

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
- `src/components/student/SubmissionArea.tsx` — giữ nguyên hành vi trong tab "Chấm bài"
- `src/components/ui/tabs.tsx` — shadcn Tabs (không sửa tay primitive; compose từ app)

### Design
- `design-system/bumath/MASTER.md` — nếu tồn tại; student-facing consistency (Phase 13)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **shadcn `Tabs`** — đã dùng trong `CourseDetailPage.tsx`; reuse cho 3 tab bài học.
- **`LessonContent`** — gom logic hiện tại; tách thành các vùng/tab: video + mô tả (Bài giảng); assignment + submission (Chấm bài); danh sách/tải tài liệu (Tài liệu & Kiểm tra).
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
