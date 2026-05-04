---
plan: P05
phase: 14
wave: 4
depends_on: [P03]
autonomous: true
files_modified:
  - src/pages/student/ProfilePage.tsx
  - src/components/student/StudentLayout.tsx
  - src/App.tsx
  - src/components/student/LessonContent.tsx
  - src/pages/student/CourseDetailPage.tsx
requirements:
  - PRICE-03
  - PRICE-05

must_haves:
  truths:
    - "Route /ho-so renders ProfilePage within StudentLayout"
    - "StudentLayout header has 'Hồ sơ' NavLink → /ho-so"
    - "ProfilePage shows identity card: avatar initials, full_name, email"
    - "ProfilePage lists active packages with name, grade badges, assigned date"
    - "ProfilePage empty state: 'Bạn chưa có gói học nào'"
    - "LessonContent shows Lock icon + 'Bạn chưa có gói học phù hợp' when video_url is null"
    - "CourseDetailPage fetches lessons via fetchLessonsForStudent (reads lessons_view)"
  artifacts:
    - path: src/pages/student/ProfilePage.tsx
      provides: "Student profile page with identity card + package list"
      contains: "Hồ sơ của tôi"
    - path: src/components/student/StudentLayout.tsx
      provides: "Header with 'Hồ sơ' nav link"
      contains: "ho-so"
    - path: src/App.tsx
      provides: "Route /ho-so registered"
      contains: "ho-so"
    - path: src/components/student/LessonContent.tsx
      provides: "Locked lesson state when video_url is null"
      contains: "Bạn chưa có gói học phù hợp"
    - path: src/pages/student/CourseDetailPage.tsx
      provides: "Lessons fetched via fetchLessonsForStudent"
      contains: "fetchLessonsForStudent"
  key_links:
    - from: "ProfilePage.tsx"
      to: "src/lib/api/user-packages.ts getMyPackages"
      via: "useQuery(['my-packages'])"
    - from: "CourseDetailPage.tsx"
      to: "src/lib/api/lessons.ts fetchLessonsForStudent"
      via: "fetchLessonsForStudent(ch.id)"
    - from: "LessonContent.tsx video_url null branch"
      to: "lessons_view RLS masking"
      via: "video_url === null → locked state"
---

# P05 — Student Profile Page + Locked Lesson State

**Goal:** Create `/ho-so` student profile page (D-14, D-15), add "Hồ sơ" nav link to StudentLayout header, and implement the locked lesson state in LessonContent.tsx for when `video_url` is null. Update CourseDetailPage to fetch from `lessons_view` via `fetchLessonsForStudent`.

---

<task id="T01" type="execute">
  <title>Create ProfilePage.tsx + update StudentLayout + App.tsx route</title>

  <read_first>
    - src/pages/student/CoursesPage.tsx (student page pattern — StudentLayout wrapper, useQuery pattern)
    - src/components/student/StudentLayout.tsx (full file — header NavLink pattern, existing nav items)
    - src/App.tsx lines 1–50 (import pattern + student routes)
    - src/lib/api/user-packages.ts (getMyPackages — returns UserPackageWithDetails[])
    - .planning/phases/14-pricing-access-control/14-UI-SPEC.md § Surface 3 (ProfilePage layout, copywriting, Tailwind classes)
  </read_first>

  <action>

