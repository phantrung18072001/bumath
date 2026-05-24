---
phase: 20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas
plan: P05
status: ready
created_at: "2026-05-25"
owner: codex
---

# P05 Plan: System-wide Redesign from /danh-muc Model

## Goal
Dùng `/danh-muc` làm mô hình thiết kế chính cho toàn bộ app (student + admin): nền trắng tối giản, card có thumbnail, bo góc thấp, bố cục sạch theo hướng Modern Apple + AI + Minimalism.

## Non-goals
- Không đổi logic nghiệp vụ/API hiện tại.
- Không đổi route structure.
- Không thêm feature backend ngoài upload thumbnail đã có.

## Design Baseline (Source of Truth)
- Reference screen: `src/pages/student/CataloguePage.tsx`
- Shared style principles:
  - White-first background
  - Compact hero/header hierarchy
  - 3-column card grids where content allows
  - Lower radius tokens (`--radius: 0.5rem`, badge non-pill)
  - Image-first cards with deterministic fallback thumbnails

## Scope
1. **Shell & Layout**
- `StudentLayout`: plain white shell by default, no decorative math background.
- `AdminLayout`: plain white shell, remove gradient background dependency.

2. **Student pages**
- `CoursesPage`, `CourseDetailPage`, `ProfilePage`, `MockExamsPage`, `MockExamAttemptPage`.
- Align typography rhythm, card radius, spacing, image density.

3. **Admin pages**
- `UsersPage`, `CoursesPage`, `PackagesPage`, `SubmissionsPage`, `GradingPage`, `ExamSessionsPage`, `ExamSessionDetailPage`, `TaiLieuAdminPage`.
- Replace legacy glass-heavy surfaces with clean white + thin border model where needed.

4. **Shared components/tokens**
- Normalize card radius and badges in `src/components/ui` and `src/index.css`.
- Audit any leftover purple/gradient-heavy backgrounds in authenticated app surfaces.

## Execution Waves

### Wave A (Foundation)
- Apply shell changes (student/admin) and global radius/badge standards.
- Validate no regression on existing tests.

### Wave B (Student rollout)
- Port `/danh-muc` visual grammar to student screens.
- Ensure loading/empty/error states remain consistent.

### Wave C (Admin rollout)
- Migrate admin list/detail screens to same visual system.
- Keep high information density while reducing visual noise.

### Wave D (Polish + Validation)
- Cross-screen spacing/typography pass.
- Accessibility pass (focus, contrast, touch targets).
- Test pass and screenshot QA.

## Acceptance Criteria
- All authenticated screens use white-first background without legacy gradient shell.
- Major content grids/lists have consistent radius/spacing system.
- Course cards across catalogue-like views are image-first (real thumbnail or deterministic fallback).
- No logic/API regression; all targeted page tests pass.

## Verification Commands
- `yarn test src/pages/student/CataloguePage.test.tsx`
- `yarn test src/components/student/StudentLayout.test.tsx`
- `yarn test src/pages/admin/CoursesPage.test.tsx`
- `yarn lint`
