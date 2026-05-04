---
plan: P02
phase: 14
wave: 2
depends_on: [P01]
autonomous: true
files_modified:
  - src/lib/api/packages.ts
  - src/lib/api/user-packages.ts
  - src/lib/api/lessons.ts
requirements:
  - PRICE-01
  - PRICE-02
  - PRICE-03
  - PRICE-05

must_haves:
  truths:
    - "fetchPackagesPaginated() returns paginated packages with grade coverage"
    - "insertPackage() creates package row + package_grades rows in one operation"
    - "updatePackage() replaces package_grades (delete + re-insert) atomically"
    - "getUserPackages() returns user's packages with grade badges and assigned_at"
    - "fetchLessonsForStudent() reads from lessons_view (video_url masked by RLS)"
    - "getMyPackages() returns current auth.uid()'s packages for profile page"
  artifacts:
    - path: src/lib/api/packages.ts
      provides: "Package CRUD: fetchPackagesPaginated, fetchPackages, insertPackage, updatePackage, deletePackage"
      exports: ["Package", "PackageWithGrades", "PackageInsert", "PackageUpdate", "fetchPackages", "fetchPackagesPaginated", "insertPackage", "updatePackage", "deletePackage"]
    - path: src/lib/api/user-packages.ts
      provides: "User package assignment: getUserPackages, assignPackage, revokePackage, getMyPackages"
      exports: ["UserPackage", "UserPackageWithDetails", "getUserPackages", "assignPackage", "revokePackage", "getMyPackages"]
    - path: src/lib/api/lessons.ts
      provides: "fetchLessonsForStudent added — reads lessons_view with RLS-masked video_url"
  key_links:
    - from: "src/lib/api/lessons.ts fetchLessonsForStudent"
      to: "supabase lessons_view"
      via: "supabase.from('lessons_view')"
    - from: "src/lib/api/user-packages.ts assignPackage"
      to: "supabase user_packages table"
      via: "supabase.from('user_packages').insert()"
---

# P02 — API Layer: Packages + User Packages + Student Lessons View

**Goal:** Create the TypeScript API functions for package management and user package assignment. Also add `fetchLessonsForStudent()` to `lessons.ts` that reads from `lessons_view` (RLS-masked) instead of the raw `lessons` table.

---

<task id="T01" type="execute">
  <title>Create src/lib/api/packages.ts</title>

  <read_first>
    - src/lib/api/courses.ts (full file — model for CRUD + fetchCoursesPaginated pattern)
    - src/lib/api/enrollments.ts (full file — model for simpler fetch pattern)
    - .planning/phases/14-pricing-access-control/14-CONTEXT.md § D-01, D-03, D-04 (schema: packages + package_grades)
  </read_first>

  <action>
Create `src/lib/api/packages.ts`. Model after `courses.ts`. Key differences:
- No `slug`, `is_published`, `target_grade` single field — packages have multi-grade via `package_grades` junction
- `insertPackage` must insert into both `packages` and `package_grades` in sequence
- `updatePackage` must delete all existing `package_grades` then re-insert new ones
- `deletePackage` uses CASCADE (package_grades + user_packages auto-deleted)
- `fetchPackagesPaginated` has no grade filter (packages define grades, not filtered by them)

