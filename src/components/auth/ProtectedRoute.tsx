import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

type Role = 'student' | 'teacher' | 'admin'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role
  allowedRoles?: Array<Role>
}

function redirectFor(role: Role | undefined): string {
  // D-06: role-aware fallback when allowedRoles excludes the user
  if (role === 'teacher') return '/admin/submissions'
  if (role === 'student') return '/courses'
  return '/'
}

export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        aria-label="Dang tai..."
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="sr-only">Dang tai...</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // D-05: allowedRoles takes precedence; new API
  if (allowedRoles && (!profile?.role || !allowedRoles.includes(profile.role))) {
    return <Navigate to={redirectFor(profile?.role)} replace />
  }

  // Existing requiredRole API — UNCHANGED behavior (still redirects to "/")
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
