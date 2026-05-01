# Phase 10: Auth Pages UI — Research

**Researched:** 2026-05-01
**Domain:** React UI refactor — Claymorphism design system, Tailwind CSS, shadcn/ui
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Decorative background with floating math symbols (π, √, +/-, ×, ÷, ∑) in very light teal/gray opacity. Symbols are purely decorative, no interaction, positioned absolutely around the card. No gradient background.
- **D-02:** Logo = brand image `bumath.jpeg` + "BuMath" text side-by-side using Baloo 2 font. The image file is currently at `/bumath.jpeg` (project root) — must be copied to `public/bumath.jpeg` so it can be served via `/bumath.jpeg`.
- **D-03:** Logo displayed prominently above the auth card, centered.
- **D-04:** 2-column grid on desktop: Row 1 = phone + full name; Row 2 = year of birth + address; Row 3 = password + confirm password. Collapses to single column on mobile (`< 640px`).
- **D-05:** `/cho-duyet` route and pending approval flow REMOVED entirely. After register, users go directly to `/khoa-hoc` with full student access. No `Pending.tsx` to create. AUTH-UI-03 is descoped.
- **Card style:** Claymorphism specs — thick border (3-4px solid `#0D9488`), double shadow (`0 8px 0 #0D9488` + soft ambient), rounded-3xl, white card on `#F0FDFA` page background.
- **CTA Button:** "Đăng nhập" / "Đăng ký" buttons use orange `#F97316`, not teal.

### Agent's Discretion

- Apply design system Claymorphism specs as described above — exact shadow values and card styling.
- Primary CTA button color is orange `#F97316` per design system CTA spec.

### Deferred Ideas (OUT OF SCOPE)

- Pending approval page (`/cho-duyet`) — removed from product scope entirely
- Social login (Google/Facebook)
- Forgot password flow
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-UI-01 | Trang đăng nhập (`/dang-nhap`) — thiết kế đẹp, centered card, logo BuMath, form validation inline | UI-SPEC.md fully specifies Login layout; existing logic preserved; CSS + JSX changes only |
| AUTH-UI-02 | Trang đăng ký (`/dang-ky`) — multi-field form gọn gàng, validation rõ ràng, 2-col grid | UI-SPEC.md specifies 3×2-col grid (sm:grid-cols-2); RHF+Zod validation already works inline |
| AUTH-UI-03 | ~~Trang chờ duyệt~~ — **REMOVED per D-05**; descoped entirely | No implementation needed |
| DS-01 | Hệ thống màu, spacing, typography đồng nhất — BuMath design system | CSS custom properties (`--bm-*`), Baloo 2 + Comic Neue fonts, Tailwind fontFamily extension |
</phase_requirements>

---

## Summary

Phase 10 is a **UI-only refactor** of two existing pages — `Login.tsx` and `Register.tsx`. All auth logic (useState, RHF+Zod, supabase calls, useEffect redirects, validators) is **preserved verbatim**. Only JSX structure, className values, and CSS additions change. The authoritative design specification is `10-UI-SPEC.md` in the phase directory — it has been approved and provides pixel-level detail on layout, colors, typography, component states, and copywriting.

The primary change surface is: (1) add CSS custom properties + utility classes + @keyframes to `src/index.css`; (2) extend `tailwind.config.ts` with two new fontFamily entries; (3) copy `bumath.jpeg` to `public/`; (4) refactor JSX in `Login.tsx` and `Register.tsx` to use the new Claymorphism card structure, logo block, floating symbols, and CTA button style.

The Pending page (`/cho-duyet`) is entirely out of scope per D-05 — AUTH-UI-03 is descoped. The existing redirect in `Register.tsx` (`else → /khoa-hoc`) is already correct for D-05. No backend or routing changes are needed.

**Primary recommendation:** Execute as 2 plans — (1) foundation: CSS vars + Tailwind config + asset copy, (2) page refactors: Login.tsx + Register.tsx. The test suite (Login.test.tsx) tests logic/redirects only and will continue passing without modification.

---

## Standard Stack

### Core (already installed — no new packages needed)
| Library | Version | Purpose | Note |
|---------|---------|---------|------|
| Tailwind CSS | 3.x | Utility-first styling | Configured via `tailwind.config.ts` |
| shadcn/ui | installed | Input, Button, Form, Select, Card | Already in `src/components/ui/` |
| Lucide React | installed | Icons: Eye, EyeOff, Loader2 | No additions needed |
| React Hook Form | installed | Register form logic | Preserve as-is |
| Zod | installed | Schema validation | Preserve as-is |
| Framer Motion | installed | Available for animation | NOT used — CSS keyframes preferred (UI-SPEC uses `@keyframes bm-float`) |