```typescript
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────

export type GradeValue = 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'

export interface Package {
  id: string
  name: string
  description: string | null
  price_vnd: number
  created_at: string
}

export interface PackageWithGrades extends Package {
  package_grades: { grade: GradeValue }[]
}

export interface PackageInsert {
  name: string
  description?: string | null
  price_vnd: number
  grades: GradeValue[]
}

export interface PackageUpdate {
  name?: string
  description?: string | null
  price_vnd?: number
  grades?: GradeValue[]
}

// ── CRUD ───────────────────────────────────────────────────────────

/** Fetch all packages with grade coverage (used in assign dialog + profile page). */
export async function fetchPackages(): Promise<PackageWithGrades[]> {
  const { data, error } = await supabase
    .from('packages')
    .select('id, name, description, price_vnd, created_at, package_grades(grade)')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as PackageWithGrades[]
}

/** Paginated fetch for admin PackagesPage with optional name search. */
export async function fetchPackagesPaginated(params: {
  page: number
  pageSize: number
  search?: string
}): Promise<{ data: PackageWithGrades[]; total: number }> {
  const { page, pageSize, search } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('packages')
    .select('id, name, description, price_vnd, created_at, package_grades(grade)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search && search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as unknown as PackageWithGrades[], total: count ?? 0 }
}

/**
 * Create a new package with grade coverage.
 * Inserts into `packages`, then bulk-inserts into `package_grades`.
 */
export async function insertPackage(payload: PackageInsert): Promise<PackageWithGrades> {
  const { grades, ...packageData } = payload

  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .insert(packageData)
    .select()
    .single()
  if (pkgError) throw pkgError

  const gradeRows = grades.map((grade) => ({ package_id: pkg.id, grade }))
  const { error: gradeError } = await supabase.from('package_grades').insert(gradeRows)
  if (gradeError) throw gradeError

  // Return full object with grades
  return fetchPackageById(pkg.id)
}

/**
 * Update package fields and/or grade coverage.
 * Grade update: delete all existing package_grades, re-insert new set.
 */
export async function updatePackage(id: string, payload: PackageUpdate): Promise<PackageWithGrades> {
  const { grades, ...packageData } = payload

  if (Object.keys(packageData).length > 0) {
    const { error } = await supabase.from('packages').update(packageData).eq('id', id)
    if (error) throw error
  }

  if (grades !== undefined) {
    // Replace grade coverage atomically: delete all, insert new
    const { error: delError } = await supabase
      .from('package_grades')
      .delete()
      .eq('package_id', id)
    if (delError) throw delError

    const gradeRows = grades.map((grade) => ({ package_id: id, grade }))
    const { error: insError } = await supabase.from('package_grades').insert(gradeRows)
    if (insError) throw insError
  }

  return fetchPackageById(id)
}

/** Delete a package. CASCADE deletes package_grades and user_packages. */
export async function deletePackage(id: string): Promise<void> {
  const { error } = await supabase.from('packages').delete().eq('id', id)
  if (error) throw error
}

/** Internal helper: fetch a single package by ID with grade coverage. */
async function fetchPackageById(id: string): Promise<PackageWithGrades> {
  const { data, error } = await supabase
    .from('packages')
    .select('id, name, description, price_vnd, created_at, package_grades(grade)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as PackageWithGrades
}
```
  </action>

  <acceptance_criteria>
    - [ ] File `src/lib/api/packages.ts` exists
    - [ ] `grep -c "export.*fetchPackages\b" src/lib/api/packages.ts` returns 1
    - [ ] `grep -c "export.*fetchPackagesPaginated" src/lib/api/packages.ts` returns 1
    - [ ] `grep -c "export.*insertPackage" src/lib/api/packages.ts` returns 1
    - [ ] `grep -c "export.*updatePackage" src/lib/api/packages.ts` returns 1
    - [ ] `grep -c "export.*deletePackage" src/lib/api/packages.ts` returns 1
    - [ ] `grep -c "export.*PackageWithGrades" src/lib/api/packages.ts` returns 1
    - [ ] `grep -c "package_grades" src/lib/api/packages.ts` returns at least 4 (select, insert, delete, type)
    - [ ] `yarn tsc --noEmit` passes without new errors in this file
  </acceptance_criteria>
</task>

---

<task id="T02" type="execute">
  <title>Create src/lib/api/user-packages.ts + add fetchLessonsForStudent to lessons.ts</title>

  <read_first>
    - src/lib/api/enrollments.ts (full file — model for getUserEnrollments, addEnrollment, removeEnrollment)
    - src/lib/api/lessons.ts (full file — to see Lesson type and existing fetchLessons function)
    - .planning/phases/14-pricing-access-control/14-CONTEXT.md § D-07, D-09 (user_packages + trigger interaction)
  </read_first>

  <action>

**Part A: Create `src/lib/api/user-packages.ts`**

Model after `enrollments.ts`. Key details:
- `getUserPackages` joins `packages` + `package_grades` for display in UserPackageDialog
- `assignPackage` inserts into `user_packages` — trigger auto-creates enrollments (D-09)
- `revokePackage` deletes from `user_packages` by ID — trigger auto-removes enrollments
- `getMyPackages` reads current `auth.uid()` packages — used by student ProfilePage

