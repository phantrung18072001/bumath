# Phase 15: Admin UX + Audit - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 15 delivers:
1. **Admin Course Detail refactor** — Dùng chung `StudentCourseDetailPage` (hoặc tách thành shared `CourseDetailPage`). Route admin `/quan-tri/khoa-hoc/:courseSlug` render cùng component, hiển thị admin controls (Thêm/Sửa/Xóa) dựa trên role check — không build trang riêng cho admin.
2. **Inline forms** — Form thêm/sửa chuyên đề và bài giảng là expandable section inline trong sidebar (không phải dialog, không phải trang riêng). Click "Thêm chuyên đề" → form expand trong sidebar. Click "Sửa" → form expand tại chỗ.
3. **Broken link audit** — Sweep toàn app (admin + student + landing), tìm và fix tất cả button/link không có handler hoặc dẫn đến 404.

**⚠️ Requirement update:** ADMIN-01 và ADMIN-02 trong REQUIREMENTS.md cần được update — form thêm/sửa là inline expandable (không có URL riêng) thay vì trang riêng như mô tả ban đầu.

**NOT in this phase:** Package forms (PackageFormDialog, UserPackageDialog giữ nguyên), lesson tabs (Phase 16), chat (Phase 17).

</domain>

<decisions>
## Implementation Decisions

### Admin Course Detail Page (shared UI approach)
- **D-01:** Xóa route `/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug` (LessonsPage). Route admin `/quan-tri/khoa-hoc/:courseSlug` dùng chung component với student — không build `AdminCourseDetailPage` riêng.
- **D-02:** Không cần mirror layout — đây IS layout của student. Admin thấy cùng UI, chỉ khác phần hiển thị admin controls.
- **D-03:** Reuse trực tiếp `LessonSidebar` (hoặc tách thành shared component). Admin controls (drag handle, edit/delete/add buttons) được render có điều kiện qua `isAdmin` prop hoặc role check từ auth context.
- **D-04:** Behavior giống student: default chọn lesson đầu tiên khi load. Click lesson → hiển thị lesson detail (read-only).
- **D-05:** Admin controls hiển thị khi `isAdmin === true`: drag handle reorder (`@dnd-kit`), nút "Sửa" / "Xóa" trên mỗi row, nút "Thêm chuyên đề" / "Thêm bài giảng". Student không thấy các controls này.

### Inline Forms (Add/Edit Chapter & Lesson)
- **D-06:** Form thêm/sửa là expandable section inline trong sidebar — không phải dialog, không có URL riêng.
- **D-07:** Click "Thêm chuyên đề" → form expand ngay trong sidebar (dưới danh sách chapters). Click "Sửa" trên chapter row → form expand tại chỗ dưới row đó.
- **D-08:** Form "Thêm bài giảng" expand trong sidebar dưới chapter tương ứng.
- **D-09:** Edit chapters/lessons: fetch data từ DB theo slug/id để pre-populate form (không dùng `location.state` — cần URL-safe và refresh-safe).
- **D-10:** Sau submit thành công → close inline form, invalidate query, list refresh tại chỗ. Không navigate.

### Audit
- **D-11:** Sweep toàn app: admin pages, student pages, landing page.
- **D-12:** Fix strategy: tìm handler đúng và wire up. Nếu button dẫn đến feature chưa có → hỏi khi plan. Không tự ý ẩn button.
- **D-13:** Audit bao gồm: `<Button>` không có `onClick`/`type="submit"`, `<Link>` với `to` trỏ đến route không tồn tại, `<a>` không có `href`.

### Form Design Consistency (ADMIN-03)
- **D-14:** Không cần riêng — admin dùng chính student UI. Inline forms xuất hiện inline trong sidebar, dùng cùng `.bm-clay-card-student` / `#F0FDFA` background của student page.
- **D-15:** Form fields sử dụng shadcn/ui components giống `LessonFormDialog` và `ChapterFormDialog` hiện tại (Input, Textarea, Form, Label pattern).

### Claude's Discretion
- Cách animate inline form expand (CSS transition vs Framer Motion)
- Xử lý khi nhiều inline form mở cùng lúc (chỉ cho phép 1 mở tại một thời điểm)
- Loading skeleton trong content area phải khi đang fetch lesson
- Error state khi course/chapter không tồn tại

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Admin UX (ADMIN-01, ADMIN-02, ADMIN-03) — **NOTE: ADMIN-01 và ADMIN-02 cần update** (inline form thay vì trang riêng)
- `.planning/REQUIREMENTS.md` §Audit (AUDIT-01) — acceptance criteria cho broken link sweep
- `.planning/ROADMAP.md` §Phase 15 — Goal, Success Criteria, route ordering constraint

