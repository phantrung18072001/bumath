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
