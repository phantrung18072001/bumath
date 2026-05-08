---
phase: 20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas
plan: P02
status: completed
completed_at: "2026-05-09T00:30:00.000Z"
commit: f7ac17a
---

# P02 Summary: Student Pages Glassmorphism Redesign

## What Was Built

Migrated all student-facing screens to the AI EdTech SaaS glassmorphism design language:

1. **CoursesPage** — bm-glass-card for course cards, gradient h1, indigo progress bars (`bm-progress-indigo`), indigo empty state icons.
2. **CataloguePage** — bm-glass-card for course cards, gradient h1, indigo filter pills and search border focus ring, unauthenticated page wrapper scoped to `app-student`.
3. **ProfilePage** — 3× bm-glass-card (PackageCard, profile card, empty packages card), indigo hero gradient (`from-indigo-600/85 via-indigo-500/60 to-purple-500/50`), indigo avatar/stats colors, local `advanced` badge updated to indigo.
4. **LessonSidebar** — All orange border/button/progress tokens replaced with indigo equivalents (`border-indigo-200/60`, `border-indigo-300/50`, indigo button text/hover).
5. **CourseDetailPage** — Glass sidebar panels (`bg-white/80 backdrop-blur-sm border-r border-white/30`), indigo mobile menu button, indigo tab active borders, bm-glass-card for locked content, indigo lock icon containers, unauthenticated page wrapper scoped.

## Verification

- Zero hardcoded orange tokens (`#F97316`, `#92400E`, `#FFEDD5`, `#F3F0ED`, `#FFF7ED`) in all 5 files
- All test files passed: CoursesPage (10), CataloguePage (12), CourseDetailPage (9)
- Semantic colors preserved: green `Đã đăng ký` badge, muted/foreground CSS vars
