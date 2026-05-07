# Phase 16 — Lesson Tabs + Study Materials Library
**Status:** Planned | **Created:** 2026-05-07

---

## Overview

Refactor the lesson view page into a 3-tab layout ("Bài giảng" / "Bài kiểm tra" / "Thảo luận") and add a `study_materials` table + private Storage bucket so admins can upload PDF/image reference materials per lesson, visible to students with grade access.

**Requirements:** LESSON-01, LESSON-02, LESSON-03 (placeholder), MAT-01, MAT-02 (scoped), MAT-03

---

## Plan 1 — Database, Storage & API Layer

**Goal:** New `study_materials` table + RLS + `study-materials` private bucket + Storage policies + API functions ready for UI to consume.

### Tasks

**T1.1 — Migration: `study_materials` table + Storage bucket**

File: `supabase/migrations/20260507_25_study_materials.sql`

```sql
-- 1. Create study_materials table
CREATE TABLE public.study_materials (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id   uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title       text NOT NULL,
  file_path   text NOT NULL,
  file_type   text NOT NULL CHECK (file_type IN ('pdf', 'image')),
  category    text NOT NULL CHECK (
    category IN ('giua_ky', 'cuoi_ky', 'vao_10', 'hsg', 'chuyen_toan')
  ),
  grade       text NOT NULL CHECK (grade IN ('grade_7', 'grade_8', 'grade_9')),
  created_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX idx_study_materials_lesson_id ON public.study_materials(lesson_id);

-- 3. Enable RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Admin full CRUD
CREATE POLICY "admin_all_study_materials"
  ON public.study_materials FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- 5. RLS: Student SELECT where has_grade_access(grade)
CREATE POLICY "student_read_study_materials"
  ON public.study_materials FOR SELECT TO authenticated
  USING (public.has_grade_access(grade));

-- 6. Create private Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage: Admin upload (INSERT)
CREATE POLICY "admin_upload_study_materials"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'admin'
  );

-- 8. Storage: Authenticated download (SELECT for signed URL)
CREATE POLICY "auth_read_study_materials"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'study-materials');

-- 9. Storage: Admin delete
CREATE POLICY "admin_delete_study_materials"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'admin'
  );
```

**T1.2 — API: `src/lib/api/study-materials.ts`**

Create new file with:
- `StudyMaterial` interface
- `CATEGORY_LABELS` / `GRADE_LABELS` display maps
- `fetchStudyMaterials(lessonId)` — SELECT where `lesson_id = lessonId` (RLS auto-filters by grade)
- `uploadStudyMaterial(lessonId, file, meta)` — upload to `study-materials` bucket at `{lessonId}/{timestamp}-{random}.{ext}`, detect `file_type` from MIME, then INSERT row
- `deleteStudyMaterial(id, filePath)` — DELETE row + `storage.remove([filePath])`
- `getStudyMaterialSignedUrl(filePath)` — `createSignedUrl(path, 3600)`
- `getStudyMaterialSignedUrls(materials)` — `Promise.all` batch of signed URLs

**UAT-1.1:** Migration applies without error on Supabase SQL Editor.
**UAT-1.2:** Admin can insert a row into `study_materials`; student with grade access can SELECT it; student without grade access gets 0 rows.
**UAT-1.3:** `getStudyMaterialSignedUrl` returns a working signed URL for an uploaded file.

---

## Plan 2 — Lesson Tabs UI Refactor

**Goal:** Refactor `LessonContent` into 3-tab layout; add `StudyMaterialsList` + `StudyMaterialUploadForm`; thread `isAdmin` prop; wire up TanStack Query.

### Tasks

**T2.1 — Add `isAdmin` prop to `LessonContent`**

In `LessonContent.tsx`:
- Add `isAdmin?: boolean` to `LessonContentProps` interface
- No other changes yet (prep for T2.2)

In `CourseDetailPage.tsx`:
- Pass `isAdmin={isAdmin}` to the `<LessonContent>` render call (two call sites: Sheet + desktop)

