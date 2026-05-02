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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating math symbols background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <span className="bm-float-symbol-light" style={{ top: '4%',  left: '2%',   fontSize: '52px' }}>π</span>
        <span className="bm-float-symbol-light" style={{ top: '8%',  left: '18%',  fontSize: '36px' }}>θ</span>
        <span className="bm-float-symbol-light" style={{ top: '3%',  left: '38%',  fontSize: '44px' }}>∑</span>
        <span className="bm-float-symbol-light" style={{ top: '6%',  right: '22%', fontSize: '40px' }}>∞</span>
        <span className="bm-float-symbol-light" style={{ top: '4%',  right: '6%',  fontSize: '48px' }}>√</span>
        <span className="bm-float-symbol-light" style={{ top: '25%', left: '1%',   fontSize: '60px' }}>∫</span>
        <span className="bm-float-symbol-light" style={{ top: '30%', left: '14%',  fontSize: '38px' }}>Δ</span>
        <span className="bm-float-symbol-light" style={{ top: '22%', left: '48%',  fontSize: '44px' }}>×</span>
        <span className="bm-float-symbol-light" style={{ top: '28%', right: '16%', fontSize: '34px' }}>≠</span>
        <span className="bm-float-symbol-light" style={{ top: '20%', right: '4%',  fontSize: '50px' }}>÷</span>
        <span className="bm-float-symbol-light" style={{ top: '50%', left: '3%',   fontSize: '42px' }}>α</span>
        <span className="bm-float-symbol-light" style={{ top: '55%', left: '20%',  fontSize: '56px' }}>±</span>
        <span className="bm-float-symbol-light" style={{ top: '48%', left: '55%',  fontSize: '38px' }}>β</span>
        <span className="bm-float-symbol-light" style={{ top: '52%', right: '10%', fontSize: '46px' }}>≤</span>
        <span className="bm-float-symbol-light" style={{ top: '72%', left: '6%',   fontSize: '48px' }}>∂</span>
        <span className="bm-float-symbol-light" style={{ top: '78%', left: '28%',  fontSize: '40px' }}>λ</span>
        <span className="bm-float-symbol-light" style={{ top: '68%', right: '20%', fontSize: '54px' }}>μ</span>
        <span className="bm-float-symbol-light" style={{ top: '82%', right: '5%',  fontSize: '44px' }}>∇</span>
      </div>
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
      <main className="relative z-10 min-h-[calc(100vh-48px)] bg-white/80 backdrop-blur-[1px]">
        {children}
      </main>
    </div>
  )
}
