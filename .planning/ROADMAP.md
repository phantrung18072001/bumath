# Roadmap: BuMath LMS

## Overview

BuMath evolves from a static marketing landing page into a full async LMS. The journey: establish a production-grade deployment and Supabase foundation, then layer in user authentication with role-based access control, then give admins the tools to build course content, then give students the core learning and submission experience, and finally close the feedback loop with teacher grading and student notifications. Each phase delivers a coherent, independently verifiable capability that unlocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Deploy to Vercel, wire up Supabase client, establish infrastructure baseline
- [ ] **Phase 2: Auth & Access Control** - Registration, login, session, role-based routing, admin approval workflow
- [ ] **Phase 3: Course Management** - Admin CRUD for courses, lessons, assignments, and enrollment
- [ ] **Phase 4: Student Learning & Submission** - Course browsing, video lessons, progress tracking, photo upload
- [ ] **Phase 5: Grading & Notification** - Teacher grading queue, score/comment entry, student grade view, email notification

## Phase Details

### Phase 1: Foundation
**Goal**: Production infrastructure is in place — app is served from Vercel with SPA routing, and Supabase is wired in as the backend client
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03
**Success Criteria** (what must be TRUE):
  1. Navigating directly to any deep URL (e.g. `/courses/123`) returns the app, not a 404
  2. The Supabase client can be imported anywhere in the codebase from `src/lib/supabase.ts` without errors
  3. Environment variables for Supabase URL and anon key are loaded by Vite in both dev and production builds
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Vercel migration, Supabase client install and singleton creation
- [ ] 01-02-PLAN.md — Vercel + Supabase dashboard setup and deployment verification

### Phase 2: Auth & Access Control
**Goal**: Users can securely register, log in, and access only the areas their role permits — with an admin approval gate before students reach any content
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, ROLE-01, ROLE-02, ROLE-03, UX-03
**Success Criteria** (what must be TRUE):
  1. A new visitor can register with email and password and lands on a "pending approval" screen
  2. A logged-in user's session persists across browser reloads without re-authenticating
  3. Any logged-in user can log out from any page and is redirected to the login screen
  4. Admin can view a list of pending accounts and approve or reject each one
  5. A student who has not been approved cannot access course pages — they see the pending screen
  6. All UI text, labels, and messages are in Vietnamese
**Plans**: 6 plans
**UI hint**: yes

Plans:
- [x] 02-01-PLAN.md — Auth types, validators, AuthContext, ProtectedRoute
- [x] 02-02-PLAN.md — Login, Register, Pending pages
- [x] 02-03-PLAN.md — Admin UsersPage with approve/reject
- [x] 02-04-PLAN.md — Gap closure: Wire admin route in App.tsx with ProtectedRoute
- [x] 02-05-PLAN.md — Gap closure: Add auth-aware logout to Header
- [x] 02-06-PLAN.md — Gap closure: RLS policies SQL migration for profiles table

### Phase 3: Course Management
**Goal**: Admin has full control to build the course catalogue — courses, ordered lessons with YouTube videos, assignment attachments, and student enrollment — so content exists for students to consume
**Depends on**: Phase 2
**Requirements**: COURSE-01, COURSE-02, COURSE-03, COURSE-04, COURSE-05
**Success Criteria** (what must be TRUE):
  1. Admin can create, edit, and delete a course with a name, description, and grade target (7, 8, 9, or chuyên)
  2. Admin can add lessons to a course with a title, YouTube URL, description, and sort order, and reorder them
  3. Admin can attach a PDF or image file as an assignment to any lesson
  4. Admin can enroll a specific student in a course, making that course visible only to enrolled students
**Plans**: TBD
**UI hint**: yes

### Phase 4: Student Learning & Submission
**Goal**: Enrolled, approved students can browse their courses, watch lessons, track their own progress, and submit handwritten assignment photos
**Depends on**: Phase 3
**Requirements**: LEARN-01, LEARN-02, LEARN-03, LEARN-04, LEARN-05, SUBMIT-01, SUBMIT-02, SUBMIT-03, SUBMIT-04, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. After login, a student immediately sees only the courses they are enrolled in
  2. A student can open a lesson and watch the embedded YouTube video without leaving the app
  3. A student can mark a lesson as complete, and the course progress bar updates to reflect the new percentage
  4. A student can photograph their handwritten work and upload it as a submission — the image is compressed client-side before upload
  5. Each assignment shows a clear status label: "Chưa nộp," "Đã nộp," or "Đã chấm"
  6. All submission and lesson interactions work correctly on a 375px mobile viewport with 48px tap targets
**Plans**: 5 plans
**UI hint**: yes

Plans:
- [x] 04-01-PLAN.md — Install deps, DB schema SQL, API modules (lesson-progress, submissions)
- [x] 04-02-PLAN.md — StudentLayout, CoursesPage, student route wiring
- [x] 04-03-PLAN.md — CourseDetailPage with sidebar, YouTube embed, mark complete
- [x] 04-04-PLAN.md — SubmissionArea with image compression and upload
- [ ] 04-05-PLAN.md — Visual and functional verification checkpoint

### Phase 5: Grading & Notification
**Goal**: Teachers can efficiently work through ungraded submissions, enter scores and comments, and students are notified and can view their results — completing the async feedback loop that is the product's core value
**Depends on**: Phase 4
**Requirements**: GRADE-01, GRADE-02, GRADE-03, GRADE-04, GRADE-05
**Success Criteria** (what must be TRUE):
  1. A teacher sees a queue of all ungraded submissions and can open any submission to view the student's photo at full resolution
  2. A teacher can enter a numeric score and a text comment on a submission and save it
  3. After a teacher saves a grade, the student receives an email notification
  4. A student can open their graded submission and see the score and teacher comment alongside their submitted photo
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/2 | In Progress|  |
| 2. Auth & Access Control | 6/6 | Complete | 2026-03-24 |
| 3. Course Management | 4/5 | In Progress|  |
| 4. Student Learning & Submission | 4/5 | In Progress|  |
| 5. Grading & Notification | 0/? | Not started | - |