**T2.2 — Refactor `LessonContent` into 3 tabs**

Restructure the render tree:
```
<div className="flex flex-col h-full">
  {/* Title + admin actions — always visible above tabs */}
  <div className="px-4 md:px-8 pt-4 md:pt-8 pb-0 flex items-start justify-between gap-3">
    <h2 ...>{lesson.title}</h2>
    {admin actions}
  </div>

  {/* Tab bar */}
  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
    <TabsList className="w-full border-b border-border rounded-none bg-transparent px-4 md:px-8 shrink-0 h-auto pb-0 justify-start gap-1">
      <TabsTrigger value="bai-giang">Bài giảng</TabsTrigger>
      {lesson.assignment_path && (
        <TabsTrigger value="bai-kiem-tra">Bài kiểm tra</TabsTrigger>
      )}
      <TabsTrigger value="thao-luan">Thảo luận</TabsTrigger>
    </TabsList>

    <TabsContent value="bai-giang" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
      {/* video (3 states) */}
      {/* description */}
      {/* StudyMaterialsList + StudyMaterialUploadForm */}
      {/* LessonProgressButton */}
    </TabsContent>

    <TabsContent value="bai-kiem-tra" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
      {/* assignment_path download */}
      {/* SubmissionArea */}
    </TabsContent>

    <TabsContent value="thao-luan" className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      {/* Tab3Placeholder */}
    </TabsContent>
  </Tabs>
</div>
```

Tab state: `const [activeTab, setActiveTab] = useState('bai-giang')`  
Reset on lesson change: `useEffect(() => { setActiveTab('bai-giang') }, [lesson?.id])`

Remove the old `assignment_path !== null` gated block from the flat layout.

**Tab bar style** (add to `TabsTrigger`):  
```
rounded-none border-b-2 border-transparent
data-[state=active]:border-primary data-[state=active]:text-primary
data-[state=active]:shadow-none
pb-3 font-medium text-sm text-muted-foreground
```

**T2.3 — Create `StudyMaterialsList` component**

File: `src/components/student/StudyMaterialsList.tsx`

Props: `{ lessonId: string; isAdmin?: boolean }`

Behavior:
- `useQuery(['study-materials', lessonId], () => fetchStudyMaterials(lessonId))`
- Generates signed URLs: secondary query `['study-material-urls', lessonId]` — calls `getStudyMaterialSignedUrls(materials)` once materials are loaded
- Loading: skeleton rows (`Skeleton` component, 2 rows)
- Empty state (student): "Chưa có tài liệu" + MessageSquare icon
- Empty state (admin): "Chưa có tài liệu nào" + hint to upload
- **Category filter**: `Select` dropdown above list — options: "Tất cả" + 5 categories (giữa kỳ / cuối kỳ / vào 10 / HSG / chuyên toán). Filter is client-side (`useState` on selected category). Hidden when list is empty. Satisfies MAT-03.
- Item row: `FileText`/`Image` icon + title + category badge (`bg-primary/10 text-primary text-[10px]`) + download button (`Download` icon, opens signed URL in new tab) + admin delete button (`Trash2`, triggers `AlertDialog` confirm)
- Delete: `useMutation(deleteStudyMaterial)` + `queryClient.invalidateQueries(['study-materials', lessonId])`

Section header: `<p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Tài liệu học tập</p>`

**T2.4 — Create `StudyMaterialUploadForm` component**

File: `src/components/student/StudyMaterialUploadForm.tsx`

Props: `{ lessonId: string; grade: string }` — `grade` inferred from course (passed down from `CourseDetailPage` via `LessonContent`)

Behavior:
- Collapsed by default, toggle via "Thêm tài liệu" button (`Plus` icon, `variant="outline"`, `min-h-[44px]`)
- Open state: inline form (no dialog) with:
  - `Input` — file picker (accept="application/pdf,image/*")
  - `Select` — category (giữa kỳ/cuối kỳ/vào 10/HSG/chuyên toán)
  - `Select` — grade (Lớp 7/8/9) — pre-filled from `grade` prop
  - "Tải lên" button + "Hủy" button
