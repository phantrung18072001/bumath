# Phase 21: Tài liệu Page — Pattern Map

**Mapped:** 2026-05-18  
**Files analyzed:** 6 (4 new, 2 extend)  
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/pages/TaiLieuPage.tsx` | page (public) | request-response + client-filter | `src/pages/GioiThieu.tsx` (shell) + `src/pages/student/CataloguePage.tsx` (grade filter + grid) | composite exact |
| `src/pages/admin/TaiLieuAdminPage.tsx` | page (admin) | CRUD | `src/pages/admin/CoursesPage.tsx` | exact |
| `src/lib/api/study-materials.ts` | API layer | request-response | self (existing file, add function) | exact |
| `src/App.tsx` | config/routing | request-response | self (lines 44–57) | exact |
| `src/components/admin/AdminLayout.tsx` | layout/nav | — | self (lines 15–21) | exact |
| `supabase/migrations/20260518_28_study_materials_public.sql` | migration | — | `supabase/migrations/20260507_25_study_materials.sql` | exact |

---

## Pattern Assignments

---

### `src/pages/TaiLieuPage.tsx` (public page, request-response + client-filter)

**Primary shell analog:** `src/pages/GioiThieu.tsx`  
**Filter + data analog:** `src/pages/student/CataloguePage.tsx`

---

#### Imports pattern — public page shell
From `src/pages/GioiThieu.tsx` lines 1–22:
```tsx
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
```

Additional imports from `src/pages/student/CataloguePage.tsx` lines 1–16:
```tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GRADE_BADGE } from '@/lib/constants/grades'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
```

For Phase 21 `TaiLieuPage.tsx` also add:
```tsx
import { FileText, Download } from 'lucide-react'
import { fetchStandaloneStudyMaterials, getStudyMaterialSignedUrl } from '@/lib/api/study-materials'
```

---

#### Public page outer shell
From `src/pages/GioiThieu.tsx` lines 78–82 and 310–316:
```tsx
const GioiThieu = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* ... sections ... */}
      </main>
      <Footer />
    </div>
  );
};

export default GioiThieu;
```
> **Copy:** wrap `TaiLieuPage` in the same `<div className="min-h-screen flex flex-col"><Header /><main className="flex-1">...</main><Footer /></div>` shell.

---

#### Grade filter pills (button group)
From `src/pages/student/CataloguePage.tsx` lines 18–24 and 127–143:
```tsx
const GRADE_FILTERS: { value: Course['target_grade'] | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grade_7', label: 'Lớp 7' },
  { value: 'grade_8', label: 'Lớp 8' },
  { value: 'grade_9', label: 'Lớp 9' },
  { value: 'advanced', label: 'Ôn chuyên' },
]

// In render:
<div className="flex flex-wrap gap-2 mt-3 mb-6">
  {GRADE_FILTERS.map(f => (
    <button
      key={f.value}
      onClick={() => setGrade(f.value)}
      className={[
        'rounded-full px-4 py-2 text-sm font-bold transition-colors duration-150 cursor-pointer min-h-[44px] border',
        activeGrade === f.value
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground',
      ].join(' ')}
    >
      {f.label}
    </button>
  ))}
</div>
```
> **For TaiLieuPage:** Use `useState<string>('all')` instead of `useSearchParams`. `GRADE_FILTERS` definition is identical.

---

#### Grade badge render
From `src/pages/admin/CoursesPage.tsx` lines 48–55:
```tsx
function GradeBadge({ grade }: { grade: Course['target_grade'] }) {
  const { label, className } = GRADE_BADGE[grade] ?? GRADE_BADGE.grade_7
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}
```
> **Copy:** identical helper in `TaiLieuPage.tsx`. `GRADE_BADGE` already has `advanced` key.

---

#### useQuery + client-side grade filter
From `src/pages/student/CataloguePage.tsx` lines 44–93:
```tsx
const { data, isLoading, isError } = useQuery({
  queryKey: ['standalone-study-materials'],
  queryFn: () => fetchStandaloneStudyMaterials(),
})

