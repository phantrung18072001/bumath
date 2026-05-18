---
phase: 21-tai-lieu-page
plan: P04
type: execute
wave: 3
depends_on: [21-P02, 21-P03]
files_modified:
  - src/App.tsx
  - src/components/admin/AdminLayout.tsx
autonomous: true
requirements:
  - MAT-01
  - MAT-02
  - MAT-03

must_haves:
  truths:
    - "Visiting /tai-lieu renders TaiLieuPage without login (public route, no ProtectedRoute)"
    - "Visiting /quan-tri/tai-lieu requires admin or teacher role (ProtectedRoute allowedRoles)"
    - "AdminLayout sidebar shows 'Tài liệu' nav link pointing to /quan-tri/tai-lieu"
    - "'Tài liệu' nav item has no adminOnly flag — teachers see it without being admin"
    - "yarn build exits 0 (zero TypeScript errors)"
    - "yarn lint exits 0 (zero lint errors)"
  artifacts:
    - path: "src/App.tsx"
      provides: "Route wiring for /tai-lieu and /quan-tri/tai-lieu"
      contains: "path=\"/tai-lieu\""
    - path: "src/components/admin/AdminLayout.tsx"
      provides: "Nav item for /quan-tri/tai-lieu"
      contains: "quan-tri/tai-lieu"
  key_links:
    - from: "src/App.tsx /tai-lieu route"
      to: "src/pages/TaiLieuPage.tsx"
      via: "element={<TaiLieuPage />}"
      pattern: "TaiLieuPage"
    - from: "src/App.tsx /quan-tri/tai-lieu route"
      to: "src/pages/admin/TaiLieuAdminPage.tsx"
      via: "element={<TaiLieuAdminPage />}"
      pattern: "TaiLieuAdminPage"
    - from: "src/components/admin/AdminLayout.tsx navItems"
      to: "/quan-tri/tai-lieu"
      via: "{ label: 'Tài liệu', to: '/quan-tri/tai-lieu', icon: FileText }"
      pattern: "quan-tri/tai-lieu"
---

<objective>
Wire routes and navigation for the two new pages created in P02 and P03, then verify the build is clean.

Purpose: Connects `TaiLieuPage` and `TaiLieuAdminPage` to the router and admin sidebar nav. Without this plan, neither page is reachable. Delivers the final integration step for Phase 21 (MAT-01, MAT-02, MAT-03).
Output: Two surgical edits to `src/App.tsx` and `src/components/admin/AdminLayout.tsx`, plus confirmed zero-error build.
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/21-tai-lieu-page/21-CONTEXT.md
@.planning/phases/21-tai-lieu-page/21-P02-SUMMARY.md
@.planning/phases/21-tai-lieu-page/21-P03-SUMMARY.md

<interfaces>
<!-- Exact existing code to edit. Extracted from codebase — executor needs no further reads. -->

From src/App.tsx (current imports block, lines 1–27):
```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import StudentLayout from "./components/student/StudentLayout";
import UsersPage from "./pages/admin/UsersPage";
import CoursesPage from "./pages/admin/CoursesPage";
import SubmissionsPage from "./pages/admin/SubmissionsPage";
import GradingPage from "./pages/admin/GradingPage";
import PackagesPage from "./pages/admin/PackagesPage";
import StudentCoursesPage from "./pages/student/CoursesPage";
import StudentCourseDetailPage from "./pages/student/CourseDetailPage";
import StudentCataloguePage from "./pages/student/CataloguePage";
import ProfilePage from "./pages/student/ProfilePage";
import ExamSessionsPage from './pages/admin/ExamSessionsPage';
import ExamSessionDetailPage from './pages/admin/ExamSessionDetailPage';
import MockExamsPage from './pages/student/MockExamsPage';
import MockExamAttemptPage from './pages/student/MockExamAttemptPage';
import GioiThieu from './pages/GioiThieu';
```