### External Resources (CDN, no install)
| Resource | URL | Purpose |
|----------|-----|---------|
| Google Fonts | `https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700&family=Comic+Neue:wght@400;700&display=swap` | Heading + label fonts |

**No new npm packages needed.** All implementation is CSS additions + JSX className changes.

---

## Architecture Patterns

### Recommended File Change Surface

```
src/
├── index.css              ← ADD: Google Fonts import, --bm-* vars, .bm-clay-card,
│                             @keyframes bm-float, .bm-float-symbol, .bm-btn-cta, .bm-input
├── pages/
│   ├── Login.tsx          ← REFACTOR JSX: add symbols, logo, clay card, CTA button class
│   └── Register.tsx       ← REFACTOR JSX: same + 3×2-col grid layout
tailwind.config.ts         ← ADD: fontFamily.baloo + fontFamily.comic under theme.extend
public/
└── bumath.jpeg            ← COPY from project root (already exists at public/bumath.jpeg ✓)
```

> **Asset status:** `public/bumath.jpeg` already exists (verified by directory listing). The copy step is a no-op safety check.

### Pattern 1: Claymorphism Card Wrapper

**What:** A `div` with class `.bm-clay-card` provides thick teal border + double shadow
**When to use:** Wraps the entire auth form card on both pages

```css
/* Source: 10-UI-SPEC.md § CSS Additions Required */
.bm-clay-card {
  background: var(--bm-card);          /* #FFFFFF */
  border: 3px solid var(--bm-border);  /* #0D9488 */
  border-radius: 24px;
  box-shadow:
    0 8px 0 var(--bm-border),          /* clay hard shadow */
    0 12px 24px rgba(13, 148, 136, 0.10); /* soft ambient */
  padding: 32px;
  transition: box-shadow 200ms ease, transform 200ms ease;
}
```

```jsx
{/* Source: 10-UI-SPEC.md § Login Card Interior */}
<div className="bm-clay-card max-w-[400px] w-full">
  <h1 className="font-baloo text-2xl font-bold mb-6" style={{ color: '#134E4A' }}>
    Đăng nhập
  </h1>
  {/* ...form fields... */}
</div>
```

### Pattern 2: Floating Math Symbols Background

**What:** 6 `<span>` elements absolutely positioned, decorative only, `aria-hidden`
**When to use:** Inside the outermost page wrapper, before the centered content div

```jsx
{/* Source: 10-UI-SPEC.md § Floating Math Symbols */}
<span className="bm-float-symbol" aria-hidden="true"
  style={{ top: '8%', left: '6%', fontSize: '36px' }}>π</span>
<span className="bm-float-symbol" aria-hidden="true"
  style={{ top: '15%', right: '8%', fontSize: '40px' }}>√</span>
<span className="bm-float-symbol" aria-hidden="true"
  style={{ top: '55%', left: '4%', fontSize: '32px' }}>±</span>
<span className="bm-float-symbol" aria-hidden="true"
  style={{ top: '20%', right: '15%', fontSize: '44px' }}>×</span>
<span className="bm-float-symbol" aria-hidden="true"
  style={{ top: '70%', right: '6%', fontSize: '36px' }}>÷</span>
<span className="bm-float-symbol" aria-hidden="true"
  style={{ top: '40%', left: '12%', fontSize: '48px' }}>∑</span>
```

### Pattern 3: CTA Button Override

**What:** Apply orange CTA color on top of shadcn Button using `className` override + `bm-btn-cta` class
**Implementation:** Since `src/components/ui/button.tsx` must NOT be modified (CLAUDE.md rule), use CSS class override via `.bm-btn-cta` or Tailwind arbitrary values.

```jsx
{/* Source: 10-UI-SPEC.md § CTA Button */}
<Button
  type="submit"
  className="bm-btn-cta w-full"
  disabled={isSubmitting}
>
  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
  Đăng nhập
</Button>
```

