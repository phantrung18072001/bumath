export interface Profile {
  id: string
  full_name: string
  phone: string
  year_of_birth: number
  address: string
  role: 'student' | 'teacher' | 'admin'
  approval_status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface AuthContextValue {
  user: import('@supabase/supabase-js').User | null
  session: import('@supabase/supabase-js').Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}
