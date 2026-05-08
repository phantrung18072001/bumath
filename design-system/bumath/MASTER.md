# BuMath Design System Rules
> **Global Source of Truth** for all UI/UX decisions across the project.
> Generated via `ui-ux-pro-max` skill · Last updated: 2026-05-09

---

## 🎨 Brand Identity

**Product:** BuMath — EdTech learning platform for K-12 math  
**Brand voice:** Warm, encouraging, premium — not childish, not corporate  
**Primary accent:** `#F97316` (Orange 500) — used for CTAs, highlights, active states  
**Design philosophy:** Clean white surfaces + bold orange accents + subtle depth

---

## 🖌 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-orange` | `#F97316` | Primary CTA, active tabs, send buttons, role badges |
| `brand-orange-dark` | `#EA6C0C` | Hover state of orange elements |
| `brand-orange-light` | `#FED7AA` | Backgrounds, subtle tints |
| `brand-orange-faint` | `#FFF7ED` | Panel backgrounds, card tints |
| `text-primary` | `#1E293B` (slate-800) | Main headings, prominent labels |
| `text-secondary` | `#475569` (slate-600) | Body text, descriptions |
| `text-muted` | `#94A3B8` (slate-400) | Timestamps, hints, placeholders |
| `surface-white` | `#FFFFFF` | Cards, message bubbles |
| `surface-subtle` | `#F8FAFC` (slate-50) | Panel backgrounds |
| `border-default` | `#E2E8F0` (slate-200) | Card borders, dividers |
| `border-active` | `#FED7AA` (orange-200) | Focused/active element borders |

### ❌ Never use
- Raw Tailwind defaults like `bg-primary` (maps to teal in shadcn) — always use explicit orange
- `text-muted-foreground` for anything important — contrast is too low
- Teal/green palettes (shadcn defaults conflict with brand)

---

## 🔤 Typography

**Font stack (already imported in index.css):**
- `Be Vietnam Pro` — All UI text (primary font)
- `Baloo 2` — Display headings, hero sections
- `Comic Neue` — Decorative/playful contexts only

**Scale:**
| Use | Class | Notes |
|-----|-------|-------|
| Page title | `text-2xl font-bold` | Baloo 2 preferred |
| Section heading | `text-lg font-semibold` | Be Vietnam Pro |
| Card title | `text-base font-semibold` | |
| Body | `text-sm` | leading-relaxed |
| Caption / meta | `text-xs text-slate-400` | |
| Micro label | `text-[11px]` | timestamps, badges |

---

## 🧱 Component Patterns

### Cards
```tsx
// Standard card — white surface with subtle orange shadow
<div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
```

```tsx
// Orange-accented card (featured, staff messages)
<div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 rounded-2xl shadow-sm">
```

### Buttons
```tsx
// Primary CTA — always orange
<button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-150 cursor-pointer">

// Ghost / secondary
<button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors duration-150 cursor-pointer">

// Destructive
<button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 cursor-pointer">
```

### Role Badges
```tsx
// Teacher / Admin role chip
<span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700">
  Giảng viên
</span>
```

### Avatars
```tsx
// Staff avatar — orange gradient
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white ring-2 ring-orange-200 flex items-center justify-center text-xs font-bold">
// Student avatar — slate gradient  
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 ring-2 ring-slate-100 flex items-center justify-center text-xs font-bold">
```

### Input Focus Ring
```tsx
// Orange focus ring — use on all inputs
className="focus:border-orange-300 focus:ring-1 focus:ring-orange-200/50"
```

### Live / Online Indicator
```tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
</span>
```

---

## ✨ Micro-interactions & Animation

| Situation | Rule |
|-----------|------|
| Cards on hover | `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200` |
| Buttons on click | `active:scale-95 transition-transform duration-100` |
| New items appearing | `animate-in fade-in-0 slide-in-from-bottom-1 duration-200` |
| Sending/loading | `animate-spin` on Loader2 icon only |
| State transitions | Always 150–200ms, `ease-out` |
| Layout shifts on hover | ❌ FORBIDDEN — never use scale on layout-affecting elements |

### `prefers-reduced-motion` rule
```css
@media (prefers-reduced-motion: reduce) {
  /* All animate-* classes should be suppressed */
}
```
Add `.bm-clay-card-student` pattern already in index.css as reference.

---

## 📐 Spacing & Layout

| Token | Value | Use for |
|-------|-------|---------|
| Panel padding | `px-4 py-3` | Headers, footers |
| Content padding | `px-4 md:px-5 py-5` | Scrollable message areas |
| Card padding | `p-4` or `p-5` | Content cards |
| Gap between items | `space-y-4` | Message lists, form groups |
| Icon gap | `gap-2` | Icon + label |
| Radius sm | `rounded-lg` | Badges, chips |
| Radius md | `rounded-xl` | Buttons, inputs |
| Radius lg | `rounded-2xl` | Cards, panels, bubbles |
| Radius full | `rounded-full` | Avatars, pills |

---

## ♿ Accessibility Rules

- [ ] All interactive elements have `cursor-pointer`
- [ ] All buttons have `aria-label` when icon-only
- [ ] Focus states visible: always include focus-visible ring
- [ ] Color is **never** the sole indicator of state
- [ ] `role="log" aria-live="polite"` on chat/notification feeds
- [ ] Minimum touch target: `min-h-[44px] min-w-[44px]` on mobile
- [ ] Contrast ratio: 4.5:1 minimum (text), 3:1 (UI components)

---

## 📱 Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| `< 640px` | Stack layouts, hide secondary hints (sm:block → hidden) |
| `640–1024px` | Tablet layout |
| `> 1024px` | Full desktop layout with sidebars |

Pattern: mobile-first. Use `md:` / `lg:` for enhancements.

---

## 🚫 Anti-patterns (Project-wide)

| ❌ Don't | ✅ Do instead |
|---------|-------------|
| `text-muted-foreground` for body text | `text-slate-600` or `text-slate-500` |
| `bg-primary` / `text-primary` | `bg-orange-500` / `text-orange-600` |
| Emojis as UI icons | Lucide icons (`lucide-react`) |
| `border-l-2 border-l-[#F97316]` inline | Use Tailwind `border-l-2 border-orange-400` |
| `hover:scale-105` on cards | `hover:-translate-y-0.5` (subtle lift) |
| More than 500ms transitions | Keep 150–200ms |
| Showing delete without confirm | Always use inline confirm pattern |
| Empty state with just text | Include icon + descriptive sub-text |
| Skeleton as single wide bar | Match real content shape (avatar + lines) |

---

## 🗂 Page-specific Overrides

Check `design-system/bumath/pages/[page].md` before implementing any page.  
Currently defined:
- `design-system/bumath/pages/chat.md` — Chat panel overrides

---

## Pre-delivery Checklist

Before submitting any UI:
- [ ] Uses `#F97316` / `orange-*` Tailwind classes — not shadcn `primary`
- [ ] All icons from `lucide-react`, consistent 16–20px size
- [ ] `cursor-pointer` on every clickable element
- [ ] Hover + focus states defined
- [ ] Transitions: 150–200ms ease
- [ ] Empty states have icon + primary + secondary text
- [ ] Loading skeletons match real content layout
- [ ] Mobile tested (no horizontal overflow, min touch targets)
- [ ] `prefers-reduced-motion` considered