> **Pitfall:** shadcn Button has its own background class. Use `bm-btn-cta` (which sets `background: var(--bm-cta)`) — Tailwind's `!important` or a more-specific CSS selector may be needed if shadcn styles override. The `.bm-btn-cta` class in CSS sets background directly on the element, which should win over Tailwind utility classes in the component since `.bm-btn-cta` is explicit. If conflicts arise, add `!bg-[#F97316]` Tailwind arbitrary value.

### Pattern 4: Register 2-Column Grid

**What:** Wrap field pairs in `div` with `grid grid-cols-1 sm:grid-cols-2 gap-4`
**When to use:** 3 rows on Register form

```jsx
{/* Source: 10-UI-SPEC.md § Register Card Interior */}
{/* Row 1 */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <FormField name="phone" ... />
  <FormField name="fullName" ... />
</div>
{/* Row 2 */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <FormField name="yearOfBirth" ... />
  <FormField name="address" ... />
</div>
{/* Row 3 */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <FormField name="password" ... />
  <FormField name="confirmPassword" ... />
</div>
```

### Pattern 5: Logo Block

```jsx
{/* Source: 10-UI-SPEC.md § Brand Asset */}
<div className="flex items-center gap-2 mb-8">
  <img
    src="/bumath.jpeg"
    alt="BuMath logo"
    className="h-11 w-auto rounded-lg"
  />
  <span
    className="font-baloo text-[30px] font-bold"
    style={{ color: '#0D9488' }}
  >
    BuMath
  </span>
</div>
```

### Pattern 6: Page Wrapper

```jsx
{/* Source: 10-UI-SPEC.md § Shared Page Structure */}
<div
  className="relative min-h-screen overflow-hidden"
  style={{ background: '#F0FDFA' }}
>
  {/* 6x floating symbols here */}

  <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
    {/* Logo block */}
    {/* Clay card */}
  </div>
</div>
```

### Tailwind Config Extension

```ts
// tailwind.config.ts → theme.extend
fontFamily: {
  'baloo': ['"Baloo 2"', 'sans-serif'],
  'comic': ['"Comic Neue"', 'cursive'],
},
```

Then `font-baloo` and `font-comic` become valid Tailwind classes.

### Anti-Patterns to Avoid

- **Modifying `src/components/ui/` files directly** — CLAUDE.md prohibits this; use className overrides only
- **Changing global `body` font-family** — Be Vietnam Pro stays for non-auth pages
- **Touching AuthContext, ProtectedRoute, App.tsx, validators.ts** — zero changes to logic files
- **Using Framer Motion for float animation** — CSS keyframes per UI-SPEC (simpler, no bundle impact)
- **Using orange (`#F97316`) on anything other than the submit button** — links must be teal `#0D9488`
- **Removing `formError` display in Login** — context says "inline validation, no page-level error messages" but that means errors appear inline below fields. The existing `formError` near the submit button is acceptable per UI-SPEC.
- **Gradient backgrounds** — D-01 explicitly says no gradient; use flat `#F0FDFA` only

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Existing RHF + Zod (`registerSchema`) | Already works, test-covered; UI spec says preserve |
| Icon set | Custom SVG icons | Lucide React (already installed) | Consistent; MASTER.md forbids emoji icons |
| Font loading | Manual font files | Google Fonts `@import` in CSS | Already specified in UI-SPEC.md |
| Float animation | Framer Motion | CSS `@keyframes bm-float` | UI-SPEC specifies CSS; simpler, no JS needed |

---

## Common Pitfalls

### Pitfall 1: shadcn Button Background Override
**What goes wrong:** `.bm-btn-cta` sets `background: var(--bm-cta)` but shadcn Button component applies its own `bg-primary` Tailwind class, which may win in specificity.
**Why it happens:** Tailwind generates atomic utility classes; `.bm-btn-cta` is a custom class in a separate `@layer` or plain CSS — specificity depends on order.
**How to avoid:** Place `.bm-btn-cta` definition AFTER `@tailwind utilities` in `src/index.css`. If still overridden, add `!bg-[#F97316]` Tailwind class on the Button element.
**Warning signs:** CTA button appears as teal (default primary) instead of orange in browser.

### Pitfall 2: Math Symbols Causing Horizontal Scroll
**What goes wrong:** Symbols positioned with `right: 6%` or large font-size can overflow on narrow mobile viewports.
**Why it happens:** `position: absolute` without `overflow: hidden` on the parent.
**How to avoid:** Page wrapper MUST have `overflow-hidden` (specified in UI-SPEC). Verified: wrapper is `relative min-h-screen overflow-hidden`.
**Warning signs:** Horizontal scrollbar visible at 375px viewport width.

