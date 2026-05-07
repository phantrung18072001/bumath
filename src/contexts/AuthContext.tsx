import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile, AuthContextValue } from '@/types/auth'
import { Loader2 } from 'lucide-react'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        if (!currentSession) {
          setProfile(null)
          setLoading(false)
          return
        }
        // Defer profile fetch to avoid Supabase callback deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single()
              .then(({ data }) => {
                setProfile(data as Profile | null)
                setLoading(false)
              })
          }, 0)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 bg-white">
        <img
          src={`${import.meta.env.BASE_URL}bumathx.png`}
          alt="BuMath"
          className="h-14 w-14 rounded-2xl object-cover"
        />
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
