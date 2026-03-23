# Codebase Concerns

**Analysis Date:** 2026-03-23

## Tech Debt

**Hardcoded Placeholder Phone Number:**
- Issue: Placeholder phone number `0123.456.789` is hardcoded in multiple locations without environment variable
- Files: `src/components/landing/Header.tsx` (lines 41, 112), `src/components/landing/Footer.tsx` (line 51)
- Impact: Phone number cannot be changed without modifying source code; difficult to maintain multiple contact numbers for different regions
- Fix approach: Extract phone number to environment variable `VITE_PHONE_NUMBER` in `.env` file and reference throughout codebase

**Missing Environment Variable Validation:**
- Issue: `VITE_APPS_SCRIPT_ENDPOINT` is cast to string without validation; will fail silently if not provided
- Files: `src/components/landing/ConsultationForm.tsx` (line 10)
- Impact: Form submission will fail with unclear error message if environment variable is missing; no early warning during build
- Fix approach: Add validation at app startup (in `src/main.tsx` or `src/App.tsx`) to throw error if required env vars are missing

**Overly Permissive TypeScript Configuration:**
- Issue: Multiple strict checks disabled: `noImplicitAny: false`, `noUnusedLocals: false`, `noUnusedParameters: false`, `strictNullChecks: false`
- Files: `tsconfig.json` (lines 9, 10, 13, 14)
- Impact: Allows code with implicit any types, unused variables, unused parameters, and null/undefined issues to pass CI without warnings
- Fix approach: Progressively enable strict checks starting with `noImplicitAny: true` and `strictNullChecks: true`

**ESLint Unused Variables Rule Disabled:**
- Issue: `@typescript-eslint/no-unused-vars` rule is explicitly disabled in ESLint config
- Files: `eslint.config.js` (line 23)
- Impact: Dead code and unused imports accumulate; makes refactoring harder; increases bundle size
- Fix approach: Enable the rule and run `yarn lint --fix` to clean up, then keep enabled for future

## Missing Critical Features

**No Error Boundary:**
- Problem: Application lacks error boundary to catch runtime errors in React components
- Files: `src/App.tsx`, entire app
- Blocks: Unhandled errors will crash entire application for users; no graceful fallback UI
- Recommendation: Implement React Error Boundary component wrapping main app content to display fallback UI on error

**No Input Validation Beyond Phone:**
- Problem: Form fields in `src/components/landing/ConsultationForm.tsx` (lines 77-80) have minimal validation - only required attribute and phone regex
- Files: `src/components/landing/ConsultationForm.tsx` (lines 77-80)
- Blocks: Invalid data (e.g., future birth year, invalid course selection) can be submitted to Google Apps Script
- Recommendation: Add Zod validation schema for form submission to validate: `nam_sinh` (valid year range), `luc_hoc` (non-empty), `course` (required before submit)

**No Loading State Feedback for External Links:**
- Problem: Navigation links to unimplemented routes (e.g., `/class/lop-7`, `/register`, `/login`) will fail silently or show 404
- Files: `src/components/landing/Header.tsx` (lines 50, 55, 60), `src/components/landing/ClassGrid.tsx` (line 34), `src/components/landing/HeroSection.tsx` (line 55)
- Blocks: Users cannot navigate to key sections (registration, class pages, login)
- Recommendation: Either implement these route pages or update links to point to valid pages

## Test Coverage Gaps

**No Component Tests:**
- What's not tested: React components (landing page sections, header, form)
- Files: `src/components/landing/`, `src/components/ui/` (minus generated UI components)
- Risk: UI bugs in header navigation, form submission, or layout changes go undetected; regressions on mobile/desktop breakpoints possible
- Priority: High

**No Integration Tests for Form Submission:**
- What's not tested: ConsultationForm submission flow, including API call to Google Apps Script
- Files: `src/components/landing/ConsultationForm.tsx`
- Risk: Form validation logic, network error handling, or toast notifications may break without detection
- Priority: High

**Only Placeholder Test File:**
- What's not tested: Actual application logic (utility functions, validators, hooks)
- Files: `src/test/example.test.ts` (placeholder test that always passes)
- Risk: Test suite exists but provides zero coverage; CI will pass with failing code
- Priority: High

**No Hook Tests:**
- What's not tested: `useIsMobile()` and custom toast hook behavior
- Files: `src/hooks/use-mobile.tsx`, `src/hooks/use-toast.ts`
- Risk: Responsive behavior and toast notifications may break on specific viewport sizes or in specific scenarios
- Priority: Medium

## Security Considerations

**Unvalidated Environment Variable Usage:**
- Risk: If `VITE_APPS_SCRIPT_ENDPOINT` environment variable is compromised or modified, form data goes to attacker-controlled endpoint
- Files: `src/components/landing/ConsultationForm.tsx` (line 37)
- Current mitigation: Vite's build-time env var injection (cannot be modified at runtime)
- Recommendations:
  1. Add URL validation to ensure endpoint is from expected domain before fetch
  2. Document in CLAUDE.md that `VITE_APPS_SCRIPT_ENDPOINT` must be verified to be your own Google Apps Script