From src/App.tsx (current routes block, lines 39–59 — the section to add into):
```tsx
            <Route path="/" element={<Index />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ky" element={<Register />} />
            <Route path="/gioi-thieu" element={<GioiThieu />} />

            <Route path="/quan-tri/nguoi-dung" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><UsersPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/khoa-hoc" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><CoursesPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/khoa-hoc/:courseSlug" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout fullBleed><StudentCourseDetailPage isAdmin /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/goi-hoc" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><PackagesPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/bai-nop" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><SubmissionsPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/bai-nop/:submissionId" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><GradingPage /></AdminLayout></StudentLayout></ProtectedRoute>} />

            <Route path="/quan-tri/de-thi" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><ExamSessionsPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/de-thi/:sessionId" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><ExamSessionDetailPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/de-thi" element={<ProtectedRoute><MockExamsPage /></ProtectedRoute>} />
            <Route path="/de-thi/:sessionId" element={<ProtectedRoute><MockExamAttemptPage /></ProtectedRoute>} />
            <Route path="/khoa-hoc" element={<ProtectedRoute><StudentCoursesPage /></ProtectedRoute>} />
            <Route path="/khoa-hoc/:courseSlug" element={<StudentCourseDetailPage />} />
            <Route path="/danh-muc" element={<StudentCataloguePage />} />
            <Route path="/ho-so" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
```

From src/components/admin/AdminLayout.tsx (current navItems, lines 15–21):
```tsx
const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', icon: Users, adminOnly: true },
  { label: 'Quản lý khóa học', to: '/quan-tri/khoa-hoc', icon: BookOpen, adminOnly: true },
  { label: 'Gói học', to: '/quan-tri/goi-hoc', icon: Package, adminOnly: true },
  { label: 'Chấm bài', to: '/quan-tri/bai-nop', icon: ClipboardList },
  { label: 'Đề thi thử', to: '/quan-tri/de-thi', icon: FileText },
]
```
<!-- FileText is already imported on line 2 of AdminLayout.tsx — no new import needed -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add imports and routes to App.tsx</name>
  <files>src/App.tsx</files>
  <read_first>
    - src/App.tsx (lines 1–60 — read current imports and routes to identify exact insertion points)
  </read_first>
  <action>
Make two targeted edits to `src/App.tsx`:

**Edit 1 — Add two imports after the last existing import line (`import GioiThieu from './pages/GioiThieu';`):**

```tsx
import TaiLieuPage from './pages/TaiLieuPage';
import TaiLieuAdminPage from './pages/admin/TaiLieuAdminPage';
```

These two lines go IMMEDIATELY AFTER `import GioiThieu from './pages/GioiThieu';`.

**Edit 2 — Add two routes:**

Add the public `/tai-lieu` route AFTER the `/gioi-thieu` route line:
```tsx
            <Route path="/tai-lieu" element={<TaiLieuPage />} />
```

Add the admin `/quan-tri/tai-lieu` route AFTER the last `/quan-tri/de-thi/:sessionId` route line (i.e., as the last admin route in the admin+teacher block):
```tsx
            <Route path="/quan-tri/tai-lieu" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><TaiLieuAdminPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
```

**Rules:**
- Do NOT modify any existing route or import
- Public `/tai-lieu` route MUST NOT be wrapped in ProtectedRoute (per D-01)
- Admin route MUST use `allowedRoles={['admin', 'teacher']}` (per D-05) — NOT `requiredRole="admin"`
- Follow existing route indentation (12 spaces before `<Route`)
  </action>
  <verify>
    <automated>grep -c "tai-lieu" src/App.tsx</automated>
  </verify>
  <acceptance_criteria>
    - `grep "import TaiLieuPage from './pages/TaiLieuPage'" src/App.tsx` returns 1 match
    - `grep "import TaiLieuAdminPage from './pages/admin/TaiLieuAdminPage'" src/App.tsx` returns 1 match
    - `grep 'path="/tai-lieu"' src/App.tsx` returns 1 match
    - `grep 'path="/quan-tri/tai-lieu"' src/App.tsx` returns 1 match
    - `grep "allowedRoles={\\['admin', 'teacher'\\]}" src/App.tsx | grep "tai-lieu"` returns 1 match (admin route uses allowedRoles, not requiredRole)
    - The `/tai-lieu` route line does NOT contain "ProtectedRoute" (public — no auth gate)
    - `yarn build` exits 0
  </acceptance_criteria>
  <done>App.tsx has TaiLieuPage and TaiLieuAdminPage imported and routed. Public /tai-lieu is unauthenticated. /quan-tri/tai-lieu is gated to admin+teacher roles.</done>
