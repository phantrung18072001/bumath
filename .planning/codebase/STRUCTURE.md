# Codebase Structure

**Analysis Date:** 2026-03-23

## Directory Layout

```
bumath/
├── src/
│   ├── main.tsx              # React app entry point
│   ├── App.tsx               # Root app component with routing and providers
│   ├── index.css             # Global styles, CSS variables, Tailwind imports
│   ├── pages/                # Page-level components
│   │   ├── Index.tsx         # Landing page (/)
│   │   └── NotFound.tsx      # 404 fallback page (*)
│   ├── components/
│   │   ├── landing/          # Landing page sections
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ClassGrid.tsx
│   │   │   ├── IntensiveSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── ConsultationForm.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/               # shadcn/ui component library
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── dialog.tsx
│   │       ├── tooltip.tsx
│   │       ├── toaster.tsx
│   │       ├── sonner.tsx
│   │       └── [~30 more components]
│   ├── hooks/                # Custom React hooks
│   │   ├── use-toast.ts      # Toast notification management
│   │   └── use-mobile.tsx    # Mobile breakpoint detection
│   ├── lib/                  # Shared utilities
│   │   ├── utils.ts          # CSS class merging (cn() function)
│   │   └── validators.ts     # Input validation functions
│   └── test/                 # Test configuration and examples
│       ├── setup.ts          # Vitest setup (matchMedia polyfill)
│       └── example.test.ts   # Example test file
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # TypeScript app-specific config
├── tsconfig.node.json        # TypeScript Node config (build tools)
├── vite.config.ts            # Vite build configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── eslint.config.js          # ESLint configuration
├── vitest.config.ts          # Vitest test runner config (auto-discovered)
└── public/                   # Static assets
    └── bumath.jpeg           # Brand logo

```

## Directory Purposes

**src/:**
- Purpose: All source code
- Contains: Components, pages, hooks, utilities, tests
- Key files: `main.tsx`, `App.tsx`, `index.css`

**src/pages/:**
- Purpose: Page-level route components
- Contains: Components that represent complete pages or routes
- Key files: `Index.tsx` (landing), `NotFound.tsx` (404)
- Pattern: One file per route; no subdirectories

**src/components/:**
- Purpose: Reusable UI components
- Contains: Landing sections (marketing layout) and design system (shadcn/ui primitives)
- Key files: All landing sections and shadcn UI primitives
- Pattern: Organized by domain (landing/) and library (ui/)

**src/components/landing/:**
- Purpose: Marketing landing page sections
- Contains: Header, HeroSection, ClassGrid, IntensiveSection, TestimonialsSection, ConsultationForm, Footer
- Key files: All are equally important; compose into `Index.tsx` page
- Pattern: Stateless (some state for mobile menu, form submission), animation-first with Framer Motion

**src/components/ui/:**
- Purpose: Design system primitives from shadcn/ui
- Contains: Radix UI primitives wrapped with Tailwind styling
- Key files: All shadcn components; do not edit manually
- Pattern: Auto-generated via shadcn CLI; managed externally

**src/hooks/:**
- Purpose: Encapsulate custom stateful logic
- Contains: Custom hooks for reusable behavior
- Key files: `use-toast.ts` (reducer-based notification state), `use-mobile.tsx` (responsive design)
- Pattern: Small, focused, no dependencies on components

**src/lib/:**
- Purpose: Shared utility functions and constants
- Contains: Helper functions, validators, configuration
- Key files: `utils.ts` (cn() for Tailwind class merging), `validators.ts` (Vietnamese phone validation)
- Pattern: Pure functions, no side effects, single responsibility

**src/test/:**
- Purpose: Test configuration and examples
- Contains: Vitest setup, test utilities, example tests
- Key files: `setup.ts` (environment initialization), `example.test.ts` (template)
- Pattern: Tests co-located with source (*.test.ts, *.spec.ts next to *.tsx/ts)

## Key File Locations

**Entry Points:**
- `src/main.tsx`: Mounts React app to DOM
- `src/App.tsx`: Root component, providers, routing configuration
- `index.html`: HTML template with `<div id="root"></div>`

**Configuration:**
- `vite.config.ts`: Vite dev server, build, path aliases (@/)
- `tailwind.config.ts`: Tailwind CSS theme, content scanning, plugins
- `tsconfig.json`: TypeScript compiler options (strict disabled, @/ alias)
- `eslint.config.js`: ESLint rules (React Hooks, React Refresh)

