# Repository Guidelines

## Project Structure & Module Organization

This is a Vite, React, TypeScript, Tailwind CSS, and shadcn-ui application. Main source files live in `src/`; static assets live in `public/`. Route-level screens are in `src/pages`, grouped by audience (`admin`, `student`) where needed. Reusable UI primitives are in `src/components/ui`, while domain components are split across `src/components/admin`, `src/components/student`, `src/components/auth`, `src/components/landing`, and `src/components/shared`. API and utility code belongs in `src/lib`, with Supabase-facing modules under `src/lib/api`. Tests are colocated with implementation as `*.test.ts` or `*.test.tsx`, plus shared test setup in `src/test/setup.ts`.

## Build, Test, and Development Commands

Use the package manager already configured for the repo, preferably Yarn 4.

- `yarn install` installs dependencies.
- `yarn dev` starts the local Vite development server.
- `yarn build` creates a production build in `dist/`.
- `yarn build:dev` builds with Vite development mode.
- `yarn preview` serves the built app locally.
- `yarn lint` runs ESLint across the repository.
- `yarn test` runs Vitest once.
- `yarn test:watch` runs Vitest in watch mode.

Equivalent `npm run ...` commands generally work, but avoid mixing lockfile updates unless intentional.

## Coding Style & Naming Conventions

Write React components in TypeScript with `.tsx` files and use the `@/` alias for imports from `src` when it improves readability. Follow existing formatting: two-space indentation, double quotes, semicolons, and functional React components. Keep component files in PascalCase (`AdminLayout.tsx`), hooks in camelCase starting with `use` (`use-mobile.tsx` exports `useMobile`), and library helpers in descriptive kebab or camel case (`slugify.ts`, `validators.ts`). Prefer Tailwind utility classes and existing shadcn/Radix primitives over custom widget implementations.

## Testing Guidelines

Vitest runs in `jsdom` with Testing Library matchers from `src/test/setup.ts`. Add tests next to the code they cover using `ComponentName.test.tsx` or `helper.test.ts`. Mock Supabase and browser APIs when behavior depends on external services. Run `yarn test` before submitting changes; run `yarn lint` for TypeScript and React Hooks rule coverage.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style messages such as `feat(chat): implement reply threading in UI`, `fix: replace solid bg-white...`, and `docs(20): research phase...`. Use `feat`, `fix`, `docs`, `test`, `refactor`, or `chore`, with an optional scope. PRs should include a short behavior summary, test results, linked issue or planning reference when applicable, and screenshots for visible UI changes.

## Security & Configuration Tips

Copy `.env.example` to a local env file and provide `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APPS_SCRIPT_ENDPOINT` as needed. Do not commit real secrets or local credentials.
