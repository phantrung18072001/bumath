# Roadmap: BuMath LMS

## Milestones

- ✅ **v1.0 MVP** — Phases 1-8, 38 plans (shipped 2026-05-01) — [Archive](.planning/milestones/v1.0-ROADMAP.md)
- 🚧 **v2.0 UI Refactor** — Phases 9-13 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–8) — SHIPPED 2026-05-01</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed
- [x] Phase 2: Auth & Access Control (7/7 plans) — completed 2026-03-24
- [x] Phase 3: Course Management (6/6 plans) — completed
- [x] Phase 4: Student Learning & Submission (5/5 plans) — completed 2026-04-07
- [x] Phase 5: Grading & Notification (5/5 plans) — completed 2026-04-08
- [x] Phase 6: UX Polish (6/6 plans) — completed 2026-04-27
- [x] Phase 7: Auth & Security Fixes (5/5 plans) — completed 2026-04-29
- [x] Phase 8: Teacher Role Access (2/2 plans) — completed 2026-05-01

Full details: [.planning/milestones/v1.0-ROADMAP.md](.planning/milestones/v1.0-ROADMAP.md)

</details>

### 🚧 v2.0 UI Refactor (Phases 9–13)

- [x] **Phase 9: URL Standardization** — Rename all routes to Vietnamese, update all redirects and internal links (7/7 plans, UAT 6/6 ✅ 2026-05-01)
- [x] **Phase 10: Auth Pages UI** — Refactor /dang-nhap, /dang-ky, /cho-duyet with modern design (completed 2026-05-01)
- [x] **Phase 11: Admin List Pages** — Refactor users + courses list pages with pagination, filters, search (completed 2026-05-01)
- [ ] **Phase 12: Admin Detail Pages** — Refactor course/chapter/lesson management + grading queue + grading page
- [ ] **Phase 13: Student Pages** — Refactor courses list, course detail/lesson view, catalogue with filters + pagination

## Phase Details

### Phase 9: URL Standardization
**Goal**: All routes use Vietnamese-only URLs; old English URLs redirect to new ones; all internal navigations updated
**Depends on**: Phase 8 (v1.0 complete)
**Requirements**: URL-01, URL-02, URL-03
**Success Criteria** (what must be TRUE):
  1. Navigating to `/login` redirects to `/dang-nhap`; all other English routes redirect similarly
  2. All post-login redirects, ProtectedRoute redirects, and `navigate()` calls use Vietnamese URLs
  3. No broken internal links anywhere in the app
**Plans**: 7 plans

Plans:
- [ ] 09-01-PLAN.md — Rename route path definitions (App.tsx + ProtectedRoute.tsx)
- [ ] 09-02-PLAN.md — Auth/shared pages (Login, Register, NotFound)
- [ ] 09-03-PLAN.md — Admin components (AdminLayout, GradingPage, SubmissionsPage)
- [ ] 09-04-PLAN.md — Admin content pages (CoursesPage, ChaptersPage, LessonsPage)
- [ ] 09-05-PLAN.md — Student layout + pages (StudentLayout, CataloguePage + LOI_MAP logic, CoursesPage)
- [ ] 09-06-PLAN.md — Student CourseDetailPage + all 4 landing components
- [ ] 09-07-PLAN.md — Test file updates + yarn test green

### Phase 10: Auth Pages UI
**Goal**: Login and Register pages have polished Claymorphism design with BuMath branding (Pending page removed per D-05)
**Depends on**: Phase 9
**Requirements**: AUTH-UI-01, AUTH-UI-02, AUTH-UI-03 (descoped), DS-01
**Success Criteria** (what must be TRUE):
  1. Login page: centered Claymorphism card with BuMath logo, inline validation, floating math symbols
  2. Register page: 2-column responsive grid (desktop), same Claymorphism design, orange CTA buttons
  3. ~~Pending page~~: REMOVED per D-05 — users go directly to /khoa-hoc after registration
**Plans**: 2 plans

Plans:
- [x] 10-01-PLAN.md — Foundation: CSS variables, Tailwind fontFamily, utility classes
- [x] 10-02-PLAN.md — Page refactors: Login.tsx + Register.tsx Claymorphism design

**UI hint**: yes

### Phase 11: Admin List Pages
**Goal**: Admin users-list and courses-list pages have pagination, search, and role/grade filters
**Depends on**: Phase 10
**Requirements**: ADMIN-UI-01, ADMIN-UI-02, DS-01, DS-02
**Success Criteria** (what must be TRUE):
  1. Users page: paginated table (25/page), filter by role (student/teacher/admin), search by name or phone
  2. Courses page: paginated table (20/page), filter by grade (7/8/9/chuyên), search by course name
  3. Both pages show skeleton loading, empty state with CTA, and total count
**Plans**: 3 plans

Plans:
- [x] 11-00-PLAN.md — Wave 0: Test foundation (CoursesPage.test.tsx + UsersPage.test.tsx updates)
- [x] 11-01-PLAN.md — UsersPage: filter toolbar, search, pagination, skeleton loading
- [x] 11-02-PLAN.md — CoursesPage: filter toolbar, search, pagination, skeleton loading

**UI hint**: yes

### Phase 12: Admin Detail Pages
**Goal**: Course/chapter/lesson management, grading queue, and grading detail have clear, functional layouts
**Depends on**: Phase 11
**Requirements**: ADMIN-UI-03, ADMIN-UI-04, ADMIN-UI-05, DS-01, DS-02
**Success Criteria** (what must be TRUE):
  1. Grading queue: paginated (20/page), existing filters retained, added status filter (graded/ungraded)
  2. Grading detail: 2-column layout (submission photo left, grade form right), works on mobile
  3. Course detail: chapter/lesson list with drag-to-reorder or clear order management UX
**Plans**: TBD
**UI hint**: yes

### Phase 13: Student Pages
**Goal**: Student-facing pages (courses, lesson view, catalogue) have polished layouts with filters and intuitive navigation
**Depends on**: Phase 12
**Requirements**: STUDENT-UI-01, STUDENT-UI-02, STUDENT-UI-03, STUDENT-UI-04, DS-01, DS-02
**Success Criteria** (what must be TRUE):
  1. Courses page: card grid with progress bars prominent, empty state with link to catalogue
  2. Course detail: sidebar collapses on mobile, video embed is primary content area
  3. Catalogue: filter by grade, search by name, clear enrolled/unenrolled badge, scroll or pagination
  4. All pages have empty states with clear messaging and CTAs
**Plans**: TBD
**UI hint**: yes
