# Feature Research

**Domain:** Async K-12 Math LMS — Vietnamese middle school (grades 7-9) + specialized exam prep
**Researched:** 2026-03-23
**Confidence:** HIGH (core LMS patterns), MEDIUM (Vietnam-specific UX), LOW (local competitor feature parity)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Email + password registration | Every web product has this; students won't tolerate anything else | LOW | Supabase Auth handles this natively |
| Admin account approval gate | Parents/teachers expect controlled enrollment; no random access | LOW | Supabase user metadata + admin dashboard query |
| Persistent login session | Students on mobile expect to stay logged in across browser sessions | LOW | Supabase session tokens handle this; configure refresh expiry |
| Logout | Basic security hygiene; parents will check if missing | LOW | Single button, clears Supabase session |
| Course listing page | Students need to see what they're enrolled in immediately on login | LOW | Simple query filtered by role/enrollment |
| Video lesson playback | Core product — YouTube embed is sufficient for MVP | LOW | YouTube iframe embed, no custom player needed |
| Lesson completion marking | Students need to feel progress; teachers need completion signals | LOW | Boolean flag per student per lesson in DB |
| Progress bar per course | Standard in every LMS since Canvas/Moodle — absence feels broken | LOW | Calculated from completed lessons / total lessons |
| Assignment submission (photo upload) | Students doing handwritten math need this; no substitute exists | MEDIUM | Supabase Storage + mobile camera upload |
| View own graded work + score | Students must be able to see feedback after grading; critical loop closure | LOW | Query submissions by student, show score + comment |
| Teacher grading queue | Teachers need a list of ungraded submissions to work through | LOW | Filter submissions where graded_at IS NULL |
| Score + text comment on submission | Minimal feedback unit; required for the product's core value promise | LOW | Two fields: numeric score, text comment, saved on submission row |
| Student notification when graded | Without this, students don't know to check; breaks the feedback loop | MEDIUM | Email via Supabase Edge Function or in-app status polling |
| Assignment status indicators | "Not submitted / Submitted / Graded" states must be visible at a glance | LOW | Enum field on submission row; displayed on lesson/course views |
| Responsive mobile layout | 70%+ of Vietnamese middle school students access via smartphone | MEDIUM | Tailwind responsive classes; touch-friendly tap targets (48px min) |
| Vietnamese UI language | Students and teachers are Vietnamese; English UI would cause friction | LOW | Static strings already in Vietnamese; no i18n library needed |

### Differentiators (Competitive Advantage)

Features that set BuMath apart from generic LMS platforms. Should reflect the core value: personalized feedback at scale.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Inline image annotation on submissions | Teachers can circle errors or write notes directly on the student's photo — mirrors how real tutors teach | HIGH | Requires canvas drawing overlay on image (Fabric.js or Konva); defer to v1.x unless MVP grading is deemed insufficient |
| Submission history (multiple attempts) | Students can resubmit after feedback and see improvement over time; builds confidence | MEDIUM | Multiple submission rows per assignment per student; show timeline |
| Per-lesson completion streak / visual progress | Gamification light — streak indicators keep middle schoolers engaged without full gamification complexity | MEDIUM | Track consecutive days or weekly completion; simple visual in header |
| Teacher comment templates / saved replies | Math errors are repetitive; saved comment snippets let teachers grade 3x faster | LOW | Array of saved strings per teacher in DB; dropdown on grading form |
| Assignment deadline setting + late flag | Adds structure for "ôn thi chuyên" students who need exam discipline | LOW | deadline field on assignment; flag late submissions visually |
| Course enrollment by class cohort | Admin can assign a whole "Lớp 8A" cohort to a course, not just individual students | MEDIUM | Group/cohort entity; enrollment via group |
| Ordered lesson sequence lock | Prevent students from skipping to lesson 5 without watching 1-4; important for math where concepts build | LOW | Check previous lesson completed before unlocking next |
| Student dashboard "what to do next" | Single clear CTA on login — removes friction for young users who get lost in navigation | LOW | Compute "next incomplete lesson" or "pending submission" and surface prominently |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this product's scope and team size.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Live video chat / real-time sessions | "It's better than async" — parents assume live = quality | Requires WebRTC infrastructure, scheduling system, timezone handling, and breaks the async-first model entirely; v1 team cannot support | Async video feedback comments (v2+); direct WhatsApp link in profile as escape hatch |
| Auto-graded multiple-choice quizzes | "Save teacher time" — administrators ask for this frequently | Math at THCS level requires showing work; MCQ does not assess understanding; creates a culture of guessing | Manual grading with photo submissions is the differentiator; resist MCQ in v1 |
| Parent portal / parent accounts | Parents want to see grades | Second account type adds auth complexity (2 roles, 2 dashboards), parent–student account linking, and consent UX; not required to validate the core product | Share grade screenshots via Zalo/Messenger; add parent view in v2 after core is stable |
| Payment / course purchase flow | "Monetize now" | Payments require VNPay/Stripe integration, invoice generation, subscription logic, and legal compliance; distracts from learning UX entirely | Manual enrollment by admin; collect payment outside platform (bank transfer, cash) |
| Self-hosted video upload | Better loading speeds in Vietnam vs YouTube | Storage costs scale fast; encoding pipeline needed; YouTube is already widely used and trusted in Vietnam | Stick with YouTube embed; revisit if buffering complaints emerge |
| Real-time notifications via WebSocket | "Students need instant alerts" | Supabase Realtime adds complexity; polling every 60s on the submission status page is sufficient for an async product | Email notification on grade publish + status badge that refreshes on page load |
| Advanced analytics dashboard | Admin wants class performance reports | Premature without sufficient data volume; analytics requires aggregation queries and visualization work that adds weeks | Simple per-course completion % for admin is enough in v1; defer to v2 |
| Social features (comments, likes, discussion) | Students might "engage more" | Moderation burden on a small team; distraction from focused math study; introduces bullying/spam risk | Teacher comment on submission is the only social feedback needed in v1 |

---

## Feature Dependencies

```
[Auth: Student Registration]
    └──requires──> [Admin: Account Approval]
                       └──requires──> [Admin Dashboard]

[Course Listing (Student)]
    └──requires──> [Course Management (Admin)]
                       └──requires──> [Auth]

[Assignment Submission (Student)]
    └──requires──> [Assignment Creation (Admin)]
                       └──requires──> [Course + Lesson exists]
    └──requires──> [File Upload (Supabase Storage)]

[Grading (Teacher)]
    └──requires──> [Assignment Submission exists]
    └──requires──> [Teacher Role + Auth]

[Student: View Grade + Comment]
    └──requires──> [Grading complete]
    └──requires──> [Notification trigger]

[Progress Bar]
    └──requires──> [Lesson Completion Marking]
                       └──requires──> [Lessons exist]

[Assignment Status (not submitted / submitted / graded)]
    └──requires──> [Submission row in DB]
    └──enhances──> [Progress Bar]

[Ordered Lesson Lock (differentiator)]
    └──requires──> [Lesson Completion Marking]

[Submission History (differentiator)]
    └──enhances──> [Assignment Submission]

[Teacher Comment Templates (differentiator)]
    └──enhances──> [Grading workflow]
```

