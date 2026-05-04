# P02 Summary — API Layer: Packages + User Packages + Student Lessons View

**Status:** Complete
**Commit:** 1b1eb04

## What Was Built

### src/lib/api/packages.ts (new)
- `GradeValue` type union: `'grade_7' | 'grade_8' | 'grade_9' | 'advanced'`
- `Package`, `PackageWithGrades`, `PackageInsert`, `PackageUpdate` interfaces
- `fetchPackages()` — all packages with grade coverage (for assign dialog + profile)
- `fetchPackagesPaginated()` — paginated with optional name search (admin list page)
- `insertPackage()` — inserts into `packages` + `package_grades` in sequence
- `updatePackage()` — replaces grade coverage atomically (delete all + re-insert)
- `deletePackage()` — cascade deletes package_grades and user_packages
- `fetchPackageById()` — internal helper used by insert/update returns

### src/lib/api/user-packages.ts (new)
- `UserPackage`, `UserPackageWithDetails` interfaces
- `getUserPackages(userId)` — admin view with package details + grade coverage
- `assignPackage(userId, packageId)` — triggers auto-enrollment via DB trigger
- `revokePackage(userPackageId)` — triggers auto-unenrollment via DB trigger
- `getMyPackages()` — current auth.uid()'s packages (student profile page)

### src/lib/api/lessons.ts (modified)
- Added `fetchLessonsForStudent(chapterId)` — reads `lessons_view` with RLS-masked `video_url`
- Existing `fetchLessons()` untouched (admin pages still use raw `lessons` table)

## Artifacts

| File | Change |
|------|--------|
| `src/lib/api/packages.ts` | Created — 5 exported functions + 4 types |
| `src/lib/api/user-packages.ts` | Created — 4 exported functions + 2 types |
| `src/lib/api/lessons.ts` | Modified — added `fetchLessonsForStudent` |

## Verification

- ✅ packages.ts: all 5 CRUD functions exported
- ✅ packages.ts: PackageWithGrades exported
- ✅ packages.ts: 10 references to package_grades (types + queries)
- ✅ user-packages.ts: all 4 functions exported
- ✅ lessons.ts: fetchLessonsForStudent reads from lessons_view
- ✅ lessons.ts: existing fetchLessons still uses from('lessons')
- ✅ TypeScript: no new errors

## Requirements Satisfied

- PRICE-01: Package CRUD with grade coverage API
- PRICE-02: User package assignment (assignPackage/revokePackage)
- PRICE-03: fetchLessonsForStudent with RLS-masked video_url
- PRICE-05: getMyPackages for student profile
