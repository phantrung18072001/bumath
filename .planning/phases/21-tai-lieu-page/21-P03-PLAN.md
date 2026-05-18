---
phase: 21-tai-lieu-page
plan: P03
type: execute
wave: 2
depends_on: [21-P01]
files_modified:
  - src/pages/admin/TaiLieuAdminPage.tsx
autonomous: true
requirements:
  - MAT-01

must_haves:
  truths:
    - "Admin/teacher can upload a standalone study material via inline form (title + grade + file)"
    - "Upload button shows Loader2 spinner + 'Đang tải lên...' while mutation is pending"
    - "Successful upload shows toast.success('Tải lên thành công') and resets the form"
    - "Materials list renders as shadcn Table with columns: Tiêu đề | Khối lớp | Ngày tải | Hành động"
    - "Grade column shows a colored Badge using GRADE_BADGE constant"
    - "Delete button triggers AlertDialog confirm before calling deleteStudyMaterial()"
    - "Successful delete shows toast.success('Đã xóa tài liệu.') and invalidates query"
    - "Skeleton rows shown while data is loading"
    - "Empty state message shown when no materials exist"
  artifacts:
    - path: "src/pages/admin/TaiLieuAdminPage.tsx"
      provides: "Admin/teacher CRUD page for standalone study materials"
      exports: ["default TaiLieuAdminPage"]
      min_lines: 150
  key_links:
    - from: "TaiLieuAdminPage upload form"
      to: "uploadStandaloneStudyMaterial"
      via: "useMutation + handleSubmit"
      pattern: "uploadStandaloneStudyMaterial"
    - from: "TaiLieuAdminPage delete button"
      to: "deleteStudyMaterial"
      via: "deleteMutation.mutate"
      pattern: "deleteStudyMaterial"
    - from: "TaiLieuAdminPage"
      to: "supabase standalone-materials query"
      via: "useQuery(['standalone-materials', 'all'])"
      pattern: "standalone-materials.*all"
---

<objective>
Build `src/pages/admin/TaiLieuAdminPage.tsx` — the admin/teacher page at `/quan-tri/tai-lieu` for uploading and managing standalone study materials.

Purpose: Delivers MAT-01 (admin/teacher upload + management). Per D-05, D-09: inline form (no dialog), title + grade + file inputs, useMutation upload, Table list, AlertDialog delete confirm.
Output: `TaiLieuAdminPage.tsx` — single-file admin CRUD component following `CoursesPage.tsx` patterns.
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/21-tai-lieu-page/21-CONTEXT.md
@.planning/phases/21-tai-lieu-page/21-PATTERNS.md
@.planning/phases/21-tai-lieu-page/21-P01-SUMMARY.md

<interfaces>
<!-- Key contracts the executor needs. No codebase exploration required. -->

From src/lib/api/study-materials.ts (post-P01, confirmed exports):
```typescript
export interface StudyMaterial {
  id: string
  lesson_id: string | null
  title: string
  file_path: string
  file_type: 'pdf' | 'image'
  category: 'giua_ky' | 'cuoi_ky' | 'vao_10' | 'hsg' | 'chuyen_toan' | null
  grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
  created_by: string | null
  created_at: string
}
export type StudyMaterialGrade = 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'

export async function fetchStandaloneStudyMaterials(grade?: StudyMaterialGrade): Promise<StudyMaterial[]>
export async function uploadStandaloneStudyMaterial(file: File, meta: { title: string; grade: StudyMaterialGrade }): Promise<StudyMaterial>
export async function deleteStudyMaterial(id: string, filePath: string): Promise<void>
```

From src/lib/constants/grades.ts (GRADE_BADGE already has 'advanced' key):
```typescript
export const GRADE_BADGE: Record<StudyMaterialGrade, { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
}
```

From src/pages/admin/CoursesPage.tsx (delete pattern):
```tsx
// Delete state:
const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null)

// Delete mutation:
const deleteMutation = useMutation({
  mutationFn: ({ id, filePath }: { id: string; filePath: string }) =>
    deleteStudyMaterial(id, filePath),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['standalone-materials', 'all'] })
    toast.success('Đã xóa tài liệu.')
    setDeletingMaterial(null)
  },
  onError: () => {
    toast.error('Xóa không thành công. Vui lòng thử lại.')
  },
})
```

shadcn Select import path (already installed):
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create TaiLieuAdminPage.tsx — inline upload form + table CRUD</name>
  <files>src/pages/admin/TaiLieuAdminPage.tsx</files>
  <read_first>
    - src/pages/admin/CoursesPage.tsx (admin CRUD analog: useMutation, delete AlertDialog, Table + Skeleton pattern, GradeBadge helper, page header h1 gradient style)
    - src/lib/api/study-materials.ts (confirm function signatures post-P01: uploadStandaloneStudyMaterial, fetchStandaloneStudyMaterials, deleteStudyMaterial)
  </read_first>
  <action>
