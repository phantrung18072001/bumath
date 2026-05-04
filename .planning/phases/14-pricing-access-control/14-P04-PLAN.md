---
plan: P04
phase: 14
wave: 3
depends_on: [P02]
autonomous: true
files_modified:
  - src/components/admin/UserPackageDialog.tsx
  - src/pages/admin/UsersPage.tsx
requirements:
  - PRICE-02

must_haves:
  truths:
    - "UsersPage action button shows 'Quản lý gói học' (not 'Quản lý khóa học')"
    - "Clicking 'Quản lý gói học' opens UserPackageDialog (not UserEnrollmentDialog)"
    - "UserPackageDialog title shows 'Quản lý gói học — {user.full_name}'"
    - "Dialog shows student's current packages with grade badges + revoke button"
    - "Dialog shows 'Gán gói học' section with package select + assign button"
    - "Assign action inserts into user_packages (DB trigger creates enrollments automatically)"
    - "Revoke action deletes from user_packages (DB trigger removes enrollments automatically)"
  artifacts:
    - path: src/components/admin/UserPackageDialog.tsx
      provides: "Package assignment dialog replacing UserEnrollmentDialog"
      contains: "Quản lý gói học"
    - path: src/pages/admin/UsersPage.tsx
      provides: "Updated to use UserPackageDialog and new button label"
      contains: "UserPackageDialog"
  key_links:
    - from: "UserPackageDialog.tsx"
      to: "src/lib/api/user-packages.ts"
      via: "getUserPackages, assignPackage, revokePackage imports"
    - from: "UserPackageDialog.tsx"
      to: "src/lib/api/packages.ts"
      via: "fetchPackages import (for the assign dropdown)"
---

# P04 — Admin User Package Assignment UI

**Goal:** Replace `UserEnrollmentDialog` with `UserPackageDialog` in `UsersPage.tsx`. Admin now assigns packages (not individual courses) to students. The DB trigger handles enrollment creation/removal automatically. (Decision D-12)

---

<task id="T01" type="execute">
  <title>Create src/components/admin/UserPackageDialog.tsx</title>

  <read_first>
    - src/components/admin/UserEnrollmentDialog.tsx (full file — structural analog to replicate)
    - src/lib/api/user-packages.ts (getUserPackages, assignPackage, revokePackage)
    - src/lib/api/packages.ts (fetchPackages — for the assign dropdown)
    - .planning/phases/14-pricing-access-control/14-UI-SPEC.md § Surface 2 (dialog layout, copywriting)
  </read_first>

  <action>
Create `src/components/admin/UserPackageDialog.tsx`. Model after `UserEnrollmentDialog.tsx`.

**Key differences from UserEnrollmentDialog:**
- Queries `getUserPackages(userId)` + `fetchPackages()` instead of enrollments + courses
- "Available packages" = all packages minus already-assigned packages (filter by package_id)
- Revoke uses `revokePackage(userPackageId)` — takes `user_packages.id`
- Assign uses `assignPackage(userId, packageId)` — trigger auto-handles enrollments
- Shows grade coverage badges per package (multi-grade)
- Section 1 header: "Gói học đang sở hữu"
- Section 2 header: "Gán gói học" (separated by `border-t pt-4`)
- Empty assigned state: "Học sinh chưa có gói học nào."
- All-assigned state: "Học sinh đã được gán tất cả gói học."
- Assign button label: "Gán gói học" (Plus icon, `min-h-[48px]`)
- Revoke success toast: "Đã thu hồi gói học."
- Revoke error toast: "Thu hồi không thành công. Vui lòng thử lại."
- Assign success toast: "Đã gán gói học cho học sinh."
- Assign error toast: "Gán không thành công. Vui lòng thử lại."
- Dialog title: "Quản lý gói học — {user?.full_name}"
- `DialogContent className="max-w-lg"`
- All interactive buttons: `min-h-[48px]`

GRADE_BADGE constant (identical to other admin components):
```typescript
const GRADE_BADGE: Record<string, { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}
```

Props interface:
```typescript
interface UserPackageDialogProps {
  open: boolean
  user: Profile | null
  onClose: () => void
}
```

Query keys:
- User packages: `['admin', 'user-packages', user?.id]`
- All packages: `['admin', 'packages']`
- Invalidate on mutate: `queryClient.invalidateQueries({ queryKey: ['admin', 'user-packages', user?.id] })`

Available packages calculation:
```typescript
const assignedPackageIds = new Set(userPackages.map(up => up.package_id))
const availablePackages = allPackages.filter(p => !assignedPackageIds.has(p.id))
```

Grade badges rendered per package row in the assigned table:
```tsx
<TableCell>
  <div className="flex flex-wrap gap-1">
    {up.package.package_grades.map(pg => (
      <Badge key={pg.grade} variant="secondary" className={GRADE_BADGE[pg.grade]?.className}>
        {GRADE_BADGE[pg.grade]?.label}
      </Badge>
    ))}
  </div>
</TableCell>
```

