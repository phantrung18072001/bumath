# Phase 11: Admin List Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 11-admin-list-pages
**Areas discussed:** Search scope (Users page), Filter state persistence, Test coverage

---

## Search Scope — Users Page

| Option | Description | Selected |
|--------|-------------|----------|
| full_name + phone | Search by display name OR phone number. Matches profiles table. UI-SPEC placeholder: 'Tìm theo tên hoặc số điện thoại…' | ✓ |
| full_name only | Simpler — just name search. | |
| full_name + phone + email (fetch from auth) | Would require Supabase admin query or RPC for auth.users email. More complex. | |

**User's choice:** full_name + phone (Recommended)
**Notes:** Requirements say "name/email" but profiles table doesn't store email directly. Phone is the practical search field alongside name.

---

## Filter State Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Local state — resets on navigation | useState in each page component. Simple, fast. Resets when admin navigates away. UI-SPEC specifies this. | ✓ |
| URL query params — survives navigation | ?role=teacher&search=nguyen. Back button restores state. More complex (useSearchParams + sync). | |

**User's choice:** Local state — resets on navigation (Recommended)
**Notes:** URL params can be added in a later polish phase if admin workflows prove it's needed.

---

## Test Coverage

| Option | Description | Selected |
|--------|-------------|----------|
| Update existing tests — add filter/pagination cases | Extend current test files with search/filter/pagination/empty-state cases. | ✓ |
| New test files only for filter logic | Separate test files for filter utilities. Leave existing page tests unchanged. | |
| Manual QA / UAT only | Rely on UAT. Skip new vitest tests. | |

**User's choice:** Update existing tests — add filter/pagination cases (Recommended)
**Notes:** Maintain consistency with existing test style. Extend UsersPage.test.tsx and CoursesPage.test.tsx.

---

## Claude's Discretion

- Exact pagination ellipsis rendering — follow shadcn Pagination conventions + UI-SPEC
- Error state position and styling — follow UI-SPEC copywriting contract
- Toolbar flex layout details — follow UI-SPEC toolbar layout exactly

## Deferred Ideas

- URL query params for filter state — can be added in a later polish phase
- Email search on UsersPage — would require auth.users join, deferred
- "Install all shadcn/radix components" todo — all needed components already installed, not actionable for Phase 11
