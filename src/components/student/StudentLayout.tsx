import { useNavigate, Link, NavLink } from 'react-router-dom'
import { LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import BellNotification from '@/components/student/BellNotification'

interface StudentLayoutProps {
  children: React.ReactNode
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/dang-nhap')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact header — h-12 (48px), satisfies UX-02 */}
      <header className="h-12 bg-card border-b border-border flex items-center px-4 sticky top-0 z-10">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="Trang chủ BuMath"
        >
          <img
            src={`${import.meta.env.BASE_URL}bumath.jpeg`}
            alt="BuMath"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="font-semibold text-primary text-base">BuMath</span>
        </Link>
        <nav className="ml-4 hidden sm:flex items-center gap-1">
          <NavLink
            to="/khoa-hoc"
            className={({ isActive }) =>
              `text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
              }`
            }
          >
            Khóa học của tôi
          </NavLink>
          <NavLink
            to="/danh-muc"
            className={({ isActive }) =>
              `text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
              }`
            }
          >
            Khám phá khóa học
          </NavLink>
          {profile?.role === 'admin' && (
            <NavLink
              to="/quan-tri/nguoi-dung"
              className={({ isActive }) =>
                `text-sm font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                  isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
                }`
              }
            >
              <Shield className="h-3.5 w-3.5" />
              Quản trị
            </NavLink>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {profile?.full_name && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {profile.full_name}
            </span>
          )}
          <BellNotification />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="min-h-[48px] min-w-[48px] flex items-center gap-1 px-2"
            aria-label="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only text-sm">Đăng xuất</span>
          </Button>
        </div>
      </header>

      {/* Page content — remaining viewport height */}
      <main className="min-h-[calc(100vh-48px)] bg-background">
        {children}
      </main>
    </div>
  )
}
