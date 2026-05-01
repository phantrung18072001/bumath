# Phase 10: Auth Pages UI - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor Login (`/dang-nhap`) and Register (`/dang-ky`) pages with polished Claymorphism design.
Pending page (`/cho-duyet`) is **OUT OF SCOPE** — feature removed entirely (see D-05).

</domain>

<decisions>
## Implementation Decisions

### Background
- **D-01:** Decorative background with floating math symbols (π, √, +/-, ×, ÷, ∑) in very light teal/gray opacity. Symbols are purely decorative, no interaction, positioned absolutely around the card. No gradient background.

### Logo & Branding
- **D-02:** Logo = brand image `bumath.jpeg` + "BuMath" text side-by-side using Baloo 2 font. The image file is currently at `/bumath.jpeg` (project root) — must be copied to `public/bumath.jpeg` so it can be served via `/bumath.jpeg`.
- **D-03:** Logo displayed prominently above the auth card, centered.

### Register Form Layout
- **D-04:** 2-column grid on desktop: Row 1 = phone + full name; Row 2 = year of birth + address; Row 3 = password + confirm password (full width). Collapses to single column on mobile (`< 640px`).

### Pending Page
- **D-05:** `/cho-duyet` route and pending approval flow REMOVED entirely. After register, users go directly to `/khoa-hoc` with full student access. No `Pending.tsx` to create. Update `REQUIREMENTS.md` to remove AUTH-UI-03 if still listed.

### Card Style (Claymorphism)
- **Agent's discretion:** Apply design system Claymorphism specs — thick border (3-4px solid `#0D9488`), double shadow (outer `0 8px 0 #0D9488`, inner light), rounded-2xl to rounded-3xl, white card background on `#F0FDFA` page background.

### CTA Button
- **Agent's discretion:** Primary CTA buttons ("Đăng nhập", "Đăng ký") use orange `#F97316` as per design system CTA color, not teal.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `design-system/bumath/MASTER.md` — BuMath v2.0 design system (Teal+Claymorphism+Light). This is the authoritative styling reference.

### Auth Pages (existing source)
- `src/pages/Login.tsx` — Current login page implementation (logic to preserve, UI to refactor)
- `src/pages/Register.tsx` — Current register page implementation (RHF+Zod form logic to preserve, layout to refactor to 2-col)
- `src/index.css` — CSS variables and global styles; Tailwind config root

### Requirements
- `REQUIREMENTS.md` §AUTH-UI-01, AUTH-UI-02 — acceptance criteria for Login and Register pages

### Brand Asset
- `bumath.jpeg` (project root) → must be served from `public/bumath.jpeg`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/input.tsx` — shadcn Input; already installed
- `src/components/ui/button.tsx` — shadcn Button; already installed
- `src/components/ui/form.tsx` + `src/components/ui/select.tsx` — used in Register; keep
- `src/components/ui/card.tsx` — available but Register/Login currently use raw `div`; can use or keep div

### Established Patterns
- Login uses manual `useState` + `supabase.auth.signInWithPassword` — keep this logic
- Register uses RHF + Zod resolver (`registerSchema`) — keep all validation logic
- Auth redirect handled by `useEffect` watching `user` + `profile` + `loading` — do NOT change this pattern
- `useAuth()` from `AuthContext` provides `{ user, loading, profile }`

### Integration Points
- `src/App.tsx` — routes `/dang-nhap` and `/dang-ky` point to these pages; no change needed
- `src/contexts/AuthContext.tsx` — no changes needed
- `src/components/auth/ProtectedRoute.tsx` — no changes needed

</code_context>

<specifics>
## Specific Ideas

- Math symbol float animation: subtle `translateY` oscillation (CSS keyframes, 3-6s duration, staggered delays), `opacity: 0.06–0.12` so they don't distract
- Logo sizing: image ~40-48px height, "BuMath" text ~28-32px, Baloo 2 bold

</specifics>

<deferred>
## Deferred Ideas

- Pending approval page (`/cho-duyet`) — removed from product scope entirely
- Social login (Google/Facebook) — not requested, belongs in future phase if needed
- Forgot password flow — not in Phase 10 scope

</deferred>

---

*Phase: 10-auth-pages-ui*
*Context gathered: 2026-05-01*
