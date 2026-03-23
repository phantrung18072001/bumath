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
