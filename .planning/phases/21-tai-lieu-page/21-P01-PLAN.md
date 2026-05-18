---
phase: 21-tai-lieu-page
plan: P01
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/20260518_28_study_materials_public.sql
  - src/lib/api/study-materials.ts
autonomous: false
requirements:
  - MAT-01
  - MAT-02

must_haves:
  truths:
    - "Migration file exists with all 8 SQL statements (nullable lesson_id, grade check, category nullable, 5 RLS policies)"
    - "study-materials.ts StudyMaterial interface has lesson_id: string | null, category nullable, grade includes 'advanced'"
    - "fetchStandaloneStudyMaterials(grade?) function exported from study-materials.ts"
    - "uploadStandaloneStudyMaterial(file, meta) function exported from study-materials.ts using standalone/ path prefix"
    - "GRADE_LABELS includes advanced: 'Ôn thi chuyên'"
  artifacts:
    - path: "supabase/migrations/20260518_28_study_materials_public.sql"
      provides: "Schema changes + RLS policies for public/teacher access"
      contains: "ALTER COLUMN lesson_id DROP NOT NULL"
    - path: "src/lib/api/study-materials.ts"
      provides: "Type-safe API layer for standalone materials"
      exports: ["fetchStandaloneStudyMaterials", "uploadStandaloneStudyMaterial", "StudyMaterialGrade"]
  key_links:
    - from: "src/lib/api/study-materials.ts"
      to: "study_materials table"
      via: "supabase.from('study_materials').is('lesson_id', null)"
      pattern: "is\\('lesson_id', null\\)"
    - from: "supabase/migrations/20260518_28_study_materials_public.sql"
      to: "storage.objects"
      via: "anon SELECT policy"
      pattern: "anon_read_study_materials_storage"
---

<objective>
Write the DB migration SQL and extend the study-materials API — the foundation that all UI plans depend on.

Purpose: Open standalone study materials to public browse/download (anon RLS), allow teachers to upload (storage policies), and expose TypeScript functions for the two new pages.
Output: Migration SQL file (ready to paste in Supabase Dashboard) + extended study-materials.ts.
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/21-tai-lieu-page/21-CONTEXT.md
@.planning/phases/21-tai-lieu-page/21-RESEARCH.md

<interfaces>
<!-- Current study-materials.ts — read before editing -->
From src/lib/api/study-materials.ts (full file, 136 lines):

```typescript
export interface StudyMaterial {
  id: string
  lesson_id: string          // ← must become: string | null
  title: string
  file_path: string
  file_type: 'pdf' | 'image'
  category: 'giua_ky' | 'cuoi_ky' | 'vao_10' | 'hsg' | 'chuyen_toan'  // ← must become: ... | null
  grade: 'grade_7' | 'grade_8' | 'grade_9'   // ← must add: | 'advanced'
  created_by: string | null
  created_at: string
}

export type StudyMaterialCategory = StudyMaterial['category']
export type StudyMaterialGrade = StudyMaterial['grade']

export const GRADE_LABELS: Record<StudyMaterialGrade, string> = {
  grade_7: 'Lớp 7',
  grade_8: 'Lớp 8',
  grade_9: 'Lớp 9',
  // ← must add: advanced: 'Ôn thi chuyên'
}

const BUCKET = 'study-materials'

// Existing functions (DO NOT modify):
export async function fetchStudyMaterials(lessonId: string): Promise<StudyMaterial[]>
function detectFileType(file: File): StudyMaterial['file_type']  // private — reuse in new upload fn
export async function uploadStudyMaterial(lessonId: string, file: File, meta: {...}): Promise<StudyMaterial>
export async function deleteStudyMaterial(id: string, filePath: string): Promise<void>
export async function getStudyMaterialSignedUrl(filePath: string): Promise<string>
export async function getStudyMaterialSignedUrls(materials: StudyMaterial[]): Promise<Record<string, string>>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write DB migration SQL</name>
  <files>supabase/migrations/20260518_28_study_materials_public.sql</files>
  <read_first>
    - supabase/migrations/20260507_25_study_materials.sql (section header style to follow)
    - supabase/migrations/20260518_27_courses_is_outstanding.sql (recent migration format reference)
  </read_first>
  <action>
Create `supabase/migrations/20260518_28_study_materials_public.sql` with EXACTLY the following SQL (8 statements). Follow the section header comment style from migration 25.

```sql
-- ============================================================
-- Phase 21: Tài liệu public — standalone materials
-- ============================================================

-- 1. Make lesson_id nullable (standalone materials: lesson_id = NULL)
-- The FK + ON DELETE CASCADE constraint stays — lesson-linked materials unchanged.
ALTER TABLE public.study_materials
  ALTER COLUMN lesson_id DROP NOT NULL;

