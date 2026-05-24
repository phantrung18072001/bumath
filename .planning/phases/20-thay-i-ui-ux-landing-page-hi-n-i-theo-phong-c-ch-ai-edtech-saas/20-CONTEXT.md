# Phase 20: Student + Admin UI/UX — AI EdTech SaaS Design Language - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

> **Addendum 2026-05-25 (User Directive Override):**
> Use `/danh-muc` as the canonical UI model for a system-wide redesign pass.
> Previous background lock decisions (D-05/D-06) are superseded for authenticated screens.
> New target: white-first minimal surfaces instead of mint/gradient shell backgrounds.

<domain>
## Phase Boundary

Apply a modern AI EdTech SaaS visual language across all student-facing and admin-facing screens. This is a UI-only overhaul — no new features, no backend changes, no new routes.

**In scope:**
- Student screens: `CoursesPage`, `CataloguePage`, `CourseDetailPage`, `ProfilePage`, `StudentLayout`
- Admin screens: `CoursesPage`, `UsersPage`, `GradingPage`, `SubmissionsPage`, `PackagesPage`, admin layout/sidebar
- Component-level: cards, buttons, badges, form inputs, navigation elements across these screens

**Out of scope:**
- Landing page (`/` — untouched, user is satisfied with it)
- Any new features or API changes
- Route structure changes

</domain>

<decisions>
## Implementation Decisions

### Design Language (New Visual Direction)
- **D-01:** Apply "AI EdTech SaaS" visual style across student + admin screens. Reference aesthetic: Linear, Stripe, Vercel, Raycast, Notion AI — clean, minimalist, premium, professional.
- **D-02:** Card style: transition from Claymorphism (thick teal border, double shadow) → **Glassmorphism** (soft border `1px solid rgba(255,255,255,0.3)`, backdrop-blur, subtle shadow, rounded 20–28px). Cards feel elevated and modern.
- **D-03:** Primary color: **#4F46E5** (indigo). Secondary: **#7C3AED** (purple). Accent: **#06B6D4** (cyan). These replace the previous teal `#0D9488` in UI components (buttons, badges, active states, focus rings).
- **D-04:** Text: **#0F172A** (near-black). Muted text: **#64748B** (slate-500). Consistent across all screens.

### Background — UPDATED RULE (2026-05-25)
- **D-05 (updated):** Authenticated shells (`.app-student`, `.app-admin`) move to white-first backgrounds by default; remove decorative gradient/math backgrounds unless page-specific justification exists.
- **D-06 (updated):** Visual tasks may modify page-level backgrounds to align with `/danh-muc` minimal model. Priority is consistency, readability, and modern minimal aesthetics.

### Card Components
- **D-07:** Student page cards: replace `.bm-clay-card-student` (thick teal border, double outer shadow) with glassmorphism variant — `backdrop-blur-sm bg-white/80 border border-white/30 shadow-lg rounded-[24px]`.
- **D-08:** Admin page cards and panels: same glassmorphism style — soft white/80 bg, blur, thin white border.
- **D-09:** Hover state: subtle `hover:shadow-xl hover:-translate-y-1 transition-all duration-200` — same lift pattern already used in ClassGrid.

### Typography
- **D-10:** Headings: large, bold, tight tracking — `font-bold tracking-tight` at current sizes is fine; no font-family change (keep Be Vietnam Pro).
- **D-11:** Gradient text accent: apply `bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent` on key headings/labels instead of solid teal.

### Interactive Elements
- **D-12:** Primary buttons: change from teal primary → indigo (`bg-indigo-600 hover:bg-indigo-700`). CTA buttons can use gradient `bg-gradient-to-r from-indigo-600 to-purple-600`.
- **D-13:** Badges: replace teal-colored badges with indigo/purple variants.
- **D-14:** Focus rings and active states: `ring-indigo-500` / `border-indigo-500`.

### Audit-Driven Approach
- **D-15:** Use `ui-ux-pro-max` skill to audit each screen before implementing changes. The audit determines specific layout and component improvements beyond the baseline color/style migration.
- **D-16:** Admin and student screens get separate audit passes — don't bundle them into one task. Each audit produces a list of fixes, then fixes are implemented.