// Client-side filter
const filtered = (data ?? []).filter(m =>
  activeGrade === 'all' || m.grade === activeGrade
)
```
> **Note:** Phase 21 uses a flat `useQuery` (not `useInfiniteQuery`) since no pagination is needed.

---

#### Card grid layout
From `src/pages/GioiThieu.tsx` lines 259–278:
```tsx
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(({ ... }) => (
    <Card key={...} className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <CardContent className="p-6 space-y-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="font-bold">{title}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  ))}
</div>
```
> **For TaiLieuPage card:** replace `<Icon>` with `<FileText className="w-5 h-5 text-primary" />`, show `GradeBadge`, and add a Download `<Button>`.

---

#### Download signed URL handler (D-08)
Based on `src/lib/api/study-materials.ts` lines 114–120:
```tsx
async function handleDownload(filePath: string) {
  try {
    const url = await getStudyMaterialSignedUrl(filePath)
    window.open(url, '_blank')
  } catch {
    toast.error('Không thể tải tài liệu. Vui lòng thử lại.')
  }
}
```

---

#### Loading skeleton pattern
From `src/pages/student/CataloguePage.tsx` lines 175–180:
```tsx
{isLoading && (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-40 rounded-2xl" />
    ))}
  </div>
)}
```

---

### `src/pages/admin/TaiLieuAdminPage.tsx` (admin CRUD page)

**Analog:** `src/pages/admin/CoursesPage.tsx`

---

#### Imports pattern
From `src/pages/admin/CoursesPage.tsx` lines 1–46:
```tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { GRADE_BADGE } from '@/lib/constants/grades'
```

Add for Phase 21:
```tsx
import { FileText } from 'lucide-react'
import {
  fetchStandaloneStudyMaterials,
  uploadStandaloneStudyMaterial,
  deleteStudyMaterial,
  type StudyMaterial,
  type StudyMaterialGrade,
} from '@/lib/api/study-materials'
```

---

#### Page header pattern
From `src/pages/admin/CoursesPage.tsx` lines 140–147:
```tsx
<div className="container mx-auto px-4 py-8">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-xl font-bold leading-[1.3] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      Quản lý tài liệu
    </h1>
    {/* Upload button here */}
  </div>
```

---

#### useQuery for list
From `src/pages/admin/CoursesPage.tsx` lines 73–80:
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['admin', 'standalone-study-materials'],
  queryFn: () => fetchStandaloneStudyMaterials(),
})
const materials = data ?? []
```

---

#### Delete mutation with toast + AlertDialog
From `src/pages/admin/CoursesPage.tsx` lines 82–92 and 362–385:
```tsx
const deleteMutation = useMutation({
  mutationFn: ({ id, filePath }: { id: string; filePath: string }) =>
    deleteStudyMaterial(id, filePath),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'standalone-study-materials'] })
    toast.success('Đã xóa tài liệu.')
    setDeletingMaterial(null)
  },
  onError: () => {
    toast.error('Xóa không thành công. Vui lòng thử lại.')
  },
})

// AlertDialog confirm (copy from CoursesPage lines 362–385, change entity name)
<AlertDialog open={!!deletingMaterial} onOpenChange={(open) => !open && setDeletingMaterial(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Xóa tài liệu</AlertDialogTitle>
      <AlertDialogDescription>
        Bạn có chắc muốn xóa tài liệu "{deletingMaterial?.title}"? Hành động này không thể hoàn tác.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Hủy</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={() => deletingMaterial && deleteMutation.mutate({ id: deletingMaterial.id, filePath: deletingMaterial.file_path })}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
        Xóa
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

#### Admin upload form (inline, adapted from StudyMaterialUploadForm)
From `src/components/student/StudyMaterialUploadForm.tsx` lines 1–74 (full file):
```tsx
// Original uses: lessonId + defaultGrade passed as props
// Adapted version for TaiLieuAdminPage:
// - Remove lessonId prop — hardcode null in uploadStandaloneStudyMaterial
// - Add grade Select (grade_7 / grade_8 / grade_9 / advanced)
// - Add title Input (instead of auto-deriving from file.name)

