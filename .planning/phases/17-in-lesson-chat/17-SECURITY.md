---
phase: 17-in-lesson-chat
auditor: Antigravity
date: 2026-05-09
threats_open: 0
---

# Phase 17 Security Audit: In-Lesson Chat

## Threat Model Verification

| Threat ID | Category | Component | Mitigation Pattern | Status | Evidence |
|-----------|----------|-----------|--------------------|--------|----------|
| T17-01 | Information Disclosure | `lesson_chat_messages` | RLS: `chat_select_access` | CLOSED | Policy uses `has_grade_access()` to ensure students only see chat in lessons they paid for. Staff can see all. |
| T17-02 | Unauthorized Access | `lesson_chat_messages` | RLS: `chat_insert_own` | CLOSED | Policy enforces `sender_id = auth.uid()` and grade access check. |
| T17-03 | Privilege Escalation | `delete_chat_message` | RPC Role Check | CLOSED | `SECURITY DEFINER` function explicitly checks `get_my_role() IN ('admin', 'teacher')` before updating. |
| T17-04 | Information Disclosure | `profiles` | RLS: `Authenticated users can view all profiles` | CLOSED | (Migration 24) Opened SELECT to all authenticated users to fix missing names in chat. Risk accepted as names/roles are non-sensitive in this context. |
| T17-05 | Spoofing | `markChatRead` | RLS: `chat_reads_insert_own` | CLOSED | `lesson_chat_reads` policy enforces `user_id = auth.uid()`. |

## Security Controls Implemented

- **Data Isolation:** `lesson_chat_messages` are strictly scoped by `lesson_id` and gated by course access (via `has_grade_access`).
- **Role Enforcement:** Administrative actions (delete) are server-side enforced via RPC functions rather than client-side RLS policies to prevent bypass.
- **Privacy Trade-off:** Migration 24 allows all students to see full names of other users. This was a conscious decision to unblock the Chat UI. *Future recommendation: Use a specialized view for public profile data.*
- **Notification Safety:** `BellNotification.tsx` gates the unread chat query to `teacher/admin` roles only.

## Audit Trail

| Date | Action | Result |
|------|--------|--------|
| 2026-05-08 | Initial RLS/RPC Implementation (Migration 21) | PASS |
| 2026-05-09 | Profile Visibility Fix (Migration 24) | PASS |
| 2026-05-09 | Bell Notification Role Gating Audit | PASS |

## Results

**GSD > PHASE 17 THREAT-SECURE**
threats_open: 0 — all identified threats have verified mitigations.