Create `src/pages/admin/TaiLieuAdminPage.tsx` as a single-file component. Implement exactly as follows:

**Imports (verbatim):**
```tsx
import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { GRADE_BADGE } from '@/lib/constants/grades'
import {
  fetchStandaloneStudyMaterials,
  uploadStandaloneStudyMaterial,
  deleteStudyMaterial,
  type StudyMaterial,
  type StudyMaterialGrade,
} from '@/lib/api/study-materials'
```

**GradeBadge helper (top-level, outside component):**
```tsx
function GradeBadge({ grade }: { grade: StudyMaterialGrade }) {
  const { label, className } = GRADE_BADGE[grade] ?? GRADE_BADGE.grade_7
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}
```

**Date formatter (top-level, outside component):**
```tsx
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
```

**Component state and hooks:**
```tsx
export default function TaiLieuAdminPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState<StudyMaterialGrade>('grade_9')
  const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null)
```

**useQuery (all grades for admin — no grade filter):**
```tsx
  const { data, isLoading } = useQuery({
    queryKey: ['standalone-materials', 'all'],
    queryFn: () => fetchStandaloneStudyMaterials(),
  })
  const materials = data ?? []
```

**Upload mutation:**
```tsx
  const uploadMutation = useMutation({
    mutationFn: ({ file, title, grade }: { file: File; title: string; grade: StudyMaterialGrade }) =>
      uploadStandaloneStudyMaterial(file, { title, grade }),
    onSuccess: () => {
      toast.success('Tải lên thành công')
      setTitle('')
      setGrade('grade_9')
      if (fileInputRef.current) fileInputRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['standalone-materials', 'all'] })
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Tải lên thất bại. Vui lòng thử lại.')
    },
  })
```

**Delete mutation:**
```tsx
  const deleteMutation = useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string }) =>
      deleteStudyMaterial(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standalone-materials', 'all'] })
      toast.success('Đã xóa tài liệu.')
      setDeletingMaterial(null)
    },
    onError: () => {
      toast.error('Xóa không thành công. Vui lòng thử lại.')
    },
  })
```

**Form submit handler:**
```tsx
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file || !title.trim()) {
      toast.error('Vui lòng nhập tiêu đề và chọn file.')
      return
    }
    uploadMutation.mutate({ file, title: title.trim(), grade })
  }
```