-- 2. Replace grade CHECK constraint to include 'advanced'
ALTER TABLE public.study_materials
  DROP CONSTRAINT IF EXISTS study_materials_grade_check;
ALTER TABLE public.study_materials
  ADD CONSTRAINT study_materials_grade_check
  CHECK (grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced'));

-- 3. Make category nullable (no longer required for standalone materials)
ALTER TABLE public.study_materials
  DROP CONSTRAINT IF EXISTS study_materials_category_check;
ALTER TABLE public.study_materials
  ALTER COLUMN category DROP NOT NULL;

-- 4. Anon SELECT on study_materials — public browse (lesson_id IS NULL rows only)
CREATE POLICY "anon_read_standalone_study_materials"
  ON public.study_materials FOR SELECT
  TO anon
  USING (lesson_id IS NULL);

-- 5. Anon SELECT on storage.objects — allows createSignedUrl from unauthenticated clients
CREATE POLICY "anon_read_study_materials_storage"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'study-materials');

-- 6. Teacher INSERT on storage — teachers can upload (admin policy already exists)
CREATE POLICY "teacher_upload_study_materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'teacher'
  );

-- 7. Teacher DELETE on storage — teachers can delete their uploads
CREATE POLICY "teacher_delete_study_materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'teacher'
  );

-- 8. Teacher ALL on study_materials table — insert + delete rows
CREATE POLICY "teacher_all_study_materials"
  ON public.study_materials FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'teacher')
  WITH CHECK (public.get_my_role() = 'teacher');
```
  </action>
  <verify>
    <automated>grep -c "DROP NOT NULL" supabase/migrations/20260518_28_study_materials_public.sql</automated>
  </verify>
  <acceptance_criteria>
    - File `supabase/migrations/20260518_28_study_materials_public.sql` exists
    - Contains `ALTER COLUMN lesson_id DROP NOT NULL`
    - Contains `ALTER COLUMN category DROP NOT NULL`
    - Contains `study_materials_grade_check` with `'advanced'`
    - Contains `anon_read_standalone_study_materials` policy
    - Contains `anon_read_study_materials_storage` policy
    - Contains `teacher_upload_study_materials` policy
    - Contains `teacher_delete_study_materials` policy
    - Contains `teacher_all_study_materials` policy
    - `grep -c "CREATE POLICY" supabase/migrations/20260518_28_study_materials_public.sql` returns `5`
  </acceptance_criteria>
  <done>Migration SQL file written with all 8 statements covering D-03, D-04, and all RLS gaps identified in RESEARCH.md.</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 2: [BLOCKING] Apply migration in Supabase Dashboard</name>
  <what-built>Task 1 wrote supabase/migrations/20260518_28_study_materials_public.sql with all schema and RLS changes.</what-built>
  <how-to-verify>
    1. Open Supabase Dashboard → SQL Editor
    2. Copy the ENTIRE contents of `supabase/migrations/20260518_28_study_materials_public.sql`
    3. Paste into the SQL Editor and click "Run"
    4. Verify no errors (all 8 statements succeed)
    5. Confirm in Table Editor: `study_materials.lesson_id` column shows as nullable
    6. Confirm in Authentication → Policies: `anon_read_standalone_study_materials` appears on `study_materials` table
    7. Confirm in Storage → Policies: `anon_read_study_materials_storage` appears
  </how-to-verify>
  <resume-signal>Type "migration applied" after all 8 statements run without error in the Supabase SQL Editor.</resume-signal>
</task>

<task type="auto">
  <name>Task 3: Extend study-materials.ts — types + two new functions</name>
  <files>src/lib/api/study-materials.ts</files>
  <read_first>
    - src/lib/api/study-materials.ts (full file — read current state before editing)
  </read_first>
  <action>
Edit `src/lib/api/study-materials.ts` — make three targeted changes:

**Change 1 — Update StudyMaterial interface (3 field changes):**
```typescript
// BEFORE:
lesson_id: string
category: 'giua_ky' | 'cuoi_ky' | 'vao_10' | 'hsg' | 'chuyen_toan'
grade: 'grade_7' | 'grade_8' | 'grade_9'

// AFTER:
lesson_id: string | null
category: 'giua_ky' | 'cuoi_ky' | 'vao_10' | 'hsg' | 'chuyen_toan' | null
grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'
```

**Change 2 — Extend GRADE_LABELS (add advanced key):**
```typescript
export const GRADE_LABELS: Record<StudyMaterialGrade, string> = {
  grade_7: 'Lớp 7',
  grade_8: 'Lớp 8',
  grade_9: 'Lớp 9',
  advanced: 'Ôn thi chuyên',  // ADD THIS LINE
}
```

**Change 3 — Append two new exported functions AFTER the last existing function (`getStudyMaterialSignedUrls`). Do NOT modify any existing function:**

```typescript
/**
 * Fetch all standalone study materials (lesson_id IS NULL).
 * Public — anon SELECT policy added in migration 28.
 * Optionally filter by grade.
 */
