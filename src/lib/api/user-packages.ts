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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('user_packages')
    .select(`
      id, user_id, package_id, assigned_at, assigned_by,
      package:packages(id, name, description, price_vnd, created_at,
        package_grades(grade)
      )
    `)
    .eq('user_id', user.id)
    .order('assigned_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as UserPackageWithDetails[]
}