**Part A: Create `src/pages/student/ProfilePage.tsx`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StudentLayout from '@/components/student/StudentLayout'
import { getMyPackages, UserPackageWithDetails } from '@/lib/api/user-packages'
import { useAuth } from '@/contexts/AuthContext'
```

The page uses `useAuth()` to get `profile.full_name` and `profile.email`.

Layout structure (from UI-SPEC Surface 3):
```tsx
export default function ProfilePage() {
  const { profile } = useAuth()
  const { data: userPackages = [], isLoading } = useQuery<UserPackageWithDetails[]>({
    queryKey: ['my-packages'],
    queryFn: getMyPackages,
  })

  // Avatar initials: first letter of each word in full_name, max 2 chars
  const initials = (profile?.full_name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  return (
    <StudentLayout>
      <div className="p-8 md:p-12 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Hồ sơ của tôi</h1>

        {/* Identity card */}
        <Card className="bm-clay-card-student mb-8">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-base font-semibold text-primary">{initials}</span>
            </div>
            <div>
              <p className="text-base font-semibold">{profile?.full_name ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{profile?.email ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Active packages section */}
        <h2 className="text-base font-semibold mb-4">Gói học đang sở hữu</h2>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : userPackages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base font-semibold text-foreground mb-1">Bạn chưa có gói học nào</p>
            <p className="text-sm text-muted-foreground">
              Liên hệ giảng viên để được gán gói học phù hợp.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {userPackages.map(up => (
              <PackageCard key={up.id} userPackage={up} />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
```

`PackageCard` sub-component (define in same file, above ProfilePage):
```tsx
const GRADE_BADGE: Record<string, { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

function PackageCard({ userPackage: up }: { userPackage: UserPackageWithDetails }) {
  const assignedDate = new Date(up.assigned_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <Card className="bm-clay-card-student">
      <CardContent className="p-4">
        <p className="text-base font-semibold mb-1">{up.package.name}</p>
        {up.package.price_vnd > 0 && (
          <p className="text-sm text-muted-foreground mb-2">
            {formatVND(up.package.price_vnd)}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mb-2">
          {up.package.package_grades.map(pg => (
            <Badge key={pg.grade} variant="secondary" className={GRADE_BADGE[pg.grade]?.className}>
              {GRADE_BADGE[pg.grade]?.label}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Gán ngày {assignedDate}</p>
      </CardContent>
    </Card>
  )
}
```

---

**Part B: Update `src/components/student/StudentLayout.tsx`**

Add a "Hồ sơ" NavLink to the header nav. Place it AFTER the "Khám phá khóa học" NavLink, BEFORE the admin-only "Quản trị" NavLink.

Import `UserCircle` from `lucide-react` (or use text-only — see pattern below).

Add this NavLink after the "Khám phá khóa học" NavLink (no icon — matches existing text-only nav link style):
```tsx
<NavLink
  to="/ho-so"
  className={({ isActive }) =>
    `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
      isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
    }`
  }
>
  Hồ sơ
</NavLink>
```

---

**Part C: Update `src/App.tsx`**

Add import for ProfilePage alongside other student page imports:
```typescript
import ProfilePage from './pages/student/ProfilePage'
```

Add route (student routes area, after `/danh-muc` route or similar student routes):
```tsx
<Route path="/ho-so" element={<ProtectedRoute><StudentLayout>{/* avoid double-wrap */}<ProfilePage /></StudentLayout></ProtectedRoute>} />
```

Wait — looking at the existing App.tsx pattern, `/khoa-hoc` and `/danh-muc` routes wrap with `<StudentLayout>`. But `ProfilePage.tsx` ALREADY wraps itself with `<StudentLayout>` (it renders `<StudentLayout>` internally). Do NOT double-wrap.

Correct route (no StudentLayout wrapper in App.tsx since ProfilePage wraps itself):
```tsx
<Route path="/ho-so" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
```
  </action>

  <acceptance_criteria>
    - [ ] File `src/pages/student/ProfilePage.tsx` exists
    - [ ] `grep -c "Hồ sơ của tôi" src/pages/student/ProfilePage.tsx` returns 1
    - [ ] `grep -c "Bạn chưa có gói học nào" src/pages/student/ProfilePage.tsx` returns 1
    - [ ] `grep -c "getMyPackages" src/pages/student/ProfilePage.tsx` returns 1
    - [ ] `grep -c "bm-clay-card-student" src/pages/student/ProfilePage.tsx` returns at least 2 (identity card + package card)
    - [ ] `grep -c "Gán ngày" src/pages/student/ProfilePage.tsx` returns 1
    - [ ] `grep -c "ho-so" src/components/student/StudentLayout.tsx` returns 1
    - [ ] `grep -c "Hồ sơ" src/components/student/StudentLayout.tsx` returns 1
    - [ ] `grep -c "ho-so" src/App.tsx` returns 1
    - [ ] `grep -c "ProfilePage" src/App.tsx` returns 2 (import + route element)
    - [ ] `yarn tsc --noEmit` passes without new errors
  </acceptance_criteria>
</task>

---

<task id="T02" type="execute">
  <title>Locked lesson state in LessonContent.tsx + switch CourseDetailPage to lessons_view</title>

  <read_first>
    - src/components/student/LessonContent.tsx (full file — current video_url check at line ~38–47)
    - src/pages/student/CourseDetailPage.tsx lines 19–20, 70–82 (fetchLessons import + usage)
    - src/lib/api/lessons.ts (confirm fetchLessonsForStudent export exists — added in P02)
    - .planning/phases/14-pricing-access-control/14-UI-SPEC.md § Surface 4 (locked state component exact code)
    - .planning/phases/14-pricing-access-control/14-CONTEXT.md § D-05, D-07 (RLS + locked state decisions)
  </read_first>

  <action>

**Part A: Update `src/components/student/LessonContent.tsx`**

Current code (lines ~38–47):
```tsx
{lesson.video_url && (
  <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted">
    <iframe
      src={lesson.video_url}
      ...
    </AspectRatio>
)}
```

Replace the `&&` conditional with a ternary that shows the locked state when `video_url` is null:

```tsx
{lesson.video_url ? (
  <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-muted">
    <iframe
      src={lesson.video_url}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </AspectRatio>
) : (
  <div className="rounded-lg bg-muted flex flex-col items-center justify-center py-16 px-8 text-center aspect-video">
    <Lock className="h-10 w-10 text-muted-foreground mb-4" aria-label="Bài học bị khóa" />
    <p className="text-base font-semibold text-foreground mb-1">Bạn chưa có gói học phù hợp</p>
    <p className="text-sm text-muted-foreground max-w-xs">
      Liên hệ giảng viên để được gán gói học và truy cập bài giảng này.
    </p>
  </div>
)}
```

Add `Lock` to the lucide-react import at the top of `LessonContent.tsx`. Do NOT import `Lock` separately if already imported — just append to the existing import destructure.

Add `Lock` import to the lucide-react import (e.g. if line 1 has `import { SomeIcon } from 'lucide-react'`, change to `import { SomeIcon, Lock } from 'lucide-react'`).

Preserve the exact `iframe` attributes from the original code (copy them exactly — `allow`, `allowFullScreen`, `className`).

---

**Part B: Update `src/pages/student/CourseDetailPage.tsx`**

Change one import and one usage:

**Import change:** On the line that imports `fetchLessons` from `@/lib/api/lessons`, add `fetchLessonsForStudent` to the import:

Current:
```typescript
import { fetchLessons, type Lesson } from '@/lib/api/lessons'
```
New:
```typescript
import { fetchLessons, fetchLessonsForStudent, type Lesson } from '@/lib/api/lessons'
```

**Usage change:** Find the line where `fetchLessons` is called with a chapter ID (line ~73):
```typescript
const allLessons = await Promise.all(chapters!.map(c => fetchLessons(c.id)))
```
Change to:
```typescript
const allLessons = await Promise.all(chapters!.map(c => fetchLessonsForStudent(c.id)))
```

Make NO other changes to CourseDetailPage.tsx.

The `fetchLessons` import can remain (may be used elsewhere in the file) — just add `fetchLessonsForStudent` and switch the usage. If `fetchLessons` is unused after the switch, TypeScript will warn but not error; removing it is optional.
  </action>

  <acceptance_criteria>
    - [ ] `grep -c "Bạn chưa có gói học phù hợp" src/components/student/LessonContent.tsx` returns 1
    - [ ] `grep -c "Liên hệ giảng viên để được gán gói học" src/components/student/LessonContent.tsx` returns 1
    - [ ] `grep -c "Lock" src/components/student/LessonContent.tsx` returns at least 2 (import + JSX usage)
    - [ ] `grep -c "aspect-video" src/components/student/LessonContent.tsx` returns 1
    - [ ] `grep -c "lesson.video_url ?" src/components/student/LessonContent.tsx` returns 1 (ternary replaces &&)
    - [ ] `grep -c "fetchLessonsForStudent" src/pages/student/CourseDetailPage.tsx` returns 2 (import + usage)
    - [ ] `grep -v "import" src/pages/student/CourseDetailPage.tsx | grep -c "fetchLessons(c.id)"` returns 0 (old call replaced)
    - [ ] `yarn tsc --noEmit` passes without new errors
    - [ ] `yarn test --run` passes (existing CourseDetailPage tests still green)
  </acceptance_criteria>
</task>

---

## Must Haves

- [ ] `/ho-so` route renders ProfilePage (ProtectedRoute, no double StudentLayout)
- [ ] StudentLayout header has "Hồ sơ" NavLink → /ho-so
- [ ] ProfilePage h1 = "Hồ sơ của tôi" (text-2xl font-semibold)
- [ ] ProfilePage shows identity card with initials avatar + name + email
- [ ] ProfilePage lists packages with grade badges and "Gán ngày {date}"
- [ ] ProfilePage empty state: "Bạn chưa có gói học nào"
- [ ] LessonContent shows Lock icon + "Bạn chưa có gói học phù hợp" when video_url is null
- [ ] CourseDetailPage uses `fetchLessonsForStudent` (reads lessons_view)
- [ ] `yarn test --run` passes (no regressions)

## PLAN COMPLETE
