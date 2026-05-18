---
phase: 20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas
plan: P04
type: execute
wave: 1
depends_on: [P01, P02, P03]
files_modified:
  - src/pages/student/MockExamsPage.tsx
  - src/pages/student/MockExamAttemptPage.tsx
  - src/pages/admin/ExamSessionsPage.tsx
  - src/pages/admin/ExamSessionDetailPage.tsx
autonomous: true
requirements: []
---

# Phase 20 — P04: Exam Pages Glassmorphism Redesign

## Goal

Apply the Phase 20 AI EdTech SaaS design language (established in P01–P03) to the 4 exam-system pages added in Phase 18. These pages were built after P01–P03 and are the only remaining screens without glassmorphism treatment.

**Requirements satisfied:** Closes the Phase 20 design coverage gap for Phase 18 screens.

---

<objective>
Apply consistent `bm-glass-card`, gradient h1, and indigo token patterns from P02/P03 to MockExamsPage, MockExamAttemptPage, ExamSessionsPage, and ExamSessionDetailPage. Zero functional changes — UI visual upgrade only.

Output: 4 files modified. No new packages, no API changes, no route changes.
</objective>

<context>
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-CONTEXT.md
@.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-P03-SUMMARY.md

<design_rules>
CRITICAL — enforce without exception:
- D-05/D-06: NEVER modify background colors. `bg-[#F0FDFA]`, `bg-background`, or page-level backgrounds are locked.
- bm-glass-card = `backdrop-blur-sm bg-white/80 border border-white/30 shadow-lg rounded-[24px]` (defined in index.css)
- Gradient h1 = `bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`
- Primary buttons inside `.app-student` / `.app-admin` already render indigo via scoped CSS vars — no explicit color class needed.
- Do NOT import or apply `bm-glass-card` via Tailwind inline classes — use the CSS class name directly.
- Wrapper divs: keep existing `p-8 space-y-4` padding/spacing; only change card container classes.
</design_rules>
</context>

---

<tasks>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- T-01: Student — MockExamsPage                               -->
<!-- ═══════════════════════════════════════════════════════════ -->

<task type="auto" id="T-01">
  <name>T-01: MockExamsPage — glassmorphism redesign</name>
  <files>src/pages/student/MockExamsPage.tsx</files>
  <behavior>
    - Gradient h1: `Đề thi thử` → use gradient text class
    - Card per exam session → replace plain `<Card>` with `<div className="bm-glass-card p-5">` pattern (keep CardHeader/CardContent structure or simplify inline)
    - "Vào thi" Button: no class change needed (inherits indigo via `.app-student`)
    - Loading state: replace bare `<p>Đang tải...</p>` with a simple spinner or Skeleton (use existing Skeleton component if available, else just style the text)
    - Empty state: replace bare `<p>Hiện chưa có đề thi mở.</p>` with a styled empty state matching P02 pattern (indigo icon + muted text)
  </behavior>
  <action>
Rewrite `MockExamsPage` JSX following this pattern:

```tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarDays, FileText } from 'lucide-react'
import StudentLayout from '@/components/student/StudentLayout'
import { Button } from '@/components/ui/button'
import { fetchOpenExamSessionsForStudent } from '@/lib/api/exams'

export default function MockExamsPage() {
  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ['student', 'open-exam-sessions'],
    queryFn: fetchOpenExamSessionsForStudent,
  })

  return (
    <StudentLayout>
      <div className="p-8 space-y-6">
        {/* Gradient heading — D-11 */}
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Đề thi thử
          </span>
        </h1>

        {isLoading ? (
          <div className="bm-glass-card p-5 text-sm text-muted-foreground animate-pulse">Đang tải...</div>
        ) : null}

        {isError ? (
          <div className="bm-glass-card p-5 text-sm text-destructive">Không thể tải danh sách đề thi.</div>
        ) : null}

        {!isLoading && !isError && sessions.length === 0 ? (
          <div className="bm-glass-card flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <FileText className="h-7 w-7 text-indigo-500" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-slate-700">Chưa có đề thi mở</p>
            <p className="text-sm text-muted-foreground">Hãy quay lại sau khi giảng viên phát hành đề thi mới.</p>
          </div>
        ) : null}

        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bm-glass-card flex items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-semibold text-slate-800">{session.title}</p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {new Date(session.starts_at).toLocaleString('vi-VN')}
                  {' '}&mdash;{' '}
                  {new Date(session.ends_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link to={`/de-thi/${session.id}`}>Vào thi</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}
```