### Dependency Notes

- **Auth must come first:** Every other feature depends on knowing who the user is and what role they have. Admin approval gate is part of auth, not a separate feature.
- **Course Management before Learning Experience:** Admin must be able to create courses and lessons before students can view anything.
- **Assignment creation before submission:** The submission form references an assignment record; the DB foreign key enforces this.
- **Grading requires submissions:** The teacher grading queue is meaningless until at least one student has submitted work.
- **Notification depends on grading:** Email/in-app alert is triggered when a teacher publishes a grade; it has no standalone purpose.
- **Progress Bar enhances retention but does not block core learning:** Build lesson completion marking first; progress bar is a simple calculation on top.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to prove the core value proposition (personalized feedback at scale for THCS math students).

- [x] Student self-registration + email/password auth
- [x] Admin account approval workflow (pending → approved → active)
- [x] Persistent login session + logout
- [x] Role-based access: student / teacher / admin
- [x] Admin: create/edit/delete courses with grade target (7, 8, 9, chuyên)
- [x] Admin: add lessons to course (title, YouTube video URL, description, order)
- [x] Admin: attach assignment to lesson (PDF or image of problem set)
- [x] Student: course listing (enrolled courses only)
- [x] Student: lesson view with YouTube embed + assignment download
- [x] Student: mark lesson as complete
- [x] Student: progress bar per course (% lessons completed)
- [x] Student: upload photo submission for assignment
- [x] Assignment status display: not submitted / submitted / graded
- [x] Teacher: grading queue (all ungraded submissions)
- [x] Teacher: enter score + text comment on submission
- [x] Student: view grade + comment on own submission
- [x] Email notification to student when grade is published (Supabase Edge Function)
- [x] Mobile-first responsive layout — all flows work on 375px viewport

### Add After Validation (v1.x)

Features to add once the core submission-grading loop is proven to work.

- [ ] Teacher comment templates / saved replies — add when teachers report repetitive typing friction
- [ ] Ordered lesson sequence lock — add when admin requests structure enforcement
- [ ] Assignment deadline + late submission flag — add when "ôn chuyên" cohort onboarded
- [ ] Submission history (multiple attempts) — add when students ask to resubmit after feedback
- [ ] Student dashboard "what to do next" CTA — add when navigation friction reported

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Inline image annotation on submissions — high complexity; validate whether text comments suffice first
- [ ] Course enrollment by cohort/class group — add when managing more than 50 students
- [ ] Lesson completion streak / gamification light — add when retention data shows drop-off
- [ ] Parent portal — add when parents request access and core product is stable
- [ ] Auto-graded MCQ quizzes — consider only for vocabulary/formula drills, never for proof-based problems
- [ ] Advanced analytics / class performance reports — add when admin has enough data to act on
- [ ] Self-hosted video — revisit if YouTube buffering complaints are persistent in user feedback

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Auth + registration + approval | HIGH | LOW | P1 |
| Course + lesson management (admin) | HIGH | LOW | P1 |
| YouTube lesson playback (student) | HIGH | LOW | P1 |
| Photo submission upload | HIGH | MEDIUM | P1 |
| Teacher grading: score + comment | HIGH | LOW | P1 |
| Student: view grade + feedback | HIGH | LOW | P1 |
| Progress bar + lesson completion | HIGH | LOW | P1 |
| Assignment status indicators | HIGH | LOW | P1 |
| Email notification on grading | MEDIUM | MEDIUM | P1 |
| Mobile-responsive layout | HIGH | MEDIUM | P1 |
| Teacher comment templates | MEDIUM | LOW | P2 |
| Ordered lesson sequence lock | MEDIUM | LOW | P2 |
| Assignment deadlines + late flag | MEDIUM | LOW | P2 |
| Submission history | MEDIUM | MEDIUM | P2 |
| Inline image annotation | HIGH | HIGH | P3 |
| Course enrollment by cohort | MEDIUM | MEDIUM | P3 |
| Streak / gamification | LOW | MEDIUM | P3 |
| Parent portal | MEDIUM | HIGH | P3 |
| Analytics dashboard | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Google Classroom | Canvas LMS | Hocmai.vn (Vietnam) | BuMath Approach |
|---------|-----------------|------------|---------------------|-----------------|
| Video lessons | YouTube embed + Google Drive | Kaltura / external embed | Self-hosted video | YouTube embed; no self-hosting in v1 |
| Assignment submission | File upload + Google Docs | File upload + media | Structured exercises | Photo upload of handwritten work — differentiator |
| Grading | Score + rubric + inline comments | SpeedGrader with annotations | Auto-scored | Score + teacher text comment; annotation in v1.x |
| Progress tracking | Per-assignment completion | Per-module completion % | Lesson progress bars | Lesson completion + course % progress bar |
| Notifications | Email + in-app | Email + push | Email | Email on grade; in-app status polling |
| Mobile UX | Good — Google Material Design | Mediocre — complex navigation | Weak — desktop-first | Mobile-first, large tap targets, minimal navigation depth |
| Account approval | None (open or domain-restricted) | Enrollment codes | Open registration | Admin-approval gate — fits private tutoring model |
| Parent visibility | Guardian email summaries | Separate observer role | None | Defer; not needed for initial validation |
| Vietnamese language | Partial (Google Translate) | No | Full | Full Vietnamese UI — non-negotiable |

---

## Mobile UX Considerations for Vietnamese Middle School Students

These are implementation constraints that affect every feature, not just mobile-specific ones.

**Device reality:**
Vietnamese middle school students primarily access digital content via Android smartphones (low-to-mid range hardware common). Screens are 360-414px wide. Connection quality varies — YouTube buffers on 3G but loads on 4G/WiFi. Design for 4G, test on 3G.

**Tap targets:**
All interactive elements must be minimum 48x48px. Avoid hover-only states — no tooltips or dropdowns that require hover. Use bottom-sheet modals instead of top-right dropdowns for actions.

**Navigation depth:**
Maximum 3 taps from login to watching a lesson. Maximum 4 taps from login to submitting an assignment. Deeply nested menus cause abandonment in this age group.

**Camera upload flow:**
The most critical mobile UX moment is photo submission. The upload flow must: (1) trigger the native camera directly (not file picker), (2) allow retake before submitting, (3) show a preview with a clear "Submit" button, (4) display a visible success confirmation. File size compression is necessary — photos from phone cameras are 3-8MB; compress to under 500KB before uploading to Supabase Storage.

**Text input minimization:**
Students on mobile hate typing. Keep required text fields to a minimum: registration (email + password + name), login (email + password), submission (no text required — photo only). Teachers grade on desktop/tablet where typing is acceptable.

**Vietnamese font rendering:**
"Be Vietnam Pro" is already in the stack. Ensure font loads early (preconnect to Google Fonts) and set `font-display: swap` to prevent invisible text on slow connections.

**Feedback clarity:**
Young students need unambiguous feedback. Use color + icon + text (not color alone) for assignment status: gray + clock icon = "Chưa nộp", blue + check = "Đã nộp", green + star = "Đã chấm". Never rely on red/green alone (colorblind accessibility + Vietnamese cultural associations with red can cause confusion).

---

## Sources