### Pitfall 3: Font Not Loading (FOUT / Wrong Font)
**What goes wrong:** "BuMath" text renders in fallback sans-serif instead of Baloo 2.
**Why it happens:** Google Fonts `@import` must be the FIRST line in `src/index.css` (before `@tailwind base`) to load correctly in Vite.
**How to avoid:** Add the `@import` URL as the very first statement in `src/index.css`, above the existing `Be Vietnam Pro` import.
**Warning signs:** Logo text looks like Arial/Helvetica; no Baloo 2 in browser DevTools Sources.

### Pitfall 4: `prefers-reduced-motion` Omission
**What goes wrong:** Float animation runs for users with vestibular disorders.
**Why it happens:** Forgetting to add the `@media (prefers-reduced-motion: reduce)` override.
**How to avoid:** UI-SPEC defines the media query — include it verbatim in CSS:
```css
@media (prefers-reduced-motion: reduce) {
  .bm-float-symbol { animation: none !important; }
}
```

### Pitfall 5: Register Redirect Not Aligned with D-05
**What goes wrong:** Register redirects to `/cho-duyet` (old pending page).
**Why it happens:** Old ProtectedRoute used to redirect `pending` role users there.
**How to avoid:** Current `Register.tsx` already redirects to `/khoa-hoc` for non-admin users in `useEffect` — this is correct. No change needed. **Verify**: the `useEffect` in Register currently reads `navigate('/khoa-hoc')` (confirmed in source).

### Pitfall 6: `space-y-4` Conflicts with Grid Rows
**What goes wrong:** The `<form>` wrapper has `space-y-4` which applies top margin to ALL direct children — but when children are `grid` divs, `space-y-4` still applies correctly. No conflict expected, but verify field vertical spacing looks right on mobile.
**How to avoid:** Keep `space-y-4` on the `<form>`, use `gap-4` inside each grid row `div`. These don't conflict.

---

## Code Examples

### Full CSS Additions for src/index.css
```css
/* Source: 10-UI-SPEC.md § CSS Additions Required */
/* Add BEFORE @tailwind base (fonts) and AFTER utilities (custom classes) */

/* At top of file — Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700&family=Comic+Neue:wght@400;700&display=swap');

/* In :root block (ADD to existing :root, do not replace) */
--bm-primary:   #0D9488;
--bm-secondary: #2DD4BF;
--bm-cta:       #F97316;
--bm-bg:        #F0FDFA;
--bm-text:      #134E4A;
--bm-card:      #FFFFFF;
--bm-border:    #0D9488;
--bm-muted:     #5EADA5;

/* After @tailwind utilities — custom utility classes */
.bm-clay-card {
  background: var(--bm-card);
  border: 3px solid var(--bm-border);
  border-radius: 24px;
  box-shadow:
    0 8px 0 var(--bm-border),
    0 12px 24px rgba(13, 148, 136, 0.10);
  padding: 32px;
  transition: box-shadow 200ms ease, transform 200ms ease;
}

@keyframes bm-float {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}

@media (prefers-reduced-motion: reduce) {
  .bm-float-symbol { animation: none !important; }
}

.bm-float-symbol {
  position: absolute;
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  color: var(--bm-primary);
  opacity: 0.08;
  pointer-events: none;
  user-select: none;
  animation: bm-float ease-in-out infinite;
}

.bm-float-symbol:nth-child(1) { animation-duration: 3.0s; }
.bm-float-symbol:nth-child(2) { animation-duration: 4.0s; }
.bm-float-symbol:nth-child(3) { animation-duration: 5.0s; }
.bm-float-symbol:nth-child(4) { animation-duration: 3.5s; }
.bm-float-symbol:nth-child(5) { animation-duration: 4.5s; }
.bm-float-symbol:nth-child(6) { animation-duration: 6.0s; }

.bm-btn-cta {
  background: var(--bm-cta) !important;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
  min-height: 48px;
  cursor: pointer;
  transition: opacity 200ms ease, transform 200ms ease;
}
.bm-btn-cta:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}
.bm-btn-cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
```

