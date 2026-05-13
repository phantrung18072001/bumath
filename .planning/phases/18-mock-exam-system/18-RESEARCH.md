# Phase 18: Mock Exam System - Research

**Researched:** 2026-05-13
**Domain:** Timed mock exam system (Supabase RLS/RPC + React Query + KaTeX rendering)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Cấu trúc đề thi & câu hỏi
- **D-01:** Phase 18 chỉ dùng câu hỏi trắc nghiệm 1 đáp án đúng (A/B/C/D).
- **D-02:** Nội dung câu hỏi hỗ trợ text + LaTeX + ảnh minh họa.
- **D-03:** Thứ tự câu hỏi cố định theo thứ tự admin cấu hình (không random).
- **D-04:** Khi đợt thi đã bắt đầu, khóa chỉnh sửa bộ câu hỏi để đảm bảo công bằng.

### Timing, reconnect, one-attempt
- **D-05:** Timer của học sinh bắt đầu khi bấm “Bắt đầu thi” lần đầu (lưu mốc bắt đầu theo attempt).
- **D-06:** Khi hết giờ, hệ thống tự động submit các đáp án hiện có.
- **D-07:** Nếu F5/mất mạng: cho vào lại khi chưa nộp và chưa quá `ends_at`, đồng thời khôi phục bài làm tạm.
- **D-08:** One-attempt được tính từ thời điểm bắt đầu thi: đã có attempt thì chặn bắt đầu lần 2.

### Chấm điểm & hiển thị kết quả
- **D-09:** Trả điểm ngay sau khi nộp bài thành công.
- **D-10:** Học sinh thấy tổng điểm + trạng thái đúng/sai từng câu, không lộ đáp án chuẩn.
- **D-11:** Hiển thị cả raw score (số câu đúng) và điểm quy đổi thang 10.
- **D-12:** Server chỉ chấp nhận submit hợp lệ trước `ends_at`; quá hạn trả lỗi rõ ràng.

### Luồng quản trị đợt thi
- **D-13:** Session có vòng đời `draft` → `published` → `closed` (đóng theo thời gian).
- **D-14:** Chỉ được publish khi có ít nhất 1 câu và mỗi câu có đáp án đúng hợp lệ.
- **D-15:** Session đã publish nhưng chưa bắt đầu được phép chỉnh sửa đầy đủ.
- **D-16:** Chỉ cho xóa session khi chưa có học sinh bắt đầu làm.

### Claude's Discretion
- Chi tiết UX countdown, cảnh báo còn ít thời gian, và cách hiển thị trạng thái auto-submit.
- Chi tiết kỹ thuật autosave câu trả lời (interval/debounce) miễn đảm bảo phục hồi ổn định sau reconnect.
- Cách tổ chức API layer và phân tách query keys theo pattern hiện tại của codebase.

### Deferred Ideas (OUT OF SCOPE)
## Deferred Ideas

- Todo đã review nhưng không fold vào Phase 18: **"Install all shadcn/radix components"** (`2026-04-27-install-all-shadcn-radix-components.md`) — lệch scope exam domain.
- Trắc nghiệm + tự luận/upload ảnh trong mock exam — để phase mở rộng sau khi flow trắc nghiệm ổn định.
- Admin reset attempt thủ công — deferred cho EXAM-ADV/v4.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXAM-01 | Admin tạo đợt thi thử (tên, loại, start/end) | Session schema + lifecycle constraints + publish guards + admin API/page structure |
| EXAM-02 | Admin thêm câu hỏi text/LaTeX/ảnh + đáp án | Question/answer table split + KaTeX rendering + storage path and validation pattern |
| EXAM-03 | Học sinh thấy đợt đang mở và vào làm bài | Server-side `open session` filters + student list/attempt pages + reconnect policy |
| EXAM-04 | Mỗi học sinh chỉ nộp 1 lần/đợt | `UNIQUE(exam_session_id, user_id)` + start-time attempt lock + idempotent submit RPC |
| EXAM-05 | Xem điểm ngay sau khi nộp | Security-definer grading RPC returns score payload only |
| EXAM-06 | Deadline từ DB `ends_at`, không theo local clock | Submit RPC enforces `now() <= ends_at` and rejects late requests |
</phase_requirements>

## Summary

