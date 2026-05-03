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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 relative overflow-x-hidden isolate">
      {/* Floating math symbols background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        {/* Row 1 — ~6% */}
        <span className="bm-float-symbol-light" style={{ top: '3%',  left: '2%',   fontSize: '52px' }}>π</span>
        <span className="bm-float-symbol-light" style={{ top: '6%',  left: '18%',  fontSize: '36px' }}>θ</span>
        <span className="bm-float-symbol-light" style={{ top: '4%',  left: '36%',  fontSize: '44px' }}>∑</span>
        <span className="bm-float-symbol-light" style={{ top: '8%',  left: '56%',  fontSize: '40px' }}>∞</span>
        <span className="bm-float-symbol-light" style={{ top: '3%',  left: '74%',  fontSize: '48px' }}>√</span>
        <span className="bm-float-symbol-light" style={{ top: '6%',  right: '2%',  fontSize: '38px' }}>φ</span>
        {/* Row 2 — ~32% */}
        <span className="bm-float-symbol-light" style={{ top: '29%', left: '1%',   fontSize: '60px' }}>∫</span>
        <span className="bm-float-symbol-light" style={{ top: '33%', left: '16%',  fontSize: '38px' }}>Δ</span>
        <span className="bm-float-symbol-light" style={{ top: '28%', left: '40%',  fontSize: '44px' }}>×</span>
        <span className="bm-float-symbol-light" style={{ top: '35%', left: '60%',  fontSize: '34px' }}>≠</span>
        <span className="bm-float-symbol-light" style={{ top: '30%', left: '78%',  fontSize: '50px' }}>÷</span>
        <span className="bm-float-symbol-light" style={{ top: '34%', right: '2%',  fontSize: '42px' }}>ω</span>
        {/* Row 3 — ~58% */}
        <span className="bm-float-symbol-light" style={{ top: '55%', left: '3%',   fontSize: '46px' }}>α</span>
        <span className="bm-float-symbol-light" style={{ top: '60%', left: '20%',  fontSize: '56px' }}>±</span>
        <span className="bm-float-symbol-light" style={{ top: '54%', left: '44%',  fontSize: '38px' }}>β</span>
        <span className="bm-float-symbol-light" style={{ top: '62%', left: '62%',  fontSize: '46px' }}>≤</span>
        <span className="bm-float-symbol-light" style={{ top: '56%', left: '80%',  fontSize: '40px' }}>σ</span>
        <span className="bm-float-symbol-light" style={{ top: '60%', right: '1%',  fontSize: '54px' }}>γ</span>
        {/* Row 4 — ~84% */}
        <span className="bm-float-symbol-light" style={{ top: '82%', left: '4%',   fontSize: '48px' }}>∂</span>
        <span className="bm-float-symbol-light" style={{ top: '87%', left: '22%',  fontSize: '40px' }}>λ</span>
        <span className="bm-float-symbol-light" style={{ top: '81%', left: '44%',  fontSize: '52px' }}>μ</span>
        <span className="bm-float-symbol-light" style={{ top: '88%', left: '66%',  fontSize: '36px' }}>ε</span>
        <span className="bm-float-symbol-light" style={{ top: '83%', left: '82%',  fontSize: '44px' }}>∇</span>
        <span className="bm-float-symbol-light" style={{ top: '86%', right: '1%',  fontSize: '50px' }}>∈</span>
      </div>
      {/* Header — h-20 (80px) */}
      <header className="h-20 bg-card border-b border-border flex items-center px-6 sticky top-0 z-10">
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
      <main className="min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  )
}
