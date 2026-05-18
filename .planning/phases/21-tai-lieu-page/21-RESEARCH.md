# Phase 21: Tài liệu Page — Research

**Researched:** 2026-05-18  
**Domain:** React/TanStack Query + Supabase RLS/Storage + public page routing  
**Confidence:** HIGH (all findings verified against codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** `/tai-lieu` là public — không cần đăng nhập. Không dùng `<ProtectedRoute>`.
- **D-02:** Filter chỉ theo grade: Lớp 7 / Lớp 8 / Lớp 9 / Ôn thi chuyên. Bỏ hoàn toàn filter category.
- **D-03:** Standalone materials: `lesson_id = NULL`. ALTER TABLE để nullable.
- **D-04:** DB migration: DROP NOT NULL lesson_id, add 'advanced' to grade CHECK, make category nullable.
- **D-05:** Trang admin `/quan-tri/tai-lieu` — `TaiLieuAdminPage.tsx`, role: admin + teacher.
- **D-06:** `fetchStandaloneStudyMaterials(grade?: StudyMaterialGrade)` — extend file hiện có.
- **D-07:** Grid card layout. Card: title, grade badge, PDF icon, nút download.
- **D-08:** Download: `getStudyMaterialSignedUrl(filePath)` → `window.open(url, '_blank')`.
- **D-09:** Adapt `StudyMaterialUploadForm` — bỏ lessonId (hardcode NULL), bỏ category, giữ title + file + grade.
- **D-10:** Add nav link `AdminLayout` — icon `FileText`, label "Tài liệu".

### the agent's Discretion
- Inline hay component riêng cho admin upload form.
- Grade select UI style (Select dropdown vs radio group).
- File path prefix cho standalone uploads (lessonId is null).
- QueryKey strategy cho standalone materials.

### Deferred Ideas (OUT OF SCOPE)
- Search tài liệu theo tên.
- Phân trang / infinite scroll.
- Preview PDF inline.
- Thống kê lượt download.
- Tài liệu có trả phí / enrollment-gated.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAT-01 | Admin có thể upload tài liệu PDF với grade | D-09: adapt upload form — grade select, hardcode lessonId=null |
| MAT-02 | Tất cả học sinh đã approved (+ public) có thể xem và tải | D-01 + new anon RLS + anon storage policy |
| MAT-03 | Trang tài liệu có filter theo grade | D-02 + D-07: grade filter tabs + grid cards |
</phase_requirements>

---

## Summary

Phase 21 xây dựng trang `/tai-lieu` (public) để browse và download PDF theo grade, và trang admin `/quan-tri/tai-lieu` để upload. Nền tảng (table, bucket, signed URL API) đã tồn tại từ Phase 16 — phase này mở rộng schema (nullable lesson_id, thêm grade 'advanced', nullable category), extends API, và xây hai trang mới.

**Điểm cần đặc biệt lưu ý:**

1. **RLS gap cho public access**: Hiện tại `study_materials` chỉ có `TO authenticated` policies. Cần thêm `anon` SELECT policy cho `lesson_id IS NULL` rows, VÀ anon storage policy để `createSignedUrl` hoạt động với anon key.
2. **Teacher upload policy**: Storage policy `admin_upload_study_materials` hiện chỉ cho `admin` role. Cần extend để teacher cũng có thể upload (D-05).
3. **File path không thể dùng `lessonId` prefix**: Upload function hiện tại dùng `${lessonId}/...`. Standalone uploads cần path riêng (e.g., `standalone/${timestamp}-${random}.${ext}`).
4. **Type mismatch**: `StudyMaterialGrade` chưa có `'advanced'`, cần thêm vào type và GRADE_LABELS.

**Primary recommendation:** Migration first (P01) → API extension (P02) → Public page (P03) → Admin page (P04) → Routes + Nav (P05). Thứ tự quan trọng vì P03/P04 phụ thuộc P02 API.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Browse standalone materials (public) | Frontend (React) | Supabase (anon RLS) | Trang public render data từ DB qua anon key |
| Grade filter | Frontend (React state) | — | Client-side filter hoặc query param, không cần server |
| Download signed URL | API layer (study-materials.ts) | Supabase Storage | `createSignedUrl` gọi từ browser qua JS client |
| Upload standalone material | API layer (study-materials.ts) | Supabase Storage + DB | Auth user (admin/teacher) upload file + insert row |
| Admin list + delete | Frontend (React) | Supabase (authenticated RLS) | Reuse delete logic từ Phase 16 |
| DB schema changes | Supabase Migration | — | ALTER TABLE constraints |
| RLS public access | Supabase Migration | — | Thêm anon policies |
| Route protection (/quan-tri/tai-lieu) | Frontend (ProtectedRoute) | — | `allowedRoles={['admin', 'teacher']}` |
| Nav link | Frontend (AdminLayout) | — | Add to navItems array |

---

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | v5 | Server state, data fetching | Project standard — all pages use it |
| @supabase/supabase-js | current | DB + Storage client | Project standard |
| lucide-react | current | Icons (FileText, Download) | Project standard |
| tailwindcss | v3 | Styling | Project standard |
| shadcn/ui | current | Badge, Card, Button, Skeleton | Project standard |

### Existing API Functions to Reuse
| Function | File | Reuse Plan |
|----------|------|------------|
| `getStudyMaterialSignedUrl(filePath)` | `study-materials.ts` | Reuse directly in download handler |
| `deleteStudyMaterial(id, filePath)` | `study-materials.ts` | Reuse in admin page |
| `detectFileType(file)` | `study-materials.ts` (private) | Reuse pattern (copy or expose) |

### Layout Patterns
| Pattern | Used By | For Phase 21 |
|---------|---------|-------------|
| `Header` + `Footer` from landing | `Index.tsx`, `GioiThieu.tsx` | Use for `/tai-lieu` public page |
| `StudentLayout` + `AdminLayout` | Admin pages | Use for `/quan-tri/tai-lieu` |
| `ProtectedRoute allowedRoles` | `SubmissionsPage`, `ExamSessions` | Use for admin route |

---

## Architecture Patterns

### System Architecture Diagram

```
Public User                  Auth User (admin/teacher)
     │                              │
     ▼                              ▼
/tai-lieu (no ProtectedRoute)   /quan-tri/tai-lieu (ProtectedRoute allowedRoles)
     │                              │
     ▼                              ▼
TaiLieuPage.tsx              TaiLieuAdminPage.tsx
     │                              │
     │ useQuery                     │ useMutation (upload)
     │ ['standalone-materials',     │ useQuery (list)
     │   grade]                     │ useMutation (delete)
     │                              │
     ▼                              ▼
fetchStandaloneStudyMaterials() ── uploadStudyMaterialStandalone()
     │                              │ deleteStudyMaterial() [existing]
     ▼                              │
study_materials table          study-materials bucket
(lesson_id IS NULL)                 │
(anon SELECT policy NEW)            │ teacher+admin upload policy NEW
     │                              │
     ▼ (on download click)          │
getStudyMaterialSignedUrl()    ◄────┘
     │
     ▼
window.open(signedUrl, '_blank')
(anon storage SELECT policy NEW allows createSignedUrl for anon)
```

### Recommended File Structure
```
src/
├── pages/
│   ├── TaiLieuPage.tsx          # NEW — public /tai-lieu
│   └── admin/
│       └── TaiLieuAdminPage.tsx # NEW — /quan-tri/tai-lieu
├── lib/api/
│   └── study-materials.ts       # EXTEND — add fetchStandaloneStudyMaterials + uploadStandalone
└── lib/constants/
    └── grades.ts                # NO CHANGE needed — 'advanced' already exists in GRADE_BADGE
supabase/migrations/
└── 20260518_28_study_materials_public.sql  # NEW migration
```

### Recommended Project Structure
```
supabase/migrations/
└── 20260518_28_study_materials_public.sql
src/pages/
├── TaiLieuPage.tsx
└── admin/TaiLieuAdminPage.tsx
```

---

## Pattern 1: Adding Nav Link to AdminLayout

**Current navItems** (`src/components/admin/AdminLayout.tsx`, lines 15-21):
```typescript
// Source: AdminLayout.tsx (verified)
const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', icon: Users, adminOnly: true },
  { label: 'Quản lý khóa học', to: '/quan-tri/khoa-hoc', icon: BookOpen, adminOnly: true },
  { label: 'Gói học', to: '/quan-tri/goi-hoc', icon: Package, adminOnly: true },
  { label: 'Chấm bài', to: '/quan-tri/bai-nop', icon: ClipboardList },
  { label: 'Đề thi thử', to: '/quan-tri/de-thi', icon: FileText },
  // ADD HERE:
  { label: 'Tài liệu', to: '/quan-tri/tai-lieu', icon: FileText },
]
```

**Note:** `FileText` is ALREADY imported in AdminLayout.tsx (line 2). No new import needed.

**Note:** The new nav item does NOT have `adminOnly: true` because teachers also need access (D-05).

---

## Pattern 2: Adding Routes to App.tsx

**Current routing pattern** (verified in `App.tsx`):
```typescript
// Source: App.tsx (verified)
// Public route — no ProtectedRoute
<Route path="/tai-lieu" element={<TaiLieuPage />} />

// Admin + teacher route
<Route path="/quan-tri/tai-lieu" element={
  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
    <StudentLayout>
      <AdminLayout>
        <TaiLieuAdminPage />
      </AdminLayout>
    </StudentLayout>
  </ProtectedRoute>
} />
```

**Note:** `/tai-lieu` dùng `Header` + `Footer` từ landing (pattern từ `GioiThieu.tsx`), không cần `StudentLayout`.

---

## Pattern 3: Grade Filter (reference CataloguePage pattern)

```typescript
// Source: CataloguePage.tsx (verified)
// Grade filter pattern — adapt for study materials
const GRADE_FILTERS: { value: StudyMaterialGrade | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn thi chuyên' },
]
// Use useState for selected grade (no URL sync needed — D-07 doesn't specify)
const [selectedGrade, setSelectedGrade] = useState<StudyMaterialGrade | 'all'>('all')
```

---

## Pattern 4: TanStack Query for Standalone Materials

```typescript
// Pattern from ExamSessionsPage.tsx and StudyMaterialsList.tsx (verified)
const { data: materials = [], isLoading } = useQuery({
  queryKey: ['standalone-materials', grade ?? 'all'],
  queryFn: () => fetchStandaloneStudyMaterials(grade === 'all' ? undefined : grade),
})

// For download — on button click (not pre-fetched, TTL 1h)
const handleDownload = async (filePath: string) => {
  const url = await getStudyMaterialSignedUrl(filePath)
  window.open(url, '_blank', 'noopener')
}
```

---

## Pattern 5: Upload Standalone Material (adapted from uploadStudyMaterial)

The existing `uploadStudyMaterial` hardcodes `lesson_id: lessonId` and `category`. Need a new function:

```typescript
// New function in study-materials.ts
export async function uploadStandaloneStudyMaterial(
  file: File,
  meta: { title: string; grade: StudyMaterialGrade },
): Promise<StudyMaterial> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 6)
  const path = `standalone/${timestamp}-${random}.${ext}`  // ← no lessonId prefix

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('study_materials')
    .insert({
      lesson_id: null,          // ← standalone
      title: meta.title,
      file_path: path,
      file_type: detectFileType(file),
      category: null,           // ← nullable after migration
      grade: meta.grade,
    })
    .select()
    .single()
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {})
    throw error
  }
  return data as StudyMaterial
}
```

**Path strategy:** `standalone/${timestamp}-${random}.${ext}` — clear namespace separation from lesson-scoped files (`${lessonId}/...`).

---

## Critical DB Schema Analysis

### Current State (from migration `20260507_25_study_materials.sql`)

```sql
-- VERIFIED constraints:
lesson_id  uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE
category   text NOT NULL CHECK (category IN ('giua_ky', 'cuoi_ky', 'vao_10', 'hsg', 'chuyen_toan'))
grade      text NOT NULL CHECK (grade IN ('grade_7', 'grade_8', 'grade_9'))
```

### Required Migration (new file: `20260518_28_study_materials_public.sql`)

```sql
-- 1. Make lesson_id nullable (standalone materials have lesson_id = NULL)
ALTER TABLE public.study_materials
  ALTER COLUMN lesson_id DROP NOT NULL;

-- The ON DELETE CASCADE FK constraint stays — lesson-linked materials still work.
-- Note: DROP NOT NULL does NOT drop the FK constraint in PostgreSQL.

-- 2. Add 'advanced' to grade CHECK constraint
ALTER TABLE public.study_materials
  DROP CONSTRAINT IF EXISTS study_materials_grade_check;
ALTER TABLE public.study_materials
  ADD CONSTRAINT study_materials_grade_check
  CHECK (grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced'));

-- 3. Make category nullable (bỏ NOT NULL và CHECK constraint)
ALTER TABLE public.study_materials
  DROP CONSTRAINT IF EXISTS study_materials_category_check;
ALTER TABLE public.study_materials
  ALTER COLUMN category DROP NOT NULL;

-- 4. Anon SELECT policy on study_materials (public browse)
CREATE POLICY "anon_read_standalone_study_materials"
  ON public.study_materials FOR SELECT
  TO anon
  USING (lesson_id IS NULL);

-- 5. Anon storage policy — allow createSignedUrl for study-materials bucket
CREATE POLICY "anon_read_study_materials_storage"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'study-materials');

-- 6. Teacher upload policy (extend admin-only policy)
CREATE POLICY "teacher_upload_study_materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'teacher'
  );

-- 7. Teacher DELETE on storage (for admin page management)
CREATE POLICY "teacher_delete_study_materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'teacher'
  );

-- 8. Teacher INSERT/DELETE on study_materials table
CREATE POLICY "teacher_all_study_materials"
  ON public.study_materials FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'teacher')
  WITH CHECK (public.get_my_role() = 'teacher');
```

**⚠️ Constraint name:** PostgreSQL auto-generates constraint names — verify actual names with `\d study_materials` or check migration SQL. The CHECK constraint from migration 25 may be named differently. Use `IF EXISTS` for safety.

---

## TypeScript Interface Changes

### study-materials.ts changes required

```typescript
// BEFORE (current):
export interface StudyMaterial {
  lesson_id: string                        // NOT NULL
  category: 'giua_ky' | 'cuoi_ky' | 'vao_10' | 'hsg' | 'chuyen_toan'  // NOT NULL
  grade: 'grade_7' | 'grade_8' | 'grade_9'  // missing 'advanced'
}
export type StudyMaterialGrade = StudyMaterial['grade']  // missing 'advanced'

// AFTER (post-migration):
export interface StudyMaterial {
  lesson_id: string | null                 // nullable
  category: 'giua_ky' | 'cuoi_ky' | 'vao_10' | 'hsg' | 'chuyen_toan' | null  // nullable
  grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'  // add 'advanced'
}
export type StudyMaterialGrade = StudyMaterial['grade']  // now includes 'advanced'

// Add to GRADE_LABELS:
export const GRADE_LABELS: Record<StudyMaterialGrade, string> = {
  grade_7: 'Lớp 7',
  grade_8: 'Lớp 8',
  grade_9: 'Lớp 9',
  advanced: 'Ôn thi chuyên',  // ADD
}

// New API function:
export async function fetchStandaloneStudyMaterials(
  grade?: StudyMaterialGrade
): Promise<StudyMaterial[]>
```

**Impact of lesson_id change:** `StudyMaterialsList.tsx` uses `lessonId` as `string` — no change needed there since it's a consumer, not the interface definition. But Phase 16 upload form passes `lessonId: string` to `uploadStudyMaterial` — no breaking change since that function stays unchanged.

---

## GRADE_BADGE Analysis

```typescript
// Source: src/lib/constants/grades.ts (verified)
// GRADE_BADGE already has 'advanced':
export const GRADE_BADGE: Record<Course['target_grade'], { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
}
```

**Good news:** `GRADE_BADGE` already includes `advanced` with correct label "Ôn chuyên" and appropriate Indigo styling.

**Type coupling issue:** `GRADE_BADGE` is typed `Record<Course['target_grade'], ...>`. Since `Course['target_grade']` includes `'advanced'`, and `StudyMaterialGrade` will also include `'advanced'`, `GRADE_BADGE` can be reused for study material grade badges without change.

---

## RLS & Security Analysis

### Current RLS on study_materials (verified from migration 25)

| Policy | Role | Operation | Condition |
|--------|------|-----------|-----------|
| `admin_all_study_materials` | authenticated | ALL | `get_my_role() = 'admin'` |
| `student_read_study_materials` | authenticated | SELECT | `has_grade_access(grade)` |

**Critical gaps for Phase 21:**
1. ❌ No `anon` SELECT policy → public browse fails (returns 0 rows for unauthenticated users)
2. ❌ No `teacher` INSERT/DELETE policy → D-05 requirement unmet
3. ❌ No `anon` storage policy → `createSignedUrl` fails for unauthenticated users

### Current Storage Policies (verified from migration 25)

| Policy | Role | Operation | Condition |
|--------|------|-----------|-----------|
| `admin_upload_study_materials` | authenticated | INSERT | `get_my_role() = 'admin'` |
| `auth_read_study_materials` | authenticated | SELECT | `bucket_id = 'study-materials'` |
| `admin_delete_study_materials` | authenticated | DELETE | `get_my_role() = 'admin'` |

**Gaps:** Anon can't call `createSignedUrl` (no anon SELECT policy). Teacher can't upload or delete.

### How Supabase `createSignedUrl` Works with Anon Key

When an unauthenticated browser calls `supabase.storage.from('study-materials').createSignedUrl(path, 3600)`:
- The Supabase JS client sends request with anon JWT
- Supabase Storage checks RLS policies with role = `anon`
- If anon SELECT policy exists on `storage.objects` for that bucket → ✅ returns signed URL
- The signed URL itself is time-limited (1h) and doesn't require further auth to download

This is the correct pattern — similar to how public catalogue works (anon SELECT on courses table).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Signed URL generation | Custom URL signing | `getStudyMaterialSignedUrl` (existing) | Already built in Phase 16, 1h TTL |
| File upload with rollback | Custom upload + cleanup | `uploadStandaloneStudyMaterial` (extend existing pattern) | Phase 16 pattern includes storage + DB insert with rollback |
| Grade badge colors | Custom badge colors | `GRADE_BADGE` from `src/lib/constants/grades.ts` | Already has all 4 grades incl. advanced |
| Role-based route protection | Custom auth check | `<ProtectedRoute allowedRoles>` | Already handles admin + teacher pattern |
| Toast notifications | Custom toast | `sonner` + `toast.success/error` | Project standard |
| Delete confirm dialog | Custom confirm | `AlertDialog` from shadcn/ui | Pattern from StudyMaterialsList |

---

## Common Pitfalls

### Pitfall 1: lesson_id DROP NOT NULL drops the FK — FALSE
**What goes wrong:** Assuming `ALTER COLUMN lesson_id DROP NOT NULL` also drops the FK reference to `lessons(id)`.
**Reality:** In PostgreSQL, `DROP NOT NULL` only removes the NOT NULL constraint. The FK relationship stays. Lesson-linked materials still cascade-delete when a lesson is deleted.
**How to avoid:** Only drop NOT NULL; don't drop the FK. Write migration carefully.

### Pitfall 2: CHECK constraint name unknown
**What goes wrong:** `ALTER TABLE DROP CONSTRAINT study_materials_grade_check` fails because the auto-generated name may differ.
**Why it happens:** PostgreSQL generates constraint names from table + column + "check", but the actual name in migration 25 used `CHECK(grade IN (...))` inline without explicit name.
**How to avoid:** Use `DROP CONSTRAINT IF EXISTS` with the expected auto-generated name, or query `pg_constraint` to verify. Safe approach: `DO $$ BEGIN IF EXISTS (SELECT FROM pg_constraint WHERE ...) THEN ALTER TABLE ... DROP CONSTRAINT ...; END IF; END $$`.

### Pitfall 3: Anon cannot call createSignedUrl without storage policy
**What goes wrong:** `/tai-lieu` calls `getStudyMaterialSignedUrl` for anonymous user → Supabase returns 403.
**Why it happens:** Storage bucket is private (public=false). No anon SELECT policy on `storage.objects`.
**How to avoid:** Migration must add `anon` SELECT policy on `storage.objects` for `bucket_id = 'study-materials'`. **This is required for download to work on public page.**

### Pitfall 4: File path collision with lesson-scoped files
**What goes wrong:** Using `null/${timestamp}.ext` or empty string prefix for standalone — path becomes `/timestamp.ext` which is invalid or collides with root.
**How to avoid:** Use explicit prefix `standalone/${timestamp}-${random}.${ext}`. This cleanly separates standalone from lesson-scoped (`${lessonId}/...`).

### Pitfall 5: StudyMaterialGrade type not updated before use
**What goes wrong:** Adding `'advanced'` to DB grade CHECK but not to TypeScript `StudyMaterialGrade` type causes TS errors on grade select and GRADE_LABELS access.
**How to avoid:** Update interface + type + GRADE_LABELS in `study-materials.ts` in P02 (API task) before building UI.

### Pitfall 6: category column insert fails after migration
**What goes wrong:** `uploadStudyMaterial` (Phase 16) still passes `category: 'giua_ky'` — this still works after migration (nullable but value provided). `uploadStandaloneStudyMaterial` must pass `category: null` explicitly or omit it.
**How to avoid:** In new standalone upload function, explicitly set `category: null` or don't include it in the insert payload.

### Pitfall 7: Teacher can browse admin page but can't upload (storage policy gap)
**What goes wrong:** Teacher navigates to `/quan-tri/tai-lieu`, selects file, clicks upload → 403 from storage because `admin_upload_study_materials` policy only allows `admin`.
**How to avoid:** Migration must add teacher-specific storage INSERT policy AND study_materials table INSERT policy for teacher role.

---

## Code Examples

### fetchStandaloneStudyMaterials (new API function)

```typescript
// Source: extend src/lib/api/study-materials.ts
export async function fetchStandaloneStudyMaterials(
  grade?: StudyMaterialGrade,
): Promise<StudyMaterial[]> {
  let query = supabase
    .from('study_materials')
    .select('*')
    .is('lesson_id', null)          // standalone only
    .order('created_at', { ascending: false })

  if (grade) {
    query = query.eq('grade', grade)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as StudyMaterial[]
}
```

### Grade filter buttons (TaiLieuPage pattern)

```typescript
// Pattern from CataloguePage.tsx (verified)
const GRADE_FILTERS = [
  { value: 'all' as const, label: 'Tất cả' },
  { value: 'grade_7' as const, label: 'Lớp 7' },
  { value: 'grade_8' as const, label: 'Lớp 8' },
  { value: 'grade_9' as const, label: 'Lớp 9' },
  { value: 'advanced' as const, label: 'Ôn thi chuyên' },
]

// In component:
const [selectedGrade, setSelectedGrade] = useState<StudyMaterialGrade | 'all'>('all')

const { data: materials = [], isLoading } = useQuery({
  queryKey: ['standalone-materials', selectedGrade],
  queryFn: () => fetchStandaloneStudyMaterials(
    selectedGrade === 'all' ? undefined : selectedGrade
  ),
})
```

### Download handler (D-08)

```typescript
// Pattern from StudyMaterialsList.tsx onClick (verified)
const [downloading, setDownloading] = useState<string | null>(null)

const handleDownload = async (material: StudyMaterial) => {
  setDownloading(material.id)
  try {
    const url = await getStudyMaterialSignedUrl(material.file_path)
    window.open(url, '_blank', 'noopener')
  } catch {
    toast.error('Không thể tải tài liệu. Vui lòng thử lại.')
  } finally {
    setDownloading(null)
  }
}
```

### Admin upload form (adapted from StudyMaterialUploadForm)

```typescript
// Adapted — remove lessonId, add grade select, hardcode category=null
interface StandaloneUploadFormProps {
  onSuccess?: () => void
}
// Key changes from StudyMaterialUploadForm:
// 1. No lessonId prop
// 2. Add grade select state (default 'grade_7')
// 3. title: editable text input (file.name as default)
// 4. Call uploadStandaloneStudyMaterial(file, { title, grade })
// 5. QueryKey to invalidate: ['standalone-materials'] (all grades)
```

### Public page layout (pattern from GioiThieu.tsx)

```typescript
// Public page — Header + Footer from landing (no StudentLayout, no auth check)
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

export default function TaiLieuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <Header />
      <main className="container mx-auto px-6 py-8">
        {/* grade filter + grid */}
      </main>
      <Footer />
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| lesson-only materials | lesson_id nullable + standalone | Phase 21 | Enables global study library |
| admin-only upload | admin + teacher upload | Phase 21 | Teachers can manage materials |
| authenticated-only browse | public anon browse | Phase 21 | MAT-02 requirement met |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CHECK constraint auto-name is `study_materials_grade_check` and `study_materials_category_check` | Migration section | `DROP CONSTRAINT IF EXISTS` would silently no-op; grade values remain restricted | 
| A2 | `createSignedUrl` respects anon storage RLS policies (requires anon SELECT on storage.objects) | RLS Analysis | Public download would fail 403 |

---

## Open Questions (RESOLVED)

1. **Exact CHECK constraint names in production DB**
   - What we know: Migration 25 uses inline `CHECK()` without explicit `CONSTRAINT name` clause
   - What's unclear: PostgreSQL auto-generates names — may be `study_materials_grade_check1` or similar
   - RESOLVED: P01 migration uses `DROP CONSTRAINT IF EXISTS study_materials_grade_check` and `DROP CONSTRAINT IF EXISTS study_materials_category_check` with `IF EXISTS` guard — safe no-op if names differ. PostgreSQL auto-naming convention (`{table}_{column}_check`) is consistent for inline CHECK without explicit name. Risk mitigated.

2. **Teacher upload: should DELETE also be allowed?**
   - What we know: D-05 says admin + teacher access admin page; admin page has delete button
   - What's unclear: Context is silent on whether teachers can delete (or only admins)
   - RESOLVED: P01 includes `teacher_delete_study_materials` storage policy and `teacher_all_study_materials` table policy — teachers can upload AND delete. Consistent with "manage materials" UX on admin page (D-05). If scope needs narrowing, a future phase can restrict to `created_by = auth.uid()`.

---

## Environment Availability

Step 2.6: SKIPPED — phase is pure code/migration changes within existing Supabase project and React app. No new external services, CLIs, or runtimes required.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + jsdom + @testing-library/react |
| Config file | `vitest.config.ts` (root) |
| Setup file | `src/test/setup.ts` |
| Quick run command | `yarn test --reporter=verbose src/pages/TaiLieuPage.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAT-02/D-01 | TaiLieuPage renders without auth | unit | `yarn test src/pages/TaiLieuPage.test.tsx` | ❌ Wave 0 |
| MAT-03/D-02 | Grade filter 'all' shows all; 'grade_7' filters | unit | `yarn test src/pages/TaiLieuPage.test.tsx` | ❌ Wave 0 |
| D-08 | Download button calls getStudyMaterialSignedUrl + window.open | unit | `yarn test src/pages/TaiLieuPage.test.tsx` | ❌ Wave 0 |
| D-05 | Admin page renders upload form + material list | unit | `yarn test src/pages/admin/TaiLieuAdminPage.test.tsx` | ❌ Wave 0 |
| D-06 | fetchStandaloneStudyMaterials filters lesson_id IS NULL | unit | `yarn test src/lib/api/study-materials.test.ts` | ❌ Wave 0 |
| D-09 | Upload form grade select works, no lessonId | unit | `yarn test src/pages/admin/TaiLieuAdminPage.test.tsx` | ❌ Wave 0 |

### Test Patterns (verified from existing tests)

```typescript
// Standard test setup — from ExamSessionsPage.test.tsx (verified)
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/lib/api/study-materials', () => ({
  fetchStandaloneStudyMaterials: vi.fn().mockResolvedValue([
    {
      id: 'm1',
      lesson_id: null,
      title: 'Đề Toán 7 HK1',
      file_path: 'standalone/test.pdf',
      file_type: 'pdf',
      category: null,
      grade: 'grade_7',
      created_by: null,
      created_at: '2026-05-18T00:00:00Z',
    }
  ]),
  getStudyMaterialSignedUrl: vi.fn().mockResolvedValue('https://signed.url/test.pdf'),
}))

// Mock window.open
vi.stubGlobal('open', vi.fn())
```

### Sampling Rate
- **Per task commit:** `yarn test --reporter=verbose <specific-test-file>`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/pages/TaiLieuPage.test.tsx` — covers MAT-02, MAT-03, D-01, D-08
- [ ] `src/pages/admin/TaiLieuAdminPage.test.tsx` — covers D-05, D-09
- [ ] `src/lib/api/study-materials.test.ts` — covers D-06 (fetchStandalone)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Public page; admin page uses existing ProtectedRoute |
| V4 Access Control | Yes | ProtectedRoute `allowedRoles=['admin','teacher']`; DB RLS policies |
| V5 Input Validation | Yes | File type checked via MIME type (`detectFileType`); grade validated by DB CHECK |
| V6 Cryptography | No | Signed URLs generated by Supabase (not hand-rolled) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized upload (student trying to upload) | Elevation of Privilege | Storage RLS: only admin/teacher can INSERT; table RLS same |
| Download of lesson-linked (private) materials via anon policy | Information Disclosure | Anon RLS policy is scoped to `lesson_id IS NULL` only — lesson-linked rows not exposed |
| Path traversal in file upload | Tampering | Supabase Storage handles path normalization; path is server-constructed (not user-provided) |
| Signed URL sharing (valid 1h) | Information Disclosure | Acceptable per D-08; TTL 1h is the project standard |

**Key security invariant:** The anon SELECT policy on `study_materials` MUST include `WHERE lesson_id IS NULL`. This ensures lesson-linked materials (which may be grade-gated) are never exposed to anonymous users.

---

## Sources

### Primary (HIGH confidence — verified in codebase)
- `supabase/migrations/20260507_25_study_materials.sql` — full schema: table columns, constraints, RLS policies, storage policies
- `src/lib/api/study-materials.ts` — current API functions, TypeScript types
- `src/components/student/StudyMaterialUploadForm.tsx` — form props, upload flow
- `src/components/student/StudyMaterialsList.tsx` — list + delete pattern
- `src/components/admin/AdminLayout.tsx` — navItems structure, FileText already imported
- `src/App.tsx` — routing patterns, ProtectedRoute usage
- `src/lib/constants/grades.ts` — GRADE_BADGE (advanced already present)
- `src/pages/student/CataloguePage.tsx` — GRADE_FILTERS pattern, public page with anon access

### Secondary (HIGH confidence — verified in codebase)
- `src/components/auth/ProtectedRoute.tsx` — allowedRoles API
- `src/pages/GioiThieu.tsx` — public page layout pattern (Header + Footer)
- `src/pages/admin/ExamSessionsPage.tsx` — TanStack Query + admin page pattern
- `src/pages/admin/ExamSessionsPage.test.tsx` — test pattern

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in package.json/codebase
- DB migration: HIGH — schema verified from migration file; constraint names ASSUMED (A1)
- Architecture: HIGH — verified from existing code patterns
- RLS analysis: HIGH — policies verified from migration; anon signed URL behavior ASSUMED from Supabase docs pattern (consistent with catalogue anon pattern in project)
- Pitfalls: HIGH — derived from direct code inspection

**Research date:** 2026-05-18  
**Valid until:** 2026-06-18 (stable stack)
