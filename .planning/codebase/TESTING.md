# Testing Patterns

**Analysis Date:** 2026-03-23

## Test Framework

**Runner:**
- Vitest 3.2.4
- Config: `vitest.config.ts`

**Environment:**
- jsdom (browser-like environment)
- Globals enabled — `describe`, `it`, `expect` available without imports

**Assertion Library:**
- Vitest built-in assertions (Jest-compatible)
- Testing Library matchers via `@testing-library/jest-dom` (v6.6.0)

**Run Commands:**
```bash
yarn test              # Run all tests once
yarn test:watch        # Watch mode (re-run on file changes)
```

## Test File Organization

**Location:**
- Co-located with source code in `src/` directory
- Pattern: `src/**/*.{test,spec}.{ts,tsx}`

**Naming:**
- `.test.ts` or `.test.tsx` suffix (or `.spec.ts`/`.spec.tsx`)
- Example: `src/test/example.test.ts`

**Structure:**
```
src/
├── test/
│   ├── setup.ts          # Vitest setup file
│   └── example.test.ts   # Example test
├── components/           # Component files go here; colocate tests
├── hooks/
├── lib/
└── pages/
```

## Test Configuration

**Setup File:**
- Path: `src/test/setup.ts`
- Imports: `@testing-library/jest-dom` for extended matchers
- Polyfills: Defines `window.matchMedia` for component tests (required for Radix/shadcn)

**Example setup (`src/test/setup.ts`):**
```typescript
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
```

## Test Structure

**Suite Organization:**
```typescript
describe("feature name", () => {
  it("should do something specific", () => {
    // arrange
    // act
    // assert
  });
});
```

**Patterns:**
- Use `describe()` to group related tests
- Use `it()` for individual test cases
- Follow AAA pattern: Arrange → Act → Assert
- No explicit setup/teardown observed in example

**Example from `src/test/example.test.ts`:**
```typescript
import { describe, it, expect } from "vitest";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
```

## Mocking

**Framework:** Not explicitly used in visible tests

**Patterns:**
- No mocking examples found in current test suite
- When needed: Vitest supports `vi.mock()` and `vi.spyOn()` (compatible with Jest API)
- Testing Library provides built-in utilities for mocking DOM interactions

**What to Mock (based on patterns seen in source):**
- External API calls (e.g., fetch in `ConsultationForm.tsx`)
- Environment variables (`import.meta.env`)
- External services (toast notifications, routing)

**What NOT to Mock:**
- React component rendering
- User interactions (use Testing Library queries instead)
- Built-in browser APIs (unless polyfilling for test environment, like `matchMedia`)

## Fixtures and Factories

**Test Data:**
- No fixture/factory pattern currently visible in repo
- Static test data defined inline in test files recommended

**Location (when used):**
- Could be created in `src/test/fixtures/` or similar
- Or inline with test for small datasets

## Coverage

**Requirements:** No coverage enforcement detected
- No coverage thresholds in vitest.config.ts
- No coverage reporting tool configured

**View Coverage (when needed):**
```bash
yarn test -- --coverage  # If coverage reporter installed
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and small components
- Approach: Test pure functions (validators, utilities) with direct input/output
- Example: Testing `isValidVnPhone()` with valid/invalid phone strings

**Integration Tests:**
- Scope: Multiple components working together, API interactions
- Approach: Test component behavior with real event handlers and state updates
- Example: Testing `ConsultationForm.tsx` form submission with mock fetch

**E2E Tests:**
- Framework: Not used
- Note: For E2E, would typically use Playwright or Cypress (not configured)

## Common Patterns

**Async Testing:**
```typescript
it("should handle async operations", async () => {
  // Vitest handles async/await automatically
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

**Error Testing:**
```typescript
it("should throw an error when context not provided", () => {
  expect(() => {
    // Call hook/component outside provider
  }).toThrow("Error message");
});
```

**React Component Testing:**
```typescript
import { render, screen } from "@testing-library/react";

it("should render button", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
});
```

**User Interactions:**
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("should call onClick handler", async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();

  render(<Button onClick={handleClick}>Click</Button>);
  await user.click(screen.getByRole("button"));

  expect(handleClick).toHaveBeenCalled();
});
```

## Testing Best Practices (Observed & Recommended)

**Query Priority (Testing Library):**
1. `getByRole()` — preferred for accessibility
2. `getByLabelText()` — for form labels
3. `getByPlaceholderText()` — for input placeholders
4. `getByText()` — general content
5. Avoid `querySelector()` or test implementation details

**Globals Usage:**
- `describe`, `it`, `expect` are globally available (no imports needed)
- Vitest provides `vi.fn()`, `vi.mock()` in global scope

**File Placement:**
- For `Header.tsx` at `src/components/landing/Header.tsx`, create test at `src/components/landing/Header.test.tsx`
- Alternative: Create `src/components/landing/__tests__/Header.test.tsx` subdirectory if many tests per file

**Running Specific Tests:**
```bash
yarn test src/components/landing/Header.test.tsx     # Single file
yarn test --grep "button click"                       # Pattern matching
```

## Current Test Status

**Example Test:**
- Location: `src/test/example.test.ts`
- Status: Baseline test (verifies test runner works)
- Content: Simple `expect(true).toBe(true)` assertion

**Coverage Gaps:**
- No tests for component rendering
- No tests for form submission logic
- No tests for hooks (`useIsMobile`, `useToast`)
- No tests for utilities (`isValidVnPhone`, `cn`)
- No tests for API integration

---

*Testing analysis: 2026-03-23*
