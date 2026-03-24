# Phase 2: Auth & Access Control - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 02-auth-access-control
**Areas discussed:** Registration form, Admin approval panel, Pending screen UX

---

## Registration Form

| Option | Description | Selected |
|--------|-------------|----------|
| Email + password only | Minimal friction | |
| Email + password + full name | Admin sees real names | |
| Email + password + name + grade | Richest data at sign-up | |
| **Phone + custom fields** | User specified: số điện thoại, tên học sinh, năm sinh, địa chỉ, mật khẩu | ✓ |

**User's choice:** Free text — "Form đăng ký bao gồm: số điện thoại, tên học sinh, năm sinh, địa chỉ, mật khẩu"

**Notes:** User chose phone number as the primary login identifier (not email). This changes AUTH-01 from email+password → phone+password. Supabase phone auth (password-based, no OTP/SMS).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated /register page | Clean URL, browser back works | ✓ |
| Modal/dialog from landing page | Reuses Dialog component | |

**User's choice:** Dedicated /register page

---

| Option | Description | Selected |
|--------|-------------|----------|
| Replace landing page header placeholders | Wire up existing placeholder buttons | ✓ |
| Separate auth layout | Keep landing page untouched | |
| Landing page stays static | Auth is standalone /app/login | |

**User's choice:** Replace landing page header placeholders

---

## Admin Approval Panel

| Option | Description | Selected |
|--------|-------------|----------|
| /admin/pending dedicated page | Simple, bookmarkable | |
| Full /admin dashboard | Sidebar/tabs structure | |
| **User management table** | /admin/users with status column and pending tab | ✓ |

**User's choice:** Free text — "Tôi nghĩ là có một bảng quản lý user, có status và thông tin người dùng, có tab pending request ở màn hình đấy"

**Notes:** A proper user management table at /admin/users with tab filtering (all / pending).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Name + phone + year of birth + address | All registration fields | ✓ |
| Name + phone only | Minimal | |
| Full profile + timestamp | With registration time | |

**User's choice:** All registration fields

---

| Option | Description | Selected |
|--------|-------------|----------|
| Approve or Reject only | Simple binary | ✓ |
| Approve + assign grade/class | Sets grade during approval | |
| Approve + reject + send message | More complex | |

**User's choice:** Approve or Reject only

---

## Pending Screen UX

| Option | Description | Selected |
|--------|-------------|----------|
| Simple waiting screen with contact info | Card with 24h message + Zalo contact | ✓ |
| Minimal — just a message | One-line text | |

**User's choice:** Simple waiting screen with contact info

---

| Option | Description | Selected |
|--------|-------------|----------|
| Show rejection message | "Tài khoản bị từ chối. Vui lòng liên hệ..." | ✓ |
| Silently block login | Generic error | |

**User's choice:** Show rejection message

---

## Claude's Discretion

- Auth context provider architecture (React Context vs. TanStack Query)
- Loading state on page refresh during session check
- Phone number E.164 coercion implementation (+84 prefix)
- Supabase phone provider configuration details

## Deferred Ideas

- Email verification — not applicable (phone auth chosen)
- Grade/class assignment during approval — Phase 3
- Admin messaging to rejected students — Zalo contact sufficient for v1