Phase 18 should follow the existing repository pattern: thin React client + `src/lib/api/*` wrappers + security-critical enforcement in Postgres (RLS, constraints, and `SECURITY DEFINER` RPC). The one-attempt rule and deadline rule must be database-enforced, not UI-enforced.

The architecture should separate exam metadata, student attempts, question content, and answer keys. Keep answer keys in a separate table not readable by student role; only grading RPC reads them and returns aggregate scoring + per-question correctness booleans.

For UI/UX, use existing student/admin shells and TanStack Query mutation/query patterns already used in course/submission/chat flows. KaTeX integration is straightforward with `react-katex` + KaTeX CSS import, with parse-fallback handling for malformed formulas in admin-authored content.

**Primary recommendation:** Implement grading and rule enforcement as a single transactional RPC path (`start_attempt`, `autosave`, `submit_and_grade`) guarded by RLS and unique constraints.

## Project Constraints (from CLAUDE.md)

- Use Yarn 4 (`yarn`, not `npm`) for project commands.
- Do not modify files inside `src/components/ui/` manually; use shadcn CLI for UI primitives.
- Prefer shadcn/Radix primitives before custom UI widgets.
- Maintain viewport shell rules (`h-screen`, `overflow-hidden`, `main` scroll ownership).
- Keep React Query as server-state layer, consistent with existing architecture.
- Use existing test stack (Vitest + RTL + jsdom, `src/test/setup.ts`).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | `2.78.0` (project-pinned) | DB access + RPC from client | Existing repo standard; phase needs RPC + RLS-compatible access |
| PostgreSQL (Supabase) | managed | Authoritative rule enforcement | Required for one-attempt uniqueness and server-side deadline checks |
| `@tanstack/react-query` | `5.83.0` (project), `5.100.10` latest | Query/mutation orchestration | Already used app-wide; enables retry/state handling and cache invalidation |
| `react-katex` + `katex` | `3.1.0` + `0.16.45` latest | Render LaTeX in questions | Roadmap explicitly depends on these packages |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | `3.25.76` | Input validation for admin question/session forms | Validate payload before mutation calls |
| shadcn/Radix components | repo-installed | Table/form/dialog/alert/select UI | Admin authoring and student exam UI |
| Supabase Storage | managed | Question image attachments | For EXAM-02 image support |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-katex` | markdown-it/mathjax pipeline | Much heavier and unnecessary for current scope |
| DB RPC grading | client-side grading | Violates EXAM-06 and answer secrecy/security model |

**Installation:**
```bash
yarn add katex react-katex
```

**Version verification:**
- `katex`: `0.16.45` (published 2026-04-05 via `npm view`)
- `react-katex`: `3.1.0` (published 2025-05-09 via `npm view`)
- `@tanstack/react-query`: latest `5.100.10` (published 2026-05-11 via `npm view`)
- `@supabase/supabase-js`: project pinned `2.78.0` (published 2025-10-30), latest registry is higher

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── lib/api/exams.ts                 # sessions/questions/attempt RPC wrappers
├── pages/admin/ExamSessionsPage.tsx # admin list/create/publish
├── pages/admin/ExamSessionDetailPage.tsx # question authoring
├── pages/student/MockExamsPage.tsx  # open sessions list + status
├── pages/student/MockExamAttemptPage.tsx # attempt UI + timer + autosave
└── components/student/              # countdown, question card, submit panel
supabase/migrations/
└── 2026xxxx_exam_system.sql         # schema, constraints, RLS, RPC
```

### Pattern 1: Database-Enforced Attempt Lifecycle
**What:** Use DB constraints + RPC gates (`start`, `save`, `submit`) to enforce one-attempt and deadline.
**When to use:** Any exam state transition.
**Example:**
```sql
-- Source: PostgreSQL constraints docs + Phase 18 decisions
alter table exam_attempts
  add constraint exam_attempts_one_per_user unique (exam_session_id, user_id);
```

### Pattern 2: Security Split for Answer Keys
**What:** Store answer key separate from student-readable question table.
**When to use:** EXAM-02/05/06 to prevent leak.
**Example:**
```sql
-- Source: Supabase RLS best-practice pattern
create table exam_questions (...);
create table exam_question_answers (
  question_id uuid primary key references exam_questions(id) on delete cascade,
  correct_choice text not null check (correct_choice in ('A','B','C','D'))
);
```