</task>

<task type="auto">
  <name>Task 2: Add 'Tài liệu' nav item to AdminLayout + build verification</name>
  <files>src/components/admin/AdminLayout.tsx</files>
  <read_first>
    - src/components/admin/AdminLayout.tsx (lines 1–30 — read navItems array and imports to confirm FileText is already imported)
  </read_first>
  <action>
Make one targeted edit to `src/components/admin/AdminLayout.tsx`:

**Edit — Append nav item to navItems array, AFTER the `{ label: 'Đề thi thử', ... }` entry:**

Current last entry:
```tsx
  { label: 'Đề thi thử', to: '/quan-tri/de-thi', icon: FileText },
```

Change to:
```tsx
  { label: 'Đề thi thử', to: '/quan-tri/de-thi', icon: FileText },
  { label: 'Tài liệu', to: '/quan-tri/tai-lieu', icon: FileText },
```

**Rules:**
- No new imports needed — `FileText` is already imported on line 2 of AdminLayout.tsx
- Do NOT add `adminOnly: true` — teachers must see this nav item (per D-05, D-10)
- Match existing indentation (2 spaces before `{`)

**After both tasks complete, run build and lint verification:**
```bash
yarn build 2>&1 | tail -10
yarn lint 2>&1 | tail -10
```
Both commands must exit 0.
  </action>
  <verify>
    <automated>yarn build 2>&1 | tail -5 && yarn lint 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `grep "quan-tri/tai-lieu" src/components/admin/AdminLayout.tsx` returns 1 match
    - `grep "Tài liệu" src/components/admin/AdminLayout.tsx` returns 1 match
    - The `{ label: 'Tài liệu', to: '/quan-tri/tai-lieu', icon: FileText }` entry does NOT have `adminOnly: true`
    - `grep "adminOnly.*tai-lieu\|tai-lieu.*adminOnly" src/components/admin/AdminLayout.tsx` returns 0 matches (no adminOnly flag)
    - `yarn build` exits 0 (zero TypeScript errors across entire project)
    - `yarn lint` exits 0 (zero lint errors)
  </acceptance_criteria>
  <done>'Tài liệu' nav item added to AdminLayout without adminOnly flag. yarn build exits 0. yarn lint exits 0. Phase 21 build-verified complete.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| public browser → /tai-lieu | No auth check — intentional per D-01; RLS at DB/Storage layer (P01) is the enforcement boundary |
| authenticated user → /quan-tri/tai-lieu | ProtectedRoute allowedRoles check prevents student/unauthenticated access at React Router layer |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-21-10 | Elevation of Privilege | /quan-tri/tai-lieu route | mitigate | `ProtectedRoute allowedRoles={['admin', 'teacher']}` rejects students and anon at router level; RLS in P01 provides second layer at DB |
| T-21-11 | Information Disclosure | /tai-lieu public route | accept | Route is intentionally public (D-01); data served is public standalone materials only — lesson-linked materials remain behind auth via existing RLS |
</threat_model>

<verification>
After both tasks complete:

```bash
# Routes wired
grep 'path="/tai-lieu"' src/App.tsx
grep 'path="/quan-tri/tai-lieu"' src/App.tsx

# Imports present
grep "TaiLieuPage" src/App.tsx
grep "TaiLieuAdminPage" src/App.tsx

# Nav item present (no adminOnly)
grep "quan-tri/tai-lieu" src/components/admin/AdminLayout.tsx

# Full build clean
yarn build
yarn lint
```
</verification>

<success_criteria>
- `src/App.tsx` routes: `/tai-lieu` → `<TaiLieuPage />` (no ProtectedRoute), `/quan-tri/tai-lieu` → `<TaiLieuAdminPage />` (ProtectedRoute allowedRoles admin+teacher)
- `src/components/admin/AdminLayout.tsx` navItems: `{ label: 'Tài liệu', to: '/quan-tri/tai-lieu', icon: FileText }` with no `adminOnly` flag
- `yarn build` exits 0
- `yarn lint` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/21-tai-lieu-page/21-P04-SUMMARY.md`
</output>