const [grade, setGrade] = useState<StudyMaterialGrade>('grade_9')
const [title, setTitle] = useState('')
const fileInputRef = useRef<HTMLInputElement>(null)
const [uploading, setUploading] = useState(false)

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  setUploading(true)
  try {
    await uploadStandaloneStudyMaterial(file, { title: title || file.name.replace(/\.[^.]+$/, ''), grade })
    queryClient.invalidateQueries({ queryKey: ['admin', 'standalone-study-materials'] })
    toast.success('Đã thêm tài liệu!')
    setTitle('')
  } catch {
    toast.error('Tải lên thất bại. Vui lòng thử lại.')
  } finally {
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
}
```

---

#### Table + skeleton loading + empty state
From `src/pages/admin/CoursesPage.tsx` lines 181–207 and 209–295:
```tsx
{isLoading ? (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full rounded-md" />
    ))}
  </div>
) : materials.length === 0 ? (
  <div className="text-center py-16">
    <p className="text-sm font-semibold text-foreground mb-1">Chưa có tài liệu nào</p>
    <p className="text-sm text-muted-foreground">Dùng form trên để tải tài liệu lên.</p>
  </div>
) : (
  <div className="bm-glass-card p-6 overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tiêu đề</TableHead>
          <TableHead>Lớp</TableHead>
          <TableHead>Ngày tải</TableHead>
          <TableHead className="text-right">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((m) => (
          <TableRow key={m.id}>
            {/* cells */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)}
```

---

### `src/lib/api/study-materials.ts` (API layer, EXTEND)

**Analog:** self — extend existing file.

---

#### Type extension — add 'advanced' to StudyMaterialGrade
Current definition at lines 10 and 26–30:
```ts
// Current (line 10):
grade: 'grade_7' | 'grade_8' | 'grade_9'

// Change StudyMaterial.grade to:
grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'

// Change StudyMaterialGrade type to:
export type StudyMaterialGrade = StudyMaterial['grade']

// Extend GRADE_LABELS:
export const GRADE_LABELS: Record<StudyMaterialGrade, string> = {
  grade_7: 'Lớp 7',
  grade_8: 'Lớp 8',
  grade_9: 'Lớp 9',
  advanced: 'Ôn thi chuyên',  // NEW
}
```

---

#### lesson_id nullable — update interface
```ts
// Change line 5:
lesson_id: string | null   // was: string (NOT NULL)
```

---

#### New function: fetchStandaloneStudyMaterials
Pattern from existing `fetchStudyMaterials` (lines 39–47):
```ts
/**
 * Fetch all standalone study materials (lesson_id IS NULL).
 * Public — uses anon RLS policy added in migration 28.
 * Optionally filter by grade.
 */
export async function fetchStandaloneStudyMaterials(
  grade?: StudyMaterialGrade,
): Promise<StudyMaterial[]> {
  let query = supabase
    .from('study_materials')
    .select('*')
    .is('lesson_id', null)
    .order('created_at', { ascending: false })

  if (grade) {
    query = query.eq('grade', grade)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as StudyMaterial[]
}
```

---

#### New function: uploadStandaloneStudyMaterial
Pattern from existing `uploadStudyMaterial` (lines 63–99) — remove `lessonId` param, use `standalone/` prefix:
```ts
/**
 * Upload a standalone study material (no lesson).
 * Path: standalone/{timestamp}-{random}.{ext}
 * Admin + teacher only (enforced by RLS + Storage policy in migration 28).
 */
export async function uploadStandaloneStudyMaterial(
  file: File,
  meta: {
    title: string
    grade: StudyMaterialGrade
  },
): Promise<StudyMaterial> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 6)
  const path = `standalone/${timestamp}-${random}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('study_materials')
    .insert({
      lesson_id: null,        // standalone — no lesson
      title: meta.title,
      file_path: path,
      file_type: detectFileType(file),
      category: null,         // category not used for standalone (nullable after migration)
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

---

### `src/App.tsx` (routing config, EXTEND)

**Analog:** self — lines 42–57 show exact pattern to copy.

---

#### Public route (no ProtectedRoute)
From `src/App.tsx` line 42:
```tsx
<Route path="/gioi-thieu" element={<GioiThieu />} />

// → Add similarly:
<Route path="/tai-lieu" element={<TaiLieuPage />} />
```

---

#### Admin route with allowedRoles
From `src/App.tsx` lines 48–49:
```tsx
<Route
  path="/quan-tri/bai-nop"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <StudentLayout>
        <AdminLayout>
          <SubmissionsPage />
        </AdminLayout>
      </StudentLayout>
    </ProtectedRoute>
  }
/>

// → Add similarly for TaiLieuAdminPage:
<Route
  path="/quan-tri/tai-lieu"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <StudentLayout>
        <AdminLayout>
          <TaiLieuAdminPage />
        </AdminLayout>
      </StudentLayout>
    </ProtectedRoute>
  }
/>
```

---

#### Import placement
From `src/App.tsx` lines 27–27:
```tsx
import GioiThieu from './pages/GioiThieu';
// → Add below:
import TaiLieuPage from './pages/TaiLieuPage';
import TaiLieuAdminPage from './pages/admin/TaiLieuAdminPage';
```

---

### `src/components/admin/AdminLayout.tsx` (nav layout, EXTEND)

**Analog:** self — lines 15–21 show exact navItems array.

---

#### Current navItems array
From `src/components/admin/AdminLayout.tsx` lines 15–21:
```tsx
const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', icon: Users, adminOnly: true },
  { label: 'Quản lý khóa học', to: '/quan-tri/khoa-hoc', icon: BookOpen, adminOnly: true },
  { label: 'Gói học', to: '/quan-tri/goi-hoc', icon: Package, adminOnly: true },
  { label: 'Chấm bài', to: '/quan-tri/bai-nop', icon: ClipboardList },
  { label: 'Đề thi thử', to: '/quan-tri/de-thi', icon: FileText },
]
```

#### Add nav item (D-10)
```tsx
// Insert after 'Đề thi thử':
{ label: 'Tài liệu', to: '/quan-tri/tai-lieu', icon: FileText },
```
> **Note:** `FileText` icon is already imported on line 2. No new import needed.  
> `adminOnly` is **not** set → visible to both admin and teacher.

---

### `supabase/migrations/20260518_28_study_materials_public.sql` (migration)

**Analog:** `supabase/migrations/20260507_25_study_materials.sql`

---

#### Migration file pattern (header comment + numbered sections)
From `supabase/migrations/20260507_25_study_materials.sql` lines 1–4:
```sql
-- Migration 28: Study Materials Public Access — Phase 21
-- Modifies: study_materials table schema, RLS policies, Storage policies
-- Purpose: Allow standalone (lesson_id IS NULL) materials to be browsed/downloaded publicly.
--          Allow teacher role to upload standalone materials.
```

---

#### ALTER TABLE patterns
```sql
-- ── 1. Make lesson_id nullable (D-03) ───────────────────────────────────────
ALTER TABLE public.study_materials
  ALTER COLUMN lesson_id DROP NOT NULL;