**Core Logic:**
- `src/pages/Index.tsx`: Landing page composition
- `src/components/landing/`: Seven sections that comprise the landing page
- `src/components/landing/ConsultationForm.tsx`: Form submission with external API integration
- `src/lib/validators.ts`: Phone number validation rules
- `src/hooks/use-toast.ts`: Toast state management with reducer

**Testing:**
- `src/test/setup.ts`: Vitest setup with matchMedia polyfill (required for component tests)
- `src/test/example.test.ts`: Example test demonstrating pattern
- `vitest.config.ts`: Test runner configuration (auto-discovered, jsdom environment)

## Naming Conventions

**Files:**
- PascalCase for component files: `HeroSection.tsx`, `ClassGrid.tsx`, `ConsultationForm.tsx`
- camelCase for utility/hook files: `utils.ts`, `validators.ts`, `use-toast.ts`, `use-mobile.tsx`
- UPPERCASE for config: `ARCHITECTURE.md`, `STRUCTURE.md` (planning docs)
- lowercase for directories: `components/`, `pages/`, `hooks/`, `lib/`, `landing/`, `ui/`

**Directories:**
- Feature-based grouping: `landing/` groups marketing sections, `ui/` groups design primitives
- No nesting beyond one level in `components/` (landing and ui only)

**Functions & Variables:**
- camelCase for functions: `cn()`, `isValidVnPhone()`, `useIsMobile()`
- camelCase for variables: `course`, `mobileOpen`, `loading`
- SCREAMING_SNAKE_CASE for constants: `MOBILE_BREAKPOINT`, `TOAST_LIMIT`, `TOAST_REMOVE_DELAY`
- Prefix custom hooks with `use`: `useIsMobile()` (exported as `useIsMobile` from `use-mobile.tsx`)

**Types & Interfaces:**
- PascalCase for type names: `ToasterToast`, `Action`, `State`, `ActionType`
- Prefix optional interfaces with `I` not used; only exported types in UI layer

## Where to Add New Code

**New Feature (e.g., new product page):**
- Primary code: `src/pages/[FeatureName].tsx`
- Tests: `src/pages/[FeatureName].test.tsx`
- Sections (if marketing): `src/components/[feature]/` directory with subsections
- Route definition: Add to `<Routes>` in `src/App.tsx`

**New Component/Module:**
- If part of landing: `src/components/landing/[ComponentName].tsx`
- If reusable primitive: Use shadcn CLI to add from existing library, file goes to `src/components/ui/`
- If custom domain component: `src/components/[domain]/[ComponentName].tsx`

**Utilities/Helpers:**
- General utilities: `src/lib/utils.ts`
- Domain-specific validators: `src/lib/validators.ts`
- New validator function: Add to `src/lib/validators.ts` as named export

**Custom Hooks:**
- New hook: `src/hooks/use-[feature-name].ts` or `.tsx`
- Export as default: `export default function use[FeatureName]() { ... }`
- Pattern: Encapsulate state and side effects, return object with state and handlers

**Tests:**
- Unit tests for utilities: `src/lib/[util-name].test.ts`
- Component tests: `src/components/[path]/[Component].test.tsx`
- Hook tests: `src/hooks/[hook-name].test.ts`
- Setup/config: `src/test/setup.ts` (already configured)

**Styling:**
- All styles via Tailwind utility classes in JSX (no external CSS files)
- Theme customization: Modify CSS variables in `src/index.css` (`:root`, `.dark` classes)
- No component-scoped CSS modules; `cn()` used for conditional classes

## Special Directories

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (via yarn install)
- Committed: No (.gitignore)

**dist/:**
- Purpose: Production build output
- Generated: Yes (via yarn build)
- Committed: No (.gitignore)
- Location: Generated at root on build

**public/:**
- Purpose: Static assets (images, fonts, etc.)
- Generated: No
- Committed: Yes
- Contents: Vite copies directly to build; referenced via `import.meta.env.BASE_URL`

**.planning/codebase/:**
- Purpose: GSD codebase analysis documents
- Generated: No (manually created by GSD agents)
- Committed: Yes (for reference and future planning)
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md

---

*Structure analysis: 2026-03-23*
