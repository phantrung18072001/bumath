import { Link, useLocation } from 'react-router-dom'
import { Users, BookOpen, ClipboardList, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'
import MathBackground from '@/components/shared/MathBackground'

type NavItem = {
  label: string
  to: string
  icon: typeof Users
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', icon: Users, adminOnly: true },
  { label: 'Quản lý khóa học', to: '/quan-tri/khoa-hoc', icon: BookOpen, adminOnly: true },
  { label: 'Gói học', to: '/quan-tri/goi-hoc', icon: Package, adminOnly: true },
  { label: 'Chấm bài', to: '/quan-tri/bai-nop', icon: ClipboardList },
]

export default function AdminLayout({ children, fullBleed = false }: { children: ReactNode; fullBleed?: boolean }) {
  const location = useLocation()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  // D-03: hide adminOnly items when role is teacher
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className={cn('flex app-admin bg-gradient-to-br from-primary/5 via-background to-secondary/20 relative isolate', fullBleed ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-[calc(100vh-80px)]')}>
      <MathBackground />
      {/* Sidebar — hidden on full-bleed pages (e.g. course detail) */}
      {!fullBleed && (
        <aside className="w-60 shrink-0 border-r border-white/30 bg-white/80 backdrop-blur-sm overflow-y-auto">
          <nav className="p-3 space-y-1">
            {visibleItems.map(({ label, to, icon: Icon }) => {
              const active = location.pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>
      )}

      {/* Page content */}
      <main className={cn('flex-1', fullBleed ? 'overflow-hidden flex flex-col' : 'overflow-auto')}>
        {fullBleed ? children : (
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        )}
      </main>
    </div>
  )
}
