# 14-P05 SUMMARY — Student Profile Page + Locked Lesson State

**Status:** COMPLETE  
**Commit:** `86040f9`

## What was built

### T01 — ProfilePage + StudentLayout + App.tsx
- Created `src/pages/student/ProfilePage.tsx`
  - Identity card with avatar initials (first 2 words, uppercase first letter)
  - Package list via `getMyPackages()` with grade badges and VND price
  - Empty state: "Bạn chưa có gói học nào"
  - Wraps itself in `<StudentLayout>` (no double-wrap)
- Added "Hồ sơ" NavLink to `StudentLayout` header after "Khám phá khóa học"
- Added `/ho-so` route to `App.tsx`: `<ProtectedRoute><ProfilePage /></ProtectedRoute>`

### T02 — LessonContent locked state + CourseDetailPage switch
- `LessonContent.tsx`: `{video_url && ...}` → ternary showing `<Lock>` icon + "Bài học bị khoá" / "Bạn chưa có gói học phù hợp" when `video_url` is null
- `CourseDetailPage.tsx`: `fetchLessons` → `fetchLessonsForStudent` (reads `lessons_view` with RLS masking)

## Tests updated
- `UsersPage.test.tsx`: mock `UserPackageDialog` (was `UserEnrollmentDialog`), updated button label to "Quản lý gói học"
- `CourseDetailPage.test.tsx`: updated mock and test bodies to use `fetchLessonsForStudent`
- All 123 tests pass
