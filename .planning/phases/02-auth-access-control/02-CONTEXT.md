# Phase 2: Auth & Access Control - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver user authentication with role-based access control and an admin approval gate.
Users can register with phone + password, log in, maintain sessions, and access only
areas permitted by their role. Admin can view and act on pending account requests.
All UI text is in Vietnamese.

> **Requirement update:** AUTH-01 changes from email+password → phone+password.
> Login identifier is the student's phone number (E.164 format, e.g. +84901234567).
> No email involved in the auth flow.

</domain>

<decisions>
## Implementation Decisions

### Registration Form
- **D-01:** Login identifier is visually **phone number + password** for the user. However, to bypass Supabase's requirement for a paid SMS provider, we will under-the-hood map the phone number to a dummy email (e.g., `[phone_number]@bumath.local`) and use Supabase's standard Email+Password authentication natively.
- **D-02:** Registration fields: `số điện thoại` (E.164), `tên học sinh`, `năm sinh`, `địa chỉ`, `mật khẩu`.
- **D-03:** Registration lives on a dedicated `/register` page (not a modal). A `/login` page exists alongside it.
- **D-04:** The existing landing page Header placeholder buttons are wired up to `/login` and `/register` routes — no separate auth layout; the header is the entry point.

### Admin Approval Panel
- **D-05:** Admin user management lives at `/admin/users` — a table with a status column and a "Chờ duyệt" tab for pending accounts.
- **D-06:** Each row shows: tên học sinh, số điện thoại, năm sinh, địa chỉ, trạng thái (pending / approved / rejected).
- **D-07:** Admin actions on pending accounts: **Approve** or **Reject** only (binary, no grade assignment at this phase).

### Pending & Rejected State UX
- **D-08:** After registering, students land on a "pending" screen — a card with:
  - "Tài khoản đang chờ xét duyệt"
  - Processing time note (24h)
  - Zalo contact info for the admin
  - Đăng xuất button
- **D-09:** Rejected students who log in see: "Tài khoản bị từ chối. Vui lòng liên hệ để biết thêm." — same layout as pending screen but with rejection wording.
- **D-10:** Both pending and rejected users are blocked from accessing any course content — the pending/rejected screen is the only thing they see after login.

### Route Protection
- **D-11:** Role-based routing is enforced: students without approval cannot reach course pages, teachers/admins have separate accessible routes.
- **D-12:** RLS policies in Supabase enforce data isolation (students cannot see each other's data).

### Claude's Discretion
- Auth context provider architecture (React Context vs. TanStack Query for session state) — Claude decides the most appropriate pattern.
- Loading state during session check on page load — Claude decides (spinner, skeleton, or instant redirect).
- Phone-to-email conversion logic will be handled cleanly on the client side before calling Supabase auth methods. No need to enable Phone provider in Supabase.
- Phone number format validation (E.164 coercion, +84 prefix handling for Vietnamese numbers) — Claude decides implementation.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-05, ROLE-01 through ROLE-03, UX-03
- `.planning/PROJECT.md` — Constraints section (stack, Supabase backend, Vietnamese UI)
- `.planning/ROADMAP.md` §Phase 2 — Success criteria (6 items) and depends-on chain

### Existing Code
- `src/lib/supabase.ts` — Supabase client singleton (already has persistSession, autoRefreshToken, detectSessionInUrl)
- `src/App.tsx` — Current routing setup (React Router v6, BrowserRouter with basename)
- `src/components/landing/Header.tsx` — Contains placeholder login/register buttons to wire up

No external specs or ADRs — all decisions are captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx` — Card component for the pending/rejected screen layout
- `src/components/ui/button.tsx` — Button for Đăng xuất and form submit
- `src/components/ui/form.tsx` + `src/components/ui/input.tsx` + `src/components/ui/label.tsx` — shadcn form primitives for login/register forms
- `src/components/ui/table.tsx` — Admin user management table
- `src/components/ui/badge.tsx` — Status badges (Chờ duyệt / Đã duyệt / Từ chối)
- `src/components/ui/tabs.tsx` — Tabs for the admin user management page

### Established Patterns
- React Hook Form + Zod already used in `src/components/landing/ConsultationForm.tsx` — follow same form pattern
- TanStack Query available for server state (session, user data)
- Tailwind CSS + CSS variables for theming
- Font: "Be Vietnam Pro" already loaded — Vietnamese characters render correctly

### Integration Points
- `src/App.tsx` — Add `/login`, `/register`, `/admin/users`, `/pending` routes + protected route wrappers
- `src/components/landing/Header.tsx` — Wire up placeholder login/register buttons
- `src/lib/supabase.ts` — Auth calls go through this singleton

</code_context>

<specifics>
## Specific Ideas

- Admin contact: Zalo phone number shown on the pending screen — the exact number should be configurable (env variable or hardcoded constant in Phase 2, not a DB setting).
- Phone numbers: Vietnamese numbers start with 0 (local), must be converted to +84 format for Supabase E.164. The registration form should handle this coercion transparently.

</specifics>

<deferred>
## Deferred Ideas

- Email verification — skipped by user (not needed; dummy emails are used under the hood, so no real email verification is possible or needed)
- Grade/class assignment during approval — deferred to Phase 3 (enrollment management)
- Admin messaging to rejected students — deferred; contact via Zalo is sufficient for v1

</deferred>

---

*Phase: 02-auth-access-control*
*Context gathered: 2026-03-24*
