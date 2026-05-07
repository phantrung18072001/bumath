# Phase 16 — Research
**Generated:** 2026-05-07

---

## Standard Stack (carry-forward from Phase 14)

| Layer | Tool |
|-------|------|
| Framework | React + TypeScript + Vite |
| Data fetching | TanStack Query v5 |
| UI components | shadcn/ui + Tailwind CSS |
| Database client | Supabase JS |
| Icons | lucide-react |
| Toast | sonner |

No new dependencies needed for this phase.

---

## Architecture Patterns

### Access Control Pattern (Phase 14)
`has_grade_access(grade TEXT)` — SECURITY DEFINER function. Checks if `auth.uid()` owns a package covering the given grade. Used in `lessons_view` to mask `video_url`.

**Study materials RLS reuses the same function** — store `grade` column on each `study_materials` row; SELECT policy checks `has_grade_access(grade)` directly without joining through lessons.

### Storage Pattern
- `assignments` bucket: **public** — `getPublicUrl()`, no signed URL needed
- `submissions` bucket: **private** — `createSignedUrl(path, 3600)`, TTL 1h
- `study-materials` bucket: **private** — MUST use signed URLs per roadmap constraint (D: 1h TTL)

### TanStack Query Key Convention
`['study-materials', lessonId]` — invalidate on upload/delete

### Migration Numbering
Last migration: `20260504_24_*`. Next: `20260507_25_study_materials.sql`

---

## study_materials Table Design

```sql
CREATE TABLE public.study_materials (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id   uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title       text NOT NULL,
  file_path   text NOT NULL,  -- path in study-materials bucket
  file_type   text NOT NULL CHECK (file_type IN ('pdf', 'image')),
  category    text NOT NULL CHECK (
    category IN ('giua_ky', 'cuoi_ky', 'vao_10', 'hsg', 'chuyen_toan')
  ),
  grade       text NOT NULL CHECK (grade IN ('grade_7', 'grade_8', 'grade_9')),
  created_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**RLS policies:**
- `admin_all_study_materials` — admin full CRUD (`get_my_role() = 'admin'`)
- `student_read_study_materials` — SELECT where `has_grade_access(grade)`

**Pitfall:** `has_grade_access()` returns false for unauthenticated users (auth.uid() = null) — no anon access automatically.

---

## Storage Bucket: `study-materials`

Create via SQL in migration (Supabase supports `INSERT INTO storage.buckets`):

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO NOTHING;
```

**Storage policies (storage.objects table):**
- INSERT: `(auth.role() = 'authenticated' AND public.get_my_role() = 'admin')`
- SELECT: `auth.role() = 'authenticated'` — access controlled by API layer (only fetch signed URL if student has grade access via RLS check on table)
- DELETE: `(auth.role() = 'authenticated' AND public.get_my_role() = 'admin')`

**Path convention:** `{lesson_id}/{timestamp}-{random}.{ext}`

---

## API Layer: `src/lib/api/study-materials.ts`

```typescript
interface StudyMaterial {
  id: string
  lesson_id: string
  title: string
  file_path: string
  file_type: 'pdf' | 'image'
  category: 'giua_ky' | 'cuoi_ky' | 'vao_10' | 'hsg' | 'chuyen_toan'
  grade: 'grade_7' | 'grade_8' | 'grade_9'
  created_by: string | null
  created_at: string
}

// Fetch all materials for a lesson (RLS: filtered by has_grade_access automatically)
fetchStudyMaterials(lessonId: string): Promise<StudyMaterial[]>

// Upload file to storage + insert row (admin only)
uploadStudyMaterial(
  lessonId: string,
  file: File,
  meta: { title: string; category: StudyMaterial['category']; grade: StudyMaterial['grade'] }
): Promise<StudyMaterial>

// Delete row + storage file (admin only)  
deleteStudyMaterial(id: string, filePath: string): Promise<void>

// Generate signed URL (TTL 1h)
getStudyMaterialSignedUrl(filePath: string): Promise<string>
```

---

## LessonContent Refactor Plan

**Current structure (flat):**
1. Title + admin actions
2. Video (3 states)
3. Description
4. Assignment files + SubmissionArea (gated on `assignment_path !== null`)
5. LessonProgressButton

**New structure (3-tab):**
- Add `isAdmin?: boolean` prop to `LessonContentProps`
- Add `activeTab` local state — reset to `'bai-giang'` when `lesson.id` changes
  - Implementation: `useEffect(() => setActiveTab('bai-giang'), [lesson?.id])`
- Wrap content in shadcn `Tabs value={activeTab} onValueChange={setActiveTab}`

Tab 1 "bai-giang":
- Title + admin actions (stays above tabs or inside Tab 1?)
  → Keep title ABOVE tabs (always visible regardless of tab)
  → Tab content: video + description + StudyMaterialsList + (isAdmin: StudyMaterialUploadForm) + LessonProgressButton

Tab 2 "bai-kiem-tra" (hidden when `assignment_path === null`):
- Assignment files download
- SubmissionArea

Tab 3 "thao-luan":
- Placeholder empty state

**Scrollbar safety:** `LessonContent` is inside the enrolled layout's `overflow-y-auto` `main`. No additional overflow containers inside tab panels.

---

## Component Map

| Component | File | New/Refactor |
|-----------|------|-------------|
| `LessonContent` | `src/components/student/LessonContent.tsx` | Refactor |
| `StudyMaterialsList` | `src/components/student/StudyMaterialsList.tsx` | New |
| `StudyMaterialUploadForm` | `src/components/student/StudyMaterialUploadForm.tsx` | New (admin only) |

---

## Pitfalls

1. **Tab value reset**: Use `useEffect([lesson?.id])` to reset `activeTab`. Do NOT use `key={lesson.id}` on `LessonContent` (would remount SubmissionArea, losing pending uploads).
2. **Storage bucket creation**: Must use `INSERT INTO storage.buckets` in migration — Supabase CLI `storage create` command not available in web migrations.
3. **Signed URL per item**: Each material row requires an individual `createSignedUrl` call. Batch with `Promise.all()` in `StudyMaterialsList` query.
4. **`isAdmin` prop**: `CourseDetailPage` already passes `isAdmin` as component prop — add to `LessonContent` props and thread through.
5. **Assignment files unchanged**: `assignment_path` on `lessons` table is NOT the same as `study_materials`. Assignment = homework exam paper. Study materials = reference docs. Keep them as separate concepts.
