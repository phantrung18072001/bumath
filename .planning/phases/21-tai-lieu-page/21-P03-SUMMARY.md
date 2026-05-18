---
phase: 21-tai-lieu-page
plan: P03
subsystem: admin-ui
tags: [admin, study-materials, upload, crud, react-query, shadcn]
dependency_graph:
  requires:
    - 21-P01 (fetchStandaloneStudyMaterials, uploadStandaloneStudyMaterial, deleteStudyMaterial)
  provides:
    - TaiLieuAdminPage (default export)
    - route /quan-tri/tai-lieu
  affects:
    - src/pages/admin/TaiLieuAdminPage.tsx
    - src/App.tsx
tech_stack:
  added: []
  patterns:
    - "Inline upload form (no dialog) following D-09"
    - "useMutation with isPending spinner + toast feedback"
    - "useQuery ['standalone-materials','all'] invalidation pattern"
    - "AlertDialog delete confirm before mutation"
    - "GRADE_BADGE Record for colored Badge rendering"
key_files:
  created:
    - src/pages/admin/TaiLieuAdminPage.tsx
  modified:
    - src/App.tsx
decisions:
  - "Inline upload form (no dialog) per D-09 decision — better UX for frequent uploads"
  - "Route restricted to allowedRoles=['admin','teacher'] matching teacher-upload RLS policies"
  - "Date formatted as dd/MM/yyyy with manual string formatting (locale-safe)"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-18T16:20:00Z"
  tasks_completed: 1
  tasks_total: 1
  files_created: 1
  files_modified: 1
---

# Phase 21 Plan P03: TaiLieuAdminPage Summary

**One-liner:** Single-file admin/teacher CRUD page at `/quan-tri/tai-lieu` with inline PDF upload form, shadcn Table materials list with colored grade badges, and AlertDialog delete confirm.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create TaiLieuAdminPage + route | `be7054c` | `src/pages/admin/TaiLieuAdminPage.tsx`, `src/App.tsx` |

## What Was Built

### `src/pages/admin/TaiLieuAdminPage.tsx`

**Upload Form (inline, D-09):**
- Fields: Tiêu đề (Input), Khối lớp (Select: grade_7/8/9/advanced), File PDF (file input, accept=".pdf")
- `useMutation` → `uploadStandaloneStudyMaterial(file, {title, grade})`
- Submit button: disabled when any field empty or `isPending`; shows `<Loader2 animate-spin>` + "Đang tải lên..." while pending
- `onSuccess`: `toast.success('Tải lên thành công!')` + resets all form state + `invalidateQueries(['standalone-materials','all'])`
- `onError`: `toast.error(error.message || 'Tải lên thất bại')`

**Materials List:**
- `useQuery({queryKey: ['standalone-materials','all'], queryFn: fetchStandaloneStudyMaterials})`
- Loading state: Table with 5 Skeleton rows
- Table columns: Tiêu đề | Khối lớp | Ngày tải | Hành động
- Grade column: `GRADE_BADGE[material.grade]` → colored Badge
- Date: dd/MM/yyyy via manual format function
- Delete button (variant="destructive") → opens AlertDialog confirm
- Empty state: centered paragraph when `materials.length === 0`

**Delete Flow:**
- `useState<StudyMaterial | null>(null)` for dialog state
- AlertDialog shows material title in description
- `deleteMutation.mutate({id, filePath})` → `toast.success('Đã xóa tài liệu.')` + invalidate

### `src/App.tsx`
- Added import `TaiLieuAdminPage`
- Added route: `/quan-tri/tai-lieu` wrapped in `ProtectedRoute allowedRoles=['admin','teacher']` + `AdminLayout`

## Verification

```
yarn build → ✓ built in 15.25s (exit 0)
src/pages/admin/TaiLieuAdminPage.tsx created (230+ lines)
Route /quan-tri/tai-lieu → present in App.tsx
GRADE_BADGE usage → ✓
uploadStandaloneStudyMaterial → ✓ wired via useMutation
fetchStandaloneStudyMaterials → ✓ wired via useQuery
deleteStudyMaterial → ✓ wired via useMutation
AlertDialog → ✓ present
Skeleton rows → ✓ 5 rows
Empty state → ✓ present
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All data flows are wired to real Supabase API functions from P01.

## Threat Flags

No new security surface. Route is protected by `ProtectedRoute allowedRoles=['admin','teacher']`, matching the RLS policies applied in P01 migration.

## Self-Check: PASSED

- `src/pages/admin/TaiLieuAdminPage.tsx` — FOUND ✓
- Commit `be7054c` — FOUND ✓
- `yarn build` — exit 0 ✓
