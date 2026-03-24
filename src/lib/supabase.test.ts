import { supabase } from '@/lib/supabase'

describe('supabase client', () => {
  it('exports the supabase client object', () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
    expect(typeof supabase.auth.getSession).toBe('function')
  })
})
