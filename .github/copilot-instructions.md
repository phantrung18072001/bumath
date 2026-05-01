# Copilot Instructions — BuMath

Vietnamese math education SPA (grades 7–9 + advanced). React + Vite + Supabase.

## Commands

```bash
yarn dev          # Dev server at http://localhost:8080
yarn build        # Production build
yarn lint         # ESLint
yarn test         # Run all tests once
yarn test:watch   # Run tests in watch mode

# Run a single test file
yarn test src/path/to/file.test.ts
```

**Package manager**: Yarn 4.11.0. Always use `yarn`, never `npm`.

## Architecture

### Routing (`src/App.tsx`)

```
/                     → pages/Index.tsx         (public landing page)
/login, /register     → public auth pages
/pending              → approval-pending screen
/admin/*              → ProtectedRoute(role=admin) + AdminLayout
/courses/*            → ProtectedRoute(role=student)
*                     → pages/NotFound.tsx
```

All admin routes use `<ProtectedRoute requiredRole="admin"><AdminLayout>`.  
All student routes use `<ProtectedRoute requiredRole="student">`.

### Auth & Access Control

- `AuthContext` (`src/contexts/AuthContext.tsx`) provides `{ user, session, profile, loading, signOut }`.
- `profile` comes from the `profiles` Supabase table; roles are `student | teacher | admin`.
- `approval_status` is `pending | approved | rejected` — unapproved users are redirected to `/pending`.
- Profile is fetched via `setTimeout(0)` inside `onAuthStateChange` to avoid a Supabase callback deadlock.
- Use `useAuth()` to access auth state; it throws if used outside `AuthProvider`.

### Data Layer (`src/lib/`)

- `src/lib/supabase.ts` — singleton Supabase client; env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- `src/lib/api/` — one file per domain: `courses.ts`, `chapters.ts`, `lessons.ts`, `enrollments.ts`, `submissions.ts`, `lesson-progress.ts`. Each exports typed interfaces and async CRUD functions that throw on error.
- `src/lib/constants/grades.ts` — `GRADE_BADGE` map for `target_grade` values: `grade_7 | grade_8 | grade_9 | advanced`.
- `src/lib/validators.ts` — shared Zod schemas for forms.
- `src/lib/youtube.ts` — `extractYouTubeID(url)` utility; lessons use YouTube embed URLs.

### Component Structure

- `src/components/landing/` — marketing page sections (`Header`, `HeroSection`, `ClassGrid`, etc.)
- `src/components/admin/` — admin UI: form dialogs (`CourseFormDialog`, `ChapterFormDialog`, `LessonFormDialog`, `UserEnrollmentDialog`, `GradingDialog`), `AdminLayout`
- `src/components/student/` — student learning UI: `StudentLayout`, `LessonContent`, `LessonSidebar`, `LessonProgressButton`, `SubmissionArea`, `BellNotification`
- `src/components/auth/ProtectedRoute.tsx` — role-based route guard
- `src/components/ui/` — shadcn/ui components; **do not edit manually**, use the shadcn CLI

### UI Component Rule

**Always use shadcn/ui or Radix primitives before implementing custom components.**

1. Check `src/components/ui/` for already-installed components
2. Check https://ui.shadcn.com/docs/components for available components
3. If a component exists but isn't installed: `yarn dlx shadcn@latest add <name>`
4. Only build custom if shadcn/Radix genuinely doesn't cover the use case

### UI Design Rule

**Always invoke the `ui-ux-pro-max` skill before designing or significantly changing UI.**

Run the design system query before implementing any new page, component, or visual change:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product_type> <keywords>" --design-system -p "BuMath"
```
Follow the pre-delivery checklist (no emoji icons, cursor-pointer on clickables, 4.5:1 contrast, smooth transitions 150–300ms, focus states, responsive at 375/768/1024/1440px).

### Database Schema (Supabase)

Tables: `profiles`, `courses`, `chapters`, `lessons`, `enrollments`, `lesson_progress`, `submissions`.

- Courses have `target_grade`: `grade_7 | grade_8 | grade_9 | advanced`.
- Hierarchy: `courses → chapters (order_index) → lessons (order_index)`.
- Lessons have `video_url` (YouTube embed) and `assignment_path` (Supabase Storage path).
- Submissions stored in private `submissions` bucket under `{user_id}/{lesson_id}` paths.
- RLS is enabled on all tables; use `get_my_role()` SECURITY DEFINER function (not direct profile subqueries) in RLS policies to avoid infinite recursion.

## Key Conventions

### TanStack Query usage
- `queryKey` always includes all relevant IDs (e.g., `['enrollments', profile?.id]`).
- Add `enabled: !!profile?.id` guards to prevent queries from firing before auth loads.

### Styling
- Tailwind + shadcn/ui CSS variables (HSL) in `src/index.css`. Dark mode via class strategy.
- `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional class merging.
- Path alias: `@/` → `src/`.

### Testing
- Vitest + React Testing Library; jsdom environment; globals enabled — no need to import `describe`, `it`, `expect`.
- Test setup: `src/test/setup.ts` (includes `matchMedia` polyfill required for component tests).
- Test files live alongside source at `src/**/*.{test,spec}.{ts,tsx}`.

### TypeScript
- Strict mode **disabled**; `noImplicitAny` off; `@typescript-eslint/no-unused-vars` off.

### Supabase Migrations
- Migration files in `supabase/migrations/` named `YYYYMMDD_NN_description.sql`.
- Run migrations manually via Supabase Dashboard SQL Editor — there is no CLI migration runner configured.