### Pattern 3: Query/Mutation Separation with React Query
**What:** Use `useQuery` for session/attempt state and `useMutation` for start/autosave/submit.
**When to use:** Student attempt page and admin authoring page.
**Example:**
```typescript
// Source: TanStack Query useMutation docs
const submitMutation = useMutation({
  mutationFn: submitExamAttempt,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-attempt", attemptId] }),
});
```

### Anti-Patterns to Avoid
- **Client-only deadline checks:** Browser clock can be wrong; always validate against DB `now()` and `ends_at`.
- **Expose answer key via SELECT/RPC response:** breaks exam integrity.
- **Allow editing published-and-started sessions:** violates D-04 fairness constraint.
- **No cleanup for timers/subscriptions:** causes duplicate autosave/submit side effects.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Math rendering | Custom TeX parser | `react-katex` + `katex` | TeX edge cases and rendering correctness are complex |
| Access control | Client role flags only | RLS + security-definer RPC | Prevents bypass through direct API calls |
| Consistency under concurrency | Multi-call client submit flow | Single submit RPC transaction | Avoids partial writes and race conditions |
| One-attempt logic | Frontend “disable button” only | DB `UNIQUE` + RPC precheck | Reliable under refresh/retry/multi-tab |

**Key insight:** In this phase, correctness and fairness come from DB invariants, not UI behavior.

## Common Pitfalls

### Pitfall 1: Local Timer Drift
**What goes wrong:** Student sees time left but submit is rejected (or vice versa).
**Why it happens:** UI timer based on local device clock only.
**How to avoid:** Derive countdown from server timestamps (`started_at`, `ends_at`) and treat UI timer as display-only.
**Warning signs:** Frequent “late submit” complaints from users with wrong device time.

### Pitfall 2: Duplicate Attempts via Multi-Tab
**What goes wrong:** Two tabs create conflicting attempts.
**Why it happens:** No atomic server gate at start.
**How to avoid:** `UNIQUE(exam_session_id,user_id)` + start RPC handling duplicate-key conflict gracefully.
**Warning signs:** Same user has >1 attempt row.

### Pitfall 3: Answer Leakage Through Over-broad Policies
**What goes wrong:** Student can query correct answers table directly.
**Why it happens:** Missing RLS or wrong `TO` role scope.
**How to avoid:** Enable RLS, no student `SELECT` policy on answers, use non-exposed schema for definer functions.
**Warning signs:** Frontend network responses include `correct_choice`.

### Pitfall 4: Autosave Overwrites Final Submission
**What goes wrong:** Late autosave mutates already submitted attempt.
**Why it happens:** Autosave endpoint doesn’t check terminal state.
**How to avoid:** RPC guard `where submitted_at is null` before any update.
**Warning signs:** Attempt answers change after submit timestamp.

## Code Examples

Verified patterns from official sources:

### Supabase RPC from client
```typescript
// Source: https://supabase.com/docs/reference/javascript/rpc
const { data, error } = await supabase.rpc("submit_exam_attempt", { p_attempt_id: attemptId });
```

### React KaTeX rendering
```typescript
// Source: https://www.npmjs.com/package/react-katex
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
```