- [7 Best K-12 LMS 2025 — Teachfloor](https://www.teachfloor.com/blog/k-12-lms)
- [K-12 LMS Guide — PowerSchool](https://www.powerschool.com/blog/learning-management-system/)
- [Canvas vs Google Classroom 2025 — Teachfloor](https://www.teachfloor.com/blog/canvas-vs-google-classroom)
- [Moodle Assignment Grading UX — MoodleDocs](https://docs.moodle.org/dev/Assignment_Grading_UX)
- [SpeedGrader Annotations — University of Oklahoma](https://www.ou.edu/cas/online/canvas-teaching-tips/speedgrader-annotations)
- [LMS UI/UX Design Tips 2025 — Rise Apps](https://riseapps.co/lms-ui-ux-design/)
- [Mobile-First Learning — EduTech Global](https://edutech.global/mobile-first-learning-next-generation/)
- [UI/UX Design Tips for Child-Friendly Interfaces — Aufait UX](https://www.aufaitux.com/blog/ui-ux-designing-for-children/)
- [E-learning in Vietnam market — NALS Solutions](https://nals.vn/en/blog/2023/01/03/e-learning-in-vietnam-a-potential-market-for-investors/)
- [Education App Design Trends 2025 — Lollypop](https://lollypop.design/blog/2025/august/top-education-app-design-trends-2025/)
- [LMS Notification Best Practices — Tutor LMS](https://tutorlms.com/blog/mastering-communication-in-tutor-lms/)
- [Admin Approval Registration — Moodle Community](https://moodle.org/mod/forum/discuss.php?d=256536)

---

*Feature research for: BuMath LMS — async K-12 math tutoring, Vietnam THCS*
*Researched: 2026-03-23*

---

---

# v3.0 Platform Expansion — New Features Research

**Milestone:** v3.0 Platform Expansion
**Researched:** 2026-07-18
**Scope:** 7 new feature areas added to existing BuMath LMS (v1/v2 already shipped)
**Confidence:** HIGH (core patterns), MEDIUM (YouTube privacy), HIGH (pricing/access patterns)

---

## Context: What's Already Built

This research builds on a shipped system with:
- Auth (student/teacher/admin roles), admin approval gate
- Course/chapter/lesson CRUD, YouTube embed video
- Student: progress tracking (%), handwritten submission upload (photo → compressed < 500KB)
- Teacher: grading queue (score + comment + teacher image annotation)
- Bell notifications (Supabase Realtime), course catalogue + enrollment
- Design system: React + TypeScript + Vite + shadcn/ui + Radix UI + Tailwind
- Backend: Supabase (Auth, PostgreSQL, Storage, RLS)
- Schema tables: `profiles`, `courses`, `chapters`, `lessons`, `enrollments`, `lesson_progress`, `submissions`
- Radix `Tabs` already installed and used in lesson page (TabsList, TabsTrigger, TabsContent)

---

## Feature 1: In-Lesson Chat (Chat với giảng viên)

### What This Feature Does in EdTech Platforms

In LMS platforms (Canvas, Moodle, Google Classroom), per-lesson messaging is typically called "lesson comments," "post a question," or "ask teacher." The pattern is:

- Student sends a text message in the context of a specific lesson
- Teacher sees all messages queued by lesson
- Teacher replies → student receives notification
- Messages are scoped per lesson (not a global inbox)
- No real-time requirement — async is fine (like Canvas's "message teacher" per assignment)

Vietnamese EdTech context: students prefer WhatsApp-style message UX. Expect auto-scroll to bottom. Short messages with emoji support. Not threaded/nested (flat list).

### Table Stakes for This Feature

| Aspect | What Students Expect | Implementation |
|--------|---------------------|----------------|
| Send text message | Simple text box + send button | Supabase `lesson_messages` table |
| See own messages | My messages appear right-aligned | `user_id = auth.uid()` filter |
| See teacher replies | Teacher messages appear left-aligned | `user_id != student_id AND role = teacher` |
| Message timestamp | "Hôm nay lúc 14:30" format | `created_at` column, `date-fns` format |
| Auto-scroll to bottom | Latest message always visible | `useEffect` + `scrollIntoView` |
| Lesson-scoped | Messages only for this lesson | `lesson_id` FK on messages |
| Empty state | "Chưa có tin nhắn nào" | Simple empty state component |

### Differentiators

| Aspect | Value | Notes |
|--------|-------|-------|
| Unread indicator on tab | "Chat (2)" badge when teacher replied | Query unread count |
| Bell notification when teacher replies | Student notified immediately | Reuse existing bell notification system |
| Teacher sees all lessons with unread messages | Priority queue view | Admin sidebar badge |

### Anti-Features (Don't Build These)

| Anti-Feature | Why Not |
|--------------|---------|
| Real-time WebSocket chat | Polling every 30s is sufficient for async teacher-student context. Supabase Realtime adds complexity with reconnect handling on mobile. Defer until teachers complain about latency. |
| File attachment in chat | Students have SubmissionArea for photo uploads. Chat = text only. File upload in chat duplicates submission flow and confuses the mental model. |
| Group chat / class discussion board | Moderation burden. Vietnamese middle schoolers + unmoderated chat = distraction. One teacher replying to many students is the right model. |
| Read receipts per message | Adds complexity with no clear value at this scale. |
| Message editing/deletion | Unnecessary — simple append-only log is sufficient |

### Schema Design

```sql
CREATE TABLE lesson_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) <= 2000),
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- Index for lesson chat queries
CREATE INDEX lesson_messages_lesson_id_created_at ON lesson_messages(lesson_id, created_at);
```

RLS: Students read messages where `lesson_id` matches a lesson in their enrolled courses. Teachers/admin read all. Students insert own. No update/delete for students.

### UI Pattern: Tabbed Layout in LessonContent

The current `LessonContent` component renders everything flat (video → title → assignment file → submission area → progress button). v3.0 tabs restructure this:

```
Tab 1: "Bài giảng"  → video + description + progress button  (current content)
Tab 2: "Chấm bài"   → assignment files + SubmissionArea      (extracted from current)
Tab 3: "Chat"       → lesson_messages list + input box
Tab 4: "Tài liệu"   → study materials for this lesson/grade  (new feature)
```

Mobile UX: On 375px, tabs must use short labels ("Bài giảng", "Chấm bài", "Chat", "Tài liệu"). Chat input must be `position: sticky; bottom: 0` so keyboard doesn't push it off-screen. Keyboard avoidance is critical on iOS Safari.

### Complexity Assessment

**MEDIUM.** New DB table, RLS policies, API functions, one new component (`LessonChat`), notification integration. The Radix Tabs component already exists. Main risk: keyboard avoidance on mobile Safari when chat input is focused.

### Existing System Dependencies

- Requires: `lessons` table (lesson_id FK)
- Requires: auth context (user role determines message alignment)
- Reuses: Bell notification system (trigger when teacher replies)
- Reuses: `@radix-ui/react-tabs` (already installed)
- Modifies: `LessonContent.tsx` → refactored into tabbed layout

---

## Feature 2: Mock Exam System (Thi thử)

### What This Feature Does in EdTech Platforms

Mock exam systems in LMS platforms have several archetypes:

1. **Timed quiz with auto-grading** (Google Forms, Moodle Quiz) — MCQ/fill-in-the-blank, auto-scored
2. **Timed submission window** (Canvas Assignments with due date) — upload answers, manual grading
3. **Practice test mode** (Khan Academy) — attempt as many times as desired, no time limit

For BuMath's context:
- Math = proof-based, written solutions → auto-grading is NOT possible for v3
- "Trắc nghiệm tự chấm" is explicitly deferred in PROJECT.md
- Therefore: **mock exam = timed submission window** — student uploads handwritten answers within an exam window, teacher manually grades
- Admin creates exam sessions (period + grade + problems PDF)
- Student accesses exam during window, sees countdown timer, uploads photo answers
- Teacher grades exam submissions (same flow as lesson submissions)

### Table Stakes for Mock Exam System

| Aspect | What Users Expect | Implementation |
|--------|-------------------|----------------|
| Admin creates exam session | Title, start/end date, target grade, problem PDF | `exam_sessions` table |
| Student sees active exams | List of current/upcoming exams | Filter by date range + grade |
| Countdown timer | Hours:minutes:seconds remaining | `date-fns` + `useEffect` interval |
| Upload answer photo | Camera → compress → upload | Reuse `compressImage` + Supabase Storage |
| "Submitted" confirmation | Clear success state | Same pattern as submission success |
| Student sees own exam score | After teacher grades | Query `exam_submissions` by `user_id` |
| Cannot submit after deadline | Lock UI when `end_time` passes | Client-side check + server-side RLS |
| Admin/teacher grading queue | List of ungraded exam submissions | Similar to existing SubmissionsPage |

### Differentiators

| Aspect | Value | Notes |
|--------|-------|-------|
| Leaderboard after exam closes | Top scores visible to all students in cohort | Motivates competitive students; deferred to v3.1 |
| Past exam archive | Students can review their performance over time | Exam history page |
| Per-exam statistics (admin) | Average score, completion rate | Deferred to v4 analytics |

### Schema Design

```sql
CREATE TABLE exam_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  target_grade  text NOT NULL CHECK (target_grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced')),
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz NOT NULL,
  problem_path  text,    -- Supabase Storage path for problem PDF
  created_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE exam_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id uuid NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path       text NOT NULL,
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  status          text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  score           numeric(5,2),
  comment         text,
  UNIQUE (exam_session_id, user_id)  -- one submission per student per exam
);
```

### Anti-Features

| Anti-Feature | Why Not |
|--------------|---------|
| Auto-grading math problems | Not feasible for handwritten proof-based math. ML/OCR not in scope. |
| Multiple attempts allowed | Defeats the purpose of an exam simulation. Lock to one submission per session. |
| Full online lockdown browser | Overly complex, breaks mobile UX entirely. Vietnamese students at home — honor system. |
| Video proctoring | Privacy concerns, bandwidth requirements, complex infrastructure. Out of scope. |
| IP-based access restriction | Students use mobile networks with dynamic IPs. Wrong tool. |

### UI Flows

**Student flow:**
1. `/thi-thu` — List of available exam sessions (upcoming + active + past)
2. Active exam card shows countdown: "Còn 2 giờ 14 phút"
3. Click "Làm bài" → exam page with: problem PDF download + upload area + countdown
4. Upload photo → "Đã nộp bài thi" confirmation
5. Past exam card shows "Điểm: 8.5/10" after grading

**Admin flow:**
1. `/admin/thi-thu` — List of exam sessions
2. "Tạo kỳ thi" → form (title, grade, start/end date, upload problem PDF)
3. `/admin/thi-thu/:id/bai-nop` — List of submissions for this exam → same grading UI as existing GradingPage

**Mobile UX concern:** Countdown timer must be visible at all times. Use sticky header with countdown on exam page. Camera upload flow same as existing SubmissionArea — already optimized for mobile.

### Complexity Assessment

**MEDIUM-HIGH.** Two new tables, new page routes, countdown timer UI, storage bucket for exam problems, grading queue extension. The grading flow is reusable from existing teacher UI. Main risk: timer synchronization (client clock vs server — use `ends_at` from DB, not local countdown).

### Existing System Dependencies

- Reuses: `compressImage`, `uploadSubmission` patterns from `submissions.ts`
- Reuses: GradingPage component pattern for exam submission grading
- Reuses: Bell notification system
- Reuses: existing admin layout + table patterns
- New: `exam_sessions` + `exam_submissions` tables

---

## Feature 3: Study Materials Library (Thư viện tài liệu)

### What This Feature Does in EdTech Platforms

Study material libraries in EdTech are essentially categorized file repositories. Pattern used by every major Vietnamese EdTech platform (Hocmai, Olm.vn, VioEdu):

- Files stored by type × grade × topic
- Students download; no interactivity required
- Admin uploads; no student uploads
- Access controlled by enrollment/package

For BuMath's specific taxonomy:
```
Category dimension:
  - Đề thi giữa kỳ (midterm exam)
  - Đề thi cuối kỳ (final exam)
  - Đề thi vào 10 (high school entrance)
  - HSG cấp trường / cấp huyện / cấp tỉnh (academic competitions)
  - Đội tuyển (national competition prep)
  - Ôn thi trường chuyên (specialized school prep)
  - Ôn thi Tứ trụ: PTNK / CNN / CSP / KHTN

Grade dimension: Lớp 7 / Lớp 8 / Lớp 9

Year dimension: 2020–2025 exam papers (optional metadata)
```

### Table Stakes for Study Materials

| Aspect | What Users Expect | Implementation |
|--------|-------------------|----------------|
| Browse by category + grade | Filter/tab UI | Client-side filter on fetched list |
| PDF download | Opens in browser or downloads | Supabase Storage signed URL |
| Admin upload | Upload PDF → add metadata | Admin form + Storage |
| Material title + description | Know what you're downloading | Text fields in DB |
| File size display | "2.4 MB" visible before download | Store `file_size_bytes` in DB |
| Empty state per filter | "Chưa có tài liệu" | Simple empty state |

### Differentiators

| Aspect | Value | Notes |
|--------|-------|-------|
| Preview before download | PDF.js inline preview | MEDIUM complexity — defer |
| "Mới nhất" badge | Show recently added materials | Simple `created_at` sort + badge |
| Materials linked to specific lessons | "Tài liệu liên quan" in lesson tab | Lesson-material junction table |

### Schema Design

```sql
CREATE TABLE study_materials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  category      text NOT NULL CHECK (category IN (
                  'midterm', 'final', 'entrance_grade10',
                  'hsg_school', 'hsg_district', 'hsg_province',
                  'doi_tuyen', 'chuyen_ptnk', 'chuyen_cnn',
                  'chuyen_csp', 'chuyen_khtn', 'chuyen_other'
                )),
  target_grade  text CHECK (target_grade IN ('grade_7', 'grade_8', 'grade_9', 'all')),
  file_path     text NOT NULL,    -- Supabase Storage path
  file_size_bytes bigint,
  school_year   text,             -- e.g. "2023-2024" (optional)
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES auth.users(id)
);
```

Storage: `materials` bucket (public reads for enrolled students, admin writes only).

### Access Control Decision

**Option A:** All enrolled students can access all materials (simple).
**Option B:** Materials gated by pricing package (complex — depends on Feature 4).

**Recommendation:** Ship Option A first (all enrolled = can access). Add package gating in same phase as pricing tiers (Feature 4). The schema is the same; access control is the only change.

### UI Pattern

Student side: `/tai-lieu` page with:
- Tab strip: All | Giữa kỳ | Cuối kỳ | Vào 10 | HSG | Chuyên PTNK | Chuyên CNN | ...
- Grade filter: dropdown (Tất cả / Lớp 7 / Lớp 8 / Lớp 9)
- Card grid: title, category badge, grade badge, file size, download button
- Mobile: single column card list with 48px download button

Admin side: `/admin/tai-lieu` with upload form + table list + delete.

### Anti-Features

| Anti-Feature | Why Not |
|--------------|---------|
| Student uploads to materials library | Materials library is curated teacher content. Student uploads belong in SubmissionArea. Don't mix these two flows. |
| Comments/ratings on materials | Moderation burden. Not needed at this scale. |
| Material versioning | Overkill. Admin deletes old and uploads new. |
| In-browser PDF annotation | Complex. Students can download and annotate locally. |

### Complexity Assessment

**LOW-MEDIUM.** New table, new storage bucket, two new page routes (admin upload + student browse). Filter UI is simple. Main consideration: category taxonomy must be decided upfront — changing it later requires a migration.

### Existing System Dependencies

- New: `study_materials` table + `materials` Storage bucket
- Optional integration: lesson tab "Tài liệu" shows materials by grade (filter from lesson's course grade)
- Access controlled by: enrollment (v3.0) → package (v3.0 if built together with Feature 4)

---

## Feature 4: Pricing Tiers + Access Control (Gói học phí)

### How Pricing Tiers Work in EdTech Platforms

Pricing tiers in EdTech platforms (Udemy, Coursera, Vietnamese platforms like Hocmai Pro) have two architecture patterns:

**Pattern A: Course-level purchase** — buy individual courses, access that course.
**Pattern B: Subscription/package** — buy a package, access a set of courses.

BuMath uses Pattern B with manual enrollment (no payment gateway). Admin assigns student to a package; package grants access to a defined set of courses.

### Defined Packages (from milestone context)

| Package | Price (VND) | What's Included |
|---------|-------------|-----------------|
| Lớp 7 | 1,500,000 | Grade 7 courses |
| Lớp 8 | 1,500,000 | Grade 8 courses |
| Lớp 9 cấp tốc 9→10 | 2,000,000 | Grade 9 accelerated courses |
| Ôn thi chuyên Toán | 3,000,000 | Specialized exam prep courses |
| Tứ trụ (PTNK/CNN/CSP/KHTN) | 2,500,000 | Top-4 school prep courses |
| All-access | 4,000,000 | All courses |

### Table Stakes for Pricing + Access Control

| Aspect | What Admins/Students Expect | Implementation |
|--------|----------------------------|----------------|
| Admin assigns student to package | Replace or augment existing enrollment UI | Admin form: select user → select package |
| Student can only view lessons in their package | Access gate on lesson page | Check `user_packages` + `package_courses` before showing video |
| "Khóa" (locked) state for inaccessible lessons | Lock icon + "Nâng cấp gói học" CTA | Existing Lock icon already in codebase (imported in CourseDetailPage) |
| Pricing page visible to all | Show packages + prices | New `/bang-gia` route or landing page section |
| Admin can view student's current package | User management table shows package column | JOIN on `user_packages` |
| Package displayed on student profile | Student knows what they have | Profile query includes package |

### Schema Design

```sql
-- Define packages (seeded by admin, rarely changes)
CREATE TABLE packages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,           -- "Lớp 7", "All-access", etc.
  slug        text NOT NULL UNIQUE,    -- "grade_7", "all_access"
  price_vnd   integer NOT NULL,        -- 1500000, 4000000
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Link packages to courses (many-to-many)
CREATE TABLE package_courses (
  package_id  uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, course_id)
);

-- Assign students to packages (replaces or supplements enrollments)
CREATE TABLE user_packages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id    uuid NOT NULL REFERENCES packages(id),
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  assigned_by   uuid REFERENCES auth.users(id),  -- admin who assigned
  expires_at    timestamptz,                      -- NULL = indefinite
  UNIQUE (user_id, package_id)
);
```

### Access Gate Architecture Decision

**Critical decision:** Do we replace the existing `enrollments` table, augment it, or keep them parallel?

**Recommendation: Keep `enrollments` as the access truth, populate it automatically from packages.**

Rationale:
- `enrollments` is already used by CourseDetailPage, lesson queries, submission checks, progress tracking — all those RLS policies reference `enrollments`
- Changing the access gate from enrollments → packages would require rewriting all RLS
- Instead: when admin assigns a package to a student, auto-insert enrollment rows for all courses in that package
- This is a trigger or Edge Function: `ON INSERT TO user_packages → INSERT INTO enrollments FOR each course in package_courses`
- Benefits: zero RLS changes; existing lesson/progress/submission access stays intact; packages layer sits above

```sql
-- Trigger: when package assigned, auto-enroll in all package courses
CREATE OR REPLACE FUNCTION auto_enroll_from_package()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO enrollments (user_id, course_id)
  SELECT NEW.user_id, pc.course_id
  FROM package_courses pc
  WHERE pc.package_id = NEW.package_id
  ON CONFLICT (user_id, course_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_package_assigned
  AFTER INSERT ON user_packages
  FOR EACH ROW EXECUTE FUNCTION auto_enroll_from_package();
```

### Anti-Features

| Anti-Feature | Why Not |
|--------------|---------|
| Payment gateway (VNPay/Stripe/MoMo) | Explicitly out of scope per PROJECT.md. Legal complexity, integration time. Admin manually confirms bank transfer, then assigns package. |
| Time-limited package expiry enforced in RLS | Complexity without value at this scale. If expiry needed, admin manually removes package. |
| Student self-upgrade UI | Students contact teacher/admin via Zalo. No self-service payment flow. |
| Per-lesson pricing | Too granular. Packages are the right abstraction. |
| Trial/free tier with lesson count limit | Adds state tracking complexity. Free = catalogue preview mode (already exists). |

### Pricing Display (Vietnamese Context)

- Format: "1.500.000 đ" (not 1,500,000 VND — Vietnamese convention uses dot as thousands separator)
- Display prominently on landing page and `/danh-muc` catalogue
- Locked lessons: show lock icon + package name ("Cần gói Ôn thi chuyên Toán")
- Contact CTA: "Liên hệ đăng ký" → phone/Zalo link (existing pattern from landing page)

### Complexity Assessment

**MEDIUM.** New tables (packages, package_courses, user_packages), trigger function, admin UI for package assignment, pricing display on landing/catalogue. The key implementation insight: auto-enrollment trigger means zero changes to existing lesson access flow. Main risk: ensuring the trigger fires correctly and handles re-assignment.

### Existing System Dependencies

- Modifies: Admin `UsersPage` (add package assignment UI)
- Modifies: `CourseDetailPage` (show lock state for non-enrolled lessons)
- Modifies: `CataloguePage` (show price + package name)
- Reuses: Existing `enrollments` table as access truth
- New: `packages`, `package_courses`, `user_packages` tables

---

## Feature 5: School Navigator (Điều hướng trường chuyên)

### What This Feature Does in EdTech Platforms

School navigator is a landing page discovery widget — a guided "find your course" funnel. Similar patterns:

- Coursera: "Browse by topic" → filter by career goal → recommended courses
- Khan Academy: "Choose your grade" → jump to content
- Hocmai: School-based course recommendations

For BuMath: specialized high schools in HCMC are the target. Student selects their target school → system routes to the matching course. The widget is landing-page level (no auth required).

### HCMC Specialized Schools Taxonomy

The "Tứ trụ" (Top 4) and broader specialized school list:
```
Tứ trụ (Top 4):
  - PTNK — Phổ Thông Năng Khiếu (ĐHQG)
  - CNN  — THPT Chuyên Nguyễn Thượng Hiền
  - CSP  — THPT Chuyên Lê Hồng Phong
  - KHTN — Năng Khiếu Khoa học Tự nhiên (ĐHKHTN)

Other specialized schools in HCMC:
  - THPT Chuyên Trần Đại Nghĩa
  - THPT Chuyên Nguyễn Hữu Huân (Thủ Đức)
  - THPT Chuyên Nguyễn Thị Minh Khai
  - THPT Chuyên Lương Thế Vinh (Biên Hòa, Đồng Nai — adjacent)
  - Phổ thông năng khiếu Bình Dương (adjacent)
```

### Table Stakes

| Aspect | What Users Expect | Implementation |
|--------|-------------------|----------------|
| Select school from list | Dropdown or card grid | Static array of schools |
| Click "Tìm" | Navigate/scroll to matching course | `navigate('/danh-muc?school=ptnk')` or scroll to course section |
| Visual school logos/icons | Makes it feel polished | CSS icons or emoji flags; actual logos = copyright risk |
| Clear "not found" state | If no course matched | "Khóa học đang được chuẩn bị. Đăng ký để nhận thông báo." |
| Works on mobile | Touch-friendly select | Native `<select>` or Radix Select (already installed) |

### Implementation Approach: Static Data Map

The school → course mapping should be **static** (hard-coded in a constants file), not DB-driven:

```typescript
// src/lib/constants/schools.ts
export const SCHOOL_COURSE_MAP: Record<string, { name: string; courseSlug: string | null }> = {
  ptnk:  { name: 'Phổ Thông Năng Khiếu',           courseSlug: 'on-thi-ptnk' },
  cnn:   { name: 'Chuyên Nguyễn Thượng Hiền',       courseSlug: 'on-thi-cnn' },
  csp:   { name: 'Chuyên Lê Hồng Phong',            courseSlug: 'on-thi-csp' },
  khtn:  { name: 'Năng Khiếu Khoa Học Tự Nhiên',    courseSlug: 'on-thi-khtn' },
  tdn:   { name: 'Chuyên Trần Đại Nghĩa',           courseSlug: null },         // no course yet
  nhh:   { name: 'Chuyên Nguyễn Hữu Huân',          courseSlug: null },
}
```

Rationale: The list of specialized schools is fixed (maybe 10-15 total). DB overhead is unnecessary. A simple `constants/schools.ts` is maintainable and faster.

### Anti-Features

| Anti-Feature | Why Not |
|--------------|---------|
| AI-powered school recommendation | Overkill. The student knows which school they're targeting. |
| Full-page school detail pages | Out of scope. This is a navigation widget on the landing page, not a school database. |
| User-submitted school reviews | Moderation burden. Wrong product direction. |
| DB-driven school list | 10-15 schools never change. Static constants are better. No migration needed to update. |

### UX Pattern

Landing page section: "Bạn đang ôn thi trường nào?"

```
[Card grid of schools with logo/icon + name]
[PTNK] [CNN] [CSP] [KHTN]
[Trần Đại Nghĩa] [Nguyễn Hữu Huân] [Khác...]

→ Click card → navigate to /danh-muc?grade=advanced&school=ptnk
  OR scroll to the matching course section if already on landing page
```

Mobile UX: School cards in 2-column grid. Minimum 80px card height. Highlight selected card with border color. Single "Tìm khóa học" CTA button.

### Complexity Assessment

**LOW.** This is a UI widget with static data and a navigate call. No DB changes. No auth required. One new component (`SchoolNavigator.tsx`), one constants file, possible `CataloguePage` filter extension.

### Existing System Dependencies

- Reuses: `react-router-dom` navigate
- Reuses: `CataloguePage` (may need `?school=` query param support)
- No DB changes required
- Modifies: Landing page `Index.tsx` (add new section)

---

## Feature 6: Admin Full-Page Forms (Thêm chuyên đề / Thêm bài giảng)

### What This Feature Does

Currently, admin adds chapters and lessons via **modal dialogs** (`ChapterFormDialog`, `LessonFormDialog` components). The v3.0 request is to move these to **dedicated full-page routes** that reuse student-side UI patterns (card layouts, visual design system).

This is the industry-standard pattern for admin content management: modal → page migration happens when forms grow in complexity (e.g., when adding more fields like materials, settings, visibility flags).

### Why This Matters (UX Case)

| Modal Dialogs (current) | Full-Page Forms (v3.0) |
|------------------------|----------------------|
| Constrained viewport space | Full page for complex fields |
| Can't navigate to directly | Direct URL → bookmarkable, shareable |
| Lost on page refresh | Page refresh = reload form state |
| Feels cramped with many fields | All fields visible without scroll confusion |
| No breadcrumb context | Full breadcrumb: Courses → Chapter → Add Lesson |

### Table Stakes

| Aspect | Expectation | Implementation |
|--------|-------------|----------------|
| Dedicated URL for Add Chapter | `/admin/khoa-hoc/:slug/them-chuyen-de` | New route + page component |
| Dedicated URL for Add Lesson | `/admin/khoa-hoc/:slug/chuyen-de/:chapterSlug/them-bai-giang` | New route + page component |
| Dedicated URL for Edit Chapter | `/admin/khoa-hoc/:slug/chuyen-de/:chapterSlug/chinh-sua` | Edit variant |
| Dedicated URL for Edit Lesson | `/admin/khoa-hoc/:slug/chuyen-de/:chapterSlug/bai/:lessonSlug/chinh-sua` | Edit variant |
| Breadcrumb navigation | Shows context hierarchy | Reuse existing Breadcrumb component |
| Form validation same as modal | Zod schema unchanged | Lift schema from existing dialog |
| Cancel → back to parent | "Hủy" button navigates back | `navigate(-1)` |
| Success → back to parent | After save, redirect to parent page | Same as "Hủy" |

### Reuse Student-Side UI Patterns

"Reuse student-side UI patterns" means: match the visual weight, card style, and spacing used in student-facing pages (CourseDetailPage, CataloguePage) rather than the utilitarian admin table style. This creates visual consistency between what admin creates and what students see.

Specific patterns to reuse:
- `Card` + `CardContent` wrapper for form sections
- `Separator` between form sections
- `48px` min height for all inputs and buttons
- Section headers in the same weight as student page headings
- "Be Vietnam Pro" typography consistent with student pages

### Anti-Features

| Anti-Feature | Why Not |
|--------------|---------|
| Keep modals for simple forms, page for complex | Creates inconsistency. Pick one pattern and use it everywhere. Full-page is the winner. |
| Auto-save drafts | Adds DB complexity. Form is short enough that accidental loss is low risk. |
| Multi-step wizard for lesson creation | Overengineering for a 5-field form. Single page with sections. |

### Complexity Assessment

**LOW.** This is a routing + component refactor. The form fields, validation schemas, and API calls already exist in the modal dialogs — they're being relocated, not rewritten. Primary work: new page components, new routes in `App.tsx`, breadcrumb updates.

### Existing System Dependencies

- Reuses: `ChapterFormDialog`'s Zod schema + `useMutation` logic → extract to shared hook
- Reuses: `LessonFormDialog`'s Zod schema + `useMutation` logic
- Modifies: `App.tsx` — add 4 new admin routes
- Modifies: `ChaptersPage`, `LessonsPage` — change "Add" buttons from dialog-open to `navigate()`

---

## Feature 7: YouTube Privacy Strategy (Video private/unlisted)

### The Core Problem

BuMath embeds YouTube videos in lessons. If students share video links, non-subscribers can watch for free. The question: how to keep videos accessible only within the BuMath platform?

### YouTube's Privacy Options

| Mode | Embeddable | Link sharable | Domain restriction | Notes |
|------|------------|---------------|-------------------|-------|
| Public | ✓ | ✓ | ✗ | Anyone can find in search |
| Unlisted | ✓ | ✓ | ✗ | Not in search; anyone with link can watch |
| Private | ✗ | ✗ | N/A | Cannot be embedded |
| Members-only | ✓ | ✓ | ✗ | Requires YouTube channel membership |

**The fundamental constraint: YouTube provides no per-domain embedding restriction for standard accounts.** The `allow="..."` attribute on iframe controls what the iframe is *allowed to do* — not who is allowed to view it.

### What Platforms Do in Practice

**EdTech platforms with similar constraints typically use one of:**

1. **Accept unlisted (most common for small platforms):** Videos are unlisted; the risk of link sharing is accepted. Mitigation: obscure video IDs (YouTube auto-generates these), no discoverable patterns. Student must be logged in to BuMath to even see the video URL.

2. **Vimeo Pro / Wistia / Bunny.net with domain restriction:** Paid video hosts that support per-domain embedding restriction. Vimeo Pro ($75/mo) supports "only embed on domain: bumath.vn". This is the proper solution but requires migrating off YouTube.

3. **YouTube API + signed token proxy:** A server-side proxy that validates the user is authenticated to BuMath before serving a redirect to the YouTube embed URL. **Does not work** — YouTube URLs are not signed/expiring; once a user sees the URL, they can share it.

4. **Obfuscated YouTube embed URL with Referrer-Policy:** Set `Referrer-Policy: no-referrer` on the site. This prevents YouTube from knowing the embed origin, but also means YouTube's own domain restriction (for Enterprise accounts) won't work. Counter-productive.

5. **YouTube Privacy-Enhanced Mode (youtube-nocookie.com):** Reduces YouTube tracking but provides no access control. The video is still publicly accessible.

### Recommended Strategy for v3.0

**Keep unlisted + implement multiple deterrent layers:**

**Layer 1: Unlisted videos (current/required)**
- All lesson videos → unlisted on YouTube
- Video IDs are random and non-guessable (YouTube generates them)
- Students cannot find videos in YouTube search

**Layer 2: Remove video URL from DOM when unenrolled**
- Current code already does this: `isEnrolled ? <iframe src={...} /> : <Lock icon />`
- Unenrolled visitors see no video URL in the DOM → cannot extract it
- Add: do not include `video_url` in API response for unenrolled users (RLS or application layer)

**Layer 3: Content-Security-Policy (informational)**
- `frame-ancestors 'self'` prevents *your* pages from being embedded in other sites
- Does not prevent YouTube from being embedded in other sites
- Useful for preventing clickjacking of BuMath itself, but unrelated to YouTube privacy

**Layer 4: YouTube's Embeds restriction (Enterprise only)**
- YouTube Studio → Content → Restrict embed domains
- Only available for YouTube for Education / Google Workspace accounts
- **Not available for standard personal/brand YouTube channels**
- If BuMath creates a Google Workspace for Education account: free; embed domain restriction becomes available

**Layer 5: Application-level referrer check (MEDIUM complexity)**
- The BuMath API could serve video URLs as signed short-lived tokens
- But: once the user has the YouTube URL (visible in browser DevTools), the token system is bypassed
- Security through obscurity at best; not worth the complexity

**Honest Assessment:**

True domain-based embedding restriction for YouTube videos requires either:
- A **Google Workspace for Education account** (free for schools, but BuMath is a private tutoring company — may not qualify)
- **Migrating to Vimeo Pro/Wistia/Bunny.net** ($30-75/mo) which natively support domain restriction
- Accepting that unlisted + auth gate + RLS is "good enough" for the threat model (students sharing links with friends)

**For v3.0 recommendation:** Implement Layer 1 + Layer 2 (already partly done). Document Layer 4 as a future path if the business grows and video sharing becomes a significant revenue leak. Do NOT over-engineer a proxy/token system — it provides false security.

### What to Build in v3.0

| Action | Work Required |
|--------|--------------|
| Audit: verify all lesson `video_url` entries are unlisted | Admin checklist; no code |
| Ensure `video_url` not exposed to unenrolled users via API | Check Supabase RLS on `lessons` table — policy should gate by enrollment |
| Add `frame-ancestors 'self'` to Vercel security headers | 2-line `vercel.json` change |
| Document: future path → Vimeo Pro if video leak becomes issue | Architecture decision in PROJECT.md |

### Complexity Assessment

**LOW (for the recommended approach).** No new features needed. The main work is: RLS audit, Vercel headers, and documentation. The temptation to over-engineer this (signed URLs, proxy layers) is a trap — resist it.

### Existing System Dependencies

- Modifies: `vercel.json` (add security headers)
- Audit: Supabase `lessons` RLS — verify `video_url` column not returned for unenrolled queries
- No React component changes required

---

## v3.0 Feature Dependencies

```
[Pricing + Access Control (Feature 4)]
    └──builds on──> [Enrollments (existing)]
    └──auto-generates──> [Enrollments via trigger]
    └──enables gating for──> [Study Materials (Feature 3)]
    └──enables gating for──> [Mock Exams (Feature 2)]

[In-Lesson Chat (Feature 1)]
    └──requires──> [Lessons (existing)]
    └──requires──> [Auth + Roles (existing)]
    └──reuses──> [Bell Notification system (existing)]
    └──requires──> [Lesson Tabs restructure]

[Lesson Tabs restructure]
    └──enables──> [In-Lesson Chat tab]
    └──enables──> [Study Materials tab in lesson context]
    └──restructures──> [LessonContent (existing)]

[Mock Exam System (Feature 2)]
    └──reuses──> [compressImage + photo upload (existing)]
    └──reuses──> [GradingPage patterns (existing)]
    └──requires──> [exam_sessions + exam_submissions tables (new)]

[Study Materials (Feature 3)]
    └──requires──> [study_materials table + materials Storage bucket (new)]
    └──optionally gated by──> [Pricing Packages (Feature 4)]

[School Navigator (Feature 5)]
    └──requires──> [CataloguePage filter extension]
    └──purely frontend──> [static constants file]

[Admin Full-Page Forms (Feature 6)]
    └──refactors──> [ChapterFormDialog + LessonFormDialog (existing)]
    └──requires──> [new routes in App.tsx]

[YouTube Privacy (Feature 7)]
    └──audits──> [lessons RLS (existing)]
    └──modifies──> [vercel.json (existing)]
```

### Dependency-Derived Build Order

1. **Feature 7** (YouTube Privacy) — audit-only, 0 dependencies, clears tech debt
2. **Feature 6** (Admin Full-Page Forms) — isolated refactor, enables richer lesson creation for Features 2/3
3. **Feature 4** (Pricing + Access Control) — schema foundation; other features (2, 3) can be gated by packages
4. **Feature 3** (Study Materials) — self-contained, benefits from pricing being in place
5. **Feature 5** (School Navigator) — no dependencies, can be built any time; purely frontend
6. **Feature 1** (In-Lesson Chat) — requires lesson tab restructure; significant UX change to core lesson page
7. **Feature 2** (Mock Exams) — most complex; new entity type, new flows, requires grading queue extension

---

## v3.0 Table Stakes vs Differentiators

### Table Stakes (must ship in v3.0 for the milestone to feel complete)

| Feature | Why Expected |
|---------|--------------|
| Pricing display on landing + catalogue | Users expect to see what they're paying for before signing up |
| Package-based access gate (lock icon for unowned courses) | Industry standard; Hocmai, Udemy all do this |
| Study materials downloadable by enrolled students | Vietnamese students expect "đề thi thử" to be available digitally |
| Mock exam with countdown + upload | Simulated exam conditions are expected for "ôn thi" prep |
| Admin can assign packages to students | Admin must be able to operate the business manually |
| Chat in lesson context | Students expect to ask questions about the lesson they're watching, not via separate Zalo |

### Differentiators (set BuMath apart)

| Feature | Why It's a Differentiator |
|---------|--------------------------|
| School navigator on landing page | No Vietnamese math tutoring platform has school-targeted course routing |
| Per-lesson teacher chat (not class-wide discussion) | 1-on-1 feel within an online course; maintains the personal tutoring promise |
| Tứ trụ (Top 4) focused exam prep materials | Very specific to HCMC competitive math scene; no generic platform can match this |
| Mock exams as part of the learning flow (not a separate test portal) | Integrated UX vs Zalo groups sending PDFs manually |

### Anti-Features for v3.0

| Anti-Feature | Why Not | What To Do Instead |
|--------------|---------|-------------------|
| Payment gateway (VNPay/Stripe/MoMo) | Legal complexity, integration effort, scope explosion | Admin confirms bank transfer → assigns package manually |
| Real-time chat (WebSocket/Supabase Realtime) | Mobile battery drain, reconnect complexity | Poll messages on chat tab open (30s interval or on focus) |
| Auto-graded mock exams | Not feasible for handwritten math proofs | Manual grading using existing teacher workflow |
| True YouTube domain restriction (complex proxy) | No actual security gain; students can always screen-record | Unlisted + auth gate is sufficient deterrent |
| PDF annotation in browser | High complexity (canvas overlay), low priority | Download PDF, annotate locally, re-upload |
| Student self-service package upgrade flow | Requires payment infrastructure | Students contact teacher via Zalo/phone |
| Separate "exam portal" as standalone app | Scope explosion | Integrate into existing student experience at `/thi-thu` |
| Grade 10/11/12 expansion | Out of scope for v3.0; dilutes brand | BuMath = THCS specialist; keep focused |

---

## Mobile-First UX Considerations per v3.0 Feature

### Feature 1: In-Lesson Chat
- **Keyboard avoidance is critical**: iOS Safari pushes content when keyboard appears. Use `position: sticky; bottom: 0` for the chat input bar, and test that messages stay scrollable above it.
- **Short labels on tabs**: "Chat" not "Chat với giảng viên" (too long for 375px tab strip)
- **Message send on Enter key (desktop) + send button (mobile)**: Vietnamese students type on phone, not keyboard — button must be the primary action

### Feature 2: Mock Exam
- **Countdown timer visibility**: Must be visible without scrolling on 375px screen. Use sticky header or floating badge.
- **One-tap camera launch**: `accept="image/*" capture="environment"` on file input — same as existing SubmissionArea
- **No "Go Back" during exam**: Prevent accidental navigation away; use `window.onbeforeunload` warning

### Feature 3: Study Materials
- **Download vs open in browser**: On iOS, PDFs can be opened in Safari. On Android, they download. Use `download` attribute but also offer "Mở" (open in new tab). Don't assume one behavior.
- **File size warning**: Show "2.4 MB" before download. On 3G, a 5MB PDF is a 30-second download.
- **Category filter as horizontal scroll tabs** not dropdown (dropdown on mobile requires extra tap)

### Feature 4: Pricing Tiers
- **VND formatting**: `1.500.000 đ` — use `Intl.NumberFormat('vi-VN')` for consistent formatting
- **Package comparison card**: Mobile = vertical stack of cards; not a comparison table (tables break on 375px)
- **Lock state**: Lock icon + "Cần gói X" text must fit in the lesson sidebar item without truncation

### Feature 5: School Navigator
- **Card grid not dropdown**: On mobile, tapping a card is easier than a select dropdown. 2-column grid of 80px school cards.
- **"Tìm ngay" CTA**: Large primary button (full-width on mobile) immediately after school selection

### Feature 6: Admin Full-Page Forms
- **Admin uses desktop**: Forms are built for admin (desktop/laptop). Mobile is secondary. 48px tap targets still required but layout can be wider than 375px.
- **File upload for lesson**: Admin uploading PDFs from desktop — drag-and-drop is acceptable here.

### Feature 7: YouTube Privacy
- No mobile-specific considerations. The `youtube-nocookie.com` embed URL is worth using for GDPR and slightly better behavior on restricted networks.
- Embed `allowfullscreen` attribute should remain — fullscreen is expected by students watching on phone.

---

## Sources

- Supabase Realtime docs — supabase.com/docs/guides/realtime
- YouTube Help — Embed YouTube videos (unlisted vs private) — support.google.com/youtube/answer/171780
- YouTube Studio Help — Restrict videos to specific domains — support.google.com/youtube/answer/6181865 (Enterprise only)
- Vimeo Privacy Controls — vimeo.com/features/video-privacy (domain embedding restriction)
- Bunny.net Stream — bunny.net/stream (domain restriction, $10/mo base)
- Canvas LMS — Per-assignment messaging pattern — community.canvaslms.com
- Content-Security-Policy: frame-ancestors — MDN Web Docs (HIGH confidence — verified, not YouTube-related)
- Vietnamese number formatting — `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- iOS Safari keyboard avoidance patterns — webkit.org/blog/5610/more-responsive-tapping-on-ios

---

*Feature research for: BuMath LMS v3.0 — Platform Expansion*
*Researched: 2026-07-18*
