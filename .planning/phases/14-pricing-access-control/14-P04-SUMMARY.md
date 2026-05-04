# P04 Summary — Admin User Package Assignment UI

**Status:** Complete
**Commit:** 14154f6

## What Was Built

### src/components/admin/UserPackageDialog.tsx (new)
- Replaces UserEnrollmentDialog for package-based access control
- Shows student's current packages with grade coverage badges and revoke button
- "Gán gói học" section with package select dropdown + assign button
- Available packages = all packages minus already-assigned ones
- Assign triggers `assignPackage()` → DB trigger auto-creates enrollments
- Revoke triggers `revokePackage()` → DB trigger auto-removes enrollments
- Dialog title: "Quản lý gói học — {user.full_name}"
- Empty state: "Học sinh chưa có gói học nào."
- All-assigned state: "Học sinh đã được gán tất cả gói học."
- Toast messages: "Đã gán gói học cho học sinh." / "Đã thu hồi gói học."
- Query keys: ['admin', 'user-packages', user?.id] + ['admin', 'packages']

### src/pages/admin/UsersPage.tsx (modified, 3 surgical changes)
- Change 1: Swapped import from UserEnrollmentDialog → UserPackageDialog
- Change 2: Button label "Quản lý khóa học" → "Quản lý gói học" (BookOpen icon kept)
- Change 3: Swapped dialog component in JSX (enrollmentUser state variable unchanged)

## Artifacts

| File | Change |
|------|--------|
| `src/components/admin/UserPackageDialog.tsx` | Created — package assignment dialog |
| `src/pages/admin/UsersPage.tsx` | Modified — 3 surgical changes |

## Verification

- ✅ UserPackageDialog: "Quản lý gói học" title
- ✅ UserPackageDialog: "Gói học đang sở hữu" section
- ✅ UserPackageDialog: "Gán gói học" section + button (2 occurrences)
- ✅ UserPackageDialog: empty/all-assigned states
- ✅ UserPackageDialog: assignPackage + revokePackage used
- ✅ UsersPage: UserPackageDialog (2 — import + usage)
- ✅ UsersPage: button label = "Quản lý gói học"
- ✅ UsersPage: BookOpen icon retained
- ✅ TypeScript: no errors

## Requirements Satisfied

- PRICE-02: Admin can assign/revoke packages to students; DB trigger handles enrollment