```typescript
import { supabase } from '@/lib/supabase'
import { PackageWithGrades } from '@/lib/api/packages'

// ── Types ──────────────────────────────────────────────────────────

export interface UserPackage {
  id: string
  user_id: string
  package_id: string
  assigned_at: string
  assigned_by: string | null
}

export interface UserPackageWithDetails extends UserPackage {
  package: PackageWithGrades
}

// ── API functions ──────────────────────────────────────────────────

/** Get all packages assigned to a student (admin view). */
export async function getUserPackages(userId: string): Promise<UserPackageWithDetails[]> {
  const { data, error } = await supabase
    .from('user_packages')
    .select(`
      id, user_id, package_id, assigned_at, assigned_by,
      package:packages(id, name, description, price_vnd, created_at,
        package_grades(grade)
      )
    `)
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as UserPackageWithDetails[]
}

/** Assign a package to a student (admin action). Trigger auto-creates enrollments. */
export async function assignPackage(userId: string, packageId: string): Promise<UserPackage> {
  const { data, error } = await supabase
    .from('user_packages')
    .insert({ user_id: userId, package_id: packageId })
    .select()
    .single()
  if (error) throw error
  return data as UserPackage
}

/** Revoke a package from a student by user_packages.id. Trigger removes enrollments. */
export async function revokePackage(userPackageId: string): Promise<void> {
  const { error } = await supabase
    .from('user_packages')
    .delete()
    .eq('id', userPackageId)
  if (error) throw error
}

/** Get current authenticated user's packages (student profile page, PRICE-05). */
export async function getMyPackages(): Promise<UserPackageWithDetails[]> {
  const { data, error } = await supabase
    .from('user_packages')
    .select(`
      id, user_id, package_id, assigned_at, assigned_by,
      package:packages(id, name, description, price_vnd, created_at,
        package_grades(grade)
      )
    `)
    .order('assigned_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as UserPackageWithDetails[]
}
```

**Part B: Add `fetchLessonsForStudent` to `src/lib/api/lessons.ts`**

Append the following function to the end of `src/lib/api/lessons.ts` (after `removeLesson`). Do NOT modify existing functions — admin pages still use `fetchLessons` which reads from the raw `lessons` table.

```typescript
/**
 * Fetch lessons for student view — reads from `lessons_view` (security view).
 * video_url is masked to NULL by RLS when the student has no matching package.
 * Use this in CourseDetailPage.tsx instead of fetchLessons (PRICE-03).
 */
export async function fetchLessonsForStudent(chapterId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons_view')
    .select('id, chapter_id, title, description, video_url, assignment_path, order_index, created_at, updated_at')
    .eq('chapter_id', chapterId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data as Lesson[]
}
```
  </action>

  <acceptance_criteria>
    - [ ] File `src/lib/api/user-packages.ts` exists
    - [ ] `grep -c "export.*getUserPackages" src/lib/api/user-packages.ts` returns 1
    - [ ] `grep -c "export.*assignPackage" src/lib/api/user-packages.ts` returns 1
    - [ ] `grep -c "export.*revokePackage" src/lib/api/user-packages.ts` returns 1
    - [ ] `grep -c "export.*getMyPackages" src/lib/api/user-packages.ts` returns 1
    - [ ] `grep -c "fetchLessonsForStudent" src/lib/api/lessons.ts` returns 1
    - [ ] `grep -c "lessons_view" src/lib/api/lessons.ts` returns 1
    - [ ] Existing `fetchLessons` function in `lessons.ts` still uses `from('lessons')` (not modified)
    - [ ] `yarn tsc --noEmit` passes without new errors
  </acceptance_criteria>
</task>

---

## Must Haves

- [ ] `src/lib/api/packages.ts` exports: Package, PackageWithGrades, fetchPackages, fetchPackagesPaginated, insertPackage, updatePackage, deletePackage
- [ ] `src/lib/api/user-packages.ts` exports: UserPackage, UserPackageWithDetails, getUserPackages, assignPackage, revokePackage, getMyPackages
- [ ] `fetchLessonsForStudent` in `lessons.ts` reads from `lessons_view` (not `lessons`)
- [ ] Existing `fetchLessons` unchanged (admin pages unaffected)
- [ ] TypeScript compiles without errors (`yarn tsc --noEmit`)

## PLAN COMPLETE
