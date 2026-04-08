---
phase: 05-grading-notification
verified: 2026-04-08T09:45:00Z
status: passed
score: 12/12 must-haves verified
---

# Phase 5: Grading & Notification Verification Report

**Phase Goal:** Teachers can grade student submissions and students receive in-app notifications when grades are posted.
**Verified:** 2026-04-08T09:45:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                       | Status     | Evidence                                                                                              |
|----|---------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------|
| 1  | Teacher sees ungraded submissions table (name, course, lesson, date)                        | VERIFIED   | SubmissionsPage.tsx lines 47-54 render all 5 column headers; test 3/3 passing                        |
| 2  | Teacher can open grading dialog and view student photo                                      | VERIFIED   | GradingDialog.tsx lines 96-113 load signed URL and render `<img>`; test passing                      |
| 3  | Teacher enters score (0-10, step 0.5) and comment, saves                                   | VERIFIED   | GradingDialog.tsx lines 116-138; Input with `min={0} max={10} step={0.5}`; test passing              |
| 4  | After saving, dialog closes and success toast fires                                         | VERIFIED   | SubmissionsPage.tsx lines 91-96; `toast.success(...)` + `setGradingSubmission(null)` in onSuccess    |
| 5  | Empty queue shows Vietnamese message                                                        | VERIFIED   | SubmissionsPage.tsx line 43: "Không có bài nào chờ chấm."                                           |
| 6  | Route /admin/submissions is protected for admin role                                        | VERIFIED   | App.tsx line 40: `<ProtectedRoute requiredRole="admin"><SubmissionsPage /></ProtectedRoute>`          |
| 7  | CoursesPage has nav link to /admin/submissions                                              | VERIFIED   | CoursesPage.tsx line 98-101: Link `to="/admin/submissions"` with text "Chấm bài →"                  |
| 8  | Student sees bell icon with unviewed grade badge (hidden when 0)                            | VERIFIED   | BellNotification.tsx lines 12-27; badge guarded by `{count > 0 &&`; test 3/3 passing                |
| 9  | BellNotification wired into StudentLayout header                                            | VERIFIED   | StudentLayout.tsx line 5 imports; line 31 renders `<BellNotification />`                            |
| 10 | Student sees score with /10 suffix and teacher comment on graded submissions                | VERIFIED   | SubmissionArea.tsx line 104: `{submission.score}/10`; test 4/4 passing                              |
| 11 | Viewing a graded submission fires markGradeViewed and invalidates bell count query          | VERIFIED   | SubmissionArea.tsx lines 37-45; fire-and-forget with query invalidation to `['student','unviewed-grades']` |
| 12 | Build passes cleanly with no TypeScript errors                                              | VERIFIED   | `yarn build` exits 0; only a bundle-size warning (not an error)                                      |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact                                               | Expected                                         | Status     | Details                                               |
|--------------------------------------------------------|--------------------------------------------------|------------|-------------------------------------------------------|
| `supabase/migrations/20260407_07_student_viewed_at.sql` | student_viewed_at column + RPC                  | VERIFIED   | 24 lines; contains `add column if not exists student_viewed_at`, `mark_submission_viewed`, `security definer`, `user_id = auth.uid()`, `status = 'graded'`, `student_viewed_at is null` |
| `src/lib/api/submissions.ts`                           | All API functions for grading                    | VERIFIED   | 187 lines; exports `getUngraded`, `gradeSubmission`, `getUnviewedGradeCount`, `markGradeViewed`; `Submission` type has `student_viewed_at: string | null`; `UngradedSubmission` interface present |
| `src/pages/admin/SubmissionsPage.tsx`                  | Teacher grading queue page                       | VERIFIED   | 100 lines (>80 required); `useQuery` with key `['admin','submissions','ungraded']`; full table + empty state + GradingDialog integration |
| `src/components/admin/GradingDialog.tsx`               | Grading modal with photo, score, comment         | VERIFIED   | 157 lines (>60 required); `gradeSubmission` + `getSubmissionSignedUrl` wired; all required UI present |
| `src/App.tsx`                                          | Route /admin/submissions registered              | VERIFIED   | Line 17 import; line 40 route under ProtectedRoute   |
| `src/components/student/BellNotification.tsx`          | Bell icon with unviewed grade count badge        | VERIFIED   | 28 lines (>20 required); `useQuery` with key `['student','unviewed-grades']`; `refetchInterval: 60_000`; `aria-live="polite"` |
| `src/components/student/StudentLayout.tsx`             | Header with BellNotification                     | VERIFIED   | Line 5 import; line 31 `<BellNotification />` in header ml-auto div |
| `src/components/student/SubmissionArea.tsx`            | Grade display + markGradeViewed call             | VERIFIED   | 173 lines; `markGradeViewed` imported and called in fire-and-forget useEffect; `{submission.score}/10` display |

---

### Key Link Verification

