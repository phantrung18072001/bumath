import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/auth'

export interface ProfilesFilter {
  page: number
  pageSize: number
  role: 'all' | Profile['role']
  search: string
  packageId?: string
}

export interface PaginatedProfiles {
  data: Profile[]
  total: number
}

/**
 * Fetch profiles with server-side filtering and pagination.
 * Uses Supabase .range() for pagination and .eq()/.or() for filters.
 * Per D-01: replaces client-side filter/slice pattern in UsersPage.
 */
export async function fetchProfilesPaginated(
  params: ProfilesFilter
): Promise<PaginatedProfiles> {
  const { page, pageSize, role, search, packageId } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // If filtering by package, first resolve which user IDs hold that package
  let allowedUserIds: string[] | null = null
  if (packageId) {
    const { data: ups, error: upsError } = await supabase
      .from('user_packages')
      .select('user_id')
      .eq('package_id', packageId)
    if (upsError) throw upsError
    allowedUserIds = (ups ?? []).map((up) => (up as { user_id: string }).user_id)
    if (allowedUserIds.length === 0) return { data: [], total: 0 }
  }

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (role !== 'all') {
    query = query.eq('role', role)
  }

  if (allowedUserIds) {
    query = query.in('id', allowedUserIds)
  }

  if (search) {
    // Phone: prefix match only. Normalize 0↔+84 so both formats find each other.
    const phoneFilters = [`phone.ilike.${search}%`]
    if (search.startsWith('0')) {
      phoneFilters.push(`phone.ilike.+84${search.slice(1)}%`)
    } else if (search.startsWith('+84')) {
      phoneFilters.push(`phone.ilike.0${search.slice(3)}%`)
    } else if (search.startsWith('84') && search.length >= 4) {
      phoneFilters.push(`phone.ilike.0${search.slice(2)}%`)
    }
    query = query.or(`full_name.ilike.%${search}%,${phoneFilters.join(',')}`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return {
    data: (data ?? []) as Profile[],
    total: count ?? 0,
  }
}
