---
phase: 20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas
plan: P01
status: completed
completed_at: "2026-05-09T00:25:00.000Z"
commit: 66479bc
---

# P01 Summary: CSS Foundation + Layout Scope Classes

## What Was Built

Established the CSS foundation for the Phase 20 AI EdTech SaaS design language:

1. **`.bm-glass-card`** — Glassmorphism card class with `backdrop-filter: blur(8px)`, `-webkit-backdrop-filter`, `border-radius: 24px`, hover lift effect, and `prefers-reduced-motion` override.
2. **`.bm-progress-indigo`** — Indigo progress bar override (`#4F46E5`) for student progress indicators.
3. **`.bm-float-symbol-light` color** — Updated from `#F97316` (orange) to `#4F46E5` (indigo).
4. **Scoped CSS vars** — `.app-student, .app-admin` block added after `@layer base`, overriding `--primary` to `245 94% 58%` (indigo). Global `:root --primary` stays `24 95% 53%` (orange) — landing page untouched.
5. **`.app-student/.app-admin .bm-btn-cta`** — gradient override to indigo→purple inside authenticated shells.
6. **`StudentLayout`** — Root div: `app-student bg-gradient-to-br from-primary/5 via-background to-secondary/20`; Header: glassmorphism `bg-white/80 backdrop-blur-sm border-b border-white/30`.
7. **`AdminLayout`** — Root div: `app-admin bg-gradient-to-br from-primary/5 via-background to-secondary/20`; Sidebar: glassmorphism `bg-white/80 backdrop-blur-sm border-r border-white/30`.

## Verification

- All CSS acceptance criteria passed (grep counts)
- `yarn test` on both layout files: **11/11 tests passed**
- Landing page unaffected (no indigo references in `src/pages/Index.tsx` or `src/components/landing/`)
- Viewport invariant preserved: `h-screen overflow-hidden flex flex-col` in StudentLayout
