# Coding Conventions

**Analysis Date:** 2026-03-23

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Header.tsx`, `ClassGrid.tsx`)
- Utilities/hooks: kebab-case (e.g., `use-mobile.tsx`, `use-toast.ts`)
- Lib files: camelCase (e.g., `utils.ts`, `validators.ts`)
- Directory names: lowercase, semantic names (e.g., `components/ui/`, `components/landing/`, `hooks/`, `lib/`, `pages/`)

**Functions:**
- React components: PascalCase (arrow functions or function declarations)
- Helper functions: camelCase (e.g., `genId()`, `cn()`, `isValidVnPhone()`)
- Event handlers: `handle[Event]` pattern (e.g., `handleSubmit()`, `handleChange()`)
- State setters: standard React `set[State]` pattern (e.g., `setLoading()`, `setCourse()`)

**Variables:**
- React state: camelCase (e.g., `isMobile`, `mobileOpen`, `loading`, `course`)
- Constants: UPPER_SNAKE_CASE for module-level constants (e.g., `MOBILE_BREAKPOINT`, `TOAST_LIMIT`, `TOAST_REMOVE_DELAY`, `VN_PHONE_REGEX`)
- Regular variables: camelCase (e.g., `queryClient`, `navItems`, `data`)
- Private/internal methods: camelCase (e.g., `genId()`, `addToRemoveQueue()`)

**Types:**
- Interfaces: PascalCase prefixed with capital letter (e.g., `ButtonProps`, `ToasterToast`, `ToastActionElement`)
- Type aliases: PascalCase (e.g., `Action`, `State`, `Toast`)
- Union/enum names: PascalCase (e.g., `ActionType`)

## Code Style

**Formatting:**
- Installed but not enforced: Prettier (no `.prettierrc` file in repo)
- Default formatting appears to be 2-space indentation (inferred from code)
- Line length: No strict enforcement observed; code follows reasonable conventions

**Linting:**
- Tool: ESLint with TypeScript support (flat config in `eslint.config.js`)
- Strict rules: Uses recommended JavaScript and TypeScript rules
- Relaxed rules:
  - `@typescript-eslint/no-unused-vars`: **off** — unused variables/parameters permitted
  - React Hooks: `eslint-plugin-react-hooks` enabled with recommended rules
  - React Refresh: warns when exporting non-components from component files

**TypeScript:**
- Strict mode: **disabled** — `strict` not set in tsconfig
- `noImplicitAny`: **off** — allows implicit `any` types
- `noUnusedLocals`: **off** — unused local variables permitted
- `noUnusedParameters`: **off** — unused parameters permitted
- `strictNullChecks`: **false** — nullable types are not enforced
- `allowJs`: **true** — JavaScript files allowed in project
- Path alias: `@/` maps to `src/` (configured in `tsconfig.json` and `vitest.config.ts`)

## Import Organization

**Order:**
1. External library imports (React, React DOM, third-party packages)
2. shadcn/ui component imports
3. Custom hook imports
4. Utility imports (lib functions)
5. Component imports (from `components/`)

**Path Aliases:**
- Always use `@/` for internal imports: `@/components/`, `@/hooks/`, `@/lib/`
- Never use relative paths like `../` or `./`

**Example pattern from `src/components/landing/ConsultationForm.tsx`:**
```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { isValidVnPhone } from "@/lib/validators";
```

## Error Handling

**Patterns:**
- **Try-catch blocks**: Used for async operations that may fail (e.g., fetch requests in `ConsultationForm.tsx`)
- **Toast notifications**: Use `sonner` or `toast` (via `use-toast` hook) to display error messages to users
  - Error: `toast.error("message")`
  - Success: `toast.success("message")`
- **Validation**: Functions return boolean/validate inline (e.g., `isValidVnPhone()` returns boolean, validation happens before submission)
- **Component errors**: Throw errors with meaningful messages in context/hook setup (e.g., `throw new Error("useSidebar must be used within a SidebarProvider")` in `src/components/ui/sidebar.tsx`)
- **Logging**: `console.error()` used for client-side logging (e.g., 404 errors logged in `NotFound.tsx`)

**Example from `ConsultationForm.tsx`:**
```typescript
try {
  const res = await fetch(APPS_SCRIPT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    toast.success("Đã gửi yêu cầu tư vấn! Chúng tôi sẽ liên hệ sớm nhất.");
  } else {
    toast.error(`Gửi thất bại (${res.status}), vui lòng thử lại.`);
  }
} catch {
  toast.error("Lỗi kết nối, vui lòng thử lại.");
} finally {
  setLoading(false);
}
```

## Logging

**Framework:** `console` (browser console) + Sonner toast library for user-facing messages

**Patterns:**
- **Error logging**: `console.error()` used for debugging (e.g., 404 page logs failed route access)
- **User notifications**: Sonner `toast.error()`, `toast.success()` for actionable feedback
- **Debugging**: No debug-specific logging library in use; `console.log()` can be used ad-hoc

## Comments

**When to Comment:**
- Complex logic or non-obvious decisions get inline comments
- Comments explain "why" rather than "what"
- Minimal commenting style; code clarity is preferred

**JSDoc/TSDoc:**
- Not systematically used in custom code
- shadcn/ui components have inline comments explaining implementation details
- Example from `use-toast.ts`: `// ! Side effects ! - This could be extracted into a dismissToast() action, but I'll keep it here for simplicity`
- Example from `Header.tsx`: `{/* Desktop: grid 2 cols — logo spans 2 rows */}`

## Function Design

**Size:** Small, focused functions preferred
- Components typically 50–150 lines
- Helper functions 5–30 lines

**Parameters:**
- Destructure props in function signature when possible
- Use Rest operator (`...props`) to forward HTML attributes
- Typing: Always provide explicit types for function parameters in TSX/TS files

**Return Values:**
- React components return JSX.Element (implicit)
- Utilities return typed values: `boolean`, `string`, custom types
- Event handlers typically return `void` or return early with side effects

## Module Design

**Exports:**
- Default export for React components: `export default ComponentName`
- Named exports for utilities: `export function utilName()` or `export { utilName }`
- Constants exported with `export` keyword

**Example pattern from `Button.tsx`:**
```typescript
const buttonVariants = cva(...);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  // ...
});
Button.displayName = "Button";

export { Button, buttonVariants };
```

**Barrel Files:**
- Not heavily used; mostly explicit imports
- `components/ui/` contains individual component files, not index.ts re-exports

**Component exports:**
- Landing page components (`Header`, `ClassGrid`, `ConsultationForm`, etc.) are individual files
- Page components (`Index`, `NotFound`) exported as default

## Styling Conventions

**Tailwind CSS:**
- All styling uses Tailwind utility classes
- CSS variables defined in `src/index.css` for theming (HSL format)
- No scoped CSS modules or styled-components used

**Theme/Dark Mode:**
- CSS variable definitions in `:root` and `.dark` class
- `next-themes` package installed for theme management
- Class strategy used (not system preference)

**Component Library Integration:**
- shadcn/ui components use `cn()` utility (from `lib/utils.ts`) to merge class names
- `cn()` combines `clsx` + `tailwind-merge` to handle Tailwind conflicts safely
- All custom styling layered on top of shadcn/ui base classes

**Environment Configuration:**
- Vite environment variables accessed via `import.meta.env.VARIABLE_NAME`
- Example: `import.meta.env.BASE_URL`, `import.meta.env.VITE_APPS_SCRIPT_ENDPOINT`

---

*Convention analysis: 2026-03-23*