### What NOT to Change
- **D-17:** Do not change background colors (mint `#F0FDFA` stays). Do not restructure routing or page layouts. Do not add new components or features. Do not modify `src/components/ui/` shadcn base components directly.

</decisions>

<specifics>
## Specific Ideas

- **Visual reference:** User referenced https://vstepup.vn/ as a style inspiration — clean white cards, blue-indigo palette, glassmorphism, premium EdTech SaaS feeling.
- **Glassmorphism pattern:** `backdrop-blur-sm bg-white/80 border border-white/30 shadow-lg rounded-[24px]` — this is the target card style.
- **Gradient text:** Use on page headings where there's currently a solid `text-primary` teal — swap to `bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`.
- **Icon containers with gradient background:** Apply `bg-gradient-to-br from-indigo-500 to-purple-600` on icon wrapper divs (like the grade number icons in ClassGrid).
- **Existing animations:** Framer Motion fade-in/whileInView patterns are already in place — keep and extend, don't remove.
- **Background rule origin:** A previous phase reverted backgrounds to old colors during a mid-phase edit. The lock rule (D-05/D-06) exists to prevent this from happening again.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system
- `design-system/bumath/MASTER.md` — Existing design system master; read to understand current tokens before overriding

### Source screens (existing code to modify)
- `src/pages/student/CoursesPage.tsx` — Student enrolled courses list
- `src/pages/student/CataloguePage.tsx` — Course catalogue with search + filters
- `src/pages/student/CourseDetailPage.tsx` — Course + lesson view with sidebar
- `src/pages/student/ProfilePage.tsx` — Student profile
- `src/pages/admin/CoursesPage.tsx` — Admin course management
- `src/pages/admin/UsersPage.tsx` — Admin user management
- `src/pages/admin/GradingPage.tsx` — Admin grading interface
- `src/pages/admin/SubmissionsPage.tsx` — Admin submissions list
- `src/pages/admin/PackagesPage.tsx` — Admin package management

### Layout / shell components
- `src/components/student/StudentLayout.tsx` — Student layout wrapper; header bar
- `src/components/student/LessonSidebar.tsx` — Lesson navigation sidebar

### Prior phase context (design decisions already made)
- `.planning/phases/13-student-pages/13-CONTEXT.md` — Phase 13 claymorphism decisions (being superseded by Phase 20)
- `.planning/phases/12-admin-detail-pages/12-CONTEXT.md` — Admin detail page decisions

### CLAUDE.md constraints
- `CLAUDE.md` — Do NOT edit `src/components/ui/` shadcn components directly; use className overrides

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Card`, `CardHeader`, `CardContent`, `CardTitle` (shadcn) — will receive glassmorphism className overrides
- `Badge` (shadcn) — recolor to indigo/purple variants
- `Button` (shadcn) — variant="default" will get indigo primary color
- Framer Motion `motion.div` with `initial/animate/whileInView` — already used in HeroSection + ClassGrid; extend pattern
- `bm-clay-card-student` CSS class (defined in `src/index.css` or global styles) — being replaced, will need to update or create new utility class

### Established Patterns
- `useQuery` with enabled guard — keep as-is, don't touch
- URL search params for grade filter — keep as-is
- `min-h-[48px]` on tap targets — keep as-is
- Error state: `<p className="text-destructive text-center py-8">` — keep as-is
- Skeleton loading pattern — keep as-is

### Integration Points
- `StudentLayout` wraps all student pages — changing card styles in child pages should not affect layout wrapper
- Admin pages share an `AdminLayout` — style changes are card/component level, not layout level

</code_context>

<deferred>
## Deferred Ideas

- Landing page redesign (Homepage `/`) — user is satisfied with current landing, defer to a future phase
- Adding admin dashboard overview/stats page — new feature, belongs in separate phase
- Dark mode toggle — mentioned in design brief as inspiration but not requested for Phase 20; future enhancement

</deferred>

---

*Phase: 20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas*
*Context gathered: 2026-05-08*