export async function fetchStandaloneStudyMaterials(
  grade?: StudyMaterialGrade,
): Promise<StudyMaterial[]> {
  let query = supabase
    .from('study_materials')
    .select('*')
    .is('lesson_id', null)
    .order('created_at', { ascending: false })

  if (grade) {
    query = query.eq('grade', grade)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as StudyMaterial[]
}

/**
 * Upload a standalone study material (no lesson).
 * Path: standalone/{timestamp}-{random}.{ext}
 * Admin + teacher only (enforced by RLS + Storage policies in migration 28).
 */
export async function uploadStandaloneStudyMaterial(
  file: File,
  meta: { title: string; grade: StudyMaterialGrade },
): Promise<StudyMaterial> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 6)
  const path = `standalone/${timestamp}-${random}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('study_materials')
    .insert({
      lesson_id: null,
      title: meta.title,
      file_path: path,
      file_type: detectFileType(file),
      category: null,
      grade: meta.grade,
    })
    .select()
    .single()
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {})
    throw error
  }
  return data as StudyMaterial
}
```
  </action>
  <verify>
    <automated>yarn build 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `grep "lesson_id: string | null" src/lib/api/study-materials.ts` returns 1 match
    - `grep "advanced: 'Ôn thi chuyên'" src/lib/api/study-materials.ts` returns 1 match
    - `grep "export async function fetchStandaloneStudyMaterials" src/lib/api/study-materials.ts` returns 1 match
    - `grep "export async function uploadStandaloneStudyMaterial" src/lib/api/study-materials.ts` returns 1 match
    - `grep "standalone/\${timestamp}" src/lib/api/study-materials.ts` returns 1 match (standalone/ path prefix)
    - `grep "lesson_id: null" src/lib/api/study-materials.ts` returns 1 match (inside uploadStandaloneStudyMaterial)
    - `yarn build` exits 0 (no TypeScript errors)
  </acceptance_criteria>
  <done>study-materials.ts has nullable lesson_id/category, 'advanced' grade, GRADE_LABELS updated, and two new exported functions (fetchStandaloneStudyMaterials + uploadStandaloneStudyMaterial).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| anon → Supabase DB | Unauthenticated browser calls fetchStandaloneStudyMaterials — RLS must restrict to lesson_id IS NULL rows only |
| anon → Supabase Storage | Unauthenticated browser calls createSignedUrl — anon storage policy enables this |
| teacher → storage INSERT | Teacher uploads bypass admin-only policy via new teacher_upload_study_materials |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-21-01 | Information Disclosure | anon_read_standalone_study_materials | mitigate | Policy uses `lesson_id IS NULL` predicate — lesson-linked materials remain authenticated-only |
| T-21-02 | Elevation of Privilege | teacher_all_study_materials | mitigate | Policy uses `get_my_role() = 'teacher'` — only DB-verified teacher role gets access; admin-only items (adminOnly nav) remain hidden via AdminLayout filter |
| T-21-03 | Information Disclosure | anon storage SELECT | accept | Signed URLs have 1h TTL; bucket is not public — anon can only call createSignedUrl, not list objects |
| T-21-04 | Tampering | teacher INSERT on study_materials | accept | Teacher can insert only; RLS prevents modifying lesson-linked materials (separate `lesson_id IS NULL` scope not enforced at table level — low risk: teachers can already manage materials via Phase 16 admin) |
</threat_model>

<verification>
After both auto tasks complete and migration is applied:

```bash
# TypeScript compiles clean
yarn build

# New functions are exported
grep "export async function fetchStandaloneStudyMaterials" src/lib/api/study-materials.ts
grep "export async function uploadStandaloneStudyMaterial" src/lib/api/study-materials.ts

# Types updated
grep "lesson_id: string | null" src/lib/api/study-materials.ts
grep "'advanced'" src/lib/api/study-materials.ts

# Migration file exists with required policies
grep -c "CREATE POLICY" supabase/migrations/20260518_28_study_materials_public.sql
# Expected: 5
```
</verification>

<success_criteria>
- Migration SQL file written and applied in Supabase Dashboard (manual step confirmed)
- `lesson_id`, `category` nullable in TS interface; `grade` includes 'advanced'
- `GRADE_LABELS` has `advanced: 'Ôn thi chuyên'`
- `fetchStandaloneStudyMaterials` and `uploadStandaloneStudyMaterial` exported
- `yarn build` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/21-tai-lieu-page/21-P01-SUMMARY.md`
</output>