**Unhandled Network Errors:**
- Risk: Generic "Lỗi kết nối, vui lòng thử lại" message hides actual errors; could mask security-related failures
- Files: `src/components/landing/ConsultationForm.tsx` (lines 50-51)
- Current mitigation: None; only catch-all error handler
- Recommendations: Log detailed error to server-side logging; implement retry logic with exponential backoff

**No Rate Limiting on Form Submission:**
- Risk: User could submit form rapidly, potentially overwhelming Google Apps Script or being used for spam
- Files: `src/components/landing/ConsultationForm.tsx` (line 12)
- Current mitigation: Only UI-level loading state prevents double-clicks
- Recommendations: Implement client-side rate limiting (e.g., cooldown timer) and consider server-side rate limiting via Apps Script

## Fragile Areas

**Mobile Navigation Menu State:**
- Files: `src/components/landing/Header.tsx` (lines 15, 90-130)
- Why fragile: Manual state management with `mobileOpen` useState; no cleanup on route change means menu could remain open when navigating
- Safe modification: Add cleanup logic on `Link` click to close menu; consider using layout effect to handle window resize transitions
- Test coverage: No tests for mobile menu open/close behavior

**Form Submission Error Handling:**
- Files: `src/components/landing/ConsultationForm.tsx` (lines 36-54)
- Why fragile: Try-catch only wraps fetch; doesn't validate response body structure or handle specific HTTP error codes
- Safe modification: Add response validation (check for expected status codes), add timeout handling, implement retry logic
- Test coverage: No tests for form submission scenarios

**Hardcoded Class Data in ClassGrid:**
- Files: `src/components/landing/ClassGrid.tsx` (lines 6-10)
- Why fragile: Class levels (7, 8, 9) and course counts hardcoded; change requires code modification
- Safe modification: Extract to configuration constant in separate file or move to environment variable for centralized management
- Test coverage: No tests for class data structure

## Performance Bottlenecks

**No Code Splitting for Landing Page:**
- Problem: All components loaded eagerly even though many routes (e.g., `/class/*`, `/register`, `/login`) don't exist yet
- Files: `src/App.tsx`, all landing components
- Cause: React Router routes all import components statically; no lazy loading implemented
- Improvement path: Use React.lazy() and Suspense for future route pages to reduce initial bundle size

**Multiple Image Loads Without Optimization:**
- Problem: `bumath.jpeg` image loaded 3 times (Header desktop, Header mobile, Footer) without caching strategy
- Files: `src/components/landing/Header.tsx` (lines 28, 85), `src/components/landing/Footer.tsx` (line 12)
- Cause: Image referenced via BASE_URL string concatenation in multiple components; no image optimization or CDN
- Improvement path: Extract image src to constant, use image optimization (e.g., next/image equivalent), cache headers on static assets

**No Memoization on Expensive Renders:**
- Problem: `TestimonialsSection` renders testimonials array without React.memo, could re-render on parent changes
- Files: `src/components/landing/TestimonialsSection.tsx` (lines 43-72)
- Cause: Components not memoized even though data is static
- Improvement path: Wrap with React.memo(), consider useMemo for static feature/testimonial arrays

## Dependencies at Risk

**Google Apps Script Dependency Without Fallback:**
- Risk: Form submission entirely depends on external Google Apps Script endpoint; no fallback or alternative method to capture lead data
- Impact: If Apps Script is down or quota exceeded, all form submissions fail; no way to recover data
- Migration plan:
  1. Add fallback to store form data in localStorage temporarily
  2. Implement alternative submission method (e.g., email via Formspree, or custom backend endpoint)
  3. Add retry queue to retry failed submissions

**Strict Version Lock on UI Dependencies:**
- Risk: Caret (^) and tilde (~) version specifiers allow breaking changes in shadcn/ui Radix primitives
- Impact: Automated dependency updates could break UI components without warning
- Migration plan: Either pin exact versions for critical UI dependencies or implement visual regression testing in CI

## Known Issues

**Console Error Logging in Production:**
- Symptoms: 404 errors logged to console via `console.error()` even in production builds
- Files: `src/pages/NotFound.tsx` (line 8)
- Trigger: Navigate to any undefined route (e.g., `/nonexistent`)
- Workaround: None; error will always be logged; cannot be disabled in production
- Recommendation: Remove console.error or wrap in development check using `import.meta.env.DEV`

**Mobile Menu Never Closes on Route Change:**
- Symptoms: Mobile navigation menu stays open after clicking a navigation link
- Files: `src/components/landing/Header.tsx` (line 104)
- Trigger: Click any navigation link on mobile, then menu stays open
- Workaround: Click hamburger again to close manually
- Recommendation: Add `onClick={() => setMobileOpen(false)}` to Link elements or use route change listener

---

*Concerns audit: 2026-03-23*
