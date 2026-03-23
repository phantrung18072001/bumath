# Architecture

**Analysis Date:** 2026-03-23

## Pattern Overview

**Overall:** Single-Page Application (SPA) with component-based React architecture

**Key Characteristics:**
- Client-side rendering with React 18
- Marketing landing page as primary interface
- Extensible routing structure for future feature pages
- Decoupled UI components via shadcn/ui design system
- Form-based data collection with external integration
- Animation-first UX with Framer Motion

## Layers

**Presentation Layer:**
- Purpose: Render UI components and manage component state
- Location: `src/components/`
- Contains: Reusable shadcn/ui primitives, domain-specific landing sections, page layouts
- Depends on: Hooks, utilities, UI libraries (Radix, Tailwind, Framer Motion)
- Used by: Page components

**Page/Route Layer:**
- Purpose: Compose sections into complete pages, manage page-level routing
- Location: `src/pages/`
- Contains: Page components that orchestrate landing sections
- Depends on: Presentation layer components
- Used by: Router (App.tsx)

**Utility Layer:**
- Purpose: Shared helper functions and configuration
- Location: `src/lib/`
- Contains: CSS class merging (`cn()`), validators, potentially other utilities
- Depends on: clsx, tailwind-merge, Zod
- Used by: All components

**Custom Hooks Layer:**
- Purpose: Encapsulate stateful logic and side effects
- Location: `src/hooks/`
- Contains: Toast notification management, mobile breakpoint detection
- Depends on: React, toast reducer logic
- Used by: Components throughout the app

**Configuration Layer:**
- Purpose: Build and runtime configuration
- Location: Root-level config files
- Contains: Vite, TypeScript, Tailwind, ESLint configuration
- Depends on: Package manager, build tools
- Used by: Build process, IDE tooling

## Data Flow

**User Registration/Consultation:**

1. User fills out form in `ConsultationForm` component
2. Form validation occurs locally via `isValidVnPhone()` from `src/lib/validators.ts`
3. On submit, form data is serialized and sent via fetch POST to Google Apps Script endpoint
4. Response status determines success/error toast via `sonner` library
5. Form resets on success, user sees success toast notification

**Toast/Notification:**
- `sonner` library handles toast display for success/error messages
- Radix UI `@radix-ui/react-toast` provides underlying toast primitive
- Custom `useToast()` hook manages toast state via reducer pattern

**Navigation State:**
- React Router DOM v6 manages URL and route transitions
- Navigation items in Header component link to future pages (not yet implemented)
- Links use React Router `Link` component for client-side navigation

**State Management:**
- React Query (TanStack) initialized in `App.tsx` via `QueryClientProvider`
- Component-level state via `useState()` for form inputs and UI toggles (e.g., mobile menu)
- No global state management for current scope (landing page only)
- Toast state managed via custom reducer in `src/hooks/use-toast.ts`

## Key Abstractions

**ConsultationForm Component:**
- Purpose: Collect student/parent inquiry data and submit to backend
- Location: `src/components/landing/ConsultationForm.tsx`
- Pattern: Uncontrolled form with manual DOM element access, validation, external API call
- Flow: Form submit → local validation → fetch POST → toast notification → form reset

**ClassGrid Component:**
- Purpose: Display available math courses (grades 7, 8, 9, intensive exam prep)
- Location: `src/components/landing/ClassGrid.tsx`
- Pattern: Static data array mapped to Card components with animations
- Data: Hardcoded course metadata (level, slug, description, color gradients)

**Landing Page Sections:**
- Header: Navigation and authentication entry points
- HeroSection: Value proposition with statistics
- ClassGrid: Course selection cards
- IntensiveSection: Exam prep program features
- TestimonialsSection: Social proof
- ConsultationForm: Lead capture
- Footer: Navigation links and contact info

Each section uses Framer Motion for scroll-triggered animations and Tailwind CSS for responsive styling.

**UI Component Library:**
- Purpose: Consistent, accessible design primitives
- Pattern: Radix UI primitives wrapped by shadcn/ui with Tailwind styling
- Examples: `Button`, `Card`, `Input`, `Select`, `Dialog`, `Dropdown`
- Tooling: shadcn CLI (do not edit manually; use CLI to add/update)

## Entry Points

**Application Root:**
- Location: `src/main.tsx`
- Triggers: Page load; renders React app to #root DOM element
- Responsibilities: Bootstrap React and render `App` component

**App Component:**
- Location: `src/App.tsx`
- Triggers: Initialization of main app tree
- Responsibilities:
  - Provide QueryClientProvider for server state
  - Provide TooltipProvider for tooltip functionality
  - Initialize Radix and Sonner toast providers
  - Set up React Router with routes
  - Define route mapping: `/` → Index page, `*` → NotFound

**Index Page (Landing):**
- Location: `src/pages/Index.tsx`
- Triggers: Route `/`
- Responsibilities: Compose all landing page sections in sequence

**NotFound Page:**
- Location: `src/pages/NotFound.tsx`
- Triggers: Route `*` (unmatched routes)
- Responsibilities: Display 404 message, log error to console, provide link back to home

## Error Handling

**Strategy:** Client-side error capture with user feedback via toast notifications

**Patterns:**
- Form validation errors: Captured before submission, displayed via toast.error()
- Network errors: Caught in try-catch, displayed as generic error toast
- Route errors: 404 page displayed for unmapped routes, error logged to console
- Toast errors are dismissible and auto-remove after timeout

Example from `ConsultationForm.tsx`:
- Invalid phone number → `toast.error("Số điện thoại không hợp lệ...")`
- Network failure → `toast.error("Lỗi kết nối, vui lòng thử lại.")`
- HTTP error response → `toast.error(`Gửi thất bại (${res.status})...`)`

## Cross-Cutting Concerns

**Logging:**
- Minimal logging; 404 errors logged to console.error() in `NotFound.tsx`
- No structured logging framework; direct console calls

**Validation:**
- Custom validators in `src/lib/validators.ts`
- Vietnamese phone number validation: `isValidVnPhone()` uses regex pattern
- Form submission blocked until validation passes

**Authentication:**
- Not yet implemented in current codebase
- Header includes login/register links that point to future routes (`/login`, `/register`)
- Protected routes not yet implemented; routing structure extensible for future auth

**Styling:**
- Tailwind CSS for utility-based styling
- CSS variables (HSL format) defined in `src/index.css` for theming
- Dark mode support via class strategy (`dark` class on root element)
- No component-scoped CSS; all styling via Tailwind utilities

---

*Architecture analysis: 2026-03-23*