**JSX (return block):**
```tsx
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page title */}
      <h1 className="text-2xl font-bold mb-8">Quản lý tài liệu</h1>

      {/* Upload section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Tải lên tài liệu mới</h2>
        <form
          onSubmit={handleSubmit}
          className="bg-muted/50 rounded-xl p-6 border border-border space-y-4"
        >
          {/* Title input */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-title">Tiêu đề</Label>
            <Input
              id="mat-title"
              placeholder="Nhập tiêu đề tài liệu..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={uploadMutation.isPending}
            />
          </div>

          {/* Grade select */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-grade">Khối lớp</Label>
            <Select
              value={grade}
              onValueChange={val => setGrade(val as StudyMaterialGrade)}
              disabled={uploadMutation.isPending}
            >
              <SelectTrigger id="mat-grade" className="w-[200px]">
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grade_7">Lớp 7</SelectItem>
                <SelectItem value="grade_8">Lớp 8</SelectItem>
                <SelectItem value="grade_9">Lớp 9</SelectItem>
                <SelectItem value="advanced">Ôn thi chuyên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File input */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-file">File PDF</Label>
            <Input
              id="mat-file"
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              disabled={uploadMutation.isPending}
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={uploadMutation.isPending}
            className="gap-2"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Tải lên
              </>
            )}
          </Button>
        </form>
      </section>

      {/* Materials list section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Danh sách tài liệu</h2>

        {/* Skeleton loading */}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && materials.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-foreground mb-1">
              Chưa có tài liệu nào. Tải lên tài liệu đầu tiên ở trên.
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && materials.length > 0 && (
          <div className="bm-glass-card overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Khối lớp</TableHead>
                  <TableHead>Ngày tải</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium max-w-[280px] truncate">
                      {m.title}
                    </TableCell>
                    <TableCell>
                      <GradeBadge grade={m.grade} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(m.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setDeletingMaterial(m)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Delete confirm dialog */}
      <AlertDialog
        open={!!deletingMaterial}
        onOpenChange={open => !open && setDeletingMaterial(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài liệu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa tài liệu &ldquo;{deletingMaterial?.title}&rdquo;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deletingMaterial &&
                deleteMutation.mutate({ id: deletingMaterial.id, filePath: deletingMaterial.file_path })
              }
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
```
  </action>
  <verify>
    <automated>yarn build 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `src/pages/admin/TaiLieuAdminPage.tsx` exists
    - `grep "export default function TaiLieuAdminPage" src/pages/admin/TaiLieuAdminPage.tsx` returns 1 match
    - `grep "uploadStandaloneStudyMaterial" src/pages/admin/TaiLieuAdminPage.tsx` returns at least 2 matches (import + mutationFn)
    - `grep "deleteStudyMaterial" src/pages/admin/TaiLieuAdminPage.tsx` returns at least 2 matches (import + mutationFn)
    - `grep "standalone-materials.*all" src/pages/admin/TaiLieuAdminPage.tsx` returns at least 1 match (queryKey)
    - `grep "AlertDialog" src/pages/admin/TaiLieuAdminPage.tsx` returns at least 1 match
    - `grep "Trash2" src/pages/admin/TaiLieuAdminPage.tsx` returns at least 1 match
    - `grep "Đang tải lên" src/pages/admin/TaiLieuAdminPage.tsx` returns 1 match (loading button label)
    - `grep "Tải lên thành công" src/pages/admin/TaiLieuAdminPage.tsx` returns 1 match (success toast)
    - `grep "accept=\".pdf\"" src/pages/admin/TaiLieuAdminPage.tsx` returns 1 match (file input filter)
    - `grep "Ôn thi chuyên" src/pages/admin/TaiLieuAdminPage.tsx` returns 1 match (SelectItem label)
    - `grep "Chưa có tài liệu nào" src/pages/admin/TaiLieuAdminPage.tsx` returns 1 match (empty state)
    - `grep "formatDate" src/pages/admin/TaiLieuAdminPage.tsx` returns at least 2 matches (definition + usage)
    - `grep "Quản lý tài liệu" src/pages/admin/TaiLieuAdminPage.tsx` returns 1 match (h1 title)
    - `grep "bg-muted/50 rounded-xl p-6 border border-border" src/pages/admin/TaiLieuAdminPage.tsx` returns 1 match (form container)
    - `yarn build` exits 0
  </acceptance_criteria>
  <done>TaiLieuAdminPage.tsx created: inline upload form (title + grade select + .pdf file input, useMutation, loading state, success/error toasts + reset), shadcn Table list (GradeBadge, dd/MM/yyyy date, Trash2 delete button), AlertDialog delete confirm, Skeleton loading rows, empty state. All strings verbatim per scope.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| admin/teacher browser → uploadStandaloneStudyMaterial | Authenticated upload — RLS teacher_upload + admin_all policies (P01) enforce role at DB/Storage level |
| admin/teacher browser → deleteStudyMaterial | Authenticated delete — RLS teacher_delete_study_materials policy (P01) enforces role at Storage level |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-21-07 | Elevation of Privilege | TaiLieuAdminPage upload form | mitigate | Route wrapped in `ProtectedRoute allowedRoles={['admin','teacher']}` (P04); RLS policy double-enforces at DB — unauthenticated or student POST rejected at Supabase layer |
| T-21-08 | Tampering | delete button (no ownership check) | accept | Teacher can delete any standalone material — acceptable for Phase 21 since all teachers are trusted staff; no student data is deletable via this path (lesson-linked materials unaffected) |
| T-21-09 | Information Disclosure | file Input type="file" | accept | File content never stored client-side beyond the upload; no PII in PDFs per project scope |
</threat_model>

<verification>
After task completes:

```bash
# File exists and exports correctly
grep "export default function TaiLieuAdminPage" src/pages/admin/TaiLieuAdminPage.tsx

# Key features present
grep "uploadStandaloneStudyMaterial" src/pages/admin/TaiLieuAdminPage.tsx
grep "deleteStudyMaterial" src/pages/admin/TaiLieuAdminPage.tsx
grep "AlertDialog" src/pages/admin/TaiLieuAdminPage.tsx
grep "standalone-materials.*all" src/pages/admin/TaiLieuAdminPage.tsx
grep "Đang tải lên" src/pages/admin/TaiLieuAdminPage.tsx

# Build passes
yarn build
```
</verification>

<success_criteria>
- `src/pages/admin/TaiLieuAdminPage.tsx` exists and exports `TaiLieuAdminPage` as default
- Inline upload form: title Input, grade Select (4 options), file Input (accept=.pdf), submit button with Loader2 + "Đang tải lên..." during upload
- Upload success: toast.success('Tải lên thành công'), form reset, query invalidated
- Table list: GradeBadge, dd/MM/yyyy date, Trash2 delete button
- Delete: AlertDialog confirm → deleteStudyMaterial() → toast.success('Đã xóa tài liệu.') → invalidate
- Skeleton (5 rows) while loading, empty state when 0 materials
- `yarn build` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/21-tai-lieu-page/21-P03-SUMMARY.md`
</output>
