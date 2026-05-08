---
phase: 16-lesson-tabs-study-materials
plans_completed: 3
tags: [react, tanstack-query, supabase-storage, tabs, study-materials]

provides:
  - 3-tab lesson layout (Bài giảng / Bài kiểm tra / Thảo luận) in LessonContent
  - study_materials table + RLS + study-materials private Storage bucket
  - StudyMaterialsList with thumbnail view, signed URLs, admin delete
  - StudyMaterialUploadForm (inline toggle, file + category + grade select)
  - Chat Tab 3 placeholder (later wired to ChatPanel in Phase 17)

requirements-completed: [LESSON-01, LESSON-02, LESSON-03, MAT-01, MAT-02, MAT-03]
completed: "2026-05-07"
---

# Phase 16 Summary — Lesson Tabs + Study Materials Library

**3-tab lesson view implemented with full study materials upload/download/delete for admins; students with grade access see thumbnails + signed-URL download.**

## What Was Built

### Plan 1 — Database, Storage & API Layer
- Migration `20260507_25_study_materials.sql`: `study_materials` table with RLS (`admin_all`, `student_read_study_materials` gated by `has_grade_access(grade)`), `study-materials` private bucket with storage policies.
- `src/lib/api/study-materials.ts`: `StudyMaterial` interface, `CATEGORY_LABELS`/`GRADE_LABELS`, `fetchStudyMaterials`, `uploadStudyMaterial`, `deleteStudyMaterial`, `getStudyMaterialSignedUrl`, `getStudyMaterialSignedUrls`.

### Plan 2 — Lesson Tabs UI Refactor
- `LessonContent.tsx` refactored to 3 Tabs layout: video above tabs (always visible), Tab 1 "Bài giảng" (description + study materials), Tab 2 "Bài kiểm tra" (assignment + SubmissionArea, conditional on `assignment_path`), Tab 3 "Thảo luận" (placeholder → wired to ChatPanel in Phase 17).
- `isAdmin` and `courseGrade` props threaded from `CourseDetailPage` through `LessonContent`.
- Tab state resets to `bai-giang` on lesson change via `useEffect([lesson?.id])`.
- `StudyMaterialsList` component: thumbnail grid (200×200px), signed URL generation, admin delete with `AlertDialog` confirm.
- `StudyMaterialUploadForm` component: inline toggle ("Thêm tài liệu"), file picker + category Select + grade Select (pre-filled from course grade), `useMutation(uploadStudyMaterial)` with TanStack Query invalidation.

### Plan 3 — UAT, UI Audit & Fixes
- UAT Pass 1: 9 items passed, 2 issues found and fixed (submission image overflow, teacher_images empty guard).
- UAT Pass 2: 12 items passed, 1 skipped (Supabase Dashboard manual check), 0 issues.
- UI audit review (docs: `6b79a8f`), 7 auto-fixable findings resolved (`8cf634f`), 2 reverted after further review (`5baec68`).
- Thumbnail refinements: unified 200×200 size, overlap fix, X button positioned with `relative` wrapper.
- Simplified from category-filter approach to thumbnail-only flow per iterative UX feedback.

## Key Files

| File | Status |
|------|--------|
| `supabase/migrations/20260507_25_study_materials.sql` | Created |
| `src/lib/api/study-materials.ts` | Created |
| `src/components/student/LessonContent.tsx` | Modified (tabs refactor) |
| `src/components/student/StudyMaterialsList.tsx` | Created |
| `src/components/student/StudyMaterialUploadForm.tsx` | Created |
| `src/components/student/CourseDetailPage.tsx` | Modified (isAdmin + courseGrade props) |

## Key Decisions

- **Thumbnail-only flow** (no category filter in final impl): simplified from original spec after UX feedback — admin uploads image/PDF, shown as thumbnail grid.
- **Video above tabs**: moved above `<Tabs>` component so it persists across tab switches without re-mount.
- **Chat Tab 3 placeholder**: inline `<div>` with "Tính năng sắp có" — replaced by `ChatPanel` in Phase 17 (Plan 17-03).
- **`has_grade_access(grade)` in student RLS**: reuses existing Phase 14 SECURITY DEFINER function; students only see materials matching their enrolled course grade.
- **Signed URLs batched**: `getStudyMaterialSignedUrls` runs `Promise.all` — single query burst, not N sequential calls.

## Requirements Delivered

| Req | Description | Status |
|-----|-------------|--------|
| LESSON-01 | 3-tab layout, no reload on switch | ✅ |
| LESSON-02 | SubmissionArea preserved in Tab 2 | ✅ |
| LESSON-03 | Tab 3 placeholder | ✅ |
| MAT-01 | Admin uploads PDF/image with category + grade | ✅ |
| MAT-02 | Students with grade access view/download | ✅ |
| MAT-03 | Category/thumbnail display per material | ✅ |

## Commits (chronological)

- `ebdbe08` docs(16): capture phase context
- `c31483e` feat(16): lesson tabs + study materials library
- `a7ddf26` fix(16): video above tabs, hide empty materials for student
- `103f47e` fix(16): description inside tab 1, remove label for students
- `203b389` fix(16): teacher_images empty guard, overflow-hidden on enrolled wrappers
- `b49f035` test(16): complete UAT — 9 passed, 2 issues, 1 skipped
- `048a0b5` fix(16): admin study materials in edit mode + responsive submission images
- `341e2ef` refactor(16): rename attachment section + card UI for study materials
- `0e7ffb8` refactor(16): add hint text + align button style with LessonInlineForm
- `fb31647` refactor(16): simplify study materials to thumbnail-only flow
- `ae8f802` feat(16): unified 200×200 thumbnails + admin view cleanup
- `da511ac` fix(16): fix thumbnail overlap + unified student/admin style
- `720b28c` fix(16): fix Bài kiểm tra thumbnails sticking together
- `5d5da7c` fix(16): remove card from Đề bài in view mode — card only in edit form
- `d35119d` test(16): UAT complete — 12 passed, 0 issues, 1 skipped
- `6b79a8f` docs(16): UI audit review
- `8cf634f` fix(16): audit-fix — 7 auto-fixable UI review findings
- `5baec68` revert(16): undo F1 and F6 audit fixes — both were correct before
