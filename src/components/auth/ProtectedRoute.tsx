import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin'
  requireApproved?: boolean
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireApproved = false,
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

  if (profile?.approval_status === 'pending' || profile?.approval_status === 'rejected') {
    return <Navigate to="/pending" replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