-- ── 2. Add 'advanced' to grade CHECK (D-04) ─────────────────────────────────
ALTER TABLE public.study_materials
  DROP CONSTRAINT IF EXISTS study_materials_grade_check;

ALTER TABLE public.study_materials
  ADD CONSTRAINT study_materials_grade_check
  CHECK (grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced'));

-- ── 3. Make category nullable (D-04) ────────────────────────────────────────
ALTER TABLE public.study_materials
  ALTER COLUMN category DROP NOT NULL;
```

---

#### RLS policy patterns (anon SELECT for public page)
From `supabase/migrations/20260507_25_study_materials.sql` lines 36–38 (authenticated SELECT):
```sql
-- Existing authenticated policy (reference):
CREATE POLICY "student_read_study_materials"
  ON public.study_materials FOR SELECT TO authenticated
  USING (public.has_grade_access(grade));

-- ── 4. Anon SELECT: only standalone rows (D-01, MAT-02) ─────────────────────
CREATE POLICY "anon_read_standalone_study_materials"
  ON public.study_materials FOR SELECT TO anon
  USING (lesson_id IS NULL);
```

---

#### Storage policy patterns (anon signed URL + teacher upload)
From `supabase/migrations/20260507_25_study_materials.sql` lines 54–67:
```sql
-- ── 5. Anon Storage SELECT (for createSignedUrl on public page) ──────────────
CREATE POLICY "anon_read_study_materials_storage"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'study-materials');

-- ── 6. Extend upload policy: teacher can also upload (D-05) ─────────────────
-- Drop old admin-only policy, recreate with admin OR teacher
DROP POLICY IF EXISTS "admin_upload_study_materials" ON storage.objects;

CREATE POLICY "admin_teacher_upload_study_materials"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'study-materials'
    AND public.get_my_role() IN ('admin', 'teacher')
  );
```

---

## Shared Patterns

### Grade badge — `GRADE_BADGE` constant
**Source:** `src/lib/constants/grades.ts` (full file, ~7 lines)
```ts
import { Course } from '@/lib/api/courses'

export const GRADE_BADGE: Record<Course['target_grade'], { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
}
```
**Apply to:** `TaiLieuPage.tsx`, `TaiLieuAdminPage.tsx` — both use `GRADE_BADGE[material.grade]`.

---

### Toast error handling
**Source:** `src/pages/admin/CoursesPage.tsx` lines 88–91 and 101–103:
```ts
onSuccess: () => { toast.success('Đã xóa tài liệu.') }
onError: () => { toast.error('Xóa không thành công. Vui lòng thử lại.') }
```
**Apply to:** all mutation `onSuccess`/`onError` callbacks in both page files and API layer.

---

### QueryClient invalidation
**Source:** `src/pages/admin/CoursesPage.tsx` lines 85–86:
```ts
queryClient.invalidateQueries({ queryKey: ['admin', 'standalone-study-materials'] })
```
**Apply to:** after upload and delete mutations in `TaiLieuAdminPage.tsx`.

---

### ProtectedRoute with allowedRoles
**Source:** `src/App.tsx` line 48:
```tsx
<ProtectedRoute allowedRoles={['admin', 'teacher']}>
```
**Apply to:** `/quan-tri/tai-lieu` route in `App.tsx`.

---

### bm-glass-card container
**Source:** `src/pages/admin/CoursesPage.tsx` line 209:
```tsx
<div className="bm-glass-card p-6 overflow-x-auto">
```
**Apply to:** table/list container in `TaiLieuAdminPage.tsx`.

---

## No Analog Found

All 6 files have close analogs. No files require fallback to RESEARCH.md patterns only.

---

## Metadata

**Analog search scope:** `src/pages/`, `src/pages/admin/`, `src/pages/student/`, `src/components/admin/`, `src/components/student/`, `src/lib/api/`, `src/lib/constants/`, `supabase/migrations/`  
**Files scanned:** 8 analog files read in full  
**Pattern extraction date:** 2026-05-18