### Policy role scoping
```sql
-- Source: Supabase RLS docs
create policy "students can read own attempt"
on exam_attempts
to authenticated
using ((select auth.uid()) = user_id);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client checks only | DB constraints + RLS + RPC | Mature Supabase app patterns (current docs) | Stronger anti-bypass guarantees |
| Inline answers with questions | Split answers table with restricted read | Common exam/security architecture | Prevents accidental key exposure |
| Ad-hoc fetch + local state | TanStack Query v5 query/mutation model | Current repo standard | Better retry/invalidation/state clarity |

**Deprecated/outdated:**
- Trusting client clock for deadline enforcement.
- Returning raw answer keys for client-side grading.

## Open Questions

1. **Session type taxonomy (`month`/`quarter`) as enum or text**
   - What we know: Requirement needs month/quý labeling.
   - What's unclear: Whether roadmap expects fixed enum values for analytics later.
   - Recommendation: Use enum now (`monthly`, `quarterly`) to avoid invalid values.

2. **Question image storage policy granularity**
   - What we know: EXAM-02 requires image support.
   - What's unclear: Whether students can fetch direct public URLs or signed URLs only.
   - Recommendation: Follow assignments/materials precedent: private bucket + signed URLs.

3. **Autosave persistence frequency**
   - What we know: Must restore after reconnect (D-07).
   - What's unclear: acceptable write volume on Supabase free/pro tiers.
   - Recommendation: debounce on change + periodic backup (e.g., 10–15s) with final submit as source of truth.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite/Vitest/build | ✓ | `v18.20.8` | — |
| Yarn | Project package manager | ✓ | `4.11.0` | `npm` for emergency only |
| npm registry access | version verification + package install | ✓ (with network) | npm `10.8.2` | Use locked versions if offline |
| Supabase CLI | local DB workflows | ✗ | — | Use SQL migrations + Supabase dashboard |
| `psql` client | direct DB inspection | ✗ | — | Use Supabase SQL editor |

**Missing dependencies with no fallback:**
- None (phase can proceed with current setup).

**Missing dependencies with fallback:**
- `supabase` CLI and `psql` are absent; dashboard + migrations are viable fallback.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4` + React Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test src/lib/api/exams.test.ts src/pages/student/MockExamAttemptPage.test.tsx` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXAM-01 | Admin create/publish gating | integration (API+page) | `yarn test src/lib/api/exams.test.ts src/pages/admin/ExamSessionsPage.test.tsx` | ❌ Wave 0 |
| EXAM-02 | Question create with LaTeX/image metadata | unit/integration | `yarn test src/lib/api/exams.test.ts src/pages/admin/ExamSessionDetailPage.test.tsx` | ❌ Wave 0 |
| EXAM-03 | Student sees open sessions and can start | integration | `yarn test src/pages/student/MockExamsPage.test.tsx` | ❌ Wave 0 |
| EXAM-04 | One-attempt enforcement | unit (RPC wrapper) + integration | `yarn test src/lib/api/exams.test.ts` | ❌ Wave 0 |
| EXAM-05 | Immediate score after submit | integration | `yarn test src/pages/student/MockExamAttemptPage.test.tsx` | ❌ Wave 0 |
| EXAM-06 | Server-side `ends_at` enforcement | unit (API error mapping) | `yarn test src/lib/api/exams.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn test src/lib/api/exams.test.ts`
- **Per wave merge:** `yarn test src/lib/api/exams.test.ts src/pages/student/MockExamAttemptPage.test.tsx src/pages/admin/ExamSessionsPage.test.tsx`
- **Phase gate:** `yarn test && yarn lint`

### Wave 0 Gaps
- [ ] `src/lib/api/exams.test.ts` — API contract and error mapping for start/autosave/submit
- [ ] `src/pages/student/MockExamsPage.test.tsx` — open session listing and CTA states
- [ ] `src/pages/student/MockExamAttemptPage.test.tsx` — countdown/submit/result rendering
- [ ] `src/pages/admin/ExamSessionsPage.test.tsx` — session lifecycle actions
- [ ] `src/pages/admin/ExamSessionDetailPage.test.tsx` — question authoring constraints

## Sources

### Primary (HIGH confidence)
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase JS RPC docs: https://supabase.com/docs/reference/javascript/rpc
- PostgreSQL `CREATE FUNCTION` (SECURITY DEFINER): https://www.postgresql.org/docs/current/sql-createfunction.html
- PostgreSQL constraints (`UNIQUE`, `CHECK`): https://www.postgresql.org/docs/current/ddl-constraints.html
- TanStack Query `useMutation`: https://tanstack.com/query/latest/docs/framework/react/reference/useMutation
- react-katex package docs: https://www.npmjs.com/package/react-katex
- KaTeX docs: https://katex.org/docs/autorender.html
- Local repo docs: `AGENTS.md`, `CLAUDE.md`, `.planning/*`, `.planning/phases/18-mock-exam-system/18-CONTEXT.md`

### Secondary (MEDIUM confidence)
- GitHub repository metadata for react-katex: https://github.com/talyssonoc/react-katex

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - validated against current repo + npm registry checks on 2026-05-13.
- Architecture: HIGH - aligned with locked phase decisions and Supabase/Postgres official guidance.
- Pitfalls: HIGH - based on current official RLS/constraints docs + existing repo failure patterns.

**Research date:** 2026-05-13
**Valid until:** 2026-06-12 (30 days)