| From                           | To                                    | Via                                      | Status   | Details                                                        |
|--------------------------------|---------------------------------------|------------------------------------------|----------|----------------------------------------------------------------|
| `SubmissionsPage.tsx`          | `src/lib/api/submissions.ts`          | `useQuery` calling `getUngraded`         | WIRED    | Line 5 import; line 24 `queryFn: getUngraded`                 |
| `GradingDialog.tsx`            | `src/lib/api/submissions.ts`          | `useMutation` calling `gradeSubmission`  | WIRED    | Line 5 import; line 70 `mutationFn: () => gradeSubmission(...)` |
| `App.tsx`                      | `SubmissionsPage.tsx`                 | Route component                          | WIRED    | Line 17 import; line 40 `path="/admin/submissions"`           |
| `CoursesPage.tsx`              | `/admin/submissions`                  | Link                                     | WIRED    | Line 98 `to="/admin/submissions"`                             |
| `BellNotification.tsx`         | `src/lib/api/submissions.ts`          | `useQuery` calling `getUnviewedGradeCount` | WIRED  | Line 3 import; line 8 `queryFn: getUnviewedGradeCount`        |
| `SubmissionArea.tsx`           | `src/lib/api/submissions.ts`          | `markGradeViewed` fire-and-forget        | WIRED    | Line 3 import; line 39 `markGradeViewed(submission.id)`       |
| `StudentLayout.tsx`            | `BellNotification.tsx`                | Import and render in header              | WIRED    | Line 5 import; line 31 `<BellNotification />`                 |
| `src/lib/api/submissions.ts`   | Supabase RPC `mark_submission_viewed` | `supabase.rpc` call                      | WIRED    | Line 182: `supabase.rpc('mark_submission_viewed', { submission_id: submissionId })` |

---

### Data-Flow Trace (Level 4)

| Artifact                  | Data Variable          | Source                                           | Produces Real Data          | Status    |
|---------------------------|------------------------|--------------------------------------------------|-----------------------------|-----------|
| `SubmissionsPage.tsx`     | `data` (UngradedSubmission[]) | `getUngraded()` → Supabase `.from('submissions').select(...)` with join | Yes — DB query with 3-level join | FLOWING   |
| `BellNotification.tsx`    | `count`                | `getUnviewedGradeCount()` → Supabase count query | Yes — `.select('*', {count:'exact',head:true})` | FLOWING   |
| `SubmissionArea.tsx`      | `submission` (prop)    | Passed from parent (lesson page query)           | Yes — parent invalidates on success | FLOWING  |
| `GradingDialog.tsx`       | `imageUrl`             | `getSubmissionSignedUrl(submission.file_path)` → Supabase storage signed URL | Yes — real signed URL from storage | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED for API routes (Supabase requires live credentials). Build and unit tests serve as the automated verification layer. `yarn build` exits 0; all 13 unit tests pass across 4 test files.

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                                 | Status    | Evidence                                                        |
|-------------|-------------|-----------------------------------------------------------------------------|-----------|-----------------------------------------------------------------|
| GRADE-01    | 05-00, 05-01, 05-02 | Giảng viên thấy danh sách tất cả bài đã nộp chưa được chấm             | SATISFIED | `getUngraded()` queries `status='submitted'`; SubmissionsPage renders table; test passes |
| GRADE-02    | 05-00, 05-01, 05-02 | Giảng viên có thể xem ảnh bài làm của học sinh đầy đủ                    | SATISFIED | GradingDialog loads signed URL; renders `<img>` in `max-h-[60vh] overflow-y-auto` container |
| GRADE-03    | 05-00, 05-01, 05-02 | Giảng viên có thể nhập điểm số và comment nhận xét trên bài nộp          | SATISFIED | GradingDialog Input `type=number min=0 max=10 step=0.5`; comment Textarea; gradeSubmission mutation |
| GRADE-04    | 05-00, 05-01, 05-03 | Học sinh nhận thông báo in-app khi bài được chấm                          | SATISFIED | BellNotification polls `getUnviewedGradeCount` every 60s; red badge with count; hidden when 0 |
| GRADE-05    | 05-00, 05-01, 05-03 | Học sinh có thể xem điểm và comment của giảng viên trên bài nộp của mình | SATISFIED | SubmissionArea displays `{submission.score}/10` and `{submission.comment}`; markGradeViewed fires on view |

No orphaned requirements — all 5 GRADE-01 through GRADE-05 are claimed by plans and verified in the codebase.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `GradingDialog.test.tsx` | 65 | `getByLabelText(/[Dd]i[eể]m/)` matches via `htmlFor` label "diem so", not `aria-label="Điểm số"` as spec described | Info | Test passes; implementation and test are compatible; minor drift from spec wording only |

No stub patterns, TODO comments, hardcoded empty returns, or placeholder implementations found in any implementation file.

---

### Human Verification Required

#### 1. End-to-end grading flow

**Test:** Log in as admin, navigate to `/admin/submissions`. Submit a photo as a student, then grade it as admin.
**Expected:** Submission row disappears from queue after grading; success toast shows the student name.
**Why human:** Requires live Supabase credentials and two browser sessions.

#### 2. Bell badge decrement

**Test:** As a student, have a graded submission with `student_viewed_at = null`. Open the lesson and view the grade.
**Expected:** Bell badge count decrements immediately after viewing (query invalidation fires).
**Why human:** Requires live RPC, real-time state, and two-account flow.

#### 3. Bell badge visual position in header (mobile)

**Test:** On a 375px mobile viewport, check that BellNotification icon is visible in the header between the student name and logout button.
**Expected:** Bell tap target is at minimum 48x48px; badge count is legible.
**Why human:** Visual layout and touch target verification requires a browser.

---

### Gaps Summary

No gaps. All 12 observable truths verified, all 8 artifacts pass levels 1-4, all 8 key links are wired, all 5 requirements satisfied. Build passes and 13/13 unit tests pass.

---

_Verified: 2026-04-08T09:45:00Z_
_Verifier: Claude (gsd-verifier)_