### Input Focus Override
```css
/* Source: 10-UI-SPEC.md § BuMath Input Focus Override */
.bm-input:focus-within input,
input.bm-input:focus {
  border-color: var(--bm-primary) !important;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15) !important;
  outline: none;
}
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test src/pages/Login.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-UI-01 | Login page redirects correctly by role | unit | `yarn test src/pages/Login.test.tsx` | ✅ exists |
| AUTH-UI-01 | Login page renders centered card + logo | visual/smoke | Manual browser check at 375px, 1024px | — |
| AUTH-UI-02 | Register form grid collapses on mobile | visual/smoke | Manual browser check at 375px | — |
| AUTH-UI-02 | Register form validation messages appear | unit (existing RHF — no new test needed) | `yarn test` (existing) | ✅ covered by RHF |
| DS-01 | BuMath CSS variables + fonts load | smoke | Manual browser DevTools check | — |

**Key insight:** The existing `Login.test.tsx` tests **only test redirect logic** (useEffect + navigate calls). They are not affected by JSX/className changes and will continue passing after the UI refactor. No new unit tests are strictly required for this phase since the changes are purely visual.

### Sampling Rate
- **Per task commit:** `yarn test src/pages/Login.test.tsx` (fast, verifies logic intact)
- **Per wave merge:** `yarn test` (full suite green)
- **Phase gate:** Full suite green + manual browser verify at 375px + 1024px before `/gsd-verify-work`

### Wave 0 Gaps
- None for logic tests — `Login.test.tsx` exists and covers redirect behavior.
- Visual verification is manual-only (no automated snapshot tests planned for this phase).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Google Fonts CDN | Baloo 2 + Comic Neue | ✓ (online) | CDN | Self-host fonts if offline |
| `public/bumath.jpeg` | Logo image | ✓ exists | — | Already present in public/ |
| Yarn | Package manager | ✓ | 4.11.0 | — |

**No missing dependencies.** This phase requires no new npm packages and no external service connections. All changes are file edits only.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 10 |
|-----------|-------------------|
| Use `yarn` (not npm) | All commands use `yarn test`, `yarn dev`, etc. |
| **Do not modify `src/components/ui/`** — use shadcn CLI | CTA button override via CSS class, NOT editing `button.tsx` |
| Use shadcn/ui or Radix primitives before custom components | No new custom components needed; existing Input/Button/Form used |
| Animations: Framer Motion available | NOT used — CSS keyframes per UI-SPEC decision |
| Strict mode disabled, `noImplicitAny` off | No TypeScript impact for this phase |
| Vitest + RTL for tests; jsdom; globals enabled | No new test framework setup needed |
| Path alias `@/` maps to `src/` | Import paths unchanged |

---

## Open Questions

1. **`bm-btn-cta` vs shadcn Button specificity conflict**
   - What we know: shadcn Button applies `bg-primary` via Tailwind; `.bm-btn-cta` uses explicit `background` with `!important`
   - What's unclear: Whether `!important` in the CSS class will reliably override Tailwind utility — depends on CSS cascade order in Vite build
   - Recommendation: Test visually during Wave 1 execution; fallback is adding `!bg-[#F97316]` directly on the `<Button className="...">` element

2. **Google Fonts import order in index.css**
   - What we know: `@import` must come before all other CSS in the file
   - What's unclear: Current `index.css` has `@import url('...Be Vietnam Pro...')` as line 1, then `@tailwind base`
   - Recommendation: Add Baloo 2 + Comic Neue import on line 2 (right after Be Vietnam Pro import), before `@tailwind base`

---

## Sources

### Primary (HIGH confidence)
- `10-UI-SPEC.md` (phase directory) — Complete visual + interaction contract, approved
- `design-system/bumath/MASTER.md` — BuMath v2.0 design system (Teal + Claymorphism)
- `src/pages/Login.tsx` — Current implementation, logic to preserve
- `src/pages/Register.tsx` — Current implementation, logic + redirects to preserve
- `src/index.css` — Existing CSS variables and global styles
- `tailwind.config.ts` — Tailwind configuration, extension point identified
- `CLAUDE.md` — Project-specific rules (component restrictions, package manager)

### Secondary (MEDIUM confidence)
- `src/pages/Login.test.tsx` — Confirmed: tests are logic-only (redirect tests), unaffected by UI changes

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed installed; no new packages
- Architecture: HIGH — UI-SPEC.md is authoritative, fully specced
- Pitfalls: HIGH — identified from code inspection and CSS specificity knowledge
- Test coverage: HIGH — existing test covers redirect logic; visual checks are manual

**Research date:** 2026-05-01
**Valid until:** 2026-06-01 (stable dependencies; no fast-moving concerns)