Remove unused `Card`, `CardContent`, `CardHeader`, `CardTitle` imports from this file.
  </action>
  <verify>
    <automated>grep -c "bm-glass-card" src/pages/student/MockExamsPage.tsx && grep -c "from-indigo-600" src/pages/student/MockExamsPage.tsx</automated>
  </verify>
  <done>MockExamsPage has gradient h1 and bm-glass-card session rows; unused Card imports removed; no background color changes.</done>
</task>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- T-02: Student — MockExamAttemptPage                         -->
<!-- ═══════════════════════════════════════════════════════════ -->

<task type="auto" id="T-02">
  <name>T-02: MockExamAttemptPage — glassmorphism redesign</name>
  <files>src/pages/student/MockExamAttemptPage.tsx</files>
  <behavior>
    - Gradient h1: `Làm đề thi`
    - Result panel (`rounded-lg border p-4`) → `bm-glass-card p-5`
    - Score text in result: `Điểm thô` / `Điểm hệ 10` styled with `font-bold text-indigo-600`
    - Keep all functional logic (state, mutations, effects) unchanged
    - No changes to ExamCountdown, ExamQuestionCard, ExamSubmitPanel, Alert components
    - Wrapper `<div className="p-8 space-y-4">` → keep as-is (only change result panel)
  </behavior>
  <action>
Two targeted changes in `MockExamAttemptPage`:

**1. Gradient h1:**
```tsx
// BEFORE:
<h1 className="text-xl font-bold">Làm đề thi</h1>
// AFTER:
<h1 className="text-2xl font-bold tracking-tight">
  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
    Làm đề thi
  </span>
</h1>
```

**2. Result panel:**
```tsx
// BEFORE:
<div className="rounded-lg border p-4 space-y-1">
  <p className="font-semibold">Điểm thô: {result.raw_score}</p>
  <p className="font-semibold">Điểm hệ 10: {result.score_10}</p>
</div>
// AFTER:
<div className="bm-glass-card p-5 space-y-2">
  <p className="text-sm text-muted-foreground">Kết quả của bạn</p>
  <p className="font-bold text-indigo-600">Điểm thô: {result.raw_score}</p>
  <p className="font-bold text-indigo-600">Điểm hệ 10: {result.score_10}</p>
</div>
```

All other lines remain unchanged.
  </action>
  <verify>
    <automated>grep -c "bm-glass-card" src/pages/student/MockExamAttemptPage.tsx && grep -c "from-indigo-600" src/pages/student/MockExamAttemptPage.tsx</automated>
  </verify>
  <done>MockExamAttemptPage has gradient h1 and glass result panel; functional logic untouched.</done>
</task>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- T-03: Admin — ExamSessionsPage                              -->
<!-- ═══════════════════════════════════════════════════════════ -->

<task type="auto" id="T-03">
  <name>T-03: ExamSessionsPage — glassmorphism redesign</name>
  <files>src/pages/admin/ExamSessionsPage.tsx</files>
  <behavior>
    - Gradient h1: `Quản lý đề thi thử`
    - CTA button "Tạo đề thi": add gradient `bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0` class
    - Session cards: replace `<Card>` with `<div className="bm-glass-card p-5">` wrapper; keep internal content structure
    - Buttons inside each card (Soạn câu hỏi, Sửa, Phát hành, Xóa): no class changes needed
    - Empty state (no sessions): add a minimal empty state if `sessions.length === 0`
    - Keep all mutations, query, and dialog unchanged
  </behavior>
  <action>
