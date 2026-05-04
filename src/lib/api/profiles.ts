import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/auth'

export interface ProfilesFilter {
  page: number
  pageSize: number
  role: 'all' | Profile['role']
  search: string
  packageId?: string
  packageStatus?: 'has_package' | 'no_package'
}

export interface PaginatedProfiles {
  data: Profile[]
  total: number
}

export async function fetchProfilesPaginated(
  params: ProfilesFilter
): Promise<PaginatedProfiles> {
  const { page, pageSize, role, search, packageId, packageStatus } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Resolve user IDs from package filters (packageId takes priority over packageStatus)
  let allowedUserIds: string[] | null = null
  if (packageId) {
    const { data: ups, error: upsError } = await supabase
      .from('user_packages')
      .select('user_id')
      .eq('package_id', packageId)
    if (upsError) throw upsError
    allowedUserIds = (ups ?? []).map((up) => (up as { user_id: string }).user_id)
    if (allowedUserIds.length === 0) return { data: [], total: 0 }
  } else if (packageStatus) {
    const { data: ups, error: upsError } = await supabase
      .from('user_packages')
      .select('user_id')
    if (upsError) throw upsError
    const idsWithPackage = [...new Set((ups ?? []).map((up) => (up as { user_id: string }).user_id))]
    if (packageStatus === 'has_package') {
      if (idsWithPackage.length === 0) return { data: [], total: 0 }
      allowedUserIds = idsWithPackage
    } else {
      // no_package: exclude users who have any package
      allowedUserIds = null // handled separately below
      // We'll use .not('id', 'in', ...) — only if there are IDs to exclude
      if (idsWithPackage.length > 0) {
        let query = supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to)
          .not('id', 'in', `(${idsWithPackage.join(',')})`)
        if (role !== 'all') query = query.eq('role', role)
        if (search) {
          const phoneFilters = [`phone.ilike.${search}%`]
          if (search.startsWith('0')) phoneFilters.push(`phone.ilike.+84${search.slice(1)}%`)
          else if (search.startsWith('+84')) phoneFilters.push(`phone.ilike.0${search.slice(3)}%`)
          else if (search.startsWith('84') && search.length >= 4) phoneFilters.push(`phone.ilike.0${search.slice(2)}%`)
          query = query.or(`full_name.ilike.%${search}%,${phoneFilters.join(',')}`)
        }
        const { data, error, count } = await query
        if (error) throw error
        return { data: (data ?? []) as Profile[], total: count ?? 0 }
      }
      // no users have any package → fall through, no ID restriction
    }
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
