# Phase 9: URL Standardization — Context

**Phase:** 09 — URL Standardization
**Discussed:** 2026-05-01
**Status:** Ready for planning

---

## Decisions

### URL Mapping (English → Vietnamese)

| Old URL | New URL |
|---------|---------|
| `/login` | `/dang-nhap` |
| `/register` | `/dang-ky` |
| `/pending` | `/cho-duyet` |
| `/admin/users` | `/quan-tri/nguoi-dung` |
| `/admin/courses` | `/quan-tri/khoa-hoc` |
| `/admin/courses/:courseSlug` | `/quan-tri/khoa-hoc/:courseSlug` |
| `/admin/courses/:courseSlug/chapters/:chapterSlug` | `/quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug` |
| `/admin/submissions` | `/quan-tri/bai-nop` |
| `/admin/submissions/:submissionId` | `/quan-tri/bai-nop/:submissionId` |
| `/courses` | `/khoa-hoc` |
| `/courses/:courseSlug` | `/khoa-hoc/:courseSlug` |
| `/catalogue` | `/danh-muc` |

**Dynamic param names:** Keep as-is (`:courseSlug`, `:chapterSlug`, `:submissionId`) — English param names are internal identifiers, not user-visible.

### Backward Compatibility

**Decision: No redirect, just rename.** The app is brand-new and has no external inbound links. Old English URLs are simply removed. If users have bookmarks they'll land on 404 (NotFound).

No `<Navigate>` components needed for old routes.

### Query Params

**Decision: Rename to Vietnamese with clean values.**

| Old | New | Meaning |
|-----|-----|---------|
| `?grade=grade_7` | `?lop=7` | Lớp 7 |
| `?grade=grade_8` | `?lop=8` | Lớp 8 |
| `?grade=grade_9` | `?lop=9` | Lớp 9 |
| `?grade=advanced` | `?lop=nang-cao` | Ôn chuyên / Nâng cao |

Mapping in `CataloguePage.tsx`:
```ts
const LOI_MAP: Record<string, Course['target_grade']> = {
  '7': 'grade_7', '8': 'grade_8', '9': 'grade_9', 'nang-cao': 'advanced'
}
```

### Files to Update

All files with hardcoded English URLs (both routes and `navigate()` / `<Link to>` calls):

**Core routing:**
- `src/App.tsx` — 12 route path definitions
- `src/components/auth/ProtectedRoute.tsx` — `redirectFor()` returns

**Admin pages:**
- `src/pages/admin/GradingPage.tsx` — `navigate('/admin/submissions')`
- `src/pages/admin/SubmissionsPage.tsx` — `navigate('/admin/submissions/:id')`
- `src/pages/admin/CoursesPage.tsx` — `navigate('/admin/courses/:slug')`
- `src/pages/admin/ChaptersPage.tsx` — `navigate()` + `<Link>` breadcrumbs
- `src/pages/admin/LessonsPage.tsx` — `<Link>` breadcrumbs
- `src/components/admin/AdminLayout.tsx` — nav `to:` values

**Auth/shared pages:**
- `src/pages/Login.tsx` — 3× `navigate()`
- `src/pages/Register.tsx` — 2× `navigate()`
- `src/pages/NotFound.tsx` — `homeLink` string
- `src/components/student/StudentLayout.tsx` — `navigate('/login')`

**Student pages:**
- `src/pages/student/CourseDetailPage.tsx` — `<Link to="/courses">`, `<Link to="/login">`
- `src/pages/student/CataloguePage.tsx` — `<Link to="/login">` + `searchParams.get('grade')` logic
- `src/pages/student/CoursesPage.tsx` — `<Link to="/catalogue">`

**Landing page (update links only, not visual design):**
- `src/components/landing/Header.tsx` — `/login`, `/register`, `/courses`, `/admin/users`
- `src/components/landing/HeroSection.tsx` — `/courses`, `/catalogue`
- `src/components/landing/ClassGrid.tsx` — `/catalogue?grade=${c.grade}` → `/danh-muc?lop=...`
- `src/components/landing/IntensiveSection.tsx` — `/catalogue?grade=advanced` → `/danh-muc?lop=nang-cao`

**Test files — must also be updated:**
- Any test file referencing old URL strings

### Canonical Refs

- `.planning/ROADMAP.md` — Phase 9 requirements: URL-01, URL-02, URL-03
- `.planning/REQUIREMENTS.md` — URL requirements spec
- `src/App.tsx` — current route definitions (source of truth)
- `src/components/auth/ProtectedRoute.tsx` — `redirectFor()` implementation

---

## Deferred Ideas

- HTTP-level 301 redirects (not possible in SPA without server config — deferred to server/CDN config later if needed)
- Pending page (/cho-duyet) link update in Pending.tsx itself — included in scope, not deferred

---

## Discussion Log Summary

| Area | Question | Decision |
|------|----------|----------|
| Old URL redirect | `<Navigate>` routes or just rename? | Just rename — app is new, no backward compat needed |
| Dynamic params | Rename `:courseSlug` etc.? | Keep English — internal identifiers, not user-visible |
| Query params | Rename `?grade=` key and values? | Yes → `?lop=7`, `?lop=8`, `?lop=9`, `?lop=nang-cao` |
