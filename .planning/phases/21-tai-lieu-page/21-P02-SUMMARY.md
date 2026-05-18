---
phase: 21-tai-lieu-page
plan: P02
subsystem: ui/pages
tags: [public-page, grade-filter, study-materials, react-query, download]
dependency_graph:
  requires:
    - fetchStandaloneStudyMaterials (from P01)
    - getStudyMaterialSignedUrl (from P01)
  provides:
    - TaiLieuPage (public /tai-lieu route)
  affects:
    - src/pages/TaiLieuPage.tsx
    - src/App.tsx
tech_stack:
  added: []
  patterns:
    - "Client-side grade filter over single all-grades fetch (no re-fetch on pill change)"
    - "Per-card download state with downloadingId: string | null"
    - "GradeBadge helper function outside component for clean JSX"
    - "Public page shell: Header + Footer wrapping main, no ProtectedRoute"
key_files:
  created:
    - src/pages/TaiLieuPage.tsx
  modified:
    - src/App.tsx
decisions:
  - "Fetch all grades once at mount, filter client-side — avoids N+1 queries on grade change"
  - "downloadingId tracks one string|null instead of Set<string> — PDF download is sequential by design"
  - "Route /tai-lieu added without ProtectedRoute per D-01 (public access)"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-18T16:15:00Z"
  tasks_completed: 1
  tasks_total: 1
  files_created: 1
  files_modified: 1
---

# Phase 21 Plan P02: TaiLieuPage — Public Grade-Filtered Material Browser Summary

**One-liner:** Single-file public React page at `/tai-lieu` with 5-option grade filter pills, 3-col card grid, per-card signed-URL download, skeleton/empty/error states — no login required.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create TaiLieuPage.tsx — public grade-filtered material browser | `49cf5e0` | `src/pages/TaiLieuPage.tsx`, `src/App.tsx` |

## What Was Built

### `src/pages/TaiLieuPage.tsx` (182 lines)

**Shell:** `<div className="min-h-screen flex flex-col"><Header /><main className="flex-1">...</main><Footer /></div>` — matches GioiThieu.tsx pattern.

**Hero section:**
- `<h1 className="text-3xl font-bold">Tài liệu học tập</h1>`
- Subtitle: "Tải miễn phí tài liệu PDF theo từng khối lớp"

**Grade filter pills:**
```
GRADE_FILTERS = [all, grade_7, grade_8, grade_9, advanced]
useState<StudyMaterialGrade | 'all'>('all')
```
Active: `bg-primary text-white border-primary` | Inactive: `bg-background text-muted-foreground border-border hover:bg-muted`

**Data layer:**
```tsx
useQuery({ queryKey: ['standalone-study-materials'], queryFn: () => fetchStandaloneStudyMaterials() })
const filtered = materials.filter(m => selectedGrade === 'all' || m.grade === selectedGrade)
```

**Card grid:** `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3` with `.bm-clay-card-student`

**Per card:**
- FileText icon (h-8 w-8, bg-primary/5 rounded-xl container)
- Title with `line-clamp-2` (2-line truncation)
- GradeBadge (from GRADE_BADGE constant)
- Download Button with `bm-btn-cta w-full gap-2` + per-card Loader2 spinner

**Download flow:**
```tsx
setDownloadingId(material.id)
const url = await getStudyMaterialSignedUrl(material.file_path)
window.open(url, '_blank', 'noopener')
```

**States:** Skeleton (6 cards), error state, empty-grade state, empty-all state.

### `src/App.tsx` (deviation: route registration)

Added:
```tsx
import TaiLieuPage from './pages/TaiLieuPage';
// ...
<Route path="/tai-lieu" element={<TaiLieuPage />} />
```

## Verification

```
yarn build → ✓ built in 14.84s (exit 0)
grep "export default function TaiLieuPage" → ✓ 1 match
grep "standalone-study-materials" → ✓ 1 match (queryKey)
grep "getStudyMaterialSignedUrl" → ✓ 2 matches (import + usage)
grep "'_blank', 'noopener'" → ✓ 1 match
grep "downloadingId === material.id" → ✓ 1 match
grep "Ôn thi chuyên" → ✓ 1 match
grep "bm-clay-card-student" → ✓ 1 match
grep "line-clamp-2" → ✓ 1 match
grep "selectedGrade === 'all' || m.grade === selectedGrade" → ✓ 1 match
grep "<Header" → ✓ 1 match
grep "<Footer" → ✓ 1 match
```

## Deviations from Plan

### Auto-added: Route registration in App.tsx (Rule 3 — blocking)

**Found during:** Task 1
**Issue:** Route `/tai-lieu` was referenced in `Header.tsx` nav links but not registered in `App.tsx` routing table. Without this, the page would 404 even after the file was created.
**Fix:** Added `import TaiLieuPage` and `<Route path="/tai-lieu" element={<TaiLieuPage />} />` to `App.tsx`.
**Files modified:** `src/App.tsx`
**Commit:** `49cf5e0`

## Known Stubs

None. The page is fully wired to `fetchStandaloneStudyMaterials` → Supabase. No mock or placeholder data.

## Threat Flags

No new security surface beyond what was modeled in the plan's `<threat_model>`:
- T-21-05 (accepted): TTL 1h signed URL, opened via `noopener` — no referer leakage
- T-21-06 (accepted): No rate limiting at this phase — low-value public PDFs

## Self-Check: PASSED

- `src/pages/TaiLieuPage.tsx` exists ✓
- `src/App.tsx` modified ✓
- Commit `49cf5e0` exists ✓
- `yarn build` exits 0 ✓
