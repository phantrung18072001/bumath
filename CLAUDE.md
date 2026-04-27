# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start dev server at http://localhost:8080
yarn build        # Production build
yarn build:dev    # Dev-mode build (for debugging)
yarn lint         # Run ESLint
yarn test         # Run all tests once
yarn test:watch   # Run tests in watch mode
yarn preview      # Preview production build
```

**Package manager**: Yarn 4.11.0 (use `yarn`, not `npm`).

## Architecture

Single-page React application for a Vietnamese math education platform (grades 7–9).

## Product Focus

- **Ưu tiên**: Toán lớp 7, 8, 9 (THCS) và **Ôn thi chuyên Toán** — đây là 2 mảng trọng điểm.
- Khi thiết kế tính năng mới hoặc viết nội dung mẫu, ưu tiên trải nghiệm cho học sinh THCS và học sinh ôn thi chuyên.

### Routing (`src/App.tsx`)
- `/` → `pages/Index.tsx` (landing page)
- `*` → `pages/NotFound.tsx`
- Providers: `QueryClientProvider`, `TooltipProvider`, `Toaster` (both shadcn and Sonner)

### Component structure
- `src/components/landing/` — Marketing landing page sections: `Header`, `HeroSection`, `ClassGrid`, `IntensiveSection`, `TestimonialsSection`, `ConsultationForm`, `Footer`
- `src/components/ui/` — shadcn/ui components (do not modify these manually; use the shadcn CLI to add/update)

### UI Component Rule
**Always use shadcn/ui or Radix primitives before implementing custom components.** Check `src/components/ui/` and https://ui.shadcn.com/docs/components first. If a component is missing, install it with `yarn dlx shadcn@latest add <name>` before building from scratch.
- `src/hooks/` — Custom hooks (`use-toast`, `use-mobile`)
- `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)

### Key libraries
- **UI**: shadcn/ui (Radix primitives) + Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Server state**: TanStack React Query
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Font**: "Be Vietnam Pro" (Vietnamese language support)

### Styling conventions
- Tailwind utility classes with CSS variables for theming (HSL format, defined in `src/index.css`)
- Dark mode via class strategy
- Path alias: `@/` maps to `src/`

### Testing
- Vitest + React Testing Library; jsdom environment; globals enabled (no imports needed for `describe`, `it`, `expect`)
- Test files: `src/**/*.{test,spec}.{ts,tsx}`
- Setup: `src/test/setup.ts` (includes `matchMedia` polyfill required for component tests)
- Run a single test file: `yarn test src/path/to/file.test.ts`

### TypeScript
- Strict mode is **disabled**; `noImplicitAny` is off
- ESLint `@typescript-eslint/no-unused-vars` is off