### Existing Code to Refactor/Replace
- `src/pages/admin/ChaptersPage.tsx` — sẽ bị XÓA (thay bằng shared CourseDetailPage)
- `src/pages/admin/LessonsPage.tsx` — sẽ bị XÓA (merged vào shared CourseDetailPage)
- `src/components/admin/ChapterFormDialog.tsx` — form logic tái sử dụng, bỏ Dialog wrapper → `ChapterInlineForm`
- `src/components/admin/LessonFormDialog.tsx` — form logic tái sử dụng, bỏ Dialog wrapper → `LessonInlineForm`
- `src/App.tsx` — xóa route `/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug`, route admin `/quan-tri/khoa-hoc/:courseSlug` → shared component với `isAdmin={true}`

### Student-side to Extend (shared UI)
- `src/pages/student/CourseDetailPage.tsx` — **BASE**: refactor thành shared `CourseDetailPage` nhận `isAdmin` prop, hoặc admin route render với role check từ auth context
- `src/components/student/LessonSidebar.tsx` — **BASE**: thêm `isAdmin` prop để hiện admin controls (drag, edit, delete, add buttons)

### Design System
- `src/index.css` — CSS variables, `.bm-clay-card-student`, teal color tokens
- `.planning/codebase/CONVENTIONS.md` — coding conventions

### Route Ordering Constraint (từ Phase 14)
- **⚠️ Literal routes phải đứng trước param routes trong `App.tsx`** (e.g., `/quan-tri/khoa-hoc/them-chuyen-de` trước `/quan-tri/khoa-hoc/:courseSlug`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ChapterFormDialog.tsx` — Zod schema + React Hook Form + useMutation pattern → tái sử dụng làm `ChapterInlineForm`
- `LessonFormDialog.tsx` — đầy đủ nhất: upload assignment, YouTube validation, multi-attachment → tái sử dụng làm `LessonInlineForm`
- `@dnd-kit` setup trong `ChaptersPage.tsx` và `LessonsPage.tsx` — drag-drop reorder đã working, giữ nguyên
- `src/components/ui/AlertDialog` — đã dùng cho delete confirm, giữ pattern
- `src/components/ui/Collapsible` hoặc custom expand — sidebar expand/collapse

### Established Patterns
- TanStack React Query: `useQuery` + `useMutation` + `queryClient.invalidateQueries` — giữ pattern
- Breadcrumb navigation — giữ trong `AdminCourseDetailPage`
- Sonner toast — giữ pattern cho success/error feedback
- `extractYouTubeID()` từ `src/lib/youtube.ts` — dùng trong lesson form

### Integration Points
- `src/App.tsx` — update routes: xóa `/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug`, giữ `/quan-tri/khoa-hoc/:courseSlug` → `AdminCourseDetailPage`
- `src/lib/api/chapters.ts` — giữ nguyên API, không thay đổi
- `src/lib/api/lessons.ts` — giữ nguyên API, không thay đổi
- `src/components/admin/AdminLayout.tsx` — sidebar nav, không cần thay đổi

### Broken Links to Investigate
- `src/pages/admin/UsersPage.tsx:93` — Button không có onClick
- `src/pages/admin/CoursesPage.tsx:243,252,261,276` — Buttons không có onClick
- `src/pages/admin/GradingPage.tsx:272,284,297,305,336,349,357` — Buttons không có onClick
- `src/pages/admin/ChaptersPage.tsx:92,101,110` — Buttons không có onClick
- Toàn bộ student pages + landing page cần audit thêm

</code_context>

<specifics>
## Specific Ideas

- Admin CourseDetailPage phải mirror StudentCourseDetailPage: "giống UI của học sinh, chỉ 1 trang duy nhất"
- Inline form không tách trang — đây là thay đổi quan trọng so với requirement ban đầu (ADMIN-01/02)
- Default select lesson đầu tiên khi vào trang (không có empty state)
- Lesson detail read-only + nút "Sửa" → expand inline form tại chỗ

</specifics>

<deferred>
## Deferred Ideas

- Tách trang riêng cho Package form (PackageFormDialog) — ngoài scope Phase 15, giữ dialog
- Lesson tabs (Bài giảng / Chấm bài / Tài liệu) — Phase 16
- In-lesson chat — Phase 17

</deferred>

---

*Phase: 15-admin-ux-audit*
*Context gathered: 2026-05-04*