```tsx
// Gradient h1 + CTA gradient button:
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold tracking-tight">
    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      Quản lý đề thi thử
    </span>
  </h1>
  <Button
    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
    onClick={() => { setEditing(null); setOpen(true) }}
  >
    Tạo đề thi
  </Button>
</div>

// Session card — replace <Card> with bm-glass-card div:
<div key={session.id} className="bm-glass-card p-5">
  <div className="flex items-center justify-between mb-3">
    <span className="font-semibold text-slate-800">{session.title}</span>
    <Badge variant={session.status === 'published' ? 'default' : 'outline'}>{session.status}</Badge>
  </div>
  <div className="flex flex-wrap gap-2">
    <Button variant="outline" asChild>
      <Link to={`/quan-tri/de-thi/${session.id}`}>Soạn câu hỏi</Link>
    </Button>
    <Button variant="outline" onClick={() => { setEditing(session); setOpen(true) }}>Sửa</Button>
    <Button onClick={() => publishMutation.mutate(session.id)} disabled={session.status !== 'draft'}>Phát hành</Button>
    <Button variant="destructive" onClick={() => deleteMutation.mutate(session.id)}>Xóa</Button>
  </div>
</div>
```

Remove unused `Card`, `CardContent`, `CardHeader`, `CardTitle` imports from this file.
  </action>
  <verify>
    <automated>grep -c "bm-glass-card" src/pages/admin/ExamSessionsPage.tsx && grep -c "from-indigo-600" src/pages/admin/ExamSessionsPage.tsx</automated>
  </verify>
  <done>ExamSessionsPage has gradient h1, gradient CTA, and bm-glass-card session rows; unused Card imports removed.</done>
</task>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- T-04: Admin — ExamSessionDetailPage                         -->
<!-- ═══════════════════════════════════════════════════════════ -->

<task type="auto" id="T-04">
  <name>T-04: ExamSessionDetailPage — glassmorphism redesign</name>
  <files>src/pages/admin/ExamSessionDetailPage.tsx</files>
  <behavior>
    - Gradient h1: `Soạn câu hỏi đề thi`
    - Question item `<div className="rounded-lg border p-4">` → `<div className="bm-glass-card p-5">`
    - Keep ExamQuestionForm and all mutations unchanged
    - No other visual changes
  </behavior>
  <action>
Two targeted changes in `ExamSessionDetailPage`:

**1. Gradient h1:**
```tsx
// BEFORE:
<h1 className="text-xl font-bold">Soạn câu hỏi đề thi</h1>
// AFTER:
<h1 className="text-2xl font-bold tracking-tight">
  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
    Soạn câu hỏi đề thi
  </span>
</h1>
```

**2. Question item wrapper:**
```tsx
// BEFORE:
<div key={q.id} className="rounded-lg border p-4">
// AFTER:
<div key={q.id} className="bm-glass-card p-5">
```

All other code unchanged.
  </action>
  <verify>
    <automated>grep -c "bm-glass-card" src/pages/admin/ExamSessionDetailPage.tsx && grep -c "from-indigo-600" src/pages/admin/ExamSessionDetailPage.tsx</automated>
  </verify>
  <done>ExamSessionDetailPage has gradient h1 and bm-glass-card question wrappers; functional code untouched.</done>
</task>

</tasks>

---

## Verification

After all 4 tasks, run:
```bash
yarn test src/pages/student/MockExams src/pages/admin/ExamSession
```

Must-haves:
- [ ] All 4 files have `bm-glass-card` (grep count ≥ 1 each)
- [ ] All 4 files have gradient h1 (`from-indigo-600` present)
- [ ] No background color modifications (`bg-\[#F0FDFA\]` not added)
- [ ] All existing exam tests still pass
- [ ] No unused import warnings (Card/CardContent/CardHeader/CardTitle removed where replaced)