- `useMutation(uploadStudyMaterial)` — on success: `invalidateQueries(['study-materials', lessonId])` + toast "Đã thêm tài liệu thành công!" + close form
- Error toast: "Tải tài liệu lên thất bại. Vui lòng thử lại."
- Loading: `Loader2` spin + "Đang tải..."

**T2.5 — Tab 3 placeholder**

Inline inside `LessonContent` Tab 3 content:
```tsx
<div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
  <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
  <p className="text-sm font-medium text-muted-foreground">Tính năng sắp có</p>
  <p className="text-xs text-muted-foreground/60">Phần thảo luận đang được phát triển.</p>
</div>
```

**T2.6 — Thread `grade` prop**

`LessonContent` needs `courseGrade` to pre-fill the grade select in `StudyMaterialUploadForm`.  
`CourseDetailPage` already has `course?.target_grade` from the course query.  
Add `courseGrade?: string` to `LessonContentProps`; pass from `CourseDetailPage`.

**UAT-2.1:** Switching tabs does NOT reload the page or reset sidebar state.
**UAT-2.2:** Selecting a different lesson resets to Tab 1 "Bài giảng".
**UAT-2.3:** Lesson without `assignment_path` shows only Tab 1 + Tab 3 (Tab 2 absent).
**UAT-2.4:** Lesson with `assignment_path` shows all 3 tabs.
**UAT-2.5:** No scrollbar appears on the page body when viewing any tab.
**UAT-2.6:** Admin sees "Thêm tài liệu" button in Tab 1; student does not.
**UAT-2.7:** Admin upload form opens inline, file uploads successfully, list refreshes.
**UAT-2.8:** Admin can delete a material (with confirm dialog); list refreshes.
**UAT-2.9:** Student downloads a study material via signed URL (opens in new tab).
**UAT-2.10:** `LessonProgressButton` is visible at the bottom of Tab 1.

---

## Plan 3 — Apply Migration & Smoke Test

**Goal:** Apply the migration to Supabase, verify end-to-end on running dev server.

### Tasks

**T3.1 — Apply migration**

Paste `20260507_25_study_materials.sql` into Supabase Dashboard → SQL Editor and run. Verify:
- `study_materials` table exists in Table Editor
- `study-materials` bucket appears in Storage section
- RLS is enabled on the table

**T3.2 — Dev server smoke test**

```bash
pnpm dev
```

Verify against UAT checklist from Plan 2. Additionally:
- Open browser DevTools → Network tab; confirm signed URLs have 1-hour TTL (`token` query param)
- Confirm no TypeScript errors in `pnpm build`

**T3.3 — Run existing tests**

```bash
pnpm test
```

Ensure no regressions in:
- `SubmissionArea.test.tsx`
- `StudentLayout.test.tsx`
- `BellNotification.test.tsx`

**UAT-3.1:** `pnpm build` exits 0 with no TypeScript errors.
**UAT-3.2:** Existing test suite passes.
**UAT-3.3:** End-to-end: Admin uploads PDF → Student (grade access) sees and downloads it → Student (no grade access) sees empty state.

---

## Verification Checklist

- [ ] LESSON-01: 3 tabs implemented, tab switch no reload
- [ ] LESSON-02: SubmissionArea preserved in Tab 2
- [ ] LESSON-03: Tab 3 placeholder exists
- [ ] MAT-01: Admin can upload PDF/image with category+grade in Tab 1
- [ ] MAT-02 (scoped): Students with grade access can view/download
- [ ] MAT-03: Category filter Select + badge displayed on each material item
- [ ] No scrollbar regression (layout rule respected)
- [ ] RLS: unauthenticated/wrong-grade cannot access study_materials rows

---

## Deferred (out of phase scope)

- Global study materials landing page (Phase 19)
- Mock exam UI (Phase 18)
- Chat in Tab 3 (Phase 17)
- URL sync for tab state
