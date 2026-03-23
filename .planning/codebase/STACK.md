# Technology Stack

**Analysis Date:** 2026-03-23

## Languages

**Primary:**
- TypeScript 5.8.3 - Frontend application logic, component definitions, and utilities
- TSX - React component files with embedded JSX
- CSS - Tailwind utility classes in index.css

**Secondary:**
- JavaScript - Build configuration files (postcss.config.js)

## Runtime

**Environment:**
- Node.js 18.20.8 (from environment, no explicit .nvmrc file)

**Package Manager:**
- Yarn 4.11.0 - Primary package manager with node-modules linker strategy
- Lockfile: `yarn.lock` (present, using Yarn v4 Berry)

## Frameworks

**Core:**
- React 18.3.1 - UI library for building interactive components
- React DOM 18.3.1 - DOM rendering layer for React

**Build/Dev:**
- Vite 5.4.19 - Development server and production bundler configured in `vite.config.ts`
- @vitejs/plugin-react-swc 3.11.0 - SWC-based React Fast Refresh plugin for Vite
- TypeScript compiler for type checking and transpilation

**Component Library:**
- Radix UI (multiple @radix-ui/* packages v1.x) - Unstyled, accessible primitives for:
  - Accordion, Alert Dialog, Aspect Ratio, Avatar, Checkbox, Collapsible, Context Menu, Dialog, Dropdown Menu, Hover Card, Label, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Slider, Switch, Tabs, Toast, Toggle, Toggle Group, Tooltip
- shadcn/ui - Pre-built components on top of Radix UI (managed via CLI, do NOT modify manually)

**Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework configured in `tailwind.config.ts`
- PostCSS 8.5.6 - CSS processing with plugins for Tailwind and Autoprefixer
- Autoprefixer 10.4.21 - Browser vendor prefixing
- tailwindcss-animate 1.0.7 - Tailwind animation utilities plugin
- Class Variance Authority (CVA) 0.7.1 - Type-safe component variant utilities used throughout UI components
- clsx 2.1.1 - Conditional className utility

**Routing:**
- React Router DOM 6.30.1 - Client-side routing with BrowserRouter provider

**Forms & Validation:**
- React Hook Form 7.61.1 - Form state management and validation
- @hookform/resolvers 3.10.0 - Resolver integration between React Hook Form and validation libraries
- Zod 3.25.76 - TypeScript-first schema validation and parsing

**Server State Management:**
- TanStack React Query 5.83.0 - Server state caching, synchronization (initialized in `src/App.tsx` but infrastructure-ready)

**Animations:**
- Framer Motion 12.34.3 - React animation library for motion effects on landing page sections
- react-resizable-panels 2.1.9 - Resizable panel layout component

**UI/UX Utilities:**
- Lucide React 0.462.0 - Icon library
- Sonner 1.7.4 - Toast notification library (alternative to shadcn toast, imported as separate Toaster)
- next-themes 0.3.0 - Dark mode theme provider (class strategy)
- Embla Carousel 8.6.0 - Carousel component with React integration
- Recharts 2.15.4 - React charting library (dependency present but usage not yet detected)
- date-fns 3.6.0 - Date manipulation utility library
- react-day-picker 8.10.1 - Day picker component for date selection
- input-otp 1.4.2 - OTP input component
- cmdk 1.1.1 - Command menu/search component
- vaul 0.9.9 - Drawer/sheet component library

**Fonts:**
- Google Fonts: "Be Vietnam Pro" (weights 400, 500, 600, 700, 800, 900) - Vietnamese language support imported in `src/index.css`

## Testing

**Test Framework:**
- Vitest 3.2.4 - Unit test runner with Vite integration
- Config: `vitest.config.ts`

**Testing Libraries:**
- @testing-library/react 16.0.0 - React component testing utilities
- @testing-library/jest-dom 6.6.0 - DOM matchers for assertions
- jsdom 20.0.3 - JavaScript implementation of web standards for DOM simulation

**Configuration:**
- Test environment: jsdom
- Globals enabled (no import needed for describe, it, expect)
- Setup file: `src/test/setup.ts` (includes matchMedia polyfill for component tests)
- Test file pattern: `src/**/*.{test,spec}.{ts,tsx}`

## Linting & Code Quality

**Linting:**
- ESLint 9.32.0 - JavaScript/TypeScript linter
- Config: `eslint.config.js` (flat config format)
- @eslint/js 9.32.0 - ESLint recommended rules
- typescript-eslint 8.38.0 - TypeScript-specific linting rules
- eslint-plugin-react-hooks 5.2.0 - React hooks rules
- eslint-plugin-react-refresh 0.4.20 - React Fast Refresh validation
- globals 15.15.0 - Global variable definitions for browser environment

**Type Checking:**
- TypeScript strict mode: **disabled**
- `noImplicitAny`: off (allows implicit any types)
- `noUnusedLocals`: off
- `noUnusedParameters`: off
- `strictNullChecks`: off (allows null assignment to non-null types)
- `skipLibCheck`: true (skips type checking of declaration files)
- `allowJs`: true (allows JavaScript files in TypeScript project)

**Code Formatting:**
- No Prettier configuration detected; code style enforced via ESLint only

## DevDependencies

**Type Definitions:**
- @types/react 18.3.23 - React type definitions
- @types/react-dom 18.3.7 - React DOM type definitions
- @types/node 22.16.5 - Node.js type definitions

**Development Tools:**
- lovable-tagger 1.1.13 - Component tagging utility for development/debugging (active in development mode)

## Configuration Files

**TypeScript:**
- `tsconfig.json` - Base configuration with path alias for `@/` → `src/`
- `tsconfig.app.json` - Application TypeScript configuration
- `tsconfig.node.json` - Build tools TypeScript configuration

**Styling:**
- `tailwind.config.ts` - Tailwind CSS configuration with dark mode (class strategy), container settings, and HSL-based theme colors
- `postcss.config.js` - PostCSS configuration with Tailwind and Autoprefixer plugins

**Build & Dev:**
- `vite.config.ts` - Vite configuration with:
  - Base path set to `/bumath/` when building for GitHub Actions, `/` otherwise
  - Dev server on port 8080 with HMR overlay disabled
  - Path alias `@/` → `src/`
  - React plugin with SWC
  - Component tagger plugin in development mode

**Package Manager:**
- `.yarnrc.yml` - Yarn configuration with node-modules linker (creates traditional node_modules folder)

## Platform Requirements

**Development:**
- Node.js 18+ (tested on 18.20.8)
- Yarn 4.11.0+
- Modern browser with ES2020+ support

**Production:**
- Deployment target: GitHub Pages (indicated by `GITHUB_ACTIONS` env check in vite.config.ts, base path `/bumath/`)
- Static site hosting (no server-side code required)
- Modern browsers supporting ES2020+

---

*Stack analysis: 2026-03-23*
