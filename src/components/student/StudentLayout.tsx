import { useNavigate, Link, NavLink } from 'react-router-dom'
import { LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import BellNotification from '@/components/student/BellNotification'
import MathBackground from '@/components/shared/MathBackground'

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
    <div className="h-screen overflow-hidden flex flex-col app-student bg-gradient-to-br from-primary/5 via-background to-secondary/20 relative isolate">
      <MathBackground />
      {/* Header — h-20 (80px) */}
      <header className="h-20 bg-white/80 backdrop-blur-sm border-b border-white/30 flex items-center px-6 sticky top-0 z-10">
        <Link
          to="/"
          className="flex items-center gap-3"
          aria-label="Trang chủ BuMath"
        >
          <img
            src={`${import.meta.env.BASE_URL}bumathx.png`}
            alt="BuMath"
            className="h-11 w-11 rounded-xl object-cover"
          />
          <span className="font-bold text-primary text-lg">BuMath</span>
        </Link>
        <nav className="ml-6 hidden sm:flex items-center gap-1">
          <NavLink
            to="/khoa-hoc"
            className={({ isActive }) =>
              `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
              }`
            }
          >
            Khóa học của tôi
          </NavLink>
          <NavLink
            to="/danh-muc"
            className={({ isActive }) =>
              `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
              }`
            }
          >
            Khám phá khóa học
          </NavLink>
          <NavLink
            to="/ho-so"
            className={({ isActive }) =>
              `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
              }`
            }
          >
            Hồ sơ
          </NavLink>
          {profile?.role === 'admin' && (
            <NavLink
              to="/quan-tri/nguoi-dung"
              className={({ isActive }) =>
                `text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1 ${
                  isActive ? 'text-primary' : 'text-foreground hover:bg-muted'
                }`
              }
            >
              <Shield className="h-3.5 w-3.5" />
              Quản trị
            </NavLink>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {profile?.full_name && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {profile.full_name}
            </span>
          )}
          <BellNotification />
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 h-auto"
            aria-label="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only text-sm">Đăng xuất</span>
          </Button>
        </div>
      </header>

      {/* Page content — remaining viewport height */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