Select option display for assign dropdown (shows name + grade badges inline):
```tsx
<SelectItem key={p.id} value={p.id}>
  {p.name}
  {p.package_grades.map(pg => ` · ${GRADE_BADGE[pg.grade]?.label}`).join('')}
</SelectItem>
```

Handle close resets `selectedPackageId` to `''`:
```typescript
function handleClose() {
  setSelectedPackageId('')
  onClose()
}
```

Assigned packages table columns: "Tên gói" | "Lớp phủ" | (action — Trash2 revoke button)
Revoke button: `variant="ghost"`, `className="text-destructive hover:text-destructive hover:bg-destructive/10"`, `aria-label="Thu hồi gói học"`
  </action>

  <acceptance_criteria>
    - [ ] File `src/components/admin/UserPackageDialog.tsx` exists
    - [ ] `grep -c "Quản lý gói học" src/components/admin/UserPackageDialog.tsx` returns at least 1
    - [ ] `grep -c "Gói học đang sở hữu" src/components/admin/UserPackageDialog.tsx` returns 1
    - [ ] `grep -c "Gán gói học" src/components/admin/UserPackageDialog.tsx` returns at least 2 (section header + button)
    - [ ] `grep -c "Học sinh chưa có gói học nào" src/components/admin/UserPackageDialog.tsx` returns 1
    - [ ] `grep -c "Học sinh đã được gán tất cả gói học" src/components/admin/UserPackageDialog.tsx` returns 1
    - [ ] `grep -c "Đã thu hồi gói học" src/components/admin/UserPackageDialog.tsx` returns 1
    - [ ] `grep -c "getUserPackages" src/components/admin/UserPackageDialog.tsx` returns at least 1
    - [ ] `grep -c "assignPackage\|revokePackage" src/components/admin/UserPackageDialog.tsx` returns 2
    - [ ] `grep -c "package_grades" src/components/admin/UserPackageDialog.tsx` returns at least 2
    - [ ] `yarn tsc --noEmit` passes without new errors in this file
  </acceptance_criteria>
</task>

---

<task id="T02" type="execute">
  <title>Update UsersPage.tsx — swap dialog and relabel button</title>

  <read_first>
    - src/pages/admin/UsersPage.tsx lines 30–40 (current UserEnrollmentDialog import)
    - src/pages/admin/UsersPage.tsx lines 90–105 (current button label "Quản lý khóa học")
    - src/pages/admin/UsersPage.tsx lines 244–252 (current UserEnrollmentDialog usage)
    - src/components/admin/UserPackageDialog.tsx (just created — confirm props interface)
  </read_first>

  <action>
Make 3 surgical changes to `src/pages/admin/UsersPage.tsx`:

**Change 1 — Swap import (line ~34):**
Remove: `import UserEnrollmentDialog from '@/components/admin/UserEnrollmentDialog'`
Add: `import UserPackageDialog from '@/components/admin/UserPackageDialog'`

**Change 2 — Relabel button (line ~99):**
Change button text from:
```tsx
Quản lý khóa học
```
To:
```tsx
Quản lý gói học
```
(Keep the same `BookOpen` icon for visual continuity — do not change the icon)

**Change 3 — Swap dialog component (lines ~246–250):**
Replace:
```tsx
<UserEnrollmentDialog
  open={!!enrollmentUser}
  user={enrollmentUser}
  onClose={() => setEnrollmentUser(null)}
/>
```
With:
```tsx
<UserPackageDialog
  open={!!enrollmentUser}
  user={enrollmentUser}
  onClose={() => setEnrollmentUser(null)}
/>
```

Do NOT rename the `enrollmentUser` state variable — keeping the existing variable avoids unnecessary diff noise. The variable name is internal and not visible to users.

Make no other changes to UsersPage.tsx.
  </action>

  <acceptance_criteria>
    - [ ] `grep -c "UserPackageDialog" src/pages/admin/UsersPage.tsx` returns 2 (import + usage)
    - [ ] `grep -v "^import\|^//" src/pages/admin/UsersPage.tsx | grep -c "UserEnrollmentDialog"` returns 0 (old import removed)
    - [ ] `grep -c "Quản lý gói học" src/pages/admin/UsersPage.tsx` returns 1
    - [ ] `grep -c "Quản lý khóa học" src/pages/admin/UsersPage.tsx` returns 0
    - [ ] `grep -c "BookOpen" src/pages/admin/UsersPage.tsx` returns at least 1 (icon kept)
    - [ ] `yarn tsc --noEmit` passes without new errors
  </acceptance_criteria>
</task>

---

## Must Haves

- [ ] `UserPackageDialog` component exists and replaces `UserEnrollmentDialog` in UsersPage
- [ ] UsersPage button label is "Quản lý gói học"
- [ ] Dialog title: "Quản lý gói học — {user.full_name}"
- [ ] Assign triggers `assignPackage(userId, packageId)` → DB trigger handles enrollments
- [ ] Revoke triggers `revokePackage(userPackageId)` → DB trigger handles enrollment cleanup
- [ ] TypeScript compiles without errors

## PLAN COMPLETE
