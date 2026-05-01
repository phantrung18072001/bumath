import { Link, useLocation } from 'react-router-dom'
import { Users, BookOpen, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

type NavItem = {
  label: string
  to: string
  icon: typeof Users
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Quản lý tài khoản', to: '/quan-tri/nguoi-dung', icon: Users, adminOnly: true },
  { label: 'Quản lý khóa học', to: '/quan-tri/khoa-hoc', icon: BookOpen, adminOnly: true },
  { label: 'Chấm bài', to: '/quan-tri/bai-nop', icon: ClipboardList },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  // D-03: hide adminOnly items when role is teacher
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="flex min-h-[calc(100vh-48px)]">
      {/* Sidebar — min-h offset accounts for StudentLayout 48px sticky header */}
      <aside className="w-60 shrink-0 border-r bg-card">
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

      {/* Page content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
